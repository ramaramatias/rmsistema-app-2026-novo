const campo = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15';
const botaoPrimario = 'cursor-pointer rounded-lg bg-teal-700 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-teal-600';
const botaoEscuro = 'cursor-pointer rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-800';

export function AbaRelatorios(p: {
  calcularMenorPrecoItem: any;
  conferencias: any;
  dataSelecionada: any;
  enviarPedidoWhatsAppPdf: any;
  fornecedoresCotacao: any;
  imprimirPedidoIndividual: any;
  imprimirRelatorioPedidosPorVendedor: any;
  itensCotacao: any;
  nomeSetorSemEmoji: any;
  pagamentos: any;
  qtdPedirNumero: any;
  relatoriosPorData: any;
  setDataSelecionada: any;
  setTabAtiva: any;
  setores: any;
}) {
  const {
    calcularMenorPrecoItem,
    conferencias,
    dataSelecionada,
    enviarPedidoWhatsAppPdf,
    fornecedoresCotacao,
    imprimirPedidoIndividual,
    imprimirRelatorioPedidosPorVendedor,
    itensCotacao,
    nomeSetorSemEmoji,
    pagamentos,
    qtdPedirNumero,
    relatoriosPorData,
    setDataSelecionada,
    setTabAtiva,
    setores
  } = p;

  const dadosData = relatoriosPorData[dataSelecionada] || { pendentes: 0, concluidas: 0, pagamentos: 0, conferencias: 0 };
  const isSelecionadoHoje = dataSelecionada === new Date().toISOString().split('T')[0];
  const pendentesHoje = setores.reduce((acc: number, s: any) => acc + s.tarefas.filter((t: any) => t.status === 'aberta').length, 0);
  const concluidasHoje = setores.reduce((acc: number, s: any) => acc + s.tarefas.filter((t: any) => t.status === 'concluida').length, 0);
  const pagamentosHoje = pagamentos.caixa.reduce((a: number, i: any) => a + i.valor, 0) + pagamentos.cheque.reduce((a: number, i: any) => a + i.valor, 0) + pagamentos.caben.reduce((a: number, i: any) => a + i.valor, 0);
  const dinheiro = (valor: number) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  const economiaPorFornecedor = fornecedoresCotacao.map((fornecedor: any) => {
    const itensDoFornecedor = itensCotacao.filter((item: any) => {
      const quantidade = qtdPedirNumero(item);
      return quantidade > 0 && calcularMenorPrecoItem(item).vencedorFornId === fornecedor.id;
    });
    const valores = itensDoFornecedor.map((item: any) => {
      const quantidade = qtdPedirNumero(item);
      const precosValidos = Object.values(item.precos || {}).map((preco: any) => parseFloat(String(preco).replace(',', '.'))).filter((preco: number) => !Number.isNaN(preco) && preco > 0);
      const menor = calcularMenorPrecoItem(item).menorPreco || 0;
      const referencia = (precosValidos.length ? Math.max(...precosValidos) : menor) * quantidade;
      const pago = menor * quantidade;
      return { referencia, pago };
    });
    const referencia = valores.reduce((total: number, item: any) => total + item.referencia, 0);
    const pago = valores.reduce((total: number, item: any) => total + item.pago, 0);
    const economia = referencia - pago;
    return { fornecedor, referencia, economia, percentual: referencia > 0 ? (economia / referencia) * 100 : 0 };
  }).filter((item: any) => item.referencia > 0);

  const produtosSemFornecedor = itensCotacao.filter((item: any) => qtdPedirNumero(item) > 0 && !calcularMenorPrecoItem(item).vencedorFornId).length;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 sm:p-6">
      <button type="button" onClick={() => setTabAtiva('pendencias')} className="mb-4 cursor-pointer rounded-lg bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-white">
        ← Voltar ao sistema
      </button>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 className="m-0 text-lg font-black uppercase tracking-tight text-slate-900">Relatórios e Estatísticas</h2>
        <input
          type="date"
          value={dataSelecionada}
          onChange={e => setDataSelecionada(e.target.value)}
          className={campo}
        />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl bg-sky-50 px-4 py-3 ring-1 ring-sky-100">
          <h3 className="m-0 text-[10px] font-bold uppercase tracking-wide text-sky-800">Tarefas pendentes</h3>
          <p className="m-0 mt-1 text-[22px] font-black text-slate-900">{isSelecionadoHoje ? pendentesHoje : dadosData.pendentes}</p>
          <p className="m-0 mt-1 text-[10px] text-slate-500">Em {setores.length} setores</p>
        </div>
        <div className="rounded-2xl bg-teal-50 px-4 py-3 ring-1 ring-teal-100">
          <h3 className="m-0 text-[10px] font-bold uppercase tracking-wide text-teal-800">Tarefas concluídas</h3>
          <p className="m-0 mt-1 text-[22px] font-black text-teal-800">{isSelecionadoHoje ? concluidasHoje : dadosData.concluidas}</p>
          <p className="m-0 mt-1 text-[10px] text-slate-500">Completas</p>
        </div>
        <div className="rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-100">
          <h3 className="m-0 text-[10px] font-bold uppercase tracking-wide text-amber-800">Total pagamentos</h3>
          <p className="m-0 mt-1 text-[22px] font-black text-amber-950">R$ {dinheiro(isSelecionadoHoje ? pagamentosHoje : dadosData.pagamentos)}</p>
          <p className="m-0 mt-1 text-[10px] text-slate-500">Registrados</p>
        </div>
        <div className="rounded-2xl bg-rose-50 px-4 py-3 ring-1 ring-rose-100">
          <h3 className="m-0 text-[10px] font-bold uppercase tracking-wide text-rose-800">Conferências</h3>
          <p className="m-0 mt-1 text-[22px] font-black text-rose-950">{isSelecionadoHoje ? conferencias.length : dadosData.conferencias}</p>
          <p className="m-0 mt-1 text-[10px] text-slate-500">Registradas</p>
        </div>
      </div>

      <div className="mb-5 rounded-2xl bg-teal-50 p-4 ring-1 ring-teal-200">
        <h3 className="mb-3 mt-0 text-sm font-black text-teal-950">Economia por fornecedor</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {economiaPorFornecedor.length === 0 ? (
            <span className="text-[11px] text-slate-500">Nenhuma compra com preços comparáveis.</span>
          ) : economiaPorFornecedor.map((item: any) => (
            <div key={item.fornecedor.id} className="rounded-xl bg-white p-2.5 ring-1 ring-teal-100">
              <strong className="block text-[11px] text-slate-700">{item.fornecedor.nome}</strong>
              <span className="block text-[10px] text-slate-500">Referência: R$ {item.referencia.toFixed(2)}</span>
              <strong className="mt-1 block text-sm text-teal-800">Economia: R$ {item.economia.toFixed(2)} ({item.percentual.toFixed(1)}%)</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-5 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="m-0 text-sm font-black uppercase tracking-tight text-slate-900">Pedidos por fornecedor</h3>
            <p className="m-0 mt-1 text-[11px] text-slate-500">Cada produto está no fornecedor com o menor preço.</p>
          </div>
          <button type="button" onClick={imprimirRelatorioPedidosPorVendedor} className={botaoEscuro}>
            Imprimir todos
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {fornecedoresCotacao.map((fornecedor: any) => {
            const itensDoFornecedor = itensCotacao.filter((item: any) => {
              const quantidade = qtdPedirNumero(item);
              return quantidade > 0 && calcularMenorPrecoItem(item).vencedorFornId === fornecedor.id;
            });
            if (itensDoFornecedor.length === 0) return null;
            return (
              <div key={fornecedor.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 px-3 py-2">
                  <strong className="text-xs text-white">{fornecedor.nome}</strong>
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => imprimirPedidoIndividual(fornecedor)} className="cursor-pointer rounded-lg bg-white px-2.5 py-1 text-[10px] font-bold text-slate-900 hover:bg-slate-100">
                      Imprimir pedido
                    </button>
                    <button type="button" onClick={() => enviarPedidoWhatsAppPdf(fornecedor, itensDoFornecedor)} className="cursor-pointer rounded-lg bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-400">
                      WhatsApp PDF
                    </button>
                  </div>
                </div>
                {itensDoFornecedor.map((item: any) => (
                  <div key={item.id} className="grid grid-cols-[1fr_80px_80px] gap-2 border-b border-slate-100 px-2.5 py-2 text-[11px] last:border-b-0">
                    <span className="font-semibold text-slate-700">{item.produto}</span>
                    <span className="text-slate-500">{item.unit}</span>
                    <strong className="text-right text-slate-900">{item.qtdPedir}</strong>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        {produtosSemFornecedor > 0 && (
          <div className="mt-3 rounded-xl bg-orange-50 px-3 py-2.5 text-[11px] font-semibold text-orange-900 ring-1 ring-orange-200">
            Existem produtos com quantidade preenchida, mas ainda sem preço para definir o fornecedor.
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 mt-0 text-sm font-black uppercase tracking-tight text-slate-900">Resumo por setor</h3>
        <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="border-b border-slate-200 px-3 py-2.5 text-[11px] font-bold text-slate-900">Setor</th>
                <th className="border-b border-slate-200 px-3 py-2.5 text-center text-[11px] font-bold text-slate-900">Tarefas abertas</th>
                <th className="border-b border-slate-200 px-3 py-2.5 text-center text-[11px] font-bold text-slate-900">Tarefas concluídas</th>
                <th className="border-b border-slate-200 px-3 py-2.5 text-center text-[11px] font-bold text-slate-900">Total</th>
                <th className="border-b border-slate-200 px-3 py-2.5 text-center text-[11px] font-bold text-slate-900">Taxa conclusão</th>
              </tr>
            </thead>
            <tbody>
              {setores.map((setor: any, idx: number) => {
                const abertas = setor.tarefas.filter((t: any) => t.status === 'aberta').length;
                const concluidas = setor.tarefas.filter((t: any) => t.status === 'concluida').length;
                const total = setor.tarefas.length;
                const taxa = total === 0 ? 0 : Math.round((concluidas / total) * 100);
                return (
                  <tr key={setor.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-3 py-3 text-xs font-bold text-slate-900">{nomeSetorSemEmoji(setor.nome)}</td>
                    <td className="px-3 py-3 text-center text-xs font-bold text-rose-600">{abertas}</td>
                    <td className="px-3 py-3 text-center text-xs font-bold text-teal-700">{concluidas}</td>
                    <td className="px-3 py-3 text-center text-xs font-bold text-slate-900">{total}</td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full transition-[width] ${taxa >= 75 ? 'bg-teal-600' : taxa >= 50 ? 'bg-orange-500' : 'bg-rose-500'}`}
                            style={{ width: `${taxa}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">{taxa}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
