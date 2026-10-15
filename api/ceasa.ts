import type { VercelRequest, VercelResponse } from '@vercel/node';
import { responderCeasa } from '../lib/ceasaArquivos.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb'
    }
  },
  maxDuration: 60
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  const headers: Record<string, string | undefined> = {};
  for (const [chave, valor] of Object.entries(req.headers)) {
    headers[chave] = Array.isArray(valor) ? valor[0] : valor;
  }
  const resultado = await responderCeasa({
    method: req.method || 'GET',
    url: req.url || '',
    headers,
    body: req.body
  });
  if (resultado.tipo === 'pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${resultado.nome}"`);
    return res.status(resultado.status).send(resultado.corpo);
  }
  return res.status(resultado.status).json(resultado.corpo);
}
