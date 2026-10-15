import type { ItemChecklist } from '../tipos';

export const mesclarChecklist = (idsDeletados: string[], ...listas: Array<ItemChecklist[] | undefined>) => {
  const itens = new Map<string, ItemChecklist>();
  listas.flatMap(lista => lista || []).forEach(item => {
    if (!item?.id || idsDeletados.includes(item.id)) return;
    const atual = itens.get(item.id);
    if (!atual || String(item.atualizadoEm || '') >= String(atual.atualizadoEm || '')) {
      itens.set(item.id, item);
    }
  });
  return Array.from(itens.values()).sort((a, b) =>
    String(a.criadoEm || '').localeCompare(String(b.criadoEm || ''))
  );
};
