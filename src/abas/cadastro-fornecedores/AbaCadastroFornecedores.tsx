import { useState, type FormEvent } from 'react';
import { tipoPessoaFornecedor, type TipoPessoaFornecedor } from '../../tipos';

const campo = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15';

type DadosCadastro = {
  tipoPessoa?: TipoPessoaFornecedor;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  nomePessoaFisica: string;
  cpf: string;
  endereco: string;
  cidade: string;
};

export function AbaCadastroFornecedores(p: {
  setTabAtiva: any;
  fornecedoresCotacao: any[];
  novoFornecedorCadastro: DadosCadastro;
  setNovoFornecedorCadastro: any;
  cadastrarFornecedor: (dados?: DadosCadastro) => void;
  removerFornecedorCotacao: (id: string) => void;
}) {
  const { setTabAtiva, fornecedoresCotacao, novoFornecedorCadastro, setNovoFornecedorCadastro, cadastrarFornecedor, removerFornecedorCotacao } = p;
  const [abaPessoa, setAbaPessoa] = useState<TipoPessoaFornecedor>('juridica');
  const atualizar = (campoNome: keyof DadosCadastro, valor: string) => {
    setNovoFornecedorCadastro((atual: DadosCadastro) => ({ ...atual, [campoNome]: valor }));
  };
  const enviarCadastro = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    cadastrarFornecedor({
      tipoPessoa: abaPessoa,
      razaoSocial: String(dados.get('razaoSocial') || ''),
      nomeFantasia: String(dados.get('nomeFantasia') || ''),
      cnpj: String(dados.get('cnpj') || ''),
      nomePessoaFisica: String(dados.get('nomePessoaFisica') || ''),
      cpf: String(dados.get('cpf') || ''),
      endereco: String(dados.get('endereco') || ''),
      cidade: String(dados.get('cidade') || '')
    });
  };
  const lista = (fornecedoresCotacao || []).filter(fornecedor => tipoPessoaFornecedor(fornecedor) === abaPessoa);
  const juridicas = (fornecedoresCotacao || []).filter(fornecedor => tipoPessoaFornecedor(fornecedor) === 'juridica').length;
  const fisicas = (fornecedoresCotacao || []).filter(fornecedor => tipoPessoaFornecedor(fornecedor) === 'fisica').length;

  return (
    <section className="mx-auto max-w-5xl rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <button type="button" onClick={() => setTabAtiva('compras')} className="mb-3.5 cursor-pointer rounded-lg border-0 bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-white">← Voltar para Compras</button>
      <h2 className="m-0 text-xl font-black uppercase tracking-tight text-slate-900">Cadastro de fornecedores</h2>
      <p className="mb-4 mt-1 text-xs text-slate-500">Separe empresa e pessoa física. Os cadastros entram na aba Cotação.</p>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setAbaPessoa('juridica')}
          className={`cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold tracking-wide transition ${
            abaPessoa === 'juridica' ? 'bg-teal-700 text-white shadow-sm shadow-teal-900/20' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
          }`}
        >
          Pessoa jurídica ({juridicas})
        </button>
        <button
          type="button"
          onClick={() => setAbaPessoa('fisica')}
          className={`cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold tracking-wide transition ${
            abaPessoa === 'fisica' ? 'bg-teal-700 text-white shadow-sm shadow-teal-900/20' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
          }`}
        >
          Pessoa física ({fisicas})
        </button>
      </div>

      <form onSubmit={enviarCadastro} className="mb-5 grid gap-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 sm:grid-cols-2 lg:grid-cols-3">
        {abaPessoa === 'juridica' ? (
          <>
            <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-500">
              Razão social
              <input name="razaoSocial" value={novoFornecedorCadastro.razaoSocial || ''} onChange={e => atualizar('razaoSocial', e.target.value)} className={campo} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-500">
              Nome fantasia
              <input name="nomeFantasia" value={novoFornecedorCadastro.nomeFantasia || ''} onChange={e => atualizar('nomeFantasia', e.target.value)} className={campo} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-500">
              CNPJ
              <input name="cnpj" value={novoFornecedorCadastro.cnpj || ''} onChange={e => atualizar('cnpj', e.target.value)} className={campo} />
            </label>
          </>
        ) : (
          <>
            <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-500">
              Nome da pessoa física
              <input name="nomePessoaFisica" value={novoFornecedorCadastro.nomePessoaFisica || ''} onChange={e => atualizar('nomePessoaFisica', e.target.value)} className={campo} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-500">
              CPF
              <input name="cpf" value={novoFornecedorCadastro.cpf || ''} onChange={e => atualizar('cpf', e.target.value)} className={campo} />
            </label>
          </>
        )}
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-500">
          Cidade
          <input name="cidade" value={novoFornecedorCadastro.cidade || ''} onChange={e => atualizar('cidade', e.target.value)} className={campo} />
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-500 sm:col-span-2">
          Endereço
          <input name="endereco" value={novoFornecedorCadastro.endereco || ''} onChange={e => atualizar('endereco', e.target.value)} className={campo} />
        </label>
        <button type="submit" className="cursor-pointer rounded-lg border-0 bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-600 sm:col-span-2 lg:col-span-3">
          {abaPessoa === 'juridica' ? 'Cadastrar pessoa jurídica' : 'Cadastrar pessoa física'}
        </button>
      </form>

      <div className="overflow-x-auto">
        {lista.length === 0 ? (
          <p className="m-0 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">
            {abaPessoa === 'juridica' ? 'Nenhuma pessoa jurídica cadastrada.' : 'Nenhuma pessoa física cadastrada.'}
          </p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 text-left text-white">
                {abaPessoa === 'juridica' ? (
                  <>
                    <th className="px-3 py-2">Nome</th>
                    <th className="px-3 py-2">Razão social</th>
                    <th className="px-3 py-2">CNPJ</th>
                  </>
                ) : (
                  <>
                    <th className="px-3 py-2">Nome</th>
                    <th className="px-3 py-2">CPF</th>
                  </>
                )}
                <th className="px-3 py-2">Endereço</th>
                <th className="px-3 py-2">Cidade</th>
                <th className="px-3 py-2"> </th>
              </tr>
            </thead>
            <tbody>
              {lista.map(fornecedor => (
                <tr key={fornecedor.id} className="border-b border-slate-100">
                  {abaPessoa === 'juridica' ? (
                    <>
                      <td className="px-3 py-2 font-semibold">{fornecedor.nomeFantasia || fornecedor.nome}</td>
                      <td className="px-3 py-2">{fornecedor.razaoSocial || '-'}</td>
                      <td className="px-3 py-2">{fornecedor.cnpj || '-'}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2 font-semibold">{fornecedor.nomePessoaFisica || fornecedor.nome}</td>
                      <td className="px-3 py-2">{fornecedor.cpf || '-'}</td>
                    </>
                  )}
                  <td className="px-3 py-2">{fornecedor.endereco || '-'}</td>
                  <td className="px-3 py-2">{fornecedor.cidade || '-'}</td>
                  <td className="px-3 py-2 text-right">
                    <button type="button" onClick={() => removerFornecedorCotacao(fornecedor.id)} className="cursor-pointer rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700">Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
