import type { VercelRequest, VercelResponse } from '@vercel/node';
import { baixarBufferAnexo, gravarAnexoBytes, gravarAnexoPdf, lerUrlAnexo } from '../lib/nuvemAnexo.js';

export const config = {
  api: {
    bodyParser: false
  }
};

const lerCorpo = async (req: VercelRequest) => {
  const pedacos: Uint8Array[] = [];
  for await (const parte of req) {
    pedacos.push(parte instanceof Uint8Array ? parte : new Uint8Array(Buffer.from(parte)));
  }
  return Buffer.concat(pedacos);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const id = String(req.query.id || '').trim();
      if (!id) return res.status(400).json({ erro: 'Anexo sem identificação.' });
      const baixarArquivo = String(req.query.arquivo || '') === '1';
      if (baixarArquivo) {
        const arquivo = await baixarBufferAnexo(id);
        if (!arquivo) return res.status(404).json({ erro: 'PDF não encontrado na nuvem.' });
        const nome = String(req.query.nome || 'anexo.pdf').replace(/[^\w.\- ()áéíóúãõçÁÉÍÓÚÃÕÇ]/g, '_');
        const baixar = String(req.query.baixar || '') === '1';
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `${baixar ? 'attachment' : 'inline'}; filename="${nome}"`);
        return res.status(200).send(arquivo);
      }
      try {
        const url = await lerUrlAnexo(id);
        return res.status(url ? 200 : 404).json({ url });
      } catch {
        return res.status(404).json({ url: '' });
      }
    }

    if (req.method === 'PUT') {
      const tipo = String(req.headers['content-type'] || '');
      const bruto = await lerCorpo(req);
      let id = String(req.query.id || '').trim();
      let url = '';
      if (tipo.includes('application/pdf') || tipo.includes('application/octet-stream')) {
        if (!id) return res.status(400).json({ erro: 'Anexo sem identificação.' });
        url = await gravarAnexoBytes(id, bruto);
      } else {
        const corpo = JSON.parse(bruto.toString('utf8') || '{}') as { id?: string; conteudo?: string };
        id = id || String(corpo.id || '').trim();
        if (!id || !corpo.conteudo) return res.status(400).json({ erro: 'Envie um PDF válido.' });
        url = await gravarAnexoPdf(id, corpo.conteudo);
      }
      return res.status(200).json({ ok: true, url });
    }

    return res.status(405).json({ erro: 'Método não permitido.' });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : 'Falha ao gravar o PDF.';
    return res.status(500).json({ erro: mensagem });
  }
}
