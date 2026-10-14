import type { LancamentoProducao, TipoLancamentoProducao, TurnoProducao } from '../../tipos';

export const DIAS_SEMANA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
export const DIAS_SEMANA_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** Converte 'AAAA-MM-DD' no dia da semana (0 = domingo) usando a data local, sem deslocamento de fuso. */
export const diaSemanaIso = (iso: string) => {
  const [ano, mes, dia] = String(iso || '').split('-').map(Number);
  if (!ano || !mes || !dia) return -1;
  return new Date(ano, mes - 1, dia).getDay();
};

export const formatarUn = (n: number) => `${Math.round(n).toLocaleString('pt-BR')} un`;
export const formatarKg = (n: number) => `${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`;

export type MetricaProducao = 'un' | 'kg';

export interface FiltroRelatorioProducao {
  inicio: string;
  fim: string;
  turno: 'TODOS' | TurnoProducao;
  tipo: 'TODOS' | TipoLancamentoProducao;
  metrica: MetricaProducao;
}

export interface DiaSemanaProducao {
  dia: number;
  lancamentos: number;
  un: number;
  kg: number;
  manhaUn: number;
  manhaKg: number;
  tardeUn: number;
  tardeKg: number;
  diasProduzidos: number;
  /** Valor na métrica escolhida (un ou kg). */
  valor: number;
  /** Média por dia produzido, na métrica escolhida. */
  media: number;
}

export interface DiaProducao {
  data: string;
  lancamentos: number;
  un: number;
  kg: number;
  turnos: Set<TurnoProducao>;
  produtos: Set<string>;
}

export interface RelatorioProducao {
  filtrados: LancamentoProducao[];
  diasSemana: DiaSemanaProducao[];
  maximo: number;
  ranking: DiaSemanaProducao[];
  melhor: DiaSemanaProducao | null;
  pior: DiaSemanaProducao | null;
  diario: DiaProducao[];
  totalUn: number;
  totalKg: number;
  diasProduzidos: number;
}

export const calcularRelatorioProducao = (lancamentos: LancamentoProducao[] | undefined, filtro: FiltroRelatorioProducao): RelatorioProducao => {
  const filtrados = (lancamentos || []).filter(item => {
    const dataOk = (!filtro.inicio || item.data >= filtro.inicio) && (!filtro.fim || item.data <= filtro.fim);
    const turnoOk = filtro.turno === 'TODOS' || item.turno === filtro.turno;
    const tipoOk = filtro.tipo === 'TODOS' || item.tipo === filtro.tipo;
    return dataOk && turnoOk && tipoOk;
  });

  const porDiaSemana = Array.from({ length: 7 }, (_, dia) => ({
    dia,
    lancamentos: 0,
    un: 0,
    kg: 0,
    manhaUn: 0,
    manhaKg: 0,
    tardeUn: 0,
    tardeKg: 0,
    datas: new Set<string>()
  }));
  const porData = new Map<string, DiaProducao>();
  let totalUn = 0;
  let totalKg = 0;

  filtrados.forEach(item => {
    const dia = diaSemanaIso(item.data);
    if (dia < 0) return;
    const un = Number(item.totalUnid) || 0;
    const kg = Number(item.peso) || 0;
    totalUn += un;
    totalKg += kg;

    const ds = porDiaSemana[dia];
    ds.lancamentos += 1;
    ds.un += un;
    ds.kg += kg;
    ds.datas.add(item.data);
    if (item.turno === 'Manhã') {
      ds.manhaUn += un;
      ds.manhaKg += kg;
    } else {
      ds.tardeUn += un;
      ds.tardeKg += kg;
    }

    const registro = porData.get(item.data) || { data: item.data, lancamentos: 0, un: 0, kg: 0, turnos: new Set<TurnoProducao>(), produtos: new Set<string>() };
    registro.lancamentos += 1;
    registro.un += un;
    registro.kg += kg;
    registro.turnos.add(item.turno);
    registro.produtos.add(item.produto);
    porData.set(item.data, registro);
  });

  const valorDe = (d: { un: number; kg: number }) => (filtro.metrica === 'un' ? d.un : d.kg);
  const diasSemana: DiaSemanaProducao[] = porDiaSemana.map(({ datas, ...d }) => ({
    ...d,
    diasProduzidos: datas.size,
    valor: valorDe(d),
    media: datas.size ? valorDe(d) / datas.size : 0
  }));
  const maximo = Math.max(0, ...diasSemana.map(d => d.valor));
  const ranking = diasSemana.filter(d => d.lancamentos > 0).sort((a, b) => b.valor - a.valor);
  const melhor = ranking[0] || null;
  const pior = ranking.length > 1 ? ranking[ranking.length - 1] : null;
  const diario = Array.from(porData.values()).sort((a, b) => b.data.localeCompare(a.data));

  return { filtrados, diasSemana, maximo, ranking, melhor, pior, diario, totalUn, totalKg, diasProduzidos: porData.size };
};
