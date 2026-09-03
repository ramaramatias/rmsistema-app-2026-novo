import type { VercelRequest, VercelResponse } from '@vercel/node';
import { get, put } from '@vercel/blob';

const STORE_ID = process.env.BLOB_STORE_ID || 'store_Fb0NOR7qKm62OYmY';
const caminhoFoto = (id: string) => `pendencia-foto/${String(id).replace(/[^a-zA-Z0-9._-]/g, '_')}.txt`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  const idBruto = req.method === 'GET' ? req.query.id : (req.body as { id?: string })?.id;
  const id = String(idBruto || '').trim();
  if (!id) return res.status(400).json({ erro: 'Foto sem identificação.' });

  try {
    if (req.method === 'GET') {
      const resultado = await get(caminhoFoto(id), { access: 'private', useCache: false, storeId: STORE_ID });
      if (!resultado || resultado.statusCode !== 200 || !resultado.stream) {
        return res.status(404).json({ foto: '' });
      }
      const foto = (await new Response(resultado.stream).text()).trim();
      return res.status(200).json({ foto });
    }

    if (req.method === 'PUT') {
      const foto = String((req.body as { foto?: string })?.foto || '');
      if (!foto.startsWith('data:image') || foto.length < 40) {
        return res.status(400).json({ erro: 'Foto inválida.' });
      }
      if (foto.length > 450000) {
        return res.status(413).json({ erro: 'Foto grande demais.' });
      }
      await put(caminhoFoto(id), foto, {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'text/plain',
        cacheControlMaxAge: 0,
        storeId: STORE_ID
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ erro: 'Método não permitido.' });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : 'Falha ao gravar foto.';
    return res.status(500).json({ erro: mensagem });
  }
}
