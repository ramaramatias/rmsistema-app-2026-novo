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
  divergenciasFiltradas: any;
  enviarPdfConferenciaCompartilhado: any;
  excluirConferencia: any;
  importarBackupConferencia: any;
  imprimirRelatorioConferencia: any;
  novaConferencia: any;
  pdfFornecedorVisualizacao: any;
  pedidosPendentesConferencia: any;
  pedidosPendentesFiltrados: any;
  pedidosPendentesTotal: any;
  pedidosRealizadosTotal: any;
  relatoriosPedidosCotacao: any;
  removerPdfConferenciaCompartilhado: any;
  salvarConferenciaPedido: any;
  setAbaConferencia: any;
  setBuscaFornecedorConferencia: any;
  setNovaConferencia: any;
  setPdfFornecedorVisualizacao: any;
  setTabAtiva: any;
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
    divergenciasFiltradas,
    enviarPdfConferenciaCompartilhado,
    excluirConferencia,
    importarBackupConferencia,
    imprimirRelatorioConferencia,
    novaConferencia,
    pdfFornecedorVisualizacao,
    pedidosPendentesConferencia,
    pedidosPendentesFiltrados,
    pedidosPendentesTotal,
    pedidosRealizadosTotal,
    relatoriosPedidosCotacao,
    removerPdfConferenciaCompartilhado,
    salvarConferenciaPedido,
    setAbaConferencia,
    setBuscaFornecedorConferencia,
    setNovaConferencia,
    setPdfFornecedorVisualizacao,
    setTabAtiva,
    visualizarPdfFornecedor
  } = p;
  const classeAbaInterna = (ativa: boolean) =>
    `cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold tracking-wide transition ${
      ativa ? 'bg-teal-700 text-white shadow-sm shadow-teal-900/20' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
    }`;
  const campo = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15';
  const rotulo = 'mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500';
  const botaoGhost = 'cursor-pointer rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50';
  const moeda = (valor: number) => `R$ ${Number(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const nomeTipoDivergencia = (tipo?: string) => tipo === 'kg' ? 'quilo (kg)' : tipo === 'quantidade' ? 'quantidade' : tipo === 'valor' ? 'valor' : '';
  const conferenciaTemDivergencia = (conf: any) => {
    const delta = conf.valorEsperado !== undefined ? Number(conf.valorRecebido) - Number(conf.valorEsperado) : 0;
    return Boolean(conf.houveDivergencia || conf.tipoDivergencia || Math.abs(delta) >= 0.01);
  };
  const explicarDiferenca = (conf: any) => {
    const tipo = nomeTipoDivergencia(conf.tipoDivergencia);
    const esperado = Number(conf.valorEsperado);
    const recebido = Number(conf.valorRecebido);
    const temNota = conf.valorEsperado !== undefined && !Number.isNaN(esperado);
    const delta = temNota ? recebido - esperado : 0;
    const frases: string[] = [];
    if (tipo) frases.push(`Houve diferença de ${tipo}.`);
    else if (conf.houveDivergencia || Math.abs(delta) >= 0.01) frases.push('Houve divergência na conferência.');
    if (temNota && Math.abs(delta) >= 0.01) {
      frases.push(delta > 0
        ? `O valor ficou ${moeda(delta)} a mais que a nota.`
        : `O valor ficou ${moeda(Math.abs(delta))} a menos que a nota.`);
    }
    if (String(conf.observacoes || '').trim()) frases.push(`Motivo informado: ${String(conf.observacoes).trim()}`);
    return frases.join(' ');
  };
  const pdfPedido = (conf: any) => {
    const pedidoOriginal = conf.pedidoId ? relatoriosPedidosCotacao.find((r: any) => r.id === conf.pedidoId) : null;
    if (!pedidoOriginal?.pdfFornecedor) return null;
    return (
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-800">{pedidoOriginal.pdfFornecedor.nome}</span>
          <span className="text-[10px] text-slate-500">({pedidoOriginal.pdfFornecedor.anexadoEm})</span>
        </div>
        <div className="flex gap-1">
          <button type="button" onClick={() => setPdfFornecedorVisualizacao({ nome: pedidoOriginal.pdfFornecedor.nome, conteudo: pedidoOriginal.pdfFornecedor.conteudo })} className={botaoGhost + ' !px-2 !py-1 text-[10px]'}>Ver</button>
          <a href={pedidoOriginal.pdfFornecedor.conteudo} download={pedidoOriginal.pdfFornecedor.nome} className="cursor-pointer rounded-lg bg-teal-700 px-2 py-1 text-[10px] font-bold text-white no-underline hover:bg-teal-600">Baixar</a>
        </div>
      </div>
    );
  };
  return (
    <>
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 sm:p-6">
              <button type="button" onClick={() => setTabAtiva('compras')} className="mb-4 cursor-pointer rounded-lg bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-white">← Voltar para Compras</button>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="m-0 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">Recebimento</p>
                  <h2 className="m-0 text-xl font-black tracking-tight text-slate-900">Conferência de pedidos</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={enviarPdfConferenciaCompartilhado} className={arquivoConferencia ? 'cursor-pointer rounded-lg bg-teal-700 px-3 py-2 text-[11px] font-bold text-white hover:bg-teal-600' : 'cursor-pointer rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'}>
                    {arquivoConferencia ? 'PDF enviado' : 'Enviar PDF'}
                  </button>
                  <label className={`${botaoGhost} inline-flex items-center`}>
                    Importar backup
                    <input type="file" accept=".json" onChange={importarBackupConferencia} className="hidden" />
                  </label>
                  <button type="button" onClick={imprimirRelatorioConferencia} className="cursor-pointer rounded-lg bg-slate-900 px-3 py-2 text-[11px] font-bold text-white hover:bg-slate-800">Imprimir relatório</button>
                </div>
              </div>

              <div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                <label className={rotulo}>Pesquisar fornecedor</label>
                <input
                  type="text"
                  value={buscaFornecedorConferencia}
                  onChange={event => {
                    setBuscaFornecedorConferencia(event.target.value);
                    setAbaConferencia('pedidos');
                  }}
                  placeholder="Ex.: JFRIOS, Laredo, Minerva..."
                  className={campo}
                />
                {buscaFornecedorConferencia.trim() && (
                  <span className="mt-2 block text-[11px] font-semibold text-teal-800">
                    {pedidosPendentesFiltrados.length} pedido(s) aberto(s) de “{buscaFornecedorConferencia.trim()}”
                  </span>
                )}
              </div>

              {arquivoConferencia && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-teal-50 px-4 py-3 ring-1 ring-teal-100">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{arquivoConferencia.nome}</div>
                    <div className="text-[10px] text-slate-500">Enviado em {arquivoConferencia.dataUpload} por {arquivoConferencia.uploadPor}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href={arquivoConferencia.conteudo} download={arquivoConferencia.nome} className="cursor-pointer rounded-lg bg-teal-700 px-3 py-1.5 text-[11px] font-bold text-white no-underline hover:bg-teal-600">Baixar PDF</a>
                    <button type="button" onClick={() => window.open(arquivoConferencia.conteudo, '_blank')} className={botaoGhost}>Visualizar</button>
                    <button type="button" onClick={removerPdfConferenciaCompartilhado} className="cursor-pointer rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50">Remover</button>
                  </div>
                </div>
              )}

              <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-2xl bg-slate-900 px-4 py-3 text-white">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-300">Pedidos gerados</div>
                  <div className="mt-1 text-2xl font-black">{pedidosRealizadosTotal}</div>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Aguardando</div>
                  <div className="mt-1 text-2xl font-black text-slate-900">{pedidosPendentesTotal}</div>
                </div>
                <div className="rounded-2xl bg-teal-700 px-4 py-3 text-white">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-teal-100">Conferidos</div>
                  <div className="mt-1 text-2xl font-black">{conferencias.length}</div>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-rose-200">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-rose-700">Com divergência</div>
                  <div className="mt-1 text-2xl font-black text-rose-800">{conferencias.filter((c: any) => conferenciaTemDivergencia(c)).length}</div>
                </div>
              </div>

              <div className="mb-5 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <h3 className="m-0 mb-3 text-sm font-bold text-slate-900">Conferência avulsa (sem pedido)</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className={rotulo}>Data</label>
                    <input type="date" value={novaConferencia.data} onChange={(e) => setNovaConferencia({ ...novaConferencia, data: e.target.value })} className={campo} />
                  </div>
                  <div>
                    <label className={rotulo}>Nome do conferente</label>
                    <input type="text" placeholder="Seu nome..." value={novaConferencia.nomeConferente} onChange={(e) => setNovaConferencia({ ...novaConferencia, nomeConferente: e.target.value })} className={campo} />
                  </div>
                  <div>
                    <label className={rotulo}>Valor recebido (R$)</label>
                    <input type="text" placeholder="0,00" value={novaConferencia.valorRecebido} onChange={(e) => setNovaConferencia({ ...novaConferencia, valorRecebido: e.target.value })} className={campo} />
                  </div>
                  <div>
                    <label className={rotulo}>Houve divergência?</label>
                    <select value={novaConferencia.houveDivergencia ? 'true' : 'false'} onChange={(e) => setNovaConferencia({ ...novaConferencia, houveDivergencia: e.target.value === 'true' })} className={campo}>
                      <option value="false">Não</option>
                      <option value="true">Sim</option>
                    </select>
                  </div>
                  {novaConferencia.houveDivergencia && (
                    <div>
                      <label className={rotulo}>Tipo de divergência</label>
                      <select value={novaConferencia.tipoDivergencia || ''} onChange={(e) => setNovaConferencia({ ...novaConferencia, tipoDivergencia: e.target.value as any })} className={campo}>
                        <option value="">Selecione...</option>
                        <option value="valor">Diferença de valor</option>
                        <option value="kg">Diferença de quilo (kg)</option>
                        <option value="quantidade">Diferença de quantidade</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <label className={rotulo}>Observações</label>
                  <textarea placeholder="Detalhes da conferência..." value={novaConferencia.observacoes} onChange={(e) => setNovaConferencia({ ...novaConferencia, observacoes: e.target.value })} className={`${campo} min-h-[60px] resize-y`} />
                </div>
                <button type="button" onClick={adicionarConferencia} className="mt-3 cursor-pointer rounded-lg bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-600">
                  Registrar conferência
                </button>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {(['pedidos', 'conferidos', 'divergencias'] as const).map(aba => (
                  <button type="button" key={aba} onClick={() => setAbaConferencia(aba)} className={classeAbaInterna(abaConferencia === aba)}>
                    {aba === 'pedidos' && `Pedidos pendentes (${buscaFornecedorConferencia.trim() ? pedidosPendentesFiltrados.length : pedidosPendentesTotal})`}
                    {aba === 'conferidos' && `Conferidos (${buscaFornecedorConferencia.trim() ? conferenciasFiltradas.length : conferencias.length})`}
                    {aba === 'divergencias' && `Divergências (${buscaFornecedorConferencia.trim() ? divergenciasFiltradas.length : conferencias.filter((c: any) => conferenciaTemDivergencia(c)).length})`}
                  </button>
                ))}
              </div>

              {abaConferencia === 'pedidos' && (
                <div>
                  {pedidosPendentesConferencia.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 px-5 py-10 text-center ring-1 ring-slate-200">
                      <strong className="mb-1 block text-sm text-slate-900">Nenhum pedido pendente</strong>
                      <span className="text-sm text-slate-500">Todos os pedidos já foram conferidos. Gere novos pedidos na cotação.</span>
                    </div>
                  ) : pedidosPendentesFiltrados.length === 0 ? (
                    <div className="rounded-2xl bg-white px-5 py-10 text-center ring-1 ring-rose-200">
                      <strong className="mb-1 block text-sm text-slate-900">Nenhum pedido aberto deste fornecedor</strong>
                      <span className="text-sm text-slate-500">Não achei “{buscaFornecedorConferencia.trim()}” nos pedidos pendentes. Confira o nome ou limpe a pesquisa.</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {pedidosPendentesFiltrados.map((relatorio: any) => (
                        <section key={relatorio.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-4 py-3">
                            <div>
                              <strong className="block text-sm text-slate-900">{relatorio.itens[0]?.fornecedor || 'Fornecedor não informado'}</strong>
                              <span className="text-[11px] text-slate-500">
                                {relatorio.data} • {relatorio.itens.length} item(ns) • <strong className="text-teal-800">Valor nota: {moeda(relatorio.totalGeral)}</strong>
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {!relatorio.pdfFornecedor ? (
                                <button type="button" onClick={() => anexarPdfFornecedor(relatorio)} className={botaoGhost}>Anexar PDF do fornecedor</button>
                              ) : (
                                <>
                                  <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-slate-700 ring-1 ring-slate-200">{relatorio.pdfFornecedor.nome}</span>
                                  <button type="button" onClick={() => visualizarPdfFornecedor(relatorio)} className={botaoGhost + ' !px-2 !py-1 text-[10px]'}>Ver</button>
                                  <a href={relatorio.pdfFornecedor.conteudo} download={relatorio.pdfFornecedor.nome} className="cursor-pointer rounded-lg bg-teal-700 px-2 py-1 text-[10px] font-bold text-white no-underline hover:bg-teal-600">Baixar</a>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="mx-4 mt-3 max-h-[180px] overflow-y-auto rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                            {Object.entries(relatorio.itens.reduce((grupos: any, item: any) => { (grupos[item.fornecedor] ||= []).push(item); return grupos; }, {})).map(([fornecedor, itensFornecedor]: [string, any]) => (
                              <div key={`${relatorio.id}-${fornecedor}`}>
                                {itensFornecedor.map((item: any, indice: number) => (
                                  <div key={`${relatorio.id}-${fornecedor}-${indice}`} className="grid grid-cols-[1fr_70px_90px] gap-1.5 border-t border-slate-100 py-1 text-[11px] first:border-t-0 first:pt-0">
                                    <span className="text-slate-600">{item.produto}</span>
                                    <strong className="text-slate-900">{item.quantidade} {item.unit}</strong>
                                    <span className="text-right text-slate-600">{moeda(item.valorTotal)}</span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>

                          <div className="m-4 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                            <strong className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Preencher conferência deste pedido</strong>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              <input placeholder="Nome do conferente" value={conferenciasPorPedido[relatorio.id]?.conferente || ''} onChange={event => atualizarConferenciaPedido(relatorio.id, 'conferente', event.target.value)} className={campo} />
                              <input placeholder="Valor recebido (R$)" value={conferenciasPorPedido[relatorio.id]?.valor || ''} onChange={event => atualizarConferenciaPedido(relatorio.id, 'valor', event.target.value)} className={campo} />
                              <input placeholder="Por que da diferença (ex.: peso veio a mais)" value={conferenciasPorPedido[relatorio.id]?.obs || ''} onChange={event => atualizarConferenciaPedido(relatorio.id, 'obs', event.target.value)} className={campo} />
                              <select value={conferenciasPorPedido[relatorio.id]?.tipoDivergencia || ''} onChange={event => atualizarConferenciaPedido(relatorio.id, 'tipoDivergencia', event.target.value)} className={campo}>
                                <option value="">Sem divergência</option>
                                <option value="valor">Diferença de valor</option>
                                <option value="kg">Diferença de quilo (kg)</option>
                                <option value="quantidade">Diferença de quantidade</option>
                              </select>
                              <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                                <input type="checkbox" checked={conferenciasPorPedido[relatorio.id]?.divergencia || false} onChange={event => atualizarConferenciaPedido(relatorio.id, 'divergencia', event.target.checked)} className="accent-teal-700" /> Houve divergência
                              </label>
                            </div>
                            <button type="button" onClick={() => salvarConferenciaPedido(relatorio)} className="mt-3 cursor-pointer rounded-lg bg-teal-700 px-4 py-2 text-[11px] font-bold text-white hover:bg-teal-600">
                              Salvar e marcar como conferido
                            </button>
                          </div>
                        </section>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {abaConferencia === 'conferidos' && (
                <div>
                  {conferencias.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 px-5 py-10 text-center ring-1 ring-slate-200">
                      <strong className="mb-1 block text-sm text-slate-900">Nenhuma conferência registrada ainda</strong>
                      <span className="text-sm text-slate-500">Conforme os pedidos chegarem, eles aparecerão aqui após serem conferidos.</span>
                    </div>
                  ) : conferenciasFiltradas.length === 0 ? (
                    <div className="rounded-2xl bg-white px-5 py-8 text-center text-sm text-slate-600 ring-1 ring-slate-200">Nenhuma conferência deste fornecedor.</div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {conferenciasFiltradas.map((conf: any) => {
                        const temDivergencia = conferenciaTemDivergencia(conf);
                        const motivo = explicarDiferenca(conf);
                        const esperado = Number(conf.valorEsperado);
                        const delta = conf.valorEsperado !== undefined ? Number(conf.valorRecebido) - esperado : 0;
                        return (
                        <div key={conf.id} className={`flex items-start justify-between gap-3 rounded-2xl p-4 ring-1 ${temDivergencia ? 'bg-rose-50 ring-rose-200' : 'bg-white ring-slate-200'}`}>
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <strong className="text-sm text-slate-900">{conf.nomeConferente}</strong>
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{conf.data}</span>
                              {conf.fornecedor && (
                                <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-800">{conf.fornecedor}</span>
                              )}
                              {temDivergencia ? (
                                <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                                  {nomeTipoDivergencia(conf.tipoDivergencia) ? `Diferença de ${nomeTipoDivergencia(conf.tipoDivergencia)}` : 'Com divergência'}
                                </span>
                              ) : (
                                <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">Sem divergências</span>
                              )}
                            </div>
                            <div className="mb-2 grid gap-2 sm:grid-cols-3">
                              {conf.valorEsperado !== undefined && (
                                <div className="text-[11px] text-slate-600"><strong className="text-slate-800">Valor nota:</strong> {moeda(conf.valorEsperado)}</div>
                              )}
                              <div className="text-[11px] text-slate-600">
                                <strong className="text-slate-800">Valor recebido:</strong>{' '}
                                <span className={`font-bold ${Math.abs(delta) >= 0.01 ? 'text-rose-700' : 'text-teal-800'}`}>{moeda(conf.valorRecebido)}</span>
                              </div>
                              {conf.valorEsperado !== undefined && Math.abs(delta) >= 0.01 && (
                                <div className="text-[11px] font-semibold text-rose-700">
                                  <strong>{delta > 0 ? 'Valor a mais:' : 'Valor a menos:'}</strong> {moeda(Math.abs(delta))}
                                </div>
                              )}
                            </div>
                            {motivo && (
                              <div className="mb-2 rounded-xl bg-white px-3 py-2 text-[12px] font-semibold leading-snug text-slate-800 ring-1 ring-rose-100">
                                {motivo}
                              </div>
                            )}
                            {conf.itensConferidos && conf.itensConferidos.length > 0 && (
                              <details className="mb-2">
                                <summary className="cursor-pointer text-[11px] font-bold text-slate-600">Ver itens conferidos ({conf.itensConferidos.length})</summary>
                                <div className="mt-2 rounded-xl bg-slate-50 p-2 ring-1 ring-slate-100">
                                  {conf.itensConferidos.map((item: any, idx: number) => (
                                    <div key={idx} className={`grid grid-cols-[1fr_70px_90px] gap-1.5 py-1 text-[10px] ${idx > 0 ? 'border-t border-slate-100' : ''}`}>
                                      <span>{item.produto}</span>
                                      <strong>{item.quantidade} {item.unit}</strong>
                                      <span className="text-right">{moeda(item.valorTotal)}</span>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}
                            {pdfPedido(conf)}
                          </div>
                          <button type="button" onClick={() => excluirConferencia(conf.id)} className="shrink-0 cursor-pointer rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50">✕</button>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {abaConferencia === 'divergencias' && (
                <div>
                  {conferencias.filter((c: any) => conferenciaTemDivergencia(c)).length === 0 ? (
                    <div className="rounded-2xl bg-teal-50 px-5 py-10 text-center ring-1 ring-teal-100">
                      <strong className="mb-1 block text-sm text-teal-900">Nenhuma divergência registrada</strong>
                      <span className="text-sm text-teal-800">Todas as conferências estão sem problemas.</span>
                    </div>
                  ) : divergenciasFiltradas.length === 0 ? (
                    <div className="rounded-2xl bg-white px-5 py-8 text-center text-sm text-slate-600 ring-1 ring-slate-200">Nenhuma divergência deste fornecedor.</div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {divergenciasFiltradas.map((conf: any) => {
                        const motivo = explicarDiferenca(conf);
                        const delta = conf.valorEsperado !== undefined ? Number(conf.valorRecebido) - Number(conf.valorEsperado) : 0;
                        return (
                        <div key={conf.id} className="flex items-start justify-between gap-3 rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200">
                          <div className="min-w-0 flex-1">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <span className="rounded-md bg-rose-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                {nomeTipoDivergencia(conf.tipoDivergencia) ? `Diferença de ${nomeTipoDivergencia(conf.tipoDivergencia)}` : 'Divergência'}
                              </span>
                              <strong className="text-sm text-slate-900">{conf.nomeConferente}</strong>
                              <span className="rounded-md bg-white px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200">{conf.data}</span>
                              {conf.fornecedor && (
                                <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-teal-800 ring-1 ring-slate-200">{conf.fornecedor}</span>
                              )}
                            </div>
                            <div className="mb-3 grid gap-2 sm:grid-cols-3">
                              {conf.valorEsperado !== undefined && (
                                <div className="rounded-xl bg-white p-2.5 ring-1 ring-slate-200">
                                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Valor da nota</div>
                                  <div className="text-base font-black text-slate-900">{moeda(conf.valorEsperado)}</div>
                                </div>
                              )}
                              <div className="rounded-xl bg-white p-2.5 ring-1 ring-slate-200">
                                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Valor recebido</div>
                                <div className="text-base font-black text-rose-700">{moeda(conf.valorRecebido)}</div>
                              </div>
                              {conf.valorEsperado !== undefined && Math.abs(delta) >= 0.01 && (
                                <div className="rounded-xl bg-white p-2.5 ring-1 ring-rose-200">
                                  <div className="text-[10px] font-bold uppercase tracking-wide text-rose-700">{delta > 0 ? 'Valor a mais' : 'Valor a menos'}</div>
                                  <div className="text-base font-black text-rose-800">{moeda(Math.abs(delta))}</div>
                                </div>
                              )}
                            </div>
                            {motivo && (
                              <div className="mb-3 rounded-xl bg-white px-3 py-2 text-[12px] font-semibold leading-snug text-slate-800 ring-1 ring-rose-100">
                                {motivo}
                              </div>
                            )}
                            {pdfPedido(conf)}
                          </div>
                          <button type="button" onClick={() => excluirConferencia(conf.id)} className="shrink-0 cursor-pointer rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50">✕</button>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>

          {pdfFornecedorVisualizacao && (
            <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-slate-900/85 p-5">
              <div className="flex max-h-[92vh] w-full max-w-[900px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                  <div>
                    <strong className="block text-sm text-slate-900">{pdfFornecedorVisualizacao.nome}</strong>
                    <span className="text-[10px] text-slate-500">Visualização do PDF</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href={pdfFornecedorVisualizacao.conteudo} download={pdfFornecedorVisualizacao.nome} className="cursor-pointer rounded-lg bg-teal-700 px-3 py-1.5 text-[11px] font-bold text-white no-underline hover:bg-teal-600">Baixar</a>
                    <button type="button" onClick={() => window.open(pdfFornecedorVisualizacao.conteudo, '_blank')} className={botaoGhost}>Abrir nova aba</button>
                    <button type="button" onClick={() => setPdfFornecedorVisualizacao(null)} className="cursor-pointer rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50">Fechar</button>
                  </div>
                </div>
                <div className="min-h-[70vh] flex-1 overflow-hidden bg-black">
                  <iframe src={pdfFornecedorVisualizacao.conteudo} title="PDF do fornecedor" className="h-full min-h-[70vh] w-full border-0" />
                </div>
              </div>
            </div>
          )}
    </>
  );
}
