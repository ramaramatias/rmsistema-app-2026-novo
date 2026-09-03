import { get, put } from '@vercel/blob';

const ARQUIVO = 'sistema-nuvem.json';
const STORE_ID = process.env.BLOB_STORE_ID || 'store_Fb0NOR7qKm62OYmY';
const OPCOES = {
  access: 'private' as const,
  storeId: STORE_ID,
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

export async function lerNuvemBlob() {
  const resultado = await get(ARQUIVO, { access: 'private', useCache: false, storeId: STORE_ID });
  if (!resultado || resultado.statusCode !== 200 || !resultado.stream) {
    return envelopar({});
  }
  const texto = await new Response(resultado.stream).text();
  if (!texto.trim()) return envelopar({});
  return envelopar(JSON.parse(texto));
}

export async function gravarNuvemBlob(corpo: unknown) {
  await put(ARQUIVO, JSON.stringify(corpo ?? {}), OPCOES);
  return envelopar(corpo);
}
