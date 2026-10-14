import { createWorker, PSM } from 'tesseract.js';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { montarLinhas, type LinhaPdf } from './parserConciliacao';

GlobalWorkerOptions.workerSrc = workerUrl;

type ItemTexto = { str?: string; transform?: number[]; fontName?: string };
type PalavraOcr = { text?: string; confidence?: number; bbox?: { x0: number; y0: number; x1: number; y1: number } };
type BlocoOcr = { paragraphs?: { lines?: { words?: PalavraOcr[] }[] }[] };
type WorkerOcr = Awaited<ReturnType<typeof createWorker>>;

export function arquivoEhImagem(arquivo: File) {
  return arquivo.type.startsWith('image/') || /\.(jpe?g|png|webp|bmp)$/i.test(arquivo.name);
}

export async function lerConteudoDoPdf(arquivo: ArrayBuffer): Promise<{ paginas: number; itens: { pagina: number; texto: string; x: number; y: number }[]; linhas: LinhaPdf[] }> {
  const documento = await getDocument({ data: new Uint8Array(arquivo), useSystemFonts: true }).promise;
  const total = documento.numPages;
  const itens: { pagina: number; texto: string; x: number; y: number }[] = [];
  const linhas: LinhaPdf[] = [];
  try {
    for (let pagina = 1; pagina <= total; pagina++) {
      const folha = await documento.getPage(pagina);
      const conteudo = await folha.getTextContent();
      const palavras = (conteudo.items as ItemTexto[])
        .filter(item => item.str?.trim() && item.transform)
        .map(item => ({
          texto: String(item.str),
          x: item.transform?.[4] || 0,
          y: item.transform?.[5] || 0,
          fonte: item.fontName
        }));
      palavras.forEach(item => itens.push({ pagina, texto: item.texto, x: item.x, y: item.y }));
      linhas.push(...montarLinhas(pagina, palavras));
    }
  } finally {
    await documento.destroy();
  }
  return { paginas: total, itens, linhas };
}

export async function lerLinhasDoPdf(arquivo: ArrayBuffer): Promise<LinhaPdf[]> {
  return (await lerConteudoDoPdf(arquivo)).linhas;
}

function linhasDaOcr(palavras: PalavraOcr[], altura: number, pagina: number) {
  const uteis = palavras.filter(palavra => palavra.text?.trim() && palavra.bbox && (palavra.confidence ?? 0) >= 20);
  const alturas = uteis
    .map(palavra => (palavra.bbox?.y1 || 0) - (palavra.bbox?.y0 || 0))
    .filter(valor => valor > 0)
    .sort((a, b) => a - b);
  const mediana = alturas[Math.floor(alturas.length / 2)] || 14;
  const itens = uteis.map(palavra => ({
    texto: String(palavra.text).trim(),
    x: palavra.bbox?.x0 || 0,
    y: altura - (palavra.bbox?.y1 || 0)
  }));
  return montarLinhas(pagina, itens, Math.max(5, Math.round(mediana * 0.45)));
}

function palavrasDoOcr(blocos: BlocoOcr[] | null | undefined) {
  return (blocos || []).flatMap(bloco =>
    (bloco.paragraphs || []).flatMap(paragrafo =>
      (paragrafo.lines || []).flatMap(linha => linha.words || [])
    )
  );
}

function abrirImagem(blob: Blob) {
  const url = URL.createObjectURL(blob);
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const imagem = new Image();
    imagem.onload = () => {
      URL.revokeObjectURL(url);
      resolve(imagem);
    };
    imagem.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não consegui abrir a foto.'));
    };
    imagem.src = url;
  });
}

function ampliar(origem: CanvasImageSource, largura: number, altura: number) {
  const maior = Math.max(largura, altura);
  const escala = maior >= 2000 ? 1 : Math.min(3, 2200 / maior);
  const tela = document.createElement('canvas');
  tela.width = Math.max(1, Math.round(largura * escala));
  tela.height = Math.max(1, Math.round(altura * escala));
  const contexto = tela.getContext('2d', { willReadFrequently: true });
  if (!contexto) throw new Error('Não consegui preparar a foto para leitura.');
  contexto.drawImage(origem, 0, 0, tela.width, tela.height);
  const pixels = contexto.getImageData(0, 0, tela.width, tela.height);
  const dados = pixels.data;
  for (let i = 0; i < dados.length; i += 4) {
    const luz = dados[i] * 0.299 + dados[i + 1] * 0.587 + dados[i + 2] * 0.114;
    const valor = Math.max(0, Math.min(255, (luz - 128) * 1.35 + 128));
    dados[i] = valor;
    dados[i + 1] = valor;
    dados[i + 2] = valor;
  }
  contexto.putImageData(pixels, 0, 0);
  return tela;
}

function recortar(tela: HTMLCanvasElement, x: number, largura: number) {
  const pedaco = document.createElement('canvas');
  pedaco.width = Math.max(1, largura);
  pedaco.height = tela.height;
  const contexto = pedaco.getContext('2d');
  if (!contexto) throw new Error('Não consegui separar as colunas da foto.');
  contexto.drawImage(tela, x, 0, largura, tela.height, 0, 0, largura, tela.height);
  return pedaco;
}

function divisoriaVertical(tela: HTMLCanvasElement) {
  const contexto = tela.getContext('2d', { willReadFrequently: true });
  if (!contexto || tela.width < 500) return null;
  const pixels = contexto.getImageData(0, 0, tela.width, tela.height);
  const dados = pixels.data;
  const passo = Math.max(1, Math.floor(tela.height / 350));
  const tinta = new Float64Array(tela.width);
  for (let x = 0; x < tela.width; x++) {
    let escuras = 0;
    let amostras = 0;
    for (let y = 0; y < tela.height; y += passo) {
      const i = (y * tela.width + x) * 4;
      amostras++;
      if (dados[i] < 150) escuras++;
    }
    tinta[x] = escuras / amostras;
  }
  const raio = Math.max(4, Math.round(tela.width * 0.008));
  let melhorX = 0;
  let melhor = 1;
  const inicio = Math.floor(tela.width * 0.32);
  const fim = Math.floor(tela.width * 0.68);
  for (let x = inicio; x <= fim; x++) {
    let soma = 0;
    let quantidade = 0;
    for (let k = x - raio; k <= x + raio; k++) {
      if (k < 0 || k >= tela.width) continue;
      soma += tinta[k];
      quantidade++;
    }
    const media = soma / quantidade;
    if (media < melhor) {
      melhor = media;
      melhorX = x;
    }
  }
  const afastado = Math.round(tela.width * 0.12);
  const lado = Math.max(tinta[Math.max(0, melhorX - afastado)], tinta[Math.min(tela.width - 1, melhorX + afastado)]);
  if (melhor > 0.07 || melhor > lado * 0.45) return null;
  return melhorX;
}

async function lerTela(worker: WorkerOcr, tela: HTMLCanvasElement, pagina: number) {
  const resultado = await worker.recognize(tela, {}, { blocks: true });
  const palavras = palavrasDoOcr((resultado.data as { blocks?: BlocoOcr[] | null }).blocks);
  return linhasDaOcr(palavras, tela.height, pagina);
}

async function reconhecerTelas(telas: HTMLCanvasElement[]) {
  const worker = await createWorker('por');
  const linhas: LinhaPdf[] = [];
  try {
    await worker.setParameters({ user_defined_dpi: '300' });
    let pagina = 1;
    for (const tela of telas) {
      const corte = divisoriaVertical(tela);
      if (corte == null) {
        await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
        linhas.push(...await lerTela(worker, tela, pagina));
        pagina += 1;
        continue;
      }
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_COLUMN });
      linhas.push(...await lerTela(worker, recortar(tela, 0, corte), pagina));
      linhas.push(...await lerTela(worker, recortar(tela, corte, tela.width - corte), pagina + 1));
      pagina += 2;
    }
  } finally {
    await worker.terminate();
  }
  return linhas;
}

async function paginasDoPdfComoImagem(arquivo: ArrayBuffer) {
  const documento = await getDocument({ data: new Uint8Array(arquivo), useSystemFonts: true }).promise;
  const paginas: HTMLCanvasElement[] = [];
  try {
    for (let pagina = 1; pagina <= documento.numPages; pagina++) {
      const folha = await documento.getPage(pagina);
      const vista = folha.getViewport({ scale: 2 });
      const tela = document.createElement('canvas');
      tela.width = Math.floor(vista.width);
      tela.height = Math.floor(vista.height);
      const contexto = tela.getContext('2d');
      if (!contexto) throw new Error('Não consegui preparar a página para leitura da foto.');
      await folha.render({ canvasContext: contexto, viewport: vista }).promise;
      paginas.push(ampliar(tela, tela.width, tela.height));
    }
  } finally {
    await documento.destroy();
  }
  return paginas;
}

export async function lerLinhasDoArquivo(arquivo: File): Promise<{ linhas: LinhaPdf[]; usouFoto: boolean }> {
  if (arquivoEhImagem(arquivo)) {
    const blob = new Blob([await arquivo.arrayBuffer()], { type: arquivo.type || 'image/jpeg' });
    const imagem = await abrirImagem(blob);
    const tela = ampliar(imagem, imagem.naturalWidth || imagem.width, imagem.naturalHeight || imagem.height);
    return { linhas: await reconhecerTelas([tela]), usouFoto: true };
  }
  const buffer = await arquivo.arrayBuffer();
  const linhas = await lerLinhasDoPdf(buffer);
  const texto = linhas.map(linha => linha.texto).join(' ').trim();
  if (texto.length >= 180) return { linhas, usouFoto: false };
  const lidas = await reconhecerTelas(await paginasDoPdfComoImagem(buffer));
  return { linhas: lidas.length ? lidas : linhas, usouFoto: true };
}
