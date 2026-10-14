import { useMemo, useState } from 'react';
import type { MovimentoCaixaOperacional, NaturezaMovimentoCaixa } from '../../tipos';
import { SALDO_INICIAL_CAIXA_OPERACIONAL } from '../../tipos';
import {
  CabecalhoAba,
  Cartao,
  TituloSecao,
  badgeNeutro,
  badgeSucesso,
  badgePerigo,
  botaoPrimario,
  campo,
  rotulo,
  secao,
  tabela,
  tabelaCaixa,
  cabecalhoTabela,
  th,
  td,
  linhaTabela
} from '../../componentes/ui';
import {
  ROTULO_NATUREZA,
  formatarDataHoraCaixa,
  formatarMoedaCaixa,
  historicoComSaldo,
  saldoAtualCaixa,
  tipoDaNatureza
} from './caixaOperacional';

const NATUREZAS: NaturezaMovimentoCaixa[] = ['aporte', 'reposicao', 'compra', 'emprestimo', 'debito'];

export function AbaCaixaOperacional(p: {
  movimentos: MovimentoCaixaOperacional[];
  nomeUsuario: string;
  adicionar: (item: Omit<MovimentoCaixaOperacional, 'id'>) => boolean | void;
  remover?: (id: string) => void;
}) {
  const [natureza, setNatureza] = useState<NaturezaMovimentoCaixa>('compra');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [responsavel, setResponsavel] = useState(p.nomeUsuario || '');
  const [erro, setErro] = useState('');

  const historico = useMemo(() => historicoComSaldo(p.movimentos), [p.movimentos]);
  const saldo = useMemo(() => saldoAtualCaixa(p.movimentos), [p.movimentos]);
  const tipo = tipoDaNatureza(natureza);
  const saldoBaixo = saldo < SALDO_INICIAL_CAIXA_OPERACIONAL * 0.2;

  const salvar = () => {
    const texto = descricao.trim();
    const quem = responsavel.trim();
    const numero = parseFloat(valor.replace(',', '.')) || 0;
    if (!texto) {
      setErro('Informe a categoria ou a descrição da movimentação.');
      return;
    }
    if (numero <= 0) {
      setErro('Informe um valor maior que zero.');
      return;
    }
    if (!quem) {
      setErro('Informe o responsável pela operação.');
      return;
    }
    if (tipo === 'saida' && numero > saldo) {
      setErro(`Saldo insuficiente. Disponível: ${formatarMoedaCaixa(saldo)}.`);
      return;
    }
    const ok = p.adicionar({
      criadoEm: new Date().toISOString(),
      tipo,
      natureza,
      descricao: texto,
      valor: numero,
      responsavel: quem
    });
    if (ok === false) return;
    setDescricao('');
    setValor('');
    setErro('');
  };

  return (
    <section className={secao}>
      <CabecalhoAba
        etiqueta="Financeiro"
        icone="💵"
        titulo="Caixa operacional"
        descricao="Caixa pequeno para aportes, reposição, compras, empréstimos e débitos. O saldo começa em R$ 3.700,00 e atualiza a cada movimentação."
      />

      <div className="mb-6">
        <Cartao
          titulo="Saldo atual"
          valor={formatarMoedaCaixa(saldo)}
          cor={saldo < 0 ? 'rose' : saldoBaixo ? 'amber' : 'emerald'}
          icone={saldo >= 0 ? '💰' : '⚠️'}
          detalhe={`Saldo inicial ${formatarMoedaCaixa(SALDO_INICIAL_CAIXA_OPERACIONAL)} · ${p.movimentos.length} movimentação${p.movimentos.length === 1 ? '' : 'ões'}`}
        />
      </div>

      <TituloSecao>Nova movimentação</TituloSecao>
      <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
        <label className={rotulo}>
          Tipo
          <select value={natureza} onChange={evento => setNatureza(evento.target.value as NaturezaMovimentoCaixa)} className={campo}>
            {NATUREZAS.map(opcao => (
              <option key={opcao} value={opcao}>
                {tipoDaNatureza(opcao) === 'entrada' ? 'Entrada' : 'Saída'} · {ROTULO_NATUREZA[opcao]}
              </option>
            ))}
          </select>
        </label>
        <label className={`${rotulo} sm:col-span-2 lg:col-span-1`}>
          Categoria / descrição
          <input
            type="text"
            value={descricao}
            onChange={evento => setDescricao(evento.target.value)}
            placeholder={tipo === 'entrada' ? 'Ex.: reposição do caixa' : natureza === 'debito' ? 'Ex.: débito no cartão' : 'Ex.: compra de gás ou empréstimo para João'}
            className={campo}
          />
        </label>
        <label className={rotulo}>
          Valor (R$)
          <input
            type="text"
            inputMode="decimal"
            value={valor}
            onChange={evento => setValor(evento.target.value)}
            placeholder="0,00"
            className={campo}
          />
        </label>
        <label className={rotulo}>
          Responsável
          <input
            type="text"
            value={responsavel}
            onChange={evento => setResponsavel(evento.target.value)}
            placeholder="Quem fez a operação"
            className={campo}
          />
        </label>
        <div className="flex items-end sm:col-span-2 lg:col-span-4">
          <button type="button" onClick={salvar} className={botaoPrimario}>
            Lançar {tipo === 'entrada' ? 'entrada' : 'saída'}
          </button>
        </div>
        {erro && <p className="m-0 text-sm font-bold text-rose-700 sm:col-span-2 lg:col-span-4">{erro}</p>}
      </div>

      <TituloSecao direita={<span className={badgeNeutro}>{historico.length} no histórico</span>}>
        Histórico de entradas e saídas
      </TituloSecao>
      <div className={tabelaCaixa}>
        <table className={tabela}>
          <thead className={cabecalhoTabela}>
            <tr>
              <th className={th}>Data e hora</th>
              <th className={th}>Tipo</th>
              <th className={th}>Descrição</th>
              <th className={`${th} text-right`}>Valor</th>
              <th className={th}>Responsável</th>
              <th className={`${th} text-right`}>Saldo resultante</th>
              {p.remover && <th className={th} />}
            </tr>
          </thead>
          <tbody>
            {historico.map(item => (
              <tr key={item.id} className={linhaTabela}>
                <td className={`${td} whitespace-nowrap text-xs text-slate-600`}>{formatarDataHoraCaixa(item.criadoEm)}</td>
                <td className={td}>
                  <span className={item.tipo === 'entrada' ? badgeSucesso : badgePerigo}>
                    {item.tipo === 'entrada' ? 'Entrada' : 'Saída'} · {ROTULO_NATUREZA[item.natureza]}
                  </span>
                </td>
                <td className={`${td} font-semibold text-slate-800`}>{item.descricao}</td>
                <td className={`${td} whitespace-nowrap text-right font-bold ${item.tipo === 'entrada' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {item.tipo === 'entrada' ? '+' : '−'} {formatarMoedaCaixa(item.valor)}
                </td>
                <td className={`${td} text-xs text-slate-600`}>{item.responsavel}</td>
                <td className={`${td} whitespace-nowrap text-right font-black text-teal-800`}>{formatarMoedaCaixa(item.saldoResultante)}</td>
                {p.remover && (
                  <td className={td}>
                    <button
                      type="button"
                      onClick={() => p.remover?.(item.id)}
                      className="cursor-pointer rounded-lg border-0 bg-transparent px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50"
                    >
                      Excluir
                    </button>
                  </td>
                )}
              </tr>
            ))}
            <tr className={linhaTabela}>
              <td className={`${td} text-xs text-slate-500`}>Abertura</td>
              <td className={td}><span className={badgeNeutro}>Saldo inicial</span></td>
              <td className={`${td} font-semibold text-slate-700`}>Caixa operacional</td>
              <td className={`${td} text-right font-bold text-slate-800`}>{formatarMoedaCaixa(SALDO_INICIAL_CAIXA_OPERACIONAL)}</td>
              <td className={`${td} text-xs text-slate-500`}>Sistema</td>
              <td className={`${td} text-right font-black text-teal-800`}>{formatarMoedaCaixa(SALDO_INICIAL_CAIXA_OPERACIONAL)}</td>
              {p.remover && <td className={td} />}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
