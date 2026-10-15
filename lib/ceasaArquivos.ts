import { mkdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import path from 'path';
import { apagarAnexo, baixarBufferAnexo, gravarAnexoBytes, gravarIndiceCeasaBlob, lerIndiceCeasaBlob } from './nuvemAnexo.js';
import { PROMPT_CONCILIACAO_CEASA } from './ceasaPrompt.js';

/** Arquivos fixos publicados pela CEASA/CE no boletim de Tianguá (Ibiapaba). */
export const LINK_HORTALICAS_CEASA = 'https://files.ceasa-ce.com.br/unsima/boletim_diario/tiangua/hortalicas_tia.pdf';
export const LINK_FRUTAS_CEASA = 'https://files.ceasa-ce.com.br/unsima/boletim_diario/tiangua/frutas_tia.pdf';

const CHAVE_INDICE = 'sistema:ceasa:boletins';
const PASTA_LOCAL = () => path.join(process.cwd(), 'dados', 'ceasa');
const RETENCAO_MS = 6 * 24 * 60 * 60 * 1000;

export type BoletimCeasa = {
  id: string;
  dataBoletim: string;
  baixadoEm: string;
  frutasId: string;
  hortalicasId: string;
  frutasNome: string;
  hortalicasNome: string;
};

export type ItemConciliacaoCeasa = {
  nome_produto: string;
  preco_quilo_nota: number | null;
  preco_quilo_ceasa: number | null;
  diferenca_valores: number | null;
};

export type RespostaCeasa =
  | { tipo: 'json'; status: number; corpo: unknown }
  | { tipo: 'pdf'; status: number; corpo: Buffer; nome: string };

type EntradaCeasa = {
  method: string;
  url: string;
  headers: Record<string, string | undefined>;
  body?: unknown;
};

const credenciaisKv = () => {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ''), token };
};

const kvGet = async (chave: string) => {
  const acesso = credenciaisKv();
  if (!acesso) return '';
  const resposta = await fetch(`${acesso.url}/get/${chave}`, {
    headers: { Authorization: `Bearer ${acesso.token}` },
    cache: 'no-store'
  });
  if (!resposta.ok) throw new Error(`Nuvem respondeu ${resposta.status}.`);
  const dados = await resposta.json() as { result?: unknown };
  return typeof dados.result === 'string' ? dados.result : '';
};

const kvSet = async (chave: string, valor: string) => {
  const acesso = credenciaisKv();
  if (!acesso) return false;
  const resposta = await fetch(`${acesso.url}/set/${chave}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${acesso.token}`, 'Content-Type': 'text/plain' },
    body: valor,
    cache: 'no-store'
  });
  if (!resposta.ok) throw new Error(`Nuvem respondeu ${resposta.status}.`);
  return true;
};

const indiceLocal = () => path.join(PASTA_LOCAL(), 'indice.json');

const lerIndiceLocal = (): BoletimCeasa[] => {
  try {
    const texto = readFileSync(indiceLocal(), 'utf8');
    const dados = JSON.parse(texto) as BoletimCeasa[];
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
};

export async function listarBoletins(): Promise<BoletimCeasa[]> {
  const listas: BoletimCeasa[][] = [];
  try {
    const texto = await kvGet(CHAVE_INDICE);
    if (texto.trim()) {
      const dados = JSON.parse(texto) as BoletimCeasa[];
      if (Array.isArray(dados)) listas.push(dados);
    }
  } catch {
    /* segue para o índice em Blob */
  }
  try {
    const texto = await lerIndiceCeasaBlob();
    if (texto.trim()) {
      const dados = JSON.parse(texto) as BoletimCeasa[];
      if (Array.isArray(dados)) listas.push(dados);
    }
  } catch {
    /* segue para a pasta local */
  }
  if (listas.length) {
    const porId = new Map<string, BoletimCeasa>();
    listas.flat().forEach(item => {
      const existente = porId.get(item.id);
      if (!existente || instanteBaixado(item.baixadoEm) > instanteBaixado(existente.baixadoEm)) {
        porId.set(item.id, item);
      }
    });
    return Array.from(porId.values()).sort((a, b) => instanteBaixado(b.baixadoEm) - instanteBaixado(a.baixadoEm));
  }
  return lerIndiceLocal();
}

const gravarIndice = async (lista: BoletimCeasa[]) => {
  const texto = JSON.stringify(lista);
  let gravouNuvem = false;
  try {
    gravouNuvem = await kvSet(CHAVE_INDICE, texto);
  } catch {
    gravouNuvem = false;
  }
  try {
    gravouNuvem = await gravarIndiceCeasaBlob(texto) || gravouNuvem;
  } catch {
    /* o Redis ainda pode ter salvo o índice */
  }
  if (!process.env.VERCEL) {
    mkdirSync(PASTA_LOCAL(), { recursive: true });
    writeFileSync(indiceLocal(), texto, 'utf8');
  }
  if (process.env.VERCEL && !gravouNuvem) {
    throw new Error('Não consegui registrar os boletins na nuvem.');
  }
};

const partesFortaleza = () => {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date());
  const valor = (tipo: string) => partes.find(parte => parte.type === tipo)?.value || '';
  return {
    dia: `${valor('year')}-${valor('month')}-${valor('day')}`,
    hora: `${valor('hour')}:${valor('minute')}`
  };
};

const baixarPdfOficial = async (url: string) => {
  const resposta = await fetch(url, {
    headers: { 'User-Agent': 'RM-Sistema-Gestao/1.0' },
    cache: 'no-store',
    signal: AbortSignal.timeout(25000)
  });
  if (!resposta.ok) throw new Error(`A CEASA respondeu ${resposta.status} ao baixar o boletim.`);
  const buffer = Buffer.from(await resposta.arrayBuffer());
  if (buffer.length < 20 || buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error('O link da CEASA não devolveu um PDF.');
  }
  return buffer;
};

const salvarPdf = async (id: string, buffer: Buffer) => {
  if (!process.env.VERCEL) {
    mkdirSync(PASTA_LOCAL(), { recursive: true });
    writeFileSync(path.join(PASTA_LOCAL(), `${id}.pdf`), new Uint8Array(buffer));
  }
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await gravarAnexoBytes(id, buffer);
    return;
  }
  if (process.env.VERCEL) throw new Error('Nuvem de arquivo sem configuração (BLOB_READ_WRITE_TOKEN).');
};

export async function lerPdfSalvo(id: string) {
  const local = path.join(PASTA_LOCAL(), `${id}.pdf`);
  if (!process.env.VERCEL && existsSync(local)) return readFileSync(local);
  return baixarBufferAnexo(id);
}

const dataNoTexto = (texto: string) => {
  const achado = texto.match(/\b(\d{2}\/\d{2}\/\d{4})\b/);
  return achado ? achado[1] : '';
};

const instanteBaixado = (valor: string) => {
  const achado = String(valor || '').match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (!achado) return 0;
  const [, dia, mes, ano, hora = '00', minuto = '00'] = achado;
  const instante = new Date(`${ano}-${mes}-${dia}T${hora}:${minuto}:00-03:00`).getTime();
  return Number.isFinite(instante) ? instante : 0;
};

const removerPdfLocal = (id: string) => {
  try {
    unlinkSync(path.join(PASTA_LOCAL(), `${id}.pdf`));
  } catch {
    /* arquivo local já removido ou inexistente */
  }
};

const limparBoletinsExpirados = async (lista: BoletimCeasa[], agora = Date.now()) => {
  const manter: BoletimCeasa[] = [];
  const expirados: BoletimCeasa[] = [];
  lista.forEach(boletim => {
    const baixadoEm = instanteBaixado(boletim.baixadoEm);
    (baixadoEm > 0 && agora - baixadoEm < RETENCAO_MS ? manter : expirados).push(boletim);
  });

  const idsEmUso = new Set(manter.flatMap(boletim => [boletim.frutasId, boletim.hortalicasId]));
  const idsParaApagar = new Set(expirados.flatMap(boletim => [boletim.frutasId, boletim.hortalicasId]).filter(id => id && !idsEmUso.has(id)));
  await Promise.all(Array.from(idsParaApagar, async id => {
    if (!process.env.VERCEL) removerPdfLocal(id);
    await apagarAnexo(id);
  }));
  return { boletins: manter, alterado: expirados.length > 0 };
};

type DocPdf = {
  numPages: number;
  getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str?: string; transform?: number[] }[] }> }>;
  destroy: () => Promise<void>;
};

export async function textoDoPdf(buffer: Buffer, maxPaginas: number) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs') as {
    getDocument: (opts: unknown) => { promise: Promise<DocPdf> };
  };
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer), useSystemFonts: true }).promise;
  const total = doc.numPages;
  const limite = Math.min(total, maxPaginas);
  const paginas: string[] = [];
  for (let numero = 1; numero <= limite; numero++) {
    const pagina = await doc.getPage(numero);
    const conteudo = await pagina.getTextContent();
    const linhas: { y: number; partes: { x: number; texto: string }[] }[] = [];
    for (const item of conteudo.items) {
      const texto = String(item.str || '').trim();
      if (!texto) continue;
      const x = item.transform?.[4] || 0;
      const y = item.transform?.[5] || 0;
      const ultima = linhas[linhas.length - 1];
      if (!ultima || Math.abs(ultima.y - y) > 2.5) linhas.push({ y, partes: [{ x, texto }] });
      else ultima.partes.push({ x, texto });
    }
    paginas.push(linhas.map(linha => linha.partes.sort((a, b) => a.x - b.x).map(parte => parte.texto).join(' ')).join('\n'));
  }
  await doc.destroy();
  return { texto: paginas.join('\n'), paginas: total };
}

export async function buscarBoletinsCeasa() {
  const [hortalicas, frutas] = await Promise.all([
    baixarPdfOficial(LINK_HORTALICAS_CEASA),
    baixarPdfOficial(LINK_FRUTAS_CEASA)
  ]);
  const lidoHort = await textoDoPdf(hortalicas, 2);
  const lidoFrutas = await textoDoPdf(frutas, 2);
  const quando = partesFortaleza();
  const dataBoletim = dataNoTexto(lidoFrutas.texto) || dataNoTexto(lidoHort.texto) || quando.dia.split('-').reverse().join('/');
  const id = quando.dia;
  const frutasId = `ceasa-frutas-${id}`;
  const hortalicasId = `ceasa-hortalicas-${id}`;
  await salvarPdf(frutasId, frutas);
  await salvarPdf(hortalicasId, hortalicas);
  const registro: BoletimCeasa = {
    id,
    dataBoletim,
    baixadoEm: `${quando.dia.split('-').reverse().join('/')} ${quando.hora}`,
    frutasId,
    hortalicasId,
    frutasNome: 'frutas_tia.pdf',
    hortalicasNome: 'hortalicas_tia.pdf'
  };
  const atuais = await listarBoletins();
  const listaAtualizada = [registro, ...atuais.filter(item => item.id !== id)];
  const retencao = await limparBoletinsExpirados(listaAtualizada);
  await gravarIndice(retencao.boletins);
  return registro;
}

const numero = (valor: unknown) => {
  if (typeof valor === 'number' && Number.isFinite(valor)) return Math.round(valor * 100) / 100;
  if (typeof valor === 'string') {
    const limpo = valor.replace(/R\$\s*/gi, '').trim();
    const normalizado = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
    const n = Number(normalizado);
    if (Number.isFinite(n)) return Math.round(n * 100) / 100;
  }
  return null;
};

const itensDoJson = (bruto: unknown): ItemConciliacaoCeasa[] => {
  const lista = Array.isArray(bruto)
    ? bruto
    : bruto && typeof bruto === 'object' && Array.isArray((bruto as { itens?: unknown }).itens)
      ? (bruto as { itens: unknown[] }).itens
      : [];
  return lista.flatMap(item => {
    if (!item || typeof item !== 'object') return [];
    const linha = item as Record<string, unknown>;
    const nome = String(linha.nome_produto || linha.produto || '').trim();
    if (nome.length < 2) return [];
    return [{
      nome_produto: nome,
      preco_quilo_nota: numero(linha.preco_quilo_nota),
      preco_quilo_ceasa: numero(linha.preco_quilo_ceasa),
      diferenca_valores: numero(linha.diferenca_valores)
    }];
  });
};

const textoJson = (conteudo: string) => {
  const limpo = conteudo.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  const objeto = limpo.indexOf('{');
  const lista = limpo.indexOf('[');
  const inicio = objeto >= 0 && (lista < 0 || objeto < lista) ? objeto : lista;
  if (inicio < 0) throw new Error('O Grok não devolveu o JSON da conciliação.');
  return JSON.parse(limpo.slice(inicio)) as unknown;
};

export async function conciliarComGrok(boletimId: string, notaBase64: string) {
  const chave = process.env.XAI_API_KEY || '';
  if (!chave) throw new Error('Falta a chave XAI_API_KEY no servidor para chamar o Grok.');
  const nota = Buffer.from(notaBase64, 'base64');
  if (nota.length < 20 || nota.subarray(0, 4).toString() !== '%PDF') throw new Error('Envie o PDF da nota fiscal.');
  const boletins = await listarBoletins();
  const boletim = boletins.find(item => item.id === boletimId) || boletins[0];
  if (!boletim) throw new Error('Ainda não há boletim da CEASA nesta aba. Busque os arquivos antes de conciliar.');
  const [arquivoNota, arquivoHort, arquivoFrutas] = await Promise.all([
    Promise.resolve(nota),
    lerPdfSalvo(boletim.hortalicasId),
    lerPdfSalvo(boletim.frutasId)
  ]);
  if (!arquivoHort || !arquivoFrutas) throw new Error('Não encontrei os PDFs deste boletim. Busque de novo.');
  const lidaNota = await textoDoPdf(arquivoNota, 2);
  const lidaHort = await textoDoPdf(arquivoHort, 3);
  const lidaFrutas = await textoDoPdf(arquivoFrutas, 3);
  const modelo = process.env.XAI_MODEL || 'grok-4';
  const resposta = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${chave}`,
      'Content-Type': 'application/json'
    },
    signal: AbortSignal.timeout(55000),
    body: JSON.stringify({
      model: modelo,
      temperature: 0,
      messages: [
        { role: 'system', content: PROMPT_CONCILIACAO_CEASA },
        {
          role: 'user',
          content: [
            'Cruze os três documentos abaixo seguindo as regras do sistema.',
            'diferenca_valores = preco_quilo_nota - preco_quilo_ceasa.',
            'Devolva somente JSON no formato {"itens":[{"nome_produto":"","preco_quilo_nota":0,"preco_quilo_ceasa":0,"diferenca_valores":0}]}.',
            '',
            '--- NOTA FISCAL ---',
            lidaNota.texto.slice(0, 24000),
            '',
            '--- PDF DE HORTALIÇAS DA CEASA ---',
            lidaHort.texto.slice(0, 24000),
            '',
            '--- PDF DE FRUTAS DA CEASA ---',
            lidaFrutas.texto.slice(0, 24000)
          ].join('\n')
        }
      ]
    })
  });
  const dados = await resposta.json().catch(() => ({})) as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
  };
  if (!resposta.ok) throw new Error(dados.error?.message || `O Grok respondeu ${resposta.status}.`);
  const conteudo = dados.choices?.[0]?.message?.content || '';
  const itens = itensDoJson(textoJson(conteudo));
  if (!itens.length) throw new Error('O Grok não encontrou produtos para comparar.');
  return {
    itens,
    boletim,
    avisoNota: lidaNota.paginas > 2 ? `A nota tem ${lidaNota.paginas} páginas. Usei só as 2 primeiras.` : ''
  };
}

const buscaDaUrl = (url: string) => {
  const texto = url.startsWith('http') ? url : `http://localhost${url.startsWith('/') ? '' : '/'}${url}`;
  return new URL(texto).searchParams;
};

export async function responderCeasa(entrada: EntradaCeasa): Promise<RespostaCeasa> {
  try {
    const metodo = entrada.method.toUpperCase();
    const params = buscaDaUrl(entrada.url || '');
    const corpo = (entrada.body && typeof entrada.body === 'object' ? entrada.body : {}) as { acao?: string; boletimId?: string; nota?: string };
    const acao = String(corpo.acao || params.get('acao') || '').trim();

    if (metodo === 'GET' && acao === 'arquivo') {
      const id = String(params.get('id') || '').trim();
      const arquivo = id ? await lerPdfSalvo(id) : null;
      if (!arquivo) return { tipo: 'json', status: 404, corpo: { erro: 'PDF não encontrado.' } };
      const nome = String(params.get('nome') || 'boletim.pdf').replace(/[^\w.\-]/g, '_');
      return { tipo: 'pdf', status: 200, corpo: arquivo, nome };
    }

    if (metodo === 'GET' && acao === 'buscar') {
      const cron = entrada.headers['x-vercel-cron'] === '1' || Boolean(entrada.headers['x-vercel-cron-schedule']);
      if (!cron) return { tipo: 'json', status: 405, corpo: { erro: 'A busca automática só roda no horário programado.' } };
      const hoje = partesFortaleza().dia;
      const diaSemana = new Date(`${hoje}T12:00:00-03:00`).getUTCDay();
      const atuais = await listarBoletins();
      const retencao = await limparBoletinsExpirados(atuais);
      if (retencao.alterado) await gravarIndice(retencao.boletins);
      if (diaSemana !== 2 && diaSemana !== 5) {
        return { tipo: 'json', status: 200, corpo: { ok: true, limpeza: true, boletins: retencao.boletins } };
      }
      const registro = await buscarBoletinsCeasa();
      return { tipo: 'json', status: 200, corpo: { ok: true, boletim: registro } };
    }

    if (metodo === 'GET') {
      const boletins = await listarBoletins();
      return { tipo: 'json', status: 200, corpo: { boletins, frutas: LINK_FRUTAS_CEASA, hortalicas: LINK_HORTALICAS_CEASA } };
    }

    if (metodo === 'POST' && acao === 'buscar') {
      const registro = await buscarBoletinsCeasa();
      return { tipo: 'json', status: 200, corpo: { ok: true, boletim: registro, boletins: await listarBoletins() } };
    }

    if (metodo === 'POST' && acao === 'conciliar') {
      const nota = String(corpo.nota || '');
      if (!nota) return { tipo: 'json', status: 400, corpo: { erro: 'Anexe o PDF da nota fiscal.' } };
      const resultado = await conciliarComGrok(String(corpo.boletimId || ''), nota);
      return { tipo: 'json', status: 200, corpo: resultado };
    }

    return { tipo: 'json', status: 405, corpo: { erro: 'Método não permitido.' } };
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : 'Falha ao falar com a CEASA.';
    return { tipo: 'json', status: 500, corpo: { erro: mensagem } };
  }
}
