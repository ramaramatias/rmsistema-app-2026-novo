import { useState } from 'react';

export function AbaPendencias(p: {
  adicionarTarefaCentral: any;
  alternarStatusTarefa: any;
  escolherFotoPendencia: any;
  filtroResponsavel: any;
  filtroStatusTarefas: any;
  fotoAmpliada: any;
  mostrarHistoricoDelete: any;
  mudarResponsavel: any;
  nomeSetorSemEmoji: any;
  novaTarefaCentral: any;
  novaTarefaFoto: any;
  recuperarTarefa: any;
  removerTarefa: any;
  responsavelSelecionado: any;
  sairTelaInteira: any;
  setFiltroResponsavel: any;
  setFiltroStatusTarefas: any;
  setFotoAmpliada: any;
  setMostrarHistoricoDelete: any;
  setNovaTarefaCentral: any;
  setNovaTarefaFoto: any;
  setResponsavelSelecionado: any;
  setSairTelaInteira: any;
  setSetorSelecionadoNovaTarefa: any;
  setorRealDaTarefa: any;
  setorSelecionadoNovaTarefa: any;
  setores: any;
  setoresExibidos: any;
  statusDaTarefa: any;
  tarefasDeletadas: any;
  taxaConclusaoGeral: any;
  totalAbertasGeral: any;
  totalConcluidasGeral: any;
  usuariosDoSistema: any;
}) {
  const {
    adicionarTarefaCentral,
    alternarStatusTarefa,
    escolherFotoPendencia,
    filtroResponsavel,
    filtroStatusTarefas,
    fotoAmpliada,
    mostrarHistoricoDelete,
    mudarResponsavel,
    nomeSetorSemEmoji,
    novaTarefaCentral,
    novaTarefaFoto,
    recuperarTarefa,
    removerTarefa,
    responsavelSelecionado,
    sairTelaInteira,
    setFiltroResponsavel,
    setFiltroStatusTarefas,
    setFotoAmpliada,
    setMostrarHistoricoDelete,
    setNovaTarefaCentral,
    setNovaTarefaFoto,
    setResponsavelSelecionado,
    setSairTelaInteira,
    setSetorSelecionadoNovaTarefa,
    setorRealDaTarefa,
    setorSelecionadoNovaTarefa,
    setores,
    setoresExibidos,
    statusDaTarefa,
    tarefasDeletadas,
    taxaConclusaoGeral,
    totalAbertasGeral,
    totalConcluidasGeral,
    usuariosDoSistema
  } = p;
  return (
            <section className="mx-auto max-w-6xl">
              <p className="m-0 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">Operação</p>
              <h2 className="mb-3 mt-0 text-xl font-black tracking-tight text-slate-900">Pendências</h2>
              {!sairTelaInteira && <button onClick={() => setSairTelaInteira(true)} className="mb-3.5 cursor-pointer rounded-lg border-0 bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-800">Tela inteira</button>}
              {sairTelaInteira && <button onClick={() => setSairTelaInteira(false)} className="mb-3.5 cursor-pointer rounded-lg border-0 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">Voltar ao sistema</button>}
              <div className="mb-5 flex flex-wrap items-center justify-around gap-3.5 rounded-2xl bg-white px-5 py-3.5 ring-1 ring-slate-200">
                <button onClick={() => setFiltroStatusTarefas('todas')} className={`cursor-pointer rounded-xl px-3 py-1 text-center ${filtroStatusTarefas === 'todas' ? 'bg-slate-100 ring-1 ring-slate-200' : 'bg-transparent'}`}>
                  <div className="text-[11px] font-bold text-slate-800">Abertas</div>
                  <div className="text-xl font-black text-slate-900">{totalAbertasGeral}</div>
                </button>
                <button onClick={() => setFiltroStatusTarefas('concluida')} className={`cursor-pointer rounded-xl px-3 py-1 text-center ${filtroStatusTarefas === 'concluida' ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-transparent'}`}>
                  <div className="text-[11px] font-bold text-emerald-700">Concluídas (7 dias)</div>
                  <div className="text-xl font-black text-emerald-700">{totalConcluidasGeral}</div>
                </button>
                <div className="text-center">
                  <div className="text-[11px] font-bold text-amber-600">Taxa</div>
                  <div className="text-xl font-black text-amber-600">{taxaConclusaoGeral}%</div>
                </div>
              </div>
              {filtroStatusTarefas === 'concluida' && <div className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">Exibindo tarefas concluídas dos últimos 7 dias. Após 7 dias são excluídas automaticamente.</div>}

              <div className="mb-5 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <div className="mb-2 text-xs font-bold text-teal-800">Nova pendência</div>
                <div className="flex flex-wrap gap-2">
                  <input type="text" placeholder="Descreva a pendência..." value={novaTarefaCentral} onChange={e => setNovaTarefaCentral(e.target.value)} onKeyDown={e => e.key === 'Enter' && adicionarTarefaCentral()} className="min-w-[180px] flex-[1_1_240px] rounded-xl border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-teal-500" />
                  <select value={setorSelecionadoNovaTarefa} onChange={e => setSetorSelecionadoNovaTarefa(e.target.value)} className="flex-[1_1_180px] rounded-xl border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 outline-none">
                    {(Array.isArray(setores) ? setores : []).map(setor => <option key={setor.id} value={setor.id}>{nomeSetorSemEmoji(setor.nome)}</option>)}
                  </select>
                  <select value={responsavelSelecionado[setorSelecionadoNovaTarefa] || ''} onChange={e => setResponsavelSelecionado({ ...responsavelSelecionado, [setorSelecionadoNovaTarefa]: e.target.value })} className="flex-[1_1_150px] rounded-xl border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 outline-none">
                    <option value="">Responsável</option>
                    {(Array.isArray(usuariosDoSistema) ? usuariosDoSistema : []).map(u => <option key={u.id} value={u.nome}>{u.nome}</option>)}
                  </select>
                  <label className="cursor-pointer rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-bold text-teal-800 ring-1 ring-slate-200 hover:bg-teal-50">
                    Foto
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={event => escolherFotoPendencia(event)} />
                  </label>
                  <button onClick={adicionarTarefaCentral} className="cursor-pointer rounded-xl border-0 bg-teal-700 px-4 py-2.5 font-bold text-white hover:bg-teal-600">Adicionar</button>
                </div>
                {novaTarefaFoto && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={novaTarefaFoto} alt="Prévia da pendência" className="h-16 w-16 rounded-xl object-cover ring-1 ring-slate-200" />
                    <button type="button" onClick={() => setNovaTarefaFoto('')} className="cursor-pointer rounded-lg border-0 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700">Remover foto</button>
                  </div>
                )}
              </div>
              {Array.isArray(tarefasDeletadas) && tarefasDeletadas.length > 0 && (
                <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#92400e' }}>⚠️ {tarefasDeletadas.length} tarefa(s) deletada(s) • Clique para recuperar</span>
                  <button onClick={() => setMostrarHistoricoDelete(!mostrarHistoricoDelete)} style={{ backgroundColor: '#f59e0b', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {mostrarHistoricoDelete ? 'Ocultar' : 'Ver Histórico'}
                  </button>
                </div>
              )}

              {mostrarHistoricoDelete && Array.isArray(tarefasDeletadas) && tarefasDeletadas.length > 0 && (
                <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: '#92400e' }}>📋 Tarefas Deletadas (Pode Recuperar)</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {tarefasDeletadas.map(t => (
                      <div key={t.id} style={{ backgroundColor: '#ffffff', border: '1px solid #fcd34d', borderRadius: '6px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', display: 'block', marginBottom: '4px' }}>{t.texto}</span>
                          <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Criado por: {t.criador} • Data: {t.dataCriacao}</span>
                          <span style={{ fontSize: '10px', color: '#d97706', display: 'block' }}>🗑️ Deletado por: {t.deletadaPor} • {t.deletadaEm}</span>
                          <span style={{ fontSize: '9px', color: '#f59e0b', display: 'block', marginTop: '2px' }}>Setor: {(Array.isArray(setores) ? setores : []).find(s => s.id === t.setorId)?.nome}</span>
                        </div>
                        <button onClick={() => recuperarTarefa(t)} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0, marginLeft: '10px' }}>✓ Recuperar</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {(Array.isArray(setoresExibidos) ? setoresExibidos : []).map(setor => {
                  const tarefasDoBloco = Array.isArray(setor.tarefas) ? setor.tarefas : [];
                  return (
                  <div key={setor.id} className="rounded-2xl bg-white p-4.5 ring-1 ring-slate-200" style={{ borderTop: `4px solid ${setor.cor}`, padding: '18px' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0f172a' }}>{nomeSetorSemEmoji(setor.nome)}</h3>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                      <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', alignSelf: 'center' }}>Filtro:</label>
                      <select value={filtroResponsavel[setor.id] || ''} onChange={e => setFiltroResponsavel({ ...filtroResponsavel, [setor.id]: e.target.value })} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: '#ffffff', flex: 1 }}>
                        <option value="">Todos</option>
                        {(Array.isArray(usuariosDoSistema) ? usuariosDoSistema : []).map(u => <option key={u.id} value={u.nome}>{u.nome}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                      {tarefasDoBloco
                        .filter(t => {
                          // Em "todas", não mostrar concluídas (elas ficam disponíveis apenas na aba "concluida")
                          if (filtroStatusTarefas === 'todas' && statusDaTarefa(t) === 'concluida') return false;
                          if (filtroStatusTarefas === 'concluida' && statusDaTarefa(t) !== 'concluida') return false;
                          // Filtro por responsável
                          if (filtroResponsavel[setor.id] && t.responsavel !== filtroResponsavel[setor.id]) return false;
                          return true;
                        })
                        .map(t => (
                        <div key={t.id} className="flex items-start justify-between gap-2 rounded-xl border border-slate-200 p-2.5" style={{ backgroundColor: t.status === 'concluida' ? '#f8fafc' : '#fff' }}>
                          {t.foto ? (
                            <button type="button" onClick={() => setFotoAmpliada(t.foto || '')} className="mt-0.5 shrink-0 cursor-pointer border-0 bg-transparent p-0">
                              <img src={t.foto} alt={t.texto} className="h-14 w-14 rounded-lg object-cover ring-1 ring-slate-200" />
                            </button>
                          ) : (
                            <label className="mt-0.5 flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-slate-50 text-center text-[10px] font-bold leading-tight text-teal-800 ring-1 ring-slate-200">
                              + Foto
                              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={event => escolherFotoPendencia(event, { setorId: setorRealDaTarefa(setor.id, t.id), tarefaId: t.id })} />
                            </label>
                          )}
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '13px', fontWeight: 'bold', textDecoration: t.status === 'concluida' ? 'line-through' : 'none', color: t.status === 'concluida' ? '#94a3b8' : '#0f172a', display: 'block', marginBottom: '4px' }}>{t.texto}</span>
                            <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Criado por: {t.criador} • Data: {t.dataCriacao}</span>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                              <span style={{ fontSize: '9px', color: '#94a3b8' }}>⏰ {t.criadaEm}</span>
                              <select 
                                value={t.responsavel || ''} 
                                onChange={e => mudarResponsavel(setorRealDaTarefa(setor.id, t.id), t.id, e.target.value)}
                                style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '10px', backgroundColor: '#ffffff', cursor: 'pointer' }}
                              >
                                <option value="">Sem responsável</option>
                                {(Array.isArray(usuariosDoSistema) ? usuariosDoSistema : []).map(u => <option key={u.id} value={u.nome}>{u.nome}</option>)}
                              </select>
                              {t.responsavel && <span style={{ fontSize: '10px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold' }}>Responsável: {t.responsavel}</span>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                            <button onClick={() => alternarStatusTarefa(setorRealDaTarefa(setor.id, t.id), t.id)} style={{ fontSize: '10px', padding: '4px 8px', cursor: 'pointer', backgroundColor: t.status === 'concluida' ? '#fee2e2' : '#dcfce7', color: t.status === 'concluida' ? '#991b1b' : '#166534', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>{t.status === 'concluida' ? 'Reabrir' : 'Concluir'}</button>
                            <button onClick={() => removerTarefa(setorRealDaTarefa(setor.id, t.id), t.id)} style={{ color: '#0f766e', background: '#fee2e2', border: '1px solid #fca5a5', cursor: 'pointer', borderRadius: '4px', padding: '4px 8px', fontWeight: 'bold' }}>✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  );
                })}
              </div>
              {fotoAmpliada && (
                <div className="fixed inset-0 z-[10010] flex items-center justify-center bg-slate-950/80 p-5" onClick={() => setFotoAmpliada('')}>
                  <img src={fotoAmpliada} alt="Foto da pendência" className="max-h-[88vh] max-w-full rounded-2xl object-contain shadow-2xl" />
                </div>
              )}
            </section>
  );
}
