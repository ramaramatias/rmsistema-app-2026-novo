type Permissoes = {
  cotacao?: boolean;
  pagamentos?: boolean;
  elieuda?: boolean;
  conferencias?: boolean;
};

type Destino = 'cotacao' | 'cadastroProdutos' | 'cadastroFornecedores' | 'pagamentos' | 'consultaPagamentos' | 'reciboComprador' | 'elieuda' | 'conferencia' | 'notasConferidas';

const MODULOS: { destino: Destino; titulo: string; detalhe: string; permissao: keyof Permissoes; aba?: string }[] = [
  { destino: 'cotacao', titulo: 'Cotação', detalhe: 'Escolher o fornecedor e cotar pela lista completa.', permissao: 'cotacao' },
  { destino: 'cotacao', titulo: 'Bonificação', detalhe: 'Registrar produto de brinde que vem junto com o pedido pendente.', permissao: 'cotacao', aba: 'bonificacao' },
  { destino: 'cadastroProdutos', titulo: 'Cadastro de produtos', detalhe: 'Lista Completa, lista atual e seções.', permissao: 'cotacao' },
  { destino: 'cadastroFornecedores', titulo: 'Cadastro de fornecedores', detalhe: 'Incluir e manter os fornecedores da cotação.', permissao: 'cotacao' },
  { destino: 'pagamentos', titulo: 'Pagamentos', detalhe: 'Caixa, cheque e CABEN.', permissao: 'pagamentos' },
  { destino: 'consultaPagamentos', titulo: 'Consulta de pagamentos', detalhe: 'Buscar por nome, ver datas, totais e lotes fechados.', permissao: 'pagamentos' },
  { destino: 'reciboComprador', titulo: 'Recibo', detalhe: 'Escolher o fornecedor, localizar o produto na lista completa e imprimir.', permissao: 'pagamentos' },
  { destino: 'elieuda', titulo: 'Pedido Elieuda', detalhe: 'Pedido de hortifrúti da semana.', permissao: 'elieuda' },
  { destino: 'conferencia', titulo: 'Conferência', detalhe: 'Conferir mercadoria que chegou.', permissao: 'conferencias' },
  { destino: 'notasConferidas', titulo: 'Notas conferidas', detalhe: 'Consultar mercadorias recebidas, valores e ranking de fornecedores.', permissao: 'conferencias' }
];

export function AbaCompras(p: {
  permissoes?: Permissoes;
  setTabAtiva: (aba: Destino) => void;
}) {
  const visiveis = MODULOS.filter(modulo => p.permissoes?.[modulo.permissao]);

  return (
    <section className="mx-auto max-w-5xl rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <p className="m-0 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">Compras</p>
      <h2 className="m-0 mt-1 text-xl font-black uppercase tracking-tight text-slate-900">Área de compras</h2>
      <p className="mb-5 mt-1 text-xs text-slate-500">Nada sumiu: cotação, cadastros, pagamentos, hortifrúti e conferência estão todos aqui.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {visiveis.map(modulo => (
          <button
            key={`${modulo.destino}-${modulo.aba || 'padrao'}`}
            type="button"
            onClick={() => {
              if (modulo.destino === 'cotacao') {
                try { sessionStorage.setItem('rm_cotacao_aba', modulo.aba || 'precos'); } catch { /* ignora */ }
              }
              p.setTabAtiva(modulo.destino);
            }}
            className="cursor-pointer rounded-2xl border-0 bg-slate-50 p-4 text-left ring-1 ring-slate-200 transition hover:bg-teal-50 hover:ring-teal-200"
          >
            <strong className="block text-sm font-black text-slate-900">{modulo.titulo}</strong>
            <span className="mt-1 block text-[12px] font-medium text-slate-500">{modulo.detalhe}</span>
          </button>
        ))}
      </div>
      {visiveis.length === 0 && (
        <p className="m-0 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">Nenhuma tela de compras liberada para este usuário.</p>
      )}
    </section>
  );
}
