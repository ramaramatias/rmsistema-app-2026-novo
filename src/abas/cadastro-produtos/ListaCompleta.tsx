import { useMemo, useState } from 'react';
import { LISTA_COMPLETA } from '../../catalogo/listaCompleta';

const POR_PAGINA = 80;

export function ListaCompleta() {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<'todas' | 'com' | 'sem'>('todas');
  const [pagina, setPagina] = useState(1);

  const comEstoque = useMemo(() => LISTA_COMPLETA.filter(item => item.temEstoque).length, []);
  const termo = busca.trim().toLowerCase();
  const filtradas = LISTA_COMPLETA.filter(item => {
    if (filtro === 'com' && !item.temEstoque) return false;
    if (filtro === 'sem' && item.temEstoque) return false;
    if (!termo) return true;
    return item.descricao.toLowerCase().includes(termo)
      || item.codigo.toLowerCase().includes(termo)
      || item.codigoBarras.toLowerCase().includes(termo)
      || item.embalagem.toLowerCase().includes(termo);
  });

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtradas.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  const classeChip = (ativa: boolean) =>
    `shrink-0 cursor-pointer rounded-lg border-0 px-3 py-2 text-[12px] font-bold ${ativa ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-white'}`;

  const escolher = (proximo: 'todas' | 'com' | 'sem') => {
    setFiltro(proximo);
    setPagina(1);
  };

  return (
    <>
      <p className="mb-3 mt-0 text-xs text-slate-500">
        Saldo de estoque da loja, em ordem alfabética. {LISTA_COMPLETA.length} produtos, {comEstoque} com estoque.
      </p>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        <button type="button" onClick={() => escolher('todas')} className={classeChip(filtro === 'todas')}>Todas ({LISTA_COMPLETA.length})</button>
        <button type="button" onClick={() => escolher('com')} className={classeChip(filtro === 'com')}>Com estoque ({comEstoque})</button>
        <button type="button" onClick={() => escolher('sem')} className={classeChip(filtro === 'sem')}>Sem estoque ({LISTA_COMPLETA.length - comEstoque})</button>
      </div>
      <input
        value={busca}
        onChange={e => { setBusca(e.target.value); setPagina(1); }}
        placeholder="Buscar produto, código ou código de barras"
        className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-900 text-left text-white">
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2">Código de barras</th>
              <th className="px-3 py-2">Produto</th>
              <th className="px-3 py-2">Un</th>
              <th className="px-3 py-2">Estoque</th>
              <th className="px-3 py-2">Custo</th>
              <th className="px-3 py-2">Preço</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map(item => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="whitespace-nowrap px-3 py-2 text-slate-500">{item.codigo}</td>
                <td className="whitespace-nowrap px-3 py-2 font-semibold tracking-wide text-slate-900">{item.codigoBarras}</td>
                <td className="px-3 py-2 font-semibold">{item.descricao}</td>
                <td className="px-3 py-2">{item.embalagem}</td>
                <td className="px-3 py-2">{item.estoque}</td>
                <td className="px-3 py-2">{item.custo}</td>
                <td className="px-3 py-2">{item.preco}</td>
              </tr>
            ))}
            {visiveis.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-500">Nenhum produto nesta lista.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {filtradas.length > POR_PAGINA && (
        <div className="mt-3 flex items-center justify-between gap-2 text-xs font-bold text-slate-600">
          <span>{filtradas.length} encontrados · página {paginaAtual} de {totalPaginas}</span>
          <div className="flex gap-2">
            <button type="button" disabled={paginaAtual <= 1} onClick={() => setPagina(paginaAtual - 1)} className="cursor-pointer rounded-lg border-0 bg-slate-100 px-3 py-2 disabled:cursor-default disabled:opacity-40">Anterior</button>
            <button type="button" disabled={paginaAtual >= totalPaginas} onClick={() => setPagina(paginaAtual + 1)} className="cursor-pointer rounded-lg border-0 bg-slate-100 px-3 py-2 disabled:cursor-default disabled:opacity-40">Próxima</button>
          </div>
        </div>
      )}
    </>
  );
}
