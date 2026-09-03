import type { VercelRequest, VercelResponse } from '@vercel/node';
import { get, put } from '@vercel/blob';

const ARQUIVO = 'sistema-nuvem.json';
const STORE_ID = process.env.BLOB_STORE_ID || 'store_Fb0NOR7qKm62OYmY';

const envelopar = (dados: unknown) => {
  if (dados && typeof dados === 'object' && !Array.isArray(dados) && 'record' in (dados as object)) {
    return dados;
  }
  return { record: dados && typeof dados === 'object' ? dados : {} };
};

async function lerNuvemBlob() {
  const resultado = await get(ARQUIVO, { access: 'private', useCache: false, storeId: STORE_ID });
  if (!resultado || resultado.statusCode !== 200 || !resultado.stream) {
    return envelopar({});
  }
  const texto = await new Response(resultado.stream).text();
  if (!texto.trim()) return envelopar({});
  return envelopar(JSON.parse(texto));
}

async function gravarNuvemBlob(corpo: unknown) {
  await put(ARQUIVO, JSON.stringify(corpo ?? {}), {
    storeId: STORE_ID,
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 0
  });
  return envelopar(corpo);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      return res.status(200).json(await lerNuvemBlob());
    }

    if (req.method === 'PUT') {
      return res.status(200).json(await gravarNuvemBlob(req.body ?? {}));
    }

    return res.status(405).json({ erro: 'Método não permitido.' });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : 'Falha ao falar com a nuvem.';
    return res.status(500).json({ erro: mensagem });
  }
}
