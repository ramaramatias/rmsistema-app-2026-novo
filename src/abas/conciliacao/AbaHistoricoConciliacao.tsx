import { useEffect, useMemo, useState } from 'react';
import type { LoteConciliacao } from '../../tipos';
import { CabecalhoAba, Cartao, botaoSecundario, campo } from '../../componentes/ui';
import { formatarMoeda, formatarNumero, formatarPercentual } from './parserConciliacao';
import { mesesComLote, produtosVendidosNoMes, resumoMensalConciliacao, rotuloMes } from './lotesConciliacao';

function ImagemDoLote(p: { lote: LoteConciliacao }) {
  const [imagem, setImagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!p.lote.imagemRelatorioId) return;
    let ativo = true;
    setCarregando(true);
    fetch(`/api/foto?id=${encodeURIComponent(p.lote.imagemRelatorioId)}`, { cache: 'no-store' })
      .then(async resposta => {
        if (!resposta.ok) throw new Error('Imagem indisponível');
        const dados = await resposta.json();
        if (ativo && typeof dados.foto === 'string' && dados.foto.startsWith('data:image')) {
          setImagem(dados.foto);
        }
      })
      .catch(() => {
        if (ativo) setImagem('');
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => { ativo = false; };
  }, [p.lote.imagemRelatorioId]);

  if (!p.lote.imagemRelatorioId) {
    return <p className="mb-0 mt-3 text-xs text-slate-500">Este lote não tem imagem salva.</p>;
  }
  if (carregando) return <p className="mb-0 mt-3 text-xs text-slate-500">Carregando imagem do relatório...</p>;
  if (!imagem) return <p className="mb-0 mt-3 text-xs text-amber-700">A imagem deste relatório não está disponível.</p>;

  return (
    <a
      href={imagem}
      download={`relatorio-nf-ceasa-${p.lote.numeroNf || p.lote.id}.jpg`}
      className="mt-3 block"
      aria-label={`Abrir ou baixar imagem da NF ${p.lote.numeroNf || 'sem número'}`}
    >
      <img src={imagem} alt={`Relatório NF ${p.lote.numeroNf || 'sem número'} x CEASA`} className="max-h-96 w-full rounded-xl border border-slate-200 bg-white object-contain" />
      <span className="mt-1 block text-xs font-bold text-teal-700">Toque na imagem para abrir ou baixar</span>
    </a>
  );
}

export function AbaHistoricoConciliacao(p: { lotes: LoteConciliacao[]; onVoltar: () => void }) {
  const mesAtual = (() => {
    const agora = new Date();
    return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
  })();
  const meses = useMemo(() => {
    const disponiveis = new Set([...mesesComLote(p.lotes), mesAtual]);
    return Array.from(disponiveis).sort((a, b) => b.localeCompare(a));
  }, [p.lotes, mesAtual]);
  const [mesSelecionado, setMesSelecionado] = useState(mesAtual);
  const mes = meses.includes(mesSelecionado) ? mesSelecionado : (meses[0] || mesAtual);
  const resumo = useMemo(() => resumoMensalConciliacao(p.lotes, mes), [p.lotes, mes]);
  const produtos = useMemo(() => produtosVendidosNoMes(resumo.lotes), [resumo.lotes]);

  return (
    <section className="mx-auto max-w-7xl">
      <CabecalhoAba
        voltar={{ texto: 'Conciliação', aoClicar: p.onVoltar }}
        etiqueta="Conciliação de compras"
        titulo="Consultas de NF vs CEASA"
        descricao="Veja por mês o que cada fornecedor vendeu, a média de produtos e de valor por nota, o total comprado e as imagens arquivadas."
      />

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
        <label className="flex max-w-sm flex-col text-[11px] font-bold uppercase tracking-wide text-slate-500">
          Mês da consulta
          <select className={`${campo} mt-1 normal-case`} value={mes} onChange={evento => setMesSelecionado(evento.target.value)}>
            {meses.map(opcao => (
              <option key={opcao} value={opcao}>{rotuloMes(opcao)}</option>
            ))}
          </select>
        </label>
        <p className="mb-0 mt-2 text-xs text-slate-500">
          O mês é determinado pela data da NF. Ao começar um novo mês, a contagem inicia automaticamente; os meses anteriores continuam disponíveis.
        </p>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Cartao titulo="Total comprado no mês" valor={formatarMoeda(resumo.totalNf)} cor="slate" detalhe={`${resumo.lotes.length} nota(s) arquivada(s)`} />
        <Cartao titulo="Média de valor por NF" valor={formatarMoeda(resumo.mediaTotalPorNf)} cor="emerald" detalhe="Média do valor recebido pelo fornecedor em cada nota" />
        <Cartao titulo="Produtos nas notas" valor={resumo.totalProdutos} cor="violet" detalhe="Linhas de produtos em todas as NFs do mês" />
        <Cartao titulo="Média de produtos por NF" valor={formatarNumero(resumo.mediaProdutosPorNf, 1)} cor="sky" detalhe="Média de linhas de produtos por nota" />
        <Cartao titulo="Referência CEASA" valor={formatarMoeda(resumo.totalCeasa)} cor="teal" detalhe="Soma dos valores comparados" />
        <Cartao
          titulo="Margem NF vs CEASA"
          valor={resumo.margemPct == null ? '—' : formatarPercentual(resumo.margemPct)}
          cor={resumo.margemValor > 0 ? 'rose' : 'teal'}
          detalhe={resumo.margemPct == null ? 'Sem valores CEASA comparáveis' : `${formatarMoeda(resumo.margemValor)} acima da referência`}
        />
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="m-0 text-base font-black text-slate-900">Produtos vendidos em {rotuloMes(mes)}</h3>
        {produtos.length === 0 ? (
          <p className="mb-0 mt-2 text-sm text-slate-500">Os produtos aparecem aqui depois de arquivar uma comparação de NF x CEASA.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3">Fornecedor</th>
                  <th className="px-3 py-3">Produto</th>
                  <th className="px-3 py-3 text-right">Quantidade vendida</th>
                  <th className="px-3 py-3 text-right">NFs</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map(produto => (
                  <tr key={`${produto.empresa}-${produto.produto}-${produto.unidade}`} className="border-t border-slate-100 even:bg-slate-50/40">
                    <td className="px-3 py-2.5">{produto.empresa}</td>
                    <td className="px-3 py-2.5">{produto.produto}</td>
                    <td className="px-3 py-2.5 text-right font-semibold">{formatarNumero(produto.quantidade)} {produto.unidade}</td>
                    <td className="px-3 py-2.5 text-right">{produto.notas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="m-0 text-base font-black text-slate-900">Lotes de {rotuloMes(mes)}</h3>
        {resumo.lotes.length === 0 ? (
          <p className="mb-0 mt-2 text-sm text-slate-500">Ainda não há lotes arquivados neste mês.</p>
        ) : (
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {resumo.lotes.map(lote => (
              <article key={lote.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="m-0 text-sm font-black text-slate-900">NF {lote.numeroNf || 'sem número'}</h4>
                    <p className="mb-0 mt-1 text-xs text-slate-500">{lote.empresa || 'Empresa não informada'} · {lote.dataNf || rotuloMes(lote.mes)}</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">{formatarMoeda(lote.totalNf)}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-white p-2"><span className="block text-slate-500">CEASA</span><strong>{formatarMoeda(lote.totalCeasa)}</strong></div>
                  <div className="rounded-lg bg-white p-2"><span className="block text-slate-500">Margem</span><strong>{lote.margemPct == null ? '—' : formatarPercentual(lote.margemPct)}</strong></div>
                </div>
                <ImagemDoLote lote={lote} />
              </article>
            ))}
          </div>
        )}
      </div>

      <button type="button" className={botaoSecundario} onClick={p.onVoltar}>Voltar às opções de conciliação</button>
    </section>
  );
}
