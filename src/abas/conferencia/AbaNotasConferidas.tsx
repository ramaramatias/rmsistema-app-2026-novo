import { useMemo, useState } from 'react';
import type { RegistroConferencia } from '../../tipos';
import {
  CabecalhoAba,
  Cartao,
  TituloSecao,
  Vazio,
  campo,
  secao,
  tabela,
  tabelaCaixa,
  cabecalhoTabela,
  th,
  td,
  linhaTabela,
  badgeTeal,
  badgeNeutro,
  badgeAlerta
} from '../../componentes/ui';
import { formatarMoeda, montarRelatorioNotasConferidas } from './relatorioNotasConferidas';

export function AbaNotasConferidas(p: {
  conferencias: RegistroConferencia[];
  setTabAtiva: (aba: string) => void;
  voltarParaConferencia?: () => void;
}) {
  const [busca, setBusca] = useState('');
  const [mostrarBonificadas, setMostrarBonificadas] = useState(false);
  const notasNormais = useMemo(
    () => (p.conferencias || []).filter(conf => !(conf.veioBonificacao === true || conf.notaBonificada === true)),
    [p.conferencias]
  );
  const notasBonificadas = useMemo(
    () => (p.conferencias || []).filter(conf => conf.veioBonificacao === true || conf.notaBonificada === true),
    [p.conferencias]
  );
  const relatorio = useMemo(
    () => montarRelatorioNotasConferidas(notasNormais, busca),
    [notasNormais, busca]
  );
  const relatorioBonificadas = useMemo(
    () => montarRelatorioNotasConferidas(notasBonificadas, busca),
    [notasBonificadas, busca]
  );
  const maiorRanking = relatorio.ranking[0]?.total || 0;
  const topRanking = relatorio.ranking.slice(0, 8);

  return (
    <section className={secao}>
      <CabecalhoAba
        etiqueta="Compras · Conferência"
        icone="📋"
        titulo="Notas conferidas"
        descricao="Valores recebidos separados por fornecedor, com a data de cada nota e o total geral."
        voltar={{ texto: 'Voltar para Conferência', aoClicar: () => (p.voltarParaConferencia ? p.voltarParaConferencia() : p.setTabAtiva('conferencia')) }}
        acoes={
          <button
            type="button"
            onClick={() => p.setTabAtiva('compras')}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500"
          >
            Área de compras
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Cartao titulo="Notas" valor={relatorio.quantidadeNotas} cor="teal" detalhe="Conferências registradas" />
        <Cartao titulo="Fornecedores" valor={relatorio.grupos.length} cor="emerald" detalhe="Com nota conferida" />
        <Cartao titulo="Total recebido" valor={formatarMoeda(relatorio.totalGeral)} cor="amber" detalhe="Soma dos valores" />
        <button
          type="button"
          onClick={() => setMostrarBonificadas(atual => !atual)}
          className="cursor-pointer border-0 bg-transparent p-0 text-left"
        >
          <Cartao
            titulo="Notas bonificadas"
            valor={relatorioBonificadas.quantidadeNotas}
            cor="violet"
            detalhe={relatorioBonificadas.quantidadeNotas === 0 ? 'Nenhum brinde conferido' : formatarMoeda(relatorioBonificadas.totalGeral)}
          />
        </button>
      </div>

      {mostrarBonificadas && (
        <div className="mb-6">
          <TituloSecao direita={<span className={badgeAlerta}>{relatorioBonificadas.quantidadeNotas} nota{relatorioBonificadas.quantidadeNotas === 1 ? '' : 's'}</span>}>
            Notas bonificadas
          </TituloSecao>
          {relatorioBonificadas.grupos.length === 0 ? (
            <Vazio icone="🎁">Nenhuma nota bonificada ainda. Elas aparecem quando a conferência marca que o brinde veio.</Vazio>
          ) : (
            <div className="flex flex-col gap-4">
              {relatorioBonificadas.grupos.map(grupo => (
                <div key={`bonif-${grupo.chave}`} className={tabelaCaixa}>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-amber-50 px-4 py-3">
                    <strong className="text-sm font-black text-slate-900">{grupo.fornecedor}</strong>
                    <span className="text-xs font-bold text-amber-900">{grupo.notas.length} nota{grupo.notas.length === 1 ? '' : 's'}</span>
                  </div>
                  <table className={tabela}>
                    <thead className={cabecalhoTabela}>
                      <tr>
                        <th className={th}>Fornecedor</th>
                        <th className={th}>Data</th>
                        <th className={`${th} text-right`}>Valor do brinde</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupo.notas.map(nota => (
                        <tr key={nota.id} className={linhaTabela}>
                          <td className={`${td} font-semibold text-slate-800`}>{grupo.fornecedor}</td>
                          <td className={`${td} whitespace-nowrap text-slate-600`}>{nota.data}</td>
                          <td className={`${td} whitespace-nowrap text-right font-black text-amber-900`}>{formatarMoeda(nota.valorRecebido)}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-slate-200 bg-amber-50/70">
                        <td className={`${td} font-black text-slate-900`} colSpan={2}>Total {grupo.fornecedor}</td>
                        <td className={`${td} whitespace-nowrap text-right font-black text-amber-950`}>{formatarMoeda(grupo.total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <label className="mb-5 flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Pesquisar razão social / fornecedor</span>
        <input
          type="search"
          value={busca}
          onChange={evento => setBusca(evento.target.value)}
          placeholder="Digite o nome da razão social..."
          className={campo}
        />
      </label>

      <TituloSecao direita={<span className={badgeTeal}>{topRanking.length} no ranking</span>}>
        Ranking de fornecedores
      </TituloSecao>
      {topRanking.length === 0 ? (
        <Vazio icone="📦">Nenhuma nota conferida para montar o ranking.</Vazio>
      ) : (
        <div className="mb-6 grid gap-3 lg:grid-cols-2">
          {topRanking.map((item, indice) => {
            const largura = maiorRanking > 0 ? Math.max(8, (item.total / maiorRanking) * 100) : 8;
            return (
              <div key={`${item.fornecedor}-${indice}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-slate-400">#{indice + 1}</p>
                    <p className="m-0 truncate text-sm font-black text-slate-900">{item.fornecedor}</p>
                  </div>
                  <strong className="shrink-0 text-sm font-black text-teal-800">{formatarMoeda(item.total)}</strong>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${largura}%` }} />
                </div>
                <p className="mb-0 mt-2 text-[11px] font-semibold text-slate-500">
                  {item.entregas} nota{item.entregas === 1 ? '' : 's'} conferida{item.entregas === 1 ? '' : 's'}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <TituloSecao direita={<span className={badgeNeutro}>{relatorio.quantidadeNotas} nota{relatorio.quantidadeNotas === 1 ? '' : 's'}</span>}>
        Valores por fornecedor
      </TituloSecao>
      {relatorio.grupos.length === 0 ? (
        <Vazio icone="📭">
          {busca.trim()
            ? `Nenhuma nota conferida de “${busca.trim()}”.`
            : 'Nenhuma nota conferida ainda. Elas aparecem aqui depois da conferência.'}
        </Vazio>
      ) : (
        <div className="flex flex-col gap-4">
          {relatorio.grupos.map(grupo => (
            <div key={grupo.chave} className={tabelaCaixa}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <strong className="text-sm font-black text-slate-900">{grupo.fornecedor}</strong>
                <span className="text-xs font-bold text-slate-500">{grupo.notas.length} nota{grupo.notas.length === 1 ? '' : 's'}</span>
              </div>
              <table className={tabela}>
                <thead className={cabecalhoTabela}>
                  <tr>
                    <th className={th}>Fornecedor</th>
                    <th className={th}>Data</th>
                    <th className={`${th} text-right`}>Valor recebido</th>
                  </tr>
                </thead>
                <tbody>
                  {grupo.notas.map(nota => (
                    <tr key={nota.id} className={linhaTabela}>
                      <td className={`${td} font-semibold text-slate-800`}>{grupo.fornecedor}</td>
                      <td className={`${td} whitespace-nowrap text-slate-600`}>{nota.data}</td>
                      <td className={`${td} whitespace-nowrap text-right font-black text-teal-800`}>{formatarMoeda(nota.valorRecebido)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-slate-200 bg-teal-50/70">
                    <td className={`${td} font-black text-slate-900`} colSpan={2}>Total {grupo.fornecedor}</td>
                    <td className={`${td} whitespace-nowrap text-right font-black text-teal-900`}>{formatarMoeda(grupo.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 px-5 py-4 shadow-sm">
            <div>
              <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-teal-700">Total de tudo recebido</p>
              <p className="mb-0 mt-0.5 text-sm font-semibold text-slate-600">{relatorio.quantidadeNotas} nota{relatorio.quantidadeNotas === 1 ? '' : 's'} · {relatorio.grupos.length} fornecedor{relatorio.grupos.length === 1 ? '' : 'es'}</p>
            </div>
            <strong className="text-2xl font-black tracking-tight text-teal-900">{formatarMoeda(relatorio.totalGeral)}</strong>
          </div>
        </div>
      )}
    </section>
  );
}
