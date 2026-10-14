import { del, get, list, put } from '@vercel/blob';

const chaveAnexo = (id: string) => `sistema:anexo:${String(id).replace(/[^a-zA-Z0-9._-]/g, '_')}`;
const nomeArquivo = (id: string) => `anexos/${String(id).replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`;
const arquivoIndiceCeasa = 'anexos/ceasa-boletins.json';

const credenciaisKv = () => {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
  if (!url || !token) {
    throw new Error('Nuvem sem configuração (KV_REST_API_URL / KV_REST_API_TOKEN).');
  }
  return { url: url.replace(/\/$/, ''), token };
};

const chamarKv = async (caminho: string, corpo?: string) => {
  const { url, token } = credenciaisKv();
  const resposta = await fetch(`${url}/${caminho}`, {
    method: corpo === undefined ? 'GET' : 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(corpo === undefined ? {} : { 'Content-Type': 'text/plain' })
    },
    ...(corpo === undefined ? {} : { body: corpo }),
    cache: 'no-store'
  });
  if (!resposta.ok) throw new Error(`Nuvem respondeu ${resposta.status}.`);
  return (await resposta.json()) as { result?: unknown };
};

const registroDoKv = (result: unknown) => {
  if (typeof result !== 'string' || !result.trim()) return { url: '', pathname: '' };
  const texto = result.trim();
  if (texto.startsWith('{')) {
    try {
      const dados = JSON.parse(texto) as { url?: string; pathname?: string };
      return { url: String(dados.url || '').trim(), pathname: String(dados.pathname || '').trim() };
    } catch {
      return { url: '', pathname: '' };
    }
  }
  return { url: texto, pathname: '' };
};

export async function lerUrlAnexo(id: string) {
  const { result } = await chamarKv(`get/${chaveAnexo(id)}`);
  return registroDoKv(result).url;
}

const lerRegistroAnexo = async (id: string) => {
  const { result } = await chamarKv(`get/${chaveAnexo(id)}`);
  return registroDoKv(result);
};

const baixarComToken = async (url: string) => {
  const token = process.env.BLOB_READ_WRITE_TOKEN || '';
  const resposta = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store'
  });
  if (!resposta.ok) return null;
  const buffer = Buffer.from(await resposta.arrayBuffer());
  return buffer.length >= 20 && buffer.subarray(0, 4).toString() === '%PDF' ? buffer : null;
};

const idsPossiveisAnexo = (id: string) => {
  const base = String(id || '').trim();
  const semPedido = base.startsWith('pedido_') ? base.slice('pedido_'.length) : base;
  return Array.from(new Set([base, `pedido_${base}`, semPedido, `pedido_${semPedido}`].filter(Boolean)));
};

const caminhoDoLinkBlob = (url: string) => {
  try {
    if (!url.startsWith('http')) return '';
    return new URL(url).pathname.replace(/^\//, '');
  } catch {
    return '';
  }
};

const bufferDoBlob = async (chave: string) => {
  try {
    const resultado = await get(chave, { access: 'private', useCache: false });
    if (resultado?.stream) {
      const buffer = Buffer.from(await new Response(resultado.stream).arrayBuffer());
      if (buffer.length >= 20) return buffer;
    }
  } catch {
    /* tenta outro caminho */
  }
  if (chave.startsWith('http')) return baixarComToken(chave);
  return null;
};

export async function baixarBufferAnexo(id: string) {
  const ids = idsPossiveisAnexo(id);
  const tentativas: string[] = [];
  for (const chave of ids) {
    tentativas.push(nomeArquivo(chave));
    try {
      const salvo = await lerRegistroAnexo(chave);
      if (salvo.pathname) tentativas.push(salvo.pathname);
      if (salvo.url) {
        tentativas.push(salvo.url);
        const caminho = caminhoDoLinkBlob(salvo.url);
        if (caminho) tentativas.push(caminho);
      }
    } catch {
      /* sem Redis para este id */
    }
  }
  const unicas = Array.from(new Set(tentativas.filter(Boolean)));
  for (const chave of unicas) {
    const arquivo = await bufferDoBlob(chave);
    if (arquivo) return arquivo;
  }
  try {
    const { blobs } = await list({ prefix: 'anexos/', limit: 1000 });
    const achado = blobs.find(item => ids.some(chave => item.pathname.includes(chave)));
    if (achado) {
      const arquivo = await bufferDoBlob(achado.pathname || achado.url);
      if (arquivo) return arquivo;
    }
  } catch {
    /* sem lista */
  }
  return null;
}

export async function gravarAnexoBytes(id: string, buffer: Buffer) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('Nuvem de arquivo sem configuração (BLOB_READ_WRITE_TOKEN).');
  }
  if (buffer.length < 20 || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error('PDF inválido.');
  }
  if (buffer.length > 3500000) throw new Error('PDF grande demais. Use um arquivo de até 3 MB.');
  const pathname = nomeArquivo(id);
  const resultado = await put(pathname, buffer, {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/pdf',
    cacheControlMaxAge: 60
  });
  try {
    await chamarKv(`set/${chaveAnexo(id)}`, JSON.stringify({ url: resultado.url, pathname: resultado.pathname || pathname }));
  } catch {
    /* o arquivo já está no Blob; o Redis só ajuda a achar o link */
  }
  return resultado.url;
}

export async function apagarAnexo(id: string) {
  const salvo = await lerRegistroAnexo(id).catch(() => ({ url: '', pathname: '' }));
  const caminho = salvo.pathname || caminhoDoLinkBlob(salvo.url) || nomeArquivo(id);
  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('Nuvem de arquivo sem configuração (BLOB_READ_WRITE_TOKEN).');
  }
  if (process.env.BLOB_READ_WRITE_TOKEN) await del(caminho);
  if ((process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
    || (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)) {
    try {
      await chamarKv(`del/${chaveAnexo(id)}`);
    } catch {
      /* a exclusão do Blob é suficiente para remover o PDF expirado */
    }
  }
}

export async function lerIndiceCeasaBlob() {
  const resultado = await get(arquivoIndiceCeasa, { access: 'private', useCache: false });
  if (!resultado || resultado.statusCode !== 200 || !resultado.stream) return '';
  return new Response(resultado.stream).text();
}

export async function gravarIndiceCeasaBlob(texto: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;
  await put(arquivoIndiceCeasa, texto, {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 0
  });
  return true;
}

export async function gravarAnexoPdf(id: string, dataUrl: string) {
  const base64 = dataUrl.includes(',') ? dataUrl.slice(dataUrl.indexOf(',') + 1) : dataUrl;
  return gravarAnexoBytes(id, Buffer.from(base64, 'base64'));
}
