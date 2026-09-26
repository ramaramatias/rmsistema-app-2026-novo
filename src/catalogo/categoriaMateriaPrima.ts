function normalizarNomeProduto(texto: string) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const CATEGORIAS_MATERIA_PRIMA = [
  'Hortifruti',
  'Carnes e frios',
  'Peixes',
  'Farinhas e fermentos',
  'Açúcares',
  'Lácteos',
  'Óleos e gorduras',
  'Chocolate e confeitaria',
  'Mercearia',
  'Temperos e molhos',
  'Café e bebidas',
  'Outros'
] as const;

export type CategoriaMateriaPrima = (typeof CATEGORIAS_MATERIA_PRIMA)[number];

export function categoriaMateriaPrima(nome: string): CategoriaMateriaPrima {
  const n = normalizarNomeProduto(nome);
  if (!n || n === 'excluido') return 'Outros';

  if (/essencia|aroma |corante|geleia de brilho|chantilly|gelatina|nescau|pacoquinha|confeito|ganache|recheio|cobertura|emulsificante|antimofo|sorbato|acido sorbico|cremogema|coragema|mistura p cake|po p decorar|po para decorar|po decorativo|fruta cristalizada|uva passa|figo calda|pessego calda|doce de goiaba|goiabada|nutella|creme de avela|creme confeiteiro|solucao alcoolica/
    .test(n)
    || (/\bcereja\b/.test(n) && !/tomate/.test(n))
    || (/\b(choc|chocolate|granulado|gotas de)\b/.test(n) && !/amendoim/.test(n))) {
    return 'Chocolate e confeitaria';
  }

  if (/leite condensado|creme de leite|requeijao|queijo|cream cheese|composto lacteo|creme de nata/.test(n)) {
    return 'Lácteos';
  }

  if (/farinha|amido|polvilho|fecula|fermento|massa madre|melhorador|amidmais|\bmaizena\b|massa p pastel/.test(n)) {
    return 'Farinhas e fermentos';
  }

  if (/acucar|adocante/.test(n)) return 'Açúcares';

  if (/margarina|oleo de|azeite|gordura/.test(n)) return 'Óleos e gorduras';

  if (/peixe|salmao|tilapia|merluza|panga|atum|camurupim|saithe|pescadilho/.test(n)) return 'Peixes';

  if (/presunto|apresuntado|peito de peru|lombo|pernil|bacon|carne|linguica|bife|bucho|lagarto|tripa|carre|mocoto|costela|cupim|patinho|bisteca|musculo|mortadela|frango|salsicha|picanha|file bovino|file mignon|coxao|lanche perdigao|coxa|paleta|pepperoni|barriga|sobrepaleta|pate de peito|suino|suina|bovino/.test(n)) {
    return 'Carnes e frios';
  }

  if (/molho|catchup|ketchup|mostarda|maionese|tempero|tmpero|caldo de|colorau|^sal\b|sal sache|sal grosso|vinagre|shoyu|shoyo|pimenta biquinho|molho de pimenta|alcaparra|azeitona|palmito|cogumelo|cebolinha cristal|ervas finas|folha de louro|\bcravo\b|canela|creme de cebola|cebola caramelizada|tomate seco|extrato de tomate|ervilha|milho bonare|gengibre em po/.test(n)
    || (/\bmanjericao\b/.test(n) && !/fresco/.test(n))) {
    return 'Temperos e molhos';
  }

  if (/polpa|abacaxi|mamao|tomate|beterraba|batata inglesa|batata doce|batata palito|cebola branca|cenoura|kiwi|repolho|uva roxa|uva verde|alho |fruta|banana|brocolis|acelga|alface|melancia|pimenta de cheiro|abacate|melao|pimentao|laranja|couve|berinjela|maracuja|manga|ameixa fresca|ameixa seca|chuchu|pepino|feijao verde|coco seco|espinafre|salsinha|manjericao fresco|abobrinha|macaxeira|morango|maca argentina|erva cidrera|cheiro verde|alho poro|seleta legumes|oregano|\bgengibre\b/.test(n) && !/tmpero|tempero|em po/.test(n)) {
    return 'Hortifruti';
  }

  if (/arroz|feijao|macarrao|fuba|flocao|aveia|granola|canjica|lentilha|tapioca|ovos|amendoim|gergelim|chia|castanha|coco ral|coco floc|leite de coco|biscoito|batata palha/.test(n)) {
    return 'Mercearia';
  }

  if (/cafe|vinho/.test(n)) return 'Café e bebidas';

  return 'Outros';
}
