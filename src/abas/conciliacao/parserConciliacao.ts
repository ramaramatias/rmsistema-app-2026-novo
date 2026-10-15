export type TokenPdf = { texto: string; x: number; fonte?: string };
export type LinhaPdf = { pagina: number; y: number; tokens: TokenPdf[]; texto: string };

export type ProdutoNota = {
  produto: string;
  quantidade: number;
  unidade: string;
  precoNf: number;
};

export type ItemTabela = {
  produto: string;
  precoEmbalagem: number;
  pesoKg: number | null;
  precoPorKg: number;
  detalhe: string;
  porKg?: boolean;
};

export type LinhaConciliacao = {
  id: string;
  produto: string;
  quantidade: number;
  unidade: string;
  precoNf: number;
  precoCeasa: number | null;
  semPreco: boolean;
  detalhe: string;
};

export type ResultadoNota = {
  produtos: ProdutoNota[];
  numero: string;
  data: string;
  empresa: string;
  avisos: string[];
};

export type OrigemPreco = 'tabela2' | 'coluna2';

export type ResultadoTabela = {
  itens: ItemTabela[];
  data: string;
  achouTabela2: boolean;
  origem: OrigemPreco;
  avisos: string[];
};

const EMPRESA_PADRAO = 'Centro Espírita O Pobre de Deus';

const UNIDADES = /^(KG|KGS|KILO|KILOS|UN|UND|UNID|CX|CXA|PCT|FD|SC|BDJ|DZ|PC|LT|G|GR|GRS)$/i;

export function parseNumeroBr(valor: string): number | null {
  const t = valor.trim().replace(/R\$\s*/gi, '').replace(/\s/g, '');
  if (!t || !/\d/.test(t)) return null;
  let normalizado = t;
  if (t.includes(',')) {
    if (!/^[+-]?(?:\d{1,3}(?:\.\d{3})+|\d+),\d+$/.test(t)) return null;
    normalizado = t.replace(/\./g, '').replace(',', '.');
  } else if (/^[+-]?\d{1,3}(?:\.\d{3})+$/.test(t)) {
    normalizado = t.replace(/\./g, '');
  } else if (!/^[+-]?\d+(?:\.\d+)?$/.test(t)) {
    return null;
  }
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : null;
}

export function arredondar2(valor: number) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/** A partir de 50 centavos, sobe para o real inteiro. Abaixo disso, mantém os centavos. */
export function arredondarValorNf(total: number) {
  const base = arredondar2(total);
  const centavos = Math.round((base - Math.trunc(base)) * 100 + Number.EPSILON);
  if (centavos >= 50) return Math.round(base);
  return base;
}

export function formatarNumero(valor: number, casas = 2) {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

/** Mostra centavos quando o valor fecha em 2 casas. Preço da nota com 3 ou 4 casas continua visível. */
export function formatarQuantia(valor: number) {
  const quatro = Math.round((valor + Number.EPSILON) * 10000) / 10000;
  const fechaEmCentavos = Math.abs(quatro * 100 - Math.round(quatro * 100)) < 0.001;
  return formatarNumero(quatro, fechaEmCentavos ? 2 : 4);
}

export function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarPercentual(valor: number) {
  return `${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

export function normalizarNome(nome: string) {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(kg|kgs|kilo|kilos|quilo|quilos|cx|cxa|caixa|caixas|un|und|unid|unidade|pct|pacote|fd|fardo|sc|saco|dz|duzia|pc)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function textoLinha(tokens: TokenPdf[]) {
  return [...tokens].sort((a, b) => a.x - b.x).map(token => token.texto).join(' ').replace(/\s+/g, ' ').trim();
}

export function montarLinhas(pagina: number, itens: { texto: string; x: number; y: number; fonte?: string }[], tolerancia = 3): LinhaPdf[] {
  const ordenados = itens
    .filter(item => item.texto.trim())
    .sort((a, b) => b.y - a.y || a.x - b.x);
  const grupos: { y: number; tokens: TokenPdf[] }[] = [];
  ordenados.forEach(item => {
    const ultimo = grupos[grupos.length - 1];
    const token = { texto: item.texto.trim(), x: item.x, fonte: item.fonte };
    if (!ultimo || Math.abs(ultimo.y - item.y) > tolerancia) {
      grupos.push({ y: item.y, tokens: [token] });
      return;
    }
    ultimo.tokens.push(token);
  });
  return grupos.map(grupo => ({
    pagina,
    y: grupo.y,
    tokens: grupo.tokens,
    texto: textoLinha(grupo.tokens)
  }));
}

function ehCodigoFiscal(texto: string) {
  const digitos = texto.replace(/\./g, '');
  return /^\d{2,4}$/.test(digitos) || /^\d{8}$/.test(digitos) || /^\d{12,14}$/.test(digitos);
}

function linhaDeProduto(tokens: TokenPdf[]): ProdutoNota | null {
  const ordem = [...tokens].sort((a, b) => a.x - b.x);
  const idx = ordem.findIndex(token => UNIDADES.test(token.texto.replace(/\./g, '')));
  if (idx < 0) return null;
  let unidade = ordem[idx].texto.toUpperCase().replace(/\./g, '');
  const antes = ordem.slice(0, idx);
  const depois = ordem.slice(idx + 1);
  const numerosDepois = depois
    .map(token => parseNumeroBr(token.texto))
    .filter((n): n is number => n !== null && n >= 0);
  const numerosAntes = antes
    .map(token => parseNumeroBr(token.texto))
    .filter((n): n is number => n !== null && n > 0);
  let quantidade = 0;
  let precoNf = 0;
  let totalNota: number | null = null;
  if (numerosDepois.length >= 2 && numerosDepois[0] > 0 && numerosDepois[1] > 0) {
    quantidade = numerosDepois[0];
    precoNf = numerosDepois[1];
    if (numerosDepois.length >= 3) totalNota = numerosDepois[2];
  } else if (numerosAntes.length && numerosDepois.length >= 1 && numerosDepois[0] > 0) {
    quantidade = numerosAntes[numerosAntes.length - 1];
    precoNf = numerosDepois[0];
    if (numerosDepois.length >= 2) totalNota = numerosDepois[1];
  } else {
    return null;
  }
  if (/^G(R|RS)?$/.test(unidade)) {
    quantidade = quantidade / 1000;
    precoNf = precoNf * 1000;
    unidade = 'KG';
  }
  if (totalNota && quantidade > 0 && Math.abs(arredondar2(quantidade * precoNf) - totalNota) <= 0.05) {
    precoNf = totalNota / quantidade;
  }
  const produto = antes
    .filter(token => parseNumeroBr(token.texto) === null && !ehCodigoFiscal(token.texto))
    .map(token => token.texto)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (produto.length < 2) return null;
  if (quantidade <= 0 || quantidade > 100000 || precoNf <= 0 || precoNf > 100000) return null;
  return { produto, quantidade, unidade, precoNf };
}

function nomeBloqueado(produto: string) {
  const nome = normalizarNome(produto);
  return /^(valor total|base de calculo|quantidade|desconto|frete|seguro|pis|cofins|icms|ipi|descricao|produto|servico|ncm|cfop|peso bruto|peso liquido|transporte|total geral)\b/.test(nome);
}

function acharData(texto: string) {
  const data = texto.match(/\b(\d{2}\/\d{2}\/\d{4})\b/);
  return data ? data[1] : '';
}

function limparEmpresa(texto: string) {
  return texto
    .replace(/destinat[aá]rio(\s*\/\s*remetente)?/ig, '')
    .replace(/nome\s*\/\s*raz[aã]o social/ig, '')
    .replace(/raz[aã]o social/ig, '')
    .replace(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g, '')
    .replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, '')
    .replace(/\b\d{2}\/\d{2}\/\d{4}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function lerEmpresa(linhas: LinhaPdf[]) {
  const idx = linhas.findIndex(linha => /destinat[aá]rio/i.test(linha.texto));
  if (idx < 0) return EMPRESA_PADRAO;
  for (let i = idx; i < Math.min(linhas.length, idx + 6); i++) {
    const limpo = limparEmpresa(linhas[i].texto);
    if (limpo.length >= 8 && !/cpf|cnpj|endere[cç]o|bairro|\bcep\b|inscri|munic[ií]pio|data de|nf-?e|emiss/i.test(limpo)) {
      return limpo;
    }
  }
  return EMPRESA_PADRAO;
}

function numeroDaNota(texto: string) {
  const formatado = texto.match(/\b(\d{3}\.\d{3}\.\d{3})\b/);
  if (!formatado) return '';
  return formatado[1].replace(/\./g, '').replace(/^0+/, '') || '0';
}

function lerNumero(linhas: LinhaPdf[]) {
  const cabeca = linhas.slice(0, 40);
  for (const linha of cabeca) {
    if (!/n[º°o]\.?\s*\d/i.test(linha.texto)) continue;
    const formatado = numeroDaNota(linha.texto);
    if (formatado) return formatado;
    const curto = linha.texto.match(/n[º°o]\.?\s*0*(\d{1,9})\b/i);
    if (curto?.[1]) return curto[1];
  }
  for (const linha of cabeca) {
    if (!/\bnf-?e\b/i.test(linha.texto)) continue;
    const formatado = numeroDaNota(linha.texto);
    if (formatado) return formatado;
  }
  for (const linha of cabeca) {
    const formatado = numeroDaNota(linha.texto);
    if (formatado) return formatado;
  }
  return '';
}

function lerDataNota(linhas: LinhaPdf[]) {
  const idx = linhas.findIndex(linha => /emiss[aã]o/i.test(linha.texto));
  if (idx >= 0) {
    for (let i = idx; i < Math.min(linhas.length, idx + 3); i++) {
      const data = acharData(linhas[i].texto);
      if (data) return data;
    }
  }
  return acharData(linhas.slice(0, 30).map(linha => linha.texto).join(' '));
}

export function lerNota(linhas: LinhaPdf[]): ResultadoNota {
  const avisos: string[] = [];
  const inicio = linhas.findIndex(linha => /dados dos produtos|dados do produto/i.test(linha.texto));
  const fimRelativo = linhas.slice(inicio + 1).findIndex(linha => /dados adicionais|c[aá]lculo do iss|informa[cç][oõ]es complementares/i.test(linha.texto));
  const fim = inicio >= 0 && fimRelativo >= 0 ? inicio + 1 + fimRelativo : linhas.length;
  const trecho = inicio >= 0 ? linhas.slice(inicio + 1, fim) : linhas;
  if (inicio < 0) avisos.push('Não achei o bloco "Dados dos produtos" na nota. Tentei ler as linhas que parecem produto.');

  const produtos: ProdutoNota[] = [];
  trecho.forEach(linha => {
    if (/descri[cç][aã]o|dados dos produtos|valor unit/i.test(linha.texto) && /quant|unid|\bun\b/i.test(linha.texto)) return;
    const produto = linhaDeProduto(linha.tokens);
    if (!produto || nomeBloqueado(produto.produto)) return;
    produtos.push(produto);
  });

  if (!produtos.length) avisos.push('Nenhum produto com quilos e preço foi encontrado na nota.');
  return {
    produtos,
    numero: lerNumero(linhas),
    data: lerDataNota(linhas),
    empresa: lerEmpresa(linhas),
    avisos
  };
}

type TipoColuna = 'nome' | 'embalagem' | 'peso' | 'minimo' | 'comum' | 'maximo' | 'preco' | 'coluna2';

function simplificar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tipoColuna(texto: string): TipoColuna | null {
  const t = simplificar(texto);
  if (!t) return null;
  if (/minimo|\bmin\b/.test(t)) return 'minimo';
  if (/^mc$|mais comum|preco comum|\bcomum\b|medio|moda/.test(t)) return 'comum';
  if (/maximo|\bmax\b/.test(t)) return 'maximo';
  if (/coluna\s*2|preco\s*2/.test(t)) return 'coluna2';
  if (/preco|valor/.test(t)) return 'preco';
  if (/\bpeso\b|quilo/.test(t)) return 'peso';
  if (/embalag|unidade|\bun\b|apresent/.test(t)) return 'embalagem';
  if (/produto|descricao|mercadoria|\bitem\b|\bnome\b/.test(t)) return 'nome';
  return null;
}

function ancorasDoCabecalho(tokens: TokenPdf[]) {
  const ordem = [...tokens].sort((a, b) => a.x - b.x);
  const ancoras: { tipo: TipoColuna; x: number }[] = [];
  for (let i = 0; i < ordem.length; i++) {
    const atual = tipoColuna(ordem[i].texto);
    const proximoTexto = ordem[i + 1] ? simplificar(ordem[i + 1].texto) : '';
    if (simplificar(ordem[i].texto) === 'coluna' && proximoTexto === '2') {
      ancoras.push({ tipo: 'coluna2', x: ordem[i].x });
      i += 1;
      continue;
    }
    const proximo = ordem[i + 1] ? tipoColuna(ordem[i + 1].texto) : null;
    if (atual === 'preco' && (proximo === 'minimo' || proximo === 'comum' || proximo === 'maximo')) {
      ancoras.push({ tipo: proximo, x: ordem[i].x });
      i += 1;
      continue;
    }
    if (atual) ancoras.push({ tipo: atual, x: ordem[i].x });
  }
  const temValor = ancoras.some(ancora => ancora.tipo === 'preco' || ancora.tipo === 'comum' || ancora.tipo === 'minimo' || ancora.tipo === 'maximo' || ancora.tipo === 'coluna2');
  return temValor && ancoras.length >= 2 ? ancoras : null;
}

const FIM_SECAO = /tabela\s*(n[.ºo°]?\s*)?(3|03|iii|4|04)\b|\btab\.?\s*(3|03|4|04)\b|coluna\s*(n[.ºo°]?\s*)?(3|03|iii)\b|\bcol\.?\s*(3|03)\b/i;

function fatiarOrigem(linhas: LinhaPdf[], origem: OrigemPreco) {
  const marca = origem === 'coluna2'
    ? /coluna\s*(n[.ºo°]?\s*)?(2|02|ii)\b|\bcol\.?\s*(2|02)\b/i
    : /tabela\s*(n[.ºo°]?\s*)?(2|02|ii)\b|\btab\.?\s*(2|02)\b/i;
  const inicio = linhas.findIndex(linha => marca.test(linha.texto));
  if (inicio < 0) return { trecho: linhas, achouSecao: false };
  let fim = linhas.length;
  for (let i = inicio + 1; i < linhas.length; i++) {
    if (FIM_SECAO.test(linhas[i].texto)) {
      fim = i;
      break;
    }
  }
  const titulo = linhas[inicio];
  const trecho = linhas.slice(inicio + 1, fim);
  if (ancorasDoCabecalho(titulo.tokens)) trecho.unshift(titulo);
  return { trecho, achouSecao: true };
}

function numerosDePreco(texto: string) {
  return [...texto.matchAll(/(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2})/gi)]
    .map(achado => parseNumeroBr(achado[1]))
    .filter((n): n is number => n !== null && n > 0 && n < 100000);
}

function separarPesoEPrecos(texto: string) {
  const precos = numerosDePreco(texto);
  const quilos = texto.match(/(\d+(?:[.,]\d+)?)\s*kgs?\b/i);
  const pesoQuilos = quilos ? parseNumeroBr(quilos[1]) : null;
  if (pesoQuilos && pesoQuilos > 0) {
    const resto = precos.filter(preco => Math.abs(preco - pesoQuilos) > 0.001);
    if (resto.length) return { peso: pesoQuilos, precos: resto };
    if (precos.length) return { peso: null, precos };
  }
  const caixa = texto.match(/(?:caixa|cxa?)\s*(?:de|c\/|com)?\s*(\d+(?:[.,]\d+)?)(?!\s*kgs?\b)/i);
  const pesoCaixa = caixa ? parseNumeroBr(caixa[1]) : null;
  if (pesoCaixa && pesoCaixa > 0 && precos.length) return { peso: pesoCaixa, precos };
  return { peso: null, precos };
}

function nomeDaLinha(texto: string) {
  return texto
    .replace(/R\$\s*/gi, ' ')
    .replace(/(?:caixa|cxa?)\s*(?:de|c\/|com)?\s*\d+(?:[.,]\d+)?\s*kgs?/gi, ' ')
    .replace(/\d+(?:[.,]\d+)?\s*kgs?\b/gi, ' ')
    .replace(/\b(?:caixa|cxa?|pct|fd|sc|dz|un|und|unid)\b/gi, ' ')
    .replace(/\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function numeroNaColuna(tokens: TokenPdf[], x: number) {
  const numeros = tokens
    .map(token => ({ x: token.x, n: parseNumeroBr(token.texto.replace(/R\$/gi, '')) }))
    .filter((item): item is { x: number; n: number } => item.n !== null && item.n > 0);
  const proximo = numeros.sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0];
  return proximo && Math.abs(proximo.x - x) < 90 ? proximo.n : null;
}

function escolherPreco(precos: number[], ancoras: { tipo: TipoColuna; x: number }[] | null, tokens: TokenPdf[], forcarSegunda: boolean) {
  if (!precos.length) return { valor: null, usouMeio: false, usouSegunda: false };
  if (forcarSegunda) {
    const marcada = ancoras?.find(ancora => ancora.tipo === 'coluna2');
    if (marcada) {
      const valor = numeroNaColuna(tokens, marcada.x);
      if (valor) return { valor, usouMeio: false, usouSegunda: true };
    }
    const colunas = (ancoras || [])
      .filter(ancora => ancora.tipo === 'minimo' || ancora.tipo === 'comum' || ancora.tipo === 'maximo' || ancora.tipo === 'preco' || ancora.tipo === 'coluna2')
      .sort((a, b) => a.x - b.x);
    if (colunas.length >= 2) {
      const valor = numeroNaColuna(tokens, colunas[1].x);
      if (valor) return { valor, usouMeio: false, usouSegunda: true };
    }
    if (precos.length >= 2) return { valor: precos[1], usouMeio: false, usouSegunda: true };
    return { valor: precos[0], usouMeio: false, usouSegunda: false };
  }
  if (ancoras) {
    const preferida = ancoras.find(ancora => ancora.tipo === 'comum')
      || ancoras.find(ancora => ancora.tipo === 'preco')
      || null;
    if (preferida) {
      const valor = numeroNaColuna(tokens, preferida.x);
      if (valor) return { valor, usouMeio: false, usouSegunda: false };
    }
  }
  if (precos.length >= 3) return { valor: precos[Math.floor(precos.length / 2)], usouMeio: true, usouSegunda: false };
  return { valor: precos[precos.length - 1], usouMeio: false, usouSegunda: false };
}

function formatarPrecoKg(valor: number) {
  const tresCasas = Math.round(valor * 1000) / 1000;
  if (Math.abs(tresCasas - arredondar2(valor)) >= 0.001) return `R$ ${formatarNumero(tresCasas, 3)}`;
  return formatarMoeda(valor);
}

function detalhePreco(rotulo: string, preco: number, peso: number | null, porKg: number) {
  if (peso && peso > 0 && Math.abs(peso - 1) > 0.001) {
    return `${rotulo}: ${formatarMoeda(preco)} ÷ ${formatarNumero(peso, peso % 1 === 0 ? 0 : 2)} kg = ${formatarPrecoKg(porKg)}/kg`;
  }
  return `${rotulo}: ${formatarMoeda(porKg)}/kg`;
}

const ESTADOS_BOLETIM = 'ce|ba|sp|mg|es|go|pb|rn|pr|se|rs|pe|pi|ma|pa|am|mt|ms|sc|rj|df|to|al|ap|rr|ro|ac';
const SITUACAO_BOLETIM = /\b(est|fra|fir|aus|ent|sinf|sin)\b|s\s*\/\s*in/i;

function ehCabecalhoCeasa(texto: string) {
  const t = simplificar(texto);
  return /\bmin\b/.test(t) && /\bmc\b/.test(t) && /\bmax\b/.test(t);
}

function ehBoletimCeasa(linhas: LinhaPdf[]) {
  if (linhas.some(linha => ehCabecalhoCeasa(linha.texto))) return true;
  const texto = simplificar(linhas.slice(0, 40).map(linha => linha.texto).join(' '));
  return /\b(ceasa|sima)\b/.test(texto) && /\b(boletim|frutas|hortalicas)\b/.test(texto);
}

function fonteDoNome(linha: LinhaPdf) {
  return [...linha.tokens].sort((a, b) => a.x - b.x)[0]?.fonte || '';
}

function limparNomeBoletim(texto: string) {
  return nomeDaLinha(texto)
    .replace(SITUACAO_BOLETIM, ' ')
    .replace(new RegExp(`\\b(?:${ESTADOS_BOLETIM})(?:\\s*/\\s*(?:${ESTADOS_BOLETIM}))*\\b`, 'gi'), ' ')
    .replace(/\bkgs?\b/gi, ' ')
    .replace(/\bks\b/gi, ' ')
    .replace(/\bp[eé]\b|\b(molho|cento|und|unid)\b/gi, ' ')
    .replace(/\./g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function ehRodapeBoletim(texto: string) {
  const t = simplificar(texto);
  return /^(endereco|legenda|fone|e mail|email|fonte|facebook|instagram|www|obs)\b/.test(t)
    || /fonte:\s*ceasa|este documento|pesquisa e informacao|preco maximo|preco minimo|mais comum do dia|mercado firme|sem operacao/i.test(t);
}

function ehTituloSecao(nome: string) {
  const t = simplificar(nome);
  return t === 'frutas' || t === 'hortalicas' || t === 'outros' || t === 'hortifruti';
}

function divisoriaLadoALado(linhas: LinhaPdf[]) {
  const marcas: { x: number; tipo: 'frutas' | 'hortalicas' }[] = [];
  linhas.forEach(linha => {
    linha.tokens.forEach(token => {
      const t = simplificar(token.texto).replace(/\s+/g, '');
      if (t === 'frutas' || t === 'fruta') marcas.push({ x: token.x, tipo: 'frutas' });
      else if (t.startsWith('hortali')) marcas.push({ x: token.x, tipo: 'hortalicas' });
    });
  });
  const frutas = marcas.filter(marca => marca.tipo === 'frutas');
  const hort = marcas.filter(marca => marca.tipo === 'hortalicas');
  if (!frutas.length || !hort.length) return null;
  const xFrutas = Math.min(...frutas.map(marca => marca.x));
  const hortDireita = hort.filter(marca => marca.x > xFrutas + 80);
  if (!hortDireita.length) return null;
  return Math.min(...hortDireita.map(marca => marca.x)) - 0.5;
}

function fatiarLado(linhas: LinhaPdf[], split: number, direita: boolean): LinhaPdf[] {
  return linhas.flatMap(linha => {
    const tokens = linha.tokens.filter(token => (direita ? token.x >= split : token.x < split));
    if (!tokens.length) return [];
    return [{ ...linha, tokens, texto: textoLinha(tokens) }];
  });
}

function unidadeAvulsa(texto: string) {
  const t = simplificar(texto);
  if (/\bkg\b|\bks\b/.test(t)) return null;
  if (/\bpe\b/.test(t)) return 'pé';
  if (/\bmolho\b/.test(t)) return 'molho';
  if (/\bcento\b/.test(t)) return 'cento';
  if (/\bund\b|\bunid\b|\bun\b/.test(t)) return 'un';
  return null;
}

function juntarGrupo(grupo: string, nome: string) {
  const g = normalizarNome(grupo);
  const n = normalizarNome(nome);
  if (!g || !n) return nome;
  if (n.includes(g)) return nome;
  const primeira = n.split(' ')[0];
  const parecido = primeira.startsWith(g.slice(0, Math.max(1, g.length - 1))) && Math.abs(primeira.length - g.length) <= 1;
  if (parecido) return nome;
  return `${grupo} ${nome}`;
}

function xDaColunaMc(tokens: TokenPdf[]) {
  const mc = [...tokens].sort((a, b) => a.x - b.x).find(token => simplificar(token.texto) === 'mc');
  return mc ? mc.x : null;
}

function precoDaColunaMc(linha: LinhaPdf, xMc: number | null) {
  if (xMc != null) {
    const valor = numeroNaColuna(linha.tokens, xMc);
    if (valor) return valor;
  }
  const precos = numerosDePreco(linha.texto);
  if (precos.length >= 3) return precos[1];
  return precos[precos.length - 1] || null;
}

function lerBoletimCeasa(linhas: LinhaPdf[], origem: OrigemPreco): ResultadoTabela {
  const split = divisoriaLadoALado(linhas);
  if (split != null) {
    const esquerda = lerColunaBoletim(fatiarLado(linhas, split, false), origem);
    const direita = lerColunaBoletim(fatiarLado(linhas, split, true), origem);
    const itens = [...esquerda.itens, ...direita.itens];
    const avisos = ['Boletim da CEASA com frutas e hortaliças na mesma folha: li cada lado separado e usei a coluna MC.'];
    if (!itens.length) avisos.push('Nenhum preço foi encontrado no boletim da CEASA.');
    return {
      itens,
      data: esquerda.data || direita.data,
      achouTabela2: true,
      origem,
      avisos
    };
  }
  return lerColunaBoletim(linhas, origem);
}

function lerColunaBoletim(linhas: LinhaPdf[], origem: OrigemPreco): ResultadoTabela {
  const avisos = ['Boletim da CEASA: usei a coluna MC, o preço mais comum, e juntei o nome do grupo com a variedade.'];
  const inicio = linhas.findIndex(linha => ehCabecalhoCeasa(linha.texto));
  const trecho = inicio >= 0 ? linhas.slice(inicio) : linhas;
  let xMc = inicio >= 0 ? xDaColunaMc(linhas[inicio].tokens) : null;
  const titulos = trecho.filter(linha => {
    if (ehCabecalhoCeasa(linha.texto) || ehRodapeBoletim(linha.texto)) return false;
    if (numerosDePreco(linha.texto).length || /\.{3}|…/.test(linha.texto) || SITUACAO_BOLETIM.test(linha.texto)) return false;
    return limparNomeBoletim(linha.texto).length >= 3;
  });
  const fontes = titulos.map(fonteDoNome).filter(Boolean);
  const fonteTitulo = fontes.sort((a, b) => fontes.filter(fonte => fonte === b).length - fontes.filter(fonte => fonte === a).length)[0] || '';
  let grupo = '';
  let comecou = inicio >= 0;
  let paginaRodape = -1;
  const itens: ItemTabela[] = [];
  for (const linha of trecho) {
    if (paginaRodape === linha.pagina) continue;
    if (ehRodapeBoletim(linha.texto)) {
      paginaRodape = linha.pagina;
      continue;
    }
    const nomeSecao = limparNomeBoletim(linha.texto);
    if (ehCabecalhoCeasa(linha.texto) || ehTituloSecao(nomeSecao)) {
      comecou = true;
      grupo = '';
      if (ehCabecalhoCeasa(linha.texto)) xMc = xDaColunaMc(linha.tokens) ?? xMc;
      continue;
    }
    if (!comecou) continue;
    const nome = limparNomeBoletim(linha.texto);
    if (nome.length < 2 || nomeBloqueado(nome) || ehTituloSecao(nome)) {
      if (ehTituloSecao(nome)) grupo = '';
      continue;
    }
    const titulo = !numerosDePreco(linha.texto).length && !/\.{3}|…/.test(linha.texto) && !SITUACAO_BOLETIM.test(linha.texto);
    if (titulo) {
      grupo = nome;
      continue;
    }
    const preco = precoDaColunaMc(linha, xMc);
    if (!preco) continue;
    const fonte = fonteDoNome(linha);
    const filho = Boolean(fonteTitulo && fonte && fonte !== fonteTitulo && grupo);
    const produto = filho ? juntarGrupo(grupo, nome) : nome;
    if (!filho) grupo = '';
    const separado = separarPesoEPrecos(linha.texto);
    const peso = separado.peso && separado.peso > 0 ? separado.peso : null;
    const avulsa = unidadeAvulsa(linha.texto);
    const porKg = !avulsa;
    const precoPorKg = porKg && peso && peso !== 1 ? preco / peso : preco;
    const detalhe = avulsa
      ? `CEASA MC: ${formatarMoeda(preco)} por ${avulsa}`
      : detalhePreco('CEASA MC', preco, peso, precoPorKg);
    itens.push({
      produto,
      precoEmbalagem: preco,
      pesoKg: porKg && peso && peso !== 1 ? peso : null,
      precoPorKg,
      detalhe,
      porKg
    });
  }
  if (!itens.length) avisos.push('Nenhum preço foi encontrado no boletim da CEASA.');
  const data = acharData(linhas.map(linha => linha.texto).join(' '));
  return { itens, data, achouTabela2: true, origem, avisos };
}

export function lerTabela2(linhas: LinhaPdf[], origem: OrigemPreco = 'tabela2'): ResultadoTabela {
  if (ehBoletimCeasa(linhas)) return lerBoletimCeasa(linhas, origem);
  const avisos: string[] = [];
  const rotulo = origem === 'coluna2' ? 'Coluna 2' : 'Tabela 2';
  const { trecho, achouSecao } = fatiarOrigem(linhas, origem);
  if (!achouSecao && origem === 'tabela2') avisos.push('Não achei o título Tabela 2. Li o PDF de preços inteiro. Confira se os produtos são os da sua tabela.');
  if (!achouSecao && origem === 'coluna2') avisos.push('Não achei o título Coluna 2. Usei a segunda coluna de preço de cada produto.');

  let cabecalho: { tipo: TipoColuna; x: number }[] | null = null;
  let cabecalhoIndex = -1;
  trecho.forEach((linha, index) => {
    const ancoras = ancorasDoCabecalho(linha.tokens);
    if (ancoras && (!cabecalho || ancoras.length > cabecalho.length)) {
      cabecalho = ancoras;
      cabecalhoIndex = index;
    }
  });

  let usouMeio = false;
  const itens: ItemTabela[] = [];
  trecho.forEach((linha, index) => {
    if (index === cabecalhoIndex) return;
    if (/tabela\s*(2|02|ii)|coluna\s*(2|02|ii)|pagina|p[aá]gina/i.test(linha.texto) && !/\d,\d{2}/.test(linha.texto)) return;
    const separado = separarPesoEPrecos(linha.texto);
    const precos = separado.precos;
    const peso = separado.peso;
    const escolha = escolherPreco(precos, cabecalho, linha.tokens, origem === 'coluna2');
    const preco = escolha.valor;
    const produto = nomeDaLinha(linha.texto);
    if (!preco || produto.length < 2 || nomeBloqueado(produto)) return;
    if (escolha.usouMeio) usouMeio = true;
    const pesoUtil = peso && peso > 0 ? peso : null;
    const precoPorKg = pesoUtil && pesoUtil !== 1 ? preco / pesoUtil : preco;
    itens.push({
      produto,
      precoEmbalagem: preco,
      pesoKg: pesoUtil && pesoUtil !== 1 ? pesoUtil : null,
      precoPorKg,
      detalhe: detalhePreco(rotulo, preco, pesoUtil, precoPorKg)
    });
  });

  if (usouMeio && !(cabecalho as { tipo: TipoColuna }[] | null)?.some(ancora => ancora.tipo === 'comum')) {
    avisos.push(`Onde a ${rotulo} trouxe três preços, usei o do meio (preço comum).`);
  }
  if (!itens.length) avisos.push(`Nenhum preço foi encontrado na ${rotulo}.`);
  const data = acharData(linhas.map(linha => linha.texto).join(' '));
  return { itens, data, achouTabela2: achouSecao, origem, avisos };
}

function comApelidos(nome: string) {
  return nome
    .replace(/\bjerimums?\b/g, 'abobora')
    .replace(/\babobaras?\b/g, 'abobora')
    .replace(/\bmacaxeira\b/g, 'aipim')
    .replace(/\bmandioca\b/g, 'aipim');
}

function pontuar(nota: string, tabela: string) {
  nota = comApelidos(nota);
  tabela = comApelidos(tabela);
  if (!nota || !tabela) return 0;
  if (nota === tabela) return 1000;
  const a = nota.split(' ').filter(parte => parte.length > 1);
  const b = tabela.split(' ').filter(parte => parte.length > 1);
  if (!a.length || !b.length) return 0;
  if (!b.includes(a[0]) && !a.includes(b[0])) return 0;
  const conjuntoB = new Set(b);
  const inter = a.filter(parte => conjuntoB.has(parte));
  if (!inter.length) return 0;
  const cobreNota = inter.length / a.length;
  const cobreTabela = inter.length / b.length;
  if (cobreNota === 1 && cobreTabela === 1) return 1000;
  if (cobreNota === 1) return 700 + Math.round(250 * cobreTabela);
  if (cobreTabela === 1) return 500 + Math.round(200 * cobreNota);
  return Math.round(400 * (inter.length / new Set([...a, ...b]).size));
}

function compativel(unidadeNota: string, item: ItemTabela) {
  const un = unidadeNota.toUpperCase().replace(/\./g, '');
  const notaEmUnidade = /^(UN|UND|UNID|PC)$/.test(un);
  const precoEmKg = item.porKg !== false;
  if (notaEmUnidade) return !precoEmKg;
  return precoEmKg;
}

export function cruzar(produtos: ProdutoNota[], tabela: ItemTabela[]): LinhaConciliacao[] {
  return produtos.map(produto => {
    const nome = normalizarNome(produto.produto);
    const ranque = tabela
      .map(item => ({ item, pontos: pontuar(nome, normalizarNome(item.produto)) }))
      .filter(opcao => opcao.pontos >= 500 && compativel(produto.unidade, opcao.item))
      .sort((a, b) => b.pontos - a.pontos || a.item.produto.length - b.item.produto.length);
    const melhor = ranque[0];
    if (!melhor) {
      return {
        id: crypto.randomUUID(),
        produto: produto.produto,
        quantidade: produto.quantidade,
        unidade: produto.unidade,
        precoNf: produto.precoNf,
        precoCeasa: null,
        semPreco: true,
        detalhe: 'Sem preço na tabela'
      };
    }
    const faixa = ranque.filter(opcao => melhor.pontos - opcao.pontos < 80);
    const escolhido = faixa.length > 1
      ? [...faixa].sort((a, b) => Math.abs(a.item.precoPorKg - produto.precoNf) - Math.abs(b.item.precoPorKg - produto.precoNf))[0]
      : melhor;
    const segundo = faixa.find(opcao => opcao !== escolhido);
    const detalhe = segundo
      ? `${escolhido.item.detalhe}. Também parecia ${segundo.item.produto}; confira.`
      : escolhido.item.detalhe;
    return {
      id: crypto.randomUUID(),
      produto: produto.produto,
      quantidade: produto.quantidade,
      unidade: produto.unidade,
      precoNf: produto.precoNf,
      precoCeasa: escolhido.item.precoPorKg,
      semPreco: false,
      detalhe
    };
  });
}

/** Preenche só as linhas que continuaram sem preço. Não troca o que a primeira tabela já achou. */
export function completarPrecos(linhas: LinhaConciliacao[], extra: ItemTabela[]) {
  let preenchidos = 0;
  const novas = linhas.map(linha => {
    if (!linha.semPreco || !extra.length) return linha;
    const achado = cruzar([{
      produto: linha.produto,
      quantidade: linha.quantidade,
      unidade: linha.unidade,
      precoNf: linha.precoNf
    }], extra)[0];
    if (!achado || achado.semPreco) return linha;
    preenchidos += 1;
    return {
      ...linha,
      precoCeasa: achado.precoCeasa,
      semPreco: false,
      detalhe: `PDF dos que faltam — ${achado.detalhe}`
    };
  });
  return { linhas: novas, preenchidos };
}

export function calcularLinha(quantidade: number, precoNf: number, precoCeasa: number | null) {
  const totalNf = arredondar2(quantidade * precoNf);
  const totalCeasa = precoCeasa == null ? null : arredondar2(quantidade * precoCeasa);
  const diferenca = precoCeasa ? ((precoNf - precoCeasa) / precoCeasa) * 100 : null;
  return {
    totalNf,
    totalCeasa,
    diferenca,
    valorArredondado: arredondarValorNf(totalNf)
  };
}

export function calcularTotais(linhas: { quantidade: number; precoNf: number; precoCeasa: number | null }[]) {
  const contas = linhas.map(linha => calcularLinha(linha.quantidade, linha.precoNf, linha.precoCeasa));
  const totalNf = arredondar2(contas.reduce((soma, linha) => soma + linha.totalNf, 0));
  const totalCeasa = arredondar2(contas.reduce((soma, linha) => soma + (linha.totalCeasa || 0), 0));
  const valorArredondado = arredondar2(contas.reduce((soma, linha) => soma + linha.valorArredondado, 0));
  const comPreco = linhas.filter(linha => linha.precoCeasa != null);
  const nfDaMargem = arredondar2(comPreco.reduce((soma, linha) => soma + calcularLinha(linha.quantidade, linha.precoNf, linha.precoCeasa).totalNf, 0));
  const ceasaDaMargem = arredondar2(comPreco.reduce((soma, linha) => soma + (calcularLinha(linha.quantidade, linha.precoNf, linha.precoCeasa).totalCeasa || 0), 0));
  const margemValor = arredondar2(nfDaMargem - ceasaDaMargem);
  const margemPct = ceasaDaMargem > 0 ? (margemValor / ceasaDaMargem) * 100 : null;
  return { totalNf, totalCeasa, valorArredondado, margemValor, margemPct, incompleto: comPreco.length !== linhas.length };
}
