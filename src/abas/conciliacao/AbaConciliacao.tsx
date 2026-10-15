type Destino = 'conciliacaoCompras' | 'arquivoCeasa' | 'inteligenciaEstoque' | 'consultasConciliacao';

export function AbaConciliacao(p: { setTabAtiva: (aba: Destino) => void }) {
  return (
    <section className="mx-auto max-w-5xl rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <p className="m-0 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">Conciliação</p>
      <h2 className="m-0 mt-1 text-xl font-black uppercase tracking-tight text-slate-900">Área de conciliação</h2>
      <p className="mb-5 mt-1 text-xs text-slate-500">Compare a nota fiscal com a tabela de preços sem digitar a planilha à mão.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => p.setTabAtiva('conciliacaoCompras')}
          className="cursor-pointer rounded-2xl border-0 bg-slate-50 p-4 text-left ring-1 ring-slate-200 transition hover:bg-teal-50 hover:ring-teal-200"
        >
          <strong className="block text-sm font-black text-slate-900">Conciliação de compras</strong>
          <span className="mt-1 block text-[12px] font-medium text-slate-500">Anexe a nota e a tabela de preços. Arquive o lote e depois localize o relatório da comparação por mês.</span>
        </button>
        <button
          type="button"
          onClick={() => p.setTabAtiva('arquivoCeasa')}
          className="cursor-pointer rounded-2xl border-0 bg-slate-50 p-4 text-left ring-1 ring-slate-200 transition hover:bg-teal-50 hover:ring-teal-200"
        >
          <strong className="block text-sm font-black text-slate-900">Arquivo CEASA</strong>
          <span className="mt-1 block text-[12px] font-medium text-slate-500">Guarde e consulte os boletins da CEASA.</span>
        </button>
        <button
          type="button"
          onClick={() => p.setTabAtiva('inteligenciaEstoque')}
          className="cursor-pointer rounded-2xl border-0 bg-slate-50 p-4 text-left ring-1 ring-slate-200 transition hover:bg-teal-50 hover:ring-teal-200"
        >
          <strong className="block text-sm font-black text-slate-900">Inteligência de estoque</strong>
          <span className="mt-1 block text-[12px] font-medium text-slate-500">A análise de estoque entra nesta aba.</span>
        </button>
        <button
          type="button"
          onClick={() => p.setTabAtiva('consultasConciliacao')}
          className="cursor-pointer rounded-2xl border-0 bg-slate-50 p-4 text-left ring-1 ring-slate-200 transition hover:bg-teal-50 hover:ring-teal-200"
        >
          <strong className="block text-sm font-black text-slate-900">Consultas de NF vs CEASA</strong>
          <span className="mt-1 block text-[12px] font-medium text-slate-500">Consulte por mês os produtos vendidos, os valores médios e o total comprado. As imagens arquivadas também ficam disponíveis aqui.</span>
        </button>
      </div>
    </section>
  );
}
