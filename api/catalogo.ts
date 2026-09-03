import type { VercelRequest, VercelResponse } from '@vercel/node';

type Fornecedor = { id: string; nome: string };
type Item = {
  id: string;
  produto: string;
  unit: string;
  menorCusto?: number;
  ultimoPrecoCompra?: number;
  precos?: Record<string, string>;
};

const normalizar = (valor: string) => valor
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const secaoProduto = (produto: string) => {
  const nome = normalizar(produto);
  if (/muc ulo|carne|ossobuco|porco|costela|cupim|figado|tripa|bucho|mocoto|bacon|calabresa|linguica|salsicha|maminha|patinho|paleta|coxao|lagarto/.test(nome)) return 'Carnes e frios';
  if (/galinha|frango|pato|coxa|sobrecoxa|pe de galinha/.test(nome)) return 'Aves';
  if (/peixe|tilapia|merluza|panga|bacalhau|camarao|salmao|atum|cumurupim/.test(nome)) return 'Peixes e frutos do mar';
  if (/polpa|fruta|coco|manga|abacaxi|morango|maracuja|acerola|goiaba|acai|caju|tamarindo|tangerina|siriguela|sapoti|cupuacu|ameixa|caja|graviola|uva|figo|pessego/.test(nome)) return 'Frutas e polpas';
  if (/queijo|leite|manteiga|margarina|nata|requeijao|cream cheese|presunto|mortadela|apresuntado|cheester/.test(nome)) return 'Laticinios e frios';
  if (/farinha|arroz|feijao|macarrao|espaguete|aveia|acucar|amido|fuba|granola|castanha|amendoim|tapioca|goma|puba|massa|flocao/.test(nome)) return 'Mercearia e massas';
  if (/chocolate|bombom|nutella|kinder|pirulito|pacoquinha|ovo surpresa|granulado|cereja|red velvet|gelatina|cremogema|bolacha|nescau/.test(nome)) return 'Confeitaria e doces';
  if (/molho|azeite|oleo|vinagre|ketchup|mostarda|pimenta|maionese|sazon|caldo|colorau|acafrao|sal|adocante|mel|cafe|vinho|cachaca|suco/.test(nome)) return 'Molhos, temperos e bebidas';
  return 'Outros produtos';
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Método não permitido.' });
  if (!process.env.RM_API_KEY || req.headers['x-rm-api-key'] !== process.env.RM_API_KEY) {
    return res.status(401).json({ erro: 'Chave da API inválida.' });
  }

  const chaveJsonBin = process.env.JSONBIN_MASTER_KEY;
  const binId = process.env.JSONBIN_BIN_ID;
  if (!chaveJsonBin || !binId) return res.status(500).json({ erro: 'Integração de dados não configurada.' });

  try {
    const resposta = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: { 'X-Master-Key': chaveJsonBin }
    });
    const json = await resposta.json();
    if (!resposta.ok || !json.record) return res.status(502).json({ erro: 'Não foi possível consultar os dados do RM.' });

    const fornecedores = (json.record.fornecedoresCotacao || []) as Fornecedor[];
    const itens = (json.record.itensCotacao || []) as Item[];
    const filtro = typeof req.query.secao === 'string' ? normalizar(req.query.secao) : '';
    const produto = typeof req.query.produto === 'string' ? normalizar(req.query.produto) : '';

    const dados = itens
      .filter(item => (!filtro || normalizar(secaoProduto(item.produto)).includes(filtro)) && (!produto || normalizar(item.produto).includes(produto)))
      .map(item => {
        const precos = Object.entries(item.precos || {}).map(([fornecedorId, valor]) => ({
          fornecedor: fornecedores.find(fornecedor => fornecedor.id === fornecedorId)?.nome || fornecedorId,
          valor: Number.parseFloat(String(valor).replace(',', '.'))
        })).filter(preco => Number.isFinite(preco.valor) && preco.valor > 0);
        const menor = precos.reduce<{ fornecedor: string; valor: number } | null>((atual, preco) => !atual || preco.valor < atual.valor ? preco : atual, null);
        return {
          id: item.id,
          produto: item.produto,
          unidade: item.unit,
          secao: secaoProduto(item.produto),
          menorPreco: menor,
          menorCusto: item.menorCusto ?? null,
          ultimoPrecoCompra: item.ultimoPrecoCompra ?? null
        };
      });

    return res.status(200).json({ atualizadoEm: new Date().toISOString(), total: dados.length, produtos: dados });
  } catch {
    return res.status(500).json({ erro: 'Erro interno ao consultar o catálogo.' });
  }
}
