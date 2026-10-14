import type { RelatorioPedidoCotacao, Setor, Tarefa } from '../tipos';

export const LIMITE_JSON_LOCAL = 800000;

export const tarefaSemFoto = (tarefa: Tarefa): Tarefa => {
  if (!tarefa?.foto) return tarefa;
  const { foto: _foto, ...resto } = tarefa;
  return resto;
};

export const setoresSemFotos = (lista?: Setor[]) =>
  (lista || []).map(setor => ({
    ...setor,
    tarefas: (setor.tarefas || []).map(tarefaSemFoto)
  }));

export const pedidosSemPdfPesado = (lista?: RelatorioPedidoCotacao[]) =>
  (lista || []).map(pedido => {
    if (!pedido?.pdfFornecedor?.nome) return pedido;
    const conteudo = String(pedido.pdfFornecedor.conteudo || '');
    if (conteudo.startsWith('/api/anexo') || conteudo.startsWith('http')) return pedido;
    return {
      ...pedido,
      pdfFornecedor: {
        ...pedido.pdfFornecedor,
        conteudo: ''
      }
    };
  });

export const gravarJsonLocal = (chave: string, valor: unknown) => {
  try {
    const texto = JSON.stringify(valor);
    if (texto.length > LIMITE_JSON_LOCAL) {
      localStorage.removeItem(chave);
      return false;
    }
    localStorage.setItem(chave, texto);
    return true;
  } catch {
    try { localStorage.removeItem(chave); } catch {}
    return false;
  }
};

export const limparChavesLocaisPesadas = () => {
  try {
    const chaves: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const chave = localStorage.key(i);
      if (chave) chaves.push(chave);
    }
    chaves.forEach(chave => {
      if (!chave.startsWith('rm_')) return;
      const valor = localStorage.getItem(chave);
      if (valor && valor.length > LIMITE_JSON_LOCAL) localStorage.removeItem(chave);
    });
  } catch {}
};

export const lerJsonLocal = (chave: string, padrao: any) => {
  try {
    const salvo = localStorage.getItem(chave);
    if (!salvo) return padrao;
    return JSON.parse(salvo);
  } catch {
    return padrao;
  }
};

export const resgatarBackupGeral = (chaveBase: string, valorPadrao: any) => {
  try {
  for (let i = 70; i >= 1; i--) {
    const salvo = localStorage.getItem(`${chaveBase}_v${i}`);
    if (salvo && salvo.length <= LIMITE_JSON_LOCAL) {
      try {
        const parsed = JSON.parse(salvo);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        if (typeof parsed === 'object' && Object.keys(parsed).length > 0) return parsed;
      } catch (e) {}
    }
  }
  const direto = localStorage.getItem(chaveBase);
  if (direto && direto.length > LIMITE_JSON_LOCAL) {
    try { localStorage.removeItem(chaveBase); } catch {}
    return valorPadrao;
  }
  if (direto) {
    try { return JSON.parse(direto); } catch (e) {}
  }
  } catch {}
  return valorPadrao;
};
