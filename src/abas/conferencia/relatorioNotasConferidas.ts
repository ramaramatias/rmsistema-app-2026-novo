import type { RegistroConferencia } from '../../tipos';

export type LinhaNotaConferida = {
  id: string;
  conferenciaId: string;
  data: string;
  fornecedor: string;
  produto: string;
  categoria: string;
  quantidade: number;
  unit: string;
  quantidadeTexto: string;
  valorUnitario: number;
  valorTotal: number;
  conferente: string;
};

export type RankingFornecedor = {
  fornecedor: string;
  total: number;
  entregas: number;
  itens: number;
};

export type NotaPorFornecedor = {
  id: string;
  data: string;
  valorRecebido: number;
  conferente: string;
};

export type GrupoFornecedorNotas = {
  chave: string;
  fornecedor: string;
  notas: NotaPorFornecedor[];
  total: number;
};

export type RelatorioNotasConferidas = {
  linhas: LinhaNotaConferida[];
  grupos: GrupoFornecedorNotas[];
  ranking: RankingFornecedor[];
  totalGeral: number;
  quantidadeItens: number;
  quantidadeNotas: number;
};

const normalizar = (texto: string) =>
  String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

const numero = (valor: string | number | undefined) => {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : 0;
  return parseFloat(String(valor || '').replace(',', '.')) || 0;
};

export const formatarMoeda = (valor: number) =>
  Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const montarRelatorioNotasConferidas = (
  conferencias: RegistroConferencia[] | undefined,
  busca = ''
): RelatorioNotasConferidas => {
  const termo = normalizar(busca);
  const lista = (Array.isArray(conferencias) ? conferencias : []).filter(conf => {
    if (!termo) return true;
    return normalizar(conf.fornecedor || '').includes(termo)
      || (conf.itensConferidos || []).some(item => normalizar(item.fornecedor || '').includes(termo));
  });

  const linhas: LinhaNotaConferida[] = [];
  lista.forEach(conf => {
    const fornecedorNota = String(conf.fornecedor || '').trim() || 'Fornecedor não informado';
    const itens = Array.isArray(conf.itensConferidos) ? conf.itensConferidos : [];
    if (itens.length > 0) {
      itens.forEach((item, indice) => {
        const quantidade = numero(item.quantidade) || 1;
        const valorTotal = numero(item.valorTotal) || (numero(item.valorUnitario) * quantidade);
        const valorUnitario = numero(item.valorUnitario) || (quantidade ? valorTotal / quantidade : valorTotal);
        linhas.push({
          id: `${conf.id}_${indice}`,
          conferenciaId: conf.id,
          data: conf.data || '',
          fornecedor: String(item.fornecedor || fornecedorNota).trim() || fornecedorNota,
          produto: String(item.produto || conf.categoria || 'Mercadoria').trim(),
          categoria: String(conf.categoria || '').trim(),
          quantidade,
          unit: String(item.unit || '').trim() || 'Und',
          quantidadeTexto: String(item.quantidade || quantidade),
          valorUnitario,
          valorTotal,
          conferente: String(conf.nomeConferente || conf.conferentePor || '-').trim()
        });
      });
      return;
    }
    const valorTotal = numero(conf.valorRecebido) || numero(conf.valorEsperado);
    linhas.push({
      id: conf.id,
      conferenciaId: conf.id,
      data: conf.data || '',
      fornecedor: fornecedorNota,
      produto: String(conf.categoria || 'Mercadoria conferida').trim(),
      categoria: String(conf.categoria || '').trim(),
      quantidade: 1,
      unit: 'Lote',
      quantidadeTexto: '1',
      valorUnitario: valorTotal,
      valorTotal,
      conferente: String(conf.nomeConferente || conf.conferentePor || '-').trim()
    });
  });

  const gruposMap = new Map<string, GrupoFornecedorNotas>();
  lista.forEach(conf => {
    const fornecedor = String(conf.fornecedor || '').trim()
      || String(conf.itensConferidos?.[0]?.fornecedor || '').trim()
      || 'Fornecedor não informado';
    const chave = normalizar(fornecedor) || fornecedor;
    const itens = Array.isArray(conf.itensConferidos) ? conf.itensConferidos : [];
    const somaItens = itens.reduce((soma, item) => soma + (numero(item.valorTotal) || numero(item.valorUnitario) * (numero(item.quantidade) || 1)), 0);
    const valorRecebido = numero(conf.valorRecebido) || numero(conf.valorEsperado) || somaItens;
    const atual = gruposMap.get(chave) || { chave, fornecedor, notas: [], total: 0 };
    if (!atual.fornecedor || atual.fornecedor === 'Fornecedor não informado') atual.fornecedor = fornecedor;
    atual.notas.push({
      id: conf.id,
      data: conf.data || '',
      valorRecebido,
      conferente: String(conf.nomeConferente || conf.conferentePor || '-').trim()
    });
    atual.total += valorRecebido;
    gruposMap.set(chave, atual);
  });
  const grupos = Array.from(gruposMap.values())
    .map(grupo => ({
      ...grupo,
      notas: [...grupo.notas].sort((a, b) => String(a.data).localeCompare(String(b.data)))
    }))
    .sort((a, b) => a.fornecedor.localeCompare(b.fornecedor, 'pt-BR'));
  const ranking = grupos
    .map(grupo => ({
      fornecedor: grupo.fornecedor,
      total: grupo.total,
      entregas: grupo.notas.length,
      itens: grupo.notas.length
    }))
    .sort((a, b) => b.total - a.total || b.entregas - a.entregas);
  const totalGeral = grupos.reduce((soma, grupo) => soma + grupo.total, 0);

  return {
    linhas,
    grupos,
    ranking,
    totalGeral,
    quantidadeItens: linhas.length,
    quantidadeNotas: grupos.reduce((soma, grupo) => soma + grupo.notas.length, 0)
  };
};
