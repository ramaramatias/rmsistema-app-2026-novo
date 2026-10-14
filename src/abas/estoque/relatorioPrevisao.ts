import { rotuloMes, type MesId } from './CalendarioMes';

export type LinhaPrevisao = {
  codigo: string;
  nome: string;
  estoque: string;
  saidas: string[];
  media: string;
  consumo: string;
  previsao: string;
  tom: 'vermelho' | 'ambar' | 'verde' | 'neutro';
};

const cortar = (contexto: CanvasRenderingContext2D, texto: string, largura: number) => {
  if (contexto.measureText(texto).width <= largura) return texto;
  let curto = texto;
  while (curto.length > 1 && contexto.measureText(`${curto}…`).width > largura) curto = curto.slice(0, -1);
  return `${curto}…`;
};

const corTom = (tom: LinhaPrevisao['tom']) => {
  if (tom === 'vermelho') return '#dc2626';
  if (tom === 'ambar') return '#d97706';
  if (tom === 'verde') return '#16a34a';
  return '#64748b';
};

export async function enviarImagemWhatsappPrevisao(meses: MesId[], linhas: LinhaPrevisao[]) {
  if (!linhas.length) throw new Error('Não há produtos no relatório.');
  if (typeof document === 'undefined' || typeof window === 'undefined' || typeof navigator === 'undefined') {
    throw new Error('Este ambiente não permite exportar a imagem do estoque.');
  }

  const blob = await gerarImagemPrevisao(meses, linhas);
  const nome = 'previsao-estoque.png';
  const arquivo = new File([blob], nome, { type: 'image/png' });
  const texto = [
    'CONTROLE E PREVISÃO DE ESTOQUE',
    'O relatório completo está na imagem.'
  ].join('\n');
  const compartilhar = { files: [arquivo], title: 'Previsão de estoque', text: texto };

  if (typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare(compartilhar))) {
    try {
      await navigator.share(compartilhar);
      return 'enviado' as const;
    } catch (erro) {
      if (erro instanceof DOMException && erro.name === 'AbortError') return 'cancelado' as const;
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  const aviso = `${texto}\n\nA imagem foi baixada neste computador. Anexe o arquivo ${nome} nesta conversa.`;
  const janela = window.open(`https://wa.me/?text=${encodeURIComponent(aviso)}`, '_blank', 'noopener,noreferrer');
  return janela ? 'baixado' as const : 'bloqueado' as const;
}

async function gerarImagemPrevisao(meses: MesId[], linhas: LinhaPrevisao[]) {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error('Não foi possível gerar o relatório fora do navegador.');
  }
  const colunas = [
    { titulo: 'Código', largura: 110 },
    { titulo: 'Produto', largura: 250 },
    { titulo: 'Estoque', largura: 110 },
    ...meses.map(id => ({ titulo: rotuloMes(id), largura: 108 })),
    { titulo: 'Média', largura: 100 },
    { titulo: 'Consumo/dia', largura: 110 },
    { titulo: 'Previsão', largura: 120 }
  ];
  const largura = 56 + colunas.reduce((soma, coluna) => soma + coluna.largura, 0);
  const alturaLinha = 36;
  const yTabela = 92;
  const altura = yTabela + 40 + linhas.length * alturaLinha + 36;
  const tela = document.createElement('canvas');
  const escala = 2;
  tela.width = largura * escala;
  tela.height = altura * escala;
  const contexto = tela.getContext('2d');
  if (!contexto) throw new Error('Não consegui montar a imagem do relatório.');
  contexto.scale(escala, escala);
  contexto.fillStyle = '#eef2f6';
  contexto.fillRect(0, 0, largura, altura);

  contexto.fillStyle = '#0a5c56';
  contexto.fillRect(0, 0, largura, 72);
  contexto.fillStyle = '#ffffff';
  contexto.font = '700 22px Arial';
  contexto.textAlign = 'left';
  contexto.textBaseline = 'middle';
  contexto.fillText('CONTROLE E PREVISÃO DE ESTOQUE', 28, 30);
  contexto.font = '14px Arial';
  contexto.fillStyle = '#d1fae5';
  const quando = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  contexto.fillText(`RM Sistema  •  ${quando}`, 28, 54);

  let x = 28;
  contexto.fillStyle = '#0f3d45';
  contexto.fillRect(28, yTabela, largura - 56, 40);
  contexto.fillStyle = '#ffffff';
  contexto.font = '700 12px Arial';
  contexto.textAlign = 'center';
  colunas.forEach(coluna => {
    contexto.fillText(cortar(contexto, coluna.titulo, coluna.largura - 12), x + coluna.largura / 2, yTabela + 20);
    x += coluna.largura;
  });

  linhas.forEach((linha, indice) => {
    const y = yTabela + 40 + indice * alturaLinha;
    contexto.fillStyle = indice % 2 === 0 ? '#ffffff' : '#f8fafc';
    contexto.fillRect(28, y, largura - 56, alturaLinha);
    contexto.strokeStyle = '#e2e8f0';
    contexto.beginPath();
    contexto.moveTo(28, y + alturaLinha);
    contexto.lineTo(largura - 28, y + alturaLinha);
    contexto.stroke();
    const valores = [linha.codigo, linha.nome, linha.estoque, ...linha.saidas, linha.media, linha.consumo, linha.previsao];
    let colunaX = 28;
    valores.forEach((valor, ordem) => {
      const coluna = colunas[ordem];
      const ultima = ordem === valores.length - 1;
      contexto.textAlign = ordem <= 1 ? 'left' : 'center';
      const textoX = ordem <= 1 ? colunaX + 8 : colunaX + coluna.largura / 2;
      if (ultima) {
        const texto = valor;
        contexto.font = '700 12px Arial';
        const caixa = Math.min(coluna.largura - 16, contexto.measureText(texto).width + 16);
        const cx = colunaX + (coluna.largura - caixa) / 2;
        contexto.fillStyle = corTom(linha.tom);
        contexto.beginPath();
        contexto.roundRect(cx, y + 7, caixa, 22, 6);
        contexto.fill();
        contexto.fillStyle = '#ffffff';
        contexto.textAlign = 'center';
        contexto.fillText(texto, colunaX + coluna.largura / 2, y + alturaLinha / 2);
      } else {
        contexto.fillStyle = '#0f172a';
        contexto.font = ordem === 0 ? '700 13px Arial' : '13px Arial';
        contexto.fillText(cortar(contexto, valor, coluna.largura - 14), textoX, y + alturaLinha / 2);
      }
      colunaX += coluna.largura;
    });
  });

  return new Promise<Blob>((resolve, reject) => {
    tela.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Não consegui montar a imagem do relatório.'));
    }, 'image/png');
  });
}
