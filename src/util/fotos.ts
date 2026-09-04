import type { OrdemManutencao, Setor } from '../tipos';
import { tarefaSemFoto } from './armazenamento';

export const comprimirFotoPendencia = (arquivo: File) => new Promise<string>((resolve, reject) => {
  const leitor = new FileReader();
  leitor.onerror = () => reject(new Error('Não foi possível ler a foto'));
  leitor.onload = () => {
    const imagem = new Image();
    imagem.onload = () => {
      const max = 400;
      const escala = Math.min(1, max / Math.max(imagem.width, imagem.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(imagem.width * escala));
      canvas.height = Math.max(1, Math.round(imagem.height * escala));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(String(leitor.result));
        return;
      }
      ctx.drawImage(imagem, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.5));
    };
    imagem.onerror = () => reject(new Error('Foto inválida'));
    imagem.src = String(leitor.result);
  };
  leitor.readAsDataURL(arquivo);
});

export const abrirBancoFotos = () => new Promise<IDBDatabase>((resolve, reject) => {
  const pedido = indexedDB.open('rm-pendencias-fotos', 1);
  pedido.onupgradeneeded = () => {
    if (!pedido.result.objectStoreNames.contains('fotos')) pedido.result.createObjectStore('fotos');
  };
  pedido.onsuccess = () => resolve(pedido.result);
  pedido.onerror = () => reject(pedido.error);
});

export const salvarFotoPendencia = async (id: string, foto: string) => {
  if (!id || !foto) return;
  try {
    const db = await abrirBancoFotos();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('fotos', 'readwrite');
      tx.objectStore('fotos').put(foto, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {}
};

export const carregarFotosPendencias = async () => {
  const fotos: { [id: string]: string } = {};
  try {
    const db = await abrirBancoFotos();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('fotos', 'readonly');
      const pedido = tx.objectStore('fotos').openCursor();
      pedido.onsuccess = () => {
        const cursor = pedido.result;
        if (!cursor) return;
        if (typeof cursor.key === 'string' && typeof cursor.value === 'string') fotos[cursor.key] = cursor.value;
        cursor.continue();
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {}
  return fotos;
};

export const aplicarFotosNasTarefas = (lista: Setor[], fotos: { [id: string]: string }) =>
  (Array.isArray(lista) ? lista : []).map(setor => ({
    ...setor,
    tarefas: (setor.tarefas || []).map(tarefa => ({ ...tarefa, foto: tarefa.foto || fotos[tarefa.id] }))
  }));

export const extrairFotosSetores = (lista?: Setor[]) => {
  const fotos: { [id: string]: string } = {};
  const semFotos = (lista || []).map(setor => ({
    ...setor,
    tarefas: (setor.tarefas || []).map(tarefa => {
      if (tarefa.foto && tarefa.foto.startsWith('data:')) {
        fotos[tarefa.id] = tarefa.foto;
        return tarefaSemFoto(tarefa);
      }
      return tarefa;
    })
  }));
  Object.entries(fotos).forEach(([id, foto]) => { void salvarFotoPendencia(id, foto); });
  return { semFotos, fotos };
};

export const ordemSemFoto = (ordem: OrdemManutencao): OrdemManutencao => {
  if (!ordem?.foto) return ordem;
  const { foto: _foto, ...resto } = ordem;
  return resto;
};

export const ordensSemFotos = (lista?: OrdemManutencao[]) => (lista || []).map(ordemSemFoto);

export const aplicarFotosNasOrdens = (lista: OrdemManutencao[], fotos: { [id: string]: string }) =>
  (Array.isArray(lista) ? lista : []).map(ordem => ({ ...ordem, foto: ordem.foto || fotos[ordem.id] }));

export const extrairFotosOrdens = (lista?: OrdemManutencao[]) => {
  const fotos: { [id: string]: string } = {};
  const semFotos = (lista || []).map(ordem => {
    if (ordem.foto && ordem.foto.startsWith('data:')) {
      fotos[ordem.id] = ordem.foto;
      return ordemSemFoto(ordem);
    }
    return ordem;
  });
  Object.entries(fotos).forEach(([id, foto]) => { void salvarFotoPendencia(id, foto); });
  return { semFotos, fotos };
};

export const unirFotosPendencias = (...mapas: Array<{ [id: string]: string } | undefined>) => {
  const uniao: { [id: string]: string } = {};
  mapas.forEach(mapa => {
    Object.entries(mapa || {}).forEach(([id, foto]) => {
      if (id && typeof foto === 'string' && foto.length > 30) uniao[id] = foto;
    });
  });
  return uniao;
};

export const coletarFotosSetores = (lista?: Setor[]) => {
  const fotos: { [id: string]: string } = {};
  (lista || []).forEach(setor => {
    (setor.tarefas || []).forEach(tarefa => {
      if (tarefa?.id && tarefa.foto) fotos[tarefa.id] = tarefa.foto;
    });
  });
  return fotos;
};

export const coletarFotosOrdens = (lista?: OrdemManutencao[]) => {
  const fotos: { [id: string]: string } = {};
  (lista || []).forEach(ordem => {
    if (ordem?.id && ordem.foto) fotos[ordem.id] = ordem.foto;
  });
  return fotos;
};

export const filtrarFotosUsadas = (fotos: { [id: string]: string }, setores?: Setor[], ordens?: OrdemManutencao[]) => {
  const ids = new Set<string>();
  (setores || []).forEach(setor => (setor.tarefas || []).forEach(tarefa => { if (tarefa?.id) ids.add(tarefa.id); }));
  (ordens || []).forEach(ordem => { if (ordem?.id) ids.add(ordem.id); });
  const filtrado: { [id: string]: string } = {};
  Object.entries(fotos).forEach(([id, foto]) => {
    if (ids.has(id)) filtrado[id] = foto;
  });
  return filtrado;
};

export const enxugarFotosNuvem = (fotos: { [id: string]: string }, limite = 600000) => {
  const entradas = Object.entries(fotos).sort((a, b) => Number(b[0]) - Number(a[0]));
  const resultado: { [id: string]: string } = {};
  let tamanho = 2;
  entradas.forEach(([id, foto]) => {
    const extra = id.length + foto.length + 8;
    if (tamanho + extra > limite) return;
    resultado[id] = foto;
    tamanho += extra;
  });
  return resultado;
};

export const guardarFotosLocal = (fotos: { [id: string]: string }) => {
  Object.entries(fotos).forEach(([id, foto]) => { void salvarFotoPendencia(id, foto); });
};

export const enviarFotoNuvem = async (id: string, foto: string) => {
  if (!id || !foto || !foto.startsWith('data:image')) return;
  try {
    await fetch('/api/foto', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, foto })
    });
  } catch {}
};

export const buscarFotoNuvem = async (id: string) => {
  try {
    const resposta = await fetch(`/api/foto?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
    if (!resposta.ok) return '';
    const dados = await resposta.json();
    return typeof dados?.foto === 'string' && dados.foto.startsWith('data:image') ? dados.foto : '';
  } catch {
    return '';
  }
};
