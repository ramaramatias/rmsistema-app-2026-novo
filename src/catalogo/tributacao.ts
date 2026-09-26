export function normalizarNomeProduto(texto: string) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Redução do Decreto 33.327/2019, casada pelo nome do produto. */
export function tributacaoDoProduto(nome: string, secao?: string): string | undefined {
  const n = normalizarNomeProduto(nome);
  const sec = normalizarNomeProduto(secao || '');
  if (!n) return undefined;

  if (sec === 'sorvete' || /\b(sorvete|picole)\b/.test(n)) return '100%';

  if (/\babsorvente\b/.test(n)) return '100%';
  if (/\bfralda/.test(n)) return '66.11%';
  if (/agua sanitaria/.test(n)) return '66.11%';
  if (/alcool/.test(n) && /\bgel\b/.test(n)) return '66.11%';
  if (/creme dental|pasta de dente|pasta dental/.test(n)) return '66.11%';
  if (/\bdesinfetante\b/.test(n)) return '66.11%';
  if (/\bdesodorante\b/.test(n)) return '33.33%';
  if (/\bdetergente\b/.test(n)) return '66.11%';
  if (/escova dental|escova de dente/.test(n)) return '66.11%';
  if (/\bsabonete\b/.test(n) && !/liquido|intimo/.test(n)) return '33.33%';
  if (/\b(shampoo|xampu)\b/.test(n)) return '33.33%';
  if (/papel higienico/.test(n)) return '66.11%';
  if (/\bsabao\b/.test(n) && !/\bsabonete\b/.test(n)) return '61.11%';

  if (/agua mineral/.test(n) && /\b(10|20)\s*(l|lt|litros)\b/.test(n)) return '66.11%';
  if (/agua mineral/.test(n)) return '100%';
  if (/\brefri\b|refrigerante/.test(n)) return '100%';

  if ((/\bqueijo\b/.test(n) || /\brequeijao\b/.test(n))
    && !/cheetos|fandangos|pringles|doritos|lays|snack|batata|salgad/.test(n)) return '100%';
  if (/leite em po|\bleite po\b/.test(n)) return '66.11%';
  if (/\bleite condensado\b/.test(n) && !/recheio/.test(n)) return '100%';
  if (/\bcreme de leite\b/.test(n)) return '100%';
  if (/\bleite\b/.test(n) && /uht|longa vida/.test(n) && !/ferm|fermentado|beb lactea|iogurte|creme/.test(n)) return '61.11%';
  if (/\bleite\b/.test(n) && /pasteurizado|in natura|resfriado/.test(n) && !/uht|longa vida|ferm|fermentado/.test(n)) return '100%';
  if (/^leite /.test(n) && !/ferm|fermentado|condensado|coco|po|creme|doce/.test(n)) return '61.11%';

  if (/\bmargarina\b|\bcreme vegetal\b/.test(n)) return '61.11%';
  if (/\bacucar\b/.test(n) && !/zero acucar|sem acucar|s acucar/.test(n)) return '61.11%';
  if (/\barroz\b/.test(n) && !/farinha de arroz|flocao de arroz/.test(n)) return '61.11%';
  if (/\bbanha\b/.test(n)) return '61.11%';
  if (/\bcafe\b/.test(n) && !/refri|beb |bebida|yobem|suplemento|choc|ao leite/.test(n)) return '61.11%';
  if (/farinha de trigo|farinha trigo/.test(n)) return '100%';
  if (/\bfecula\b|goma de mandioca/.test(n)) return '61.11%';
  if (/\bflocao\b|\bcuscuz\b|\bfuba\b|flocos de milho|farinha de milho/.test(n) && !/arroz/.test(n)) return '61.11%';
  if ((/mel de abelha/.test(n) || /^mel\b/.test(n) || /kit com 1 mel/.test(n)) && !/barra|iogurte|melancia|melao/.test(n)) return '61.11%';
  if (/\boleo\b/.test(n) && /soja|algodao|palma|dende/.test(n)) return '61.11%';
  if ((/^sal\b/.test(n) || /\bsal (de cozinha|grosso|sache|fino|refinado|iodado|light)\b/.test(n))
    && !/sal frutas|c sal|com sal/.test(n)) return '66.11%';
  if (/\b(sardinha|atum)\b/.test(n) && !/file de peixe/.test(n)) return '100%';

  if (/\b(abacate|abobora|banana|laranja|mamao|manga|maracuja|melancia|melao|pimentao|tomate)\b/.test(n)
    && !/suco|nectar|refri|fanta|sorvete|picole|doce|geleia|polpa|energetico|molho|atum|sardinha|ketchup|pizza|recheio|kapo|del valle|dafruta|tampico|isis|halls|trident|tic tac|mentos|snickers|iogurte|beb lactea|barra|refresco|essencia|aroma|ganache|azeitona|extrato|seco|choc/.test(n)) {
    return '61.11%';
  }
  if (/galinha caipira/.test(n)) return '61.11%';
  if (/\bovos\b/.test(n) && !/pascoa|choc|macarrao/.test(n)) return '61.11%';
  if (/\b(suino|suina)\b/.test(n) || /porco sitio|carne de porco/.test(n)) return '61.11%';

  return undefined;
}
