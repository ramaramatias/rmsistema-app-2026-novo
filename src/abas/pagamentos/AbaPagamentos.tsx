export function AbaPagamentos(p: {
  adicionarPagamentoCaben: any;
  adicionarPagamentoCaixa: any;
  adicionarPagamentoCheque: any;
  enviarRelatorioPagamentosPdf: any;
  fecharLotePagamentos: any;
  historicoPagamentos: any;
  imprimirRelatorioPagamentos: any;
  listaCabenSegura: any;
  listaCaixaSegura: any;
  listaChequeSegura: any;
  mostrarPastaHistorico: any;
  novoCaben: any;
  novoCaixa: any;
  novoCheque: any;
  pagamentos: any;
  removerLoteHistorico: any;
  removerPagamento: any;
  setMostrarPastaHistorico: any;
  setNovoCaben: any;
  setNovoCaixa: any;
  setNovoCheque: any;
  setTabAtiva: any;
  totalCaben: any;
  totalCaixa: any;
  totalCheque: any;
  totalGeralPagamentos: any;
}) {
  const {
    adicionarPagamentoCaben,
    adicionarPagamentoCaixa,
    adicionarPagamentoCheque,
    enviarRelatorioPagamentosPdf,
    fecharLotePagamentos,
    historicoPagamentos,
    imprimirRelatorioPagamentos,
    listaCabenSegura,
    listaCaixaSegura,
    listaChequeSegura,
    mostrarPastaHistorico,
    novoCaben,
    novoCaixa,
    novoCheque,
    pagamentos,
    removerLoteHistorico,
    removerPagamento,
    setMostrarPastaHistorico,
    setNovoCaben,
    setNovoCaixa,
    setNovoCheque,
    setTabAtiva,
    totalCaben,
    totalCaixa,
    totalCheque,
    totalGeralPagamentos
  } = p;
  return (
            <section style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '20px', border: '1px solid #cbd5e1' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                <button type="button" onClick={() => setTabAtiva('pagamentos')} style={{ backgroundColor: '#0f766e', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '10px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Pagamentos</button>
                <button type="button" onClick={() => setTabAtiva('reciboComprador')} style={{ backgroundColor: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '10px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Recibo</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <button onClick={() => setTabAtiva('compras')} style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '5px', padding: '7px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' }}>← Voltar para Compras</button>
                  <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '900', textTransform: 'uppercase' }}>💳 Gestão de Pagamentos</h2>
                  <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#0f766e' }}>Ao lançar (botão +), o pagamento é salvo na nuvem e aparece em qualquer computador ao entrar no site.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => imprimirRelatorioPagamentos(pagamentos, totalGeralPagamentos)} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🖨️ Imprimir / Visualizar</button>
                  <button onClick={() => enviarRelatorioPagamentosPdf(pagamentos, totalGeralPagamentos)} style={{ backgroundColor: '#25d366', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>WhatsApp PDF</button>
                  <button onClick={fecharLotePagamentos} style={{ backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🔒 Fechar Lote</button>
                  <button onClick={() => setMostrarPastaHistorico(!mostrarPastaHistorico)} style={{ backgroundColor: '#e2e8f0', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>📁 Histórico ({historicoPagamentos.length})</button>
                </div>
              </div>

              {/* Totais do Topo */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #0f766e', borderRadius: '6px', padding: '12px 16px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>PAGAMENTOS EM CAIXA</span>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f766e', marginTop: '4px' }}>R$ {totalCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #2563eb', borderRadius: '6px', padding: '12px 16px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>PAGAMENTOS EM CHEQUE</span>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#2563eb', marginTop: '4px' }}>R$ {totalCheque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #7c3aed', borderRadius: '6px', padding: '12px 16px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>PAGAMENTOS CABEN</span>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#7c3aed', marginTop: '4px' }}>R$ {totalCaben.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #86efac', borderRadius: '6px', padding: '12px 16px', textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#065f46', fontWeight: 'bold' }}>TOTAL GERAL</span>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#059669', marginTop: '4px' }}>R$ {totalGeralPagamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>

              {/* As 3 Colunas Principais */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                
                {/* 1. CAIXA */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', backgroundColor: '#ffffff' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0f766e', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '2px solid #0f766e', paddingBottom: '6px' }}>💵 1. Caixa</h3>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                    <input type="text" placeholder="Descrição..." value={novoCaixa.descricao} onChange={e => setNovoCaixa({ ...novoCaixa, descricao: e.target.value })} style={{ flex: 2, padding: '7px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    <input type="text" placeholder="Valor (R$)" value={novoCaixa.valor} onChange={e => setNovoCaixa({ ...novoCaixa, valor: e.target.value })} onKeyDown={e => e.key === 'Enter' && adicionarPagamentoCaixa()} style={{ flex: 1, padding: '7px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    <button onClick={adicionarPagamentoCaixa} style={{ backgroundColor: '#0f766e', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer' }}>＋</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                    {listaCaixaSegura.length === 0 ? <span style={{ fontSize: '11px', color: '#94a3b8' }}>Nenhum lançamento no Caixa.</span> : listaCaixaSegura.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px' }}>
                        <span style={{ fontWeight: 'bold', color: '#334155' }}>{item.descricao}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: '#0f766e' }}>R$ {Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                          <button onClick={() => removerPagamento('caixa', item.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. CHEQUE */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', backgroundColor: '#ffffff' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#2563eb', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '2px solid #2563eb', paddingBottom: '6px' }}>📝 2. Cheque</h3>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                    <input type="text" placeholder="Favorecido / Motivo..." value={novoCheque.descricao} onChange={e => setNovoCheque({ ...novoCheque, descricao: e.target.value })} style={{ flex: 2, padding: '7px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    <input type="text" placeholder="Valor (R$)" value={novoCheque.valor} onChange={e => setNovoCheque({ ...novoCheque, valor: e.target.value })} onKeyDown={e => e.key === 'Enter' && adicionarPagamentoCheque()} style={{ flex: 1, padding: '7px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    <button onClick={adicionarPagamentoCheque} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer' }}>＋</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                    {listaChequeSegura.length === 0 ? <span style={{ fontSize: '11px', color: '#94a3b8' }}>Nenhum lançamento em Cheque.</span> : listaChequeSegura.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px' }}>
                        <span style={{ fontWeight: 'bold', color: '#334155' }}>{item.descricao}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: '#2563eb' }}>R$ {Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                          <button onClick={() => removerPagamento('cheque', item.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. CABEN */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', backgroundColor: '#ffffff' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#7c3aed', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '2px solid #7c3aed', paddingBottom: '6px' }}>🏢 3. CABEN</h3>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                    <input type="text" placeholder="Descrição..." value={novoCaben.descricao} onChange={e => setNovoCaben({ ...novoCaben, descricao: e.target.value })} style={{ flex: 2, padding: '7px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    <input type="text" placeholder="Valor (R$)" value={novoCaben.valor} onChange={e => setNovoCaben({ ...novoCaben, valor: e.target.value })} onKeyDown={e => e.key === 'Enter' && adicionarPagamentoCaben()} style={{ flex: 1, padding: '7px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    <button onClick={adicionarPagamentoCaben} style={{ backgroundColor: '#7c3aed', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer' }}>＋</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                    {listaCabenSegura.length === 0 ? <span style={{ fontSize: '11px', color: '#94a3b8' }}>Nenhum lançamento no CABEN.</span> : listaCabenSegura.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px' }}>
                        <span style={{ fontWeight: 'bold', color: '#334155' }}>{item.descricao}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: '#7c3aed' }}>R$ {Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                          <button onClick={() => removerPagamento('caben', item.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Histórico de Lotes Fechados */}
              <div style={{ marginTop: '24px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0f172a' }}>📁 Histórico de Lotes Fechados ({historicoPagamentos.length})</h3>
                  {historicoPagamentos.length === 0 ? <span style={{ fontSize: '12px', color: '#64748b' }}>Nenhum lote foi fechado ainda.</span> : historicoPagamentos.map(lote => (
                    <div key={lote.id} style={{ padding: '10px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <div>
                          <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a' }}>Fechamento: {lote.dataFechamento}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>Caixa: R$ {lote.totalCaixa.toFixed(2)} | Cheque: R$ {lote.totalCheque.toFixed(2)} | CABEN: R$ {lote.totalCaben.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <strong style={{ fontSize: '14px', color: '#059669' }}>Total: R$ {lote.totalGeral.toFixed(2)}</strong>
                          <button onClick={() => imprimirRelatorioPagamentos(lote.dados, lote.totalGeral, lote.dataFechamento)} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '5px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>🖨️ Ver</button>
                          <button onClick={() => enviarRelatorioPagamentosPdf(lote.dados, lote.totalGeral, lote.dataFechamento)} style={{ backgroundColor: '#25d366', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '5px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>WhatsApp PDF</button>
                          <button onClick={() => removerLoteHistorico(lote.id)} style={{ color: '#ef4444', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '4px', padding: '5px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Excluir</button>
                        </div>
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#334155', lineHeight: 1.45 }}>
                        {(lote.dados?.caixa || []).length > 0 && <div><strong>Caixa:</strong> {(lote.dados.caixa || []).map(i => `${i.descricao} (R$ ${Number(i.valor).toFixed(2)})`).join(', ')}</div>}
                        {(lote.dados?.cheque || []).length > 0 && <div><strong>Cheque:</strong> {(lote.dados.cheque || []).map(i => `${i.descricao} (R$ ${Number(i.valor).toFixed(2)})`).join(', ')}</div>}
                        {(lote.dados?.caben || []).length > 0 && <div><strong>CABEN:</strong> {(lote.dados.caben || []).map(i => `${i.descricao} (R$ ${Number(i.valor).toFixed(2)})`).join(', ')}</div>}
                      </div>
                    </div>
                  ))}
                </div>
            </section>
  );
}
