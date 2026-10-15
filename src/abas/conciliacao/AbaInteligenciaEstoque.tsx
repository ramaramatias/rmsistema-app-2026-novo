import { useEffect, useState } from 'react';
import { CabecalhoAba, botaoPrimario, botaoSecundario, cabecalhoTabela, campo, linhaTabela, painel, rotulo, tabela, tabelaCaixa, td, th, vazio } from '../../componentes/ui';
import { arquivoEhImagem, lerConteudoDoPdf, lerLinhasDoArquivo } from './lerPdf';
import { getDocument } from 'pdfjs-dist';
import { curvaOrdenada, itensZeradosOuCriticos, relatorioDaMatriz, relatorioDasLinhas, relatorioDosItens, type ItemInteligencia, type RelatorioInteligencia } from './parserInteligenciaEstoque';
import { avaliarPreco, itensPorPreco, montarLoteInteligencia, relatorioDoLote, rotuloClassePreco, rotuloMes, type ClassePreco, type LoteInteligencia } from './lotesInteligencia';
import { gravarMarkupNaMemoria, MARKUPS_SESSAO, textoMarkup } from './markupSessoes';

type Secao = 'saldo' | 'estoque' | 'previsao' | 'alerta' | 'curva' | 'preco';

const SECOES: { id: Secao; nome: string }[] = [
  { id: 'saldo', nome: 'Saldo' },
  { id: 'estoque', nome: 'Estoque' },
  { id: 'previsao', nome: 'Previsão de estoque' },
  { id: 'alerta', nome: 'Alerta de estoque zero' },
  { id: 'curva', nome: 'Curva ABC' },
  { id: 'preco', nome: 'Atualização de preço' }
];

const tomLinha: Record<ClassePreco, string> = {
  perda: '!bg-rose-100 text-rose-900',
  alterar: '!bg-amber-50 text-amber-950',
  adequada: '!bg-emerald-50/70 text-emerald-950',
  'sem-preco': 'text-slate-500',
  'sem-sessao': 'text-slate-600'
};

const moeda = (valor: number | null) => valor == null ? '—' : valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const qtd = (valor: number | null) => valor == null ? '—' : valor.toLocaleString('pt-BR', { maximumFractionDigits: 3 });
const produto = (item: ItemInteligencia) => item.nome || '—';
const codigo = (item: ItemInteligencia) => item.codigo || '—';
const diasTexto = (item: ItemInteligencia) => item.saida === 0 ? 'Sem giro' : item.dias == null ? '—' : `${item.dias} dias`;
const margemTexto = (valor: number | null) => valor == null ? '—' : `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

const nomesDados = (relatorio: RelatorioInteligencia) => {
  const pares: [boolean, string][] = [
    [relatorio.identificados.custo, 'Custo'],
    [relatorio.identificados.venda, 'Venda'],
    [relatorio.identificados.saldo, 'Saldo'],
    [relatorio.identificados.saida, 'Saída'],
    [relatorio.identificados.curva, 'Curva ABC']
  ];
  return {
    presentes: pares.filter(par => par[0]).map(par => par[1]),
    ausentes: pares.filter(par => !par[0]).map(par => par[1])
  };
};

async function paginasDoPdf(arquivo: File) {
  if (arquivoEhImagem(arquivo)) return 1;
  if (!/\.pdf$/i.test(arquivo.name) && arquivo.type !== 'application/pdf') return 1;
  const documento = await getDocument({ data: new Uint8Array(await arquivo.arrayBuffer()), useSystemFonts: true }).promise;
  const total = documento.numPages;
  await documento.destroy();
  return total;
}

async function lerArquivo(arquivo: File): Promise<RelatorioInteligencia> {
  const planilha = /\.(csv|xlsx|xls)$/i.test(arquivo.name);
  if (planilha) {
    const XLSX = await import('xlsx');
    const livro = XLSX.read(await arquivo.arrayBuffer(), { type: 'array' });
    const folhas = livro.SheetNames.slice(0, 10);
    const matriz = folhas.flatMap(nome => XLSX.utils.sheet_to_json(livro.Sheets[nome], { header: 1, raw: false, defval: '' }) as string[][]);
    return relatorioDaMatriz(matriz, folhas.length || 1);
  }
  if (/\.pdf$/i.test(arquivo.name) || arquivo.type === 'application/pdf') {
    const conteudo = await lerConteudoDoPdf(await arquivo.arrayBuffer());
    return relatorioDosItens(conteudo.itens, conteudo.linhas, conteudo.paginas);
  }
  const total = await paginasDoPdf(arquivo);
  const lido = await lerLinhasDoArquivo(arquivo);
  return relatorioDasLinhas(lido.linhas, total);
}

export function AbaInteligenciaEstoque(p: { onVoltar: () => void; lotes: LoteInteligencia[]; aoSalvarLote: (lote: LoteInteligencia) => void }) {
  const [arquivoNome, setArquivoNome] = useState('');
  const [relatorio, setRelatorio] = useState<RelatorioInteligencia | null>(null);
  const [exibir, setExibir] = useState(false);
  const [secao, setSecao] = useState<Secao>('saldo');
  const [lendo, setLendo] = useState(false);
  const [erro, setErro] = useState('');
  const [loteSalvo, setLoteSalvo] = useState('');

  useEffect(() => {
    gravarMarkupNaMemoria();
  }, []);

  const abrirLote = (lote: LoteInteligencia) => {
    setErro('');
    setArquivoNome(lote.arquivo);
    setRelatorio(relatorioDoLote(lote));
    setLoteSalvo(rotuloMes(lote.mes));
    setExibir(true);
    setSecao('preco');
  };

  const ler = async (arquivo: File | null) => {
    if (!arquivo) return;
    setLendo(true);
    setErro('');
    setLoteSalvo('');
    setExibir(false);
    setRelatorio(null);
    setArquivoNome(arquivo.name);
    try {
      const lido = await lerArquivo(arquivo);
      gravarMarkupNaMemoria();
      const lote = montarLoteInteligencia(lido, arquivo.name);
      p.aoSalvarLote(lote);
      setLoteSalvo(rotuloMes(lote.mes));
      setRelatorio(lido);
      setSecao('preco');
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não consegui ler o arquivo.');
    } finally {
      setLendo(false);
    }
  };

  const dados = relatorio ? nomesDados(relatorio) : null;
  const alerta = relatorio ? itensZeradosOuCriticos(relatorio.itens) : [];
  const curva = relatorio ? curvaOrdenada(relatorio.itens) : [];
  const precos = relatorio ? itensPorPreco(relatorio.itens) : [];
  const contagemPreco = precos.reduce((soma, item) => {
    soma[avaliarPreco(item).classe] += 1;
    return soma;
  }, { perda: 0, alterar: 0, adequada: 0, 'sem-preco': 0, 'sem-sessao': 0 } as Record<ClassePreco, number>);
  const totalCusto = relatorio?.itens.reduce((soma, item) => soma + (item.totalCusto || 0), 0) || 0;
  const totalVenda = relatorio?.itens.reduce((soma, item) => soma + (item.totalVenda || 0), 0) || 0;

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-5">
      <CabecalhoAba
        voltar={{ texto: 'Conciliação', aoClicar: p.onVoltar }}
        etiqueta="Conciliação"
        titulo="Gestão e inteligência de estoque"
        descricao="Envie o relatório com até 10 páginas. A leitura confirma as páginas e os dados antes de abrir saldo, estoque, previsão, alerta e curva ABC."
      />

      <div className={painel}>
        <label className={rotulo}>
          Arquivo do relatório (PDF, imagem ou planilha)
          <input
            type="file"
            accept="application/pdf,.pdf,image/*,.png,.jpg,.jpeg,.webp,.csv,.xlsx,.xls"
            className={campo}
            onChange={evento => void ler(evento.target.files?.[0] || null)}
          />
        </label>
        {lendo && <p className="mb-0 mt-3 text-sm font-semibold text-slate-500">Lendo o arquivo até o fim...</p>}
        <p className="mb-0 mt-4 text-sm text-slate-600">O markup de cada sessão fica gravado neste computador. Todo arquivo enviado é classificado por esses percentuais.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {MARKUPS_SESSAO.map(sessao => (
            <p key={sessao.id} className="m-0 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              {sessao.nome}: {textoMarkup(sessao)}
            </p>
          ))}
        </div>
      </div>

      {p.lotes.length > 0 && (
        <div className={painel}>
          <h3 className="m-0 text-sm font-black text-slate-900">Lotes salvos por mês</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {p.lotes.map(lote => (
              <button key={lote.id} type="button" className={botaoSecundario} onClick={() => abrirLote(lote)}>
                {rotuloMes(lote.mes)} · {lote.itens.length} itens
              </button>
            ))}
          </div>
        </div>
      )}

      {erro && <p className="m-0 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">{erro}</p>}

      {relatorio && dados && !exibir && (
        <div className={painel}>
          <h3 className="m-0 text-sm font-black text-slate-900">Confirmação da leitura</h3>
          <p className="mb-1 mt-3 text-sm text-slate-700">Arquivo: <strong>{arquivoNome}</strong></p>
          <p className="m-0 text-sm text-slate-700">Páginas lidas: <strong>{relatorio.paginasLidas}</strong>{relatorio.paginasArquivo > relatorio.paginasLidas ? ` de ${relatorio.paginasArquivo}. O limite desta aba é 10 páginas.` : ` de ${relatorio.paginasArquivo}.`}</p>
          <p className="mb-1 mt-3 text-sm text-slate-700">Dados identificados: <strong>{dados.presentes.length ? dados.presentes.join(', ') : 'nenhum dos campos previstos'}</strong></p>
          <p className="m-0 text-sm text-slate-700">Dados que não apareceram: <strong>{dados.ausentes.length ? dados.ausentes.join(', ') : 'nenhum'}</strong></p>
          <p className="mb-0 mt-3 text-sm text-slate-500">{relatorio.itens.length} item(ns) separado(s). As páginas fora de ordem entram no mesmo relatório.</p>
          {loteSalvo && <p className="mb-0 mt-3 text-sm font-semibold text-emerald-800">Lote de {loteSalvo} salvo.</p>}
          <button type="button" className={`${botaoPrimario} mt-4`} onClick={() => setExibir(true)}>Exibir relatório</button>
        </div>
      )}

      {relatorio && exibir && (
        <>
          <div className="flex flex-wrap gap-2">
            {SECOES.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSecao(item.id)}
                className={secao === item.id ? botaoPrimario : botaoSecundario}
              >
                {item.nome}
              </button>
            ))}
          </div>

          {secao === 'saldo' && (
            <Tabela
              vazio="O arquivo não trouxe saldo dos itens."
              cabecalhos={['Código', 'Produto', 'Saldo']}
              linhas={relatorio.itens.map(item => [codigo(item), produto(item), `${qtd(item.saldo)} ${item.unidade}`.trim()])}
            />
          )}

          {secao === 'estoque' && (
            <div className="flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className={painel}><p className="m-0 text-xs font-bold uppercase text-slate-500">Total de custo</p><p className="m-0 mt-1 text-2xl font-black text-slate-900">{moeda(relatorio.identificados.custo ? totalCusto : null)}</p></div>
                <div className={painel}><p className="m-0 text-xs font-bold uppercase text-slate-500">Total de venda</p><p className="m-0 mt-1 text-2xl font-black text-slate-900">{moeda(relatorio.identificados.venda ? totalVenda : null)}</p></div>
              </div>
              <Tabela
                vazio="O arquivo não trouxe custo nem valor de venda."
                cabecalhos={['Código', 'Produto', 'Custo', 'Venda', 'Total custo', 'Total venda']}
                linhas={relatorio.itens.map(item => [codigo(item), produto(item), moeda(item.custo), moeda(item.venda), moeda(item.totalCusto), moeda(item.totalVenda)])}
              />
            </div>
          )}

          {secao === 'previsao' && (
            <div className="flex flex-col gap-3">
              {relatorio.detalhePeriodo && <p className="m-0 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">{relatorio.detalhePeriodo}</p>}
              {relatorio.avisoPrevisao && <p className="m-0 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">{relatorio.avisoPrevisao}</p>}
              <Tabela
                vazio="Sem itens para previsão."
                cabecalhos={['Código', 'Produto', 'Saldo', 'Saída', 'Dias restantes']}
                linhas={relatorio.itens.map(item => [codigo(item), produto(item), qtd(item.saldo), qtd(item.saida), diasTexto(item)])}
              />
            </div>
          )}

          {secao === 'alerta' && (
            <Tabela
              vazio="Nenhum item zerado ou crítico nesta leitura."
              cabecalhos={['Código', 'Produto', 'Saldo', 'Mínimo', 'Dias']}
              linhas={alerta.map(item => [codigo(item), produto(item), qtd(item.saldo), qtd(item.minimo), diasTexto(item)])}
            />
          )}

          {secao === 'preco' && (
            <div className="flex flex-col gap-3">
              <p className="m-0 text-sm text-slate-600">O produto entra em alterar quando o markup praticado fica abaixo do percentual da sessão. Venda menor que o custo fica em vermelho, como perda de vendas.</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-rose-50 px-4 py-3 ring-1 ring-rose-100"><p className="m-0 text-xs font-bold uppercase text-rose-700">Perda de vendas</p><p className="m-0 mt-1 text-2xl font-black text-rose-900">{contagemPreco.perda}</p></div>
                <div className="rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-100"><p className="m-0 text-xs font-bold uppercase text-amber-700">Produtos a alterar</p><p className="m-0 mt-1 text-2xl font-black text-amber-950">{contagemPreco.alterar}</p></div>
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100"><p className="m-0 text-xs font-bold uppercase text-emerald-700">Adequada</p><p className="m-0 mt-1 text-2xl font-black text-emerald-950">{contagemPreco.adequada}</p></div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"><p className="m-0 text-xs font-bold uppercase text-slate-600">Sem sessão</p><p className="m-0 mt-1 text-2xl font-black text-slate-800">{contagemPreco['sem-sessao']}</p></div>
              </div>
              {!relatorio.identificados.venda && <p className="m-0 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Este arquivo não trouxe o preço de venda. Sem ele, a margem não é calculada.</p>}
              {contagemPreco['sem-preco'] > 0 && relatorio.identificados.venda && <p className="m-0 text-sm text-slate-500">{contagemPreco['sem-preco']} {contagemPreco['sem-preco'] === 1 ? 'item sem preço de venda fica' : 'itens sem preço de venda ficam'} fora da classificação.</p>}
              <Tabela
                vazio="Nenhum item para classificar o preço."
                cabecalhos={['Código', 'Produto', 'Sessão', 'Markup da sessão', 'Markup praticado', 'Classificação']}
                tons={precos.map(item => tomLinha[avaliarPreco(item).classe])}
                linhas={precos.map(item => {
                  const preco = avaliarPreco(item);
                  const alvo = preco.alvo == null ? '—' : preco.sessao === 'Processados' ? '4 vezes o custo' : `${preco.alvo.toLocaleString('pt-BR')}%`;
                  return [codigo(item), produto(item), preco.sessao, alvo, margemTexto(preco.markup), rotuloClassePreco[preco.classe]];
                })}
              />
            </div>
          )}

          {secao === 'curva' && (
            <div className="flex flex-col gap-3">
              {!relatorio.identificados.saida && <p className="m-0 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">A curva ABC precisa da saída. Esse dado não veio no arquivo.</p>}
              <Tabela
                vazio="Não há saída para ordenar a curva."
                cabecalhos={['Classe', 'Código', 'Produto', 'Saída']}
                linhas={curva.map(item => [item.classeAbc || '—', codigo(item), produto(item), qtd(item.saida)])}
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}

function Tabela(p: { cabecalhos: string[]; linhas: string[][]; vazio: string; tons?: string[] }) {
  return (
    <div className={`${tabelaCaixa} max-h-[560px] overflow-auto`}>
      <table className={tabela}>
        <thead className={`${cabecalhoTabela} sticky top-0`}>
          <tr>{p.cabecalhos.map(titulo => <th key={titulo} className={th}>{titulo}</th>)}</tr>
        </thead>
        <tbody>
          {p.linhas.length === 0 ? (
            <tr><td className={vazio} colSpan={p.cabecalhos.length}>{p.vazio}</td></tr>
          ) : p.linhas.map((linha, indice) => (
            <tr key={`${linha[0]}-${indice}`} className={`${linhaTabela} ${p.tons?.[indice] || ''}`}>
              {linha.map((celula, coluna) => <td key={`${indice}-${coluna}`} className={td}>{celula}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
