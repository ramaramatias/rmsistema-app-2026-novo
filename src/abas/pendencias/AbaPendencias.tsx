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
                    {setores.map(setor => <option key={setor.id} value={setor.id}>{nomeSetorSemEmoji(setor.nome)}</option>)}
                  </select>
                  <select value={responsavelSelecionado[setorSelecionadoNovaTarefa] || ''} onChange={e => setResponsavelSelecionado({ ...responsavelSelecionado, [setorSelecionadoNovaTarefa]: e.target.value })} className="flex-[1_1_150px] rounded-xl border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 outline-none">
                    <option value="">Responsável</option>
                    {usuariosDoSistema.map(u => <option key={u.id} value={u.nome}>{u.nome}</option>)}
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
              {tarefasDeletadas.length > 0 && (
                <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-300">
                  <span className="text-[13px] font-bold text-amber-900">⚠️ {tarefasDeletadas.length} tarefa(s) deletada(s) • Clique para recuperar</span>
                  <button type="button" onClick={() => setMostrarHistoricoDelete(!mostrarHistoricoDelete)} className="cursor-pointer rounded-lg border-0 bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-400">
                    {mostrarHistoricoDelete ? 'Ocultar' : 'Ver Histórico'}
                  </button>
                </div>
              )}

              {mostrarHistoricoDelete && tarefasDeletadas.length > 0 && (
                <div className="mb-5 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-300">
                  <h3 className="mb-3 mt-0 text-sm font-bold text-amber-900">📋 Tarefas Deletadas (Pode Recuperar)</h3>
                  <div className="flex flex-col gap-2.5">
                    {tarefasDeletadas.map(t => (
                      <div key={t.id} className="flex items-start justify-between gap-2.5 rounded-xl bg-white p-3 ring-1 ring-amber-200">
                        <div className="min-w-0 flex-1">
                          <span className="mb-1 block text-[13px] font-bold text-slate-900">{t.texto}</span>
                          <span className="mb-0.5 block text-[10px] text-slate-500">Criado por: {t.criador} • Data: {t.criadaEm}</span>
                          <span className="block text-[10px] text-amber-600">🗑️ Deletado por: {t.deletadaPor} • {t.deletadaEm}</span>
                          <span className="mt-0.5 block text-[9px] text-amber-500">Setor: {setores.find(s => s.id === t.setorId)?.nome}</span>
                        </div>
                        <button type="button" onClick={() => recuperarTarefa(t)} className="ml-2.5 shrink-0 cursor-pointer rounded-lg border-0 bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-400">✓ Recuperar</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {setoresExibidos.map(setor => {
                  const tarefasDoBloco = Array.isArray(setor.tarefas) ? setor.tarefas : [];
                  return (
                  <div key={setor.id} className="rounded-2xl border-t-4 bg-white p-[18px] ring-1 ring-slate-200" style={{ borderTopColor: setor.cor }}>
                    <h3 className="mb-3 mt-0 text-base font-bold text-slate-900">{nomeSetorSemEmoji(setor.nome)}</h3>
                    <div className="mb-3 flex items-center gap-1.5">
                      <label className="self-center text-[11px] font-bold text-slate-500">Quem criou / responsável:</label>
                      <select value={filtroResponsavel[setor.id] || ''} onChange={e => setFiltroResponsavel({ ...filtroResponsavel, [setor.id]: e.target.value })} className="flex-1 rounded-lg border-0 bg-white px-1.5 py-1.5 text-xs text-slate-900 ring-1 ring-slate-200 outline-none">
                        <option value="">Todos</option>
                        {usuariosDoSistema.map(u => <option key={u.id} value={u.nome}>{u.nome}</option>)}
                      </select>
                    </div>
                    <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto">
                      {(() => {
                        const tarefasVisiveis = tarefasDoBloco
                        .slice()
                        .sort((a, b) => Number(b.id) - Number(a.id) || String(b.criadaEm || '').localeCompare(String(a.criadaEm || '')))
                        .filter(t => {
                          if (filtroStatusTarefas === 'todas' && statusDaTarefa(t) === 'concluida') return false;
                          if (filtroStatusTarefas === 'concluida' && statusDaTarefa(t) !== 'concluida') return false;
                          const pessoa = filtroResponsavel[setor.id];
                          if (pessoa && t.responsavel !== pessoa && t.criador !== pessoa) return false;
                          return true;
                        });
                        if (tarefasVisiveis.length === 0) {
                          return <p className="m-0 text-xs text-slate-400">Nenhuma pendência aberta aqui. Confira o setor escolhido ao lançar.</p>;
                        }
                        return tarefasVisiveis.map(t => (
                        <div key={t.id} className={`flex items-start justify-between gap-2 rounded-xl p-2.5 ring-1 ring-slate-200 ${t.status === 'concluida' ? 'bg-slate-50' : 'bg-white'}`}>
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
                          <div className="min-w-0 flex-1">
                            <span className={`mb-1 block text-[13px] font-bold ${t.status === 'concluida' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{t.texto}</span>
                            {setor.id === 'pao-da-vida' && (
                              <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-teal-700">{nomeSetorSemEmoji(setores.find(s => (s.tarefas || []).some(x => x.id === t.id))?.nome || '')}</span>
                            )}
                            <span className="mb-0.5 block text-[10px] text-slate-500">Criado por: {t.criador} • Data: {t.dataCriacao}</span>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              <span className="text-[9px] text-slate-400">⏰ {t.criadaEm}</span>
                              <select
                                value={t.responsavel || ''}
                                onChange={e => mudarResponsavel(setorRealDaTarefa(setor.id, t.id), t.id, e.target.value)}
                                className="cursor-pointer rounded border-0 bg-white px-1 py-1 text-[10px] ring-1 ring-slate-200 outline-none"
                              >
                                <option value="">Sem responsável</option>
                                {usuariosDoSistema.map(u => <option key={u.id} value={u.nome}>{u.nome}</option>)}
                              </select>
                              {t.responsavel && <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">Responsável: {t.responsavel}</span>}
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-1.5">
                            <button type="button" onClick={() => alternarStatusTarefa(setorRealDaTarefa(setor.id, t.id), t.id)} className={`cursor-pointer rounded border-0 px-2 py-1 text-[10px] font-bold ${t.status === 'concluida' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>{t.status === 'concluida' ? 'Reabrir' : 'Concluir'}</button>
                            <button type="button" onClick={() => removerTarefa(setorRealDaTarefa(setor.id, t.id), t.id)} className="cursor-pointer rounded border-0 bg-rose-100 px-2 py-1 font-bold text-teal-700 ring-1 ring-rose-200">✕</button>
                          </div>
                        </div>
                      ));
                      })()}
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
