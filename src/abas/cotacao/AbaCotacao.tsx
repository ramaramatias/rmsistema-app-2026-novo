import { Fragment, useEffect, useMemo, useState } from 'react';
import type { ItemListaCompleta } from '../../catalogo/listaCompleta';
import { classificarSecaoProduto } from '../../catalogo/secao';
import { CotacaoListaCompleta } from './CotacaoListaCompleta';
import { FORNECEDORES_LATICINIOS, MATERIA_PRIMA_POR_CATEGORIA, MERCEARIA_POR_CATEGORIA, SECOES_COTACAO_EXTRAS, montarItensEmbalagens, montarItensLaticinios, montarItensSecao, secaoCatalogoDoId } from '../../catalogo/secoesDados';
import { tipoPessoaFornecedor } from '../../tipos';
import { chaveNomeItemCotacao } from '../../util/cotacao';

export function AbaCotacao(p: {
  adicionarBonificacaoNoPedido: any;
  incluirItensNoPedidoSalvo: any;
  removerBonificacaoDoPedido: any;
  adicionarFornecedorCotacao: any;
  atualizarCampoCotacao: any;
  atualizarPrecoCotacao: any;
  buscaCotacao: any;
  cadastrarProduto: any;
  calcularMenorPrecoItem: any;
  enviarPedidoWhatsAppPdf: any;
  excluirRelatorioPedidoCotacao: any;
  fornecedoresCotacao: any;
  getDiaSemanaAtual: any;
  garantirEmbalagensNaCotacao: () => void;
  garantirLaticiniosNaCotacao: () => void;
  imprimirPedidoIndividual: any;
  incluirProdutoEstoqueNaCotacao: (produto: ItemListaCompleta, fornecedorId: string) => void;
  retirarProdutoEstoqueDaCotacao: (itemId: string, fornecedorId: string) => void;
  imprimirRelatorioCotacao: any;
  imprimirRelatorioPedidosPorVendedor: any;
  itensCotacao: any;
  limparCotacoesPrecos: any;
  marcarPedidoSalvoNaConferencia: any;
  mostrarRelatorioPedidos: any;
  mostrarRelatoriosCotacao: any;
  novoFornecedorNome: any;
  novoProdutoCadastro: any;
  pedidosAindaNaCotacao: any;
  pedidosPendentesConferencia: any;
  qtdPedirNumero: any;
  relatoriosPedidosCotacao: any;
  removerItemCotacao: any;
  salvarPedidoFornecedor: any;
  salvarRelatorioPedidoCotacao: any;
  setAlerta: any;
  setBuscaCotacao: any;
  setFornecedoresCotacao: any;
  setMostrarModalImportacao: any;
  setMostrarRelatorioPedidos: any;
  setMostrarRelatoriosCotacao: any;
  setNovoFornecedorNome: any;
  setNovoProdutoCadastro: any;
  setTabAtiva: any;
  totaisPorFornecedor: any;
  totalGeralCompraCotacao: any;
  verificaEntregaHoje: any;
}) {
  const {
    adicionarBonificacaoNoPedido,
    incluirItensNoPedidoSalvo,
    removerBonificacaoDoPedido,
    adicionarFornecedorCotacao,
    atualizarCampoCotacao,
    atualizarPrecoCotacao,
    buscaCotacao,
    cadastrarProduto,
    calcularMenorPrecoItem,
    enviarPedidoWhatsAppPdf,
    excluirRelatorioPedidoCotacao,
    fornecedoresCotacao,
    getDiaSemanaAtual,
    garantirEmbalagensNaCotacao,
    garantirLaticiniosNaCotacao,
    imprimirPedidoIndividual,
    incluirProdutoEstoqueNaCotacao,
    retirarProdutoEstoqueDaCotacao,
    imprimirRelatorioCotacao,
    imprimirRelatorioPedidosPorVendedor,
    itensCotacao,
    limparCotacoesPrecos,
    marcarPedidoSalvoNaConferencia,
    mostrarRelatorioPedidos,
    mostrarRelatoriosCotacao,
    novoFornecedorNome,
    novoProdutoCadastro,
    pedidosAindaNaCotacao,
    pedidosPendentesConferencia,
    qtdPedirNumero,
    relatoriosPedidosCotacao,
    removerItemCotacao,
    salvarPedidoFornecedor,
    salvarRelatorioPedidoCotacao,
    setAlerta,
    setBuscaCotacao,
    setFornecedoresCotacao,
    setMostrarModalImportacao,
    setMostrarRelatorioPedidos,
    setMostrarRelatoriosCotacao,
    setNovoFornecedorNome,
    setNovoProdutoCadastro,
    setTabAtiva,
    totaisPorFornecedor,
    totalGeralCompraCotacao,
    verificaEntregaHoje
  } = p;
  const [abaPedido, setAbaPedido] = useState<'listas' | 'precos' | 'registro' | 'salvos' | 'bonificacao'>(() => {
    try {
      const salvo = sessionStorage.getItem('rm_cotacao_aba');
      if (salvo === 'listas' || salvo === 'precos' || salvo === 'registro' || salvo === 'salvos' || salvo === 'bonificacao') return salvo;
    } catch { /* ignora */ }
    return 'precos';
  });
  const [bonificacao, setBonificacao] = useState({ produto: '', fornecedor: '', quantidade: '1', unit: 'Und', valor: '', pedidoId: '' });
  const [listaCotacao, setListaCotacao] = useState<'geral' | 'listaCompleta' | 'embalagens' | 'laticinios' | (typeof SECOES_COTACAO_EXTRAS)[number]>('geral');
  const [fornecedorListaId, setFornecedorListaId] = useState('');
  const [fornecedorLaticinio, setFornecedorLaticinio] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const [editandoId, setEditandoId] = useState('');
  const [buscaFornecedor, setBuscaFornecedor] = useState('');
  const [formProduto, setFormProduto] = useState(false);
  const [formFornecedor, setFormFornecedor] = useState(false);
  const [marcados, setMarcados] = useState<string[] | null>(null);
  const [fornecedoresEmb, setFornecedoresEmb] = useState<string[]>(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem('rm_cotacao_embalagens_fornecedores') || '[]');
      if (Array.isArray(salvo)) return [...new Set(salvo.map((id: unknown) => String(id || '')).filter(Boolean))];
    } catch { /* ignora */ }
    return [];
  });
  const [novoEmbId, setNovoEmbId] = useState('');
  const itemEhEmbalagem = (item: any) => item?.secao === 'Embalagens' || String(item?.id || '').startsWith('emb_');
  const itemEhLaticinio = (item: any) => item?.secao === 'Laticínios' || String(item?.id || '').startsWith('lat_');
  const itemEhSecaoExtra = (item: any) => Boolean(secaoCatalogoDoId(item?.id)) || (SECOES_COTACAO_EXTRAS as readonly string[]).includes(item?.secao);
  const itemEhListaCompleta = (item: any) => String(item?.id || '').startsWith('est_') || item?.secao === 'Lista completa';
  const listaSecao = listaCotacao !== 'geral';
  const nomeListaAtual = listaCotacao === 'listaCompleta'
    ? 'Lista completa'
    : listaCotacao === 'geral'
    ? 'Lista geral'
    : listaCotacao === 'embalagens'
      ? 'Embalagens'
      : listaCotacao === 'laticinios'
        ? 'Laticínios'
        : listaCotacao === 'Matéria prima'
          ? 'Matéria-prima'
          : listaCotacao;
  const escolherLista = (id: 'geral' | 'listaCompleta' | 'embalagens' | 'laticinios' | (typeof SECOES_COTACAO_EXTRAS)[number]) => {
    setFiltroCategoria('todos');
    if (id === 'laticinios') {
      garantirLaticiniosNaCotacao?.();
      setFornecedorLaticinio('todos');
    }
    setListaCotacao(id);
    setAbaPedido('precos');
  };
  const categoriasDaLista = listaCotacao === 'Matéria prima'
    ? Object.keys(MATERIA_PRIMA_POR_CATEGORIA)
    : listaCotacao === 'Mercearia'
      ? Object.keys(MERCEARIA_POR_CATEGORIA)
      : [];
  useEffect(() => {
    try { sessionStorage.setItem('rm_cotacao_aba', abaPedido); } catch { /* ignora */ }
  }, [abaPedido]);
  useEffect(() => {
    if (listaCotacao === 'embalagens') garantirEmbalagensNaCotacao?.();
  }, [listaCotacao]);
  useEffect(() => {
    const ids = new Set((fornecedoresCotacao || []).filter((f: any) => tipoPessoaFornecedor(f) === 'juridica').map((f: any) => f?.id).filter(Boolean));
    setFornecedoresEmb(atuais => {
      const validos = atuais.filter(id => ids.has(id));
      return validos.length === atuais.length ? atuais : validos;
    });
  }, [fornecedoresCotacao]);
  useEffect(() => {
    localStorage.setItem('rm_cotacao_embalagens_fornecedores', JSON.stringify(fornecedoresEmb));
  }, [fornecedoresEmb]);
  const nomeFornecedor = (f: any) => f?.nomeFantasia || f?.nome || f?.razaoSocial || 'Fornecedor';
  const fornecedoresJuridicos = (fornecedoresCotacao || []).filter((f: any) => tipoPessoaFornecedor(f) === 'juridica');
  const precoNumero = (valor: any) => {
    const n = parseFloat(String(valor ?? '').replace(',', '.'));
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  const itensDaLista = useMemo(() => {
    const lista = Array.isArray(itensCotacao) ? itensCotacao : [];
    if (listaCotacao === 'embalagens') return montarItensEmbalagens(lista);
    if (listaCotacao === 'laticinios') {
      const laticinios = montarItensLaticinios(lista);
      if (fornecedorLaticinio === 'todos') return laticinios;
      return laticinios.filter(item => item.fornecedorId === fornecedorLaticinio);
    }
    if (listaCotacao === 'listaCompleta') {
      if (!fornecedorListaId) return [];
      return lista.filter((item: any) => itemEhListaCompleta(item) && Object.prototype.hasOwnProperty.call(item.precos || {}, fornecedorListaId));
    }
    if ((SECOES_COTACAO_EXTRAS as readonly string[]).includes(listaCotacao)) {
      const secao = montarItensSecao(listaCotacao, lista);
      if (filtroCategoria === 'todos') return secao;
      return secao.filter(item => item.categoria === filtroCategoria);
    }
    const geral = lista.filter((item: any) => !itemEhEmbalagem(item) && !itemEhLaticinio(item) && !itemEhSecaoExtra(item) && !itemEhListaCompleta(item));
    const vistos = new Set<string>();
    return geral.filter((item: any) => {
      const chave = chaveNomeItemCotacao(item) || String(item?.id || '');
      if (!chave || vistos.has(chave)) return false;
      vistos.add(chave);
      return true;
    });
  }, [itensCotacao, listaCotacao, fornecedorLaticinio, filtroCategoria, fornecedorListaId]);
  const idsCadastro = fornecedoresJuridicos.map((f: any) => f?.id).filter(Boolean);
  const idsEmbEscolhidos = [...new Set(fornecedoresEmb.filter(id => idsCadastro.includes(id)))];
  const fornecedoresEmbDisponiveis = fornecedoresJuridicos.filter((f: any) => !idsEmbEscolhidos.includes(f.id));
  const fornecedoresVisiveis = listaCotacao === 'embalagens'
    ? idsEmbEscolhidos.map(id => fornecedoresJuridicos.find((f: any) => f?.id === id)).filter(Boolean)
    : listaCotacao === 'laticinios'
      ? (fornecedorLaticinio === 'todos' ? FORNECEDORES_LATICINIOS : FORNECEDORES_LATICINIOS.filter(f => f.id === fornecedorLaticinio))
      : listaCotacao === 'listaCompleta'
        ? fornecedoresJuridicos.filter((f: any) => f.id === fornecedorListaId)
        : (fornecedoresJuridicos || []);
  const idsFornecedoresVisiveis = fornecedoresVisiveis.map((f: any) => f.id);
  const itensComPreco = itensDaLista;
  const itensFiltrados = useMemo(() => {
    const termo = String(buscaCotacao || '').toLowerCase().trim();
    if (!termo) return itensComPreco;
    return itensComPreco.filter((item: any) => String(item?.produto || '').toLowerCase().includes(termo));
  }, [itensComPreco, buscaCotacao]);
  const menorItem = (item: any) => calcularMenorPrecoItem(item, idsFornecedoresVisiveis);
  const totaisVisiveis = fornecedoresVisiveis.map((f: any) => {
    let totalR$ = 0;
    itensComPreco.forEach((item: any) => {
      const quantidade = qtdPedirNumero(item);
      if (quantidade <= 0) return;
      if (listaCotacao === 'embalagens') {
        totalR$ += precoNumero((item.precos || {})[f.id]) * quantidade;
        return;
      }
      const { menorPreco, vencedorFornId } = menorItem(item);
      if (vencedorFornId === f.id && menorPreco != null) totalR$ += menorPreco * quantidade;
    });
    return { fornecedor: f, totalR$ };
  });
  const totalVisivel = listaCotacao === 'embalagens'
    ? itensComPreco.reduce((total: number, item: any) => {
        const quantidade = qtdPedirNumero(item);
        if (quantidade <= 0) return total;
        const { menorPreco } = menorItem(item);
        return total + (menorPreco || 0) * quantidade;
      }, 0)
    : totaisVisiveis.reduce((a: number, b: any) => a + b.totalR$, 0);
  const escopoSalvarPedido = {
    itens: itensComPreco,
    fornecedores: fornecedoresVisiveis,
    somenteFornecedores: idsFornecedoresVisiveis,
    enviarConferencia: listaCotacao === 'embalagens'
  };
  const adicionarFornecedorEmb = (id: string) => {
    const escolhido = String(id || novoEmbId || '').trim();
    if (!escolhido || !idsCadastro.includes(escolhido)) return;
    setFornecedoresEmb(atuais => atuais.includes(escolhido) ? atuais : [...atuais, escolhido]);
    setNovoEmbId('');
  };
  const removerFornecedorEmb = (id: string) => {
    setFornecedoresEmb(atuais => atuais.filter(atual => atual !== id));
  };
  const classeAbaInterna = (ativa: boolean) =>
    `cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold tracking-wide transition ${
      ativa ? 'bg-teal-700 text-white shadow-sm shadow-teal-900/20' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
    }`;
  const campo = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15';
  const campoTabela = 'h-8 w-[58px] rounded-md border border-slate-200 bg-white text-center text-xs font-semibold text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';
  return (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 sm:p-6">
              <button type="button" onClick={() => setTabAtiva('compras')} className="mb-4 cursor-pointer rounded-lg bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-white">← Voltar para Compras</button>
              <div className="mb-1">
                <p className="m-0 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">Compras</p>
                <h2 className="m-0 text-xl font-black tracking-tight text-slate-900">Pedido de compra</h2>
              </div>
              <div className="mb-5 mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => setAbaPedido('listas')} className={classeAbaInterna(abaPedido === 'listas')}>Listas · {nomeListaAtual}</button>
                <button type="button" onClick={() => setAbaPedido('precos')} className={classeAbaInterna(abaPedido === 'precos')}>Cotação de preço</button>
                <button type="button" onClick={() => setAbaPedido('registro')} className={classeAbaInterna(abaPedido === 'registro')}>Registro por fornecedor</button>
                <button type="button" onClick={() => setAbaPedido('salvos')} className={classeAbaInterna(abaPedido === 'salvos')}>Pedidos salvos ({(pedidosAindaNaCotacao || []).length})</button>
                <button type="button" onClick={() => setAbaPedido('bonificacao')} className={classeAbaInterna(abaPedido === 'bonificacao')}>Bonificação</button>
              </div>
              {abaPedido === 'listas' && (
                <div className="mb-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="mb-3 mt-0 text-sm font-semibold text-slate-600">Escolha a lista. A cotação abre só com ela.</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => escolherLista('listaCompleta')} className={classeAbaInterna(listaCotacao === 'listaCompleta')}>Lista completa</button>
                    <button type="button" onClick={() => escolherLista('geral')} className={classeAbaInterna(listaCotacao === 'geral')}>Lista geral</button>
                    <button type="button" onClick={() => escolherLista('embalagens')} className={classeAbaInterna(listaCotacao === 'embalagens')}>Embalagens</button>
                    <button type="button" onClick={() => escolherLista('laticinios')} className={classeAbaInterna(listaCotacao === 'laticinios')}>Laticínios</button>
                    {SECOES_COTACAO_EXTRAS.map(secao => (
                      <button key={secao} type="button" onClick={() => escolherLista(secao)} className={classeAbaInterna(listaCotacao === secao)}>
                        {secao === 'Matéria prima' ? 'Matéria-prima' : secao}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {abaPedido === 'precos' && listaCotacao === 'laticinios' && (
                <div className="mb-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setFornecedorLaticinio('todos')} className={classeAbaInterna(fornecedorLaticinio === 'todos')}>Todos os laticínios</button>
                  {FORNECEDORES_LATICINIOS.map(fornecedor => (
                    <button key={fornecedor.id} type="button" onClick={() => setFornecedorLaticinio(fornecedor.id)} className={classeAbaInterna(fornecedorLaticinio === fornecedor.id)}>
                      {fornecedor.nome}
                    </button>
                  ))}
                </div>
              )}
              {abaPedido === 'precos' && categoriasDaLista.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setFiltroCategoria('todos')} className={classeAbaInterna(filtroCategoria === 'todos')}>Todas</button>
                  {categoriasDaLista.map(nome => (
                    <button key={nome} type="button" onClick={() => setFiltroCategoria(nome)} className={classeAbaInterna(filtroCategoria === nome)}>{nome}</button>
                  ))}
                </div>
              )}

              {abaPedido === 'precos' && listaCotacao === 'listaCompleta' && (
                <CotacaoListaCompleta
                  fornecedores={fornecedoresJuridicos}
                  fornecedorId={fornecedorListaId}
                  setFornecedorId={setFornecedorListaId}
                  itens={itensDaLista}
                  incluir={incluirProdutoEstoqueNaCotacao}
                  retirar={retirarProdutoEstoqueDaCotacao}
                  atualizarCampoCotacao={atualizarCampoCotacao}
                  atualizarPrecoCotacao={atualizarPrecoCotacao}
                  adicionarFornecedorCotacao={adicionarFornecedorCotacao}
                  novoFornecedorNome={novoFornecedorNome}
                  setNovoFornecedorNome={setNovoFornecedorNome}
                  qtdPedirNumero={qtdPedirNumero}
                  salvarPedidoFornecedor={salvarPedidoFornecedor}
                  imprimirPedidoIndividual={imprimirPedidoIndividual}
                  setAlerta={setAlerta}
                />
              )}

              {abaPedido === 'precos' && listaCotacao !== 'listaCompleta' && (
              <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                  <p className="m-0 text-sm font-semibold text-slate-600">
                    {listaCotacao === 'embalagens'
                      ? 'Primeiro estoque e quantidade. Depois adicione um ou mais fornecedores com CNPJ.'
                      : listaCotacao === 'laticinios'
                        ? 'Lista só de laticínios. Estoque e quantidade primeiro, depois o preço do fornecedor.'
                        : (SECOES_COTACAO_EXTRAS as readonly string[]).includes(listaCotacao)
                          ? `Lista só de ${listaCotacao === 'Matéria prima' ? 'matéria-prima' : listaCotacao.toLowerCase()}.`
                          : 'Compare preços e monte o pedido'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                  <input type="text" placeholder="Buscar produto..." value={buscaCotacao} onChange={e => setBuscaCotacao(e.target.value)} className={`${campo} min-w-[180px]`} />
                  <button type="button" onClick={() => escolherLista('listaCompleta')} className="cursor-pointer rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white hover:bg-teal-600">Lista completa</button>
                  <button type="button" onClick={() => setMostrarModalImportacao(true)} className="cursor-pointer rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800">Importar lote</button>
                  <button type="button" onClick={limparCotacoesPrecos} className="cursor-pointer rounded-lg bg-white px-3 py-2 text-xs font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50">Zerar</button>
                  <button type="button" onClick={imprimirRelatorioCotacao} className="cursor-pointer rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white hover:bg-teal-600">Imprimir</button>
                  </div>
              </div>

              {listaCotacao === 'geral' && (
              <div className="grid gap-3 lg:grid-cols-2">
              <div className="flex flex-wrap items-end gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Novo produto
                  <input placeholder="Nome do produto" value={novoProdutoCadastro?.nome || ''} onChange={event => setNovoProdutoCadastro({ ...novoProdutoCadastro, nome: event.target.value })} onKeyDown={event => event.key === 'Enter' && cadastrarProduto()} className={campo} />
                </label>
                <label className="flex w-20 flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Un
                  <input placeholder="Kg" value={novoProdutoCadastro?.unidade ?? ''} onChange={event => setNovoProdutoCadastro({ ...novoProdutoCadastro, unidade: event.target.value })} className={`${campo} text-center`} />
                </label>
                <button type="button" onClick={cadastrarProduto} className="cursor-pointer rounded-lg bg-teal-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-teal-600">Adicionar produto</button>
              </div>

              <div className="flex flex-wrap items-end gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Novo fornecedor
                  <input placeholder="Nome do fornecedor" value={novoFornecedorNome} onChange={event => setNovoFornecedorNome(event.target.value)} onKeyDown={event => event.key === 'Enter' && adicionarFornecedorCotacao()} className={campo} />
                </label>
                <button type="button" onClick={adicionarFornecedorCotacao} className="cursor-pointer rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800">Adicionar fornecedor</button>
              </div>
              </div>
              )}
              {listaCotacao === 'embalagens' && (
                <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <div className="flex flex-wrap items-end gap-2">
                    <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Adicionar fornecedor
                      <select
                        value={novoEmbId}
                        onChange={e => setNovoEmbId(e.target.value)}
                        className={campo}
                      >
                        <option value="">Selecione o fornecedor</option>
                        {fornecedoresEmbDisponiveis.map((f: any) => (
                          <option key={f.id} value={f.id}>{f.nomeFantasia || f.nome || f.razaoSocial}</option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      onClick={() => adicionarFornecedorEmb(novoEmbId)}
                      disabled={!novoEmbId}
                      className="cursor-pointer rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Adicionar fornecedor
                    </button>
                  </div>
                  {idsEmbEscolhidos.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {idsEmbEscolhidos.map(id => {
                        const fornecedor = fornecedoresJuridicos.find((f: any) => f.id === id);
                        return (
                          <span key={id} className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 ring-1 ring-slate-200">
                            {fornecedor ? nomeFornecedor(fornecedor) : id}
                            <button type="button" onClick={() => removerFornecedorEmb(id)} className="cursor-pointer border-0 bg-transparent p-0 text-rose-500 hover:text-rose-700" title="Remover fornecedor">✕</button>
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="m-0 text-[12px] font-medium text-slate-500">Nenhum fornecedor nesta cotação ainda. Adicione um ou mais.</p>
                  )}
                </div>
              )}

              <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200" style={{ maxHeight: '500px' }}>
                <table className="w-max min-w-full border-separate border-spacing-0 text-[11px]">
                  <thead className="sticky top-0 z-[6]">
                    <tr>
                      <th className="sticky left-0 z-[7] bg-slate-900 px-3 py-2.5 text-left font-bold text-white" style={{ minWidth: '200px' }}>Produto</th>
                      {listaSecao ? (
                        <>
                          <th className="sticky z-[7] bg-slate-900 px-2 py-2.5 font-bold text-white" style={{ left: 200, minWidth: '44px' }}>Un</th>
                          <th className="sticky z-[7] bg-slate-900 px-2 py-2.5 font-bold text-white" style={{ left: 244, minWidth: '58px' }}>Estoque</th>
                          <th className="sticky z-[7] bg-slate-900 px-2 py-2.5 font-bold text-white" style={{ left: 302, minWidth: '78px' }}>Qtd sug.</th>
                          <th className="sticky z-[7] bg-slate-900 px-2 py-2.5 font-bold text-white shadow-[4px_0_8px_rgba(15,23,42,0.18)]" style={{ left: 380, minWidth: '58px' }}>Pedir</th>
                        </>
                      ) : (
                        <>
                          <th className="sticky z-[7] bg-slate-900 px-2 py-2.5 font-bold text-white" style={{ left: 200, minWidth: '78px' }}>Qtd sug.</th>
                          <th className="sticky z-[7] bg-slate-900 px-2 py-2.5 font-bold text-white" style={{ left: 278, minWidth: '44px' }}>Un</th>
                          <th className="sticky z-[7] bg-slate-900 px-2 py-2.5 font-bold text-white" style={{ left: 322, minWidth: '58px' }}>Estoque</th>
                          <th className="sticky z-[7] bg-slate-900 px-2 py-2.5 font-bold text-white shadow-[4px_0_8px_rgba(15,23,42,0.18)]" style={{ left: 380, minWidth: '58px' }}>Pedir</th>
                        </>
                      )}
                    {fornecedoresVisiveis.map((f: any, colIdx: number) => (
                          <th key={(f?.id || 'forn') + colIdx} className="min-w-[130px] bg-slate-900 px-1.5 py-1.5 align-middle font-bold text-white">
                            {listaSecao ? (
                              <span>{f?.nomeFantasia || f?.nome || f?.razaoSocial}</span>
                            ) : (
                            <div className="flex items-center justify-center gap-1">
                              <select
                                value={f?.id || ''}
                                onChange={(e) => {
                                  const novoId = e.target.value;
                                  const novoForn = fornecedoresJuridicos.find((item: any) => item?.id === novoId);
                                  if (!novoForn) return;
                                  setFornecedoresCotacao((prev: any[]) => {
                                    const novos = [...prev];
                                    const indiceReal = (prev || []).findIndex((item: any) => item?.id === f?.id);
                                    if (indiceReal < 0) return prev;
                                    novos[indiceReal] = novoForn;
                                    return novos;
                                  });
                                }}
                                className="max-w-[110px] cursor-pointer rounded-md border border-slate-600 bg-slate-800 px-1.5 py-1 text-center text-[11px] font-bold text-teal-200 outline-none focus:ring-2 focus:ring-teal-500/40"
                                title="Clique para trocar o fornecedor desta coluna"
                              >
                                {(fornecedoresJuridicos || []).map((forn: any) => (
                                  <option key={forn?.id} value={forn?.id}>
                                    {forn?.nomeFantasia || forn?.nome || forn?.razaoSocial || 'Sem nome'}
                                  </option>
                                ))}
                              </select>

                              <button
                                type="button"
                                onClick={() => {
                                  if (fornecedoresJuridicos.length <= 1) {
                                    alert("A cotação precisa de ao menos um fornecedor.");
                                    return;
                                  }
                                  setFornecedoresCotacao((prev: any[]) => prev.filter((item: any) => item?.id !== f?.id));
                                }}
                                className="cursor-pointer border-0 bg-transparent px-0.5 text-[11px] font-bold text-rose-400 hover:text-rose-300"
                                title="Remover esta coluna"
                              >
                                ✕
                              </button>
                            </div>
                            )}
                          </th>
                        ))}
                      <th className="bg-slate-900 px-3 py-2.5 font-bold text-white">Menor</th>
                      <th className="bg-slate-900 px-3 py-2.5 font-bold text-white">Último preço</th>
                      <th className="bg-slate-900 px-3 py-2.5 font-bold text-white">Vencedor</th>
                      {listaCotacao === 'geral' && <th className="bg-slate-900 px-3 py-2.5 font-bold text-white">✕</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {itensFiltrados.map((item: any, idx: number) => {
                      const { menorPreco, vencedorFornId } = menorItem(item);
                      const vencedor = fornecedoresVisiveis.find((f: any) => f.id === vencedorFornId);
                      const zebra = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50';
                      return (
                        <tr key={item.id} className={`border-b border-slate-100 ${zebra}`}>
                          <td className={`sticky left-0 z-[2] max-w-[200px] min-w-[200px] px-3 py-2 font-bold text-slate-900 ${zebra}`}>{item.produto}</td>
                          {listaSecao ? (
                            <>
                              <td className={`sticky z-[2] min-w-[44px] px-2 py-2 text-center text-slate-600 ${zebra}`} style={{ left: 200 }}>{item.unit}</td>
                              <td className={`sticky z-[2] min-w-[58px] px-1 py-1 text-center ${zebra}`} style={{ left: 244 }}><input type="text" value={item.estoqueAtual} onChange={e => atualizarCampoCotacao(item.id, 'estoqueAtual', e.target.value)} className={campoTabela} /></td>
                              <td className={`sticky z-[2] min-w-[78px] px-1 py-1 text-center ${zebra}`} style={{ left: 302 }}><input type="text" value={item.qtdSugerida || ''} onChange={e => atualizarCampoCotacao(item.id, 'qtdSugerida', e.target.value)} className={campoTabela} /></td>
                              <td className={`sticky z-[2] min-w-[58px] px-1 py-1 text-center shadow-[4px_0_8px_rgba(15,23,42,0.12)] ${zebra}`} style={{ left: 380 }}><input type="text" value={item.qtdPedir} onChange={e => atualizarCampoCotacao(item.id, 'qtdPedir', e.target.value)} className={campoTabela} /></td>
                            </>
                          ) : (
                            <>
                              <td className={`sticky z-[2] min-w-[78px] px-1 py-1 text-center ${zebra}`} style={{ left: 200 }}><input type="text" value={item.qtdSugerida || ''} onChange={e => atualizarCampoCotacao(item.id, 'qtdSugerida', e.target.value)} className={campoTabela} /></td>
                              <td className={`sticky z-[2] min-w-[44px] px-2 py-2 text-center text-slate-600 ${zebra}`} style={{ left: 278 }}>{item.unit}</td>
                              <td className={`sticky z-[2] min-w-[58px] px-1 py-1 text-center ${zebra}`} style={{ left: 322 }}><input type="text" value={item.estoqueAtual} onChange={e => atualizarCampoCotacao(item.id, 'estoqueAtual', e.target.value)} className={campoTabela} /></td>
                              <td className={`sticky z-[2] min-w-[58px] px-1 py-1 text-center shadow-[4px_0_8px_rgba(15,23,42,0.12)] ${zebra}`} style={{ left: 380 }}><input type="text" value={item.qtdPedir} onChange={e => atualizarCampoCotacao(item.id, 'qtdPedir', e.target.value)} className={campoTabela} /></td>
                            </>
                          )}
                          {fornecedoresVisiveis.map((f: any) => {
                            const preco = (item.precos || {})[f.id] || '';
                            const isMenor = f.id === vencedorFornId && preco !== '';
                            return (
                              <td key={f.id} className={`px-1 py-1 text-center ${isMenor ? 'bg-teal-50' : ''}`}>
                                <input type="text" value={preco} onChange={e => atualizarPrecoCotacao(item.id, f.id, e.target.value)} className={isMenor ? 'h-8 w-[70px] rounded-md border-0 bg-teal-700 text-center text-xs font-bold text-white outline-none' : 'h-8 w-[70px] rounded-md border border-slate-200 bg-white text-center text-xs font-semibold text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'} />
                              </td>
                            );
                          })}
                          <td className="px-2 py-2 text-center font-bold text-teal-700">{menorPreco ? `R$ ${menorPreco.toFixed(2)}` : '-'}</td>
                          <td className="px-2 py-2 text-center font-bold text-slate-500">{item.ultimoPrecoCompra ? `R$ ${Number(item.ultimoPrecoCompra).toFixed(2)}` : '-'}</td>
                          <td className="px-2 py-2 text-center font-semibold text-slate-800">{vencedor ? (vencedor.nomeFantasia || vencedor.nome) : '-'}</td>
                          {listaCotacao === 'geral' && (
                            <td className="px-2 py-2 text-center"><button type="button" onClick={() => removerItemCotacao(item.id)} className="cursor-pointer border-0 bg-transparent font-bold text-rose-500 hover:text-rose-700">✕</button></td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3 rounded-2xl bg-teal-50 px-4 py-3 text-base font-black text-teal-900 ring-1 ring-teal-100">
                <span>Total geral: R$ {Number(totalVisivel || 0).toFixed(2)}</span>
                {listaCotacao === 'embalagens' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (salvarRelatorioPedidoCotacao(escopoSalvarPedido)) setAlerta({ tipo: 'sucesso', msg: '✓ Pedido enviado para a Conferência.' });
                      else setAlerta({ tipo: 'erro', msg: '⚠️ Preencha uma quantidade em Pedir antes de salvar.' });
                    }}
                    className="cursor-pointer rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white hover:bg-teal-600"
                  >
                    Salvar e enviar para Conferência
                  </button>
                )}
              </div>
              </div>
              )}

              {abaPedido === 'registro' && (
                <div style={{ width: '100%', boxSizing: 'border-box', padding: '22px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', color: '#0f172a' }}>Registro de pedidos por fornecedor</h3>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{listaCotacao === 'embalagens' ? 'Ao salvar a lista de embalagens, o pedido vai direto para a Conferência.' : 'Ao salvar, o pedido sai daqui e fica em Pedidos salvos. A tela não muda.'}</p>
                    </div>
                    <button onClick={imprimirRelatorioPedidosPorVendedor} style={{ backgroundColor: '#475569', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Imprimir relatório</button>
                  </div>
                  <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
                    {fornecedoresVisiveis.map((fornecedor: any, indice: number) => {
                      const itensDoFornecedor = itensComPreco.filter((item: any) => {
                        const quantidade = qtdPedirNumero(item);
                        return quantidade > 0 && menorItem(item).vencedorFornId === fornecedor.id;
                      });
                      if (itensDoFornecedor.length === 0) return null;
                      const totalPedido = itensDoFornecedor.reduce((total: number, item: any) => {
                        const { menorPreco } = menorItem(item);
                        return total + (menorPreco || 0) * qtdPedirNumero(item);
                      }, 0);
                      return (
                        <div key={`${fornecedor.id}-${indice}`} style={{ marginBottom: '16px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '8px 12px', backgroundColor: '#0f172a' }}>
                            <h4 style={{ margin: 0, color: '#ffffff', fontSize: '13px' }}>{nomeFornecedor(fornecedor)} • R$ {totalPedido.toFixed(2)}</h4>
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <button type="button" onClick={() => {
                                salvarPedidoFornecedor(fornecedor, itensDoFornecedor, { somenteFornecedores: idsFornecedoresVisiveis, enviarConferencia: listaCotacao === 'embalagens' });
                              }} style={{ backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '5px 9px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>💾 Salvar pedido</button>
                              <button onClick={() => imprimirPedidoIndividual(fornecedor, itensDoFornecedor)} style={{ backgroundColor: '#ffffff', color: '#0f172a', border: 'none', borderRadius: '4px', padding: '5px 9px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Imprimir pedido</button>
                              <button onClick={() => enviarPedidoWhatsAppPdf(fornecedor, itensDoFornecedor)} style={{ backgroundColor: '#25d366', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '5px 9px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>WhatsApp PDF</button>
                            </div>
                          </div>
                          {itensDoFornecedor.map(item => (
                            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px', gap: '8px', padding: '9px 12px', borderBottom: '1px solid #e2e8f0', fontSize: '12px' }}>
                              <span>{item.produto}</span>
                              <span>{item.unit}</span>
                              <strong style={{ textAlign: 'right' }}>{item.qtdPedir}</strong>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                  {(() => {
                    const itensAguardandoPreco = itensComPreco.filter((item: any) => qtdPedirNumero(item) > 0 && !menorItem(item).vencedorFornId);
                    return itensAguardandoPreco.length > 0 ? (
                      <div style={{ marginBottom: '16px', backgroundColor: '#ffffff', border: '1px solid #fed7aa', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ padding: '9px 12px', backgroundColor: '#fff7ed', color: '#9a3412', fontWeight: 'bold', fontSize: '13px' }}>Aguardando definição do menor preço</div>
                        {itensAguardandoPreco.map(item => (
                          <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px', gap: '8px', padding: '9px 12px', borderBottom: '1px solid #ffedd5', fontSize: '12px' }}>
                            <span>{item.produto}</span>
                            <span>{item.unit}</span>
                            <strong style={{ textAlign: 'right' }}>{item.qtdPedir}</strong>
                          </div>
                        ))}
                      </div>
                    ) : null;
                  })()}
                  { fornecedoresVisiveis.every((fornecedor: any) => !itensComPreco.some((item: any) => qtdPedirNumero(item) > 0 && menorItem(item).vencedorFornId === fornecedor.id)) && itensComPreco.every((item: any) => qtdPedirNumero(item) <= 0) && (
                    <div style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '6px', fontSize: '12px', color: '#475569' }}>
                      Nenhum produto possui quantidade preenchida na coluna Pedir.
                    </div>
                  )}
                </div>
              )}

              {abaPedido === 'salvos' && (
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '12px', color: '#0f172a' }}>📁 Pedidos salvos</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{(pedidosAindaNaCotacao || []).length} pedido(s) na Cotação. Preencha Pedir na cotação e use “Incluir itens da cotação” no pedido, sem passar de novo pelo registro.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => { if (salvarRelatorioPedidoCotacao(escopoSalvarPedido)) { setAlerta({ tipo: 'sucesso', msg: listaCotacao === 'embalagens' ? '✓ Pedido enviado para a Conferência.' : '✓ Pedidos salvos. A tela não mudou.' }); } else setAlerta({ tipo: 'erro', msg: '⚠️ Preencha uma quantidade em Pedir antes de salvar.' }); }} style={{ backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>💾 Salvar pedido</button>
                  </div>
                </div>

                <div style={{ width: '100%', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {(pedidosAindaNaCotacao || []).length === 0 ? (
          <span style={{ fontSize: '11px', color: '#64748b' }}>Nenhum pedido salvo na Cotação. Os que foram para a Conferência já saíram desta lista.</span>
        ) : (
          (pedidosAindaNaCotacao || []).map(relatorio => {
            const nomePedido = relatorio.itens?.find((item: any) => !item.bonificado)?.fornecedor || relatorio.itens?.[0]?.fornecedor || '';
            const fornecedorPedido = (fornecedoresCotacao || []).find((candidato: any) =>
              [candidato.nomeFantasia, candidato.nome, candidato.razaoSocial]
                .some((valor: any) => valor && String(valor).trim().toLowerCase() === String(nomePedido).trim().toLowerCase())
            );
            const itensParaIncluir = fornecedorPedido
              ? (itensCotacao || []).filter((item: any) => {
                  if (qtdPedirNumero(item) <= 0) return false;
                  const { vencedorFornId } = calcularMenorPrecoItem(item);
                  return vencedorFornId === fornecedorPedido.id || item.fornecedorId === fornecedorPedido.id;
                })
              : [];
            return (
            <section key={relatorio.id} style={{ width: '100%', boxSizing: 'border-box', border: '2px solid #2563eb', borderRadius: '6px', padding: '14px', backgroundColor: '#ffffff', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', backgroundColor: '#eff6ff', borderBottom: '1px solid #bfdbfe', margin: '-14px -14px 10px', padding: '10px 14px' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: '#1e3a8a' }}>Pedido: {relatorio.itens[0]?.fornecedor || 'Fornecedor não informado'}</strong>
                  <span style={{ fontSize: '11px', color: '#475569' }}>{relatorio.data} • {relatorio.itens.length} item(ns) • Total: R$ {relatorio.totalGeral.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => incluirItensNoPedidoSalvo(relatorio.id)} style={{ backgroundColor: '#1d4ed8', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '5px 8px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Incluir itens da cotação{itensParaIncluir.length ? ` (${itensParaIncluir.length})` : ''}</button>
                  <button onClick={() => marcarPedidoSalvoNaConferencia(relatorio)} style={{ backgroundColor: '#0f766e', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '5px 8px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Salvo na conferência</button>
                  <button onClick={() => excluirRelatorioPedidoCotacao(relatorio.id)} style={{ color: '#0f766e', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '4px', padding: '5px 8px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Excluir pedido</button>
                </div>
              </div>
              {itensParaIncluir.length > 0 && (
                <div style={{ marginBottom: '8px', padding: '8px 10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px' }}>
                  <strong style={{ display: 'block', fontSize: '10px', color: '#1e3a8a', marginBottom: '4px' }}>Prontos na cotação para incluir neste pedido</strong>
                  {itensParaIncluir.map((item: any) => (
                    <span key={`${relatorio.id}-pend-${item.id}`} style={{ display: 'block', fontSize: '11px', color: '#334155' }}>{item.produto} · {item.qtdPedir} {item.unit}</span>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '7px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {Object.entries(relatorio.itens.reduce((grupos: any, item: any) => { (grupos[item.fornecedor] ||= []).push(item); return grupos; }, {})).map(([fornecedor, itensFornecedor]: [string, any]) => (
                  <div key={`${relatorio.id}-${fornecedor}`} style={{ borderTop: '1px solid #cbd5e1', paddingTop: '5px' }}>
                    <strong style={{ display: 'block', fontSize: '10px', color: '#334155' }}>{fornecedor}</strong>
                    {itensFornecedor.map((item, indice) => (
                      <div key={`${relatorio.id}-${fornecedor}-${indice}`} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 90px', gap: '6px', fontSize: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
                   <span>{item.produto}</span>
                        <strong>{item.quantidade} {item.unit}</strong>
                        <span style={{ textAlign: 'right' }}>R$ {item.valorTotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          );
          })
        )}

                    {(() => {
                      const diaAtual = getDiaSemanaAtual();
                      const fornecedoresPrevistosHoje = (fornecedoresCotacao || []).filter(f => verificaEntregaHoje(f.diasEntrega));
                      const pedidosParaHoje = (relatoriosPedidosCotacao || []).filter(rel => {
                        const nomeForn = rel.itens[0]?.fornecedor;
                        const fornObj = (fornecedoresCotacao || []).find(f => (f.nomeFantasia || f.nome) === nomeForn || f.razaoSocial === nomeForn);
                        return fornObj ? verificaEntregaHoje(fornObj.diasEntrega) : false;
                      });

                      return (
                        <div style={{ backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '8px', padding: '16px 18px', border: '1px solid #334155' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                            <div>
                              <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', textTransform: 'uppercase' }}>📅 Central de Recebimento</span>
                              <h3 style={{ margin: '2px 0 0', fontSize: '16px', color: '#f8fafc' }}>
                                Hoje é <strong>{diaAtual}</strong> • <span style={{ color: '#4ade80' }}>{fornecedoresPrevistosHoje.length} fornecedor(es)</span> com rota hoje
                              </h3>
                            </div>
                            <div style={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px', padding: '6px 12px', textAlign: 'center' }}>
                              <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Previsão de Cargas</span>
                              <strong style={{ fontSize: '15px', color: '#38bdf8' }}>{fornecedoresPrevistosHoje.length} entregas</strong>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {fornecedoresPrevistosHoje.length === 0 ? (
                              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Nenhum fornecedor cadastrado com rota de entrega para {diaAtual}.</span>
                            ) : (
                              fornecedoresPrevistosHoje.map(f => {
                                const temPedidoPendente = pedidosParaHoje.some(p => {
                                  const nomeForn = p.itens[0]?.fornecedor;
                                  return (f.nomeFantasia || f.nome) === nomeForn;
                                });

                                return (
                                  <div key={f.id} style={{ backgroundColor: '#1e293b', border: temPedidoPendente ? '1px solid #22c55e' : '1px solid #475569', borderRadius: '6px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '13px' }}>🚚</span>
                                    <div>
                                      <strong style={{ fontSize: '12px', color: '#f8fafc', display: 'block' }}>{f.nomeFantasia || f.nome}</strong>
                                      <span style={{ fontSize: '10px', color: temPedidoPendente ? '#4ade80' : '#94a3b8' }}>
                                        {temPedidoPendente ? '● Pedido aberto p/ conferir' : 'Rota hoje'}
                                      </span>
                                    </div>
                                    {f.contato && (
                                      <a
                                        href={`https://wa.me/55${f.contato.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ backgroundColor: '#16a34a', color: '#ffffff', textDecoration: 'none', borderRadius: '4px', padding: '3px 6px', fontSize: '10px', fontWeight: 'bold' }}
                                        title="Chamar no WhatsApp"
                                      >
                                        💬 Whats
                                      </a>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })()}
                </div>
              </div>
              )}

              {abaPedido === 'bonificacao' && (() => {
                const pedidosAlvo = [...(pedidosPendentesConferencia || []), ...(pedidosAindaNaCotacao || [])]
                  .filter((pedido: any, indice: number, lista: any[]) => lista.findIndex(item => item.id === pedido.id) === indice);
                const pedidosDoFornecedor = bonificacao.fornecedor
                  ? pedidosAlvo.filter((pedido: any) => (pedido.itens || []).some((item: any) => String(item.fornecedor || '').toLowerCase() === bonificacao.fornecedor.toLowerCase()))
                  : pedidosAlvo;
                const nomesProdutos = Array.from(new Set((itensCotacao || []).map((item: any) => String(item.produto || '').trim()).filter(Boolean)));
                return (
                  <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                    <div className="bg-slate-900 px-4 py-3 text-white">
                      <p className="m-0 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-200">Pedido bonificado</p>
                      <p className="m-0 text-base font-black">Bonificação</p>
                      <p className="m-0 text-[11px] font-semibold text-slate-300">Informe o produto, o valor e em qual pedido pendente o brinde vai chegar. O valor da compra não muda.</p>
                    </div>
                    <div className="grid gap-3 p-4 sm:grid-cols-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-slate-600">Fornecedor</span>
                        <select value={bonificacao.fornecedor} onChange={e => setBonificacao(atual => ({ ...atual, fornecedor: e.target.value, pedidoId: '' }))} className={campo}>
                          <option value="">Selecione o fornecedor</option>
                          {(fornecedoresCotacao || []).map((fornecedor: any) => (
                            <option key={fornecedor.id} value={fornecedor.nomeFantasia || fornecedor.nome}>{fornecedor.nomeFantasia || fornecedor.nome}</option>
                          ))}
                        </select>
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-slate-600">Produto</span>
                        <input list="produtos-bonificacao" value={bonificacao.produto} onChange={e => setBonificacao(atual => ({ ...atual, produto: e.target.value }))} placeholder="Nome do produto" className={campo} />
                        <datalist id="produtos-bonificacao">
                          {nomesProdutos.map(nome => <option key={nome} value={nome} />)}
                        </datalist>
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-slate-600">Quantidade</span>
                        <input value={bonificacao.quantidade} onChange={e => setBonificacao(atual => ({ ...atual, quantidade: e.target.value }))} className={campo} />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-slate-600">Unidade</span>
                        <input value={bonificacao.unit} onChange={e => setBonificacao(atual => ({ ...atual, unit: e.target.value }))} className={campo} />
                      </label>
                      <label className="flex flex-col gap-1 sm:col-span-2">
                        <span className="text-[11px] font-bold text-slate-600">Valor do produto (R$)</span>
                        <input value={bonificacao.valor} onChange={e => setBonificacao(atual => ({ ...atual, valor: e.target.value }))} placeholder="0,00" className={campo} />
                      </label>
                      <label className="flex flex-col gap-1 sm:col-span-2">
                        <span className="text-[11px] font-bold text-slate-600">Vem junto com qual pedido pendente</span>
                        <select value={bonificacao.pedidoId} onChange={e => setBonificacao(atual => ({ ...atual, pedidoId: e.target.value }))} className={campo}>
                          <option value="">Selecione o pedido</option>
                          {pedidosDoFornecedor.map((pedido: any) => (
                            <option key={pedido.id} value={pedido.id}>
                              {(pedido.itens?.[0]?.fornecedor || 'Pedido')} · {pedido.data} · R$ {Number(pedido.totalGeral || 0).toFixed(2)} · {(pedido.itens || []).filter((item: any) => item.bonificado).length} bonificado(s)
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
                      <span className="text-[11px] text-slate-500">
                        {pedidosDoFornecedor.length === 0 ? 'Não há pedido pendente para este fornecedor. Salve o pedido primeiro.' : 'O valor do brinde fica na bonificação. O total da compra não muda.'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (adicionarBonificacaoNoPedido({ ...bonificacao })) {
                            setBonificacao(atual => ({ ...atual, produto: '', quantidade: '1', valor: '' }));
                          }
                        }}
                        className="cursor-pointer rounded-lg bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-600"
                      >
                        Salvar bonificação no pedido
                      </button>
                    </div>
                    {pedidosDoFornecedor.filter((pedido: any) => (pedido.itens || []).some((item: any) => item.bonificado)).map((pedido: any) => (
                      <div key={`bonus-${pedido.id}`} className="border-t border-amber-100 bg-amber-50 px-4 py-3">
                        <strong className="block text-[11px] font-black uppercase tracking-wide text-amber-900">Registro salvo · {(pedido.itens?.[0]?.fornecedor || 'Pedido')} · {pedido.data}</strong>
                        {(pedido.itens || []).map((item: any, indice: number) => item.bonificado ? (
                          <div key={`${pedido.id}-b-${indice}`} className="mt-2 flex items-center justify-between gap-2">
                            <p className="m-0 text-sm font-semibold text-amber-950">
                              {item.produto} · {item.quantidade} {item.unit} · R$ {Number(item.valorTotal || 0).toFixed(2)} · vem junto com este pedido pendente
                            </p>
                            <button
                              type="button"
                              onClick={() => removerBonificacaoDoPedido(pedido.id, indice)}
                              className="cursor-pointer rounded-md border border-red-200 bg-white px-2 py-1 text-[10px] font-bold text-red-700 hover:bg-red-50"
                            >
                              Excluir
                            </button>
                          </div>
                        ) : null)}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </section>
  );
}
