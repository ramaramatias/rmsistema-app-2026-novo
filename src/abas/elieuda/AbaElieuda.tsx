import { useMemo, useState } from 'react';

export function AbaElieuda(p: {
  atualizarQtdElieuda: any;
  gerarPdfElieuda: any;
  limparDadosElieuda: any;
  listaProdutosElieudaPadrao: any;
  quantidadesElieuda: any;
  setTabAtiva: any;
}) {
  const {
    atualizarQtdElieuda,
    gerarPdfElieuda,
    limparDadosElieuda,
    listaProdutosElieudaPadrao,
    quantidadesElieuda,
    setTabAtiva
  } = p;
  const [busca, setBusca] = useState('');
  const [soPreenchidos, setSoPreenchidos] = useState(false);
  const campo = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15';
  const temQtd = (q: any) => Boolean(String(q?.terca || '').trim() || String(q?.quinta || '').trim() || String(q?.sabado || '').trim());
  const produtos = listaProdutosElieudaPadrao || [];
  const preenchidosQtd = produtos.filter((item: any) => temQtd(quantidadesElieuda?.[item.produto])).length;
  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return produtos.filter((item: any) => {
      const q = quantidadesElieuda?.[item.produto] || {};
      if (soPreenchidos && !temQtd(q)) return false;
      if (termo && !String(item.produto || '').toLowerCase().includes(termo)) return false;
      return true;
    });
  }, [produtos, quantidadesElieuda, busca, soPreenchidos]);
  const inputDia = (valor: string, preenchido: boolean) =>
    `w-full rounded-lg border px-2 py-2 text-center text-sm outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 ${
      preenchido ? 'border-teal-200 bg-teal-50 font-semibold text-teal-900' : 'border-slate-200 bg-white text-slate-900'
    }`;
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 sm:p-6">
      <button type="button" onClick={() => setTabAtiva('compras')} className="mb-4 cursor-pointer rounded-lg bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-white">← Voltar para Compras</button>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">Hortifrúti</p>
          <h2 className="m-0 text-xl font-black tracking-tight text-slate-900">Pedido Elieuda</h2>
          <p className="mb-0 mt-1 text-sm text-slate-500">Preencha as quantidades de terça, quinta e sábado. Campo vazio não entra no pedido.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={limparDadosElieuda} className="cursor-pointer rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50">Limpar tudo</button>
          <button type="button" onClick={gerarPdfElieuda} className="cursor-pointer rounded-lg bg-teal-700 px-3 py-2 text-[11px] font-bold text-white hover:bg-teal-600">Gerar pedido</button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar produto..."
          className={`${campo} max-w-xs`}
        />
        <button
          type="button"
          onClick={() => setSoPreenchidos(v => !v)}
          className={`cursor-pointer rounded-lg px-3 py-2 text-[11px] font-bold ${soPreenchidos ? 'bg-teal-700 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'}`}
        >
          Só preenchidos
        </button>
        <span className="text-[12px] font-semibold text-slate-500">{preenchidosQtd} item(ns) no pedido • {visiveis.length} na lista</span>
      </div>

      <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-900 text-left text-[11px] font-bold uppercase tracking-wide text-white">
              <th className="sticky left-0 z-20 bg-slate-900 px-3 py-3">Produto</th>
              <th className="w-24 px-3 py-3 text-center">Unidade</th>
              <th className="w-32 px-3 py-3 text-center">Terça</th>
              <th className="w-32 px-3 py-3 text-center">Quinta</th>
              <th className="w-32 px-3 py-3 text-center">Sábado</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((item: any, index: number) => {
              const q = quantidadesElieuda?.[item.produto] || {};
              const linhaPreenchida = temQtd(q);
              return (
                <tr key={item.produto} className={linhaPreenchida ? 'bg-teal-50/40' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className={`sticky left-0 z-[1] px-3 py-2 font-bold text-slate-800 ${linhaPreenchida ? 'bg-teal-50' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>{item.produto}</td>
                  <td className="px-3 py-2 text-center text-slate-500">{item.unit}</td>
                  <td className="px-2 py-1.5">
                    <input type="text" inputMode="decimal" value={q.terca || ''} onChange={e => atualizarQtdElieuda(item.produto, 'terca', e.target.value)} placeholder="—" className={inputDia(q.terca, Boolean(String(q.terca || '').trim()))} />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="text" inputMode="decimal" value={q.quinta || ''} onChange={e => atualizarQtdElieuda(item.produto, 'quinta', e.target.value)} placeholder="—" className={inputDia(q.quinta, Boolean(String(q.quinta || '').trim()))} />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="text" inputMode="decimal" value={q.sabado || ''} onChange={e => atualizarQtdElieuda(item.produto, 'sabado', e.target.value)} placeholder="—" className={inputDia(q.sabado, Boolean(String(q.sabado || '').trim()))} />
                  </td>
                </tr>
              );
            })}
            {visiveis.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-sm text-slate-500">Nenhum produto encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
