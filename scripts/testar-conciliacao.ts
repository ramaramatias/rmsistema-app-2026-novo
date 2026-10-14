import assert from 'node:assert/strict';
import { formatarDiferencaSinal, gerarPdfConciliacao, rotuloJustificativa } from '../src/abas/conciliacao/relatorioConciliacao.ts';
import { lotesDoMes, mesDeDataBr, montarLoteConciliacao, rotuloMes, unirLotesConciliacao } from '../src/abas/conciliacao/lotesConciliacao.ts';
import {
  arredondar2,
  calcularLinha,
  calcularTotais,
  cruzar,
  completarPrecos,
  formatarPercentual,
  lerNota,
  lerTabela2,
  type LinhaPdf,
  type TokenPdf
} from '../src/abas/conciliacao/parserConciliacao.ts';

function linha(y: number, partes: string[] | { texto: string; x: number; fonte?: string }[]): LinhaPdf {
  const tokens: TokenPdf[] = partes.map((parte, indice) => (
    typeof parte === 'string' ? { texto: parte, x: indice * 70 } : parte
  ));
  return { pagina: 1, y, tokens, texto: tokens.map(token => token.texto).join(' ') };
}

const nota = lerNota([
  linha(800, ['NF-e', '000.000.604']),
  linha(780, ['DATA DE EMISSAO', '20/08/2026']),
  linha(760, ['DESTINATARIO']),
  linha(740, ['Centro Espirita O Pobre de Deus']),
  linha(500, ['DADOS DOS PRODUTOS']),
  linha(480, ['DESCRICAO', 'NCM', 'CST', 'CFOP', 'UN', 'QUANT', 'VALOR UNIT', 'VALOR TOTAL']),
  linha(460, [{ texto: 'alho', x: 10 }, { texto: '07032000', x: 180 }, { texto: '000', x: 250 }, { texto: '5102', x: 300 }, { texto: 'KG', x: 360 }, { texto: '9,00', x: 420 }, { texto: '21,66', x: 490 }, { texto: '194,94', x: 560 }]),
  linha(440, [{ texto: 'abacate', x: 10 }, { texto: 'KG', x: 360 }, { texto: '3,40', x: 420 }, { texto: '8,00', x: 490 }, { texto: '27,20', x: 560 }]),
  linha(420, [{ texto: 'banana', x: 10 }, { texto: 'KG', x: 360 }, { texto: '15,700', x: 420 }, { texto: '2,54', x: 490 }, { texto: '39,88', x: 560 }]),
  linha(400, [{ texto: 'batata', x: 10 }, { texto: 'inglesa', x: 50 }, { texto: 'KG', x: 360 }, { texto: '49,300', x: 420 }, { texto: '5,07', x: 490 }, { texto: '249,95', x: 560 }]),
  linha(380, [{ texto: 'melancia', x: 10 }, { texto: 'KG', x: 360 }, { texto: '24,90', x: 420 }, { texto: '3,21', x: 490 }, { texto: '79,93', x: 560 }]),
  linha(360, [{ texto: 'cebola', x: 10 }, { texto: 'KG', x: 360 }, { texto: '19,80', x: 420 }, { texto: '4,14', x: 490 }, { texto: '81,97', x: 560 }]),
  linha(340, [{ texto: 'alface', x: 10 }, { texto: 'KG', x: 360 }, { texto: '42,00', x: 420 }, { texto: '2,20', x: 490 }, { texto: '92,40', x: 560 }]),
  linha(320, [{ texto: 'chuchu', x: 10 }, { texto: 'KG', x: 360 }, { texto: '21,80', x: 420 }, { texto: '2,38', x: 490 }, { texto: '51,88', x: 560 }]),
  linha(300, [{ texto: 'laranja', x: 10 }, { texto: 'KG', x: 360 }, { texto: '53,40', x: 420 }, { texto: '2,02', x: 490 }, { texto: '107,87', x: 560 }]),
  linha(280, [{ texto: 'tomate', x: 10 }, { texto: 'KG', x: 360 }, { texto: '50,00', x: 420 }, { texto: '2,90', x: 490 }, { texto: '145,00', x: 560 }]),
  linha(260, [{ texto: 'mamao', x: 10 }, { texto: 'KG', x: 360 }, { texto: '2,00', x: 420 }, { texto: '5,00', x: 490 }, { texto: '10,00', x: 560 }]),
  linha(200, ['DADOS ADICIONAIS'])
]);

const tabela = lerTabela2([
  linha(800, ['OUTRA LISTA', 'nao usar', '99,00']),
  linha(760, ['TABELA 2', 'HORTIFRUTI', '18/08/2026']),
  linha(740, [{ texto: 'PRODUTO', x: 10 }, { texto: 'EMBALAGEM', x: 180 }, { texto: 'PRECO', x: 320 }]),
  linha(720, [{ texto: 'alho', x: 10 }, { texto: 'KG', x: 180 }, { texto: '18,00', x: 320 }]),
  linha(700, [{ texto: 'abacate', x: 10 }, { texto: 'KG', x: 180 }, { texto: '4,00', x: 320 }]),
  linha(680, [{ texto: 'banana', x: 10 }, { texto: 'CX 16KG', x: 180 }, { texto: '30,00', x: 320 }]),
  linha(660, [{ texto: 'batata inglesa', x: 10 }, { texto: 'KG', x: 180 }, { texto: '4,00', x: 320 }]),
  linha(640, [{ texto: 'melancia', x: 10 }, { texto: 'KG', x: 180 }, { texto: '2,00', x: 320 }]),
  linha(620, [{ texto: 'cebola', x: 10 }, { texto: 'KG', x: 180 }, { texto: '3,50', x: 320 }]),
  linha(600, [{ texto: 'alface', x: 10 }, { texto: 'CX 12KG', x: 180 }, { texto: '15,00', x: 260 }, { texto: '21,60', x: 320 }, { texto: '28,00', x: 400 }]),
  linha(580, [{ texto: 'chuchu', x: 10 }, { texto: 'KG', x: 180 }, { texto: '1,60', x: 320 }]),
  linha(560, [{ texto: 'laranja', x: 10 }, { texto: 'KG', x: 180 }, { texto: '1,50', x: 320 }]),
  linha(540, [{ texto: 'tomate', x: 10 }, { texto: 'KG', x: 180 }, { texto: '2,40', x: 320 }]),
  linha(500, ['TABELA 3', 'outros']),
  linha(480, [{ texto: 'mamao', x: 10 }, { texto: 'KG', x: 180 }, { texto: '9,00', x: 320 }])
]);

assert.equal(nota.numero, '604');
assert.equal(nota.data, '20/08/2026');
assert.equal(nota.empresa, 'Centro Espirita O Pobre de Deus');
assert.equal(nota.produtos.length, 11);
assert.equal(tabela.achouTabela2, true);
assert.equal(tabela.itens.some(item => item.produto.toLowerCase() === 'mamao'), false);

const banana = tabela.itens.find(item => item.produto === 'banana');
assert.ok(banana);
assert.equal(arredondar2(banana.precoPorKg), 1.88);
assert.ok(Math.abs(banana.precoPorKg - 1.875) < 0.0001);

const linhas = cruzar(nota.produtos, tabela.itens);
const mamao = linhas.find(item => item.produto === 'mamao');
assert.ok(mamao?.semPreco);
assert.equal(mamao?.detalhe, 'Sem preço na tabela');

const bananaLinha = linhas.find(item => item.produto === 'banana');
assert.ok(bananaLinha);
const contaBanana = calcularLinha(bananaLinha.quantidade, bananaLinha.precoNf, bananaLinha.precoCeasa);
assert.equal(contaBanana.totalNf, 39.88);
assert.equal(contaBanana.totalCeasa, 29.44);
assert.equal(formatarPercentual(contaBanana.diferenca || 0), '35,47%');

const semMamao = linhas.filter(item => item.produto !== 'mamao');
const totais = calcularTotais(semMamao);
assert.equal(totais.totalNf, 1071.02);
assert.equal(totais.totalCeasa, 831.92);
assert.equal(totais.valorArredondado, 1071.6);
assert.equal(totais.margemValor, 239.1);
assert.equal(formatarPercentual(totais.margemPct || 0), '28,74%');

const comFuro = calcularTotais(linhas);
assert.equal(comFuro.incompleto, true);
assert.equal(comFuro.margemValor, 239.1);

const coluna = lerTabela2([
  linha(800, ['COLUNA 2', 'FRUTAS']),
  linha(760, [{ texto: 'banana', x: 10 }, { texto: 'CX 16KG', x: 180 }, { texto: '30,00', x: 320 }]),
  linha(740, ['COLUNA 3']),
  linha(720, [{ texto: 'mamao', x: 10 }, { texto: 'KG', x: 180 }, { texto: '9,00', x: 320 }])
], 'coluna2');
assert.equal(coluna.achouTabela2, true);
assert.equal(coluna.itens.length, 1);
assert.equal(coluna.itens[0].produto, 'banana');
assert.ok(Math.abs(coluna.itens[0].precoPorKg - 1.875) < 0.0001);
assert.match(coluna.itens[0].detalhe, /^Coluna 2:/);

const segunda = lerTabela2([
  linha(700, [{ texto: 'PRODUTO', x: 10 }, { texto: 'COLUNA 1', x: 180 }, { texto: 'COLUNA 2', x: 280 }]),
  linha(680, [{ texto: 'alho', x: 10 }, { texto: '10,00', x: 180 }, { texto: '18,00', x: 280 }])
], 'coluna2');
assert.equal(segunda.itens.length, 1);
assert.equal(arredondar2(segunda.itens[0].precoPorKg), 18);

const base = cruzar(
  [
    { produto: 'banana', quantidade: 15.7, unidade: 'KG', precoNf: 2.54 },
    { produto: 'mamao', quantidade: 2, unidade: 'KG', precoNf: 5 }
  ],
  [{ produto: 'banana', precoEmbalagem: 30, pesoKg: 16, precoPorKg: 30 / 16, detalhe: 'Tabela 2: caixa' }]
);
const extra = completarPrecos(base, [
  { produto: 'banana', precoEmbalagem: 99, pesoKg: null, precoPorKg: 99, detalhe: 'Tabela 2: outro' },
  { produto: 'mamao', precoEmbalagem: 4, pesoKg: null, precoPorKg: 4, detalhe: 'Tabela 2: R$ 4,00/kg' }
]);
assert.equal(extra.preenchidos, 1);
assert.ok(Math.abs((extra.linhas[0].precoCeasa || 0) - 30 / 16) < 0.0001);
assert.equal(extra.linhas[1].precoCeasa, 4);
assert.equal(extra.linhas[1].semPreco, false);
assert.match(extra.linhas[1].detalhe, /^PDF dos que faltam/);

const numeroRua = lerNota([
  linha(900, ['DANFE', 'CONTROLE DO FISCO']),
  linha(880, ['R LAMARTINE NOGUEIRA, 1399 no portal nacional']),
  linha(860, ['Nº 000.000.515']),
  linha(840, ['DATA DE EMISSAO', '09/06/2026']),
  linha(760, ['DESTINATARIO']),
  linha(740, ['CENTRO ESPIRITA O POBRE DE DEUS 86.732.443/0003-54 09/06/2026']),
  linha(500, ['DADOS DO PRODUTO/SERVICO']),
  linha(480, ['CANELA EM PAU', 'G', '950,0000', '0,0895', '85,00']),
  linha(460, ['ALHO', 'KG', '9,5000', '22,1060', '210,00']),
  linha(200, ['DADOS ADICIONAIS'])
]);
assert.equal(numeroRua.numero, '515');
assert.equal(numeroRua.data, '09/06/2026');
assert.equal(numeroRua.empresa, 'CENTRO ESPIRITA O POBRE DE DEUS');
assert.equal(numeroRua.produtos.length, 2);
assert.equal(numeroRua.produtos[0].unidade, 'KG');
assert.equal(numeroRua.produtos[0].quantidade, 0.95);
assert.equal(calcularLinha(numeroRua.produtos[0].quantidade, numeroRua.produtos[0].precoNf, null).totalNf, 85);
assert.equal(calcularLinha(numeroRua.produtos[1].quantidade, numeroRua.produtos[1].precoNf, null).totalNf, 210);

const boletim = lerTabela2([
  linha(800, ['BOLETIM INFORMATIVO DIARIO DE 06/03/2026']),
  linha(780, [
    { texto: 'HORTALICAS', x: 10, fonte: 'f1' },
    { texto: 'UND', x: 160, fonte: 'f1' },
    { texto: 'SIT', x: 230, fonte: 'f1' },
    { texto: 'MIN', x: 300, fonte: 'f1' },
    { texto: 'MC', x: 370, fonte: 'f1' },
    { texto: 'MAX', x: 440, fonte: 'f1' }
  ]),
  linha(760, [{ texto: 'ABOBORA', x: 10, fonte: 'f1' }]),
  linha(740, [
    { texto: 'ABOBARA', x: 10, fonte: 'f2' },
    { texto: 'CABOCLO', x: 70, fonte: 'f2' },
    { texto: 'KG', x: 160, fonte: 'f2' },
    { texto: 'EST', x: 230, fonte: 'f2' },
    { texto: '3,00', x: 300, fonte: 'f2' },
    { texto: '3,00', x: 370, fonte: 'f2' },
    { texto: '3,00', x: 440, fonte: 'f2' }
  ]),
  linha(720, [
    { texto: 'ACELGA', x: 10, fonte: 'f1' },
    { texto: 'CX.10KG', x: 160, fonte: 'f1' },
    { texto: 'FRA', x: 230, fonte: 'f1' },
    { texto: '15,00', x: 300, fonte: 'f1' },
    { texto: '15,00', x: 370, fonte: 'f1' },
    { texto: '20,00', x: 440, fonte: 'f1' }
  ]),
  linha(700, [{ texto: 'ALFACE', x: 10, fonte: 'f1' }]),
  linha(680, [
    { texto: 'AMERICANA', x: 10, fonte: 'f2' },
    { texto: 'CX.05KG', x: 160, fonte: 'f2' },
    { texto: 'FRA', x: 230, fonte: 'f2' },
    { texto: '12,00', x: 300, fonte: 'f2' },
    { texto: '12,00', x: 370, fonte: 'f2' },
    { texto: '12,00', x: 440, fonte: 'f2' }
  ]),
  linha(660, [
    { texto: 'LISA', x: 10, fonte: 'f2' },
    { texto: '(COMUM)', x: 50, fonte: 'f2' },
    { texto: 'PE', x: 160, fonte: 'f2' },
    { texto: 'FRA', x: 230, fonte: 'f2' },
    { texto: '0,75', x: 300, fonte: 'f2' },
    { texto: '0,75', x: 370, fonte: 'f2' },
    { texto: '0,75', x: 440, fonte: 'f2' }
  ]),
  linha(640, [{ texto: 'CEBOLA', x: 10, fonte: 'f1' }]),
  linha(620, [
    { texto: 'ROXA', x: 10, fonte: 'f2' },
    { texto: 'CX2', x: 50, fonte: 'f2' },
    { texto: 'SC', x: 120, fonte: 'f2' },
    { texto: '20KG', x: 160, fonte: 'f2' },
    { texto: 'EST', x: 230, fonte: 'f2' },
    { texto: '80,00', x: 300, fonte: 'f2' },
    { texto: '85,00', x: 370, fonte: 'f2' },
    { texto: '90,00', x: 440, fonte: 'f2' }
  ]),
  linha(600, [
    { texto: 'MELANCIA', x: 10, fonte: 'f1' },
    { texto: 'KG', x: 160, fonte: 'f1' },
    { texto: 'FIR', x: 230, fonte: 'f1' },
    { texto: '1,80', x: 300, fonte: 'f1' },
    { texto: '1,80', x: 370, fonte: 'f1' },
    { texto: '1,80', x: 440, fonte: 'f1' }
  ])
]);
assert.equal(boletim.achouTabela2, true);
assert.equal(boletim.data, '06/03/2026');
const acelga = boletim.itens.find(item => item.produto === 'ACELGA');
assert.ok(acelga);
assert.equal(acelga.precoEmbalagem, 15);
assert.equal(acelga.pesoKg, 10);
assert.equal(arredondar2(acelga.precoPorKg), 1.5);
const americana = boletim.itens.find(item => item.produto === 'ALFACE AMERICANA');
assert.ok(americana);
assert.equal(arredondar2(americana.precoPorKg), 2.4);
const lisa = boletim.itens.find(item => /LISA/.test(item.produto));
assert.ok(lisa);
assert.equal(lisa.porKg, false);
assert.equal(lisa.precoPorKg, 0.75);
const roxa = boletim.itens.find(item => /ROXA/.test(item.produto));
assert.ok(roxa);
assert.equal(roxa.precoEmbalagem, 85);
assert.equal(roxa.pesoKg, 20);
assert.equal(arredondar2(roxa.precoPorKg), 4.25);
const melanciaBoletim = boletim.itens.find(item => item.produto === 'MELANCIA');
assert.ok(melanciaBoletim);
assert.equal(melanciaBoletim.precoPorKg, 1.8);

const alfaceUnd = cruzar([{ produto: 'ALFACE', quantidade: 42, unidade: 'UND', precoNf: 2 }], boletim.itens)[0];
assert.equal(alfaceUnd.semPreco, false);
assert.equal(alfaceUnd.precoCeasa, 0.75);
const melanciaKg = cruzar([{ produto: 'MELANCIA', quantidade: 23.5, unidade: 'KG', precoNf: 3.617 }], boletim.itens)[0];
assert.equal(melanciaKg.precoCeasa, 1.8);
const jerimum = cruzar([{ produto: 'JERIMUM', quantidade: 3.4, unidade: 'KG', precoNf: 5 }], boletim.itens)[0];
assert.equal(jerimum.semPreco, false);

const bananaEmpate = cruzar(
  [{ produto: 'BANANA', quantidade: 10, unidade: 'KG', precoNf: 3.3 }],
  [
    { produto: 'BANANA MACA', precoEmbalagem: 70, pesoKg: 16, precoPorKg: 70 / 16, detalhe: 'maca', porKg: true },
    { produto: 'BANANA PACOVAN', precoEmbalagem: 50, pesoKg: 16, precoPorKg: 50 / 16, detalhe: 'pacovan', porKg: true }
  ]
)[0];
assert.ok(bananaEmpate.precoCeasa != null && Math.abs(bananaEmpate.precoCeasa - 50 / 16) < 0.001);
assert.match(bananaEmpate.detalhe, /BANANA MACA/);

const ibiapaba = lerTabela2([
  linha(820, [{ texto: 'BOLETIM INFORMATIVO DIARIO DE 06/10/2026', x: 180 }]),
  linha(800, [
    { texto: 'FRUTAS', x: 10 },
    { texto: 'UND', x: 160 },
    { texto: 'SIT', x: 200 },
    { texto: 'MIN', x: 240 },
    { texto: 'MC', x: 280 },
    { texto: 'MAX', x: 320 },
    { texto: 'PROC', x: 360 },
    { texto: 'HORTALICAS', x: 430 },
    { texto: 'UND', x: 560 },
    { texto: 'SIT', x: 600 },
    { texto: 'MIN', x: 640 },
    { texto: 'MC', x: 680 },
    { texto: 'MAX', x: 720 },
    { texto: 'PROC', x: 760 }
  ]),
  linha(760, [
    { texto: 'ABACATE', x: 10 },
    { texto: 'G', x: 70 },
    { texto: 'Cx.25kg', x: 150 },
    { texto: 'EST', x: 200 },
    { texto: '100,00', x: 240 },
    { texto: '120,00', x: 280 },
    { texto: '120,00', x: 320 },
    { texto: 'MG', x: 360 },
    { texto: 'AIPIM', x: 430 },
    { texto: 'CX25KG', x: 540 },
    { texto: 'EST', x: 600 },
    { texto: '25,00', x: 640 },
    { texto: '30,00', x: 680 },
    { texto: '40,00', x: 720 },
    { texto: 'CE', x: 760 }
  ]),
  linha(740, [
    { texto: 'MELANCIA', x: 10 },
    { texto: 'KG', x: 160 },
    { texto: 'FRA', x: 200 },
    { texto: '1,50', x: 240 },
    { texto: '1,50', x: 280 },
    { texto: '1,70', x: 320 },
    { texto: 'CE', x: 360 },
    { texto: 'QUIABO', x: 430 },
    { texto: 'CX.15KG', x: 540 },
    { texto: 'EST', x: 600 },
    { texto: '30,00', x: 640 },
    { texto: '30,00', x: 680 },
    { texto: '30,00', x: 720 },
    { texto: 'CE', x: 760 }
  ]),
  linha(700, [
    { texto: 'HORTALICAS', x: 10 },
    { texto: 'UND', x: 160 },
    { texto: 'SIT', x: 200 },
    { texto: 'MIN', x: 240 },
    { texto: 'MC', x: 280 },
    { texto: 'MAX', x: 320 },
    { texto: 'PROC', x: 360 }
  ]),
  linha(680, [
    { texto: 'ABOBORA', x: 10 },
    { texto: 'CABOCLO', x: 70 },
    { texto: 'KG', x: 160 },
    { texto: 'FRA', x: 200 },
    { texto: '2,50', x: 240 },
    { texto: '2,50', x: 280 },
    { texto: '3,00', x: 320 },
    { texto: 'CE/BA', x: 360 },
    { texto: 'Preço Máximo (MÁX): maior preço do dia', x: 430 }
  ]),
  linha(660, [
    { texto: 'ALFACE', x: 10 },
    { texto: 'LISA', x: 60 },
    { texto: 'PE', x: 160 },
    { texto: 'EST', x: 200 },
    { texto: '0,75', x: 240 },
    { texto: '0,75', x: 280 },
    { texto: '0,75', x: 320 },
    { texto: 'CE', x: 360 }
  ])
]);
assert.match(ibiapaba.avisos.join(' '), /mesma folha/);
assert.equal(ibiapaba.data, '06/10/2026');
const abacate = ibiapaba.itens.find(item => item.produto === 'ABACATE G');
assert.ok(abacate);
assert.equal(abacate.precoEmbalagem, 120);
assert.equal(abacate.pesoKg, 25);
assert.equal(arredondar2(abacate.precoPorKg), 4.8);
const aipim = ibiapaba.itens.find(item => item.produto === 'AIPIM');
assert.ok(aipim);
assert.equal(aipim.precoEmbalagem, 30);
assert.equal(arredondar2(aipim.precoPorKg), 1.2);
const melanciaIbiapaba = ibiapaba.itens.find(item => item.produto === 'MELANCIA');
assert.ok(melanciaIbiapaba);
assert.equal(melanciaIbiapaba.precoPorKg, 1.5);
const quiabo = ibiapaba.itens.find(item => item.produto === 'QUIABO');
assert.ok(quiabo);
assert.equal(arredondar2(quiabo.precoPorKg), 2);
const abobora = ibiapaba.itens.find(item => item.produto === 'ABOBORA CABOCLO');
assert.ok(abobora);
assert.equal(abobora.precoEmbalagem, 2.5);
const alfaceLisa = ibiapaba.itens.find(item => item.produto === 'ALFACE LISA');
assert.ok(alfaceLisa);
assert.equal(alfaceLisa.porKg, false);
assert.equal(alfaceLisa.precoPorKg, 0.75);
assert.equal(ibiapaba.itens.some(item => /maximo|preco/i.test(item.produto)), false);

const pdf = await gerarPdfConciliacao(
  { empresa: 'Centro Espírita O Pobre de Deus', numeroNf: '515', dataNf: '09/06/2026', dataCeasa: '06/10/2026' },
  [{ produto: 'PIMENTÃO', quantidade: 1.5, unidade: 'UND', precoNf: 10.34, precoCeasa: 2.5, semPreco: false, detalhe: 'CEASA MC', destaque: true }]
).text();
assert.match(pdf, /WinAnsiEncoding/);
assert.match(pdf, /\\307/);
assert.match(pdf, /\\303/);
assert.doesNotMatch(pdf, /Faixa vermelha/);
assert.doesNotMatch(pdf, /arred/i);
assert.doesNotMatch(pdf, /UND/);
assert.match(pdf, /kg\/unid/);
assert.match(pdf, /Valor da nota/);
assert.match(pdf, /15,51/);
assert.match(pdf, /\/F1 16 Tf/);
assert.match(pdf, /\/F1 10 Tf/);
assert.equal(formatarDiferencaSinal(100.95), '+100,95%');
assert.equal(rotuloJustificativa('Melancia', 100.95), 'MELANCIA (+100,95%):');
assert.equal(rotuloJustificativa('Banana', 8.31), 'BANANA (+8,31%):');
assert.equal(mesDeDataBr('09/06/2026'), '2026-06');
assert.equal(rotuloMes('2026-06'), 'Junho de 2026');
const loteJunho = montarLoteConciliacao({
  empresa: 'Centro',
  numeroNf: '515',
  dataNf: '09/06/2026',
  dataCeasa: '06/03/2026',
  origem: 'tabela2',
  linhas: [{ produto: 'MELANCIA', quantidade: 23.5, precoNf: 3.62, precoCeasa: 1.8, semPreco: false, detalhe: '', marca: 'vermelha', justificativa: 'Entressafra' }]
});
assert.equal(loteJunho.mes, '2026-06');
assert.equal(loteJunho.numeroNf, '515');
assert.equal(lotesDoMes(unirLotesConciliacao([loteJunho]), '2026-06').length, 1);
assert.equal(lotesDoMes([loteJunho], '2026-03').length, 0);

console.log('conciliacao ok');
