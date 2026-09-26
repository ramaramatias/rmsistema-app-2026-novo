import { useEffect, useMemo, useState } from 'react';
import { PRODUTOS_POR_SECAO } from '../../catalogo/secoesDados';
import type { ItemCotacao } from '../../tipos';

const CHAVE_COMPRADOR = 'rm_recibo_comprador_cnpj';
const campo = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15';
const botaoPrimario = 'cursor-pointer rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-600';
const botaoSecundario = 'cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50';

type PessoaRecibo = {
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  cidade: string;
};

type IdComprador = 'filial' | 'matriz';

const COMPRADORES: Record<IdComprador, PessoaRecibo> = {
  filial: {
    razaoSocial: 'CENTRO ESPIRITA O POBRE DE DEUS',
    cnpj: '86.732.443/0003-54',
    endereco: 'RUA PROFESSOR JOÃO VIANA N:594',
    cidade: 'VIÇOSA DO CEARÁ'
  },
  matriz: {
    razaoSocial: 'CENTRO ESPIRITA O POBRE DE DEUS',
    cnpj: '86.732.443/0001-92',
    endereco: 'RUA SILVA JARDIM N:879, BAIRRO SANTA TEREZINHA',
    cidade: ''
  }
};

const ROTULO_COMPRADOR: Record<IdComprador, string> = {
  filial: 'Filial',
  matriz: 'Matriz'
};

const lerIdComprador = (): IdComprador => {
  try {
    const salvo = localStorage.getItem(CHAVE_COMPRADOR);
    if (salvo === 'matriz' || salvo === 'filial') return salvo;
    if (salvo?.includes('0001-92')) return 'matriz';
    return 'filial';
  } catch {
    return 'filial';
  }
};

type FornecedorLista = PessoaRecibo & { id: string; nome: string };

type ProdutoLista = { id: string; codigo: string; nome: string; unidade: string; origem: 'todos' | 'secoes' };

type FormaPagamento = 'pix' | 'dinheiro' | 'conta';
type LocalProduto = 'venda' | 'almoxarifado';

type ItemRecibo = {
  id: string;
  codigo: string;
  produto: string;
  quantidade: string;
  unidade: string;
  valorUnitario: string;
};

type DadosImpressao = {
  data: string;
  comprador: PessoaRecibo;
  fornecedor: PessoaRecibo;
  itens: ItemRecibo[];
  formaPagamento: FormaPagamento | '';
  agencia: string;
  contaCorrente: string;
  local: LocalProduto | '';
};

const rascunhoVazio = (): ItemRecibo => ({
  id: '',
  codigo: '',
  produto: '',
  quantidade: '',
  unidade: '',
  valorUnitario: ''
});

const normalizar = (texto: string) =>
  String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const CODIGO_POR_NOME = (() => {
  const mapa = new Map<string, string>();
  Object.values(PRODUTOS_POR_SECAO).flat().forEach(item => {
    const codigo = String(item.codigo || '').trim();
    if (codigo && item.nome) mapa.set(normalizar(item.nome), codigo);
  });
  return mapa;
})();

const resolverCodigo = (nome: string, codigo?: string) => {
  const direto = String(codigo || '').trim();
  if (direto) return direto;
  return CODIGO_POR_NOME.get(normalizar(nome)) || '';
};

const ROTULO_PAGAMENTO: Record<FormaPagamento, string> = {
  pix: 'PIX',
  dinheiro: 'Dinheiro',
  conta: 'Conta corrente'
};

const ROTULO_LOCAL: Record<LocalProduto, string> = {
  venda: 'Venda',
  almoxarifado: 'Almoxarifado'
};

const textoPagamento = (dados: DadosImpressao) => {
  if (dados.formaPagamento === 'conta') {
    const partes = ['Conta corrente'];
    if (dados.agencia) partes.push(`Agência ${dados.agencia}`);
    if (dados.contaCorrente) partes.push(`Conta ${dados.contaCorrente}`);
    return partes.join(' • ');
  }
  return dados.formaPagamento ? ROTULO_PAGAMENTO[dados.formaPagamento] : '';
};

const UNIDADES = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
const ESPECIAIS = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const DEZENAS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const CENTENAS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

const extensoAte999 = (n: number) => {
  if (n <= 0) return '';
  if (n === 100) return 'cem';
  const centena = Math.floor(n / 100);
  const resto = n % 100;
  const partes: string[] = [];
  if (centena) partes.push(CENTENAS[centena]);
  if (resto >= 10 && resto <= 19) partes.push(ESPECIAIS[resto - 10]);
  else {
    const dezena = Math.floor(resto / 10);
    const unidade = resto % 10;
    if (dezena) partes.push(DEZENAS[dezena]);
    if (unidade) partes.push(UNIDADES[unidade]);
  }
  return partes.join(' e ');
};

const extensoInteiro = (n: number): string => {
  if (n === 0) return 'zero';
  const milhao = Math.floor(n / 1_000_000);
  const mil = Math.floor((n % 1_000_000) / 1000);
  const resto = n % 1000;
  const partes: string[] = [];
  if (milhao) partes.push(milhao === 1 ? 'um milhão' : `${extensoAte999(milhao)} milhões`);
  if (mil) partes.push(mil === 1 ? 'mil' : `${extensoAte999(mil)} mil`);
  if (resto) partes.push(extensoAte999(resto));
  return partes.join(resto && resto < 100 ? ' e ' : ' ');
};

const numeroCampo = (bruto: string) => parseFloat(String(bruto || '').replace(/\./g, '').replace(',', '.')) || 0;

const valorPorExtenso = (numero: number) => {
  if (!Number.isFinite(numero) || numero <= 0) return '';
  const inteiro = Math.floor(numero);
  const centavos = Math.round((numero - inteiro) * 100);
  const reais = inteiro === 0 ? 'zero reais' : inteiro === 1 ? 'um real' : `${extensoInteiro(inteiro)} reais`;
  if (!centavos) return reais;
  return `${reais} e ${centavos === 1 ? 'um centavo' : `${extensoInteiro(centavos)} centavos`}`;
};

const dinheiro = (valor: number) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const escapar = (valor: string) =>
  String(valor || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const dataBr = (iso: string) => {
  if (!iso) return new Date().toLocaleDateString('pt-BR');
  const [ano, mes, dia] = iso.split('-');
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : iso;
};

const dadosFornecedor = (fornecedor: any): FornecedorLista => ({
  id: fornecedor.id,
  nome: fornecedor.nomeFantasia || fornecedor.nomePessoaFisica || fornecedor.nome || '',
  razaoSocial: fornecedor.razaoSocial || fornecedor.nomePessoaFisica || fornecedor.nomeFantasia || fornecedor.nome || '',
  cnpj: fornecedor.cnpj || fornecedor.cpf || '',
  endereco: fornecedor.endereco || '',
  cidade: fornecedor.cidade || ''
});

const novoRecibo = (fornecedor: FornecedorLista, comprador: PessoaRecibo): DadosImpressao => ({
  data: new Date().toISOString().slice(0, 10),
  comprador,
  fornecedor: {
    razaoSocial: fornecedor.razaoSocial,
    cnpj: fornecedor.cnpj,
    endereco: fornecedor.endereco,
    cidade: fornecedor.cidade
  },
  itens: [],
  formaPagamento: '',
  agencia: '',
  contaCorrente: '',
  local: ''
});

const montarListaProdutos = (itens?: ItemCotacao[]): ProdutoLista[] => {
  const secoes = Object.values(PRODUTOS_POR_SECAO).flat().map(item => ({
    id: `sec_${item.id}`,
    codigo: resolverCodigo(item.nome, item.codigo),
    nome: item.nome,
    unidade: item.unidade || '',
    origem: 'secoes' as const
  }));
  const todos = (itens || [])
    .filter(item => item.produto?.trim())
    .map(item => {
      const extra = item as ItemCotacao & { codigo?: string };
      return {
        id: `tod_${item.id}`,
        codigo: resolverCodigo(item.produto, extra.codigo),
        nome: item.produto.trim(),
        unidade: item.unit || '',
        origem: 'todos' as const
      };
    });
  const porNome = new Map<string, ProdutoLista>();
  [...todos, ...secoes].forEach(item => {
    const chave = normalizar(item.nome);
    if (!chave) return;
    const atual = porNome.get(chave);
    if (!atual) {
      porNome.set(chave, item);
      return;
    }
    if (!atual.codigo && item.codigo) porNome.set(chave, item);
  });
  return Array.from(porNome.values()).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
};

const totalItem = (item: ItemRecibo) => numeroCampo(item.quantidade) * numeroCampo(item.valorUnitario);

const totalRecibo = (dados: DadosImpressao) =>
  (dados.itens || []).reduce((soma, item) => soma + totalItem(item), 0);

const fraseDeclaracao = (pessoa: PessoaRecibo) =>
  `Declaro (amos) ter recebido de CENTRO ESPÍRITA O POBRE DE DEUS, CNPJ ${pessoa.cnpj}, a importância totalizada, referente à compra dos itens discriminados abaixo:`;

const blocoPessoaHtml = (titulo: string, pessoa: PessoaRecibo, rotuloDoc: string) => `
  <div class="pessoa">
    <h2>${titulo}</h2>
    <p><b>Razão social</b><span>${escapar(pessoa.razaoSocial || '')}</span></p>
    <p><b>${rotuloDoc}</b><span>${escapar(pessoa.cnpj || '')}</span></p>
    <p><b>Endereço</b><span>${escapar(pessoa.endereco || '')}</span></p>
    <p><b>Cidade</b><span>${escapar(pessoa.cidade || '')}</span></p>
  </div>
`;

const htmlFolha = (dados: DadosImpressao) => {
  const total = totalRecibo(dados);
  const extenso = valorPorExtenso(total);
  return `<section class="folha">
    <h1>RECIBO</h1>
    <div class="topo">
      <span>Data: ${escapar(dataBr(dados.data))}</span>
    </div>
    ${blocoPessoaHtml('Comprador', dados.comprador, 'CNPJ')}
    ${blocoPessoaHtml('Fornecedor', dados.fornecedor, 'CNPJ / CPF')}
    <p class="declaracao">${escapar(fraseDeclaracao(dados.comprador))}</p>
    <div class="itens">
      <h2>Compra</h2>
      <table class="produtos">
        <tr><th>Código</th><th>Produto</th><th>Quantidade</th><th>Unid.</th><th>Valor unitário</th><th>Valor total</th></tr>
        ${(dados.itens || []).map(item => `
        <tr>
          <td>${escapar(resolverCodigo(item.produto, item.codigo))}</td>
          <td class="prod">${escapar(item.produto || '')}</td>
          <td>${escapar(item.quantidade || '')}</td>
          <td>${escapar(item.unidade || '')}</td>
          <td>R$ ${dinheiro(numeroCampo(item.valorUnitario))}</td>
          <td>R$ ${dinheiro(totalItem(item))}</td>
        </tr>`).join('')}
      </table>
      <p class="total"><b>Total da compra</b><span>R$ ${dinheiro(total)}</span></p>
      <p class="extenso">${escapar(extenso ? extenso.charAt(0).toUpperCase() + extenso.slice(1) : '')}</p>
      <p><b>Pagamento</b><span>${escapar(textoPagamento(dados))}</span></p>
      <p><b>Local</b><span>${escapar(dados.local ? ROTULO_LOCAL[dados.local] : '')}</span></p>
    </div>
    <p class="data">${escapar(dados.comprador.cidade || dados.fornecedor.cidade || 'Fortaleza')}, ${escapar(dataBr(dados.data))}.</p>
    <footer>
      <div><i></i>Vendedor</div>
    </footer>
  </section>`;
};

const imprimirFolha = (dados: DadosImpressao) => {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Recibo</title>
    <style>
      @page { size: A4; margin: 12mm; }
      body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; }
      .folha { border: 2px solid #111; padding: 18px 20px; }
      h1 { margin: 0; text-align: center; font-size: 22px; letter-spacing: .08em; }
      .topo { display: flex; justify-content: flex-end; margin: 10px 0 14px; font-size: 13px; }
      .pessoa { padding: 4px 0 8px; margin-bottom: 8px; }
      .pessoa h2 { margin: 0 0 6px; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
      .pessoa p { display: flex; gap: 12px; margin: 4px 0; font-size: 14px; }
      .pessoa p b { width: 130px; flex: none; }
      .pessoa p span { flex: 1; }
      .itens { padding: 0; margin-bottom: 10px; }
      .itens h2 { margin: 0 0 8px; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
      .itens p { display: flex; gap: 12px; margin: 6px 0; font-size: 14px; }
      .itens p b { width: 130px; flex: none; }
      table.produtos { width: 100%; border-collapse: collapse; margin-top: 8px; }
      table.produtos th, table.produtos td { border: 1px solid #111; padding: 7px; text-align: center; font-size: 13px; background: #fff; }
      table.produtos th { background: #eaf3fb; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      table.produtos td.prod, table.produtos th:nth-child(2) { text-align: left; }
      .total { font-weight: 700; }
      .extenso { font-style: italic; font-size: 13px; }
      .declaracao { margin: 0 0 12px; font-size: 13px; text-align: justify; line-height: 1.45; }
      .data { margin-top: 18px; }
      footer { display: flex; justify-content: center; margin-top: 42px; text-align: center; font-size: 12px; }
      footer div { width: 240px; }
      footer i { display: block; border-top: 1px solid #111; margin-bottom: 6px; }
    </style></head><body>${htmlFolha(dados)}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
};

function CaixaPessoa({ titulo, pessoa, rotuloDoc }: { titulo: string; pessoa: PessoaRecibo; rotuloDoc: string }) {
  return (
    <div className="mb-3 py-1">
      <h4 className="m-0 mb-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-900">{titulo}</h4>
      <p className="my-1.5 flex gap-3 text-sm"><b className="w-32 shrink-0">Razão social</b><span className="flex-1">{pessoa.razaoSocial}</span></p>
      <p className="my-1.5 flex gap-3 text-sm"><b className="w-32 shrink-0">{rotuloDoc}</b><span className="flex-1">{pessoa.cnpj}</span></p>
      <p className="my-1.5 flex gap-3 text-sm"><b className="w-32 shrink-0">Endereço</b><span className="flex-1">{pessoa.endereco}</span></p>
      <p className="my-1.5 flex gap-3 text-sm"><b className="w-32 shrink-0">Cidade</b><span className="flex-1">{pessoa.cidade}</span></p>
    </div>
  );
}

function EscolherComprador({ id, onChange, coluna }: { id: IdComprador; onChange: (id: IdComprador) => void; coluna?: boolean }) {
  return (
    <div className={coluna ? 'grid gap-2' : 'grid gap-2 sm:grid-cols-2'}>
      {(['filial', 'matriz'] as IdComprador[]).map(opcao => {
        const pessoa = COMPRADORES[opcao];
        const ativo = id === opcao;
        return (
          <button
            key={opcao}
            type="button"
            onClick={() => onChange(opcao)}
            className={`cursor-pointer rounded-xl border-0 p-3 text-left ring-1 ${ativo ? 'bg-teal-50 ring-teal-300' : 'bg-white ring-slate-200 hover:bg-slate-50'}`}
          >
            <span className={`text-[11px] font-black uppercase tracking-wide ${ativo ? 'text-teal-800' : 'text-slate-500'}`}>{ROTULO_COMPRADOR[opcao]}</span>
            <strong className="mt-1 block text-sm font-black text-slate-900">{pessoa.razaoSocial}</strong>
            <span className="mt-1 block text-xs font-semibold text-slate-600">CNPJ {pessoa.cnpj}</span>
            <span className="mt-1 block text-xs text-slate-500">{pessoa.endereco}{pessoa.cidade ? ` • ${pessoa.cidade}` : ''}</span>
          </button>
        );
      })}
    </div>
  );
}

export function AbaReciboComprador(p: { setTabAtiva: any; fornecedoresCotacao?: any[]; itensCotacao?: ItemCotacao[] }) {
  const [busca, setBusca] = useState('');
  const [buscaProduto, setBuscaProduto] = useState('');
  const [rascunho, setRascunho] = useState<ItemRecibo>(rascunhoVazio);
  const [idComprador, setIdComprador] = useState<IdComprador>(lerIdComprador);
  const [recibo, setRecibo] = useState<DadosImpressao | null>(null);
  const comprador = COMPRADORES[idComprador];

  useEffect(() => {
    localStorage.setItem(CHAVE_COMPRADOR, idComprador);
  }, [idComprador]);

  const escolherComprador = (id: IdComprador) => {
    setIdComprador(id);
    setRecibo(atual => atual ? { ...atual, comprador: COMPRADORES[id] } : atual);
  };

  const lista = useMemo(() => {
    const todos = (p.fornecedoresCotacao || []).map(dadosFornecedor).filter(item => item.nome);
    const texto = busca.trim().toLowerCase();
    if (!texto) return todos;
    return todos.filter(item =>
      item.nome.toLowerCase().includes(texto)
      || item.razaoSocial.toLowerCase().includes(texto)
      || item.cnpj.toLowerCase().includes(texto)
      || item.cidade.toLowerCase().includes(texto)
    );
  }, [p.fornecedoresCotacao, busca]);

  const produtos = useMemo(() => montarListaProdutos(p.itensCotacao), [p.itensCotacao]);
  const produtosFiltrados = useMemo(() => {
    const texto = normalizar(buscaProduto);
    if (!texto) return [];
    return produtos.filter(item =>
      normalizar(item.nome).includes(texto) || normalizar(item.codigo).includes(texto)
    ).slice(0, 20);
  }, [produtos, buscaProduto]);

  const escolherProduto = (item: ProdutoLista) => {
    setRascunho({
      id: '',
      codigo: resolverCodigo(item.nome, item.codigo),
      produto: item.nome,
      quantidade: rascunho.quantidade,
      unidade: item.unidade || rascunho.unidade,
      valorUnitario: rascunho.valorUnitario
    });
    setBuscaProduto('');
  };

  const adicionarProduto = () => {
    if (!rascunho.produto.trim()) return;
    setRecibo(atual => atual ? {
      ...atual,
      itens: [...atual.itens, {
        ...rascunho,
        id: `item_${Date.now()}`,
        codigo: resolverCodigo(rascunho.produto, rascunho.codigo)
      }]
    } : atual);
    setRascunho(rascunhoVazio());
    setBuscaProduto('');
  };

  const removerItem = (id: string) => {
    setRecibo(atual => atual ? { ...atual, itens: atual.itens.filter(item => item.id !== id) } : atual);
  };

  const itensNaTela = recibo ? [...recibo.itens, ...(rascunho.produto ? [rascunho] : [])] : [];
  const total = itensNaTela.reduce((soma, item) => soma + totalItem(item), 0);
  const extenso = valorPorExtenso(total);
  const reciboNaTela = recibo ? { ...recibo, comprador, itens: itensNaTela } : null;

  return (
    <section className="mx-auto max-w-5xl rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <button type="button" onClick={() => p.setTabAtiva('compras')} className="mb-3.5 cursor-pointer rounded-lg border-0 bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-white">← Voltar para Compras</button>
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => p.setTabAtiva('pagamentos')} className="cursor-pointer rounded-xl bg-white px-4 py-2.5 text-xs font-bold tracking-wide text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50">Pagamentos</button>
        <button type="button" className="cursor-pointer rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold tracking-wide text-white shadow-sm shadow-teal-900/20">Recibo</button>
      </div>
      <h2 className="m-0 text-xl font-black uppercase tracking-tight text-slate-900">Recibo</h2>
      <p className="mb-4 mt-1 text-xs text-slate-500">Escolha o produto na lista Todos ou nas Seções. Dá para adicionar mais de um item no mesmo recibo.</p>

      {!recibo || !reciboNaTela ? (
        <>
          <div className="mb-4 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
            <p className="mb-2 mt-0 text-[11px] font-bold uppercase tracking-wide text-slate-500">Comprador</p>
            <EscolherComprador id={idComprador} onChange={escolherComprador} />
          </div>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar fornecedor..." className={`${campo} mb-3`} />
          <div className="grid gap-2 sm:grid-cols-2">
            {lista.map(fornecedor => (
              <button
                key={fornecedor.id}
                type="button"
                onClick={() => { setBuscaProduto(''); setRascunho(rascunhoVazio()); setRecibo(novoRecibo(fornecedor, comprador)); }}
                className="cursor-pointer rounded-xl border-0 bg-slate-50 p-4 text-left ring-1 ring-slate-200 hover:bg-teal-50 hover:ring-teal-200"
              >
                <strong className="block text-sm font-black text-slate-900">{fornecedor.nome}</strong>
                <span className="mt-1 block text-xs text-slate-500">
                  {fornecedor.razaoSocial && fornecedor.razaoSocial !== fornecedor.nome ? `${fornecedor.razaoSocial} • ` : ''}
                  {fornecedor.cnpj || 'Sem CPF/CNPJ'}
                  {fornecedor.cidade ? ` • ${fornecedor.cidade}` : ''}
                </span>
              </button>
            ))}
          </div>
          {lista.length === 0 && (
            <p className="m-0 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">Nenhum fornecedor encontrado.</p>
          )}
        </>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          <div className="grid gap-2 self-start rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
            <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-slate-500">Comprador</p>
            <EscolherComprador id={idComprador} onChange={escolherComprador} coluna />
            <p className="m-0 mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Produto e imprimir</p>
            {recibo.itens.length > 0 && (
              <div className="grid gap-1">
                {recibo.itens.map(item => (
                  <div key={item.id} className="rounded-lg bg-white p-2 ring-1 ring-slate-200">
                    {resolverCodigo(item.produto, item.codigo) ? <span className="block text-[11px] font-semibold text-slate-500">{resolverCodigo(item.produto, item.codigo)}</span> : null}
                    <strong className="block text-sm font-black text-slate-900">{item.produto}</strong>
                    <span className="block text-[11px] text-slate-500">{item.quantidade} {item.unidade} • R$ {dinheiro(totalItem(item))}</span>
                    <button type="button" onClick={() => removerItem(item.id)} className="mt-1 cursor-pointer border-0 bg-transparent p-0 text-[11px] font-bold text-rose-700 hover:underline">Remover</button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-1 text-[11px] font-bold text-slate-500">
              {recibo.itens.length > 0 ? 'Adicionar mais produto' : 'Produto'}
              {rascunho.produto && !buscaProduto ? (
                <div className="rounded-lg bg-white p-2 ring-1 ring-slate-200">
                  {resolverCodigo(rascunho.produto, rascunho.codigo) ? <span className="block text-[11px] font-semibold text-slate-500">{resolverCodigo(rascunho.produto, rascunho.codigo)}</span> : null}
                  <strong className="block text-sm font-black text-slate-900">{rascunho.produto}</strong>
                  <button type="button" onClick={() => { setRascunho(rascunhoVazio()); setBuscaProduto(''); }} className="mt-2 cursor-pointer border-0 bg-transparent p-0 text-[11px] font-bold text-teal-700 hover:underline">Trocar produto</button>
                </div>
              ) : (
                <>
                  <input value={buscaProduto} onChange={e => setBuscaProduto(e.target.value)} placeholder="Todos ou Seções: código ou nome" className={campo} />
                  {buscaProduto.trim() ? (
                    <div className="max-h-56 overflow-y-auto rounded-lg bg-white ring-1 ring-slate-200">
                      {produtosFiltrados.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => escolherProduto(item)}
                          className="flex w-full cursor-pointer flex-col border-0 border-b border-slate-100 bg-white px-3 py-2 text-left last:border-b-0 hover:bg-teal-50"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{item.origem === 'todos' ? 'Todos' : 'Seções'}{item.codigo ? ` • ${item.codigo}` : ''}</span>
                          <strong className="text-sm font-bold text-slate-900">{item.nome}</strong>
                        </button>
                      ))}
                      {produtosFiltrados.length === 0 && (
                        <p className="m-0 px-3 py-3 text-xs font-semibold text-slate-500">Nenhum produto encontrado.</p>
                      )}
                    </div>
                  ) : (
                    <p className="m-0 text-xs font-semibold text-slate-500">Digite para buscar em Todos e nas Seções.</p>
                  )}
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-500">
                Quantidade
                <input value={rascunho.quantidade} onChange={e => setRascunho({ ...rascunho, quantidade: e.target.value })} className={campo} />
              </label>
              <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-500">
                Unid.
                <input value={rascunho.unidade} onChange={e => setRascunho({ ...rascunho, unidade: e.target.value })} className={campo} />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-500">
              Valor unitário
              <input value={rascunho.valorUnitario} onChange={e => setRascunho({ ...rascunho, valorUnitario: e.target.value })} placeholder="0,00" className={campo} />
            </label>
            <button type="button" onClick={adicionarProduto} className={botaoSecundario}>Adicionar produto</button>
            <div className="flex flex-col gap-1 text-[11px] font-bold text-slate-500">
              Forma de pagamento
              <div className="grid grid-cols-3 gap-1">
                {(['pix', 'dinheiro', 'conta'] as FormaPagamento[]).map(opcao => (
                  <button
                    key={opcao}
                    type="button"
                    onClick={() => setRecibo({ ...recibo, formaPagamento: opcao })}
                    className={`cursor-pointer rounded-lg border-0 px-2 py-2 text-[11px] font-bold ${recibo.formaPagamento === opcao ? 'bg-teal-700 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}
                  >
                    {ROTULO_PAGAMENTO[opcao]}
                  </button>
                ))}
              </div>
            </div>
            {recibo.formaPagamento === 'conta' ? (
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-500">
                  Agência
                  <input value={recibo.agencia} onChange={e => setRecibo({ ...recibo, agencia: e.target.value })} className={campo} />
                </label>
                <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-500">
                  Conta corrente
                  <input value={recibo.contaCorrente} onChange={e => setRecibo({ ...recibo, contaCorrente: e.target.value })} className={campo} />
                </label>
              </div>
            ) : null}
            <div className="flex flex-col gap-1 text-[11px] font-bold text-slate-500">
              Onde ficou
              <div className="grid grid-cols-2 gap-1">
                {(['venda', 'almoxarifado'] as LocalProduto[]).map(opcao => (
                  <button
                    key={opcao}
                    type="button"
                    onClick={() => setRecibo({ ...recibo, local: opcao })}
                    className={`cursor-pointer rounded-lg border-0 px-2 py-2 text-[11px] font-bold ${recibo.local === opcao ? 'bg-teal-700 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}
                  >
                    {ROTULO_LOCAL[opcao]}
                  </button>
                ))}
              </div>
            </div>
            <p className="m-0 text-sm font-black text-teal-900">Total: R$ {dinheiro(total)}</p>
            <button type="button" onClick={() => imprimirFolha(reciboNaTela)} className={botaoPrimario}>Imprimir recibo</button>
            <button type="button" onClick={() => { setBuscaProduto(''); setRascunho(rascunhoVazio()); setRecibo(null); }} className={botaoSecundario}>Trocar fornecedor</button>
          </div>

          <article className="border-2 border-slate-900 bg-white p-5">
            <h3 className="m-0 text-center text-xl font-black tracking-[0.14em]">RECIBO</h3>
            <div className="mb-3 mt-2 flex justify-end text-xs text-slate-700">
              <span>Data: {dataBr(recibo.data)}</span>
            </div>
            <CaixaPessoa titulo="Comprador" pessoa={comprador} rotuloDoc="CNPJ" />
            <CaixaPessoa titulo="Fornecedor" pessoa={recibo.fornecedor} rotuloDoc="CNPJ / CPF" />
            <p className="mb-3 mt-0 text-sm leading-relaxed text-slate-900">{fraseDeclaracao(comprador)}</p>
            <div className="p-0">
              <h4 className="m-0 mb-2 text-[11px] font-black uppercase tracking-[0.12em]">Compra</h4>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border border-slate-900 bg-[#eaf3fb] px-2 py-1.5">Código</th>
                    <th className="border border-slate-900 bg-[#eaf3fb] px-2 py-1.5 text-left">Produto</th>
                    <th className="border border-slate-900 bg-[#eaf3fb] px-2 py-1.5">Quantidade</th>
                    <th className="border border-slate-900 bg-[#eaf3fb] px-2 py-1.5">Unid.</th>
                    <th className="border border-slate-900 bg-[#eaf3fb] px-2 py-1.5">Valor unitário</th>
                    <th className="border border-slate-900 bg-[#eaf3fb] px-2 py-1.5">Valor total</th>
                  </tr>
                </thead>
                <tbody>
                  {itensNaTela.map((item, indice) => (
                    <tr key={item.id || `rascunho_${indice}`} className="text-center">
                      <td className="border border-slate-900 bg-white px-2 py-2">{resolverCodigo(item.produto, item.codigo) || '—'}</td>
                      <td className="border border-slate-900 bg-white px-2 py-2 text-left">{item.produto || ''}</td>
                      <td className="border border-slate-900 bg-white px-2 py-2">{item.quantidade}</td>
                      <td className="border border-slate-900 bg-white px-2 py-2">{item.unidade}</td>
                      <td className="border border-slate-900 bg-white px-2 py-2">R$ {dinheiro(numeroCampo(item.valorUnitario))}</td>
                      <td className="border border-slate-900 bg-white px-2 py-2">R$ {dinheiro(totalItem(item))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mb-0 mt-3 flex gap-3 text-sm font-bold"><b className="w-32 shrink-0">Total da compra</b><span>R$ {dinheiro(total)}</span></p>
              {extenso ? <p className="m-0 mt-1 text-xs italic text-slate-600">{extenso.charAt(0).toUpperCase() + extenso.slice(1)}</p> : null}
              <p className="mb-0 mt-2 flex gap-3 text-sm"><b className="w-32 shrink-0">Pagamento</b><span>{textoPagamento(recibo)}</span></p>
              <p className="mb-0 mt-1 flex gap-3 text-sm"><b className="w-32 shrink-0">Local</b><span>{recibo.local ? ROTULO_LOCAL[recibo.local] : ''}</span></p>
            </div>
            <p className="mt-4 text-sm">{comprador.cidade || recibo.fornecedor.cidade || 'Fortaleza'}, {dataBr(recibo.data)}.</p>
            <div className="mt-10 flex justify-center text-center text-xs">
              <div className="w-60 border-t border-slate-900 pt-2">Vendedor</div>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
