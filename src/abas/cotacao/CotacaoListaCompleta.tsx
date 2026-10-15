import { useEffect, useMemo, useRef, useState } from 'react';
import { LISTA_COMPLETA, type ItemListaCompleta } from '../../catalogo/listaCompleta';
import type { FornecedorCotacao, ItemCotacao } from '../../tipos';

const precoNumero = (valor: unknown) => {
  const n = parseFloat(String(valor ?? '').replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const nomeFornecedor = (fornecedor?: FornecedorCotacao) =>
  fornecedor?.nomeFantasia || fornecedor?.nome || fornecedor?.razaoSocial || 'Fornecedor';

const catalogoPorId = new Map(LISTA_COMPLETA.map(item => [item.id, item]));

export function CotacaoListaCompleta(p: {
  fornecedores: FornecedorCotacao[];
  fornecedorId: string;
  setFornecedorId: (id: string) => void;
  itens: ItemCotacao[];
  incluir: (produto: ItemListaCompleta, fornecedorId: string) => void;
  retirar: (itemId: string, fornecedorId: string) => void;
  atualizarCampoCotacao: (itemId: string, campo: 'qtdPedir', valor: string) => void;
  atualizarPrecoCotacao: (itemId: string, fornecedorId: string, valor: string) => void;
  adicionarFornecedorCotacao: () => void;
  novoFornecedorNome: string;
  setNovoFornecedorNome: (valor: string) => void;
  qtdPedirNumero: (item: ItemCotacao) => number;
  salvarPedidoFornecedor: (fornecedor: FornecedorCotacao, itens: ItemCotacao[], escopo?: { somenteFornecedores?: string[] }) => void;
  imprimirPedidoIndividual: (fornecedor: FornecedorCotacao, itens: ItemCotacao[]) => void;
  setAlerta: (alerta: { tipo: string; msg: string }) => void;
}) {
  const [busca, setBusca] = useState('');
  const aguardandoFornecedor = useRef(false);
  const fornecedor = p.fornecedores.find(item => item.id === p.fornecedorId);
  const termo = busca.trim().toLowerCase();
  const jaIncluidos = useMemo(() => new Set(p.itens.map(item => item.id)), [p.itens]);

  const sugestoes = useMemo(() => {
    if (termo.length < 2) return [];
    const achados: ItemListaCompleta[] = [];
    for (const item of LISTA_COMPLETA) {
      if (item.descricao.toLowerCase().includes(termo) || item.codigo.toLowerCase().includes(termo)) {
        achados.push(item);
        if (achados.length === 8) break;
      }
    }
    return achados;
  }, [termo]);

  const linhas = useMemo(
    () => [...p.itens].sort((a, b) => a.produto.localeCompare(b.produto, 'pt-BR', { numeric: true, sensitivity: 'base' })),
    [p.itens]
  );

  const total = linhas.reduce((soma, item) => soma + precoNumero(item.precos?.[p.fornecedorId]) * p.qtdPedirNumero(item), 0);

  useEffect(() => {
    if (!aguardandoFornecedor.current || p.fornecedores.length === 0) return;
    aguardandoFornecedor.current = false;
    const ultimo = p.fornecedores[p.fornecedores.length - 1];
    if (ultimo) p.setFornecedorId(ultimo.id);
  }, [p.fornecedores, p.setFornecedorId]);

  const adicionarFornecedor = () => {
    if (!String(p.novoFornecedorNome || '').trim()) return;
    aguardandoFornecedor.current = true;
    p.adicionarFornecedorCotacao();
  };

  const incluir = (produto: ItemListaCompleta) => {
    if (!p.fornecedorId) return;
    p.incluir(produto, p.fornecedorId);
    setBusca('');
  };

  const pedidosProntos = () => {
    if (!fornecedor) {
      p.setAlerta({ tipo: 'erro', msg: 'Selecione o fornecedor.' });
      return null;
    }
    const semPreco = linhas.filter(item => p.qtdPedirNumero(item) > 0 && precoNumero(item.precos?.[p.fornecedorId]) <= 0);
    if (semPreco.length > 0) {
      p.setAlerta({ tipo: 'erro', msg: `Informe o preço de ${semPreco[0].produto}.` });
      return null;
    }
    const prontos = linhas.filter(item => p.qtdPedirNumero(item) > 0 && precoNumero(item.precos?.[p.fornecedorId]) > 0);
    if (prontos.length === 0) {
      p.setAlerta({ tipo: 'erro', msg: 'Preencha a quantidade e o preço de ao menos um produto.' });
      return null;
    }
    return prontos;
  };

  const campo = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/15';

  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-sm text-slate-600">
        Escolha o fornecedor, busque o produto na lista completa e lance só a quantidade e o preço desta compra.
      </p>

      <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_minmax(220px,1fr)]">
        <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
          Fornecedor
          <select value={p.fornecedorId} onChange={e => p.setFornecedorId(e.target.value)} className={campo}>
            <option value="">Selecione o fornecedor</option>
            {p.fornecedores.map(item => (
              <option key={item.id} value={item.id}>{nomeFornecedor(item)}</option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Novo fornecedor
            <input
              value={p.novoFornecedorNome}
              onChange={e => p.setNovoFornecedorNome(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') adicionarFornecedor(); }}
              placeholder="Nome"
              className={campo}
            />
          </label>
          <button type="button" onClick={adicionarFornecedor} className="cursor-pointer rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800">
            Adicionar
          </button>
        </div>
      </div>

      <div>
        <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
          Produto da lista completa
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            disabled={!p.fornecedorId}
            onKeyDown={e => {
              if (e.key === 'Enter' && sugestoes[0] && !jaIncluidos.has(`est_${sugestoes[0].id}`)) incluir(sugestoes[0]);
            }}
            placeholder={p.fornecedorId ? 'Nome ou código' : 'Selecione o fornecedor primeiro'}
            className={campo}
          />
        </label>
        {sugestoes.length > 0 && (
          <ul className="m-0 mt-2 list-none rounded-xl p-0 ring-1 ring-slate-200">
            {sugestoes.map(item => {
              const incluido = jaIncluidos.has(`est_${item.id}`);
              return (
                <li key={item.id} className="flex items-center gap-3 border-b border-slate-100 px-3 py-2 last:border-b-0">
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-sm text-slate-900">{item.descricao}</strong>
                    <span className="text-[11px] text-slate-500">
                      {item.codigo} · estoque {item.estoque} {item.embalagem} · custo {item.custo} · venda {item.preco}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={incluido}
                    onClick={() => incluir(item)}
                    className="cursor-pointer rounded-lg border-0 bg-teal-700 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-teal-600 disabled:cursor-default disabled:bg-slate-200 disabled:text-slate-500"
                  >
                    {incluido ? 'Incluído' : 'Incluir'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {termo.length >= 2 && sugestoes.length === 0 && (
          <p className="mb-0 mt-2 text-xs text-slate-500">Nenhum produto com esse nome ou código.</p>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-900 text-left text-white">
              <th className="px-3 py-2">Produto</th>
              <th className="px-3 py-2">Estoque</th>
              <th className="px-3 py-2">Custo</th>
              <th className="px-3 py-2">Venda</th>
              <th className="px-3 py-2">Pedir</th>
              <th className="px-3 py-2">Preço</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2"> </th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(item => {
              const catalogo = catalogoPorId.get(String(item.id).slice(4));
              const preco = item.precos?.[p.fornecedorId] || '';
              const quantidade = p.qtdPedirNumero(item);
              const linha = precoNumero(preco) * quantidade;
              return (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">
                    <strong className="block text-slate-900">{item.produto}</strong>
                    <span className="text-[11px] text-slate-500">{catalogo?.codigo || ''} {item.unit}</span>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{item.estoqueAtual || catalogo?.estoque || '—'}</td>
                  <td className="px-3 py-2 text-slate-600">{catalogo?.custo || '—'}</td>
                  <td className="px-3 py-2 text-slate-600">{catalogo?.preco || '—'}</td>
                  <td className="px-3 py-2">
                    <input value={item.qtdPedir || ''} onChange={e => p.atualizarCampoCotacao(item.id, 'qtdPedir', e.target.value)} className="h-8 w-16 rounded-md border border-slate-200 text-center text-xs font-semibold" />
                  </td>
                  <td className="px-3 py-2">
                    <input value={preco} onChange={e => p.atualizarPrecoCotacao(item.id, p.fornecedorId, e.target.value)} placeholder="0,00" className="h-8 w-20 rounded-md border border-slate-200 text-center text-xs font-semibold" />
                  </td>
                  <td className="px-3 py-2 font-bold text-slate-800">{linha > 0 ? linha.toFixed(2) : '—'}</td>
                  <td className="px-3 py-2 text-right">
                    <button type="button" onClick={() => p.retirar(item.id, p.fornecedorId)} className="cursor-pointer border-0 bg-transparent text-xs font-bold text-rose-600">Tirar</button>
                  </td>
                </tr>
              );
            })}
            {linhas.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sm text-slate-500">
                  {p.fornecedorId ? 'Nenhum produto deste fornecedor. Busque na lista e inclua.' : 'Selecione o fornecedor para começar.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-teal-50 px-4 py-3 ring-1 ring-teal-100">
        <strong className="text-teal-950">Total deste fornecedor: R$ {total.toFixed(2)}</strong>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              const prontos = pedidosProntos();
              if (prontos && fornecedor) p.imprimirPedidoIndividual(fornecedor, prontos);
            }}
            className="cursor-pointer rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-800 ring-1 ring-slate-200"
          >
            Imprimir
          </button>
          <button
            type="button"
            onClick={() => {
              const prontos = pedidosProntos();
              if (prontos && fornecedor) p.salvarPedidoFornecedor(fornecedor, prontos, { somenteFornecedores: [fornecedor.id] });
            }}
            className="cursor-pointer rounded-lg border-0 bg-teal-700 px-3 py-2 text-xs font-bold text-white hover:bg-teal-600"
          >
            Salvar pedido
          </button>
        </div>
      </div>
    </div>
  );
}
