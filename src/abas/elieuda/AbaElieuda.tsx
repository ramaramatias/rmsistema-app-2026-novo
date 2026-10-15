import { useMemo, useState } from 'react';
import { CabecalhoAba, Cartao, TituloSecao, botaoPerigo, botaoPrimario, campo, classeSegmento, contador, secao, tabelaCaixa } from '../../componentes/ui';

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
  const temQtd = (q: any) => Boolean(String(q?.terca || '').trim() || String(q?.quinta || '').trim() || String(q?.sabado || '').trim());
  const produtos = listaProdutosElieudaPadrao || [];
  const preenchidosQtd = produtos.filter((item: any) => temQtd(quantidadesElieuda?.[item.produto])).length;
  const totalPorDia = (dia: 'terca' | 'quinta' | 'sabado') =>
    produtos.filter((item: any) => String(quantidadesElieuda?.[item.produto]?.[dia] || '').trim()).length;
  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return produtos.filter((item: any) => {
      const q = quantidadesElieuda?.[item.produto] || {};
      if (soPreenchidos && !temQtd(q)) return false;
      if (termo && !String(item.produto || '').toLowerCase().includes(termo)) return false;
      return true;
    });
  }, [produtos, quantidadesElieuda, busca, soPreenchidos]);
  const inputDia = (preenchido: boolean) =>
    `box-border w-full min-w-0 rounded-lg border px-2 py-2 text-center text-sm shadow-sm outline-none transition placeholder:text-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 ${
      preenchido ? 'border-teal-300 bg-teal-50 font-black text-teal-900' : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
    }`;

  return (
    <section className={secao}>
      <CabecalhoAba
        etiqueta="Hortifrúti"
        icone="🥬"
        titulo="Pedido Elieuda"
        descricao="Preencha as quantidades de terça, quinta e sábado. Campo vazio não entra no pedido."
        voltar={{ texto: 'Voltar para Compras', aoClicar: () => setTabAtiva('compras') }}
        acoes={
          <>
            <button type="button" onClick={limparDadosElieuda} className={botaoPerigo}><span aria-hidden="true">🧹</span> Limpar tudo</button>
            <button type="button" onClick={gerarPdfElieuda} className={botaoPrimario}><span aria-hidden="true">🖨️</span> Gerar pedido</button>
          </>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Cartao titulo="Itens no pedido" valor={preenchidosQtd} detalhe={`de ${produtos.length} produtos`} cor="teal" icone="🧺" />
        <Cartao titulo="Terça" valor={totalPorDia('terca')} detalhe="produtos com quantidade" cor="emerald" icone="📅" />
        <Cartao titulo="Quinta" valor={totalPorDia('quinta')} detalhe="produtos com quantidade" cor="sky" icone="📅" />
        <Cartao titulo="Sábado" valor={totalPorDia('sabado')} detalhe="produtos com quantidade" cor="amber" icone="📅" />
      </div>

      <TituloSecao direita={<span className={contador}>{visiveis.length} na lista</span>}>Produtos</TituloSecao>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="search"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="🔍 Buscar produto..."
          className={`${campo} sm:max-w-xs`}
        />
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          <button type="button" onClick={() => setSoPreenchidos(false)} className={classeSegmento(!soPreenchidos)}>Todos</button>
          <button type="button" onClick={() => setSoPreenchidos(true)} className={classeSegmento(soPreenchidos)}>Só preenchidos ({preenchidosQtd})</button>
        </div>
      </div>

      <div className={tabelaCaixa}>
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <th className="sticky left-0 z-20 bg-slate-50 px-3 py-3">Produto</th>
              <th className="w-24 px-3 py-3 text-center">Unidade</th>
              <th className="w-32 px-3 py-3 text-center">Terça</th>
              <th className="w-32 px-3 py-3 text-center">Quinta</th>
              <th className="w-32 px-3 py-3 text-center">Sábado</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((item: any) => {
              const q = quantidadesElieuda?.[item.produto] || {};
              const linhaPreenchida = temQtd(q);
              return (
                <tr key={item.produto} className={`border-t border-slate-100 transition ${linhaPreenchida ? 'bg-teal-50/40' : 'even:bg-slate-50/40 hover:bg-teal-50/30'}`}>
                  <td className={`sticky left-0 z-[1] px-3 py-2 font-bold text-slate-800 ${linhaPreenchida ? 'bg-teal-50' : 'bg-white'}`}>{item.produto}</td>
                  <td className="px-3 py-2 text-center text-slate-500">{item.unit}</td>
                  <td className="px-2 py-1.5">
                    <input type="text" inputMode="decimal" value={q.terca || ''} onChange={e => atualizarQtdElieuda(item.produto, 'terca', e.target.value)} placeholder="—" className={inputDia(Boolean(String(q.terca || '').trim()))} aria-label={`${item.produto} terça`} />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="text" inputMode="decimal" value={q.quinta || ''} onChange={e => atualizarQtdElieuda(item.produto, 'quinta', e.target.value)} placeholder="—" className={inputDia(Boolean(String(q.quinta || '').trim()))} aria-label={`${item.produto} quinta`} />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="text" inputMode="decimal" value={q.sabado || ''} onChange={e => atualizarQtdElieuda(item.produto, 'sabado', e.target.value)} placeholder="—" className={inputDia(Boolean(String(q.sabado || '').trim()))} aria-label={`${item.produto} sábado`} />
                  </td>
                </tr>
              );
            })}
            {visiveis.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-sm text-slate-400">Nenhum produto encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
