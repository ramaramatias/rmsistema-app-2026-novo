import { useMemo, useState } from 'react';
import {
  CabecalhoAba,
  Cartao,
  botaoPrimario,
  botaoSecundario,
  campo,
  classeSegmento,
  segmentado
} from '../../componentes/ui';
import { lerLinhasDoArquivo } from './lerPdf';
import {
  calcularLinha,
  calcularTotais,
  cruzar,
  completarPrecos,
  formatarMoeda,
  formatarPercentual,
  formatarQuantia,
  lerNota,
  lerTabela2,
  parseNumeroBr,
  type ItemTabela,
  type OrigemPreco
} from './parserConciliacao';
import { baixarExcelConciliacao, enviarImagemWhatsappConciliacao, formatarDiferencaSinal, gerarImagemConciliacao, imprimirConciliacao, marcaDaLinha, rotuloJustificativa, subtituloRelatorio, type MarcaRelatorio } from './relatorioConciliacao';
import { lotesDoMes, mesesComLote, montarLoteConciliacao, rotuloMes } from './lotesConciliacao';
import type { LoteConciliacao } from '../../tipos';
import { blobParaDataUrl } from '../../util/anexoPdf';

type LinhaTela = {
  id: string;
  produto: string;
  quantidade: number;
  unidade: string;
  precoNf: number;
  precoCeasa: number | null;
  semPreco: boolean;
  detalhe: string;
  versao: number;
  destaque: boolean;
  marca: MarcaRelatorio;
  justificativa: string;
};

type GravacaoFala = {
  lang: string;
  interimResults: boolean;
  onresult: ((evento: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  start: () => void;
};

function reconhecimentoDeFala() {
  const api = window as typeof window & { webkitSpeechRecognition?: new () => GravacaoFala; SpeechRecognition?: new () => GravacaoFala };
  const Classe = api.SpeechRecognition || api.webkitSpeechRecognition;
  return Classe ? new Classe() : null;
}

const inputGrade = 'w-full min-w-0 rounded border border-transparent bg-transparent px-1 py-1 text-sm text-slate-900 outline-none hover:border-slate-300 focus:border-teal-500 focus:bg-white';

function CampoNumero(p: { inicial: number; versao: number; aoMudar: (valor: number) => void; className?: string }) {
  const [texto, setTexto] = useState(() => formatarQuantia(p.inicial));
  const [versaoVista, setVersaoVista] = useState(p.versao);
  if (versaoVista !== p.versao) {
    setVersaoVista(p.versao);
    setTexto(formatarQuantia(p.inicial));
  }
  return (
    <input
      inputMode="decimal"
      className={p.className || inputGrade}
      value={texto}
      onChange={(evento) => {
        const valor = evento.target.value;
        setTexto(valor);
        const numero = parseNumeroBr(valor);
        if (numero !== null) p.aoMudar(numero);
      }}
      onBlur={() => {
        const numero = parseNumeroBr(texto);
        if (numero !== null) setTexto(formatarQuantia(numero));
      }}
    />
  );
}

function CampoPrecoCeasa(p: { inicial: number | null; versao: number; aoMudar: (valor: number | null) => void }) {
  const [texto, setTexto] = useState(() => (p.inicial == null ? '' : formatarQuantia(p.inicial)));
  const [versaoVista, setVersaoVista] = useState(p.versao);
  if (versaoVista !== p.versao) {
    setVersaoVista(p.versao);
    setTexto(p.inicial == null ? '' : formatarQuantia(p.inicial));
  }
  return (
    <input
      inputMode="decimal"
      placeholder="R$/kg"
      className={`${inputGrade} text-right`}
      value={texto}
      onChange={(evento) => {
        const valor = evento.target.value;
        setTexto(valor);
        if (!valor.trim()) {
          p.aoMudar(null);
          return;
        }
        const numero = parseNumeroBr(valor);
        if (numero !== null) p.aoMudar(numero);
      }}
      onBlur={() => {
        const numero = parseNumeroBr(texto);
        if (numero !== null) setTexto(formatarQuantia(numero));
      }}
    />
  );
}

function ZonaPdf(p: { titulo: string; detalhe: string; arquivo: File | null; aoEscolher: (arquivo: File | null) => void; opcional?: boolean }) {
  return (
    <div className={`flex flex-col gap-2 rounded-2xl border border-dashed p-4 ${p.opcional ? 'border-amber-300 bg-amber-50/40' : 'border-slate-300 bg-slate-50'}`}>
      <label className="flex cursor-pointer flex-col gap-1">
        <span className="text-sm font-black text-slate-900">
          {p.titulo}
          {p.opcional && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">Opcional</span>}
        </span>
        <span className="text-xs leading-relaxed text-slate-500">{p.detalhe}</span>
        <span className="mt-2 text-xs font-bold text-teal-700">{p.arquivo ? p.arquivo.name : 'Escolher PDF ou foto'}</span>
        <input
          type="file"
          accept="application/pdf,.pdf,image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(evento) => {
            p.aoEscolher(evento.target.files?.[0] || null);
            evento.target.value = '';
          }}
        />
      </label>
      {p.arquivo && (
        <button type="button" className="self-start cursor-pointer border-0 bg-transparent p-0 text-[11px] font-bold text-rose-600" onClick={() => p.aoEscolher(null)}>
          Tirar este arquivo
        </button>
      )}
    </div>
  );
}

export function AbaConciliacaoCompras(p: { onVoltar: () => void; lotes?: LoteConciliacao[]; aoArquivarLote?: (lote: LoteConciliacao) => void | boolean | Promise<void | boolean> }) {
  const [arquivoNota, setArquivoNota] = useState<File | null>(null);
  const [arquivoTabela, setArquivoTabela] = useState<File | null>(null);
  const [arquivoFaltantes, setArquivoFaltantes] = useState<File | null>(null);
  const [origem, setOrigem] = useState<OrigemPreco>('tabela2');
  const [origemUsada, setOrigemUsada] = useState<OrigemPreco>('tabela2');
  const [comparou, setComparou] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');
  const [avisos, setAvisos] = useState<string[]>([]);
  const [empresa, setEmpresa] = useState('Centro Espírita O Pobre de Deus');
  const [numeroNf, setNumeroNf] = useState('');
  const [dataNf, setDataNf] = useState('');
  const [dataCeasa, setDataCeasa] = useState('');
  const [linhas, setLinhas] = useState<LinhaTela[]>([]);
  const [itensTabela, setItensTabela] = useState<ItemTabela[]>([]);
  const [textoLido, setTextoLido] = useState('');
  const [loteAbertoId, setLoteAbertoId] = useState('');
  const [mesArquivo, setMesArquivo] = useState('');
  const [arquivando, setArquivando] = useState(false);

  const totais = useMemo(() => calcularTotais(linhas), [linhas]);
  const cabecalho = { empresa, numeroNf, dataNf, dataCeasa };
  const fonte = comparou ? origemUsada : origem;
  const rotuloOrigem = fonte === 'coluna2' ? 'Coluna 2' : 'Tabela 2';
  const semPreco = linhas.filter(linha => linha.semPreco).length;

  const alterar = (id: string, parcial: Partial<LinhaTela>) => {
    setLinhas(atual => atual.map(linha => (linha.id === id ? { ...linha, ...parcial } : linha)));
  };

  const montar = async () => {
    if (!arquivoNota || !arquivoTabela) {
      setErro('Anexe a nota fiscal e a tabela de preços. Pode ser PDF ou foto.');
      return;
    }
    setProcessando(true);
    setErro('');
    setAvisos([]);
    try {
      const leituras = await Promise.all([
        lerLinhasDoArquivo(arquivoNota),
        lerLinhasDoArquivo(arquivoTabela),
        arquivoFaltantes ? lerLinhasDoArquivo(arquivoFaltantes) : Promise.resolve(null)
      ]);
      const linhasNota = leituras[0].linhas;
      const linhasPreco = leituras[1].linhas;
      const linhasFaltantes = leituras[2]?.linhas || null;
      const nota = lerNota(linhasNota);
      const tabela = lerTabela2(linhasPreco, origem);
      const extra = linhasFaltantes ? lerTabela2(linhasFaltantes, origem) : null;
      const cruzados = cruzar(nota.produtos, tabela.itens);
      const completo = extra ? completarPrecos(cruzados, extra.itens) : { linhas: cruzados, preenchidos: 0 };
      const textoNota = linhasNota.map(linha => linha.texto).join('\n').trim();
      const textoTabela = linhasPreco.map(linha => linha.texto).join('\n').trim();
      const textoFaltantes = linhasFaltantes ? linhasFaltantes.map(linha => linha.texto).join('\n').trim() : '';
      const novosAvisos = [...nota.avisos, ...tabela.avisos];
      if (extra) novosAvisos.push(...extra.avisos.map(aviso => `PDF dos que faltam: ${aviso}`));
      if (leituras[0].usouFoto) novosAvisos.push('A nota era uma foto ou um PDF sem texto. Li a imagem. Confira os produtos e os preços.');
      if (leituras[1].usouFoto) novosAvisos.push('A tabela era uma foto ou um PDF sem texto. Li a imagem. Confira os preços, porque uma foto pode trocar um número.');
      if (leituras[2]?.usouFoto) novosAvisos.push('O arquivo dos que faltam era uma foto ou um PDF sem texto. Li a imagem. Confira os preços.');
      if (!leituras[0].usouFoto && textoNota.length < 40) novosAvisos.unshift('A nota fiscal quase não tem texto. Envie o PDF original ou uma foto nítida da folha inteira.');
      if (!leituras[1].usouFoto && textoTabela.length < 40) novosAvisos.unshift('A tabela de preços quase não tem texto. Envie o PDF original ou uma foto nítida da folha inteira.');
      if (linhasFaltantes && leituras[2] && !leituras[2].usouFoto && textoFaltantes.length < 40) novosAvisos.unshift('O arquivo dos produtos que faltam quase não tem texto. Envie o PDF original ou uma foto nítida.');
      if (extra && completo.preenchidos > 0) novosAvisos.push(`O PDF dos que faltam completou ${completo.preenchidos} produto(s). O que continuar sem preço dá para incluir na mão.`);
      if (extra && completo.preenchidos === 0 && cruzados.some(linha => linha.semPreco)) novosAvisos.push('O PDF dos que faltam não encontrou os produtos que ainda estavam sem preço. Eles continuam para você digitar.');
      setAvisos(novosAvisos);
      setTextoLido(`NOTA FISCAL\n${textoNota || '(vazio)'}\n\nTABELA DE PREÇOS\n${textoTabela || '(vazio)'}${linhasFaltantes ? `\n\nPDF DOS QUE FALTAM\n${textoFaltantes || '(vazio)'}` : ''}`);
      setEmpresa(nota.empresa || 'Centro Espírita O Pobre de Deus');
      setNumeroNf(nota.numero);
      setDataNf(nota.data);
      setDataCeasa(tabela.data || extra?.data || '');
      setItensTabela([...tabela.itens, ...(extra?.itens || [])]);
      setOrigemUsada(origem);
      setComparou(true);
      setLoteAbertoId('');
      setLinhas(completo.linhas.map(linha => ({ ...linha, versao: 0, destaque: false, marca: 'nenhuma' as const, justificativa: '' })));
      if (!nota.produtos.length) setErro('A nota foi lida, mas nenhum produto entrou na grade. Veja o texto lido abaixo ou inclua o produto na mão.');
    } catch (falha) {
      const mensagem = falha instanceof Error ? falha.message : 'Não foi possível ler os arquivos.';
      setErro(`Falha ao ler a nota ou a tabela. ${mensagem}`);
    } finally {
      setProcessando(false);
    }
  };

  const incluirProduto = () => {
    setLinhas(atual => [
      ...atual,
      {
        id: crypto.randomUUID(),
        produto: '',
        quantidade: 0,
        unidade: 'KG',
        precoNf: 0,
        precoCeasa: null,
        semPreco: true,
        detalhe: 'Sem preço na tabela',
        versao: 0,
        destaque: false,
        marca: 'nenhuma',
        justificativa: ''
      }
    ]);
  };

  const buscarDeNovo = (id: string, produto: string) => {
    const nome = produto.trim();
    if (!itensTabela.length || !nome) return;
    setLinhas(atual => atual.map(linha => {
      if (linha.id !== id) return linha;
      const achado = cruzar([{ produto: nome, quantidade: linha.quantidade, unidade: linha.unidade || 'KG', precoNf: linha.precoNf }], itensTabela)[0];
      if (!achado) return { ...linha, produto: nome };
      return {
        ...linha,
        produto: nome,
        precoCeasa: achado.precoCeasa,
        semPreco: achado.semPreco,
        detalhe: achado.detalhe,
        versao: linha.versao + 1
      };
    }));
  };

  const irParaJustificativa = (id: string) => {
    window.setTimeout(() => {
      document.getElementById('justificativas-distorcoes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById(`justificativa-${id}`)?.focus();
    }, 50);
  };

  const marcarLinha = (id: string, marca: MarcaRelatorio) => {
    setLinhas(atual => {
      const atualLinha = atual.find(item => item.id === id);
      const nova = atualLinha?.marca === marca ? 'nenhuma' : marca;
      if (nova !== 'nenhuma') irParaJustificativa(id);
      return atual.map(linha => (
        linha.id === id ? { ...linha, marca: nova, destaque: nova === 'vermelha' } : linha
      ));
    });
  };

  const clicarItemTabela = (evento: React.MouseEvent<HTMLTableRowElement>, linha: LinhaTela, diferenca: number | null) => {
    const alvo = evento.target as HTMLElement;
    if (alvo.closest('input, textarea, button, select, a')) return;
    if (diferenca == null) return;
    marcarLinha(linha.id, 'vermelha');
  };

  const falarJustificativa = (id: string) => {
    const gravacao = reconhecimentoDeFala();
    if (!gravacao) {
      setErro('Este navegador não grava a fala. Digite a justificativa.');
      return;
    }
    gravacao.lang = 'pt-BR';
    gravacao.interimResults = false;
    gravacao.onresult = (evento: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => {
      const dito = evento.results[0]?.[0]?.transcript?.trim();
      if (!dito) return;
      setLinhas(atual => atual.map(linha => (
        linha.id === id ? { ...linha, justificativa: linha.justificativa ? `${linha.justificativa} ${dito}` : dito } : linha
      )));
    };
    gravacao.start();
  };

  const lotes = p.lotes || [];
  const meses = useMemo(() => mesesComLote(lotes), [lotes]);
  const mesAtivo = mesArquivo && meses.includes(mesArquivo) ? mesArquivo : (meses[0] || '');
  const lotesMes = useMemo(() => lotesDoMes(lotes, mesAtivo), [lotes, mesAtivo]);

  const abrirLote = (lote: LoteConciliacao) => {
    setLoteAbertoId(lote.id);
    setEmpresa(lote.empresa || 'Centro Espírita O Pobre de Deus');
    setNumeroNf(lote.numeroNf || '');
    setDataNf(lote.dataNf || '');
    setDataCeasa(lote.dataCeasa || '');
    setOrigem(lote.origem === 'coluna2' ? 'coluna2' : 'tabela2');
    setOrigemUsada(lote.origem === 'coluna2' ? 'coluna2' : 'tabela2');
    setComparou(true);
    setLinhas((lote.linhas || []).map(item => ({
      id: crypto.randomUUID(),
      produto: item.produto,
      quantidade: item.quantidade,
      unidade: item.unidade || 'KG',
      precoNf: item.precoNf,
      precoCeasa: item.precoCeasa,
      semPreco: item.semPreco,
      detalhe: item.detalhe,
      versao: 0,
      destaque: item.marca === 'vermelha',
      marca: item.marca || 'nenhuma',
      justificativa: item.justificativa || ''
    })));
    setAvisos([`Relatório da NF ${lote.numeroNf || 'sem número'} de ${lote.dataNf || rotuloMes(lote.mes)}.`]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const arquivarLote = async () => {
    if (!linhas.length) {
      setErro('Monte a comparação antes de arquivar o lote.');
      return;
    }
    if (!p.aoArquivarLote) {
      setErro('Não foi possível arquivar o lote neste aparelho.');
      return;
    }
    setArquivando(true);
    setErro('');
    try {
      const loteBase = montarLoteConciliacao({
        id: loteAbertoId || undefined,
        empresa,
        numeroNf,
        dataNf,
        dataCeasa,
        origem: origemUsada,
        linhas
      });
      let imagem: Blob | null = null;
      for (const escala of [1, 0.8, 0.65]) {
        imagem = await gerarImagemConciliacao(cabecalho, linhas, { tipo: 'image/jpeg', qualidade: 0.7, escala });
        if (imagem.size <= 300000) break;
      }
      if (!imagem || imagem.size > 300000) {
        throw new Error('A imagem ficou grande demais para arquivar. Reduza a quantidade de linhas ou arquive em mais de um lote.');
      }
      const imagemRelatorioId = loteBase.imagemRelatorioId || `nf-ceasa-${loteBase.id}`;
      const respostaImagem = await fetch('/api/foto', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: imagemRelatorioId, foto: await blobParaDataUrl(imagem) })
      });
      if (!respostaImagem.ok) {
        const detalhe = await respostaImagem.json().catch(() => ({}));
        throw new Error(typeof detalhe.erro === 'string' ? detalhe.erro : 'Não foi possível guardar a imagem na nuvem.');
      }
      const lote = { ...loteBase, imagemRelatorioId };
      setLoteAbertoId(lote.id);
      setMesArquivo(lote.mes);
      const salvoNaNuvem = await p.aoArquivarLote(lote);
      if (salvoNaNuvem === false) {
        setErro('O lote e a imagem ficaram neste aparelho, mas o histórico não foi confirmado na nuvem. Tente arquivar novamente.');
        return;
      }
      setAvisos(atual => [
        ...atual.filter(item => !item.startsWith('Lote arquivado')),
        `Lote e imagem arquivados. Acesse Consultas de NF vs CEASA para ver os dados de ${rotuloMes(lote.mes)}.`
      ]);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível arquivar o lote e a imagem.');
    } finally {
      setArquivando(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl">
      <CabecalhoAba
        voltar={{ texto: 'Conciliação', aoClicar: p.onVoltar }}
        etiqueta="Conciliação de compras"
        titulo="NF x CEASA"
        descricao="Anexe a nota e a tabela de preços. Se faltar produto, anexe outro PDF: ele completa só o que ficou sem preço. O restante você inclui na mão."
        acoes={linhas.length > 0 ? (
          <>
            <button type="button" className={botaoSecundario} onClick={() => baixarExcelConciliacao(cabecalho, linhas)}>Excel</button>
            <button
              type="button"
              className={botaoSecundario}
              onClick={() => {
                if (!imprimirConciliacao(cabecalho, linhas)) setErro('O navegador bloqueou a janela de impressão.');
              }}
            >
              Imprimir
            </button>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border-0 bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1ebe5d]"
              onClick={() => {
                void enviarImagemWhatsappConciliacao(cabecalho, linhas).then(resultado => {
                  if (resultado === 'cancelado' || resultado === 'enviado') return;
                  if (resultado === 'baixado') {
                    setAvisos(atual => [
                      ...atual.filter(item => !item.startsWith('A imagem foi baixada')),
                      'A imagem foi baixada neste computador. No WhatsApp, anexe o arquivo comparacao-nf-ceasa.png na conversa.'
                    ]);
                    return;
                  }
                  setErro('O navegador bloqueou o WhatsApp. A imagem foi baixada: anexe o arquivo comparacao-nf-ceasa.png na conversa.');
                }).catch(() => setErro('Não consegui montar a imagem do relatório.'));
              }}
            >
              WhatsApp imagem
            </button>
            <button type="button" className={botaoPrimario} disabled={arquivando} onClick={() => { void arquivarLote(); }}>
              {arquivando ? 'Salvando lote e imagem...' : 'Arquivar para consultas'}
            </button>
          </>
        ) : undefined}
      />

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-slate-500">Localizar relatório por mês</p>
        {meses.length === 0 ? (
          <p className="mb-0 mt-2 text-sm text-slate-500">Quando você arquivar um lote, ele aparece aqui separado por mês da nota.</p>
        ) : (
          <>
            <label className="mt-3 flex max-w-xs flex-col text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Mês
              <select className={`${campo} mt-1 normal-case`} value={mesAtivo} onChange={(evento) => setMesArquivo(evento.target.value)}>
                {meses.map(mes => (
                  <option key={mes} value={mes}>{rotuloMes(mes)} ({lotesDoMes(lotes, mes).length})</option>
                ))}
              </select>
            </label>
            <ul className="mb-0 mt-3 flex list-none flex-col gap-2 p-0">
              {lotesMes.map(lote => (
                <li key={lote.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div>
                    <strong className="block text-sm text-slate-900">NF {lote.numeroNf || 'sem número'} · {lote.dataNf || rotuloMes(lote.mes)}</strong>
                    <span className="text-xs text-slate-500">{lote.linhas.length} produto(s) · {formatarMoeda(lote.totalNf)}</span>
                  </div>
                  <button type="button" className={botaoSecundario} onClick={() => abrirLote(lote)}>Ver relatório</button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-3">
        <ZonaPdf
          titulo="PDF da nota fiscal"
          detalhe="PDF da nota ou uma foto nítida. O sistema lê o produto, os quilos e o preço."
          arquivo={arquivoNota}
          aoEscolher={setArquivoNota}
        />
        <ZonaPdf
          titulo="PDF da tabela de preços"
          detalhe="PDF ou foto do boletim da CEASA, da Tabela 2 ou da Coluna 2. No boletim, o preço usado é o da coluna MC. A folha da Ibiapaba, com frutas e hortaliças juntas, também serve."
          arquivo={arquivoTabela}
          aoEscolher={setArquivoTabela}
        />
        <ZonaPdf
          titulo="PDF dos produtos que faltam"
          detalhe="Completa só o que a primeira tabela não encontrou. O que ainda ficar sem preço você inclui na mão."
          arquivo={arquivoFaltantes}
          aoEscolher={setArquivoFaltantes}
          opcional
        />
      </div>

      <div className="mb-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">Usar nos PDFs de preços</p>
        <div className={segmentado}>
          <button type="button" className={classeSegmento(origem === 'tabela2')} onClick={() => setOrigem('tabela2')}>Tabela 2</button>
          <button type="button" className={classeSegmento(origem === 'coluna2')} onClick={() => setOrigem('coluna2')}>Coluna 2</button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <button type="button" className={botaoPrimario} disabled={processando} onClick={() => { void montar(); }}>
          {processando ? 'Lendo os arquivos...' : 'Montar comparação'}
        </button>
        <button type="button" className={botaoSecundario} onClick={incluirProduto}>Incluir produto na mão</button>
      </div>

      {erro && <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 ring-1 ring-rose-100">{erro}</p>}
      {avisos.length > 0 && (
        <ul className="mb-4 list-disc rounded-2xl bg-amber-50 px-8 py-3 text-sm text-amber-900 ring-1 ring-amber-100">
          {avisos.map(aviso => <li key={aviso}>{aviso}</li>)}
        </ul>
      )}

      {linhas.length > 0 && (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <Cartao titulo="Produtos da nota" valor={String(linhas.length)} cor="slate" />
            <Cartao titulo={`Com preço da ${rotuloOrigem}`} valor={String(linhas.length - semPreco)} cor="teal" />
            <Cartao titulo="Sem preço na tabela" valor={String(semPreco)} cor="amber" detalhe="Dá para digitar só esses" />
          </div>

          <div className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex flex-col text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:col-span-2">Empresa
              <input className={`${campo} mt-1 normal-case`} value={empresa} onChange={(evento) => setEmpresa(evento.target.value)} />
            </label>
            <label className="flex flex-col text-[11px] font-bold uppercase tracking-wide text-slate-500">Número da NF
              <input className={`${campo} mt-1`} value={numeroNf} onChange={(evento) => setNumeroNf(evento.target.value)} />
            </label>
            <label className="flex flex-col text-[11px] font-bold uppercase tracking-wide text-slate-500">Data da NF
              <input className={`${campo} mt-1`} value={dataNf} onChange={(evento) => setDataNf(evento.target.value)} placeholder="20/08/2026" />
            </label>
            <label className="flex flex-col text-[11px] font-bold uppercase tracking-wide text-slate-500">Data CEASA
              <input className={`${campo} mt-1`} value={dataCeasa} onChange={(evento) => setDataCeasa(evento.target.value)} placeholder="18/08/2026" />
            </label>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="px-4 py-4 text-center">
              <h3 className="m-0 text-base font-black tracking-tight text-slate-900 sm:text-lg">RELATÓRIO DE COMPARAÇÃO DE PREÇOS - NF x CEASA</h3>
              <p className="mb-0 mt-1 text-xs text-slate-500">{subtituloRelatorio(cabecalho)}</p>
              <p className="mb-0 mt-2 text-[11px] font-semibold text-slate-600">Clique no item com distorção alta para pintar a linha de vermelho e abrir a justificativa. A seta verde marca preço excelente para a instituição.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-sm">
                <thead>
                  <tr className="bg-[#1e4b7a] text-left text-[11px] font-bold uppercase tracking-wide text-white">
                    <th className="px-3 py-3">Produto</th>
                    <th className="px-3 py-3 text-right leading-tight">
                      <span className="block text-[10px] font-semibold normal-case tracking-normal">kg/unid</span>
                      Quantidade
                    </th>
                    <th className="px-3 py-3 text-right">Preço NF</th>
                    <th className="px-3 py-3 text-right">Preço CEASA</th>
                    <th className="px-3 py-3 text-right">Total NF</th>
                    <th className="px-3 py-3 text-right">Total CEASA</th>
                    <th className="px-3 py-3 text-right">Diferença %</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((linha, indice) => {
                    const conta = calcularLinha(linha.quantidade, linha.precoNf, linha.precoCeasa);
                    const marca = marcaDaLinha(linha);
                    const fundo = marca === 'vermelha' ? 'bg-red-200' : marca === 'verde' ? 'bg-emerald-100' : (indice % 2 === 0 ? 'bg-white' : 'bg-[#eef3f8]');
                    return (
                      <tr key={linha.id} className={`${fundo} cursor-pointer`} onClick={(evento) => clicarItemTabela(evento, linha, conta.diferenca)}>
                        <td className="px-3 py-2 align-top">
                          <div className="flex items-start gap-2">
                            <div className="mt-1 flex shrink-0 flex-col gap-1">
                              <button
                                type="button"
                                title="Distorção alta"
                                className={`cursor-pointer rounded-md border px-2 py-1 text-sm leading-none ${marca === 'vermelha' ? 'border-red-400 bg-red-300' : 'border-red-200 bg-white'}`}
                                onClick={() => marcarLinha(linha.id, 'vermelha')}
                              >
                                🔴
                              </button>
                              <button
                                type="button"
                                title="Preço excelente"
                                className={`cursor-pointer rounded-md border px-2 py-1 text-sm leading-none ${marca === 'verde' ? 'border-emerald-400 bg-emerald-200' : 'border-emerald-200 bg-white'}`}
                                onClick={() => marcarLinha(linha.id, 'verde')}
                              >
                                🟢
                              </button>
                            </div>
                            <div className="min-w-0 flex-1">
                              <input
                                className={inputGrade}
                                value={linha.produto}
                                onChange={(evento) => alterar(linha.id, { produto: evento.target.value })}
                                onBlur={(evento) => {
                                  if (linha.semPreco) buscarDeNovo(linha.id, evento.target.value);
                                }}
                              />
                              <span className={`mt-1 block text-[11px] font-semibold ${linha.semPreco ? 'text-amber-700' : 'text-teal-700'}`}>{linha.detalhe}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <CampoNumero versao={linha.versao} inicial={linha.quantidade} className={`${inputGrade} text-right`} aoMudar={(valor) => alterar(linha.id, { quantidade: valor })} />
                        </td>
                        <td className="px-3 py-2 align-top">
                          <CampoNumero versao={linha.versao} inicial={linha.precoNf} className={`${inputGrade} text-right`} aoMudar={(valor) => alterar(linha.id, { precoNf: valor })} />
                        </td>
                        <td className="px-3 py-2 align-top">
                          {linha.semPreco && <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-amber-700">Sem preço na tabela</span>}
                          <CampoPrecoCeasa
                            versao={linha.versao}
                            inicial={linha.precoCeasa}
                            aoMudar={(valor) => alterar(linha.id, {
                              precoCeasa: valor,
                              semPreco: valor == null,
                              detalhe: valor == null ? 'Sem preço na tabela' : 'Preço digitado na mão'
                            })}
                          />
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-slate-800">{formatarMoeda(conta.totalNf)}</td>
                        <td className="px-3 py-3 text-right text-slate-700">{conta.totalCeasa == null ? '—' : formatarMoeda(conta.totalCeasa)}</td>
                        <td className="px-3 py-3 text-right font-semibold text-slate-800">{conta.diferenca == null ? '—' : formatarDiferencaSinal(conta.diferenca)}</td>
                        <td className="px-2 py-2 text-right align-top">
                          <button type="button" className="cursor-pointer border-0 bg-transparent px-2 py-1 text-[11px] font-bold text-rose-600" onClick={() => setLinhas(atual => atual.filter(item => item.id !== linha.id))}>
                            Tirar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t border-slate-200 bg-slate-50 font-black text-slate-900">
                    <td className="px-3 py-3 text-right" colSpan={4}>TOTAL GERAL</td>
                    <td className="px-3 py-3 text-right">{formatarMoeda(totais.totalNf)}</td>
                    <td className="px-3 py-3 text-right">{formatarMoeda(totais.totalCeasa)}</td>
                    <td />
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="w-full min-w-[720px] border-collapse overflow-hidden rounded-xl text-sm">
                <thead>
                  <tr className="bg-[#1e4b7a] text-white">
                    <th className="px-3 py-3 text-center text-[12px] font-black tracking-wide" colSpan={3}>QUADRO DE INDICADORES GLOBAIS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border border-slate-200 bg-white">
                    <td className="px-3 py-2 font-semibold">Valor Total Pago (NF)</td>
                    <td className="px-3 py-2 text-right font-black">{formatarMoeda(totais.totalNf)}</td>
                    <td className="px-3 py-2 text-slate-600">Custo real total documentado nas Notas Fiscais.</td>
                  </tr>
                  <tr className="border border-slate-200 bg-white">
                    <td className="px-3 py-2 font-semibold">Economia Potencial em Dinheiro</td>
                    <td className="px-3 py-2 text-right font-black text-emerald-700">{formatarMoeda(totais.margemValor)}</td>
                    <td className="px-3 py-2 text-slate-600">O valor exato em dinheiro que a instituição pagaria a mais em relação à CEASA.</td>
                  </tr>
                  <tr className="border border-slate-200 bg-white">
                    <td className="px-3 py-2 font-semibold">Diferença Média de Preço</td>
                    <td className="px-3 py-2 text-right font-black">{totais.margemPct == null ? '—' : formatarPercentual(totais.margemPct)}</td>
                    <td className="px-3 py-2 text-slate-600">O percentual médio que a Nota Fiscal ficou acima do preço de referência da CEASA.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {totais.incompleto && (
              <p className="mx-4 mb-4 mt-0 text-xs font-semibold text-amber-800">A margem considera só os produtos que têm preço da {rotuloOrigem}. Os demais continuam na nota e podem ser preenchidos na mão.</p>
            )}
            <div id="justificativas-distorcoes" className="border-t border-slate-200 bg-slate-50 px-4 py-4">
              <h4 className="m-0 text-sm font-black uppercase tracking-wide text-slate-900">Justificativa das principais distorções (em tópicos)</h4>
              {linhas.filter(linha => marcaDaLinha(linha) !== 'nenhuma').length === 0 ? (
                <p className="mb-0 mt-2 text-sm text-slate-500">Clique no item da tabela ou na bolinha vermelha/verde para abrir o campo aqui.</p>
              ) : (
                <ul className="mb-0 mt-3 flex list-none flex-col gap-3 p-0">
                  {linhas.filter(linha => marcaDaLinha(linha) !== 'nenhuma').map(linha => {
                    const conta = calcularLinha(linha.quantidade, linha.precoNf, linha.precoCeasa);
                    const marca = marcaDaLinha(linha);
                    return (
                      <li key={linha.id} className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span>{marca === 'verde' ? '🟢' : '🔴'}</span>
                          <strong className="text-sm text-slate-900">{rotuloJustificativa(linha.produto, conta.diferenca)}</strong>
                          <button type="button" className="ml-auto cursor-pointer rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-700" onClick={() => falarJustificativa(linha.id)}>
                            Falar
                          </button>
                        </div>
                        <textarea
                          id={`justificativa-${linha.id}`}
                          className={`${campo} min-h-[72px] normal-case`}
                          placeholder="Digite ou fale a justificativa"
                          value={linha.justificativa}
                          onChange={(evento) => alterar(linha.id, { justificativa: evento.target.value })}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      {itensTabela.length > 0 && (
        <details className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <summary className="cursor-pointer text-sm font-bold text-slate-700">Preços lidos da {rotuloOrigem} ({itensTabela.length})</summary>
          <ul className="mb-0 mt-3 grid gap-1 pl-4 text-xs text-slate-600 sm:grid-cols-2">
            {itensTabela.map((item, indice) => (
              <li key={`${item.produto}-${indice}`}><strong className="text-slate-800">{item.produto}</strong> — {item.detalhe}</li>
            ))}
          </ul>
        </details>
      )}

      {textoLido && (
        <details className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <summary className="cursor-pointer text-sm font-bold text-slate-700">Ver o texto lido dos PDFs</summary>
          <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-slate-600">{textoLido}</pre>
        </details>
      )}
    </section>
  );
}
