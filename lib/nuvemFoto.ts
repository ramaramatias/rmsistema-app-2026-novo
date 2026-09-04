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

export async function lerFotoBlob(id: string) {
  const { result } = await chamar(`get/${chaveFoto(id)}`);
  return typeof result === 'string' ? result.trim() : '';
}

export async function gravarFotoBlob(id: string, foto: string) {
  await chamar(`set/${chaveFoto(id)}`, foto);
}
