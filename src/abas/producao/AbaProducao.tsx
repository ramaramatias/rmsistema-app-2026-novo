import { useMemo, useState } from 'react';
import {
  CLIENTES_ROTA_CIDADE,
  CLIENTES_ROTA_SITIO,
  PRODUTOS_ROTA_CIDADE,
  PRODUTOS_ROTA_SITIO
} from '../../dados/padroes';
import type { LancamentoDeposito, LancamentoProducao, LancamentoRota, OrigemDeposito, RotaRevenda, TipoLancamentoProducao, TurnoProducao } from '../../tipos';

const OPCAO_NOVO = '__ADD_NEW__';
const OPCAO_NOVO_CNPJ = '__ADD_NEW_CNPJ__';
const campo = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15';
const campoLeitura = `${campo} bg-slate-100 font-bold`;

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
    () => (p.lancamentos || []).filter(item => item.turno === turno),
    [p.lancamentos, turno]
  );
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

  const classeAba = (ativa: boolean, cor: string) =>
    `flex-1 cursor-pointer border-0 px-3 py-3 text-[12px] font-bold text-white ${ativa ? cor : 'bg-transparent hover:bg-slate-700'}`;

  return (
    <section className="mx-auto my-5 max-w-6xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 sm:p-6">
      <p className="m-0 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">Padaria</p>
      <h2 className="m-0 mt-1 text-xl font-black tracking-tight text-slate-900">Produção, rota e depósitos</h2>
      <p className="mb-4 mt-1 text-sm text-slate-500">Produção da padaria, revenda da cidade e do sítio, relatórios e depósitos das vendas.</p>

      <div className="mb-3 flex flex-wrap overflow-hidden rounded-xl bg-slate-900">
        <button type="button" onClick={() => setAba('producao')} className={classeAba(aba === 'producao', 'bg-amber-500')}>🏭 Produção</button>
        <button type="button" onClick={() => setAba('rota')} className={classeAba(aba === 'rota', 'bg-amber-500')}>🚚 Controle revenda (rota)</button>
        <button type="button" onClick={() => setAba('relatorios')} className={classeAba(aba === 'relatorios', 'bg-amber-500')}>📊 Relatórios de venda</button>
        <button type="button" onClick={() => setAba('deposito')} className={classeAba(aba === 'deposito', 'bg-amber-500')}>💰 Depósitos</button>
      </div>

      {aba === 'producao' && (
        <div className="mb-4 flex overflow-hidden rounded-xl bg-slate-800">
          {(['Manhã', 'Tarde'] as TurnoProducao[]).map(opcao => (
            <button key={opcao} type="button" onClick={() => setTurno(opcao)} className={`flex-1 cursor-pointer border-0 px-4 py-3 text-sm font-bold text-white ${turno === opcao ? 'bg-teal-600' : 'bg-transparent hover:bg-slate-700'}`}>
              {opcao === 'Manhã' ? '☀️ Produção Manhã' : '🌙 Produção Tarde'}
            </button>
          ))}
        </div>
      )}

      {aba === 'rota' && (
        <div className="mb-4 flex overflow-hidden rounded-xl bg-slate-800">
          {(['Cidade', 'Sítio'] as RotaRevenda[]).map(opcao => (
            <button key={opcao} type="button" onClick={() => escolherRota(opcao)} className={`flex-1 cursor-pointer border-0 px-4 py-3 text-sm font-bold text-white ${rota === opcao ? 'bg-teal-600' : 'bg-transparent hover:bg-slate-700'}`}>
              {opcao === 'Cidade' ? '🏙️ Cidade (FAGNO)' : '🏡 Sítio'}
            </button>
          ))}
        </div>
      )}

      {aba === 'producao' && (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border-l-4 border-teal-500 bg-teal-50 px-4 py-3">
              <h3 className="m-0 text-[12px] font-bold uppercase tracking-wide text-slate-500">Total em quilos (kg)</h3>
              <p className="mb-0 mt-1 text-xl font-black text-slate-900">{totalKg.toFixed(2)} kg</p>
            </div>
            <div className="rounded-xl border-l-4 border-teal-500 bg-teal-50 px-4 py-3">
              <h3 className="m-0 text-[12px] font-bold uppercase tracking-wide text-slate-500">Total em unidades (un)</h3>
              <p className="mb-0 mt-1 text-xl font-black text-slate-900">{totalUn.toLocaleString('pt-BR')} un</p>
            </div>
          </div>
          <h3 className="mb-2 mt-0 text-sm font-black text-slate-800">Lançar item — produção {turno.toLowerCase()}</h3>
          <div className="mb-3 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 md:grid-cols-4 lg:grid-cols-7">
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Data<input type="date" value={data} onChange={e => setData(e.target.value)} className={campo} /></label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Tipo
              <select value={tipo} onChange={e => setTipo(e.target.value as TipoLancamentoProducao)} className={campo}>
                <option value="Produção">Produção Normal</option>
                <option value="Encomenda">Encomenda</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 lg:col-span-2">
              Produto
              <select value={produto} onChange={e => { if (e.target.value === OPCAO_NOVO) { setModalAberto(true); return; } setProduto(e.target.value); }} className={campo}>
                {p.produtos.map(nome => <option key={nome} value={nome}>{nome}</option>)}
                <option value={OPCAO_NOVO}>+ Adicionar novo produto</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Nº de telas<input type="number" min={0} value={telas} onChange={e => { setTelas(e.target.value); recalcularUnidades(e.target.value, unidTela); }} className={campo} /></label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Unid. por tela<input type="number" min={0} value={unidTela} onChange={e => { setUnidTela(e.target.value); recalcularUnidades(telas, e.target.value); }} className={campo} /></label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Total unidades<input type="number" min={0} value={totalUnid} onChange={e => setTotalUnid(e.target.value)} placeholder="Autocalculado" className={campo} /></label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Peso total (kg)<input type="number" min={0} step="0.01" value={peso} onChange={e => setPeso(e.target.value)} placeholder="ex: 52" className={campo} /></label>
          </div>
          <button type="button" onClick={adicionarProducao} className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-[12px] font-bold text-white hover:bg-emerald-500">Adicionar lançamento</button>
          <h3 className="mb-2 mt-8 text-sm font-black text-slate-800">Itens produzidos ({turno})</h3>
          <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 text-left text-[11px] font-bold uppercase tracking-wide text-slate-600">
                  <th className="px-3 py-3">Data</th><th className="px-3 py-3">Tipo</th><th className="px-3 py-3">Produto</th><th className="px-3 py-3">Telas</th><th className="px-3 py-3">Unid/Tela</th><th className="px-3 py-3">Total unid.</th><th className="px-3 py-3">Peso (kg)</th><th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {itensTurno.length === 0 && <tr><td colSpan={8} className="px-3 py-8 text-center text-slate-400">Nenhum lançamento neste turno.</td></tr>}
                {itensTurno.map(item => (
                  <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2">{dataBr(item.data)}</td>
                    <td className="px-3 py-2"><span className={`rounded px-2 py-0.5 text-[11px] font-bold ${item.tipo === 'Encomenda' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'}`}>{item.tipo}</span></td>
                    <td className="px-3 py-2 font-bold text-slate-900">{item.produto}</td>
                    <td className="px-3 py-2">{item.telas || '-'}</td>
                    <td className="px-3 py-2">{item.unidTela || '-'}</td>
                    <td className="px-3 py-2">{item.totalUnid ? `${item.totalUnid} un` : '-'}</td>
                    <td className="px-3 py-2">{item.peso ? `${item.peso} kg` : '-'}</td>
                    <td className="px-3 py-2 text-right"><button type="button" onClick={() => p.removerLancamento(item.id)} className="cursor-pointer border-0 bg-transparent text-[11px] font-bold text-rose-600 hover:underline">Excluir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {aba === 'rota' && (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border-l-4 border-teal-500 bg-teal-50 px-4 py-3">
              <h3 className="m-0 text-[12px] font-bold uppercase tracking-wide text-slate-500">Total a pagar</h3>
              <p className="mb-0 mt-1 text-xl font-black text-slate-900">{reais(totalAPagar)}</p>
            </div>
            <div className="rounded-xl border-l-4 border-teal-500 bg-teal-50 px-4 py-3">
              <h3 className="m-0 text-[12px] font-bold uppercase tracking-wide text-slate-500">Total pago</h3>
              <p className="mb-0 mt-1 text-xl font-black text-slate-900">{reais(totalPago)}</p>
            </div>
          </div>
          <h3 className="mb-2 mt-0 text-sm font-black text-slate-800">Lançamento de revenda — rota {rota}</h3>
          <div className="mb-3 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 md:grid-cols-4 lg:grid-cols-5">
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Data<input type="date" value={rotaData} onChange={e => setRotaData(e.target.value)} className={campo} /></label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Vendedor<input value={vendedor} onChange={e => setVendedor(e.target.value)} className={campo} /></label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Cliente<select value={cliente} onChange={e => setCliente(e.target.value)} className={campo}>{clientesRota.map(nome => <option key={nome} value={nome}>{nome}</option>)}</select></label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Produto<select value={produtoRota} onChange={e => atualizarPreco(e.target.value)} className={campo}>{produtosRota.map(item => <option key={item.nome} value={item.nome}>{item.nome}</option>)}</select></label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">(+) Levou<input type="number" min={0} value={levou} onChange={e => setLevou(e.target.value)} className={campo} /></label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">(-) Devolveu bom<input type="number" min={0} value={devBom} onChange={e => setDevBom(e.target.value)} className={campo} /></label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">(-) Devolveu ruim (mofado)<input type="number" min={0} value={devRuim} onChange={e => setDevRuim(e.target.value)} className={campo} /></label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">(=) Vendeu<input type="number" readOnly value={vendeu || ''} className={campoLeitura} /></label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Valor unit. (R$)<input type="number" min={0} step="0.01" value={valUnit} onChange={e => setValUnit(e.target.value)} className={campo} /></label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Subtotal (R$)<input type="number" readOnly value={subtotal ? subtotal.toFixed(2) : ''} className={campoLeitura} /></label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Valor pago (R$)<input type="number" min={0} step="0.01" value={pago} onChange={e => setPago(e.target.value)} className={campo} /></label>
          </div>
          <button type="button" onClick={adicionarRevenda} className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-[12px] font-bold text-white hover:bg-emerald-500">Lançar controle de revenda</button>
          <h3 className="mb-2 mt-8 text-sm font-black text-slate-800">Controle de revenda — {rota}</h3>
          <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 text-left text-[11px] font-bold uppercase tracking-wide text-slate-600">
                  <th className="px-3 py-3">Data</th><th className="px-3 py-3">Vendedor</th><th className="px-3 py-3">Cliente</th><th className="px-3 py-3">Produto</th><th className="px-3 py-3">Levou</th><th className="px-3 py-3">Dev. bom</th><th className="px-3 py-3">Dev. ruim</th><th className="px-3 py-3">Vendeu</th><th className="px-3 py-3">Val. unit.</th><th className="px-3 py-3">Subtotal</th><th className="px-3 py-3">Pago</th><th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {itensRota.length === 0 && <tr><td colSpan={12} className="px-3 py-8 text-center text-slate-400">Nenhum lançamento nesta rota.</td></tr>}
                {itensRota.map(item => (
                  <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2">{dataBr(item.data)}</td>
                    <td className="px-3 py-2">{item.vendedor}</td>
                    <td className="px-3 py-2 font-bold">{item.cliente}</td>
                    <td className="px-3 py-2">{item.produto}</td>
                    <td className="px-3 py-2">{item.levou}</td>
                    <td className="px-3 py-2">{item.devBom}</td>
                    <td className="px-3 py-2">{item.devRuim}</td>
                    <td className="px-3 py-2 font-bold">{item.vendeu}</td>
                    <td className="px-3 py-2">{reais(item.valUnit)}</td>
                    <td className="px-3 py-2 font-bold">{reais(item.subtotal)}</td>
                    <td className="px-3 py-2">{reais(item.pago)}</td>
                    <td className="px-3 py-2 text-right"><button type="button" onClick={() => p.removerRota(item.id)} className="cursor-pointer border-0 bg-transparent text-[11px] font-bold text-rose-600 hover:underline">Excluir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {aba === 'relatorios' && (
        <>
          <h3 className="mb-2 mt-0 text-sm font-black text-slate-800">Consulta e filtro de vendas</h3>
          <div className="mb-3 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 md:grid-cols-3">
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Data inicial<input type="date" value={relIni} onChange={e => setRelIni(e.target.value)} className={campo} /></label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Data final<input type="date" value={relFim} onChange={e => setRelFim(e.target.value)} className={campo} /></label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Setor / rota
              <select value={relSetor} onChange={e => setRelSetor(e.target.value as 'TODOS' | RotaRevenda)} className={campo}>
                <option value="TODOS">Todos os setores</option>
                <option value="Cidade">Somente Cidade</option>
                <option value="Sítio">Somente Sítio</option>
              </select>
            </label>
          </div>
          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border-l-4 border-teal-500 bg-teal-50 px-4 py-3">
              <h3 className="m-0 text-[12px] font-bold uppercase tracking-wide text-slate-500">Total vendido</h3>
              <p className="mb-0 mt-1 text-xl font-black text-slate-900">{reais(relatorio.totVendas)}</p>
            </div>
            <div className="rounded-xl border-l-4 border-amber-400 bg-amber-50 px-4 py-3">
              <h3 className="m-0 text-[12px] font-bold uppercase tracking-wide text-slate-500">Total recebido</h3>
              <p className="mb-0 mt-1 text-xl font-black text-slate-900">{reais(relatorio.totPago)}</p>
            </div>
            <div className="rounded-xl border-l-4 border-rose-500 bg-rose-50 px-4 py-3">
              <h3 className="m-0 text-[12px] font-bold uppercase tracking-wide text-slate-500">Qtd. mofados / ruins</h3>
              <p className="mb-0 mt-1 text-xl font-black text-slate-900">{relatorio.qtdMofados} un</p>
            </div>
            <div className="rounded-xl border-l-4 border-rose-500 bg-rose-50 px-4 py-3">
              <h3 className="m-0 text-[12px] font-bold uppercase tracking-wide text-slate-500">Prejuízo (mofados)</h3>
              <p className="mb-0 mt-1 text-xl font-black text-slate-900">{reais(relatorio.valMofados)}</p>
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h4 className="mb-2 mt-0 text-sm font-black text-emerald-700">Produtos mais vendidos</h4>
              <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
                <table className="w-full border-collapse text-sm">
                  <thead><tr className="bg-slate-100 text-left text-[11px] font-bold uppercase text-slate-600"><th className="px-3 py-3">Produto</th><th className="px-3 py-3">Qtd. vendida</th><th className="px-3 py-3">Total gerado</th></tr></thead>
                  <tbody>
                    {relatorio.maisVendidos.length === 0 && <tr><td colSpan={3} className="px-3 py-6 text-center text-slate-400">Nenhuma venda no período.</td></tr>}
                    {relatorio.maisVendidos.map(([nome, dados]) => (
                      <tr key={nome} className="border-t border-slate-100"><td className="px-3 py-2 font-bold">{nome}</td><td className="px-3 py-2">{dados.qtd} un</td><td className="px-3 py-2">{reais(dados.val)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 className="mb-2 mt-0 text-sm font-black text-rose-700">Prejuízo com mofados / trocas</h4>
              <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
                <table className="w-full border-collapse text-sm">
                  <thead><tr className="bg-slate-100 text-left text-[11px] font-bold uppercase text-slate-600"><th className="px-3 py-3">Produto</th><th className="px-3 py-3">Qtd. mofada</th><th className="px-3 py-3">Prejuízo</th></tr></thead>
                  <tbody>
                    {relatorio.mofados.length === 0 && <tr><td colSpan={3} className="px-3 py-6 text-center text-slate-400">Nenhum mofado no período.</td></tr>}
                    {relatorio.mofados.map(([nome, dados]) => (
                      <tr key={nome} className="border-t border-slate-100"><td className="px-3 py-2 font-bold">{nome}</td><td className="px-3 py-2">{dados.qtd} un</td><td className="px-3 py-2 font-bold">{reais(dados.val)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {aba === 'deposito' && (
        <>
          <div className="mb-5">
            <div className="rounded-xl border-l-4 border-amber-400 bg-amber-50 px-4 py-3">
              <h3 className="m-0 text-[12px] font-bold uppercase tracking-wide text-slate-500">Total depositado / passado</h3>
              <p className="mb-0 mt-1 text-xl font-black text-slate-900">{reais(totalDepositado)}</p>
            </div>
          </div>
          <h3 className="mb-2 mt-0 text-sm font-black text-slate-800">Lançar depósito / repasse de venda do dia</h3>
          <div className="mb-3 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 md:grid-cols-3">
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Data do depósito<input type="date" value={depData} onChange={e => setDepData(e.target.value)} className={campo} /></label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Origem da venda
              <select value={depOrigem} onChange={e => setDepOrigem(e.target.value as OrigemDeposito)} className={campo}>
                <option value="Sítio">Venda Sítio</option>
                <option value="Cidade">Venda Cidade</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 md:col-span-3">
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
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Forma de pagamento
              <select value={depForma} onChange={e => setDepForma(e.target.value)} className={campo}>
                <option value="PIX / Transferência">PIX / Transferência</option>
                <option value="Dinheiro em Caixa">Dinheiro em Caixa</option>
                <option value="Depósito Bancário">Depósito Bancário</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Valor depositado (R$)<input type="number" min={0} step="0.01" value={depValor} onChange={e => setDepValor(e.target.value)} placeholder="0,00" className={campo} /></label>
            <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Nº comprovante / obs<input value={depObs} onChange={e => setDepObs(e.target.value)} placeholder="Ex: Pix feito ao final do dia" className={campo} /></label>
          </div>
          <button type="button" onClick={lancarDeposito} className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-[12px] font-bold text-white hover:bg-emerald-500">Lançar depósito</button>
          <h3 className="mb-2 mt-8 text-sm font-black text-slate-800">Histórico de depósitos / repasses de venda</h3>
          <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
            <table className="w-full min-w-[780px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 text-left text-[11px] font-bold uppercase tracking-wide text-slate-600">
                  <th className="px-3 py-3">Data</th>
                  <th className="px-3 py-3">Origem venda</th>
                  <th className="px-3 py-3">Destino (CNPJ / conta)</th>
                  <th className="px-3 py-3">Forma</th>
                  <th className="px-3 py-3">Valor</th>
                  <th className="px-3 py-3">Comprovante / obs</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {(p.lancamentosDeposito || []).length === 0 && <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-400">Nenhum depósito lançado.</td></tr>}
                {(p.lancamentosDeposito || []).map(item => (
                  <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2">{dataBr(item.data)}</td>
                    <td className="px-3 py-2 font-bold">{item.origem}</td>
                    <td className="px-3 py-2">{item.destino}</td>
                    <td className="px-3 py-2">{item.forma}</td>
                    <td className="px-3 py-2 font-bold">{reais(item.valor)}</td>
                    <td className="px-3 py-2">{item.obs}</td>
                    <td className="px-3 py-2 text-right"><button type="button" onClick={() => p.removerDeposito(item.id)} className="cursor-pointer border-0 bg-transparent text-[11px] font-bold text-rose-600 hover:underline">Excluir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="m-0 text-base font-black text-slate-900">Cadastrar novo produto</h3>
            <label className="mt-4 flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Nome do produto
              <input autoFocus value={novoNome} onChange={e => setNovoNome(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { const nome = novoNome.trim(); if (!nome) return; p.salvarProduto(nome); setProduto(nome); setModalAberto(false); setNovoNome(''); } }} placeholder="Digite o nome do produto" className={campo} />
            </label>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => { const nome = novoNome.trim(); if (!nome) return; p.salvarProduto(nome); setProduto(nome); setModalAberto(false); setNovoNome(''); }} className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-[12px] font-bold text-white hover:bg-emerald-500">Salvar produto</button>
              <button type="button" onClick={() => { setModalAberto(false); setNovoNome(''); setProduto(p.produtos[0] || ''); }} className="cursor-pointer rounded-lg bg-slate-500 px-4 py-2 text-[12px] font-bold text-white hover:bg-slate-400">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {modalCnpj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="m-0 text-base font-black text-slate-900">Cadastrar novo CNPJ / conta</h3>
            <label className="mt-4 flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Nome da instituição / razão social
              <input autoFocus value={novoNomeCnpj} onChange={e => setNovoNomeCnpj(e.target.value)} placeholder="Ex: Centro Espírita Filial 2" className={campo} />
            </label>
            <label className="mt-3 flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Número do CNPJ
              <input value={novoNumeroCnpj} onChange={e => setNovoNumeroCnpj(e.target.value)} placeholder="00.000.000/0000-00" className={campo} />
            </label>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={salvarCnpjNovo} className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-[12px] font-bold text-white hover:bg-emerald-500">Salvar CNPJ</button>
              <button type="button" onClick={() => { setModalCnpj(false); setNovoNomeCnpj(''); setNovoNumeroCnpj(''); setDepDestino(p.contasDeposito[0] || ''); }} className="cursor-pointer rounded-lg bg-slate-500 px-4 py-2 text-[12px] font-bold text-white hover:bg-slate-400">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
