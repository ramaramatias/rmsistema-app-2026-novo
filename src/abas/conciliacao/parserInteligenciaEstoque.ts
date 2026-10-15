import { parseNumeroBr } from './parserConciliacao';
import type { LinhaPdf } from './parserConciliacao';

export type ItemPosicaoPdf = { pagina: number; texto: string; x: number; y: number };

export type CampoEstoque = 'codigo' | 'nome' | 'saldo' | 'minimo' | 'custo' | 'venda' | 'totalCusto' | 'totalVenda' | 'saida' | 'periodo' | 'abc' | 'unidade' | 'inicial' | 'extra' | 'margem' | 'markup';

export type ItemInteligencia = {
  codigo: string;
  nome: string;
  unidade: string;
  saldo: number | null;
  minimo: number | null;
  custo: number | null;
  venda: number | null;
  totalCusto: number | null;
  totalVenda: number | null;
  saida: number | null;
  saidaDiaria: number | null;
  dias: number | null;
  classeAbc: string;
  margemPct: number | null;
  markupPct: number | null;
};

export type DadosIdentificados = {
  custo: boolean;
  venda: boolean;
  saldo: boolean;
  saida: boolean;
  curva: boolean;
};

export type RelatorioInteligencia = {
  paginasArquivo: number;
  paginasLidas: number;
  identificados: DadosIdentificados;
  avisoPrevisao: string;
  detalhePeriodo: string;
  mesReferencia: string;
  itens: ItemInteligencia[];
};

const simplificar = (texto: string) => texto
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const classificarRotulo = (rotulo: string): CampoEstoque | null => {
  const t = simplificar(rotulo);
  if (!t || t.length > 80) return null;
  if (/total\s*custo|custo\s*total/.test(t)) return 'totalCusto';
  if (/total\s*(venda|preco)|(?:venda|preco)\s*total/.test(t)) return 'totalVenda';
  if (/est\s*inicial|estoque\s*inicial/.test(t)) return 'inicial';
  if (/estoque\s*min|\bminimo\b/.test(t)) return 'minimo';
  if (/estoque\s*max|\bmaximo\b/.test(t)) return 'extra';
  if (/markup/.test(t)) return 'markup';
  if (/margem/.test(t)) return 'margem';
  if (/faturamento/.test(t)) return 'totalVenda';
  if (/\bprc\b|preco\s*medio/.test(t)) return 'venda';
  if (/quantidade/.test(t)) return 'saida';
  if (/imposto|estadual|federal|partic|acumul|\blucro\b|^ncm$|^num$/.test(t)) return 'extra';
  if (/media\s*diaria|consumo\s*dia|saida\s*dia|giro\s*dia/.test(t)) return 'saida';
  if (/^entrada$|^producao$|^rendimento$|^requisicao$|^ajuste$/.test(t)) return 'extra';
  if (/saida|giro|vendid|consumo/.test(t)) return 'saida';
  if (/curva|\babc\b|classe/.test(t)) return 'abc';
  if (/custo/.test(t)) return 'custo';
  if (/preco|venda/.test(t)) return 'venda';
  if (/saldo/.test(t)) return 'saldo';
  if (/periodo|\bdias\b/.test(t) && !/previsao/.test(t)) return 'periodo';
  if (/estoque/.test(t)) return 'saldo';
  if (/codigo|\bcod\b|\bean\b|barras/.test(t)) return 'codigo';
  if (/^produto$|descricao|mercadoria/.test(t)) return 'nome';
  if (/^emb$|embalagem|\bunidade\b|\bunid\b|^un$/.test(t)) return 'unidade';
  return null;
};

const sinaisNoTexto = (texto: string): DadosIdentificados => {
  const t = simplificar(texto);
  return {
    custo: /custo/.test(t),
    venda: /\bpreco\b|venda/.test(t),
    saldo: /saldo|estoque/.test(t),
    saida: /saida|giro|consumo|vendid/.test(t),
    curva: /curva|\babc\b/.test(t)
  };
};

const periodoNoTexto = (texto: string) => {
  const faixa = texto.match(/(\d{2})\/(\d{2})\/(\d{4})\s*[àa]\s*(\d{2})\/(\d{2})\/(\d{4})/i);
  if (faixa) {
    const inicio = new Date(Number(faixa[3]), Number(faixa[2]) - 1, Number(faixa[1]));
    const fim = new Date(Number(faixa[6]), Number(faixa[5]) - 1, Number(faixa[4]));
    const dias = Math.round((fim.getTime() - inicio.getTime()) / 86400000) + 1;
    if (dias > 0 && dias < 400) return { dias, rotulo: `${faixa[1]}/${faixa[2]}/${faixa[3]} a ${faixa[4]}/${faixa[5]}/${faixa[6]}`, mes: `${faixa[6]}-${faixa[5]}` };
  }
  const t = simplificar(texto);
  const informado = t.match(/(?:ultimos|periodo de|periodo)\s*(\d{1,3})\s*dias/);
  if (informado) return { dias: Number(informado[1]), rotulo: `${informado[1]} dias` };
  if (/media diaria|por dia|ao dia/.test(t)) return { dias: 1, rotulo: 'média diária' };
  if (/mensal|no mes|por mes/.test(t)) return { dias: 30, rotulo: 'mês' };
  return null;
};

type Coluna = { campo: CampoEstoque; x: number; titulo: string };

const campoDoCabecalhoComposto = (textos: string[]): CampoEstoque | null => {
  const frase = textos.map(simplificar).filter(texto => texto && texto !== 'r').join(' ');
  if (/^estoque total$/.test(frase)) return 'saldo';
  if (/^estoque minimo$/.test(frase)) return 'minimo';
  if (/^estoque maximo$/.test(frase)) return 'extra';
  if (/^(?:total custo|custo total)$/.test(frase)) return 'totalCusto';
  if (/^(?:total venda|venda total)$/.test(frase)) return 'totalVenda';
  if (/^custo reposicao$/.test(frase)) return 'custo';
  if (/^preco varejo$/.test(frase)) return 'venda';
  return null;
};

const colunasDoCabecalho = (tokens: { texto: string; x: number }[]) => {
  const ordem = tokens
    .filter(token => simplificar(token.texto) !== 'r')
    .sort((a, b) => a.x - b.x);
  const grupos: { texto: string; x: number }[] = [];
  ordem.forEach(token => {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && token.x - ultimo.x < 28) {
      ultimo.texto = `${ultimo.texto} ${token.texto}`;
      return;
    }
    grupos.push({ texto: token.texto, x: token.x });
  });
  const colunas: Coluna[] = [];
  for (let indice = 0; indice < grupos.length;) {
    let composto: { fim: number; campo: CampoEstoque; titulo: string } | null = null;
    for (let fim = indice + 1; fim < grupos.length && fim <= indice + 3; fim++) {
      if (grupos[fim].x - grupos[indice].x > 120) break;
      const campo = campoDoCabecalhoComposto(grupos.slice(indice, fim + 1).map(grupo => grupo.texto));
      if (campo) composto = { fim, campo, titulo: grupos.slice(indice, fim + 1).map(grupo => grupo.texto).join(' ') };
    }
    if (composto) {
      colunas.push({ campo: composto.campo, x: grupos[indice].x, titulo: composto.titulo });
      indice = composto.fim + 1;
      continue;
    }
    const campo = classificarRotulo(grupos[indice].texto);
    if (campo) colunas.push({ campo, x: grupos[indice].x, titulo: grupos[indice].texto });
    indice += 1;
  }
  const uteis = new Set(colunas.map(coluna => coluna.campo));
  if (!(uteis.has('nome') || uteis.has('codigo')) || colunas.length < 2) return [];
  return colunas;
};

const numeroFlex = (texto: string, pontoDecimal: boolean) => {
  const t = texto.trim().replace(/R\$\s*/gi, '').replace(/\s/g, '');
  if (!t || !/\d/.test(t)) return null;
  if (pontoDecimal && /^-?\d+\.\d{3}$/.test(t)) {
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }
  return parseNumeroBr(t);
};

const numeroCelula = (texto: string, pontoDecimal = false) => {
  const direto = numeroFlex(texto.replace(/%/g, ' '), pontoDecimal);
  if (direto != null) return direto;
  const pedaco = texto.match(/-?\d{1,3}(?:\.\d{3})*,\d{1,4}|-?\d+,\d{1,4}|-?\d+\.\d+|-?\d+/);
  return pedaco ? numeroFlex(pedaco[0], pontoDecimal) : null;
};

const pontoDecimalNosTextos = (textos: string[]) => textos.some(texto => /^-?\d+,\d{1,4}$/.test(texto.trim())) && textos.some(texto => /^-?\d+\.\d{3}$/.test(texto.trim()));

const diasDe = (saldo: number | null, saidaDiaria: number | null) => {
  if (saldo != null && saldo <= 0) return 0;
  if (saldo != null && saidaDiaria && saidaDiaria > 0) return Math.round(saldo / saidaDiaria);
  return null;
};

const separarCodigoNome = (codigo: string, nome: string) => {
  if (codigo) return { codigo, nome: nome || codigo };
  const junto = nome.match(/^(\d{4,})\s*-\s*(.+)$/);
  if (!junto) return { codigo, nome };
  return { codigo: junto[1], nome: junto[2].trim() };
};

const linhaEmItem = (tokens: { texto: string; x: number }[], colunas: Coluna[], periodoDocumento: number | null, pontoDecimal: boolean) => {
  const ordem = [...tokens].sort((a, b) => a.x - b.x);
  const valores = new Map<CampoEstoque, string>();
  ordem.forEach(token => {
    const coluna = [...colunas].sort((a, b) => Math.abs(a.x - token.x) - Math.abs(b.x - token.x))[0];
    if (!coluna || Math.abs(coluna.x - token.x) > 90) return;
    const anterior = valores.get(coluna.campo);
    valores.set(coluna.campo, anterior ? `${anterior} ${token.texto}` : token.texto);
  });
  const brutoNome = (valores.get('nome') || '').replace(/\s+/g, ' ').trim();
  const brutoCodigo = (valores.get('codigo') || '').replace(/\s+/g, ' ').trim();
  const separado = separarCodigoNome(brutoCodigo, brutoNome);
  const nome = separado.nome;
  const codigo = separado.codigo;
  if (nome.length < 2 && codigo.length < 2) return null;
  if (classificarRotulo(codigo) && (!nome || classificarRotulo(nome))) return null;
  if (!codigo && classificarRotulo(nome) && simplificar(nome).split(' ').length <= 4) return null;
  if (!codigo && !/[a-z]/i.test(nome)) return null;
  const saida = numeroCelula(valores.get('saida') || '', pontoDecimal);
  const periodoLinha = numeroCelula(valores.get('periodo') || '', pontoDecimal);
  const diariaPeloTitulo = colunas.some(coluna => coluna.campo === 'saida' && /diaria|por dia|ao dia/.test(simplificar(coluna.titulo)));
  const periodo = diariaPeloTitulo ? 1 : periodoLinha || periodoDocumento;
  const saidaDiaria = saida != null && periodo && periodo > 0 ? saida / periodo : null;
  const saldo = numeroCelula(valores.get('saldo') || '', pontoDecimal);
  return {
    codigo,
    nome: nome || codigo,
    unidade: (valores.get('unidade') || '').trim(),
    saldo,
    minimo: numeroCelula(valores.get('minimo') || '', pontoDecimal),
    custo: numeroCelula(valores.get('custo') || '', pontoDecimal),
    venda: numeroCelula(valores.get('venda') || '', pontoDecimal),
    totalCusto: numeroCelula(valores.get('totalCusto') || '', pontoDecimal),
    totalVenda: numeroCelula(valores.get('totalVenda') || '', pontoDecimal),
    saida,
    saidaDiaria,
    dias: diasDe(saldo, saidaDiaria),
    classeAbc: simplificar(valores.get('abc') || '').slice(0, 1).toUpperCase(),
    margemPct: numeroCelula(valores.get('margem') || '', pontoDecimal),
    markupPct: numeroCelula(valores.get('markup') || '', pontoDecimal)
  } satisfies ItemInteligencia;
};

const mesclarItens = (itens: ItemInteligencia[]) => {
  const mapa = new Map<string, ItemInteligencia>();
  itens.forEach(item => {
    const chave = simplificar(item.codigo || item.nome);
    if (!chave) return;
    const atual = mapa.get(chave);
    if (!atual) {
      mapa.set(chave, item);
      return;
    }
    const campos: (keyof ItemInteligencia)[] = ['saldo', 'minimo', 'custo', 'venda', 'totalCusto', 'totalVenda', 'saida', 'saidaDiaria', 'dias', 'margemPct', 'markupPct'];
    campos.forEach(campo => {
      if (atual[campo] == null && item[campo] != null) (atual[campo] as number | null) = item[campo] as number | null;
    });
    if (!atual.classeAbc && item.classeAbc) atual.classeAbc = item.classeAbc;
    if (!atual.unidade && item.unidade) atual.unidade = item.unidade;
    if (atual.nome.length < item.nome.length) atual.nome = item.nome;
  });
  return [...mapa.values()];
};

const aplicarCurva = (itens: ItemInteligencia[], temSaida: boolean) => {
  if (!temSaida) return itens;
  const ordenados = [...itens].sort((a, b) => (b.saida || 0) - (a.saida || 0));
  const total = ordenados.reduce((soma, item) => soma + Math.max(0, item.saida || 0), 0);
  let acumulado = 0;
  const classes = new Map<ItemInteligencia, string>();
  ordenados.forEach(item => {
    if (item.classeAbc === 'A' || item.classeAbc === 'B' || item.classeAbc === 'C') return;
    if (!total || item.saida == null) return;
    acumulado += Math.max(0, item.saida);
    const fatia = acumulado / total;
    classes.set(item, fatia <= 0.8 ? 'A' : fatia <= 0.95 ? 'B' : 'C');
  });
  return itens.map(item => classes.has(item) ? { ...item, classeAbc: classes.get(item) || '' } : item);
};

const fecharRelatorio = (itens: ItemInteligencia[], texto: string, paginasArquivo: number, maiorPagina: number): RelatorioInteligencia => {
  const paginasLidas = Math.min(10, Math.max(paginasArquivo, maiorPagina));
  const identificados = sinaisNoTexto(texto);
  const periodo = periodoNoTexto(texto);
  const lista = mesclarItens(itens);
  const temSaida = lista.some(item => item.saida != null) || identificados.saida;
  const comCurva = aplicarCurva(lista, lista.some(item => item.saida != null));
  const avisoPrevisao = !lista.some(item => item.saida != null)
    ? 'Faltam dados de giro para calcular os dias com precisão.'
    : lista.some(item => item.saida != null && item.saida > 0 && item.saldo != null && item.saldo > 0 && item.dias == null)
      ? 'Encontrei saída, mas não o período desse giro. Os dias de estoque ficam sem cálculo preciso.'
      : lista.some(item => item.saida != null) && !lista.some(item => item.saldo != null)
        ? 'Encontrei a saída, mas o arquivo não trouxe o saldo. Os dias de estoque não podem ser calculados.'
        : '';
  return {
    paginasArquivo,
    paginasLidas,
    identificados: {
      custo: identificados.custo || lista.some(item => item.custo != null || item.totalCusto != null),
      venda: identificados.venda || lista.some(item => item.venda != null || item.totalVenda != null),
      saldo: identificados.saldo || lista.some(item => item.saldo != null),
      saida: temSaida,
      curva: identificados.curva || comCurva.some(item => item.classeAbc === 'A' || item.classeAbc === 'B' || item.classeAbc === 'C')
    },
    avisoPrevisao,
    detalhePeriodo: periodo ? `Período usado no cálculo: ${periodo.dias} dias (${periodo.rotulo}).` : '',
    mesReferencia: periodo && 'mes' in periodo ? periodo.mes : '',
    itens: comCurva
  };
};

export function relatorioDasLinhas(linhas: LinhaPdf[], paginasArquivo: number): RelatorioInteligencia {
  const usadas = linhas.filter(linha => linha.pagina <= 10);
  const texto = usadas.map(linha => linha.texto).join('\n');
  const periodoDocumento = periodoNoTexto(texto)?.dias ?? null;
  const pontoDecimal = pontoDecimalNosTextos(usadas.flatMap(linha => linha.tokens.map(token => token.texto)));
  let cabecalho: Coluna[] = [];
  const itens: ItemInteligencia[] = [];
  usadas.forEach(linha => {
    const candidata = colunasDoCabecalho(linha.tokens);
    if (candidata.length > cabecalho.length) cabecalho = candidata;
  });
  if (cabecalho.length) {
    usadas.forEach(linha => {
      const item = linhaEmItem(linha.tokens, cabecalho, periodoDocumento, pontoDecimal);
      if (item) itens.push(item);
    });
  }
  return fecharRelatorio(itens, texto, paginasArquivo, usadas.reduce((max, linha) => Math.max(max, linha.pagina), 0));
}

const fundirCabecalhos = (tokens: { texto: string; y: number }[]) => {
  const ordenados = [...tokens].sort((a, b) => a.y - b.y);
  const grupos: { texto: string; y: number }[] = [];
  ordenados.forEach(token => {
    const ultimo = grupos[grupos.length - 1];
    const pedaco = simplificar(token.texto);
    const junto = Boolean(ultimo && token.y - ultimo.y <= 14);
    const saldoPeriodo = Boolean(ultimo && token.y - ultimo.y < 40 && /^periodo$|^do$|^da$|^de$/.test(pedaco) && /saldo/.test(simplificar(ultimo.texto)));
    if (ultimo && (junto || saldoPeriodo)) {
      ultimo.texto = `${ultimo.texto} ${token.texto}`;
      ultimo.y = Math.max(ultimo.y, token.y);
      return;
    }
    grupos.push({ texto: token.texto, y: token.y });
  });
  return grupos;
};

const montarItemGirado = (
  valores: Map<CampoEstoque, string>,
  pontoDecimal: boolean,
  periodo: number | null
): ItemInteligencia | null => {
  const separado = separarCodigoNome((valores.get('codigo') || '').trim(), (valores.get('nome') || '').replace(/\s+/g, ' ').trim());
  const codigo = separado.codigo.replace(/\s+/g, '');
  const nome = separado.nome.replace(/\s+/g, ' ').trim();
  if (!/^\d{4,}$/.test(codigo) || nome.length < 2) return null;
  if (classificarRotulo(nome) && simplificar(nome).split(' ').length <= 3) return null;
  const saida = numeroCelula(valores.get('saida') || '', pontoDecimal);
  const saldo = numeroCelula(valores.get('saldo') || '', pontoDecimal);
  const totalCusto = numeroCelula(valores.get('totalCusto') || '', pontoDecimal);
  const totalVenda = numeroCelula(valores.get('totalVenda') || '', pontoDecimal);
  let custo = numeroCelula(valores.get('custo') || '', pontoDecimal);
  const venda = numeroCelula(valores.get('venda') || '', pontoDecimal);
  if (custo == null && totalCusto != null && saida != null && saida > 0) custo = totalCusto / saida;
  if (saldo == null && saida == null && custo == null && totalCusto == null && totalVenda == null && venda == null) return null;
  const saidaDiaria = saida != null && periodo && periodo > 0 ? saida / periodo : null;
  return {
    codigo,
    nome,
    unidade: (valores.get('unidade') || '').trim(),
    saldo,
    minimo: numeroCelula(valores.get('minimo') || '', pontoDecimal),
    custo,
    venda,
    totalCusto,
    totalVenda,
    saida,
    saidaDiaria,
    dias: diasDe(saldo, saidaDiaria),
    classeAbc: simplificar(valores.get('abc') || '').slice(0, 1).toUpperCase(),
    margemPct: numeroCelula(valores.get('margem') || '', pontoDecimal),
    markupPct: numeroCelula(valores.get('markup') || '', pontoDecimal)
  };
};

function relatorioGirado(itens: ItemPosicaoPdf[], paginasArquivo: number): RelatorioInteligencia | null {
  const usadas = itens.filter(item => item.pagina <= 10 && item.texto.trim());
  if (!usadas.some(item => simplificar(item.texto) === 'produto')) return null;
  const pontoDecimal = pontoDecimalNosTextos(usadas.map(item => item.texto));
  const texto = usadas.map(item => item.texto).join('\n');
  const periodo = periodoNoTexto(texto)?.dias ?? null;
  const produtos: ItemInteligencia[] = [];
  const paginas = [...new Set(usadas.map(item => item.pagina))].sort((a, b) => a - b);
  paginas.forEach(pagina => {
    const daPagina = usadas.filter(item => item.pagina === pagina);
    const ancora = daPagina.find(item => simplificar(item.texto) === 'produto');
    if (!ancora) return;
    const banda = daPagina.filter(item => item.x <= ancora.x + 8 && item.x >= ancora.x - 24 && item.texto.trim().length < 40);
    const cabecalhos = fundirCabecalhos(banda)
      .map(grupo => ({ ...grupo, campo: classificarRotulo(grupo.texto) }))
      .filter((grupo): grupo is { texto: string; y: number; campo: CampoEstoque } => grupo.campo != null);
    if (!cabecalhos.some(coluna => coluna.campo === 'nome' || coluna.campo === 'codigo') || cabecalhos.length < 3) return;
    const dados = daPagina.filter(item => item.x > ancora.x + 8);
    const yCodigo = cabecalhos.find(coluna => coluna.campo === 'codigo')?.y;
    const ancorasCodigo = yCodigo == null ? [] : dados.filter(item => Math.abs(item.y - yCodigo) <= 18 && /^\d{6,}$/.test(item.texto.trim()));
    const porLinha = new Map<number, ItemPosicaoPdf[]>();
    const guardar = (pos: number, item: ItemPosicaoPdf) => {
      const lista = porLinha.get(pos) || [];
      lista.push(item);
      porLinha.set(pos, lista);
    };
    if (ancorasCodigo.length >= 3) {
      dados.forEach(item => {
        const ancoraLinha = ancorasCodigo.reduce((melhor, atual) => Math.abs(atual.x - item.x) < Math.abs(melhor.x - item.x) ? atual : melhor);
        if (Math.abs(ancoraLinha.x - item.x) <= 6) guardar(Math.round(ancoraLinha.x), item);
      });
    } else {
      dados.forEach(item => {
        const existente = [...porLinha.keys()].find(pos => Math.abs(pos - item.x) <= 2);
        guardar(existente ?? Math.round(item.x), item);
      });
    }
    const colunaDoToken = (y: number) => {
      let melhor: { campo: CampoEstoque } | null = null;
      let melhorDist = 28;
      cabecalhos.forEach(coluna => {
        const bruto = Math.abs(coluna.y - y);
        if (bruto > 34) return;
        const dist = coluna.y <= y + 2 ? bruto - 12 : bruto;
        if (dist < melhorDist) {
          melhorDist = dist;
          melhor = coluna;
        }
      });
      return melhor;
    };
    [...porLinha.entries()].sort((a, b) => a[0] - b[0]).forEach(([, tokens]) => {
      const valores = new Map<CampoEstoque, string>();
      [...tokens].sort((a, b) => a.x - b.x || a.y - b.y).forEach(token => {
        const coluna = colunaDoToken(token.y);
        if (!coluna) return;
        const anterior = valores.get(coluna.campo);
        valores.set(coluna.campo, anterior ? `${anterior} ${token.texto}` : token.texto);
      });
      const item = montarItemGirado(valores, pontoDecimal, periodo);
      if (item) produtos.push(item);
    });
  });
  if (!produtos.length) return null;
  return fecharRelatorio(produtos, texto, paginasArquivo, usadas.reduce((max, item) => Math.max(max, item.pagina), 0));
}

export function relatorioDosItens(itens: ItemPosicaoPdf[], linhas: LinhaPdf[], paginasArquivo: number): RelatorioInteligencia {
  return relatorioGirado(itens, paginasArquivo) || relatorioDasLinhas(linhas, paginasArquivo);
}

export function relatorioDaMatriz(matriz: string[][], paginasArquivo: number): RelatorioInteligencia {
  const linhas: LinhaPdf[] = matriz.flatMap((celulas, indice) => {
    const tokens = celulas.map((celula, coluna) => ({ texto: String(celula || '').trim(), x: coluna * 80 })).filter(token => token.texto);
    if (!tokens.length) return [];
    return [{ pagina: 1, y: 1000 - indice, tokens, texto: tokens.map(token => token.texto).join(' ') }];
  });
  return relatorioDasLinhas(linhas, Math.max(1, paginasArquivo));
}

export const itensZeradosOuCriticos = (itens: ItemInteligencia[]) => itens
  .filter(item => (item.saldo != null && item.saldo <= 0) || (item.minimo != null && item.minimo > 0 && item.saldo != null && item.saldo <= item.minimo) || (item.dias != null && item.dias < 15))
  .sort((a, b) => {
    const zeroA = a.saldo != null && a.saldo <= 0 ? 0 : 1;
    const zeroB = b.saldo != null && b.saldo <= 0 ? 0 : 1;
    if (zeroA !== zeroB) return zeroA - zeroB;
    return (a.dias ?? 9999) - (b.dias ?? 9999);
  });

export const curvaOrdenada = (itens: ItemInteligencia[]) => [...itens]
  .filter(item => item.saida != null)
  .sort((a, b) => (b.saida || 0) - (a.saida || 0));
