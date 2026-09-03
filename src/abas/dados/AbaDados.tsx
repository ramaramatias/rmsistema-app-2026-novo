import { useState } from 'react';

export function AbaDados(p: {
  carregarTudo: () => void;
  gravarNaWeb: () => Promise<void> | void;
  conferencias: any[];
  fornecedoresCotacao: any[];
  historicoBackupsUsuario: any[];
  historicoPagamentos: any[];
  importarBackup: () => void;
  importarBackupConferencia: (event: React.ChangeEvent<HTMLInputElement>) => void;
  itensCotacao: any[];
  mostrarHistoricoBackups: boolean;
  pagamentos: { caixa?: any[]; cheque?: any[]; caben?: any[] };
  quantidadesElieuda: Record<string, any>;
  relatoriosPedidosCotacao: any[];
  restaurarBackupDoUsuarioAtual: (backup?: any) => void;
  restaurarUltimoBackup: () => void;
  setMostrarHistoricoBackups: (valor: boolean | ((atual: boolean) => boolean)) => void;
  setTabAtiva: (aba: string) => void;
  setores: { tarefas?: any[] }[];
  statusNuvem: string;
  ultimaAtualizacao: string;
  usuarioNome: string;
}) {
  const {
    carregarTudo,
    gravarNaWeb,
    conferencias,
    fornecedoresCotacao,
    historicoBackupsUsuario,
    historicoPagamentos,
    importarBackup,
    importarBackupConferencia,
    itensCotacao,
    mostrarHistoricoBackups,
    pagamentos,
    quantidadesElieuda,
    relatoriosPedidosCotacao,
    restaurarBackupDoUsuarioAtual,
    restaurarUltimoBackup,
    setMostrarHistoricoBackups,
    setTabAtiva,
    setores,
    statusNuvem,
    ultimaAtualizacao,
    usuarioNome
  } = p;

  const tarefas = (setores || []).reduce((total, setor) => total + (setor.tarefas || []).length, 0);
  const pagamentosAbertos = (pagamentos?.caixa || []).length + (pagamentos?.cheque || []).length + (pagamentos?.caben || []).length;
  const elieudaComQtd = Object.values(quantidadesElieuda && typeof quantidadesElieuda === 'object' ? quantidadesElieuda : {}).filter((item: any) =>
    Boolean(String(item?.terca || '').trim() || String(item?.quinta || '').trim() || String(item?.sabado || '').trim())
  ).length;

  const cartao = 'rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200';
  const botao = 'cursor-pointer rounded-xl px-3.5 py-2.5 text-xs font-bold transition';
  const botaoClaro = `${botao} bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50`;
  const botaoTeal = `${botao} bg-teal-700 text-white hover:bg-teal-600`;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 sm:p-6">
      <button type="button" onClick={() => setTabAtiva('pendencias')} className="mb-4 cursor-pointer rounded-lg bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-white">← Voltar ao sistema</button>
      <p className="m-0 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">Administração</p>
      <h2 className="m-0 text-xl font-black tracking-tight text-slate-900">Gerenciamento de dados</h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">O sistema já grava e busca da nuvem sozinho. Use os botões abaixo só se quiser forçar agora.</p>

      <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
        <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">{statusNuvem}</span>
        <span className="text-[11px] font-semibold text-slate-500">Última atualização: {ultimaAtualizacao}</span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className={cartao}>
          <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-slate-500">Pendências</p>
          <p className="m-0 mt-1 text-2xl font-black text-slate-900">{tarefas}</p>
          <p className="m-0 mt-1 text-[11px] text-slate-500">tarefas em todos os setores</p>
        </div>
        <div className={cartao}>
          <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-slate-500">Pagamentos</p>
          <p className="m-0 mt-1 text-2xl font-black text-slate-900">{pagamentosAbertos}</p>
          <p className="m-0 mt-1 text-[11px] text-slate-500">{historicoPagamentos.length} lote(s) no histórico</p>
        </div>
        <div className={cartao}>
          <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-slate-500">Cotação</p>
          <p className="m-0 mt-1 text-2xl font-black text-slate-900">{itensCotacao.length}</p>
          <p className="m-0 mt-1 text-[11px] text-slate-500">{fornecedoresCotacao.length} fornecedor(es)</p>
        </div>
        <div className={cartao}>
          <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-slate-500">Pedidos salvos</p>
          <p className="m-0 mt-1 text-2xl font-black text-slate-900">{relatoriosPedidosCotacao.length}</p>
          <p className="m-0 mt-1 text-[11px] text-slate-500">registro de pedidos da cotação</p>
        </div>
        <div className={cartao}>
          <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-slate-500">Conferências</p>
          <p className="m-0 mt-1 text-2xl font-black text-slate-900">{conferencias.length}</p>
          <p className="m-0 mt-1 text-[11px] text-slate-500">entregas conferidas</p>
        </div>
        <div className={cartao}>
          <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-slate-500">Elieuda</p>
          <p className="m-0 mt-1 text-2xl font-black text-slate-900">{elieudaComQtd}</p>
          <p className="m-0 mt-1 text-[11px] text-slate-500">produtos com quantidade neste pedido</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-teal-50/60 p-4 ring-1 ring-teal-200">
          <h3 className="m-0 text-sm font-black text-teal-900">1. Nuvem</h3>
          <p className="mt-1 text-sm text-slate-600">Manda o que está nesta tela para a internet. <strong>Não baixa arquivo no celular.</strong></p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => { void gravarNaWeb(); }} className={botaoTeal}>Salvar na nuvem</button>
          </div>
        </div>
        <div className="rounded-2xl bg-sky-50/60 p-4 ring-1 ring-sky-200">
          <h3 className="m-0 text-sm font-black text-sky-900">2. Sincronizar</h3>
          <p className="mt-1 text-sm text-slate-600">Traz o que já está na nuvem para esta tela.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => carregarTudo()} className={`${botao} bg-sky-700 text-white hover:bg-sky-600`}>Sincronizar agora</button>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl p-4 ring-1 ring-slate-200">
        <h3 className="m-0 text-sm font-black text-slate-900">Restaurar neste computador</h3>
        <p className="mt-1 text-sm text-slate-500">Volta uma cópia guardada neste navegador. Não apaga o histórico de pagamentos já fechado.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => restaurarBackupDoUsuarioAtual()} className={botaoClaro}>Meu backup</button>
          <button type="button" onClick={restaurarUltimoBackup} className={botaoClaro}>Último backup</button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl p-4 ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div>
            <h3 className="m-0 text-sm font-black text-slate-900">Proteção de {usuarioNome}</h3>
            <p className="m-0 mt-1 text-[11px] text-slate-500">{historicoBackupsUsuario.length} visita(s) protegida(s) neste navegador</p>
          </div>
          <button
            type="button"
            onClick={() => setMostrarHistoricoBackups(!mostrarHistoricoBackups)}
            className={botaoClaro}
          >
            {mostrarHistoricoBackups ? 'Ocultar histórico' : 'Ver histórico de visitas'}
          </button>
        </div>
        {mostrarHistoricoBackups && (
          <div className="mt-3 border-t border-slate-100 pt-2">
            {historicoBackupsUsuario.length === 0 ? (
              <span className="text-[11px] text-slate-500">Nenhum backup deste usuário foi registrado ainda.</span>
            ) : (
              historicoBackupsUsuario.map((backup: any, indice: number) => {
                const qtdTarefas = Array.isArray(backup.setores) ? backup.setores.reduce((total: number, setor: any) => total + (setor.tarefas || []).length, 0) : 0;
                return (
                  <div key={`${backup.salvoEm}-${indice}`} className={`flex items-center justify-between gap-2.5 py-2 ${indice < historicoBackupsUsuario.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <div>
                      <strong className="block text-[11px] text-slate-700">{backup.salvoEm ? new Date(backup.salvoEm).toLocaleString('pt-BR') : 'Sem data'}</strong>
                      <span className="text-[10px] text-slate-500">{qtdTarefas} tarefa(s) • atualização {backup.ultimaAtualizacao || 'não informada'}</span>
                    </div>
                    <button type="button" onClick={() => restaurarBackupDoUsuarioAtual(backup)} className="cursor-pointer rounded-lg bg-orange-50 px-3 py-1.5 text-[11px] font-bold text-orange-700 ring-1 ring-orange-200 hover:bg-orange-100">Restaurar esta visita</button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </section>
  );
}
