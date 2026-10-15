import { useMemo, useState } from 'react';
import {
  CLIENTES_ROTA_CIDADE,
  CLIENTES_ROTA_SITIO,
  PRODUTOS_ROTA_CIDADE,
  PRODUTOS_ROTA_SITIO
} from '../../dados/padroes';
import type { LancamentoDeposito, LancamentoProducao, LancamentoRota, OrigemDeposito, RotaRevenda, TipoLancamentoProducao, TurnoProducao } from '../../tipos';
import { DIAS_SEMANA, DIAS_SEMANA_CURTO, calcularRelatorioProducao, diaSemanaIso, formatarKg, formatarUn, type MetricaProducao } from './relatorioProducao';

const OPCAO_NOVO = '__ADD_NEW__';
const OPCAO_NOVO_CNPJ = '__ADD_NEW_CNPJ__';

// ---- Classes Tailwind compartilhadas (visual da aba) ----
const campo = 'box-border w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal leading-5 text-slate-800 shadow-none outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15';
const campoLeitura = `${campo} cursor-not-allowed bg-slate-50 font-medium text-slate-700 hover:border-slate-200`;
const rotulo = 'flex min-w-0 flex-col gap-1 text-[13px] font-medium leading-5 text-slate-600';
const painelFormulario = 'mb-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5';
const botaoPrimario = 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-teal-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800 active:scale-[0.98]';
const botaoSecundario = 'inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]';
const botaoExcluir = 'cursor-pointer rounded-md border-0 bg-transparent px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50 hover:text-rose-700';
const titulo = 'mb-3 mt-0 flex items-center gap-2 text-[15px] font-semibold leading-6 text-slate-800';
const tabelaCaixa = 'overflow-x-auto rounded-xl border border-slate-200 bg-white';
const cabecalhoTabela = 'bg-slate-50 text-left text-xs font-medium tracking-normal text-slate-500';
const th = 'whitespace-nowrap px-3 py-2.5 font-medium';
const linhaTabela = 'border-t border-slate-100 transition even:bg-slate-50/40 hover:bg-slate-50';
const td = 'px-3 py-2.5 align-middle text-slate-700';
const vazio = 'px-3 py-10 text-center text-sm font-normal text-slate-400';
const modalFundo = 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm';
const modalCaixa = 'w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl';

const coresCartao = {
  teal: 'border-l-teal-500 from-teal-50 to-white',
  amber: 'border-l-amber-400 from-amber-50 to-white',
  rose: 'border-l-rose-500 from-rose-50 to-white',
  emerald: 'border-l-emerald-500 from-emerald-50 to-white'
} as const;

function Cartao(c: { titulo: string; valor: string; cor: keyof typeof coresCartao; detalhe?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 border-l-4 bg-white p-4 ${coresCartao[c.cor]}`}>
      <p className="m-0 text-xs font-medium leading-4 text-slate-500">{c.titulo}</p>
      <p className="mb-0 mt-1 text-xl font-semibold tabular-nums leading-7 tracking-tight text-slate-900">{c.valor}</p>
      {c.detalhe && <p className="mb-0 mt-1 text-xs font-normal leading-4 text-slate-500">{c.detalhe}</p>}
    </div>
  );
}

const dataHoje = () => new Date().toISOString().slice(0, 10);
const primeiroDiaMes = () => {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`;
};
const dataBr = (iso: string) => {
  const [ano, mes, dia] = String(iso || '').split('-');
  if (!ano || !mes || !dia) return iso || '';
  return `${dia}/${mes}/${ano}`;
};
const reais = (n: number) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

type AbaInterna = 'producao' | 'rota' | 'relatorios' | 'deposito';

const ABAS: { id: AbaInterna; nome: string }[] = [
  { id: 'producao', nome: 'Produção' },
  { id: 'rota', nome: 'Controle de revenda' },
  { id: 'relatorios', nome: 'Relatórios de venda' },
  { id: 'deposito', nome: 'Depósitos' }
];

export function AbaProducao(p: {
  lancamentos: LancamentoProducao[];
  lancamentosRota: LancamentoRota[];
  produtos: string[];
  salvarProduto: (nome: string) => void;
  adicionarLancamento: (item: Omit<LancamentoProducao, 'id'>) => void;
  removerLancamento: (id: string) => void;
  adicionarRota: (item: Omit<LancamentoRota, 'id'>) => void;
  removerRota: (id: string) => void;
  contasDeposito: string[];
  lancamentosDeposito: LancamentoDeposito[];
  salvarContaDeposito: (nome: string) => void;
  adicionarDeposito: (item: Omit<LancamentoDeposito, 'id'>) => void;
  removerDeposito: (id: string) => void;
}) {
  const [aba, setAba] = useState<AbaInterna>('producao');
  const [turno, setTurno] = useState<TurnoProducao>('Manhã');
  const [rota, setRota] = useState<RotaRevenda>('Cidade');
  const [data, setData] = useState(dataHoje);
  const [tipo, setTipo] = useState<TipoLancamentoProducao>('Produção');
  const [produto, setProduto] = useState(p.produtos[0] || '');
  const [telas, setTelas] = useState('');
  const [unidTela, setUnidTela] = useState('');
  const [totalUnid, setTotalUnid] = useState('');
  const [peso, setPeso] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [modoProducao, setModoProducao] = useState<'lancar' | 'relatorio'>('lancar');
  const [prodIni, setProdIni] = useState(primeiroDiaMes);
  const [prodFim, setProdFim] = useState(dataHoje);
  const [prodTurno, setProdTurno] = useState<'TODOS' | TurnoProducao>('TODOS');
  const [prodTipo, setProdTipo] = useState<'TODOS' | TipoLancamentoProducao>('TODOS');
  const [prodMetrica, setProdMetrica] = useState<MetricaProducao>('un');

  const clientesRota = rota === 'Cidade' ? CLIENTES_ROTA_CIDADE : CLIENTES_ROTA_SITIO;
  const produtosRota = rota === 'Cidade' ? PRODUTOS_ROTA_CIDADE : PRODUTOS_ROTA_SITIO;
  const [rotaData, setRotaData] = useState(dataHoje);
  const [vendedor, setVendedor] = useState('FAGNO');
  const [cliente, setCliente] = useState(CLIENTES_ROTA_CIDADE[0] || '');
  const [produtoRota, setProdutoRota] = useState(PRODUTOS_ROTA_CIDADE[0]?.nome || '');
  const [levou, setLevou] = useState('');
  const [devBom, setDevBom] = useState('0');
  const [devRuim, setDevRuim] = useState('0');
  const [valUnit, setValUnit] = useState(String(PRODUTOS_ROTA_CIDADE[0]?.preco ?? ''));
  const [pago, setPago] = useState('');
  const [relIni, setRelIni] = useState(primeiroDiaMes);
  const [relFim, setRelFim] = useState(dataHoje);
  const [relSetor, setRelSetor] = useState<'TODOS' | RotaRevenda>('TODOS');
  const [depData, setDepData] = useState(dataHoje);
  const [depOrigem, setDepOrigem] = useState<OrigemDeposito>('Sítio');
  const [depDestino, setDepDestino] = useState(p.contasDeposito[0] || '');
  const [depForma, setDepForma] = useState('PIX / Transferência');
  const [depValor, setDepValor] = useState('');
  const [depObs, setDepObs] = useState('');
  const [modalCnpj, setModalCnpj] = useState(false);
  const [novoNomeCnpj, setNovoNomeCnpj] = useState('');
  const [novoNumeroCnpj, setNovoNumeroCnpj] = useState('');

  const itensTurno = useMemo(
    () => (p.lancamentos || [])
      .filter(item => item.turno === turno)
      .sort((a, b) => b.data.localeCompare(a.data) || b.id.localeCompare(a.id)),
    [p.lancamentos, turno]
  );

  const relatorioProducao = useMemo(
    () => calcularRelatorioProducao(p.lancamentos, { inicio: prodIni, fim: prodFim, turno: prodTurno, tipo: prodTipo, metrica: prodMetrica }),
    [p.lancamentos, prodIni, prodFim, prodTurno, prodTipo, prodMetrica]
  );

  const formatarMetrica = (n: number) => (prodMetrica === 'un' ? formatarUn(n) : formatarKg(n));
  const itensRota = useMemo(
    () => (p.lancamentosRota || []).filter(item => item.rota === rota),
    [p.lancamentosRota, rota]
  );

  const totalKg = itensTurno.reduce((acc, item) => acc + (Number(item.peso) || 0), 0);
  const totalUn = itensTurno.reduce((acc, item) => acc + (Number(item.totalUnid) || 0), 0);
  const passou = Number(levou) || 0;
  const vendeuCalc = passou - ((Number(devBom) || 0) + (Number(devRuim) || 0));
  const vendeu = vendeuCalc > 0 ? vendeuCalc : 0;
  const subtotal = vendeu * (Number(valUnit) || 0);
  const totalAPagar = itensRota.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0);
  const totalPago = itensRota.reduce((acc, item) => acc + (Number(item.pago) || 0), 0);
  const totalDepositado = (p.lancamentosDeposito || []).reduce((acc, item) => acc + (Number(item.valor) || 0), 0);

  const relatorio = useMemo(() => {
    const filtrados = (p.lancamentosRota || []).filter(item => {
      const dataOk = (!relIni || item.data >= relIni) && (!relFim || item.data <= relFim);
      const setorOk = relSetor === 'TODOS' || item.rota === relSetor;
      return dataOk && setorOk;
    });
    let totVendas = 0;
    let totPago = 0;
    let qtdMofados = 0;
    let valMofados = 0;
    const mapaVendidos: { [produto: string]: { qtd: number; val: number } } = {};
    const mapaMofados: { [produto: string]: { qtd: number; val: number } } = {};
    filtrados.forEach(item => {
      totVendas += Number(item.subtotal) || 0;
      totPago += Number(item.pago) || 0;
      const mofadosItem = Number(item.devRuim) || 0;
      const prejuizo = mofadosItem * (Number(item.valUnit) || 0);
      qtdMofados += mofadosItem;
      valMofados += prejuizo;
      if (!mapaVendidos[item.produto]) mapaVendidos[item.produto] = { qtd: 0, val: 0 };
      mapaVendidos[item.produto].qtd += Number(item.vendeu) || 0;
      mapaVendidos[item.produto].val += Number(item.subtotal) || 0;
      if (mofadosItem > 0) {
        if (!mapaMofados[item.produto]) mapaMofados[item.produto] = { qtd: 0, val: 0 };
        mapaMofados[item.produto].qtd += mofadosItem;
        mapaMofados[item.produto].val += prejuizo;
      }
    });
    const maisVendidos = Object.entries(mapaVendidos).sort((a, b) => b[1].qtd - a[1].qtd);
    const mofados = Object.entries(mapaMofados).sort((a, b) => b[1].val - a[1].val);
    return { totVendas, totPago, qtdMofados, valMofados, maisVendidos, mofados };
  }, [p.lancamentosRota, relIni, relFim, relSetor]);

  const escolherRota = (opcao: RotaRevenda) => {
    setRota(opcao);
    const listaC = opcao === 'Cidade' ? CLIENTES_ROTA_CIDADE : CLIENTES_ROTA_SITIO;
    const listaP = opcao === 'Cidade' ? PRODUTOS_ROTA_CIDADE : PRODUTOS_ROTA_SITIO;
    setCliente(listaC[0] || '');
    setProdutoRota(listaP[0]?.nome || '');
    setValUnit(String(listaP[0]?.preco ?? ''));
    setVendedor(opcao === 'Cidade' ? 'FAGNO' : '');
  };

  const atualizarPreco = (nomeProduto: string) => {
    setProdutoRota(nomeProduto);
    const prod = produtosRota.find(item => item.nome === nomeProduto);
    if (prod) setValUnit(String(prod.preco));
  };

  const recalcularUnidades = (qtdTelas: string, qtdPorTela: string) => {
    const nTelas = Number(qtdTelas);
    const nUnid = Number(qtdPorTela);
    if (qtdTelas && qtdPorTela && Number.isFinite(nTelas) && Number.isFinite(nUnid)) {
      setTotalUnid(String(nTelas * nUnid));
    }
  };

  const adicionarProducao = () => {
    if (!produto || produto === OPCAO_NOVO) return;
    if (!totalUnid && !peso) return;
    p.adicionarLancamento({ data, turno, tipo, produto, telas, unidTela, totalUnid, peso });
    setTelas('');
    setUnidTela('');
    setTotalUnid('');
    setPeso('');
  };

  const adicionarRevenda = () => {
    if (!produtoRota || !cliente) return;
    p.adicionarRota({
      rota,
      data: rotaData,
      vendedor: vendedor.trim() || '-',
      cliente,
      produto: produtoRota,
      levou: levou || '0',
      devBom: devBom || '0',
      devRuim: devRuim || '0',
      vendeu,
      valUnit: Number(valUnit) || 0,
      subtotal,
      pago: Number(pago) || 0
    });
    setLevou('');
    setDevBom('0');
    setDevRuim('0');
    setPago('');
  };

  const salvarProdutoNovo = () => {
    const nome = novoNome.trim();
    if (!nome) return;
    p.salvarProduto(nome);
    setProduto(nome);
    setModalAberto(false);
    setNovoNome('');
  };

  const cancelarProdutoNovo = () => {
    setModalAberto(false);
    setNovoNome('');
    setProduto(p.produtos[0] || '');
  };

  const salvarCnpjNovo = () => {
    const nome = novoNomeCnpj.trim();
    if (!nome) return;
    const texto = `${nome} - CNPJ ${novoNumeroCnpj.trim() || 'S/N'}`;
    p.salvarContaDeposito(texto);
    setDepDestino(texto);
    setModalCnpj(false);
    setNovoNomeCnpj('');
    setNovoNumeroCnpj('');
  };

  const cancelarCnpjNovo = () => {
    setModalCnpj(false);
    setNovoNomeCnpj('');
    setNovoNumeroCnpj('');
    setDepDestino(p.contasDeposito[0] || '');
  };

  const lancarDeposito = () => {
    const valor = Number(depValor);
    if (!Number.isFinite(valor) || valor <= 0) return;
    if (!depDestino || depDestino === OPCAO_NOVO_CNPJ) return;
    p.adicionarDeposito({
      data: depData,
      origem: depOrigem,
      destino: depDestino,
      forma: depForma,
      valor,
      obs: depObs.trim() || '-'
    });
    setDepValor('');
    setDepObs('');
  };

  const classeAbaPrincipal = (ativa: boolean) =>
    `cursor-pointer rounded-lg border-0 px-3 py-2 text-sm font-medium transition ${
      ativa
        ? 'bg-white text-slate-900 shadow-sm'
        : 'bg-transparent text-slate-600 hover:text-slate-900'
    }`;

  const classeAbaSecundaria = (ativa: boolean) =>
    `flex-1 cursor-pointer rounded-md border-0 px-3.5 py-1.5 text-sm font-medium transition sm:flex-none ${
      ativa ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-800'
    }`;

  const saldoRota = totalAPagar - totalPago;

  return (
    <section className="mx-auto my-6 max-w-7xl rounded-2xl border border-slate-200 bg-white p-5 antialiased sm:p-8">
      {/* Cabeçalho */}
      <header className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="m-0 text-xs font-medium text-teal-700">Padaria</p>
          <h2 className="m-0 mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Produção, rota e depósitos</h2>
          <p className="mb-0 mt-1 max-w-2xl text-sm font-normal leading-6 text-slate-500">Produção da padaria, revenda da cidade e do sítio, relatórios e depósitos das vendas.</p>
        </div>
        <p className="m-0 text-sm font-normal text-slate-500">
          Hoje <span className="font-medium text-slate-800">{dataBr(dataHoje())}</span>
        </p>
      </header>

      {/* Abas principais */}
      <nav className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 sm:grid-cols-4" aria-label="Seções da aba de produção">
        {ABAS.map(item => (
          <button key={item.id} type="button" onClick={() => setAba(item.id)} className={classeAbaPrincipal(aba === item.id)} aria-current={aba === item.id ? 'page' : undefined}>
            {item.nome}
          </button>
        ))}
      </nav>

      {/* Sub-abas */}
      {aba === 'producao' && (
        <div className="mb-5 flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 sm:inline-flex">
          {(['Manhã', 'Tarde'] as TurnoProducao[]).map(opcao => (
            <button key={opcao} type="button" onClick={() => { setTurno(opcao); setModoProducao('lancar'); }} className={classeAbaSecundaria(modoProducao === 'lancar' && turno === opcao)}>
              {opcao === 'Manhã' ? 'Produção manhã' : 'Produção tarde'}
            </button>
          ))}
          <span className="mx-1 hidden w-px self-stretch bg-slate-200 sm:block" aria-hidden="true" />
          <button type="button" onClick={() => setModoProducao('relatorio')} className={classeAbaSecundaria(modoProducao === 'relatorio')}>
            Relatório por dia da semana
          </button>
        </div>
      )}

      {aba === 'rota' && (
        <div className="mb-5 flex gap-1 rounded-lg bg-slate-100 p-1 sm:inline-flex">
          {(['Cidade', 'Sítio'] as RotaRevenda[]).map(opcao => (
            <button key={opcao} type="button" onClick={() => escolherRota(opcao)} className={classeAbaSecundaria(rota === opcao)}>
              {opcao === 'Cidade' ? 'Cidade' : 'Sítio'}
            </button>
          ))}
        </div>
      )}

      {/* ---------------- PRODUÇÃO ---------------- */}
      {aba === 'producao' && modoProducao === 'lancar' && (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            <Cartao titulo="Total em quilos (kg)" valor={`${totalKg.toFixed(2)} kg`} cor="teal" />
            <Cartao titulo="Total em unidades (un)" valor={`${totalUn.toLocaleString('pt-BR')} un`} cor="emerald" />
          </div>

          <h3 className={titulo}>
            <span className="inline-block h-5 w-1 rounded-full bg-teal-500" aria-hidden="true" />
            Lançar item — produção {turno.toLowerCase()}
          </h3>
          <div className={`${painelFormulario} md:grid-cols-4 lg:grid-cols-8`}>
            <label className={rotulo}>Data<input type="date" value={data} onChange={e => setData(e.target.value)} className={campo} /></label>
            <label className={rotulo}>
              Tipo
              <select value={tipo} onChange={e => setTipo(e.target.value as TipoLancamentoProducao)} className={campo}>
                <option value="Produção">Produção Normal</option>
                <option value="Encomenda">Encomenda</option>
              </select>
            </label>
            <label className={`${rotulo} col-span-2`}>
              Produto
              <select value={produto} onChange={e => { if (e.target.value === OPCAO_NOVO) { setModalAberto(true); return; } setProduto(e.target.value); }} className={campo}>
                {p.produtos.map(nome => <option key={nome} value={nome}>{nome}</option>)}
                <option value={OPCAO_NOVO}>+ Adicionar novo produto</option>
              </select>
            </label>
            <label className={rotulo}>Nº de telas<input type="number" min={0} value={telas} onChange={e => { setTelas(e.target.value); recalcularUnidades(e.target.value, unidTela); }} className={campo} /></label>
            <label className={rotulo}>Unid. por tela<input type="number" min={0} value={unidTela} onChange={e => { setUnidTela(e.target.value); recalcularUnidades(telas, e.target.value); }} className={campo} /></label>
            <label className={rotulo}>Total unidades<input type="number" min={0} value={totalUnid} onChange={e => setTotalUnid(e.target.value)} placeholder="Autocalculado" className={campo} /></label>
            <label className={rotulo}>Peso total (kg)<input type="number" min={0} step="0.01" value={peso} onChange={e => setPeso(e.target.value)} placeholder="ex: 52" className={campo} /></label>
            <div className="col-span-2 flex items-end md:col-span-4 lg:col-span-8">
              <button type="button" onClick={adicionarProducao} className={`${botaoPrimario} w-full sm:w-auto`}>
                Adicionar lançamento
              </button>
            </div>
          </div>

          <h3 className={`${titulo} mt-8`}>
            <span className="inline-block h-5 w-1 rounded-full bg-teal-500" aria-hidden="true" />
            Itens produzidos ({turno})
            <span className="ml-auto text-xs font-normal text-slate-500">{itensTurno.length} {itensTurno.length === 1 ? 'item' : 'itens'}</span>
          </h3>
          <div className={tabelaCaixa}>
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className={cabecalhoTabela}>
                  <th className={th}>Data</th><th className={th}>Tipo</th><th className={th}>Produto</th><th className={`${th} text-right`}>Telas</th><th className={`${th} text-right`}>Unid/Tela</th><th className={`${th} text-right`}>Total unid.</th><th className={`${th} text-right`}>Peso (kg)</th><th className={th}></th>
                </tr>
              </thead>
              <tbody>
                {itensTurno.length === 0 && <tr><td colSpan={8} className={vazio}>Nenhum lançamento neste turno.</td></tr>}
                {itensTurno.map(item => (
                  <tr key={item.id} className={linhaTabela}>
                    <td className={`${td} whitespace-nowrap text-slate-600`}>{dataBr(item.data)}</td>
                    <td className={td}><span className={`rounded px-2 py-0.5 text-xs font-medium ${item.tipo === 'Encomenda' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{item.tipo}</span></td>
                    <td className={`${td} font-medium text-slate-900`}>{item.produto}</td>
                    <td className={`${td} text-right tabular-nums`}>{item.telas || '-'}</td>
                    <td className={`${td} text-right tabular-nums`}>{item.unidTela || '-'}</td>
                    <td className={`${td} text-right font-medium tabular-nums text-slate-900`}>{item.totalUnid ? `${item.totalUnid} un` : '-'}</td>
                    <td className={`${td} text-right tabular-nums`}>{item.peso ? `${item.peso} kg` : '-'}</td>
                    <td className={`${td} text-right`}><button type="button" onClick={() => p.removerLancamento(item.id)} className={botaoExcluir}>Excluir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ---------------- RELATÓRIO DE PRODUÇÃO POR DIA DA SEMANA ---------------- */}
      {aba === 'producao' && modoProducao === 'relatorio' && (
        <>
          <h3 className={titulo}>
            <span className="inline-block h-5 w-1 rounded-full bg-teal-500" aria-hidden="true" />
            Filtro do relatório de produção
          </h3>
          <div className={`${painelFormulario} md:grid-cols-4 lg:grid-cols-5`}>
            <label className={rotulo}>Data inicial<input type="date" value={prodIni} onChange={e => setProdIni(e.target.value)} className={campo} /></label>
            <label className={rotulo}>Data final<input type="date" value={prodFim} onChange={e => setProdFim(e.target.value)} className={campo} /></label>
            <label className={rotulo}>
              Turno
              <select value={prodTurno} onChange={e => setProdTurno(e.target.value as 'TODOS' | TurnoProducao)} className={campo}>
                <option value="TODOS">Manhã + Tarde</option>
                <option value="Manhã">Somente Manhã</option>
                <option value="Tarde">Somente Tarde</option>
              </select>
            </label>
            <label className={rotulo}>
              Tipo
              <select value={prodTipo} onChange={e => setProdTipo(e.target.value as 'TODOS' | TipoLancamentoProducao)} className={campo}>
                <option value="TODOS">Produção + Encomenda</option>
                <option value="Produção">Somente Produção</option>
                <option value="Encomenda">Somente Encomenda</option>
              </select>
            </label>
            <div className={`${rotulo} col-span-2 md:col-span-4 lg:col-span-1`}>
              Medir por
              <div className="flex gap-1 rounded-xl bg-white p-1 ring-1 ring-slate-200">
                <button type="button" onClick={() => setProdMetrica('un')} className={`flex-1 cursor-pointer rounded-md border-0 px-3 py-1.5 text-xs font-medium transition ${prodMetrica === 'un' ? 'bg-teal-700 text-white' : 'bg-transparent text-slate-500 hover:text-slate-800'}`}>Unidades</button>
                <button type="button" onClick={() => setProdMetrica('kg')} className={`flex-1 cursor-pointer rounded-md border-0 px-3 py-1.5 text-xs font-medium transition ${prodMetrica === 'kg' ? 'bg-teal-700 text-white' : 'bg-transparent text-slate-500 hover:text-slate-800'}`}>Quilos</button>
              </div>
            </div>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Cartao
              titulo="Dia com mais produção"
              valor={relatorioProducao.melhor ? DIAS_SEMANA[relatorioProducao.melhor.dia] : '—'}
              detalhe={relatorioProducao.melhor ? `${formatarMetrica(relatorioProducao.melhor.valor)} em ${relatorioProducao.melhor.diasProduzidos} ${relatorioProducao.melhor.diasProduzidos === 1 ? 'dia' : 'dias'}` : 'Sem lançamentos no período'}
              cor="amber"
            />
            <Cartao
              titulo="Dia com menos produção"
              valor={relatorioProducao.pior ? DIAS_SEMANA[relatorioProducao.pior.dia] : '—'}
              detalhe={relatorioProducao.pior ? `${formatarMetrica(relatorioProducao.pior.valor)} em ${relatorioProducao.pior.diasProduzidos} ${relatorioProducao.pior.diasProduzidos === 1 ? 'dia' : 'dias'}` : 'Precisa de 2 dias diferentes'}
              cor="rose"
            />
            <Cartao titulo="Total em unidades" valor={formatarUn(relatorioProducao.totalUn)} detalhe={`${relatorioProducao.filtrados.length} ${relatorioProducao.filtrados.length === 1 ? 'lançamento' : 'lançamentos'}`} cor="emerald" />
            <Cartao titulo="Total em quilos" valor={formatarKg(relatorioProducao.totalKg)} detalhe={`${relatorioProducao.diasProduzidos} ${relatorioProducao.diasProduzidos === 1 ? 'dia com produção' : 'dias com produção'}`} cor="teal" />
          </div>

          <h3 className={titulo}>
            <span className="inline-block h-5 w-1 rounded-full bg-teal-500" aria-hidden="true" />
            Produção por dia da semana
            <span className="ml-auto text-xs font-normal text-slate-400">{prodMetrica === 'un' ? 'em unidades' : 'em quilos'}</span>
          </h3>
          <div className="mb-6 grid gap-2">
            {relatorioProducao.diasSemana.map(d => {
              const pct = relatorioProducao.maximo > 0 ? Math.round((d.valor / relatorioProducao.maximo) * 100) : 0;
              const ehMelhor = !!relatorioProducao.melhor && relatorioProducao.melhor.dia === d.dia && d.valor > 0;
              const semProducao = d.lancamentos === 0;
              const manha = prodMetrica === 'un' ? d.manhaUn : d.manhaKg;
              const tarde = prodMetrica === 'un' ? d.tardeUn : d.tardeKg;
              return (
                <div
                  key={d.dia}
                  className={`grid grid-cols-[92px_1fr] items-center gap-x-3 gap-y-2 rounded-xl border px-4 py-3 transition sm:grid-cols-[150px_1fr_170px] ${
                    ehMelhor ? 'border-amber-300 bg-amber-50 shadow-sm' : semProducao ? 'border-dashed border-slate-200 bg-white opacity-60' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="m-0 flex items-center gap-2 truncate text-sm font-medium text-slate-900">
                      <span className="sm:hidden">{DIAS_SEMANA_CURTO[d.dia]}</span>
                      <span className="hidden sm:inline">{DIAS_SEMANA[d.dia]}</span>
                      {ehMelhor && <span className="text-xs font-normal text-amber-700">maior</span>}
                    </p>
                    <p className="m-0 text-xs font-normal text-slate-500">
                      {semProducao ? 'sem produção' : `${d.diasProduzidos} ${d.diasProduzidos === 1 ? 'dia' : 'dias'} · ${d.lancamentos} lanç.`}
                    </p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/60" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${DIAS_SEMANA[d.dia]}: ${formatarMetrica(d.valor)}`}>
                    <div className={`h-full rounded-full transition-all duration-500 ${ehMelhor ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-teal-400 to-teal-600'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="col-span-2 flex items-baseline justify-between gap-2 sm:col-span-1 sm:block sm:text-right">
                    <p className="m-0 text-sm font-medium tabular-nums text-slate-900">{formatarMetrica(d.valor)}</p>
                    <p className="m-0 text-xs font-normal tabular-nums text-slate-500">
                      Manhã {formatarMetrica(manha)} · Tarde {formatarMetrica(tarde)}
                      {d.diasProduzidos > 1 && <span className="hidden lg:inline"> · média {formatarMetrica(d.media)}/dia</span>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <h3 className={titulo}>
            <span className="inline-block h-5 w-1 rounded-full bg-teal-500" aria-hidden="true" />
            Resumo diário (o que foi salvo em cada data)
            <span className="ml-auto text-xs font-normal text-slate-500">{relatorioProducao.diario.length} {relatorioProducao.diario.length === 1 ? 'dia' : 'dias'}</span>
          </h3>
          <div className={tabelaCaixa}>
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className={cabecalhoTabela}>
                  <th className={th}>Data</th>
                  <th className={th}>Dia da semana</th>
                  <th className={th}>Turnos</th>
                  <th className={`${th} text-right`}>Lançamentos</th>
                  <th className={`${th} text-right`}>Produtos</th>
                  <th className={`${th} text-right`}>Unidades</th>
                  <th className={`${th} text-right`}>Quilos</th>
                </tr>
              </thead>
              <tbody>
                {relatorioProducao.diario.length === 0 && <tr><td colSpan={7} className={vazio}>Nenhum lançamento de produção no período escolhido.</td></tr>}
                {relatorioProducao.diario.map(d => {
                  const dia = diaSemanaIso(d.data);
                  return (
                    <tr key={d.data} className={linhaTabela}>
                      <td className={`${td} whitespace-nowrap font-medium text-slate-900`}>{dataBr(d.data)}</td>
                      <td className={`${td} text-slate-700`}>{dia >= 0 ? DIAS_SEMANA[dia] : '-'}</td>
                      <td className={td}>
                        <span className="flex flex-wrap gap-1">
                          {d.turnos.has('Manhã') && <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">Manhã</span>}
                          {d.turnos.has('Tarde') && <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">Tarde</span>}
                        </span>
                      </td>
                      <td className={`${td} text-right tabular-nums`}>{d.lancamentos}</td>
                      <td className={`${td} text-right tabular-nums`}>{d.produtos.size}</td>
                      <td className={`${td} text-right font-medium tabular-nums text-slate-900`}>{formatarUn(d.un)}</td>
                      <td className={`${td} text-right font-medium tabular-nums text-slate-900`}>{formatarKg(d.kg)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ---------------- ROTA ---------------- */}
      {aba === 'rota' && (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <Cartao titulo="Total a pagar" valor={reais(totalAPagar)} cor="teal" />
            <Cartao titulo="Total pago" valor={reais(totalPago)} cor="emerald" />
            <Cartao titulo="Saldo em aberto" valor={reais(saldoRota)} cor={saldoRota > 0 ? 'amber' : 'emerald'} />
          </div>

          <h3 className={titulo}>
            <span className="inline-block h-5 w-1 rounded-full bg-teal-500" aria-hidden="true" />
            Lançamento de revenda — rota {rota}
          </h3>
          <div className={`${painelFormulario} md:grid-cols-6`}>
            <label className={rotulo}>Data<input type="date" value={rotaData} onChange={e => setRotaData(e.target.value)} className={campo} /></label>
            <label className={rotulo}>Vendedor<input value={vendedor} onChange={e => setVendedor(e.target.value)} className={campo} /></label>
            <label className={`${rotulo} col-span-2`}>Cliente<select value={cliente} onChange={e => setCliente(e.target.value)} className={campo}>{clientesRota.map(nome => <option key={nome} value={nome}>{nome}</option>)}</select></label>
            <label className={`${rotulo} col-span-2`}>Produto<select value={produtoRota} onChange={e => atualizarPreco(e.target.value)} className={campo}>{produtosRota.map(item => <option key={item.nome} value={item.nome}>{item.nome}</option>)}</select></label>

            <div className="col-span-2 grid grid-cols-2 gap-3 rounded-xl border border-dashed border-slate-300 bg-white/60 p-3 md:col-span-6 md:grid-cols-4">
              <label className={rotulo}><span className="text-emerald-700">(+) Levou</span><input type="number" min={0} value={levou} onChange={e => setLevou(e.target.value)} className={campo} /></label>
              <label className={rotulo}><span className="text-amber-700">(-) Devolveu bom</span><input type="number" min={0} value={devBom} onChange={e => setDevBom(e.target.value)} className={campo} /></label>
              <label className={rotulo}><span className="text-rose-700">(-) Devolveu ruim (mofado)</span><input type="number" min={0} value={devRuim} onChange={e => setDevRuim(e.target.value)} className={campo} /></label>
              <label className={rotulo}><span className="text-teal-700">(=) Vendeu</span><input type="number" readOnly value={vendeu || ''} className={campoLeitura} /></label>
            </div>

            <label className={`${rotulo} col-span-2`}>Valor unit. (R$)<input type="number" min={0} step="0.01" value={valUnit} onChange={e => setValUnit(e.target.value)} className={campo} /></label>
            <label className={`${rotulo} col-span-2`}>Subtotal (R$)<input type="number" readOnly value={subtotal ? subtotal.toFixed(2) : ''} className={campoLeitura} /></label>
            <label className={`${rotulo} col-span-2`}>Valor pago (R$)<input type="number" min={0} step="0.01" value={pago} onChange={e => setPago(e.target.value)} className={campo} /></label>
            <div className="col-span-2 flex items-end md:col-span-6">
              <button type="button" onClick={adicionarRevenda} className={`${botaoPrimario} w-full sm:w-auto`}>
                Lançar controle de revenda
              </button>
            </div>
          </div>

          <h3 className={`${titulo} mt-8`}>
            <span className="inline-block h-5 w-1 rounded-full bg-teal-500" aria-hidden="true" />
            Controle de revenda — {rota}
            <span className="ml-auto text-xs font-normal text-slate-500">{itensRota.length} {itensRota.length === 1 ? 'lançamento' : 'lançamentos'}</span>
          </h3>
          <div className={tabelaCaixa}>
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead>
                <tr className={cabecalhoTabela}>
                  <th className={th}>Data</th><th className={th}>Vendedor</th><th className={th}>Cliente</th><th className={th}>Produto</th><th className={`${th} text-right`}>Levou</th><th className={`${th} text-right`}>Dev. bom</th><th className={`${th} text-right`}>Dev. ruim</th><th className={`${th} text-right`}>Vendeu</th><th className={`${th} text-right`}>Val. unit.</th><th className={`${th} text-right`}>Subtotal</th><th className={`${th} text-right`}>Pago</th><th className={th}></th>
                </tr>
              </thead>
              <tbody>
                {itensRota.length === 0 && <tr><td colSpan={12} className={vazio}>Nenhum lançamento nesta rota.</td></tr>}
                {itensRota.map(item => (
                  <tr key={item.id} className={linhaTabela}>
                    <td className={`${td} whitespace-nowrap text-slate-600`}>{dataBr(item.data)}</td>
                    <td className={td}>{item.vendedor}</td>
                    <td className={`${td} font-medium text-slate-900`}>{item.cliente}</td>
                    <td className={td}>{item.produto}</td>
                    <td className={`${td} text-right tabular-nums`}>{item.levou}</td>
                    <td className={`${td} text-right tabular-nums text-amber-700`}>{item.devBom}</td>
                    <td className={`${td} text-right tabular-nums ${Number(item.devRuim) > 0 ? 'font-medium text-rose-600' : ''}`}>{item.devRuim}</td>
                    <td className={`${td} text-right font-medium tabular-nums text-teal-800`}>{item.vendeu}</td>
                    <td className={`${td} text-right tabular-nums`}>{reais(item.valUnit)}</td>
                    <td className={`${td} text-right font-medium tabular-nums text-slate-900`}>{reais(item.subtotal)}</td>
                    <td className={`${td} text-right tabular-nums`}>{reais(item.pago)}</td>
                    <td className={`${td} text-right`}><button type="button" onClick={() => p.removerRota(item.id)} className={botaoExcluir}>Excluir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ---------------- RELATÓRIOS ---------------- */}
      {aba === 'relatorios' && (
        <>
          <h3 className={titulo}>
            <span className="inline-block h-5 w-1 rounded-full bg-teal-500" aria-hidden="true" />
            Consulta e filtro de vendas
          </h3>
          <div className={`${painelFormulario} md:grid-cols-3`}>
            <label className={rotulo}>Data inicial<input type="date" value={relIni} onChange={e => setRelIni(e.target.value)} className={campo} /></label>
            <label className={rotulo}>Data final<input type="date" value={relFim} onChange={e => setRelFim(e.target.value)} className={campo} /></label>
            <label className={`${rotulo} col-span-2 md:col-span-1`}>
              Setor / rota
              <select value={relSetor} onChange={e => setRelSetor(e.target.value as 'TODOS' | RotaRevenda)} className={campo}>
                <option value="TODOS">Todos os setores</option>
                <option value="Cidade">Somente Cidade</option>
                <option value="Sítio">Somente Sítio</option>
              </select>
            </label>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Cartao titulo="Total vendido" valor={reais(relatorio.totVendas)} cor="teal" />
            <Cartao titulo="Total recebido" valor={reais(relatorio.totPago)} cor="emerald" />
            <Cartao titulo="Qtd. mofados / ruins" valor={`${relatorio.qtdMofados} un`} cor="rose" />
            <Cartao titulo="Prejuízo (mofados)" valor={reais(relatorio.valMofados)} cor="rose" />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h4 className={`${titulo} text-emerald-700`}>
                <span className="inline-block h-5 w-1 rounded-full bg-emerald-500" aria-hidden="true" />
                Produtos mais vendidos
              </h4>
              <div className={tabelaCaixa}>
                <table className="w-full border-collapse text-sm">
                  <thead><tr className={cabecalhoTabela}><th className={th}>Produto</th><th className={`${th} text-right`}>Qtd. vendida</th><th className={`${th} text-right`}>Total gerado</th></tr></thead>
                  <tbody>
                    {relatorio.maisVendidos.length === 0 && <tr><td colSpan={3} className={vazio}>Nenhuma venda no período.</td></tr>}
                    {relatorio.maisVendidos.map(([nome, dados], indice) => (
                      <tr key={nome} className={linhaTabela}>
                        <td className={`${td} font-medium text-slate-900`}>
                          <span className="mr-2 text-xs font-normal text-slate-400">{indice + 1}.</span>
                          {nome}
                        </td>
                        <td className={`${td} text-right tabular-nums`}>{dados.qtd} un</td>
                        <td className={`${td} text-right font-medium tabular-nums text-teal-800`}>{reais(dados.val)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 className={`${titulo} text-rose-700`}>
                <span className="inline-block h-5 w-1 rounded-full bg-rose-500" aria-hidden="true" />
                Prejuízo com mofados / trocas
              </h4>
              <div className={tabelaCaixa}>
                <table className="w-full border-collapse text-sm">
                  <thead><tr className={cabecalhoTabela}><th className={th}>Produto</th><th className={`${th} text-right`}>Qtd. mofada</th><th className={`${th} text-right`}>Prejuízo</th></tr></thead>
                  <tbody>
                    {relatorio.mofados.length === 0 && <tr><td colSpan={3} className={vazio}>Nenhum mofado no período.</td></tr>}
                    {relatorio.mofados.map(([nome, dados]) => (
                      <tr key={nome} className={linhaTabela}>
                        <td className={`${td} font-medium text-slate-900`}>{nome}</td>
                        <td className={`${td} text-right tabular-nums`}>{dados.qtd} un</td>
                        <td className={`${td} text-right font-medium tabular-nums text-rose-700`}>{reais(dados.val)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ---------------- DEPÓSITOS ---------------- */}
      {aba === 'deposito' && (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            <Cartao titulo="Total depositado / passado" valor={reais(totalDepositado)} cor="amber" />
            <Cartao titulo="Depósitos lançados" valor={`${(p.lancamentosDeposito || []).length}`} cor="teal" />
          </div>

          <h3 className={titulo}>
            <span className="inline-block h-5 w-1 rounded-full bg-teal-500" aria-hidden="true" />
            Lançar depósito / repasse de venda do dia
          </h3>
          <div className={`${painelFormulario} md:grid-cols-3`}>
            <label className={rotulo}>Data do depósito<input type="date" value={depData} onChange={e => setDepData(e.target.value)} className={campo} /></label>
            <label className={rotulo}>
              Origem da venda
              <select value={depOrigem} onChange={e => setDepOrigem(e.target.value as OrigemDeposito)} className={campo}>
                <option value="Sítio">Venda Sítio</option>
                <option value="Cidade">Venda Cidade</option>
              </select>
            </label>
            <label className={rotulo}>
              Forma de pagamento
              <select value={depForma} onChange={e => setDepForma(e.target.value)} className={campo}>
                <option value="PIX / Transferência">PIX / Transferência</option>
                <option value="Dinheiro em Caixa">Dinheiro em Caixa</option>
                <option value="Depósito Bancário">Depósito Bancário</option>
              </select>
            </label>
            <label className={`${rotulo} col-span-2 md:col-span-3`}>
              Conta / CNPJ de destino
              <select
                value={depDestino}
                onChange={e => {
                  if (e.target.value === OPCAO_NOVO_CNPJ) {
                    setModalCnpj(true);
                    return;
                  }
                  setDepDestino(e.target.value);
                }}
                className={campo}
              >
                {p.contasDeposito.map(nome => <option key={nome} value={nome}>{nome}</option>)}
                <option value={OPCAO_NOVO_CNPJ}>+ Adicionar novo CNPJ</option>
              </select>
            </label>
            <label className={rotulo}>Valor depositado (R$)<input type="number" min={0} step="0.01" value={depValor} onChange={e => setDepValor(e.target.value)} placeholder="0,00" className={`${campo} font-medium tabular-nums`} /></label>
            <label className={`${rotulo} md:col-span-2`}>Nº comprovante / obs<input value={depObs} onChange={e => setDepObs(e.target.value)} placeholder="Ex: Pix feito ao final do dia" className={campo} /></label>
            <div className="col-span-2 flex items-end md:col-span-3">
              <button type="button" onClick={lancarDeposito} className={`${botaoPrimario} w-full sm:w-auto`}>
                Lançar depósito
              </button>
            </div>
          </div>

          <h3 className={`${titulo} mt-8`}>
            <span className="inline-block h-5 w-1 rounded-full bg-teal-500" aria-hidden="true" />
            Histórico de depósitos / repasses de venda
          </h3>
          <div className={tabelaCaixa}>
            <table className="w-full min-w-[780px] border-collapse text-sm">
              <thead>
                <tr className={cabecalhoTabela}>
                  <th className={th}>Data</th>
                  <th className={th}>Origem venda</th>
                  <th className={th}>Destino (CNPJ / conta)</th>
                  <th className={th}>Forma</th>
                  <th className={`${th} text-right`}>Valor</th>
                  <th className={th}>Comprovante / obs</th>
                  <th className={th}></th>
                </tr>
              </thead>
              <tbody>
                {(p.lancamentosDeposito || []).length === 0 && <tr><td colSpan={7} className={vazio}>Nenhum depósito lançado.</td></tr>}
                {(p.lancamentosDeposito || []).map(item => (
                  <tr key={item.id} className={linhaTabela}>
                    <td className={`${td} whitespace-nowrap text-slate-600`}>{dataBr(item.data)}</td>
                    <td className={td}><span className={`rounded px-2 py-0.5 text-xs font-medium ${item.origem === 'Cidade' ? 'bg-sky-50 text-sky-800' : 'bg-slate-100 text-slate-700'}`}>{item.origem}</span></td>
                    <td className={`${td} font-semibold text-slate-800`}>{item.destino}</td>
                    <td className={`${td} text-slate-600`}>{item.forma}</td>
                    <td className={`${td} text-right font-medium tabular-nums text-slate-900`}>{reais(item.valor)}</td>
                    <td className={`${td} text-slate-600`}>{item.obs}</td>
                    <td className={`${td} text-right`}><button type="button" onClick={() => p.removerDeposito(item.id)} className={botaoExcluir}>Excluir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ---------------- MODAIS ---------------- */}
      {modalAberto && (
        <div className={modalFundo} role="dialog" aria-modal="true" aria-labelledby="titulo-novo-produto">
          <div className={modalCaixa}>
            <h3 id="titulo-novo-produto" className="m-0 text-lg font-semibold tracking-tight text-slate-900">Cadastrar novo produto</h3>
            <p className="mb-0 mt-1 text-sm text-slate-500">Esse produto ficará disponível nos próximos lançamentos.</p>
            <label className={`${rotulo} mt-5`}>
              Nome do produto
              <input autoFocus value={novoNome} onChange={e => setNovoNome(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') salvarProdutoNovo(); if (e.key === 'Escape') cancelarProdutoNovo(); }} placeholder="Digite o nome do produto" className={campo} />
            </label>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={cancelarProdutoNovo} className={botaoSecundario}>Cancelar</button>
              <button type="button" onClick={salvarProdutoNovo} className={botaoPrimario}>Salvar produto</button>
            </div>
          </div>
        </div>
      )}

      {modalCnpj && (
        <div className={modalFundo} role="dialog" aria-modal="true" aria-labelledby="titulo-novo-cnpj">
          <div className={modalCaixa}>
            <h3 id="titulo-novo-cnpj" className="m-0 text-lg font-semibold tracking-tight text-slate-900">Cadastrar novo CNPJ / conta</h3>
            <p className="mb-0 mt-1 text-sm text-slate-500">A conta aparecerá na lista de destinos dos depósitos.</p>
            <label className={`${rotulo} mt-5`}>
              Nome da instituição / razão social
              <input autoFocus value={novoNomeCnpj} onChange={e => setNovoNomeCnpj(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') cancelarCnpjNovo(); }} placeholder="Ex: Centro Espírita Filial 2" className={campo} />
            </label>
            <label className={`${rotulo} mt-3`}>
              Número do CNPJ
              <input value={novoNumeroCnpj} onChange={e => setNovoNumeroCnpj(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') salvarCnpjNovo(); if (e.key === 'Escape') cancelarCnpjNovo(); }} placeholder="00.000.000/0000-00" className={campo} />
            </label>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={cancelarCnpjNovo} className={botaoSecundario}>Cancelar</button>
              <button type="button" onClick={salvarCnpjNovo} className={botaoPrimario}>Salvar CNPJ</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
