import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gravarFotoBlob, lerFotoBlob } from '../lib/nuvemFoto.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate, max-age=0');
  const idBruto = req.method === 'GET' ? req.query.id : (req.body as { id?: string })?.id;
  const id = String(idBruto || '').trim();
  if (!id) return res.status(400).json({ erro: 'Foto sem identificação.' });

  try {
    if (req.method === 'GET') {
      const foto = await lerFotoBlob(id);
      return res.status(foto ? 200 : 404).json({ foto });
    }

    if (req.method === 'PUT') {
      const foto = String((req.body as { foto?: string })?.foto || '');
      if (!foto.startsWith('data:image') || foto.length < 40) {
        return res.status(400).json({ erro: 'Foto inválida.' });
      }
      if (foto.length > 450000) {
        return res.status(413).json({ erro: 'Foto grande demais.' });
      }
      await gravarFotoBlob(id, foto);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ erro: 'Método não permitido.' });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : 'Falha ao gravar foto.';
    const semConfiguracao = /sem configuração/i.test(mensagem);
    return res.status(semConfiguracao ? 503 : 500).json({ erro: mensagem });
  }
}
