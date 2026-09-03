import { useMemo, useState } from 'react';
import { FORNECEDORES_POR_SECAO, PRODUTOS_POR_SECAO } from '../../catalogo/secoesDados';

const SECOES_NOVAS = [
  'Bebidas',
  'Laticínios',
  'Matéria prima',
  'Embalagens',
  'Artesanato',
  'Mercearia',
  'Bomboniere'
] as const;

type Item = { id: string; produto: string; unit?: string };

export function AbaCadastroProdutos(p: {
  setTabAtiva: (aba: any) => void;
  itensCotacao: Item[];
  novoProdutoCadastro: { nome: string; unidade: string };
  setNovoProdutoCadastro: (valor: { nome: string; unidade: string }) => void;
  cadastrarProduto: () => void;
  excluirProdutoCadastrado: (id: string) => void;
}) {
  const { setTabAtiva, itensCotacao, novoProdutoCadastro, setNovoProdutoCadastro, cadastrarProduto, excluirProdutoCadastrado } = p;
  const [abaPrincipal, setAbaPrincipal] = useState<'todos' | 'secoes'>('todos');
  const [secaoAtiva, setSecaoAtiva] = useState<string>(SECOES_NOVAS[0]);
  const [fornecedorAtivo, setFornecedorAtivo] = useState('');
  const [busca, setBusca] = useState('');
  const [buscaSecao, setBuscaSecao] = useState('');

  const mapaFornecedores = FORNECEDORES_POR_SECAO[secaoAtiva];
  const nomesFornecedores = mapaFornecedores ? Object.keys(mapaFornecedores) : [];

  const listaTodos = (itensCotacao || []).filter(item =>
    !busca.trim() || item.produto.toLowerCase().includes(busca.trim().toLowerCase())
  );

  const listaSecao = useMemo(() => {
    const mapa = FORNECEDORES_POR_SECAO[secaoAtiva];
    const lista = mapa
      ? (fornecedorAtivo ? (mapa[fornecedorAtivo] || []) : [])
      : (PRODUTOS_POR_SECAO[secaoAtiva] || []);
    const termo = buscaSecao.trim().toLowerCase();
    if (!termo) return lista;
    return lista.filter(item => item.nome.toLowerCase().includes(termo) || item.codigo.toLowerCase().includes(termo));
  }, [secaoAtiva, buscaSecao, fornecedorAtivo]);

  const classeAba = (ativa: boolean) =>
    `shrink-0 cursor-pointer rounded-lg border-0 px-3 py-2 text-[12px] font-bold ${ativa ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-white'}`;

  const escolherSecao = (nome: string) => {
    setSecaoAtiva(nome);
    setBuscaSecao('');
    const mapa = FORNECEDORES_POR_SECAO[nome];
    setFornecedorAtivo(mapa ? Object.keys(mapa)[0] || '' : '');
  };

  return (
    <section className="mx-auto max-w-5xl rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <button onClick={() => setTabAtiva('compras')} className="mb-3.5 cursor-pointer rounded-lg border-0 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-white">← Voltar para Compras</button>
      <h2 className="m-0 text-xl font-black uppercase tracking-tight text-slate-900">Cadastro de produtos</h2>
      <p className="mb-4 mt-1 text-xs text-slate-500">Todos é a lista atual. Em Seções, Laticínios e Embalagens ficam separados por fornecedor.</p>

      <div className="mb-4 flex gap-2">
        <button type="button" onClick={() => setAbaPrincipal('todos')} className={classeAba(abaPrincipal === 'todos')}>Todos ({(itensCotacao || []).length})</button>
        <button type="button" onClick={() => { setAbaPrincipal('secoes'); escolherSecao(secaoAtiva === 'Bebidas' ? 'Embalagens' : secaoAtiva); }} className={classeAba(abaPrincipal === 'secoes')}>Seções</button>
      </div>

      {abaPrincipal === 'todos' && (
        <>
          <div className="mb-4 flex flex-wrap items-end gap-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
            <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-[11px] font-bold text-slate-500">
              Nome do produto
              <input value={novoProdutoCadastro.nome} onChange={e => setNovoProdutoCadastro({ ...novoProdutoCadastro, nome: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900" />
            </label>
            <label className="flex w-28 flex-col gap-1 text-[11px] font-bold text-slate-500">
              Unidade
              <input value={novoProdutoCadastro.unidade} onChange={e => setNovoProdutoCadastro({ ...novoProdutoCadastro, unidade: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900" />
            </label>
            <button type="button" onClick={cadastrarProduto} className="cursor-pointer rounded-lg border-0 bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-600">Cadastrar</button>
          </div>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar produto" className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900 text-left text-white">
                  <th className="px-3 py-2">Produto</th>
                  <th className="px-3 py-2">Un</th>
                  <th className="px-3 py-2"> </th>
                </tr>
              </thead>
              <tbody>
                {listaTodos.map(item => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-semibold">{item.produto}</td>
                    <td className="px-3 py-2">{item.unit}</td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" onClick={() => excluirProdutoCadastrado(item.id)} className="cursor-pointer rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700">Excluir</button>
                    </td>
                  </tr>
                ))}
                {listaTodos.length === 0 && (
                  <tr><td colSpan={3} className="px-3 py-8 text-center text-slate-500">Nenhum produto nesta lista.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {abaPrincipal === 'secoes' && (
        <>
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {SECOES_NOVAS.map(nome => {
              const qtd = (PRODUTOS_POR_SECAO[nome] || []).length;
              return (
                <button key={nome} type="button" onClick={() => escolherSecao(nome)} className={classeAba(secaoAtiva === nome)}>
                  {nome}{qtd ? ` (${qtd})` : ''}
                </button>
              );
            })}
          </div>
          {mapaFornecedores && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {nomesFornecedores.length === 0 ? (
                <p className="m-0 text-xs text-slate-500">Cada fornecedor de {secaoAtiva.toLowerCase()} terá a sua aba. Mande o Excel com o nome do fornecedor.</p>
              ) : nomesFornecedores.map(nome => (
                <button key={nome} type="button" onClick={() => { setFornecedorAtivo(nome); setBuscaSecao(''); }} className={classeAba(fornecedorAtivo === nome)}>
                  {nome} ({(mapaFornecedores[nome] || []).length})
                </button>
              ))}
            </div>
          )}
          {mapaFornecedores && nomesFornecedores.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-4 py-10 text-center ring-1 ring-slate-200">
              <p className="m-0 text-sm font-bold text-slate-800">{secaoAtiva} por fornecedor</p>
              <p className="mb-0 mt-2 text-xs text-slate-500">Listas vazias. Envie um Excel de cada fornecedor.</p>
            </div>
          ) : listaSecao.length > 0 ? (
            <>
              <input value={buscaSecao} onChange={e => setBuscaSecao(e.target.value)} placeholder={`Buscar em ${fornecedorAtivo || secaoAtiva}`} className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-900 text-left text-white">
                      <th className="px-3 py-2">Código</th>
                      <th className="px-3 py-2">Produto</th>
                      <th className="px-3 py-2">Custo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaSecao.map(item => (
                      <tr key={item.id} className="border-b border-slate-100">
                        <td className="px-3 py-2 text-slate-500">{item.codigo}</td>
                        <td className="px-3 py-2 font-semibold">{item.nome}</td>
                        <td className="px-3 py-2">{item.custo || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="rounded-xl bg-slate-50 px-4 py-10 text-center ring-1 ring-slate-200">
              <p className="m-0 text-sm font-bold text-slate-800">{secaoAtiva}</p>
              <p className="mb-0 mt-2 text-xs text-slate-500">Lista vazia. Quando o Excel chegar, os produtos desta seção entram aqui.</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
