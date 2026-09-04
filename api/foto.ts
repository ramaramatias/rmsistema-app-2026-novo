import type { VercelRequest, VercelResponse } from '@vercel/node';

// Fotos das pendências no Upstash Redis, o mesmo lugar da nuvem do sistema.

const chaveFoto = (id: string) => `sistema:foto:${String(id).replace(/[^a-zA-Z0-9._-]/g, '_')}`;

const credenciais = () => {
  const url = process.env.KV_REST_API_URL || '';
  const token = process.env.KV_REST_API_TOKEN || '';
  if (!url || !token) {
    throw new Error('Nuvem sem configuração (KV_REST_API_URL / KV_REST_API_TOKEN).');
  }
  return { url: url.replace(/\/$/, ''), token };
};

const chamar = async (caminho: string, corpo?: string) => {
  const { url, token } = credenciais();
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  const idBruto = req.method === 'GET' ? req.query.id : (req.body as { id?: string })?.id;
  const id = String(idBruto || '').trim();
  if (!id) return res.status(400).json({ erro: 'Foto sem identificação.' });

  try {
    if (req.method === 'GET') {
      const { result } = await chamar(`get/${chaveFoto(id)}`);
      const foto = typeof result === 'string' ? result.trim() : '';
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
      await chamar(`set/${chaveFoto(id)}`, foto);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ erro: 'Método não permitido.' });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : 'Falha ao gravar foto.';
    return res.status(500).json({ erro: mensagem });
  }
}
