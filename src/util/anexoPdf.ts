const bytesDoDataUrl = (conteudo: string) => {
  const data = String(conteudo || '').includes(',') ? String(conteudo).slice(String(conteudo).indexOf(',') + 1) : String(conteudo || '');
  const binario = atob(data);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i += 1) bytes[i] = binario.charCodeAt(i);
  return bytes;
};

const esperar = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms));

const pdfChegouNaNuvem = async (id: string) => {
  const teste = await fetch(`/api/anexo?id=${encodeURIComponent(id)}&arquivo=1`, { cache: 'no-store' });
  const tipo = teste.headers.get('content-type') || '';
  return teste.ok && (tipo.includes('pdf') || tipo.includes('octet-stream'));
};

export const enviarAnexoPdfBytes = async (id: string, bytes: Uint8Array) => {
  if (bytes.length < 20) throw new Error('PDF inválido.');
  if (bytes.length > 3500000) throw new Error('PDF grande demais. Use um arquivo de até 3 MB.');
  let ultimoErro = 'Não gravou o PDF na nuvem.';
  for (let tentativa = 0; tentativa < 3; tentativa += 1) {
    const resposta = await fetch(`/api/anexo?id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/pdf' },
      body: bytes
    });
    const dados = await resposta.json().catch(() => ({} as { erro?: string; url?: string }));
    if (!resposta.ok || !dados.url) {
      ultimoErro = typeof dados.erro === 'string' ? dados.erro : 'Não gravou o PDF na nuvem.';
      await esperar(400 * (tentativa + 1));
      continue;
    }
    for (let leitura = 0; leitura < 4; leitura += 1) {
      if (await pdfChegouNaNuvem(id)) return String(dados.url);
      await esperar(350 * (leitura + 1));
    }
    ultimoErro = 'O PDF foi enviado, mas a nuvem ainda não entrega. Tente anexar de novo.';
  }
  throw new Error(ultimoErro);
};

export const enviarAnexoPdfNuvem = async (id: string, conteudo: string) => {
  return enviarAnexoPdfBytes(id, bytesDoDataUrl(conteudo));
};

export const chaveAnexoPedido = (pedidoId: string) => `pedido_${pedidoId}`;

export const urlArquivoAnexo = (id: string, opcoes?: { baixar?: boolean; nome?: string }) => {
  const busca = new URLSearchParams({ id, arquivo: '1' });
  if (opcoes?.baixar) busca.set('baixar', '1');
  if (opcoes?.nome) busca.set('nome', opcoes.nome);
  return `/api/anexo?${busca.toString()}`;
};

export const pdfTemArquivo = (conteudo?: string) => {
  const valor = String(conteudo || '').trim();
  return valor.startsWith('http') || valor.startsWith('data:') || valor.startsWith('blob:') || valor.startsWith('/api/anexo');
};

const idsAnexoLocal = (id: string) => {
  const base = String(id || '').trim();
  const semPedido = base.startsWith('pedido_') ? base.slice('pedido_'.length) : base;
  return Array.from(new Set([base, `pedido_${base}`, semPedido, `pedido_${semPedido}`].filter(Boolean)));
};

const abrirBancoAnexos = () => new Promise<IDBDatabase>((resolve, reject) => {
  const pedido = indexedDB.open('rm-anexos-pdf', 2);
  pedido.onupgradeneeded = () => {
    if (!pedido.result.objectStoreNames.contains('pdfs')) pedido.result.createObjectStore('pdfs');
  };
  pedido.onsuccess = () => resolve(pedido.result);
  pedido.onerror = () => reject(pedido.error);
});

const blobDoDataUrl = (conteudo: string) => {
  try {
    const [meta, data] = String(conteudo).split(',');
    const binario = atob(data || '');
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i += 1) bytes[i] = binario.charCodeAt(i);
    const tipo = /data:([^;]+)/.exec(meta || '')?.[1] || 'application/pdf';
    return new Blob([bytes], { type: tipo });
  } catch {
    return null;
  }
};

const urlDoBlob = (arquivo: Blob) => URL.createObjectURL(arquivo);

export const guardarAnexoLocal = async (id: string, conteudo: string) => {
  if (!id || !String(conteudo || '').startsWith('data:')) return;
  const arquivo = blobDoDataUrl(conteudo);
  if (!arquivo || arquivo.size < 20) return;
  try {
    const db = await abrirBancoAnexos();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('pdfs', 'readwrite');
      tx.objectStore('pdfs').put(arquivo, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch { /* aparelho sem espaço */ }
};

const lerBlobAnexoLocal = async (id: string) => {
  try {
    const db = await abrirBancoAnexos();
    for (const chave of idsAnexoLocal(id)) {
      const valor = await new Promise<unknown>((resolve, reject) => {
        const tx = db.transaction('pdfs', 'readonly');
        const pedido = tx.objectStore('pdfs').get(chave);
        pedido.onsuccess = () => resolve(pedido.result);
        pedido.onerror = () => reject(pedido.error);
      });
      if (valor instanceof Blob && valor.size > 20) return valor;
      if (typeof valor === 'string' && valor.startsWith('data:')) {
        const convertido = blobDoDataUrl(valor);
        if (convertido) return convertido;
      }
    }
  } catch { /* sem arquivo local */ }
  return null;
};

export const lerAnexoLocal = async (id: string) => {
  const arquivo = await lerBlobAnexoLocal(id);
  if (!arquivo) return '';
  return urlDoBlob(arquivo);
};

const guardarBlobAnexoLocal = async (id: string, arquivo: Blob) => {
  if (!id || !(arquivo instanceof Blob) || arquivo.size < 20) return;
  try {
    const db = await abrirBancoAnexos();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('pdfs', 'readwrite');
      tx.objectStore('pdfs').put(arquivo, idsAnexoLocal(id)[0]);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch { /* ignora */ }
};

const pdfDaResposta = async (resposta: Response) => {
  if (!resposta.ok) return null;
  const tipo = resposta.headers.get('content-type') || '';
  if (!tipo.includes('pdf') && !tipo.includes('octet-stream')) return null;
  const arquivo = new Blob([await resposta.arrayBuffer()], { type: 'application/pdf' });
  return arquivo.size > 20 ? arquivo : null;
};

export const abrirPdfComoArquivo = async (id: string, conteudo?: string) => {
  const valor = String(conteudo || '').trim();
  if (valor.startsWith('data:')) {
    const arquivo = blobDoDataUrl(valor);
    if (arquivo) {
      await guardarBlobAnexoLocal(id, arquivo);
      return urlDoBlob(arquivo);
    }
  }
  if (valor.startsWith('blob:')) return valor;

  const urls = [
    valor.startsWith('/api/anexo') || valor.startsWith('http') ? valor : '',
    ...idsAnexoLocal(id).map(chave => urlArquivoAnexo(chave))
  ].filter(Boolean);
  const unicas = Array.from(new Set(urls));
  for (const url of unicas) {
    try {
      const arquivo = await pdfDaResposta(await fetch(url, { cache: 'no-store' }));
      if (arquivo) {
        await guardarBlobAnexoLocal(id, arquivo);
        return urlDoBlob(arquivo);
      }
    } catch { /* próxima url */ }
  }

  const doAparelho = await lerBlobAnexoLocal(id);
  if (doAparelho) return urlDoBlob(doAparelho);
  return '';
};

export const blobParaDataUrl = (arquivo: Blob) => new Promise<string>((resolve, reject) => {
  const leitor = new FileReader();
  leitor.onload = () => resolve(String(leitor.result || ''));
  leitor.onerror = () => reject(leitor.error);
  leitor.readAsDataURL(arquivo);
});

export const garantirAnexoNaNuvem = async (id: string, conteudo?: string) => {
  if (await pdfChegouNaNuvem(id)) return urlArquivoAnexo(id);
  let dataUrl = String(conteudo || '');
  if (!dataUrl.startsWith('data:')) {
    const local = await lerBlobAnexoLocal(id);
    if (local) dataUrl = await blobParaDataUrl(local);
  }
  if (!dataUrl.startsWith('data:')) {
    throw new Error('PDF não está neste aparelho nem na nuvem.');
  }
  await guardarAnexoLocal(id, dataUrl);
  await enviarAnexoPdfNuvem(id, dataUrl);
  return urlArquivoAnexo(id);
};

export const dispararDownloadPdf = (url: string, nome: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = nome || 'anexo.pdf';
  link.target = '_blank';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
};
