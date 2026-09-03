import { get, put } from '@vercel/blob';

const STORE_ID = process.env.BLOB_STORE_ID || 'store_Fb0NOR7qKm62OYmY';

const caminhoFoto = (id: string) => `pendencia-foto/${String(id).replace(/[^a-zA-Z0-9._-]/g, '_')}.txt`;

export async function lerFotoBlob(id: string) {
  const resultado = await get(caminhoFoto(id), { access: 'private', useCache: false, storeId: STORE_ID });
  if (!resultado || resultado.statusCode !== 200 || !resultado.stream) return '';
  return (await new Response(resultado.stream).text()).trim();
}

export async function gravarFotoBlob(id: string, foto: string) {
  await put(caminhoFoto(id), foto, {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'text/plain',
    cacheControlMaxAge: 0,
    storeId: STORE_ID
  });
}
