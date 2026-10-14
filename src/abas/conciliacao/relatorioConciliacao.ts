import * as XLSX from 'xlsx';
import { montarArquivoPdf } from '../../util/pdf.ts';
import {
  calcularLinha,
  calcularTotais,
  formatarMoeda,
  formatarNumero,
  formatarPercentual
} from './parserConciliacao.ts';

export type MarcaRelatorio = 'nenhuma' | 'vermelha' | 'verde';

export type LinhaRelatorio = {
  produto: string;
  quantidade: number;
  precoNf: number;
  precoCeasa: number | null;
  semPreco: boolean;
  detalhe: string;
  destaque?: boolean;
  unidade?: string;
  marca?: MarcaRelatorio;
  justificativa?: string;
};

export type CabecalhoRelatorio = {
  empresa: string;
  numeroNf: string;
  dataNf: string;
  dataCeasa: string;
};

const escapar = (valor: string) =>
  valor.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function subtituloRelatorio(cabecalho: CabecalhoRelatorio) {
  const nota = [cabecalho.numeroNf, cabecalho.dataNf].filter(Boolean).join(' ');
  const ceasa = cabecalho.dataCeasa ? `Data CEASA: ${cabecalho.dataCeasa}` : 'CEASA';
  const empresa = cabecalho.empresa || '—';
  return nota ? `Empresa: ${empresa} | ${nota} | ${ceasa}` : `Empresa: ${empresa} | ${ceasa}`;
}

export function formatarDiferencaSinal(valor: number) {
  const corpo = Math.abs(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (valor > 0) return `+${corpo}%`;
  if (valor < 0) return `-${corpo}%`;
  return `${corpo}%`;
}

export function marcaDaLinha(linha: LinhaRelatorio): MarcaRelatorio {
  if (linha.marca === 'vermelha' || linha.marca === 'verde') return linha.marca;
  return linha.destaque ? 'vermelha' : 'nenhuma';
}

export function rotuloJustificativa(produto: string, diferenca: number | null) {
  const nome = (produto || '(sem nome)').trim().toUpperCase();
  if (diferenca == null) return `${nome}:`;
  return `${nome} (${formatarDiferencaSinal(diferenca)}):`;
}

export function itensJustificativa(linhas: LinhaRelatorio[]) {
  return linhas.flatMap(linha => {
    const marca = marcaDaLinha(linha);
    if (marca === 'nenhuma') return [];
    const conta = calcularLinha(linha.quantidade, linha.precoNf, linha.precoCeasa);
    return [{
      marca,
      rotulo: rotuloJustificativa(linha.produto, conta.diferenca),
      texto: (linha.justificativa || '').trim()
    }];
  });
}

export function baixarExcelConciliacao(cabecalho: CabecalhoRelatorio, linhas: LinhaRelatorio[]) {
  const totais = calcularTotais(linhas);
  const aoa: (string | number)[][] = [
    ['RELATÓRIO DE COMPARAÇÃO DE PREÇOS - NF x CEASA'],
    [subtituloRelatorio(cabecalho)],
    [],
    ['Produto', 'kg/unid\nQuantidade', 'Preço NF', 'Preço CEASA', 'Total NF', 'Total CEASA', 'Diferença %', 'Marca', 'Justificativa', 'Origem do preço']
  ];
  linhas.forEach(linha => {
    const conta = calcularLinha(linha.quantidade, linha.precoNf, linha.precoCeasa);
    const marca = marcaDaLinha(linha);
    aoa.push([
      linha.produto,
      linha.quantidade,
      linha.precoNf,
      linha.precoCeasa ?? 'Sem preço na tabela',
      conta.totalNf,
      conta.totalCeasa ?? '',
      conta.diferenca == null ? '' : Number(conta.diferenca.toFixed(2)),
      marca === 'vermelha' ? 'Distorção' : marca === 'verde' ? 'Preço excelente' : '',
      linha.justificativa || '',
      linha.detalhe
    ]);
  });
  aoa.push([]);
  aoa.push(['TOTAL GERAL', '', '', '', totais.totalNf, totais.totalCeasa]);
  aoa.push(['Margem da compra %', totais.margemPct == null ? '' : Number(totais.margemPct.toFixed(2))]);
  aoa.push(['Margem da compra R$', totais.margemValor]);
  const folha = XLSX.utils.aoa_to_sheet(aoa);
  folha['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 24 }, { wch: 14 }, { wch: 48 }];
  const livro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(livro, folha, 'NF x CEASA');
  XLSX.writeFile(livro, 'comparacao-nf-ceasa.xlsx');
}

export function htmlImpressaoConciliacao(cabecalho: CabecalhoRelatorio, linhas: LinhaRelatorio[]) {
  const totais = calcularTotais(linhas);
  const corpo = linhas.map((linha, indice) => {
    const conta = calcularLinha(linha.quantidade, linha.precoNf, linha.precoCeasa);
    const marca = marcaDaLinha(linha);
    const fundo = marca === 'vermelha' ? '#fecaca' : marca === 'verde' ? '#dcfce7' : (indice % 2 === 0 ? '#ffffff' : '#eef3f8');
    const ceasa = linha.precoCeasa == null ? 'Sem preço na tabela' : formatarMoeda(linha.precoCeasa);
    return `<tr style="background:${fundo}">
      <td>${escapar(linha.produto)}</td>
      <td class="num">${formatarNumero(linha.quantidade)}</td>
      <td class="num">${formatarMoeda(linha.precoNf)}</td>
      <td class="num">${escapar(ceasa)}</td>
      <td class="num">${formatarMoeda(conta.totalNf)}</td>
      <td class="num">${conta.totalCeasa == null ? '—' : formatarMoeda(conta.totalCeasa)}</td>
      <td class="num">${conta.diferenca == null ? '—' : formatarDiferencaSinal(conta.diferenca)}</td>
    </tr>`;
  }).join('');
  const margem = totais.margemPct == null ? '—' : formatarPercentual(totais.margemPct);
  const tópicos = itensJustificativa(linhas).map(item => {
    const bolinha = item.marca === 'verde' ? '🟢' : '🔴';
    return `<li>${bolinha} <strong>${escapar(item.rotulo)}</strong> ${escapar(item.texto || '')}</li>`;
  }).join('');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Comparação de preços - NF x CEASA</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111; margin: 24px; background: #d7dde3; }
    .folha { background: #d7dde3; }
    h1 { font-size: 18px; text-align: center; margin: 0 0 6px; color: #1e4b7a; }
    p { text-align: center; color: #444; font-size: 12px; margin: 0 0 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; background: #fff; }
    th, td { border: 1px solid #94a3b8; padding: 7px 8px; }
    th { background: #1e4b7a; color: #fff; text-align: center; }
    td.num, th.num { text-align: right; }
    tr.total td { font-weight: 700; background: #f8fafc; }
    .indicadores { margin-top: 16px; width: 100%; }
    .indicadores th { background: #1e4b7a; }
    .verde { color: #15803d; font-weight: 700; }
    h2 { font-size: 13px; margin: 18px 0 8px; }
  </style>
</head>
<body>
  <h1>RELATÓRIO DE COMPARAÇÃO DE PREÇOS - NF x CEASA</h1>
  <p>${escapar(subtituloRelatorio(cabecalho))}</p>
  <table>
    <thead>
      <tr>
        <th>Produto</th>
        <th>kg/unid<br>Quantidade</th>
        <th>Preço NF</th>
        <th>Preço CEASA</th>
        <th>Total NF</th>
        <th>Total CEASA</th>
        <th>Diferença %</th>
      </tr>
    </thead>
    <tbody>
      ${corpo}
      <tr class="total">
        <td colspan="4">TOTAL GERAL</td>
        <td class="num">${formatarMoeda(totais.totalNf)}</td>
        <td class="num">${formatarMoeda(totais.totalCeasa)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>
  <table class="indicadores">
    <thead><tr><th colspan="3">QUADRO DE INDICADORES GLOBAIS</th></tr></thead>
    <tbody>
      <tr><td>Valor Total Pago (NF)</td><td class="num">${formatarMoeda(totais.totalNf)}</td><td>Custo real total documentado nas Notas Fiscais.</td></tr>
      <tr><td>Economia Potencial em Dinheiro</td><td class="num verde">${formatarMoeda(totais.margemValor)}</td><td>O valor exato em dinheiro que a instituição pagaria a mais em relação à CEASA.</td></tr>
      <tr><td>Diferença Média de Preço</td><td class="num">${margem}</td><td>O percentual médio que a Nota Fiscal ficou acima do preço de referência da CEASA.</td></tr>
    </tbody>
  </table>
  <h2>JUSTIFICATIVA DAS PRINCIPAIS DISTORÇÕES (EM TÓPICOS)</h2>
  ${tópicos ? `<ul>${tópicos}</ul>` : '<p style="text-align:left">Nenhum item marcado.</p>'}
</body>
</html>`;
}

export function imprimirConciliacao(cabecalho: CabecalhoRelatorio, linhas: LinhaRelatorio[]) {
  const janela = window.open('', '_blank', 'noopener,noreferrer');
  if (!janela) return false;
  janela.document.write(htmlImpressaoConciliacao(cabecalho, linhas));
  janela.document.close();
  janela.focus();
  janela.print();
  return true;
}

export function textoWhatsappConciliacao(cabecalho: CabecalhoRelatorio, linhas: LinhaRelatorio[], origem: string) {
  const totais = calcularTotais(linhas);
  const produtos = linhas.map(linha => {
    const conta = calcularLinha(linha.quantidade, linha.precoNf, linha.precoCeasa);
    return [
      linha.produto || '(sem nome)',
      `Quantidade (kg/unid): ${formatarNumero(linha.quantidade)}`,
      `Preço NF: ${formatarMoeda(linha.precoNf)}`,
      `Preço CEASA: ${linha.precoCeasa == null ? 'Sem preço na tabela' : formatarMoeda(linha.precoCeasa)}`,
      `Total NF: ${formatarMoeda(conta.totalNf)}`,
      `Total CEASA: ${conta.totalCeasa == null ? '—' : formatarMoeda(conta.totalCeasa)}`,
      `Diferença: ${conta.diferenca == null ? '—' : formatarDiferencaSinal(conta.diferenca)}`,
      linha.detalhe
    ].join('\n');
  }).join('\n\n');
  const margem = totais.margemPct == null ? '—' : formatarPercentual(totais.margemPct);
  return [
    'RELATÓRIO DE COMPARAÇÃO DE PREÇOS - NF x CEASA',
    subtituloRelatorio(cabecalho),
    `Preços lidos de: ${origem}`,
    '',
    produtos,
    '',
    'TOTAL GERAL',
    `Total NF: ${formatarMoeda(totais.totalNf)}`,
    `Total CEASA: ${formatarMoeda(totais.totalCeasa)}`,
    `Valor total pago (NF): ${formatarMoeda(totais.totalNf)}`,
    `Economia potencial: ${formatarMoeda(totais.margemValor)}`,
    `Diferença média de preço: ${margem}`,
    totais.incompleto ? 'A margem não inclui os produtos sem preço na tabela.' : ''
  ].filter(Boolean).join('\n');
}

export function enviarWhatsappConciliacao(cabecalho: CabecalhoRelatorio, linhas: LinhaRelatorio[], origem: string) {
  const texto = textoWhatsappConciliacao(cabecalho, linhas, origem);
  const janela = window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank', 'noopener,noreferrer');
  return Boolean(janela);
}

const textoPdfRelatorio = (valor: string) =>
  valor
    .replace(/\u00A0|\u202F/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, (caractere) => {
      const codigo = caractere.charCodeAt(0);
      if (codigo <= 255) return `\\${codigo.toString(8).padStart(3, '0')}`;
      return ' ';
    });

const cortarPdf = (valor: string, maximo: number) => {
  const limpo = valor.trim();
  if (limpo.length <= maximo) return limpo;
  return `${limpo.slice(0, maximo - 3)}...`;
};

export function gerarPdfConciliacao(cabecalho: CabecalhoRelatorio, linhas: LinhaRelatorio[]) {
  const largura = 842;
  const altura = 595;
  const totais = calcularTotais(linhas);
  const yTopo = altura - 76;
  const yMinimo = 36;
  const alturaLinha = 19;
  const reservaRodape = 84;
  const paginas: LinhaRelatorio[][] = [];
  let atual: LinhaRelatorio[] = [];
  let yLivre = yTopo - 36;

  linhas.forEach((linha, indice) => {
    const ultima = indice === linhas.length - 1;
    const limite = ultima ? yMinimo + reservaRodape : yMinimo;
    if (atual.length && yLivre - alturaLinha < limite) {
      paginas.push(atual);
      atual = [];
      yLivre = yTopo - 36;
    }
    atual.push(linha);
    yLivre -= alturaLinha;
  });
  if (!paginas.length && !atual.length) paginas.push([]);
  if (atual.length) paginas.push(atual);

  const desenharPagina = (itensPagina: LinhaRelatorio[], numero: number, totalPaginas: number) => {
    const comandos: string[] = [
      'BT', '/F1 16 Tf', '0.12 0.29 0.48 rg', `28 ${altura - 38} Td`, `(${textoPdfRelatorio('RELATÓRIO DE COMPARAÇÃO DE PREÇOS - NF x CEASA')}) Tj`, 'ET',
      '0 g', 'BT', '/F1 11 Tf', `1 0 0 1 28 ${altura - 56} Tm`, `(${textoPdfRelatorio(subtituloRelatorio(cabecalho))}) Tj`, 'ET'
    ];
    if (totalPaginas > 1) {
      comandos.push('BT', '/F1 10 Tf', `1 0 0 1 760 ${altura - 38} Tm`, `(${numero}/${totalPaginas}) Tj`, 'ET');
    }

    let y = yTopo;
    comandos.push('0.12 0.29 0.48 rg', `28 ${y - 18} 786 33 re`, 'f', '1 1 1 rg', 'BT', '/F1 10 Tf');
    const cabecalhos = [
      [32, 'Produto'],
      [270, 'Preço NF'],
      [345, 'Preço CEASA'],
      [440, 'Total NF'],
      [515, 'Total CEASA'],
      [600, 'Diferença %'],
      [690, 'Valor da nota']
    ] as const;
    cabecalhos.forEach(([x, titulo]) => comandos.push(`1 0 0 1 ${x} ${y - 4} Tm`, `(${textoPdfRelatorio(titulo)}) Tj`));
    comandos.push(
      `1 0 0 1 210 ${y + 2} Tm`, `(${textoPdfRelatorio('kg/unid')}) Tj`,
      `1 0 0 1 210 ${y - 10} Tm`, `(${textoPdfRelatorio('Quantidade')}) Tj`,
      'ET', '0 g'
    );
    y -= 34;

    itensPagina.forEach(linha => {
      const conta = calcularLinha(linha.quantidade, linha.precoNf, linha.precoCeasa);
      if (linha.destaque) comandos.push('0.996 0.886 0.886 rg', `28 ${y - 5} 786 19 re`, 'f', '0 g');
      const ceasa = linha.precoCeasa == null ? 'Sem preço' : formatarMoeda(linha.precoCeasa);
      const campos = [
        [32, cortarPdf(linha.produto || '(sem nome)', 28)],
        [210, formatarNumero(linha.quantidade)],
        [270, formatarMoeda(linha.precoNf)],
        [345, ceasa],
        [440, formatarMoeda(conta.totalNf)],
        [515, conta.totalCeasa == null ? '-' : formatarMoeda(conta.totalCeasa)],
        [600, conta.diferenca == null ? '-' : formatarPercentual(conta.diferenca)],
        [690, formatarMoeda(conta.totalNf)]
      ] as const;
      comandos.push('BT', '/F1 10 Tf');
      campos.forEach(([x, texto]) => comandos.push(`1 0 0 1 ${x} ${y} Tm`, `(${textoPdfRelatorio(texto)}) Tj`));
      comandos.push('ET');
      y -= alturaLinha;
    });

    if (numero === totalPaginas) {
      const margem = totais.margemPct == null ? '-' : formatarPercentual(totais.margemPct);
      comandos.push(
        '0.97 0.98 0.99 rg', `28 ${y - 5} 786 19 re`, 'f', '0 g',
        'BT', '/F1 10 Tf',
        `1 0 0 1 32 ${y} Tm`, '(TOTAL GERAL) Tj',
        `1 0 0 1 440 ${y} Tm`, `(${textoPdfRelatorio(formatarMoeda(totais.totalNf))}) Tj`,
        `1 0 0 1 515 ${y} Tm`, `(${textoPdfRelatorio(formatarMoeda(totais.totalCeasa))}) Tj`,
        `1 0 0 1 690 ${y} Tm`, `(${textoPdfRelatorio(formatarMoeda(totais.totalNf))}) Tj`,
        'ET'
      );
      y -= 28;
      comandos.push(
        '0.12 0.29 0.48 rg', `28 ${y - 5} 168 22 re`, 'f',
        '0.08 0.72 0.65 rg', `196 ${y - 5} 100 22 re`, 'f',
        '0.996 0.886 0.886 rg', `296 ${y - 5} 120 22 re`, 'f',
        '1 1 1 rg', 'BT', '/F1 11 Tf', `1 0 0 1 36 ${y} Tm`, '(Margem da Compra) Tj', 'ET',
        'BT', '/F1 11 Tf', `1 0 0 1 206 ${y} Tm`, `(${textoPdfRelatorio(margem)}) Tj`, 'ET',
        '0.6 0.1 0.15 rg', 'BT', '/F1 11 Tf', `1 0 0 1 306 ${y} Tm`, `(${textoPdfRelatorio(formatarMoeda(totais.margemValor))}) Tj`, 'ET', '0 g'
      );
    }
    return comandos.join('\n');
  };

  const streams = paginas.map((itensPagina, indice) => desenharPagina(itensPagina, indice + 1, paginas.length));
  return montarArquivoPdf(streams, largura, altura);
}

const colunasImagem = [
  { titulo: 'Produto', x: 36, largura: 250, direita: false, duplo: false },
  { titulo: 'Quantidade', x: 286, largura: 110, direita: true, duplo: true },
  { titulo: 'Preço NF', x: 396, largura: 118, direita: true, duplo: false },
  { titulo: 'Preço CEASA', x: 514, largura: 132, direita: true, duplo: false },
  { titulo: 'Total NF', x: 646, largura: 118, direita: true, duplo: false },
  { titulo: 'Total CEASA', x: 764, largura: 130, direita: true, duplo: false },
  { titulo: 'Diferença %', x: 894, largura: 130, direita: true, duplo: false }
] as const;

function cortarNoContexto(contexto: CanvasRenderingContext2D, texto: string, maximo: number) {
  if (contexto.measureText(texto).width <= maximo) return texto;
  let curto = texto.trim();
  while (curto.length > 1 && contexto.measureText(`${curto}…`).width > maximo) curto = curto.slice(0, -1);
  return `${curto}…`;
}

function quebrarTexto(contexto: CanvasRenderingContext2D, texto: string, maximo: number) {
  const palavras = texto.split(/\s+/).filter(Boolean);
  if (!palavras.length) return [''];
  const linhas: string[] = [];
  let atual = '';
  palavras.forEach(palavra => {
    const tenta = atual ? `${atual} ${palavra}` : palavra;
    if (contexto.measureText(tenta).width <= maximo) {
      atual = tenta;
      return;
    }
    if (atual) linhas.push(atual);
    atual = palavra;
  });
  if (atual) linhas.push(atual);
  return linhas;
}

function fundoMarca(marca: MarcaRelatorio, indice: number) {
  if (marca === 'vermelha') return '#fecaca';
  if (marca === 'verde') return '#dcfce7';
  return indice % 2 === 0 ? '#ffffff' : '#e8eef4';
}

export function gerarImagemConciliacao(
  cabecalho: CabecalhoRelatorio,
  linhas: LinhaRelatorio[],
  opcoes: { tipo?: 'image/png' | 'image/jpeg'; qualidade?: number; escala?: number } = {}
) {
  const largura = 1060;
  const alturaLinha = 34;
  const totais = calcularTotais(linhas);
  const justificativas = itensJustificativa(linhas);
  const yCabeca = 86;
  const yTotal = yCabeca + 40 + linhas.length * alturaLinha;
  const yIndicadores = yTotal + 28;
  const yJust = yIndicadores + 148;
  const telaMedida = document.createElement('canvas').getContext('2d');
  if (!telaMedida) throw new Error('Não consegui montar a imagem do relatório.');
  telaMedida.font = '13px Arial';
  const linhasJust = justificativas.map(item => {
    const bolinha = item.marca === 'verde' ? '●' : '●';
    const texto = `${bolinha} ${item.rotulo} ${item.texto}`.trim();
    return quebrarTexto(telaMedida, texto, largura - 80);
  });
  const alturaJust = linhasJust.reduce((soma, bloco) => soma + Math.max(1, bloco.length) * 20 + 8, 0);
  const altura = yJust + 36 + Math.max(alturaJust, 28) + 28;
  const tela = document.createElement('canvas');
  const escala = opcoes.escala || 2;
  tela.width = largura * escala;
  tela.height = altura * escala;
  const contexto = tela.getContext('2d');
  if (!contexto) throw new Error('Não consegui montar a imagem do relatório.');
  contexto.scale(escala, escala);
  contexto.fillStyle = '#d7dde3';
  contexto.fillRect(0, 0, largura, altura);

  contexto.fillStyle = '#1e4b7a';
  contexto.font = '700 22px Arial';
  contexto.textAlign = 'center';
  contexto.textBaseline = 'middle';
  contexto.fillText('RELATÓRIO DE COMPARAÇÃO DE PREÇOS - NF x CEASA', largura / 2, 32);
  contexto.fillStyle = '#334155';
  contexto.font = '14px Arial';
  contexto.fillText(subtituloRelatorio(cabecalho), largura / 2, 58);

  const xTabela = 28;
  const larguraTabela = largura - 56;
  contexto.fillStyle = '#1e4b7a';
  contexto.fillRect(xTabela, yCabeca, larguraTabela, 40);
  contexto.fillStyle = '#ffffff';
  contexto.font = '700 13px Arial';
  colunasImagem.forEach(coluna => {
    contexto.textAlign = coluna.direita ? 'right' : 'left';
    const x = coluna.direita ? coluna.x + coluna.largura - 8 : coluna.x;
    if (coluna.duplo) {
      contexto.fillText('kg/unid', x, yCabeca + 13);
      contexto.fillText(coluna.titulo, x, yCabeca + 28);
      return;
    }
    contexto.fillText(coluna.titulo, x, yCabeca + 20);
  });

  linhas.forEach((linha, indice) => {
    const y = yCabeca + 40 + indice * alturaLinha;
    const marca = marcaDaLinha(linha);
    contexto.fillStyle = fundoMarca(marca, indice);
    contexto.fillRect(xTabela, y, larguraTabela, alturaLinha);
    const conta = calcularLinha(linha.quantidade, linha.precoNf, linha.precoCeasa);
    const valores = [
      linha.produto || '(sem nome)',
      formatarNumero(linha.quantidade),
      formatarMoeda(linha.precoNf),
      linha.precoCeasa == null ? 'Sem preço' : formatarMoeda(linha.precoCeasa),
      formatarMoeda(conta.totalNf),
      conta.totalCeasa == null ? '—' : formatarMoeda(conta.totalCeasa),
      conta.diferenca == null ? '—' : formatarDiferencaSinal(conta.diferenca)
    ];
    contexto.fillStyle = '#0f172a';
    contexto.font = '14px Arial';
    colunasImagem.forEach((coluna, ordem) => {
      contexto.textAlign = coluna.direita ? 'right' : 'left';
      const x = coluna.direita ? coluna.x + coluna.largura - 8 : coluna.x;
      contexto.fillText(cortarNoContexto(contexto, valores[ordem], coluna.largura - 12), x, y + alturaLinha / 2);
    });
  });

  contexto.fillStyle = '#f8fafc';
  contexto.fillRect(xTabela, yTotal, larguraTabela, alturaLinha);
  contexto.strokeStyle = '#94a3b8';
  contexto.lineWidth = 1;
  contexto.strokeRect(xTabela, yCabeca, larguraTabela, 40 + linhas.length * alturaLinha + alturaLinha);
  contexto.fillStyle = '#0f172a';
  contexto.font = '700 14px Arial';
  contexto.textAlign = 'left';
  contexto.fillText('TOTAL GERAL', 36, yTotal + alturaLinha / 2);
  contexto.textAlign = 'right';
  contexto.fillText(formatarMoeda(totais.totalNf), colunasImagem[4].x + colunasImagem[4].largura - 8, yTotal + alturaLinha / 2);
  contexto.fillText(formatarMoeda(totais.totalCeasa), colunasImagem[5].x + colunasImagem[5].largura - 8, yTotal + alturaLinha / 2);

  const margem = totais.margemPct == null ? '—' : formatarPercentual(totais.margemPct);
  contexto.fillStyle = '#1e4b7a';
  contexto.fillRect(xTabela, yIndicadores, larguraTabela, 32);
  contexto.fillStyle = '#ffffff';
  contexto.font = '700 14px Arial';
  contexto.textAlign = 'center';
  contexto.fillText('QUADRO DE INDICADORES GLOBAIS', largura / 2, yIndicadores + 16);
  const indicadores = [
    ['Valor Total Pago (NF)', formatarMoeda(totais.totalNf), 'Custo real total documentado nas Notas Fiscais.', '#0f172a'],
    ['Economia Potencial em Dinheiro', formatarMoeda(totais.margemValor), 'O valor exato em dinheiro que a instituição pagaria a mais em relação à CEASA.', '#15803d'],
    ['Diferença Média de Preço', margem, 'O percentual médio que a Nota Fiscal ficou acima do preço de referência da CEASA.', '#0f172a']
  ] as const;
  indicadores.forEach((item, indice) => {
    const y = yIndicadores + 32 + indice * 32;
    contexto.fillStyle = '#ffffff';
    contexto.fillRect(xTabela, y, larguraTabela, 32);
    contexto.strokeStyle = '#94a3b8';
    contexto.strokeRect(xTabela, y, 280, 32);
    contexto.strokeRect(xTabela + 280, y, 150, 32);
    contexto.strokeRect(xTabela + 430, y, larguraTabela - 430, 32);
    contexto.fillStyle = '#0f172a';
    contexto.font = '13px Arial';
    contexto.textAlign = 'left';
    contexto.fillText(item[0], xTabela + 10, y + 16);
    contexto.fillStyle = item[3];
    contexto.font = '700 13px Arial';
    contexto.textAlign = 'right';
    contexto.fillText(item[1], xTabela + 418, y + 16);
    contexto.fillStyle = '#334155';
    contexto.font = '12px Arial';
    contexto.textAlign = 'left';
    contexto.fillText(cortarNoContexto(contexto, item[2], larguraTabela - 450), xTabela + 440, y + 16);
  });

  contexto.fillStyle = '#0f172a';
  contexto.font = '700 14px Arial';
  contexto.textAlign = 'left';
  contexto.fillText('JUSTIFICATIVA DAS PRINCIPAIS DISTORÇÕES (EM TÓPICOS)', xTabela, yJust);
  let yItem = yJust + 28;
  if (!justificativas.length) {
    contexto.font = '13px Arial';
    contexto.fillStyle = '#475569';
    contexto.fillText('Nenhum item marcado na tabela.', xTabela, yItem);
  } else {
    justificativas.forEach((item) => {
      contexto.font = '13px Arial';
      const prefixo = `${item.marca === 'verde' ? '●' : '●'} ${item.rotulo}`;
      const bloco = quebrarTexto(contexto, `${prefixo} ${item.texto}`.trim(), larguraTabela - 24);
      bloco.forEach((parte, linhaTexto) => {
        contexto.fillStyle = item.marca === 'verde' ? '#15803d' : '#b91c1c';
        if (linhaTexto === 0) {
          contexto.beginPath();
          contexto.arc(xTabela + 7, yItem, 5, 0, Math.PI * 2);
          contexto.fill();
          contexto.fillStyle = '#0f172a';
          contexto.fillText(parte.replace(/^●\s*/, ''), xTabela + 20, yItem);
        } else {
          contexto.fillStyle = '#0f172a';
          contexto.fillText(parte, xTabela + 20, yItem);
        }
        yItem += 20;
      });
      yItem += 8;
    });
  }

  return new Promise<Blob>((resolve, reject) => {
    tela.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Não consegui montar a imagem do relatório.'));
    }, opcoes.tipo || 'image/png', opcoes.qualidade);
  });
}

export async function enviarImagemWhatsappConciliacao(cabecalho: CabecalhoRelatorio, linhas: LinhaRelatorio[]) {
  const blob = await gerarImagemConciliacao(cabecalho, linhas);
  const nome = 'comparacao-nf-ceasa.png';
  const arquivo = new File([blob], nome, { type: 'image/png' });
  const texto = [
    'RELATÓRIO DE COMPARAÇÃO DE PREÇOS - NF x CEASA',
    subtituloRelatorio(cabecalho),
    'O relatório completo está na imagem.'
  ].join('\n');
  const compartilhar = { files: [arquivo], title: 'Comparação NF x CEASA', text: texto };

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
