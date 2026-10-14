import { useMemo, useState } from 'react';
import { CabecalhoAba, botaoInfo, botaoMiniPerigo, botaoPrimario, botaoSecundario, cabecalhoTabela, campo, campoMini, linhaTabela, tabela, tabelaCaixa, td, th } from '../../componentes/ui';
import { LISTA_COMPLETA } from '../../catalogo/listaCompleta';
import { CalendarioMes, mesIdDeData, rotuloMes, type MesId } from './CalendarioMes';
import { enviarImagemWhatsappPrevisao, type LinhaPrevisao } from './relatorioPrevisao';

const diasDoMes = (id: MesId, ano: number) => {
  const indice = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].indexOf(id);
  return new Date(ano, indice + 1, 0).getDate();
};

type ProdutoEstoque = {
  id: number;
  codigo: string;
  nome: string;
  estoque: number | string;
  unidade: string;
  saidas: Partial<Record<MesId, number | string>>;
};

type RegistroHistorico = {
  id: string;
  nome: string;
  salvoEm: string;
  dataCalendario: number;
  meses: MesId[];
  produtos: ProdutoEstoque[];
};

const CHAVE = 'rm_estoque_previsao';
const CHAVE_HISTORICO = 'rm_estoque_previsao_historico';

const produtosIniciais: ProdutoEstoque[] = [
  { id: 1, codigo: 'PRD-001', nome: 'Teclado Mecânico RGB', estoque: 45, unidade: 'un', saidas: { jan: 30, fev: 35, mar: 40, abr: 28, mai: 32, jun: 38 } },
  { id: 2, codigo: 'PRD-002', nome: 'Mouse Sem Fio Ergonômico', estoque: 12, unidade: 'un', saidas: { jan: 25, fev: 20, mar: 30, abr: 22, mai: 28, jun: 25 } },
  { id: 3, codigo: 'PRD-003', nome: 'Cadeira Pro de Escritório', estoque: 8, unidade: 'un', saidas: { jan: 10, fev: 12, mar: 15, abr: 8, mai: 14, jun: 11 } }
];

const mesesValidos = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const numeroSalvo = (valor: unknown) => {
  const n = typeof valor === 'number' ? valor : Number(String(valor ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

const lerSalvo = () => {
  const vazio = { meses: ['abr', 'mai', 'jun'] as MesId[], produtos: produtosIniciais };
  if (typeof window === 'undefined') return vazio;
  try {
    const texto = window.localStorage.getItem(CHAVE);
    if (!texto) return vazio;
    const dados = JSON.parse(texto);
    const meses = Array.isArray(dados.meses) ? dados.meses.filter((id: string) => mesesValidos.includes(id)) : [];
    const produtos = Array.isArray(dados.produtos)
      ? dados.produtos.filter((item: ProdutoEstoque) => item && (item.nome || item.codigo)).map((item: ProdutoEstoque) => ({
        ...item,
        codigo: String(item.codigo || ''),
        nome: String(item.nome || 'Produto'),
        estoque: numeroSalvo(item.estoque),
        unidade: String(item.unidade || 'un'),
        saidas: item.saidas && typeof item.saidas === 'object' ? item.saidas : {}
      }))
      : [];
    return {
      meses: meses.length ? meses as MesId[] : vazio.meses,
      produtos: produtos.length ? produtos : produtosIniciais
    };
  } catch {
    return vazio;
  }
};

const gravar = (meses: MesId[], produtos: ProdutoEstoque[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify({ meses, produtos }));
  } catch { /* ignora cota */ }
};

const lerHistorico = (): RegistroHistorico[] => {
  if (typeof window === 'undefined') return [];
  try {
    const registros = JSON.parse(window.localStorage.getItem(CHAVE_HISTORICO) || '[]');
    if (!Array.isArray(registros)) return [];
    return registros.filter((item: RegistroHistorico) =>
      item && typeof item.id === 'string' && typeof item.nome === 'string'
      && Array.isArray(item.meses) && Array.isArray(item.produtos)
    );
  } catch {
    return [];
  }
};

const gravarHistorico = (registros: RegistroHistorico[]) => {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(registros));
    return true;
  } catch {
    return false;
  }
};

const previsaoProduto = (produto: ProdutoEstoque, meses: MesId[], ano: number) => {
  let somaSaidas = 0;
  let somaDias = 0;
  meses.forEach(id => {
    somaSaidas += numeroSalvo(produto.saidas?.[id]);
    somaDias += diasDoMes(id, ano);
  });
  const mediaMensal = meses.length ? somaSaidas / meses.length : 0;
  const mediaDias = meses.length ? somaDias / meses.length : 30;
  const consumoDiario = mediaDias ? mediaMensal / mediaDias : 0;
  const estoque = numeroSalvo(produto.estoque);
  const diasRestantes = consumoDiario > 0
    ? Math.round(estoque / consumoDiario)
    : estoque > 0
      ? 'Sem giro'
      : 0;
  return { mediaMensal, consumoDiario, diasRestantes };
};

const classePrevisao = (dias: number | string) => {
  if (typeof dias !== 'number') return 'bg-slate-400 text-white';
  if (dias < 15) return 'bg-red-600 text-white';
  if (dias <= 30) return 'bg-amber-500 text-white';
  return 'bg-green-600 text-white';
};

const tomPrevisao = (dias: number | string): LinhaPrevisao['tom'] => {
  if (typeof dias !== 'number') return 'neutro';
  if (dias < 15) return 'vermelho';
  if (dias <= 30) return 'ambar';
  return 'verde';
};

const numero = (valor: number, casas: number) => valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

export function ControlePrevisaoEstoque(p: { onVoltar?: () => void }) {
  const inicial = lerSalvo();
  const [busca, setBusca] = useState('');
  const [dataCalendario, setDataCalendario] = useState(() => new Date());
  const [mesesNaTabela, setMesesNaTabela] = useState<MesId[]>(inicial.meses);
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>(inicial.produtos);
  const [produtosSelecionados, setProdutosSelecionados] = useState<number[]>([]);
  const [historico, setHistorico] = useState<RegistroHistorico[]>(lerHistorico);
  const [nomeHistorico, setNomeHistorico] = useState('');
  const [registroEditandoId, setRegistroEditandoId] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState('');

  const persistir = (meses: MesId[], lista: ProdutoEstoque[]) => {
    setMesesNaTabela(meses);
    setProdutos(lista);
    gravar(meses, lista);
  };

  const selecionarProduto = (id: number) => {
    setProdutosSelecionados(atuais => atuais.includes(id) ? atuais : [...atuais, id]);
  };

  const alternarSelecaoProduto = (id: number) => {
    setProdutosSelecionados(atuais => atuais.includes(id) ? atuais.filter(itemId => itemId !== id) : [...atuais, id]);
  };

  const salvarHistorico = (comoNovo = false) => {
    const nome = nomeHistorico.trim();
    if (!nome) {
      setAviso('Informe um nome para salvar a previsão no histórico.');
      return;
    }
    const idsSelecionados = new Set(produtosSelecionados);
    const produtosParaSalvar = produtos.filter(item => idsSelecionados.has(item.id));
    if (produtosParaSalvar.length === 0) {
      setAviso('Selecione os produtos que deseja incluir neste histórico.');
      return;
    }
    const registroAtual = !comoNovo ? historico.find(item => item.id === registroEditandoId) : undefined;
    const registro: RegistroHistorico = {
      id: registroAtual?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      nome,
      salvoEm: new Date().toISOString(),
      dataCalendario: dataCalendario.getTime(),
      meses: [...mesesNaTabela],
      produtos: produtosParaSalvar.map(item => ({ ...item, saidas: { ...item.saidas } }))
    };
    const atualizados = registroAtual
      ? historico.map(item => item.id === registro.id ? registro : item)
      : [registro, ...historico];
    if (!gravarHistorico(atualizados)) {
      setAviso('Não foi possível salvar o histórico neste navegador.');
      return;
    }
    setHistorico(atualizados);
    if (registroAtual) {
      setRegistroEditandoId(registro.id);
      setAviso('Alterações salvas no histórico.');
    } else {
      setRegistroEditandoId(null);
      setNomeHistorico('');
      setProdutosSelecionados([]);
      setAviso(`Histórico "${nome}" salvo com ${produtosParaSalvar.length} produtos.`);
    }
  };

  const abrirHistorico = (registro: RegistroHistorico) => {
    const meses = [...registro.meses];
    const lista = registro.produtos.map(item => ({ ...item, saidas: { ...item.saidas } }));
    setMesesNaTabela(meses);
    setProdutos(lista);
    setProdutosSelecionados(lista.map(item => item.id));
    setDataCalendario(new Date(registro.dataCalendario));
    setNomeHistorico(registro.nome);
    setRegistroEditandoId(registro.id);
    setBusca('');
    gravar(meses, lista);
    setAviso(`Previsão "${registro.nome}" aberta para edição.`);
  };

  const excluirHistorico = (id: string) => {
    const registro = historico.find(item => item.id === id);
    if (!registro || !window.confirm(`Excluir "${registro.nome}" do histórico?`)) return;
    const atualizados = historico.filter(item => item.id !== id);
    if (!gravarHistorico(atualizados)) {
      setAviso('Não foi possível excluir o registro do histórico.');
      return;
    }
    setHistorico(atualizados);
    if (registroEditandoId === id) {
      setRegistroEditandoId(null);
      setNomeHistorico('');
      setProdutosSelecionados([]);
    }
    setAviso('Registro removido do histórico.');
  };

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return produtos;
    return produtos.filter(item => item.codigo.toLowerCase().includes(termo) || item.nome.toLowerCase().includes(termo));
  }, [busca, produtos]);

  const sugestoesCatalogo = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    if (termo.length < 2) return [];
    return LISTA_COMPLETA.filter(item =>
      item.descricao.toLocaleLowerCase('pt-BR').includes(termo)
      || item.codigo.toLocaleLowerCase('pt-BR').includes(termo)
      || item.codigoBarras.toLocaleLowerCase('pt-BR').includes(termo)
      || item.embalagem.toLocaleLowerCase('pt-BR').includes(termo)
    ).slice(0, 8);
  }, [busca]);

  const adicionarMes = () => {
    const mesSelecionado = mesIdDeData(dataCalendario);
    if (mesesNaTabela.includes(mesSelecionado)) {
      window.alert('Este mês já está na tabela!');
      return;
    }
    persistir([...mesesNaTabela, mesSelecionado], produtos);
  };

  const removerUltimoMes = () => {
    if (mesesNaTabela.length <= 1) {
      window.alert('A tabela precisa ter pelo menos 1 mês!');
      return;
    }
    persistir(mesesNaTabela.slice(0, -1), produtos);
  };

  const removerMes = (id: MesId) => {
    if (mesesNaTabela.length <= 1) {
      window.alert('A tabela precisa ter pelo menos 1 mês!');
      return;
    }
    persistir(mesesNaTabela.filter(mes => mes !== id), produtos);
  };

  const alterarEstoque = (id: number, valor: string) => {
    persistir(mesesNaTabela, produtos.map(item => item.id === id ? { ...item, estoque: valor } : item));
    selecionarProduto(id);
  };

  const alterarSaida = (id: number, mes: MesId, valor: string) => {
    persistir(mesesNaTabela, produtos.map(item => item.id === id ? { ...item, saidas: { ...item.saidas, [mes]: valor } } : item));
    selecionarProduto(id);
  };

  const adicionarProduto = () => {
    const codigo = window.prompt('Código do produto:', `PRD-00${produtos.length + 1}`);
    const nome = window.prompt('Nome do produto:', 'Novo Item');
    if (!codigo || !nome) return;
    const novoProduto = { id: Date.now(), codigo, nome, estoque: 10, unidade: 'un', saidas: {} };
    persistir(mesesNaTabela, [...produtos, novoProduto]);
    selecionarProduto(novoProduto.id);
  };

  const localizarNoCatalogo = (produto: typeof LISTA_COMPLETA[number]) => {
    const existente = produtos.find(item => item.codigo === produto.codigo);
    if (existente) {
      setBusca(existente.nome);
      selecionarProduto(existente.id);
      return;
    }
    const estoque = Number(String(produto.estoque || '0').replace(/\./g, '').replace(',', '.')) || 0;
    const novoProduto: ProdutoEstoque = {
      id: Date.now(),
      codigo: produto.codigo,
      nome: produto.descricao,
      estoque,
      unidade: produto.embalagem || 'un',
      saidas: {}
    };
    persistir(mesesNaTabela, [...produtos, novoProduto]);
    selecionarProduto(novoProduto.id);
    setBusca(novoProduto.nome);
  };

  const excluirProduto = (id: number) => {
    persistir(mesesNaTabela, produtos.filter(item => item.id !== id));
    setProdutosSelecionados(atuais => atuais.filter(itemId => itemId !== id));
  };

  const enviarWhatsapp = async () => {
    const ano = dataCalendario.getFullYear();
    const linhas: LinhaPrevisao[] = produtos.map(produto => {
      const conta = previsaoProduto(produto, mesesNaTabela, ano);
      return {
        codigo: produto.codigo,
        nome: produto.nome,
        estoque: `${produto.estoque} ${produto.unidade}`,
        saidas: mesesNaTabela.map(mes => String(produto.saidas?.[mes] ?? 0)),
        media: `${numero(conta.mediaMensal, 1)} /mês`,
        consumo: `${numero(conta.consumoDiario, 2)} /dia`,
        previsao: typeof conta.diasRestantes === 'number' ? `${conta.diasRestantes} dias` : String(conta.diasRestantes),
        tom: tomPrevisao(conta.diasRestantes)
      };
    });
    setEnviando(true);
    setAviso('');
    try {
      const resultado = await enviarImagemWhatsappPrevisao(mesesNaTabela, linhas);
      if (resultado === 'baixado') {
        setAviso('A imagem foi baixada neste computador. No WhatsApp, anexe o arquivo previsao-estoque.png na conversa.');
      }
      if (resultado === 'bloqueado') {
        setAviso('O navegador bloqueou o WhatsApp. A imagem foi baixada: anexe o arquivo previsao-estoque.png na conversa.');
      }
    } catch (erro) {
      setAviso(erro instanceof Error ? erro.message : 'Não consegui montar a imagem do relatório.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-[1250px] flex-col gap-5">
      <CabecalhoAba
        voltar={p.onVoltar ? { texto: 'Estoque', aoClicar: p.onVoltar } : undefined}
        etiqueta="Estoque"
        titulo="Controle e Previsão de Estoque"
        descricao="Abra o calendário, escolha o dia do mês e adicione a coluna na tabela."
      />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          value={busca}
          onChange={event => setBusca(event.target.value)}
          placeholder="Localizar produto da lista completa..."
          className={`${campo} max-w-xs`}
        />
        <nav className="flex flex-wrap items-center gap-2" aria-label="Ações da previsão">
          <CalendarioMes data={dataCalendario} onChange={setDataCalendario} />
          <button type="button" onClick={adicionarMes} className={botaoInfo}>+ Adicionar mês</button>
          <button type="button" onClick={removerUltimoMes} className={botaoSecundario}>− Remover mês</button>
          <button type="button" onClick={adicionarProduto} className={botaoPrimario}>+ Novo produto</button>
          <button type="button" onClick={() => void enviarWhatsapp()} disabled={enviando} className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border-0 bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1ebe5d] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
            {enviando ? 'Gerando imagem...' : 'WhatsApp imagem'}
          </button>
        </nav>
      </div>
      {sugestoesCatalogo.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="m-0 border-b border-slate-100 px-4 py-2 text-xs font-bold uppercase text-slate-500">Produtos do cadastro completo</p>
          {sugestoesCatalogo.map(produto => {
            const jaAdicionado = produtos.some(item => item.codigo === produto.codigo);
            return (
              <button
                key={produto.id}
                type="button"
                onClick={() => localizarNoCatalogo(produto)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 border-0 border-b border-slate-100 bg-white px-4 py-2.5 text-left last:border-b-0 hover:bg-slate-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900">{produto.descricao}</span>
                  <span className="block text-xs text-slate-500">Cód. {produto.codigo} · {produto.codigoBarras} · {produto.embalagem}</span>
                </span>
                <span className="shrink-0 text-xs font-bold text-teal-700">{jaAdicionado ? 'Localizar na tabela' : 'Adicionar'}</span>
              </button>
            );
          })}
        </div>
      )}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="m-0 text-base font-bold text-slate-900">Histórico de previsão de estoque</h2>
            <p className="mb-0 mt-1 text-xs text-slate-500">Salve consultas para reabrir e editar depois.</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex min-w-[220px] flex-col gap-1 text-xs font-semibold text-slate-600">
              Nome da previsão
              <input
                value={nomeHistorico}
                onChange={event => setNomeHistorico(event.target.value)}
                placeholder="Ex.: Previsão de outubro"
                className={`${campo} min-w-[220px]`}
              />
            </label>
            <button type="button" onClick={() => salvarHistorico()} className={botaoPrimario}>
              {registroEditandoId ? 'Salvar alterações' : 'Salvar selecionados'}
            </button>
            {registroEditandoId && (
              <button type="button" onClick={() => salvarHistorico(true)} className={botaoSecundario}>Salvar como nova</button>
            )}
          </div>
        </div>
        {historico.length > 0 ? (
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {historico.map(registro => (
              <div key={registro.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="m-0 truncate text-sm font-semibold text-slate-900">{registro.nome}</p>
                  <p className="m-0 mt-1 text-xs text-slate-500">
                    {new Date(registro.salvoEm).toLocaleString('pt-BR')} · {registro.produtos.length} produtos · {registro.meses.length} meses
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => abrirHistorico(registro)} className={botaoSecundario}>Abrir para editar</button>
                  <button type="button" onClick={() => excluirHistorico(registro.id)} className={botaoMiniPerigo}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="m-0 border-t border-slate-100 pt-3 text-sm text-slate-500">Nenhuma previsão salva ainda.</p>
        )}
        <p className="mb-0 mt-3 text-xs font-semibold text-slate-500">{produtosSelecionados.length} produtos selecionados</p>
      </section>
      {aviso && <p className="m-0 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">{aviso}</p>}

      <div className={tabelaCaixa}>
        <table className={tabela}>
          <thead className={cabecalhoTabela}>
            <tr>
              <th className={`${th} text-center`}>Selecionar</th>
              <th className={`${th} text-center`}>Código</th>
              <th className={`${th} text-center`}>Produto</th>
              <th className={`${th} text-center`}>Estoque atual</th>
              {mesesNaTabela.map(id => (
                <th key={id} className={`${th} text-center`}>
                  {rotuloMes(id)}
                  <button type="button" title="Remover mês" onClick={() => removerMes(id)} className="ml-1.5 inline-flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-full border-0 bg-slate-200 text-[10px] text-slate-700 hover:bg-rose-500 hover:text-white">✕</button>
                </th>
              ))}
              <th className={`${th} text-center`}>Média mensal</th>
              <th className={`${th} text-center`}>Consumo/dia</th>
              <th className={`${th} text-center`}>Previsão (dias)</th>
              <th className={`${th} text-center`}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(produto => {
              const { mediaMensal, consumoDiario, diasRestantes } = previsaoProduto(produto, mesesNaTabela, dataCalendario.getFullYear());
              return (
                <tr key={produto.id} className={linhaTabela}>
                  <td className={`${td} text-center`}>
                    <input
                      type="checkbox"
                      checked={produtosSelecionados.includes(produto.id)}
                      onChange={() => alternarSelecaoProduto(produto.id)}
                      aria-label={`Selecionar ${produto.nome} para o histórico`}
                      className="h-4 w-4 accent-teal-700"
                    />
                  </td>
                  <td className={`${td} whitespace-nowrap text-center font-bold`}>{produto.codigo}</td>
                  <td className={`${td} whitespace-nowrap text-left`}>{produto.nome}</td>
                  <td className={`${td} whitespace-nowrap text-center`}>
                    <input type="number" step="any" value={produto.estoque} onChange={event => alterarEstoque(produto.id, event.target.value)} className={`${campoMini} w-[70px] text-center font-semibold`} /> {produto.unidade}
                  </td>
                  {mesesNaTabela.map(mes => (
                    <td key={mes} className={`${td} whitespace-nowrap text-center`}>
                      <input type="number" step="any" value={produto.saidas?.[mes] ?? 0} onChange={event => alterarSaida(produto.id, mes, event.target.value)} className={`${campoMini} w-[70px] text-center font-semibold`} />
                    </td>
                  ))}
                  <td className={`${td} whitespace-nowrap text-center`}>{numeroSalvo(mediaMensal).toFixed(1)} /mês</td>
                  <td className={`${td} whitespace-nowrap text-center`}>{numeroSalvo(consumoDiario).toFixed(2)} /dia</td>
                  <td className={`${td} whitespace-nowrap text-center`}>
                    <span className={`inline-block rounded-lg px-2.5 py-1 text-[13px] font-bold ${classePrevisao(diasRestantes)}`}>
                      {typeof diasRestantes === 'number' ? `${diasRestantes} dias` : diasRestantes}
                    </span>
                  </td>
                  <td className={`${td} whitespace-nowrap text-center`}>
                    <button type="button" onClick={() => excluirProduto(produto.id)} className={botaoMiniPerigo}>Excluir</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
