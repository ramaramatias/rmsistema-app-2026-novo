export type MarkupSessao = {
  id: string;
  nome: string;
  markup: number;
  lucro: string;
};

export const CHAVE_MARKUP = 'rm_markup_sessoes';

export const MARKUPS_SESSAO: MarkupSessao[] = [
  { id: 'artesanato', nome: 'Artesanato', markup: 75, lucro: '30%' },
  { id: 'bomboniere', nome: 'Bomboniere', markup: 87.5, lucro: '35%' },
  { id: 'laticinios', nome: 'Laticínios', markup: 87.5, lucro: '35%' },
  { id: 'requeijao', nome: 'Requeijão e manteigas', markup: 75, lucro: '30%' },
  { id: 'bebidas-viagem', nome: 'Bebidas viagem', markup: 60, lucro: 'ICMS ST' },
  { id: 'bebidas-restaurante', nome: 'Bebidas restaurantes', markup: 100, lucro: 'ICMS ST' },
  { id: 'ervas', nome: 'Embalados ervas', markup: 100, lucro: '40%' },
  { id: 'salgadinhos', nome: 'Salgadinhos Cheetos', markup: 87.5, lucro: '35%' },
  { id: 'enlatados', nome: 'Enlatados', markup: 75, lucro: '30%' },
  { id: 'mercearia-leite', nome: 'Mercearia (leite, Nescau)', markup: 75, lucro: '30%' },
  { id: 'cesta', nome: 'Mercearia cesta básica', markup: 75, lucro: '30%' },
  { id: 'queijos-embalados', nome: 'Queijos embalados', markup: 65, lucro: 'ICMS ST' },
  { id: 'queijos-avacos', nome: 'Queijos avacos', markup: 45, lucro: 'ICMS ST' },
  { id: 'materia-prima', nome: 'Matéria prima', markup: 75, lucro: '30%' },
  { id: 'sorvetes', nome: 'Sorvetes', markup: 60, lucro: 'ICMS ST' },
  { id: 'processados', nome: 'Processados', markup: 300, lucro: '4 vezes o custo' },
  { id: 'limpeza', nome: 'Limpeza', markup: 75, lucro: '30%' },
  { id: 'verduras', nome: 'Verduras', markup: 75, lucro: '30%' }
];

const simplificar = (texto: string) => texto
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const porId = (id: string) => MARKUPS_SESSAO.find(item => item.id === id) || null;

export function sessaoDoProduto(nome: string): MarkupSessao | null {
  const n = simplificar(nome);
  if (!n.trim()) return null;
  if (/requeijao|manteiga/.test(n)) return porId('requeijao');
  if (/queijo/.test(n)) return /\bkg\b|avaco|granel/.test(n) ? porId('queijos-avacos') : porId('queijos-embalados');
  if (/nescau|toddynho|\bleite\b/.test(n)) return porId('mercearia-leite');
  if (/iogurte|\biog\b|yopro|bebida lactea|beb lac|coalhada|\bnata\b|chamyto|chambinho|betaninho|chandelle|petit suisse|ricota/.test(n)) return porId('laticinios');
  if (/cheetos|fandangos|salgadinho/.test(n)) return porId('salgadinhos');
  if (/sorvete|picole/.test(n)) return porId('sorvetes');
  if (/restaurante/.test(n) && /refri|coca|fanta|guarana|suco|bebida/.test(n)) return porId('bebidas-restaurante');
  if (/refri|coca|fanta|guarana|sprite|agua mineral|\bsuco\b/.test(n)) return porId('bebidas-viagem');
  if (/erva|chimarrao|terere/.test(n)) return porId('ervas');
  if (/sardinha|atum|milho verde|ervilha|enlatad/.test(n)) return porId('enlatados');
  if (/\barroz\b|feijao|acucar|oleo de soja|farinha de trigo|macarrao|\bcafe\b/.test(n)) return porId('cesta');
  if (/fermento|materia prima/.test(n)) return porId('materia-prima');
  if (/bombom|bomboniere|chocolate/.test(n)) return porId('bomboniere');
  if (/detergente|desinfetante|agua sanitaria|\bsabao\b|amaciante|alvejante|\bcloro\b|vassoura|\brodo\b|esponja|multiuso|bombril|desengordurante|limpa vidro|pinho sol|\blimpeza\b/.test(n)) return porId('limpeza');
  if (/verdura|hortalica|\balface\b|rucula|agriao|acelga|espinafre|brocolis|repolho|\bcouve\b|cheiro verde|coentro|salsinha|\bsalsa\b|cebolinha|hortela|\bcenoura\b|\bbeterraba\b|abobrinha|\bchuchu\b|\bvagem\b|\bpepino\b|berinjela|pimentao|quiabo|\bjilo\b|maxixe|macaxeira|mandioca|\binhame\b|abobora|\balho\b|\bcebola\b|batata inglesa|batata doce|\btomate\b/.test(n) && !/palha|molho|extrato|seco|tempero|em po/.test(n)) return porId('verduras');
  if (/artesanat/.test(n)) return porId('artesanato');
  if (/processad/.test(n)) return porId('processados');
  return null;
}

export function textoMarkup(sessao: MarkupSessao | null) {
  if (!sessao) return '—';
  if (sessao.id === 'processados') return '4 vezes o custo';
  return `${sessao.markup.toLocaleString('pt-BR')}%`;
}

export function gravarMarkupNaMemoria() {
  try {
    localStorage.setItem(CHAVE_MARKUP, JSON.stringify(MARKUPS_SESSAO));
  } catch {
    /* a tabela continua valendo no próprio sistema */
  }
}
