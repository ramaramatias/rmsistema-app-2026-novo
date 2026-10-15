import type { ReactNode } from 'react';

/**
 * Padrão visual compartilhado das abas (Tailwind).
 * Mantém cores, raios, sombras e tamanhos iguais em todo o sistema.
 */

// ---- Estrutura ----
export const secao = 'mx-auto my-6 max-w-7xl rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-8';
export const titulo = 'mb-3 mt-0 flex items-center gap-2 text-sm font-black tracking-tight text-slate-800';
export const marcadorTitulo = 'inline-block h-5 w-1 shrink-0 rounded-full bg-teal-500';
export const painelFormulario = 'mb-4 grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5';
export const painel = 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5';
export const contador = 'ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600';

// ---- Campos ----
export const campo = 'box-border w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15';
export const campoLeitura = `${campo} cursor-not-allowed bg-teal-50/60 font-black text-teal-800 hover:border-slate-200`;
export const campoMini = 'box-border min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';
export const rotulo = 'flex min-w-0 flex-col gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500';
export const selectMini = 'box-border min-w-0 cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';

// ---- Botões ----
export const botaoPrimario = 'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';
export const botaoSecundario = 'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';
export const botaoPerigo = 'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-600 shadow-sm transition hover:bg-rose-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';
export const botaoAlerta = 'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border-0 bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';
export const botaoInfo = 'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border-0 bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';
export const botaoMini = 'inline-flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';
export const botaoMiniPrimario = 'inline-flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-lg border-0 bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm transition hover:bg-emerald-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';
export const botaoMiniPerigo = 'inline-flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-bold text-rose-600 shadow-sm transition hover:bg-rose-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';
export const botaoExcluir = 'cursor-pointer rounded-lg border-0 bg-transparent px-2.5 py-1 text-[11px] font-bold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700';
export const botaoVoltar = 'inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900';

// ---- Tabelas ----
export const tabelaCaixa = 'overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm';
export const tabela = 'w-full border-collapse text-sm';
export const cabecalhoTabela = 'bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500';
export const th = 'whitespace-nowrap px-3 py-3';
export const linhaTabela = 'border-t border-slate-100 transition even:bg-slate-50/40 hover:bg-teal-50/50';
export const td = 'px-3 py-2.5 align-middle';
export const vazio = 'px-3 py-10 text-center text-sm text-slate-400';

// ---- Modais ----
export const modalFundo = 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm';
export const modalCaixa = 'w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl';
export const modalCaixaLarga = 'w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl';

// ---- Badges ----
export const badge = 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1';
export const badgeNeutro = `${badge} bg-slate-100 text-slate-700 ring-slate-200`;
export const badgeSucesso = `${badge} bg-emerald-50 text-emerald-700 ring-emerald-200`;
export const badgeAlerta = `${badge} bg-amber-100 text-amber-800 ring-amber-200`;
export const badgePerigo = `${badge} bg-rose-50 text-rose-700 ring-rose-200`;
export const badgeInfo = `${badge} bg-sky-50 text-sky-700 ring-sky-200`;
export const badgeTeal = `${badge} bg-teal-50 text-teal-700 ring-teal-200`;

// ---- Abas internas (segmentado) ----
export const segmentado = 'mb-5 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 sm:inline-flex';
export const classeSegmento = (ativa: boolean) =>
  `flex-1 cursor-pointer whitespace-nowrap rounded-lg border-0 px-4 py-2 text-sm font-bold transition sm:flex-none ${
    ativa ? 'bg-white text-teal-700 shadow-sm ring-1 ring-slate-200' : 'bg-transparent text-slate-500 hover:text-slate-800'
  }`;

// ---- Cartões de resumo ----
export const coresCartao = {
  teal: 'border-l-teal-500 from-teal-50 to-white',
  amber: 'border-l-amber-400 from-amber-50 to-white',
  rose: 'border-l-rose-500 from-rose-50 to-white',
  emerald: 'border-l-emerald-500 from-emerald-50 to-white',
  sky: 'border-l-sky-500 from-sky-50 to-white',
  slate: 'border-l-slate-500 from-slate-50 to-white',
  violet: 'border-l-violet-500 from-violet-50 to-white'
} as const;

export type CorCartao = keyof typeof coresCartao;

export function Cartao(c: { titulo: string; valor: ReactNode; cor: CorCartao; icone?: string; detalhe?: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 border-l-4 bg-gradient-to-br p-4 shadow-sm ${coresCartao[c.cor]} ${c.className || ''}`}>
      <p className="m-0 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {c.icone && <span aria-hidden="true">{c.icone}</span>}
        {c.titulo}
      </p>
      <p className="mb-0 mt-1.5 text-2xl font-black tracking-tight text-slate-900">{c.valor}</p>
      {c.detalhe && <p className="mb-0 mt-1 text-xs font-semibold text-slate-500">{c.detalhe}</p>}
    </div>
  );
}

/** Cabeçalho padrão da aba: etiqueta em pílula, título, subtítulo e ações à direita. */
export function CabecalhoAba(c: { etiqueta: string; icone?: string; titulo: string; descricao?: ReactNode; acoes?: ReactNode; voltar?: { texto: string; aoClicar: () => void } }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {c.voltar && (
          <button type="button" onClick={c.voltar.aoClicar} className={`${botaoVoltar} mb-3`}>
            <span aria-hidden="true">←</span> {c.voltar.texto}
          </button>
        )}
        <p className="m-0 mb-1 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700 ring-1 ring-teal-200">
          {c.icone && <span aria-hidden="true">{c.icone}</span>} {c.etiqueta}
        </p>
        <h2 className="m-0 mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{c.titulo}</h2>
        {c.descricao && <p className="mb-0 mt-1.5 max-w-2xl text-sm text-slate-500">{c.descricao}</p>}
      </div>
      {c.acoes && <div className="flex shrink-0 flex-wrap gap-2">{c.acoes}</div>}
    </header>
  );
}

/** Título de seção dentro da aba, com marcador colorido à esquerda e espaço para contador/ações à direita. */
export function TituloSecao(c: { children: ReactNode; cor?: string; className?: string; direita?: ReactNode }) {
  return (
    <h3 className={`${titulo} ${c.className || ''}`}>
      <span className={`${marcadorTitulo} ${c.cor || ''}`} aria-hidden="true" />
      {c.children}
      {c.direita}
    </h3>
  );
}

/** Caixa de estado vazio para listas e tabelas. */
export function Vazio(c: { icone?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-dashed border-slate-200 px-3 py-8 text-center ${c.className || ''}`}>
      {c.icone && <p className="m-0 text-2xl" aria-hidden="true">{c.icone}</p>}
      <p className="mb-0 mt-1 text-xs font-semibold text-slate-500">{c.children}</p>
    </div>
  );
}
