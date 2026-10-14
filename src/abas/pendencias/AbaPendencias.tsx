import { DIAS_HISTORICO_DELETADAS, diasRestantesHistoricoDeletada, ehHistoricoDeletada } from '../../util/mesclar';

// ---- Classes Tailwind compartilhadas (mesmo padrão visual da aba de Produção) ----
const campo = 'box-border w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15';
const rotulo = 'flex min-w-0 flex-col gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500';
const botaoPrimario = 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg active:scale-[0.98]';
const botaoSecundario = 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]';
const titulo = 'mb-3 mt-0 flex items-center gap-2 text-sm font-black tracking-tight text-slate-800';
const selectMini = 'box-border min-w-0 cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';

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

  const vendoConcluidas = filtroStatusTarefas === 'concluida';
  const taxa = Math.max(0, Math.min(100, Number(taxaConclusaoGeral) || 0));
  // Só o que ainda está dentro dos 7 dias; as lápides (só id) ficam escondidas
  const historicoDeletadas = (Array.isArray(tarefasDeletadas) ? tarefasDeletadas : []).filter(ehHistoricoDeletada);
  const textoDiasRestantes = (restantes: number | null) => {
    if (restantes === null) return '';
    if (restantes === 0) return 'sai do histórico hoje';
    if (restantes === 1) return 'sai do histórico amanhã';
    return `sai do histórico em ${restantes} dias`;
  };

  return (
    <section className="mx-auto my-6 max-w-7xl rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-8">
      {/* Cabeçalho */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="m-0 mb-1 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700 ring-1 ring-teal-200">
            <span aria-hidden="true">📋</span> Operação
          </p>
          <h2 className="m-0 mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Pendências</h2>
          <p className="mb-0 mt-1.5 max-w-2xl text-sm text-slate-500">Tarefas por setor, com responsável, foto e histórico do que foi concluído ou apagado.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {!sairTelaInteira && (
            <button type="button" onClick={() => setSairTelaInteira(true)} className={botaoSecundario}>
              <span aria-hidden="true">⛶</span> Tela inteira
            </button>
          )}
          {sairTelaInteira && (
            <button type="button" onClick={() => setSairTelaInteira(false)} className={botaoSecundario}>
              <span aria-hidden="true">↩</span> Voltar ao sistema
            </button>
          )}
        </div>
      </header>

      {/* Resumo / filtros de status */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setFiltroStatusTarefas('todas')}
          aria-pressed={!vendoConcluidas}
          className={`cursor-pointer rounded-2xl border border-l-4 bg-gradient-to-br p-4 text-left shadow-sm transition active:scale-[0.99] ${
            !vendoConcluidas
              ? 'border-slate-200 border-l-slate-800 from-slate-50 to-white ring-2 ring-slate-800/80'
              : 'border-slate-200 border-l-slate-300 from-white to-white hover:border-slate-300 hover:shadow'
          }`}
        >
          <p className="m-0 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500"><span aria-hidden="true">🕒</span> Abertas</p>
          <p className="mb-0 mt-1.5 text-2xl font-black tracking-tight text-slate-900">{totalAbertasGeral}</p>
          <p className="mb-0 mt-1 text-xs font-semibold text-slate-500">{!vendoConcluidas ? 'Mostrando agora' : 'Clique para ver as abertas'}</p>
        </button>
        <button
          type="button"
          onClick={() => setFiltroStatusTarefas('concluida')}
          aria-pressed={vendoConcluidas}
          className={`cursor-pointer rounded-2xl border border-l-4 bg-gradient-to-br p-4 text-left shadow-sm transition active:scale-[0.99] ${
            vendoConcluidas
              ? 'border-emerald-200 border-l-emerald-500 from-emerald-50 to-white ring-2 ring-emerald-500/70'
              : 'border-slate-200 border-l-emerald-300 from-white to-white hover:border-emerald-200 hover:shadow'
          }`}
        >
          <p className="m-0 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500"><span aria-hidden="true">✅</span> Concluídas (7 dias)</p>
          <p className="mb-0 mt-1.5 text-2xl font-black tracking-tight text-emerald-700">{totalConcluidasGeral}</p>
          <p className="mb-0 mt-1 text-xs font-semibold text-slate-500">{vendoConcluidas ? 'Mostrando agora' : 'Clique para ver as concluídas'}</p>
        </button>
        <div className="rounded-2xl border border-slate-200 border-l-4 border-l-amber-400 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm">
          <p className="m-0 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500"><span aria-hidden="true">📈</span> Taxa de conclusão</p>
          <p className="mb-0 mt-1.5 text-2xl font-black tracking-tight text-amber-600">{taxaConclusaoGeral}%</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-amber-100" role="progressbar" aria-valuenow={taxa} aria-valuemin={0} aria-valuemax={100} aria-label="Taxa de conclusão">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500" style={{ width: `${taxa}%` }} />
          </div>
        </div>
      </div>

      {vendoConcluidas && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
          <span aria-hidden="true">ℹ️</span>
          <span>Exibindo tarefas concluídas dos últimos 7 dias. Depois disso elas são excluídas automaticamente.</span>
        </div>
      )}

      {/* Nova pendência */}
      <h3 className={titulo}>
        <span className="inline-block h-5 w-1 rounded-full bg-teal-500" aria-hidden="true" />
        Nova pendência
      </h3>
      <div className="mb-6 grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 md:grid-cols-6">
        <label className={`${rotulo} col-span-2 md:col-span-6`}>
          Descrição
          <input
            type="text"
            placeholder="Descreva a pendência..."
            value={novaTarefaCentral}
            onChange={e => setNovaTarefaCentral(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && adicionarTarefaCentral()}
            className={campo}
          />
        </label>
        <label className={`${rotulo} col-span-2 md:col-span-2`}>
          Setor
          <select value={setorSelecionadoNovaTarefa} onChange={e => setSetorSelecionadoNovaTarefa(e.target.value)} className={campo}>
            {setores.map(setor => <option key={setor.id} value={setor.id}>{nomeSetorSemEmoji(setor.nome)}</option>)}
          </select>
        </label>
        <label className={`${rotulo} col-span-2 md:col-span-2`}>
          Responsável
          <select value={responsavelSelecionado[setorSelecionadoNovaTarefa] || ''} onChange={e => setResponsavelSelecionado({ ...responsavelSelecionado, [setorSelecionadoNovaTarefa]: e.target.value })} className={campo}>
            <option value="">Sem responsável</option>
            {usuariosDoSistema.map(u => <option key={u.id} value={u.nome}>{u.nome}</option>)}
          </select>
        </label>
        <div className={`${rotulo} col-span-2 md:col-span-2`}>
          <span>Ações</span>
          <div className="flex gap-2">
            <label className={`${botaoSecundario} flex-1 normal-case tracking-normal`}>
              <span aria-hidden="true">📷</span> {novaTarefaFoto ? 'Trocar foto' : 'Foto'}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={event => escolherFotoPendencia(event)} />
            </label>
            <button type="button" onClick={adicionarTarefaCentral} className={`${botaoPrimario} flex-1 normal-case tracking-normal`}>
              <span aria-hidden="true">＋</span> Adicionar
            </button>
          </div>
        </div>
        {novaTarefaFoto && (
          <div className="col-span-2 flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white/70 p-3 md:col-span-6">
            <img src={novaTarefaFoto} alt="Prévia da pendência" className="h-16 w-16 rounded-xl object-cover ring-1 ring-slate-200" />
            <div className="min-w-0 flex-1">
              <p className="m-0 text-xs font-bold text-slate-700">Foto anexada</p>
              <p className="m-0 text-[11px] text-slate-500">Ela será salva junto com a pendência.</p>
            </div>
            <button type="button" onClick={() => setNovaTarefaFoto('')} className="cursor-pointer rounded-lg border-0 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700 transition hover:bg-rose-100">Remover foto</button>
          </div>
        )}
      </div>

      {/* Tarefas deletadas */}
      {historicoDeletadas.length > 0 && (
        <div className={`mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 ${mostrarHistoricoDelete ? '' : 'shadow-sm'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <span className="flex min-w-0 flex-col gap-0.5 text-sm font-bold text-amber-900">
              <span className="flex items-center gap-2">
                <span aria-hidden="true">🗑️</span>
                {historicoDeletadas.length} {historicoDeletadas.length === 1 ? 'tarefa deletada' : 'tarefas deletadas'}
                <span className="hidden text-xs font-semibold text-amber-700 sm:inline">· podem ser recuperadas</span>
              </span>
              <span className="text-[11px] font-semibold text-amber-700">Ficam no histórico por {DIAS_HISTORICO_DELETADAS} dias e depois são removidas automaticamente.</span>
            </span>
            <button type="button" onClick={() => setMostrarHistoricoDelete(!mostrarHistoricoDelete)} className="cursor-pointer rounded-xl border-0 bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-amber-400 active:scale-[0.98]">
              {mostrarHistoricoDelete ? 'Ocultar histórico' : 'Ver histórico'}
            </button>
          </div>
          {mostrarHistoricoDelete && (
            <div className="border-t border-amber-200 bg-white/60 p-4">
              <div className="flex flex-col gap-2.5">
                {historicoDeletadas.map(t => {
                  const restantes = diasRestantesHistoricoDeletada(t);
                  const urgente = restantes !== null && restantes <= 1;
                  return (
                    <div key={t.id} className="flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-white p-3 shadow-sm">
                      <div className="min-w-0 flex-1">
                        <span className="mb-1 block text-[13px] font-bold text-slate-900">{t.texto}</span>
                        <span className="block text-[11px] text-slate-500">Criado por <strong className="font-bold text-slate-700">{t.criador}</strong> · {t.criadaEm}</span>
                        <span className="block text-[11px] text-amber-700">Deletado por <strong className="font-bold">{t.deletadaPor}</strong> · {t.deletadaEm}</span>
                        <span className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">{nomeSetorSemEmoji(setores.find(s => s.id === t.setorId)?.nome || 'Setor')}</span>
                          {restantes !== null && (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${urgente ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-200' : 'bg-amber-100 text-amber-800 ring-1 ring-amber-200'}`}>
                              <span aria-hidden="true">⏳</span> {textoDiasRestantes(restantes)}
                            </span>
                          )}
                        </span>
                      </div>
                      <button type="button" onClick={() => recuperarTarefa(t)} className="shrink-0 cursor-pointer rounded-xl border-0 bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white shadow-sm transition hover:bg-emerald-500 active:scale-[0.98]">✓ Recuperar</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Setores */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {setoresExibidos.map(setor => {
          const tarefasDoBloco = Array.isArray(setor.tarefas) ? setor.tarefas : [];
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
          return (
            <div key={setor.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-1.5 w-full" style={{ backgroundColor: setor.cor }} aria-hidden="true" />
              <div className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="m-0 flex min-w-0 items-center gap-2 text-base font-black tracking-tight text-slate-900">
                    <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: setor.cor }} aria-hidden="true" />
                    <span className="truncate">{nomeSetorSemEmoji(setor.nome)}</span>
                  </h3>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tarefasVisiveis.length > 0 ? (vendoConcluidas ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-900 text-white') : 'bg-slate-100 text-slate-500'}`}>
                    {tarefasVisiveis.length}
                  </span>
                </div>
                <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <span className="shrink-0">Pessoa</span>
                  <select value={filtroResponsavel[setor.id] || ''} onChange={e => setFiltroResponsavel({ ...filtroResponsavel, [setor.id]: e.target.value })} className={`${selectMini} flex-1 normal-case tracking-normal`}>
                    <option value="">Todos (criador ou responsável)</option>
                    {usuariosDoSistema.map(u => <option key={u.id} value={u.nome}>{u.nome}</option>)}
                  </select>
                </label>

                <div className="flex max-h-[440px] flex-col gap-2 overflow-y-auto pr-0.5">
                  {tarefasVisiveis.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 px-3 py-8 text-center">
                      <p className="m-0 text-2xl" aria-hidden="true">{vendoConcluidas ? '📭' : '🎉'}</p>
                      <p className="mb-0 mt-1 text-xs font-semibold text-slate-500">{vendoConcluidas ? 'Nenhuma tarefa concluída nos últimos 7 dias.' : 'Nenhuma pendência aberta neste setor.'}</p>
                    </div>
                  )}
                  {tarefasVisiveis.map(t => {
                    const concluida = t.status === 'concluida';
                    const setorReal = setorRealDaTarefa(setor.id, t.id);
                    return (
                      <div key={t.id} className={`group flex items-start gap-3 rounded-xl border p-3 transition ${concluida ? 'border-emerald-100 bg-emerald-50/40' : 'border-slate-200 bg-white hover:border-teal-200 hover:shadow-sm'}`}>
                        {t.foto ? (
                          <button type="button" onClick={() => setFotoAmpliada(t.foto || '')} className="mt-0.5 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0 transition hover:opacity-90" aria-label="Ampliar foto">
                            <img src={t.foto} alt={t.texto} className="h-14 w-14 rounded-lg object-cover ring-1 ring-slate-200" />
                          </button>
                        ) : (
                          <label className="mt-0.5 flex h-14 w-14 shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center text-[10px] font-bold leading-tight text-teal-700 transition hover:border-teal-400 hover:bg-teal-50">
                            <span aria-hidden="true">📷</span>
                            Foto
                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={event => escolherFotoPendencia(event, { setorId: setorReal, tarefaId: t.id })} />
                          </label>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={`m-0 text-[13px] font-bold leading-snug ${concluida ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{t.texto}</p>
                          {setor.id === 'pao-da-vida' && (
                            <span className="mt-1 inline-block rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-700 ring-1 ring-teal-200">
                              {nomeSetorSemEmoji(setores.find(s => (s.tarefas || []).some(x => x.id === t.id))?.nome || '')}
                            </span>
                          )}
                          <p className="mb-0 mt-1 text-[11px] text-slate-500">
                            Criado por <strong className="font-bold text-slate-700">{t.criador}</strong>
                            {t.dataCriacao ? <> · {t.dataCriacao}</> : null}
                            {t.criadaEm ? <span className="text-slate-400"> · ⏰ {t.criadaEm}</span> : null}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <select
                              value={t.responsavel || ''}
                              onChange={e => mudarResponsavel(setorReal, t.id, e.target.value)}
                              className={`${selectMini} flex-1 ${t.responsavel ? 'border-sky-200 bg-sky-50 text-sky-800' : ''}`}
                              aria-label="Responsável pela tarefa"
                            >
                              <option value="">Sem responsável</option>
                              {usuariosDoSistema.map(u => <option key={u.id} value={u.nome}>{u.nome}</option>)}
                            </select>
                            <button
                              type="button"
                              onClick={() => alternarStatusTarefa(setorReal, t.id)}
                              className={`shrink-0 cursor-pointer whitespace-nowrap rounded-lg border-0 px-2.5 py-1 text-[11px] font-bold shadow-sm transition active:scale-[0.98] ${concluida ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                            >
                              {concluida ? '↩ Reabrir' : '✓ Concluir'}
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removerTarefa(setorReal, t.id)}
                          className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-sm font-bold text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 active:scale-[0.95]"
                          aria-label="Excluir tarefa"
                          title="Excluir tarefa"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {fotoAmpliada && (
        <div className="fixed inset-0 z-[10010] flex items-center justify-center bg-slate-950/85 p-5 backdrop-blur-sm" onClick={() => setFotoAmpliada('')} role="dialog" aria-modal="true" aria-label="Foto ampliada">
          <img src={fotoAmpliada} alt="Foto da pendência" className="max-h-[88vh] max-w-full rounded-2xl object-contain shadow-2xl" />
          <button type="button" onClick={() => setFotoAmpliada('')} className="absolute right-5 top-5 cursor-pointer rounded-full border-0 bg-white/90 px-3 py-1.5 text-sm font-bold text-slate-800 shadow-lg transition hover:bg-white" aria-label="Fechar foto">✕ Fechar</button>
        </div>
      )}
    </section>
  );
}
