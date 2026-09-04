// Nuvem do sistema no Upstash Redis (plano gratuito da Vercel).
// Mesmo protocolo de api/nuvem.ts, para o localhost funcionar igual ao site.

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

export async function lerNuvemKv(desde?: string) {
  const { result: versaoBruta } = await chamar(`get/${CHAVE_VERSAO}`);
  const versao = typeof versaoBruta === 'string' ? versaoBruta : '';

  if (versao && desde === versao) {
    return { versao, semMudanca: true as const };
  }

  const { result: dados } = await chamar(`get/${CHAVE_DADOS}`);
  const record = typeof dados === 'string' && dados.trim() ? envelopar(JSON.parse(dados)) : {};
  return { versao, record };
}

export async function gravarNuvemKv(corpo: unknown) {
  const versao = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const record = envelopar(corpo ?? {});
  await chamar(
    'pipeline',
    JSON.stringify([
      ['SET', CHAVE_DADOS, JSON.stringify(record)],
      ['SET', CHAVE_VERSAO, versao]
    ])
  );
  return { versao, record };
}
