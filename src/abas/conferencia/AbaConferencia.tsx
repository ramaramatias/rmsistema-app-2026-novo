import { useState } from 'react';
import { diferencaValorConferencia, rotuloTipoDivergencia } from '../../tipos';

const campo = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15';
const botaoPrimario = 'cursor-pointer rounded-lg bg-teal-700 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-teal-600';
const botaoSecundario = 'cursor-pointer rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50';
const botaoPerigo = 'cursor-pointer rounded-lg bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100';

type ItemPedidoAvulso = { id: string; produto: string; unit: string; quantidade: string; valorUnitario: string };

const itemPedidoVazio = (): ItemPedidoAvulso => ({
  id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  produto: '',
  unit: 'Kg',
  quantidade: '',
  valorUnitario: ''
});

const numeroCampo = (valor: string) => parseFloat(String(valor || '').replace(',', '.')) || 0;

function SeloDiferencaValor({ recebido, esperado, destaque = false }: { recebido?: number; esperado?: number; destaque?: boolean }) {
  const diferenca = diferencaValorConferencia(recebido, esperado);
  if (!diferenca) return null;
  const classe = diferenca.tipo === 'mais'
    ? 'bg-amber-100 text-amber-900 ring-amber-200'
    : diferenca.tipo === 'menos'
      ? 'bg-rose-100 text-rose-800 ring-rose-200'
      : 'bg-teal-100 text-teal-800 ring-teal-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${classe} ${destaque ? 'text-[11px]' : ''}`}>
      {diferenca.rotulo}
    </span>
  );
}

const opcoesDivergencia = (
  <>
    <option value="">Sem divergência</option>
    <option value="valor_mais">Valor a mais</option>
    <option value="valor_menos">Valor a menos</option>
    <option value="produto">Produto</option>
    <option value="envio_indevido">Envio indevido</option>
    <option value="kg_mais">Quilo a mais</option>
    <option value="kg_menos">Quilo a menos</option>
    <option value="quantidade">Quantidade</option>
  </>
);

export function AbaConferencia(p: {
  abaConferencia: any;
  adicionarConferencia: any;
  anexarPdfFornecedor: any;
  arquivoConferencia: any;
  atualizarConferenciaPedido: any;
  buscaFornecedorConferencia: any;
  conferencias: any;
  conferenciasFiltradas: any;
  conferenciasPorPedido: any;
  criarPedidoNaConferencia: any;
  divergenciasFiltradas: any;
  enviarPdfConferenciaCompartilhado: any;
  excluirConferencia: any;
  excluirPedidoNaConferencia: any;
  fornecedoresCotacao: any;
  importarBackupConferencia: any;
  imprimirRelatorioConferencia: any;
  novaConferencia: any;
  pedidosPendentesConferencia: any;
  pedidosPendentesFiltrados: any;
  pedidosPendentesTotal: any;
  pedidosRealizadosTotal: any;
  podeExcluirPedidoConferencia: any;
  relatoriosPedidosCotacao: any;
  removerPdfConferenciaCompartilhado: any;
  salvarConferenciaPedido: any;
  setAbaConferencia: any;
  setBuscaFornecedorConferencia: any;
  setNovaConferencia: any;
  setPdfFornecedorVisualizacao: any;
  setTabAtiva: any;
  visualizarPedidoLancadoPdf: any;
  visualizarPdfFornecedor: any;
}) {
  const {
    abaConferencia,
    adicionarConferencia,
    anexarPdfFornecedor,
    arquivoConferencia,
    atualizarConferenciaPedido,
    buscaFornecedorConferencia,
    conferencias,
    conferenciasFiltradas,
    conferenciasPorPedido,
    criarPedidoNaConferencia,
    divergenciasFiltradas,
    enviarPdfConferenciaCompartilhado,
    excluirConferencia,
    excluirPedidoNaConferencia,
    fornecedoresCotacao,
    importarBackupConferencia,
    imprimirRelatorioConferencia,
    novaConferencia,
    pedidosPendentesConferencia,
    pedidosPendentesFiltrados,
    pedidosPendentesTotal,
    pedidosRealizadosTotal,
    podeExcluirPedidoConferencia,
    relatoriosPedidosCotacao,
    removerPdfConferenciaCompartilhado,
    salvarConferenciaPedido,
    setAbaConferencia,
    setBuscaFornecedorConferencia,
    setNovaConferencia,
    setTabAtiva,
    visualizarPedidoLancadoPdf,
    visualizarPdfFornecedor
  } = p;

  const [pedidoAvulso, setPedidoAvulso] = useState({
    fornecedor: '',
    data: new Date().toISOString().split('T')[0],
    itens: [itemPedidoVazio()]
  });
  const [pdfPedidoAvulso, setPdfPedidoAvulso] = useState<{ nome: string; conteudo: string } | null>(null);

  const atualizarItemPedido = (id: string, campoNome: keyof ItemPedidoAvulso, valor: string) => {
    setPedidoAvulso(atual => ({
      ...atual,
      itens: atual.itens.map(item => item.id === id ? { ...item, [campoNome]: valor } : item)
    }));
  };

  const totalPedidoAvulso = pedidoAvulso.itens.reduce((total, item) => total + numeroCampo(item.quantidade) * numeroCampo(item.valorUnitario), 0);

  const salvarPedidoAvulso = () => {
    const ok = criarPedidoNaConferencia({
      fornecedor: pedidoAvulso.fornecedor,
      data: pedidoAvulso.data,
      itens: pedidoAvulso.itens.map(item => {
        const quantidade = numeroCampo(item.quantidade);
        const valorUnitario = numeroCampo(item.valorUnitario);
        return {
          produto: item.produto,
          unit: item.unit,
          quantidade: item.quantidade,
          valorUnitario,
          valorTotal: quantidade * valorUnitario
        };
      }),
      pdf: pdfPedidoAvulso || undefined
    });
    if (ok) {
      setPedidoAvulso({ fornecedor: '', data: new Date().toISOString().split('T')[0], itens: [itemPedidoVazio()] });
      setPdfPedidoAvulso(null);
    }
  };

  const lerPdfPedido = (arquivo?: File) => {
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => setPdfPedidoAvulso({ nome: arquivo.name, conteudo: String(leitor.result || '') });
    leitor.readAsDataURL(arquivo);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 sm:p-6">
      <button type="button" onClick={() => setTabAtiva('compras')} className="mb-4 cursor-pointer rounded-lg bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-white">← Voltar para Compras</button>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-2.5">
        <h2 className="m-0 text-lg font-black uppercase tracking-tight text-slate-900">Conferência de Pedidos</h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={enviarPdfConferenciaCompartilhado} className={arquivoConferencia ? botaoPrimario : 'cursor-pointer rounded-lg bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100'}>
            {arquivoConferencia ? 'Meu PDF enviado' : 'Enviar meu PDF'}
          </button>
          <label className={`${botaoSecundario} bg-slate-100`}>
            Importar Backup
            <input type="file" accept=".json" onChange={importarBackupConferencia} className="hidden" />
          </label>
          <button type="button" onClick={imprimirRelatorioConferencia} className="cursor-pointer rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-800">
            Imprimir Relatório
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-200">
        <label className="mb-1.5 block text-[11px] font-bold text-slate-600">Pesquisar fornecedor</label>
        <input
          type="text"
          value={buscaFornecedorConferencia}
          onChange={event => {
            setBuscaFornecedorConferencia(event.target.value);
            setAbaConferencia('pedidos');
          }}
          placeholder="Ex.: JFRIOS, Laredo, Minerva... mostra os pedidos abertos da empresa"
          className="w-full rounded-lg border-2 border-teal-600 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-teal-500/15"
        />
        {buscaFornecedorConferencia.trim() && (
          <span className="mt-1.5 block text-[11px] font-semibold text-teal-800">
            {pedidosPendentesFiltrados.length} pedido(s) aberto(s) de “{buscaFornecedorConferencia.trim()}”
          </span>
        )}
      </div>

      {arquivoConferencia && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl bg-teal-50 p-3.5 ring-1 ring-teal-200">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">📄</span>
            <div>
              <div className="text-sm font-bold text-teal-950">{arquivoConferencia.nome}</div>
              <div className="text-[10px] text-slate-500">Enviado em {arquivoConferencia.dataUpload} por {arquivoConferencia.uploadPor}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <a href={arquivoConferencia.conteudo} download={arquivoConferencia.nome} className={`${botaoPrimario} no-underline`}>Baixar PDF</a>
            <button type="button" onClick={() => window.open(arquivoConferencia.conteudo, '_blank')} className={botaoSecundario}>Visualizar</button>
            <button type="button" onClick={removerPdfConferenciaCompartilhado} className={botaoPerigo}>Remover</button>
          </div>
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl bg-sky-50 px-4 py-3 ring-1 ring-sky-100">
          <div className="text-[10px] font-bold uppercase tracking-wide text-sky-800">Pedidos gerados</div>
          <div className="mt-1 text-[22px] font-black text-sky-950">{pedidosRealizadosTotal}</div>
        </div>
        <div className="rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-100">
          <div className="text-[10px] font-bold uppercase tracking-wide text-amber-800">Aguardando conferência</div>
          <div className="mt-1 text-[22px] font-black text-amber-950">{pedidosPendentesTotal}</div>
        </div>
        <div className="rounded-2xl bg-teal-50 px-4 py-3 ring-1 ring-teal-100">
          <div className="text-[10px] font-bold uppercase tracking-wide text-teal-800">Conferidos</div>
          <div className="mt-1 text-[22px] font-black text-teal-950">{conferencias.length}</div>
        </div>
        <div className="rounded-2xl bg-rose-50 px-4 py-3 ring-1 ring-rose-100">
          <div className="text-[10px] font-bold uppercase tracking-wide text-rose-800">Com divergência</div>
          <div className="mt-1 text-[22px] font-black text-rose-950">{conferencias.filter((c: any) => c.houveDivergencia).length}</div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(['pedidos', 'criar', 'avulsa', 'conferidos', 'divergencias'] as const).map(aba => (
          <button
            key={aba}
            type="button"
            onClick={() => setAbaConferencia(aba)}
            className={`cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold tracking-wide transition ${
              abaConferencia === aba ? 'bg-teal-700 text-white shadow-sm shadow-teal-900/20' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {aba === 'pedidos' && `Pedidos Pendentes (${buscaFornecedorConferencia.trim() ? pedidosPendentesFiltrados.length : pedidosPendentesTotal})`}
            {aba === 'criar' && 'Criar pedidos'}
            {aba === 'avulsa' && 'Conferência avulsa'}
            {aba === 'conferidos' && `Conferidos (${buscaFornecedorConferencia.trim() ? conferenciasFiltradas.length : conferencias.length})`}
            {aba === 'divergencias' && `Divergências (${buscaFornecedorConferencia.trim() ? divergenciasFiltradas.length : conferencias.filter((c: any) => c.houveDivergencia).length})`}
          </button>
        ))}
      </div>

      {abaConferencia === 'criar' && (
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="bg-slate-900 px-4 py-3 text-white">
            <p className="m-0 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-200">Lançar na conferência</p>
            <p className="m-0 text-base font-black">Criar pedido</p>
            <p className="m-0 text-[11px] font-semibold text-slate-300">Use quando o pedido não veio da Cotação. Ele entra em Pedidos Pendentes.</p>
          </div>
          <div className="space-y-4 px-4 py-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-teal-800">Fornecedor</span>
                <input
                  type="text"
                  list="fornecedores-criar-pedido"
                  placeholder="Nome da empresa..."
                  value={pedidoAvulso.fornecedor}
                  onChange={e => setPedidoAvulso({ ...pedidoAvulso, fornecedor: e.target.value })}
                  className={campo}
                />
                <datalist id="fornecedores-criar-pedido">
                  {(fornecedoresCotacao || []).map((fornecedor: any) => (
                    <option key={fornecedor.id || fornecedor.nome} value={fornecedor.nomeFantasia || fornecedor.nome || fornecedor.razaoSocial} />
                  ))}
                </datalist>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-teal-800">Data</span>
                <input
                  type="date"
                  value={pedidoAvulso.data}
                  onChange={e => setPedidoAvulso({ ...pedidoAvulso, data: e.target.value })}
                  className={campo}
                />
              </label>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <strong className="text-[11px] font-black uppercase tracking-wide text-teal-800">Itens do pedido</strong>
                <button type="button" onClick={() => setPedidoAvulso(atual => ({ ...atual, itens: [...atual.itens, itemPedidoVazio()] }))} className={botaoSecundario}>
                  Adicionar item
                </button>
              </div>
              <div className="hidden grid-cols-[1fr_72px_80px_96px_96px_36px] gap-2 px-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:grid">
                <span>Produto</span>
                <span>Unid.</span>
                <span>Qtd</span>
                <span>Valor unit.</span>
                <span className="text-right">Total</span>
                <span />
              </div>
              <div className="flex flex-col gap-2">
                {pedidoAvulso.itens.map(item => {
                  const totalLinha = numeroCampo(item.quantidade) * numeroCampo(item.valorUnitario);
                  return (
                    <div key={item.id} className="grid gap-2 rounded-xl bg-slate-50 p-2 sm:grid-cols-[1fr_72px_80px_96px_96px_36px] sm:items-center sm:bg-transparent sm:p-0">
                      <input placeholder="Produto" value={item.produto} onChange={e => atualizarItemPedido(item.id, 'produto', e.target.value)} className={campo} />
                      <input placeholder="Kg" value={item.unit} onChange={e => atualizarItemPedido(item.id, 'unit', e.target.value)} className={campo} />
                      <input placeholder="Qtd" value={item.quantidade} onChange={e => atualizarItemPedido(item.id, 'quantidade', e.target.value)} className={campo} />
                      <input placeholder="0,00" value={item.valorUnitario} onChange={e => atualizarItemPedido(item.id, 'valorUnitario', e.target.value)} className={campo} />
                      <div className="flex items-center justify-between text-sm font-bold text-slate-900 sm:justify-end">
                        <span className="text-[10px] uppercase text-slate-500 sm:hidden">Total</span>
                        R$ {totalLinha.toFixed(2)}
                      </div>
                      <button
                        type="button"
                        onClick={() => setPedidoAvulso(atual => ({ ...atual, itens: atual.itens.length === 1 ? [itemPedidoVazio()] : atual.itens.filter(linha => linha.id !== item.id) }))}
                        className="h-9 cursor-pointer rounded-lg bg-rose-50 text-xs font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-teal-50 px-3 py-3 ring-1 ring-teal-100">
              <label className={botaoSecundario}>
                {pdfPedidoAvulso ? pdfPedidoAvulso.nome : 'Anexar PDF (opcional)'}
                <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={e => lerPdfPedido(e.target.files?.[0])} />
              </label>
              {pdfPedidoAvulso && (
                <button type="button" onClick={() => setPdfPedidoAvulso(null)} className={botaoPerigo}>Tirar PDF</button>
              )}
              <strong className="ml-auto text-sm font-black text-teal-900">Total: R$ {totalPedidoAvulso.toFixed(2)}</strong>
            </div>

            <button type="button" onClick={salvarPedidoAvulso} className="cursor-pointer rounded-lg bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-600">
              Salvar e enviar para Pedidos Pendentes
            </button>
          </div>
        </section>
      )}

      {abaConferencia === 'avulsa' && (
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="bg-slate-900 px-4 py-3 text-white">
            <p className="m-0 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-200">Sem pedido lançado</p>
            <p className="m-0 text-base font-black">Conferência avulsa</p>
            <p className="m-0 text-[11px] font-semibold text-slate-300">Use quando a mercadoria chegou sem estar na lista de Pedidos Pendentes.</p>
          </div>
          <div className="border-t border-slate-100 bg-teal-50/60 px-4 py-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-teal-800">Data</span>
                <input type="date" value={novaConferencia.data} onChange={e => setNovaConferencia({ ...novaConferencia, data: e.target.value })} className={campo} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-teal-800">Nome do conferente</span>
                <input type="text" placeholder="Seu nome..." value={novaConferencia.nomeConferente} onChange={e => setNovaConferencia({ ...novaConferencia, nomeConferente: e.target.value })} className={campo} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-teal-800">Fornecedor</span>
                <input type="text" placeholder="Nome da empresa..." value={novaConferencia.fornecedor} onChange={e => setNovaConferencia({ ...novaConferencia, fornecedor: e.target.value })} className={campo} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-teal-800">Valor recebido (R$)</span>
                <input type="text" placeholder="0,00" value={novaConferencia.valorRecebido} onChange={e => setNovaConferencia({ ...novaConferencia, valorRecebido: e.target.value })} className={campo} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-teal-800">Tipo de divergência</span>
                <select
                  value={novaConferencia.tipoDivergencia || ''}
                  onChange={e => {
                    const tipo = e.target.value;
                    setNovaConferencia({ ...novaConferencia, tipoDivergencia: tipo, houveDivergencia: Boolean(tipo) });
                  }}
                  className={campo}
                >
                  {opcoesDivergencia}
                </select>
              </label>
              <label className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-teal-800">Observações</span>
                <input type="text" placeholder="Detalhes da conferência..." value={novaConferencia.observacoes} onChange={e => setNovaConferencia({ ...novaConferencia, observacoes: e.target.value })} className={campo} />
              </label>
            </div>
            <button type="button" onClick={adicionarConferencia} className="mt-3 cursor-pointer rounded-lg bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-600">
              Registrar conferência avulsa
            </button>
          </div>
        </section>
      )}

      {abaConferencia === 'pedidos' && (
        <div>
          {pedidosPendentesConferencia.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-5 py-10 text-center text-sm text-slate-500 ring-1 ring-slate-200">
              <div className="mb-2 text-4xl">🎉</div>
              <strong className="block text-sm font-black text-slate-900">Nenhum pedido pendente!</strong>
              Todos os pedidos já foram conferidos. Crie um novo na aba Criar pedidos ou na Cotação.
            </div>
          ) : pedidosPendentesFiltrados.length === 0 ? (
            <div className="rounded-2xl bg-orange-50 px-5 py-10 text-center text-sm text-orange-800 ring-1 ring-orange-200">
              <strong className="mb-1 block text-sm font-black text-orange-950">Nenhum pedido aberto deste fornecedor</strong>
              Não achei “{buscaFornecedorConferencia.trim()}” nos Pedidos Pendentes. Confira o nome ou limpe a pesquisa.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {pedidosPendentesFiltrados.map((relatorio: any) => {
                const nomeFornecedor = relatorio.itens[0]?.fornecedor || 'Fornecedor não informado';
                const valorComprado = Number(relatorio.totalGeral || 0);
                const qtdItens = (relatorio.itens || []).length;
                return (
                  <section key={relatorio.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                    <div className="grid gap-3 bg-slate-900 px-4 py-3 text-white sm:grid-cols-3 sm:items-center">
                      <div>
                        <p className="m-0 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-200">Fornecedor</p>
                        <p className="m-0 truncate text-base font-black">{nomeFornecedor}</p>
                        <p className="m-0 text-[11px] font-semibold text-slate-300">{qtdItens} item(ns)</p>
                      </div>
                      <div>
                        <p className="m-0 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-200">Data</p>
                        <p className="m-0 text-sm font-bold">{relatorio.data}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="m-0 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-200">Valor que comprei</p>
                        <p className="m-0 text-xl font-black text-teal-300">R$ {valorComprado.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                      <button type="button" onClick={() => visualizarPedidoLancadoPdf(relatorio)} className={botaoPrimario}>Ver pedido em PDF</button>
                      {podeExcluirPedidoConferencia && (
                        <button type="button" onClick={() => excluirPedidoNaConferencia(relatorio.id)} className={botaoPerigo}>Excluir pedido</button>
                      )}
                      {!relatorio.pdfFornecedor ? (
                        <button type="button" onClick={() => anexarPdfFornecedor(relatorio)} className="cursor-pointer rounded-lg bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100">
                          Anexar PDF do fornecedor
                        </button>
                      ) : (
                        <>
                          <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200">{relatorio.pdfFornecedor.nome}</span>
                          <button type="button" onClick={() => visualizarPdfFornecedor(relatorio)} className={botaoSecundario}>Ver anexo</button>
                          <a href={relatorio.pdfFornecedor.conteudo} download={relatorio.pdfFornecedor.nome} className="cursor-pointer rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white no-underline hover:bg-slate-800">Baixar</a>
                        </>
                      )}
                    </div>

                    <div className="max-h-[420px] overflow-y-auto px-4 py-3">
                      {Object.entries<any[]>(relatorio.itens.reduce((grupos: any, item: any) => { (grupos[item.fornecedor] ||= []).push(item); return grupos; }, {})).map(([fornecedor, itensFornecedor]) => (
                        <div key={`${relatorio.id}-${fornecedor}`} className="flex flex-col">
                          {itensFornecedor.map((item, indice) => (
                            <div key={`${relatorio.id}-${fornecedor}-${indice}`} className={`grid grid-cols-[1fr_80px_96px] gap-2 py-2 text-[12px] ${indice > 0 ? 'border-t border-slate-100' : ''}`}>
                              <span className="font-semibold text-slate-700">{item.produto}</span>
                              <strong className="text-slate-900">{item.quantidade} {item.unit}</strong>
                              <span className="text-right font-bold text-slate-900">R$ {Number(item.valorTotal || 0).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 bg-teal-50/60 px-4 py-3">
                      <strong className="mb-2 block text-[11px] font-black uppercase tracking-wide text-teal-800">Preencher conferência deste pedido</strong>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        <input placeholder="Nome do conferente" value={conferenciasPorPedido[relatorio.id]?.conferente || ''} onChange={event => atualizarConferenciaPedido(relatorio.id, 'conferente', event.target.value)} className={campo} />
                        <input placeholder="Valor recebido (R$)" value={conferenciasPorPedido[relatorio.id]?.valor || ''} onChange={event => atualizarConferenciaPedido(relatorio.id, 'valor', event.target.value)} className={campo} />
                        <input placeholder="Detalhes / observações" value={conferenciasPorPedido[relatorio.id]?.obs || ''} onChange={event => atualizarConferenciaPedido(relatorio.id, 'obs', event.target.value)} className={campo} />
                        <select value={conferenciasPorPedido[relatorio.id]?.tipoDivergencia || ''} onChange={event => atualizarConferenciaPedido(relatorio.id, 'tipoDivergencia', event.target.value)} className={campo}>
                          {opcoesDivergencia}
                        </select>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <input type="checkbox" checked={conferenciasPorPedido[relatorio.id]?.divergencia || false} onChange={event => atualizarConferenciaPedido(relatorio.id, 'divergencia', event.target.checked)} className="h-4 w-4 accent-teal-700" /> Houve divergência
                        </label>
                      </div>
                      {conferenciasPorPedido[relatorio.id]?.valor && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-600">Comprado: R$ {valorComprado.toFixed(2)}</span>
                          <SeloDiferencaValor recebido={numeroCampo(conferenciasPorPedido[relatorio.id].valor)} esperado={valorComprado} destaque />
                        </div>
                      )}
                      <button type="button" onClick={() => salvarConferenciaPedido(relatorio)} className="mt-3 cursor-pointer rounded-lg bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-600">
                        Salvar e marcar como conferido
                      </button>
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      )}

      {abaConferencia === 'conferidos' && (
        <div>
          {conferencias.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-5 py-10 text-center text-sm text-slate-500 ring-1 ring-slate-200">
              <div className="mb-2 text-4xl">📭</div>
              <strong className="mb-1 block text-sm font-black text-slate-900">Nenhuma conferência registrada ainda.</strong>
              Conforme os pedidos chegarem, eles aparecerão aqui após serem conferidos.
            </div>
          ) : conferenciasFiltradas.length === 0 ? (
            <div className="rounded-2xl bg-orange-50 px-5 py-6 text-center text-sm text-orange-800 ring-1 ring-orange-200">
              Nenhuma conferência deste fornecedor.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {conferenciasFiltradas.map((conf: any) => {
                const pedidoOriginal = conf.pedidoId ? relatoriosPedidosCotacao.find((r: any) => r.id === conf.pedidoId) : null;
                const pedidoPdf = pedidoOriginal || (conf.itensConferidos?.length ? { id: conf.id, data: conf.data, itens: conf.itensConferidos, totalGeral: conf.valorEsperado ?? conf.itensConferidos.reduce((a: number, i: any) => a + (i.valorTotal || 0), 0) } : null);
                return (
                  <div key={conf.id} className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ${conf.houveDivergencia ? 'ring-orange-200' : 'ring-slate-200'}`}>
                    <div className="grid gap-3 bg-slate-900 px-4 py-3 text-white sm:grid-cols-3 sm:items-center">
                      <div>
                        <p className="m-0 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-200">Fornecedor</p>
                        <p className="m-0 truncate text-base font-black">{conf.fornecedor || 'Fornecedor não informado'}</p>
                        <p className="m-0 text-[11px] font-semibold text-slate-300">Conferente: {conf.nomeConferente || '-'}</p>
                      </div>
                      <div>
                        <p className="m-0 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-200">Data</p>
                        <p className="m-0 text-sm font-bold">{conf.data}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="m-0 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-200">Valor que comprei</p>
                        <p className="m-0 text-xl font-black text-teal-300">R$ {Number(conf.valorEsperado ?? conf.valorRecebido ?? 0).toFixed(2)}</p>
                        {(() => {
                          const diferenca = diferencaValorConferencia(conf.valorRecebido, conf.valorEsperado);
                          if (!diferenca || diferenca.tipo === 'igual') return null;
                          return (
                            <p className={`m-0 text-[11px] font-bold ${diferenca.tipo === 'mais' ? 'text-amber-300' : 'text-rose-300'}`}>
                              {diferenca.rotulo}
                            </p>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="flex justify-between gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          {conf.houveDivergencia ? (
                            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-800">Divergência: {rotuloTipoDivergencia(conf.tipoDivergencia)}</span>
                          ) : (
                            <span className="rounded-full bg-teal-100 px-2.5 py-1 text-[10px] font-bold text-teal-800">Sem divergências</span>
                          )}
                          <span className="text-xs font-semibold text-slate-600">Recebido: R$ {Number(conf.valorRecebido || 0).toFixed(2)}</span>
                          <SeloDiferencaValor recebido={conf.valorRecebido} esperado={conf.valorEsperado} />
                        </div>
                        {pedidoPdf && (
                          <button type="button" onClick={() => visualizarPedidoLancadoPdf(pedidoPdf)} className={`${botaoPrimario} mb-2`}>
                            Ver pedido em PDF
                          </button>
                        )}
                        {conf.itensConferidos && conf.itensConferidos.length > 0 && (
                          <details className="mb-2">
                            <summary className="cursor-pointer text-[11px] font-bold text-slate-700">Ver itens conferidos ({conf.itensConferidos.length})</summary>
                            <div className="mt-1.5 rounded-lg bg-slate-50 p-2 ring-1 ring-slate-200">
                              {conf.itensConferidos.map((item: any, idx: number) => (
                                <div key={idx} className={`grid grid-cols-[1fr_70px_90px] gap-1.5 text-[10px] ${idx > 0 ? 'border-t border-slate-100 pt-1' : ''}`}>
                                  <span>{item.produto}</span>
                                  <strong>{item.quantidade} {item.unit}</strong>
                                  <span className="text-right">R$ {Number(item.valorTotal || 0).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                        {pedidoOriginal?.pdfFornecedor && (
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-amber-50 px-2.5 py-1.5 ring-1 ring-amber-200">
                            <div className="flex items-center gap-1.5">
                              <span>📄</span>
                              <span className="text-[11px] font-bold text-amber-900">{pedidoOriginal.pdfFornecedor.nome}</span>
                              <span className="text-[10px] text-slate-500">({pedidoOriginal.pdfFornecedor.anexadoEm})</span>
                            </div>
                            <div className="flex gap-1">
                              <button type="button" onClick={() => visualizarPdfFornecedor(pedidoOriginal)} className={botaoSecundario}>Ver</button>
                              <a href={pedidoOriginal.pdfFornecedor.conteudo} download={pedidoOriginal.pdfFornecedor.nome} className={`${botaoPrimario} no-underline`}>Baixar</a>
                            </div>
                          </div>
                        )}
                        {conf.observacoes && (
                          <div className="border-l-2 border-slate-200 pl-2 text-[11px] italic text-slate-500">
                            "{conf.observacoes}"
                          </div>
                        )}
                      </div>
                      {podeExcluirPedidoConferencia && (
                        <button type="button" onClick={() => excluirConferencia(conf.id)} className="h-8 shrink-0 cursor-pointer rounded-lg bg-rose-50 px-2.5 text-xs font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100">
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {abaConferencia === 'divergencias' && (
        <div>
          {conferencias.filter((c: any) => c.houveDivergencia).length === 0 ? (
            <div className="rounded-2xl bg-teal-50 px-5 py-10 text-center text-sm text-teal-800 ring-1 ring-teal-200">
              <div className="mb-2 text-4xl">✅</div>
              <strong className="mb-1 block text-sm font-black text-teal-950">Ótimo! Nenhuma divergência registrada.</strong>
              Todas as conferências estão sem problemas.
            </div>
          ) : divergenciasFiltradas.length === 0 ? (
            <div className="rounded-2xl bg-orange-50 px-5 py-6 text-center text-sm text-orange-800 ring-1 ring-orange-200">
              Nenhuma divergência deste fornecedor.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {divergenciasFiltradas.map((conf: any) => {
                const pedidoOriginal = conf.pedidoId ? relatoriosPedidosCotacao.find((r: any) => r.id === conf.pedidoId) : null;
                const pedidoPdf = pedidoOriginal || (conf.itensConferidos?.length ? { id: conf.id, data: conf.data, itens: conf.itensConferidos, totalGeral: conf.valorEsperado ?? conf.itensConferidos.reduce((a: number, i: any) => a + (i.valorTotal || 0), 0) } : null);
                return (
                  <div key={conf.id} className="flex justify-between gap-3 overflow-hidden rounded-2xl bg-orange-50 p-4 ring-1 ring-orange-200">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                          Divergência: {rotuloTipoDivergencia(conf.tipoDivergencia)}
                        </span>
                        <strong className="text-sm text-slate-900">{conf.nomeConferente}</strong>
                        <span className="rounded-lg bg-white px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200">{conf.data}</span>
                        {conf.fornecedor && (
                          <span className="rounded-lg bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-900 ring-1 ring-sky-100">{conf.fornecedor}</span>
                        )}
                      </div>
                      <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {conf.valorEsperado !== undefined && (
                          <div className="rounded-lg bg-white p-1.5 ring-1 ring-orange-100">
                            <div className="text-[10px] font-bold uppercase text-slate-500">Valor da nota</div>
                            <div className="text-[15px] font-black text-slate-900">R$ {conf.valorEsperado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                          </div>
                        )}
                        <div className="rounded-lg bg-white p-1.5 ring-1 ring-orange-100">
                          <div className="text-[10px] font-bold uppercase text-slate-500">Valor recebido</div>
                          <div className="text-[15px] font-black text-rose-700">R$ {Number(conf.valorRecebido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                        {(() => {
                          const diferenca = diferencaValorConferencia(conf.valorRecebido, conf.valorEsperado);
                          if (!diferenca) return null;
                          const caixa = diferenca.tipo === 'mais'
                            ? 'bg-amber-50 ring-amber-200 text-amber-950'
                            : diferenca.tipo === 'menos'
                              ? 'bg-rose-50 ring-rose-200 text-rose-950'
                              : 'bg-teal-50 ring-teal-200 text-teal-950';
                          return (
                            <div className={`rounded-lg p-1.5 ring-1 ${caixa}`}>
                              <div className="text-[10px] font-bold uppercase">{diferenca.tipo === 'mais' ? 'Valor a mais' : diferenca.tipo === 'menos' ? 'Valor a menos' : 'Diferença'}</div>
                              <div className="text-[15px] font-black">R$ {diferenca.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                            </div>
                          );
                        })()}
                      </div>
                      {pedidoPdf && (
                        <button type="button" onClick={() => visualizarPedidoLancadoPdf(pedidoPdf)} className={`${botaoPrimario} mb-2`}>
                          Ver pedido em PDF
                        </button>
                      )}
                      {pedidoOriginal?.pdfFornecedor && (
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-amber-50 px-2.5 py-1.5 ring-1 ring-amber-200">
                          <div className="flex items-center gap-1.5">
                            <span>📄</span>
                            <span className="text-[11px] font-bold text-amber-900">{pedidoOriginal.pdfFornecedor.nome}</span>
                            <span className="text-[10px] text-slate-500">({pedidoOriginal.pdfFornecedor.anexadoEm})</span>
                          </div>
                          <div className="flex gap-1">
                            <button type="button" onClick={() => visualizarPdfFornecedor(pedidoOriginal)} className={botaoSecundario}>Ver</button>
                            <a href={pedidoOriginal.pdfFornecedor.conteudo} download={pedidoOriginal.pdfFornecedor.nome} className={`${botaoPrimario} no-underline`}>Baixar</a>
                          </div>
                        </div>
                      )}
                      {conf.observacoes && (
                        <div className="rounded-lg bg-white p-2 text-[11px] text-slate-600 ring-1 ring-orange-100">
                          <strong className="text-orange-900">Observações:</strong> "{conf.observacoes}"
                        </div>
                      )}
                    </div>
                    {podeExcluirPedidoConferencia && (
                      <button type="button" onClick={() => excluirConferencia(conf.id)} className="h-8 shrink-0 cursor-pointer rounded-lg bg-rose-50 px-2.5 text-xs font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100">
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
