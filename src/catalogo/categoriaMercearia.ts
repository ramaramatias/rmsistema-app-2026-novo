function normalizarNomeProduto(texto: string) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const CATEGORIAS_MERCEARIA = [
  'Higiene pessoal',
  'Limpeza',
  'Café e chá',
  'Lácteos',
  'Salgadinhos',
  'Conservas',
  'Molhos',
  'Cereais',
  'Achocolatados e bebidas',
  'Doces e festa',
  'Frios',
  'Outros'
] as const;

export type CategoriaMercearia = (typeof CATEGORIAS_MERCEARIA)[number];

export function categoriaMercearia(nome: string): CategoriaMercearia {
  const n = normalizarNomeProduto(nome);
  if (!n) return 'Outros';

  if (/desodorante|\bdesod\b|shampoo|xampu|sabonete|absorvente|creme dental|escova |fio dental|enxaguante|prestobarba|gillette|kit viagem|dentrat|protetor solar/.test(n)) {
    return 'Higiene pessoal';
  }

  if (/amaciante|detergente|desinfetante|agua sanitaria|sabao/.test(n)) return 'Limpeza';

  if (/ruffles|lays|doritos|cheetos|fandangos|pringles|cebolitos|torcida|pirole|salgadinho|batata sens|snack salgado/.test(n)) {
    return 'Salgadinhos';
  }

  if (/sardinha|milho verde|ervilha|azeitona/.test(n)) return 'Conservas';

  if (/maionese|\bmolho\b|barbecue|oleo de gergelim/.test(n)) return 'Molhos';

  if (/\bcha\b/.test(n) || (/(\bcafe\b|nescafe|cappuccino|filtro de papel|porta filtro)/.test(n) && !/beb lac|bebida lactea/.test(n))) {
    return 'Café e chá';
  }

  if (/leite em po|margarina/.test(n)) return 'Lácteos';

  if (/aveia|farinha lactea|proteina de soja/.test(n)) return 'Cereais';

  if (/nescau|toddy|refresco|beb lac|bebida lactea|morango em po/.test(n)) return 'Achocolatados e bebidas';

  if (/bala |ovo super|ovo toys|ovo surpresa|chicle|vela |geleia|olhos famintos|barra proteina/.test(n)) {
    return 'Doces e festa';
  }

  if (/salame/.test(n)) return 'Frios';

  return 'Outros';
}
