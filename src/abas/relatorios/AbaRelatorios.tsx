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
  return (

          <section style={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '20px', marginTop: '20px' }}>
            <button onClick={() => setTabAtiva('pendencias')} style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '5px', padding: '7px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '14px' }}>← Voltar ao sistema</button>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>📈 Relatórios e Estatísticas</h2>
                <input 
                  type="date" 
                  value={dataSelecionada} 
                  onChange={(e) => setDataSelecionada(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '4px', border: '2px solid #cbd5e1', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}
                />
              </div>

              {(() => {
                const dadosData = relatoriosPorData[dataSelecionada] || { pendentes: 0, concluidas: 0, pagamentos: 0, conferencias: 0 };
                const isSelecionadoHoje = dataSelecionada === new Date().toISOString().split('T')[0];
                const economiaPorFornecedor = fornecedoresCotacao.map(fornecedor => {
                  const itensDoFornecedor = itensCotacao.filter(item => {
                    const quantidade = qtdPedirNumero(item);
                    return quantidade > 0 && calcularMenorPrecoItem(item).vencedorFornId === fornecedor.id;
                  });
                  const valores = itensDoFornecedor.map(item => {
                    const quantidade = qtdPedirNumero(item);
                    const precosValidos = Object.values(item.precos || {}).map((preco: any) => parseFloat(String(preco).replace(',', '.'))).filter(preco => !Number.isNaN(preco) && preco > 0);
                    const menor = calcularMenorPrecoItem(item).menorPreco || 0;
                    const referencia = (precosValidos.length ? Math.max(...precosValidos) : menor) * quantidade;
                    const pago = menor * quantidade;
                    return { referencia, pago };
                  });
                  const referencia = valores.reduce((total, item) => total + item.referencia, 0);
                  const pago = valores.reduce((total, item) => total + item.pago, 0);
                  const economia = referencia - pago;
                  return { fornecedor, referencia, economia, percentual: referencia > 0 ? (economia / referencia) * 100 : 0 };
                }).filter(item => item.referencia > 0);
                
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ backgroundColor: '#f0f9ff', borderLeft: '3px solid #0f172a', padding: '10px 12px', borderRadius: '5px' }}>
                      <h3 style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Tarefas Pendentes</h3>
                      <p style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{isSelecionadoHoje ? setores.reduce((acc, s) => acc + s.tarefas.filter(t => t.status === 'aberta').length, 0) : dadosData.pendentes}</p>
                      <p style={{ fontSize: '10px', color: '#64748b', margin: '4px 0 0 0' }}>Em {setores.length} setores</p>
                    </div>

                    <div style={{ backgroundColor: '#f0fdf4', borderLeft: '3px solid #059669', padding: '10px 12px', borderRadius: '5px' }}>
                      <h3 style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Tarefas Concluídas</h3>
                      <p style={{ fontSize: '18px', fontWeight: '900', color: '#059669', margin: 0 }}>{isSelecionadoHoje ? setores.reduce((acc, s) => acc + s.tarefas.filter(t => t.status === 'concluida').length, 0) : dadosData.concluidas}</p>
                      <p style={{ fontSize: '10px', color: '#64748b', margin: '4px 0 0 0' }}>Completas</p>
                    </div>

                    <div style={{ backgroundColor: '#fef3c7', borderLeft: '3px solid #059669', padding: '10px 12px', borderRadius: '5px' }}>
                      <h3 style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Total Pagamentos</h3>
                      <p style={{ fontSize: '18px', fontWeight: '900', color: '#059669', margin: 0 }}>R$ {isSelecionadoHoje ? ((pagamentos.caixa.reduce((a, i) => a + i.valor, 0) + pagamentos.cheque.reduce((a, i) => a + i.valor, 0) + pagamentos.caben.reduce((a, i) => a + i.valor, 0))).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : dadosData.pagamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p style={{ fontSize: '10px', color: '#64748b', margin: '4px 0 0 0' }}>Registrados</p>
                    </div>

                    <div style={{ backgroundColor: '#fce7f3', borderLeft: '3px solid #2563eb', padding: '10px 12px', borderRadius: '5px' }}>
                      <h3 style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Conferências</h3>
                      <p style={{ fontSize: '18px', fontWeight: '900', color: '#2563eb', margin: 0 }}>{isSelecionadoHoje ? conferencias.length : dadosData.conferencias}</p>
                      <p style={{ fontSize: '10px', color: '#64748b', margin: '4px 0 0 0' }}>Registradas</p>
                    </div>
                  <div style={{ gridColumn: '1 / -1', marginTop: '4px', padding: '12px', backgroundColor: '#ecfdf5', border: '1px solid #86efac', borderRadius: '6px' }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '13px', color: '#065f46' }}>Economia por fornecedor</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                      {economiaPorFornecedor.length === 0 ? <span style={{ fontSize: '11px', color: '#64748b' }}>Nenhuma compra com preços comparáveis.</span> : economiaPorFornecedor.map(item => <div key={item.fornecedor.id} style={{ padding: '9px', backgroundColor: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '5px' }}><strong style={{ display: 'block', fontSize: '11px', color: '#334155' }}>{item.fornecedor.nome}</strong><span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>Referência: R$ {item.referencia.toFixed(2)}</span><strong style={{ display: 'block', marginTop: '3px', fontSize: '13px', color: '#047857' }}>Economia: R$ {item.economia.toFixed(2)} ({item.percentual.toFixed(1)}%)</strong></div>)}
                    </div>
                  </div>
                  </div>
                );
              })()}

              <div style={{ marginTop: '30px', padding: '18px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>Pedidos por fornecedor</h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>Cada produto está no fornecedor com o menor preço.</p>
                  </div>
                  <button onClick={imprimirRelatorioPedidosPorVendedor} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '7px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Imprimir todos</button>
                </div>
                {fornecedoresCotacao.map(fornecedor => {
                  const itensDoFornecedor = itensCotacao.filter(item => {
                    const quantidade = qtdPedirNumero(item);
                    return quantidade > 0 && calcularMenorPrecoItem(item).vencedorFornId === fornecedor.id;
                  });
                  if (itensDoFornecedor.length === 0) return null;
                  return (
                    <div key={fornecedor.id} style={{ marginBottom: '12px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', padding: '8px 10px', backgroundColor: '#0f172a' }}>
                        <strong style={{ color: '#ffffff', fontSize: '12px' }}>{fornecedor.nome}</strong>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={() => imprimirPedidoIndividual(fornecedor)} style={{ backgroundColor: '#ffffff', color: '#0f172a', border: 'none', borderRadius: '3px', padding: '4px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Imprimir pedido</button>
                          <button onClick={() => enviarPedidoWhatsAppPdf(fornecedor, itensDoFornecedor)} style={{ backgroundColor: '#25d366', color: '#ffffff', border: 'none', borderRadius: '3px', padding: '4px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>WhatsApp PDF</button>
                        </div>
                      </div>
                  {itensDoFornecedor.map(item => <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: '8px', padding: '7px 10px', borderBottom: '1px solid #e2e8f0', fontSize: '11px' }}><span>{item.produto}</span><span>{item.unit}</span><strong style={{ textAlign: 'right' }}>{item.qtdPedir}</strong></div>)}
                </div>
              );
            })}
            {itensCotacao.filter(item => qtdPedirNumero(item) > 0 && !calcularMenorPrecoItem(item).vencedorFornId).length > 0 && <div style={{ padding: '10px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '4px', fontSize: '11px', color: '#9a3412' }}>Existem produtos com quantidade preenchida, mas ainda sem preço para definir o fornecedor.</div>}
          </div>

          <div style={{ marginTop: '30px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 12px 0', textTransform: 'uppercase' }}>Resumo por Setor</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f1f5f9' }}>
                  <tr>
                    <th style={{ padding: '10px 12px', fontSize: '11px', color: '#0f172a', fontWeight: 'bold', borderBottom: '2px solid #cbd5e1' }}>Setor</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px', color: '#0f172a', fontWeight: 'bold', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>Tarefas Abertas</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px', color: '#0f172a', fontWeight: 'bold', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>Tarefas Concluídas</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px', color: '#0f172a', fontWeight: 'bold', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>Total</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px', color: '#0f172a', fontWeight: 'bold', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>Taxa Conclusão</th>
                  </tr>
                </thead>
                <tbody>
                  {setores.map((setor, idx) => {
                    const abertas = setor.tarefas.filter(t => t.status === 'aberta').length;
                    const concluidas = setor.tarefas.filter(t => t.status === 'concluida').length;
                    const total = setor.tarefas.length;
                    const taxa = total === 0 ? 0 : Math.round((concluidas / total) * 100);
                    return (
                      <tr key={setor.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '12px', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>{nomeSetorSemEmoji(setor.nome)}</td>
                        <td style={{ padding: '12px', fontSize: '12px', textAlign: 'center', color: '#ef4444', fontWeight: 'bold' }}>{abertas}</td>
                        <td style={{ padding: '12px', fontSize: '12px', textAlign: 'center', color: '#059669', fontWeight: 'bold' }}>{concluidas}</td>
                        <td style={{ padding: '12px', fontSize: '12px', textAlign: 'center', color: '#0f172a', fontWeight: 'bold' }}>{total}</td>
                        <td style={{ padding: '12px', fontSize: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${taxa}%`, height: '100%', backgroundColor: taxa >= 75 ? '#059669' : taxa >= 50 ? '#ea580c' : '#ef4444', transition: 'width 0.3s ease' }}></div>
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b' }}>{taxa}%</span>
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
