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
  excluirPedidoNaConferencia: any;
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
    excluirPedidoNaConferencia,
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
    setPdfFornecedorVisualizacao,
    setTabAtiva,
    visualizarPdfFornecedor
  } = p;
  return (
            <section style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '20px', border: '1px solid #cbd5e1' }}>
              <button onClick={() => setTabAtiva('compras')} style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '5px', padding: '7px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '14px' }}>← Voltar para Compras</button>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>✓ Conferência de Pedidos</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={enviarPdfConferenciaCompartilhado} style={{ backgroundColor: arquivoConferencia ? '#059669' : '#fef3c7', color: arquivoConferencia ? '#ffffff' : '#92400e', border: `1px solid ${arquivoConferencia ? '#10b981' : '#fcd34d'}`, borderRadius: '4px', padding: '7px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {arquivoConferencia ? '📄 Meu PDF enviado' : '📤 Enviar meu PDF'}
                  </button>
                  <label style={{ backgroundColor: '#e2e8f0', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '7px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                    📥 Importar Backup
                    <input type="file" accept=".json" onChange={importarBackupConferencia} style={{ display: 'none' }} />
                  </label>
                  <button onClick={imprimirRelatorioConferencia} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '7px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>🖨️ Imprimir Relatório</button>
                </div>
              </div>

              <div style={{ marginBottom: '16px', padding: '12px 14px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>🔎 Pesquisar fornecedor</label>
                <input
                  type="text"
                  value={buscaFornecedorConferencia}
                  onChange={event => {
                    setBuscaFornecedorConferencia(event.target.value);
                    setAbaConferencia('pedidos');
                  }}
                  placeholder="Ex.: JFRIOS, Laredo, Minerva... mostra os pedidos abertos da empresa"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '2px solid #2563eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold' }}
                />
                {buscaFornecedorConferencia.trim() && (
                  <span style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: '#1e40af' }}>
                    {pedidosPendentesFiltrados.length} pedido(s) aberto(s) de “{buscaFornecedorConferencia.trim()}”
                  </span>
                )}
              </div>

              {/* SEÇÃO DO PDF COMPARTILHADO DA CONFERÊNCIA */}
              {arquivoConferencia && (
                <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: '#eff6ff', border: '2px solid #60a5fa', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ fontSize: '32px' }}>📄</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e3a8a' }}>{arquivoConferencia.nome}</div>
                        <div style={{ fontSize: '10px', color: '#475569' }}>
                          Enviado em {arquivoConferencia.dataUpload} por {arquivoConferencia.uploadPor}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <a 
                        href={arquivoConferencia.conteudo} 
                        download={arquivoConferencia.nome}
                        style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', textDecoration: 'none', cursor: 'pointer' }}
                      >
                        ⬇️ Baixar PDF
                      </a>
                      <button 
                        onClick={() => window.open(arquivoConferencia.conteudo, '_blank')}
                        style={{ backgroundColor: '#ffffff', color: '#1e3a8a', border: '1px solid #93c5fd', borderRadius: '4px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        👁️ Visualizar
                      </button>
                      <button 
                        onClick={removerPdfConferenciaCompartilhado}
                        style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '4px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        ✕ Remover
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CARDS DE ESTATÍSTICAS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb', padding: '12px 16px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#1e40af', fontWeight: 'bold', textTransform: 'uppercase' }}>Pedidos Gerados</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#1e3a8a', marginTop: '4px' }}>{pedidosRealizadosTotal}</div>
                </div>
                <div style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #d97706', padding: '12px 16px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#92400e', fontWeight: 'bold', textTransform: 'uppercase' }}>Aguardando Conferência</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#78350f', marginTop: '4px' }}>{pedidosPendentesTotal}</div>
                </div>
                <div style={{ backgroundColor: '#ecfdf5', borderLeft: '4px solid #059669', padding: '12px 16px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#065f46', fontWeight: 'bold', textTransform: 'uppercase' }}>Conferidos</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#064e3b', marginTop: '4px' }}>{conferencias.length}</div>
                </div>
                <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #dc2626', padding: '12px 16px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#991b1b', fontWeight: 'bold', textTransform: 'uppercase' }}>Com Divergência</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#7f1d1d', marginTop: '4px' }}>{conferencias.filter(c => c.houveDivergencia).length}</div>
                </div>
              </div>

              {/* FORMULÁRIO DE CONFERÊNCIA AVULSA */}
              <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: '#065f46', fontWeight: 'bold' }}>📋 Conferência Avulsa (sem pedido)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Data</label>
                    <input 
                      type="date" 
                      value={novaConferencia.data} 
                      onChange={(e) => setNovaConferencia({ ...novaConferencia, data: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Nome do Conferente</label>
                    <input 
                      type="text" 
                      placeholder="Seu nome..." 
                      value={novaConferencia.nomeConferente} 
                      onChange={(e) => setNovaConferencia({ ...novaConferencia, nomeConferente: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Valor Recebido (R$)</label>
                    <input 
                      type="text" 
                      placeholder="0,00" 
                      value={novaConferencia.valorRecebido} 
                      onChange={(e) => setNovaConferencia({ ...novaConferencia, valorRecebido: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Houve Divergência?</label>
                    <select 
                      value={novaConferencia.houveDivergencia ? 'true' : 'false'} 
                      onChange={(e) => setNovaConferencia({ ...novaConferencia, houveDivergencia: e.target.value === 'true' })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                    >
                      <option value="false">Não</option>
                      <option value="true">Sim</option>
                    </select>
                  </div>
                  {novaConferencia.houveDivergencia && (
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Tipo de Divergência</label>
                      <select 
                        value={novaConferencia.tipoDivergencia || ''} 
                        onChange={(e) => setNovaConferencia({ ...novaConferencia, tipoDivergencia: e.target.value as any })}
                        style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                      >
                        <option value="">Selecione...</option>
                        <option value="valor">Valor</option>
                        <option value="kg">Peso/Kg</option>
                        <option value="quantidade">Quantidade</option>
                      </select>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Observações</label>
                  <textarea 
                    placeholder="Detalhes da conferência..." 
                    value={novaConferencia.observacoes} 
                    onChange={(e) => setNovaConferencia({ ...novaConferencia, observacoes: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', minHeight: '60px', resize: 'vertical' }}
                  />
                </div>
                <button 
                  onClick={adicionarConferencia}
                  style={{ marginTop: '12px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ✓ Registrar Conferência
                </button>
              </div>

              {/* SUB-ABAS */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', borderBottom: '2px solid #e2e8f0', paddingBottom: '0' }}>
                {(['pedidos', 'conferidos', 'divergencias'] as const).map(aba => (
                  <button 
                    key={aba}
                    onClick={() => setAbaConferencia(aba)}
                    style={{ 
                      backgroundColor: abaConferencia === aba ? '#2563eb' : '#ffffff', 
                      color: abaConferencia === aba ? '#ffffff' : '#334155', 
                      border: '1px solid #cbd5e1', 
                      borderBottom: abaConferencia === aba ? 'none' : '1px solid #cbd5e1',
                      borderRadius: '6px 6px 0 0', 
                      padding: '10px 16px', 
                      fontSize: '12px', 
                      fontWeight: 'bold', 
                      cursor: 'pointer',
                      transform: abaConferencia === aba ? 'translateY(2px)' : 'none'
                    }}
                  >
                    {aba === 'pedidos' && `📦 Pedidos Pendentes (${buscaFornecedorConferencia.trim() ? pedidosPendentesFiltrados.length : pedidosPendentesTotal})`}
                    {aba === 'conferidos' && `✅ Conferidos (${buscaFornecedorConferencia.trim() ? conferenciasFiltradas.length : conferencias.length})`}
                    {aba === 'divergencias' && `⚠️ Divergências (${buscaFornecedorConferencia.trim() ? divergenciasFiltradas.length : conferencias.filter(c => c.houveDivergencia).length})`}
                  </button>
                ))}
              </div>

              {/* ABA: PEDIDOS PENDENTES */}
              {abaConferencia === 'pedidos' && (
                <div>
                  {pedidosPendentesConferencia.length === 0 ? (
                    <div style={{ padding: '40px 20px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎉</div>
                      <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>Nenhum pedido pendente!</strong>
                      Todos os pedidos já foram conferidos. Gere novos pedidos na aba de Cotação.
                    </div>
                  ) : pedidosPendentesFiltrados.length === 0 ? (
                    <div style={{ padding: '40px 20px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '6px', textAlign: 'center', color: '#9a3412', fontSize: '13px' }}>
                      <strong style={{ display: 'block', fontSize: '14px', color: '#7c2d12', marginBottom: '4px' }}>Nenhum pedido aberto deste fornecedor</strong>
                      Não achei “{buscaFornecedorConferencia.trim()}” nos Pedidos Pendentes. Confira o nome ou limpe a pesquisa.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {pedidosPendentesFiltrados.map(relatorio => (
                        <section key={relatorio.id} style={{ width: '100%', boxSizing: 'border-box', border: '2px solid #2563eb', borderRadius: '6px', padding: '14px', backgroundColor: '#ffffff' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', backgroundColor: '#eff6ff', borderBottom: '1px solid #bfdbfe', margin: '-14px -14px 10px', padding: '10px 14px' }}>
                            <div>
                              <strong style={{ display: 'block', fontSize: '14px', color: '#1e3a8a' }}>
                                📦 {relatorio.itens[0]?.fornecedor || 'Fornecedor não informado'}
                              </strong>
                              <span style={{ fontSize: '11px', color: '#475569' }}>
                                {relatorio.data} • {relatorio.itens.length} item(ns) • 
                                <strong style={{ color: '#1e3a8a' }}> Valor Nota: R$ {relatorio.totalGeral.toFixed(2)}</strong>
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                              {podeExcluirPedidoConferencia && (
                                <button onClick={() => excluirPedidoNaConferencia(relatorio.id)} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '4px', padding: '4px 10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                                  Excluir pedido
                                </button>
                              )}
                              {!relatorio.pdfFornecedor ? (
                                <button onClick={() => anexarPdfFornecedor(relatorio)} style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', borderRadius: '4px', padding: '4px 10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                                  📎 Anexar PDF do fornecedor
                                </button>
                              ) : (
                                <>
                                  <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #fcd34d' }}>
                                    📄 {relatorio.pdfFornecedor.nome}
                                  </span>
                                  <button onClick={() => visualizarPdfFornecedor(relatorio)} style={{ backgroundColor: '#ffffff', color: '#1e3a8a', border: '1px solid #93c5fd', borderRadius: '4px', padding: '3px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    👁️ Ver
                                  </button>
                                  <a href={relatorio.pdfFornecedor.conteudo} download={relatorio.pdfFornecedor.nome} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none' }}>
                                    ⬇️
                                  </a>
                                </>
                              )}
                            </div>
                          </div>

                          <div style={{ marginTop: '7px', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                            {Object.entries<any[]>(relatorio.itens.reduce((grupos, item) => { (grupos[item.fornecedor] ||= []).push(item); return grupos; }, {} as { [fornecedor: string]: any[] })).map(([fornecedor, itensFornecedor]) => (
                              <div key={`${relatorio.id}-${fornecedor}`}>
                                {itensFornecedor.map((item, indice) => (
                                  <div key={`${relatorio.id}-${fornecedor}-${indice}`} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 90px', gap: '6px', fontSize: '11px', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
                                    <span style={{ color: '#334155' }}>{item.produto}</span>
                                    <strong style={{ color: '#0f172a' }}>{item.quantidade} {item.unit}</strong>
                                    <span style={{ textAlign: 'right', color: '#334155' }}>R$ {item.valorTotal.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>

                          <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '5px' }}>
                            <strong style={{ display: 'block', fontSize: '11px', color: '#1e3a8a', marginBottom: '7px' }}>✓ Preencher Conferência deste Pedido</strong>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '6px' }}>
                              <input placeholder="Nome do conferente" value={conferenciasPorPedido[relatorio.id]?.conferente || ''} onChange={event => atualizarConferenciaPedido(relatorio.id, 'conferente', event.target.value)} style={{ padding: '6px', border: '1px solid #93c5fd', borderRadius: '4px', fontSize: '11px' }} />
                              <input placeholder="Valor recebido (R$)" value={conferenciasPorPedido[relatorio.id]?.valor || ''} onChange={event => atualizarConferenciaPedido(relatorio.id, 'valor', event.target.value)} style={{ padding: '6px', border: '1px solid #93c5fd', borderRadius: '4px', fontSize: '11px' }} />
                              <input placeholder="Detalhes / observações" value={conferenciasPorPedido[relatorio.id]?.obs || ''} onChange={event => atualizarConferenciaPedido(relatorio.id, 'obs', event.target.value)} style={{ padding: '6px', border: '1px solid #93c5fd', borderRadius: '4px', fontSize: '11px' }} />
                              <select value={conferenciasPorPedido[relatorio.id]?.tipoDivergencia || ''} onChange={event => atualizarConferenciaPedido(relatorio.id, 'tipoDivergencia', event.target.value)} style={{ padding: '6px', border: '1px solid #93c5fd', borderRadius: '4px', fontSize: '11px' }}>
                                <option value="">Sem divergência</option>
                                <option value="valor">Divergência de valor</option>
                                <option value="kg">Divergência de Kg</option>
                                <option value="quantidade">Divergência de quantidade</option>
                              </select>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#1e3a8a' }}>
                                <input type="checkbox" checked={conferenciasPorPedido[relatorio.id]?.divergencia || false} onChange={event => atualizarConferenciaPedido(relatorio.id, 'divergencia', event.target.checked)} /> Houve divergência
                              </label>
                            </div>

                            <button onClick={() => salvarConferenciaPedido(relatorio)} style={{ marginTop: '7px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '6px 14px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                              💾 Salvar e Marcar como Conferido
                            </button>
                          </div>
                        </section>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ABA: CONFERIDOS */}
              {abaConferencia === 'conferidos' && (
                <div>
                  {conferencias.length === 0 ? (
                    <div style={{ padding: '40px 20px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                      <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>Nenhuma conferência registrada ainda.</strong>
                      Conforme os pedidos chegarem, eles aparecerão aqui após serem conferidos.
                    </div>
                  ) : conferenciasFiltradas.length === 0 ? (
                    <div style={{ padding: '24px 20px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '6px', textAlign: 'center', color: '#9a3412', fontSize: '13px' }}>
                      Nenhuma conferência deste fornecedor.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {conferenciasFiltradas.map((conf) => (
                        <div key={conf.id} style={{ padding: '14px', backgroundColor: conf.houveDivergencia ? '#fff7ed' : '#ffffff', border: `1px solid ${conf.houveDivergencia ? '#fed7aa' : '#cbd5e1'}`, borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '13px', color: '#0f172a' }}>{conf.nomeConferente}</strong>
                              <span style={{ fontSize: '11px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{conf.data}</span>
                              {conf.fornecedor && (
                                <span style={{ fontSize: '11px', color: '#1e3a8a', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                  📦 {conf.fornecedor}
                                </span>
                              )}
                              {conf.houveDivergencia && (
                                <span style={{ fontSize: '10px', color: '#dc2626', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                  ⚠️ Divergência: {conf.tipoDivergencia}
                                </span>
                              )}
                              {!conf.houveDivergencia && (
                                <span style={{ fontSize: '10px', color: '#047857', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                  ✓ Sem divergências
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginBottom: '8px' }}>
                              {conf.valorEsperado !== undefined && (
                                <div style={{ fontSize: '11px', color: '#334155' }}>
                                  <strong>Valor Nota:</strong> R$ {conf.valorEsperado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                              )}
                              <div style={{ fontSize: '11px', color: '#334155' }}>
                                <strong>Valor Recebido:</strong> <span style={{ color: conf.valorEsperado && conf.valorRecebido !== conf.valorEsperado ? '#dc2626' : '#065f46', fontWeight: 'bold' }}>R$ {conf.valorRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                              {conf.valorEsperado !== undefined && conf.valorRecebido !== conf.valorEsperado && (
                                <div style={{ fontSize: '11px', color: '#dc2626' }}>
                                  <strong>Diferença:</strong> R$ {Math.abs(conf.valorRecebido - conf.valorEsperado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                              )}
                            </div>
                            {conf.itensConferidos && conf.itensConferidos.length > 0 && (
                              <details style={{ marginBottom: '6px' }}>
                                <summary style={{ fontSize: '11px', color: '#334155', cursor: 'pointer', fontWeight: 'bold' }}>
                                  📋 Ver itens conferidos ({conf.itensConferidos.length})
                                </summary>
                                <div style={{ marginTop: '6px', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                  {conf.itensConferidos.map((item, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 90px', gap: '6px', fontSize: '10px', borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none', paddingTop: idx > 0 ? '4px' : '0' }}>
                                      <span>{item.produto}</span>
                                      <strong>{item.quantidade} {item.unit}</strong>
                                      <span style={{ textAlign: 'right' }}>R$ {item.valorTotal.toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}
                            {(() => {
                              const pedidoOriginal = conf.pedidoId ? relatoriosPedidosCotacao.find(r => r.id === conf.pedidoId) : null;
                              if (!pedidoOriginal?.pdfFornecedor) return null;
                              return (
                                <div style={{ marginBottom: '6px', padding: '6px 10px', backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '14px' }}>📄</span>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#92400e' }}>{pedidoOriginal.pdfFornecedor.nome}</span>
                                    <span style={{ fontSize: '10px', color: '#64748b' }}>({pedidoOriginal.pdfFornecedor.anexadoEm})</span>
                                  </div>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button onClick={() => setPdfFornecedorVisualizacao({ nome: pedidoOriginal.pdfFornecedor!.nome, conteudo: pedidoOriginal.pdfFornecedor!.conteudo })} style={{ backgroundColor: '#ffffff', color: '#1e3a8a', border: '1px solid #93c5fd', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                                      👁️ Ver
                                    </button>
                                    <a href={pedidoOriginal.pdfFornecedor.conteudo} download={pedidoOriginal.pdfFornecedor.nome} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none' }}>
                                      ⬇️ Baixar
                                    </a>
                                  </div>
                                </div>
                              );
                            })()}
                            {conf.observacoes && (
                              <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', borderLeft: '3px solid #cbd5e1', paddingLeft: '8px' }}>
                                "{conf.observacoes}"
                              </div>
                            )}
                          </div>
                          {podeExcluirPedidoConferencia && (
                          <button 
                            onClick={() => excluirConferencia(conf.id)}
                            style={{ color: '#ef4444', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 }}
                          >
                            ✕
                          </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ABA: DIVERGÊNCIAS */}
              {abaConferencia === 'divergencias' && (
                <div>
                  {conferencias.filter(c => c.houveDivergencia).length === 0 ? (
                    <div style={{ padding: '40px 20px', backgroundColor: '#ecfdf5', border: '1px solid #86efac', borderRadius: '6px', textAlign: 'center', color: '#065f46', fontSize: '13px' }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>✅</div>
                      <strong style={{ display: 'block', fontSize: '14px', color: '#064e3b', marginBottom: '4px' }}>Ótimo! Nenhuma divergência registrada.</strong>
                      Todas as conferências estão sem problemas.
                    </div>
                  ) : divergenciasFiltradas.length === 0 ? (
                    <div style={{ padding: '24px 20px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '6px', textAlign: 'center', color: '#9a3412', fontSize: '13px' }}>
                      Nenhuma divergência deste fornecedor.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {divergenciasFiltradas.map((conf) => (
                        <div key={conf.id} style={{ padding: '14px', backgroundColor: '#fff7ed', border: '2px solid #f97316', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', color: '#ffffff', backgroundColor: '#dc2626', padding: '3px 10px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                ⚠️ Divergência de {conf.tipoDivergencia}
                              </span>
                              <strong style={{ fontSize: '13px', color: '#0f172a' }}>{conf.nomeConferente}</strong>
                              <span style={{ fontSize: '11px', color: '#64748b', backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>{conf.data}</span>
                              {conf.fornecedor && (
                                <span style={{ fontSize: '11px', color: '#1e3a8a', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                  📦 {conf.fornecedor}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '8px' }}>
                              {conf.valorEsperado !== undefined && (
                                <div style={{ fontSize: '11px', color: '#334155', padding: '6px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #fed7aa' }}>
                                  <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Valor da Nota</div>
                                  <div style={{ fontSize: '15px', fontWeight: '900', color: '#1e3a8a' }}>R$ {conf.valorEsperado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                </div>
                              )}
                              <div style={{ fontSize: '11px', color: '#334155', padding: '6px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #fed7aa' }}>
                                <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Valor Recebido</div>
                                <div style={{ fontSize: '15px', fontWeight: '900', color: '#dc2626' }}>R$ {conf.valorRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                              </div>
                              {conf.valorEsperado !== undefined && (
                                <div style={{ fontSize: '11px', color: '#334155', padding: '6px', backgroundColor: '#fee2e2', borderRadius: '4px', border: '1px solid #fca5a5' }}>
                                  <div style={{ color: '#991b1b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Diferença</div>
                                  <div style={{ fontSize: '15px', fontWeight: '900', color: '#991b1b' }}>R$ {Math.abs(conf.valorRecebido - conf.valorEsperado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                </div>
                              )}
                            </div>
                            {(() => {
                              const pedidoOriginal = conf.pedidoId ? relatoriosPedidosCotacao.find(r => r.id === conf.pedidoId) : null;
                              if (!pedidoOriginal?.pdfFornecedor) return null;
                              return (
                                <div style={{ marginBottom: '8px', padding: '6px 10px', backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '14px' }}>📄</span>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#92400e' }}>{pedidoOriginal.pdfFornecedor.nome}</span>
                                    <span style={{ fontSize: '10px', color: '#64748b' }}>({pedidoOriginal.pdfFornecedor.anexadoEm})</span>
                                  </div>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button onClick={() => setPdfFornecedorVisualizacao({ nome: pedidoOriginal.pdfFornecedor!.nome, conteudo: pedidoOriginal.pdfFornecedor!.conteudo })} style={{ backgroundColor: '#ffffff', color: '#1e3a8a', border: '1px solid #93c5fd', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                                      👁️ Ver
                                    </button>
                                    <a href={pedidoOriginal.pdfFornecedor.conteudo} download={pedidoOriginal.pdfFornecedor.nome} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none' }}>
                                      ⬇️ Baixar
                                    </a>
                                  </div>
                                </div>
                              );
                            })()}
                            {conf.observacoes && (
                              <div style={{ fontSize: '11px', color: '#334155', backgroundColor: '#ffffff', border: '1px solid #fed7aa', borderRadius: '4px', padding: '8px' }}>
                                <strong style={{ color: '#9a3412' }}>📝 Observações:</strong><br />
                                "{conf.observacoes}"
                              </div>
                            )}
                          </div>
                          {podeExcluirPedidoConferencia && (
                          <button 
                            onClick={() => excluirConferencia(conf.id)}
                            style={{ color: '#ef4444', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 }}
                          >
                            ✕
                          </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
  );
}
