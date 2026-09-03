export function AbaCadastroFornecedores(p: {
  setTabAtiva: any;
  fornecedoresCotacao: any[];
  novoFornecedorCadastro: { razaoSocial: string; nomeFantasia: string; cnpj: string };
  setNovoFornecedorCadastro: any;
  cadastrarFornecedor: () => void;
  removerFornecedorCotacao: (id: string) => void;
}) {
  const { setTabAtiva, fornecedoresCotacao, novoFornecedorCadastro, setNovoFornecedorCadastro, cadastrarFornecedor, removerFornecedorCotacao } = p;
  return (
    <section className="mx-auto max-w-4xl rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <button onClick={() => setTabAtiva('compras')} className="mb-3.5 cursor-pointer rounded-lg border-0 bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-white">← Voltar para Compras</button>
      <h2 className="m-0 text-xl font-black uppercase tracking-tight text-slate-900">Cadastro de fornecedores</h2>
      <p className="mb-4 mt-1 text-xs text-slate-500">Os fornecedores cadastrados entram na aba Cotação.</p>
      <div className="mb-5 grid gap-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-500">
          Razão social
          <input value={novoFornecedorCadastro.razaoSocial} onChange={e => setNovoFornecedorCadastro({ ...novoFornecedorCadastro, razaoSocial: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900" />
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-500">
          Nome fantasia
          <input value={novoFornecedorCadastro.nomeFantasia} onChange={e => setNovoFornecedorCadastro({ ...novoFornecedorCadastro, nomeFantasia: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900" />
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-500">
          CNPJ
          <input value={novoFornecedorCadastro.cnpj} onChange={e => setNovoFornecedorCadastro({ ...novoFornecedorCadastro, cnpj: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900" />
        </label>
        <button type="button" onClick={cadastrarFornecedor} className="cursor-pointer rounded-lg border-0 bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-600 sm:col-span-3">Cadastrar fornecedor</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-900 text-left text-white">
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">Razão social</th>
              <th className="px-3 py-2">CNPJ</th>
              <th className="px-3 py-2"> </th>
            </tr>
          </thead>
          <tbody>
            {(fornecedoresCotacao || []).map(fornecedor => (
              <tr key={fornecedor.id} className="border-b border-slate-100">
                <td className="px-3 py-2 font-semibold">{fornecedor.nomeFantasia || fornecedor.nome}</td>
                <td className="px-3 py-2">{fornecedor.razaoSocial || '-'}</td>
                <td className="px-3 py-2">{fornecedor.cnpj || '-'}</td>
                <td className="px-3 py-2 text-right">
                  <button type="button" onClick={() => removerFornecedorCotacao(fornecedor.id)} className="cursor-pointer rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700">Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
