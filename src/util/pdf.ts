import type { ItemPagamento, LinhaPdfPagamento, LinhaPedidoPdf, PagamentosState } from '../tipos';

export const textoPdf = (valor: string) =>
  valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

export const gerarPdfPedidoFornecedor = (fornecedorNome: string, linhas: LinhaPedidoPdf[], totalGeral: number) => {
  const largura = 595;
  const altura = 842;
  const linhasPorPagina = 28;
  const paginas: LinhaPedidoPdf[][] = [];
  for (let i = 0; i < Math.max(linhas.length, 1); i += linhasPorPagina) {
    paginas.push(linhas.slice(i, i + linhasPorPagina));
  }

  const desenharPagina = (itensPagina: LinhaPedidoPdf[], numero: number, totalPaginas: number) => {
    const comandos: string[] = ['BT', '/F1 16 Tf', '0.06 0.46 0.43 rg', `50 ${altura - 50} Td`, `(RM SISTEMA-GESTAO) Tj`, '0 g', '/F1 11 Tf', '0 -22 Td', `(Pedido de compra) Tj`, '0 -16 Td', `(Fornecedor: ${textoPdf(fornecedorNome)}) Tj`, '0 -14 Td', `(Data: ${textoPdf(new Date().toLocaleString('pt-BR'))}${totalPaginas > 1 ? `  |  Pagina ${numero}/${totalPaginas}` : ''}) Tj`, 'ET'];
    let y = altura - 130;
    const cabecalho = [
      { x: 50, t: 'Produto', w: 220 },
      { x: 270, t: 'Unid', w: 50 },
      { x: 320, t: 'Qtd', w: 50 },
      { x: 380, t: 'Vl unit.', w: 80 },
      { x: 470, t: 'Total', w: 75 }
    ];
    comandos.push('0.06 0.09 0.16 rg', `50 ${y - 4} ${495} 18 re`, 'f', '1 1 1 rg', 'BT', '/F1 9 Tf');
    cabecalho.forEach((col, i) => {
      comandos.push(i === 0 ? `1 0 0 1 ${col.x} ${y + 2} Tm` : `1 0 0 1 ${col.x} ${y + 2} Tm`, `(${col.t}) Tj`);
    });
    comandos.push('ET', '0 g');
    y -= 22;
    itensPagina.forEach((item, indice) => {
      if (indice % 2 === 1) {
        comandos.push('0.97 0.98 0.99 rg', `50 ${y - 4} 495 16 re`, 'f', '0 g');
      }
      const produto = textoPdf(item.produto).slice(0, 42);
      const unitario = item.valorUnitario ? `R$ ${item.valorUnitario.toFixed(2)}` : '-';
      const total = item.valorTotal ? `R$ ${item.valorTotal.toFixed(2)}` : '-';
      comandos.push('BT', '/F1 8 Tf', `1 0 0 1 52 ${y} Tm`, `(${produto}) Tj`, `1 0 0 1 270 ${y} Tm`, `(${textoPdf(item.unit)}) Tj`, `1 0 0 1 320 ${y} Tm`, `(${textoPdf(item.quantidade)}) Tj`, `1 0 0 1 380 ${y} Tm`, `(${unitario}) Tj`, `1 0 0 1 470 ${y} Tm`, `(${total}) Tj`, 'ET');
      y -= 16;
    });
    if (numero === totalPaginas) {
      comandos.push('BT', '/F1 12 Tf', `1 0 0 1 320 ${Math.max(y - 10, 40)} Tm`, `(Total geral: R$ ${totalGeral.toFixed(2)}) Tj`, 'ET');
    }
    return comandos.join('\n');
  };

  const streams = paginas.map((itensPagina, indice) => desenharPagina(itensPagina, indice + 1, paginas.length));
  return montarArquivoPdf(streams, largura, altura);
};

export const montarArquivoPdf = (streams: string[], largura = 595, altura = 842) => {
  const objetos: string[] = [];
  objetos.push('<< /Type /Catalog /Pages 2 0 R >>');
  const kids = streams.map((_, i) => `${3 + i * 2} 0 R`).join(' ');
  objetos.push(`<< /Type /Pages /Kids [${kids}] /Count ${streams.length} >>`);
  streams.forEach((conteudo, i) => {
    const pageId = 3 + i * 2;
    const contentId = pageId + 1;
    objetos.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${largura} ${altura}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${3 + streams.length * 2} 0 R >> >> >>`);
    objetos.push(`<< /Length ${conteudo.length} >>\nstream\n${conteudo}\nendstream`);
  });
  objetos.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objetos.forEach((objeto, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objeto}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(off => {
    pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
};

export const gerarPdfRelatorioPagamentos = (dados: PagamentosState, valorTotal: number, dataRotulo?: string) => {
  const largura = 595;
  const altura = 842;
  const secoes: { nome: string; itens: ItemPagamento[] }[] = [
    { nome: '1. Caixa', itens: Array.isArray(dados.caixa) ? dados.caixa : [] },
    { nome: '2. Cheque', itens: Array.isArray(dados.cheque) ? dados.cheque : [] },
    { nome: '3. CABEN', itens: Array.isArray(dados.caben) ? dados.caben : [] }
  ];
  const linhas: LinhaPdfPagamento[] = [];
  secoes.forEach(secao => {
    if (secao.itens.length === 0) return;
    const subtotal = secao.itens.reduce((soma, item) => soma + Number(item.valor || 0), 0);
    linhas.push({ tipo: 'secao', rotulo: `${secao.nome}  -  Subtotal: R$ ${subtotal.toFixed(2)}` });
    secao.itens.forEach(item => {
      linhas.push({ tipo: 'item', rotulo: textoPdf(item.descricao || '-').slice(0, 68), valor: `R$ ${Number(item.valor || 0).toFixed(2)}` });
    });
  });
  if (linhas.length === 0) {
    linhas.push({ tipo: 'item', rotulo: 'Nenhum pagamento lancado neste relatorio.' });
  }

  const linhasPorPagina = 30;
  const paginas: LinhaPdfPagamento[][] = [];
  for (let i = 0; i < linhas.length; i += linhasPorPagina) {
    paginas.push(linhas.slice(i, i + linhasPorPagina));
  }

  const desenharPagina = (itensPagina: LinhaPdfPagamento[], numero: number, totalPaginas: number) => {
    const emissao = textoPdf(dataRotulo || new Date().toLocaleString('pt-BR'));
    const comandos: string[] = ['BT', '/F1 16 Tf', '0.06 0.46 0.43 rg', `50 ${altura - 50} Td`, `(RM SISTEMA-GESTAO) Tj`, '0 g', '/F1 11 Tf', '0 -22 Td', `(Relatorio de Pagamentos) Tj`, '0 -16 Td', `(Emissao: ${emissao}${totalPaginas > 1 ? `  |  Pagina ${numero}/${totalPaginas}` : ''}) Tj`, 'ET'];
    let y = altura - 130;
    comandos.push('0.06 0.09 0.16 rg', `50 ${y - 4} 495 18 re`, 'f', '1 1 1 rg', 'BT', '/F1 9 Tf', `1 0 0 1 52 ${y + 2} Tm`, `(Descricao) Tj`, `1 0 0 1 470 ${y + 2} Tm`, `(Valor) Tj`, 'ET', '0 g');
    y -= 22;
    itensPagina.forEach(linha => {
      if (linha.tipo === 'secao') {
        comandos.push('0.06 0.46 0.43 rg', `50 ${y - 4} 495 16 re`, 'f', '1 1 1 rg', 'BT', '/F1 8 Tf', `1 0 0 1 52 ${y} Tm`, `(${textoPdf(linha.rotulo).slice(0, 78)}) Tj`, 'ET', '0 g');
      } else {
        comandos.push('BT', '/F1 8 Tf', `1 0 0 1 52 ${y} Tm`, `(${linha.rotulo}) Tj`, `1 0 0 1 455 ${y} Tm`, `(${textoPdf(linha.valor || '')}) Tj`, 'ET');
      }
      y -= 16;
    });
    if (numero === totalPaginas) {
      comandos.push('BT', '/F1 12 Tf', `1 0 0 1 320 ${Math.max(y - 14, 50)} Tm`, `(Total geral: R$ ${valorTotal.toFixed(2)}) Tj`, 'ET');
      comandos.push('BT', '/F1 9 Tf', `1 0 0 1 180 ${40} Tm`, `(Visto Autorizacao Financeiro) Tj`, 'ET');
    }
    return comandos.join('\n');
  };

  const streams = paginas.map((itensPagina, indice) => desenharPagina(itensPagina, indice + 1, paginas.length));
  return montarArquivoPdf(streams, largura, altura);
};
