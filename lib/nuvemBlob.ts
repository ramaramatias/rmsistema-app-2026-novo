import { get, put } from '@vercel/blob';

const ARQUIVO = 'sistema-nuvem.json';
const OPCOES = {
  access: 'private' as const,
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: 'application/json',
  cacheControlMaxAge: 0
};

const envelopar = (dados: unknown) => {
  if (dados && typeof dados === 'object' && !Array.isArray(dados) && 'record' in (dados as object)) {
    return dados;
  }
  return { record: dados && typeof dados === 'object' ? dados : {} };
};

export async function lerNuvemBlob(etagConhecida?: string) {
  const resultado = await get(ARQUIVO, {
    access: 'private',
    useCache: false,
    ...(etagConhecida ? { ifNoneMatch: etagConhecida } : {})
  });

  if (resultado?.statusCode === 304) {
    return { naoMudou: true as const, etag: etagConhecida };
  }
  if (!resultado || resultado.statusCode !== 200 || !resultado.stream) {
    return { naoMudou: false as const, corpo: envelopar({}), etag: undefined };
  }

  const texto = await new Response(resultado.stream).text();
  const corpo = texto.trim() ? envelopar(JSON.parse(texto)) : envelopar({});
  return { naoMudou: false as const, corpo, etag: (resultado as { etag?: string }).etag };
}

export async function gravarNuvemBlob(corpo: unknown) {
  const resultado = await put(ARQUIVO, JSON.stringify(corpo ?? {}), OPCOES);
  return { corpo: envelopar(corpo), etag: resultado.etag };
}
