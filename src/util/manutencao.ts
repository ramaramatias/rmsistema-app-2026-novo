import type { StatusOrdemManutencao } from '../tipos';

export const statusOrdemNormalizado = (status?: string): Exclude<StatusOrdemManutencao, 'aberta'> =>
  status === 'andamento' ? 'andamento'
    : status === 'pausada' ? 'pausada'
    : status === 'concluida' ? 'concluida'
    : status === 'nao_realizada' ? 'nao_realizada'
    : 'pendente';

export const rotuloStatusOrdem = (status?: string) => {
  const atual = statusOrdemNormalizado(status);
  return atual === 'andamento' ? 'Em andamento'
    : atual === 'pausada' ? 'Pausada'
    : atual === 'concluida' ? 'Concluída'
    : atual === 'nao_realizada' ? 'Não realizada'
    : 'Pendente';
};

export const classeStatusOrdem = (status?: string) => {
  const atual = statusOrdemNormalizado(status);
  return atual === 'andamento' ? 'bg-amber-100 text-amber-800'
    : atual === 'pausada' ? 'bg-violet-100 text-violet-800'
    : atual === 'concluida' ? 'bg-emerald-100 text-emerald-800'
    : atual === 'nao_realizada' ? 'bg-slate-200 text-slate-700'
    : 'bg-sky-100 text-sky-800';
};

export const avancaoStatusOrdem = (status: StatusOrdemManutencao) => {
  const atual = statusOrdemNormalizado(status);
  return atual === 'concluida' || atual === 'nao_realizada' ? 2 : atual === 'andamento' || atual === 'pausada' ? 1 : 0;
};
