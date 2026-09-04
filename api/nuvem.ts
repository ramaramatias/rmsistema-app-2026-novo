import type { VercelRequest, VercelResponse } from '@vercel/node';

// Nuvem do sistema no Upstash Redis (plano gratuito da Vercel).
//
// O sistema pergunta "mudou algo?" a cada minuto, em cada aparelho. Para isso
// não custar tráfego, a versão fica numa chave própria, minúscula: só quando a
// versão muda é que a base inteira é enviada.
//
// A versão vai e volta no corpo da resposta, e não em cabeçalho HTTP, porque a
// rede da Vercel consome cabeçalhos de cache antes de chegar aqui.

const CHAVE_DADOS = 'sistema:dados';
const CHAVE_VERSAO = 'sistema:versao';

const credenciais = () => {
  const url = process.env.KV_REST_API_URL || '';
  const token = process.env.KV_REST_API_TOKEN || '';
  if (!url || !token) {
    throw new Error('Nuvem sem configuração (KV_REST_API_URL / KV_REST_API_TOKEN).');
  }
  return { url: url.replace(/\/$/, ''), token };
};

const envelopar = (dados: unknown) => {
  if (dados && typeof dados === 'object' && !Array.isArray(dados) && 'record' in (dados as object)) {
    return (dados as { record: unknown }).record;
  }
  return dados && typeof dados === 'object' ? dados : {};
};

const chamar = async (caminho: string, corpo?: string) => {
  const { url, token } = credenciais();
  const resposta = await fetch(`${url}/${caminho}`, {
    method: corpo === undefined ? 'GET' : 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(corpo === undefined ? {} : { 'Content-Type': 'application/json' })
    },
    ...(corpo === undefined ? {} : { body: corpo }),
    cache: 'no-store'
  });
  if (!resposta.ok) throw new Error(`Nuvem respondeu ${resposta.status}.`);
  return (await resposta.json()) as { result?: unknown };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      const desdeBruto = req.query.desde;
      const desde = String(Array.isArray(desdeBruto) ? desdeBruto[0] : desdeBruto || '');

      const { result: versaoBruta } = await chamar(`get/${CHAVE_VERSAO}`);
      const versao = typeof versaoBruta === 'string' ? versaoBruta : '';

      // Nada mudou desde a última leitura: responde só isso, em vez da base inteira.
      if (versao && desde === versao) {
        return res.status(200).json({ versao, semMudanca: true });
      }

      const { result: dados } = await chamar(`get/${CHAVE_DADOS}`);
      const record = typeof dados === 'string' && dados.trim() ? envelopar(JSON.parse(dados)) : {};
      return res.status(200).json({ versao, record });
    }

    if (req.method === 'PUT') {
      const versao = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const record = envelopar(req.body ?? {});
      // Dados e versão numa única ida à nuvem, para a versão nunca ficar adiantada.
      await chamar(
        'pipeline',
        JSON.stringify([
          ['SET', CHAVE_DADOS, JSON.stringify(record)],
          ['SET', CHAVE_VERSAO, versao]
        ])
      );
      return res.status(200).json({ versao, record });
    }

    return res.status(405).json({ erro: 'Método não permitido.' });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : 'Falha ao falar com a nuvem.';
    const semConfiguracao = /sem configuração/i.test(mensagem);
    return res.status(semConfiguracao ? 503 : 500).json({ erro: mensagem, suspenso: semConfiguracao });
  }
}
