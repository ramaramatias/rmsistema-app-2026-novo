import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gravarNuvemFirebase, lerNuvemFirebase } from '../lib/firebaseNuvem.js';

const semCache = (res: VercelResponse) => {
  res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  semCache(res);

  try {
    if (req.method === 'GET') {
      const desdeBruto = req.query.desde;
      const desde = String(Array.isArray(desdeBruto) ? desdeBruto[0] : desdeBruto || '');
      return res.status(200).json(await lerNuvemFirebase(desde));
    }

    if (req.method === 'PUT') {
      const resultado = await gravarNuvemFirebase(req.body);
      if ('conflito' in resultado) return res.status(409).json(resultado);
      return res.status(200).json(resultado);
    }

    return res.status(405).json({ erro: 'Método não permitido.' });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : 'Falha ao falar com a nuvem.';
    const semConfiguracao = /sem configuração/i.test(mensagem);
    return res.status(semConfiguracao ? 503 : 500).json({ erro: mensagem, suspenso: semConfiguracao });
  }
}
