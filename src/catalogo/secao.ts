export const classificarSecaoProduto = (produto: string) => {
  const nome = (produto || '').toLowerCase();
  if (/músculo|carne|ossobuco|porco|costela|cupim|fígado|tripa|bucho|mocotó|bacon|calabresa|linguiça|salsicha|maminha|patinho|paleta|coxão|lagarto/.test(nome)) return 'Carnes e frios';
  if (/galinha|frango|pato|coxa|sobrecoxa|pé de galinha/.test(nome)) return 'Aves';
  if (/peixe|tilápia|merluza|panga|bacalhau|camarão|salmão|atum|cumurupim/.test(nome)) return 'Peixes e frutos do mar';
  if (/polpa|fruta|coco|manga|abacaxi|morango|maracujá|acerola|goiaba|açaí|caju|tamarindo|tangerina|siriguela|sapoti|cupuaçu|ameixa|cajá|graviola|uva|figo|pêssego/.test(nome)) return 'Frutas e polpas';
  if (/queijo|leite|manteiga|margarina|nata|requeijão|cream cheese|presunto|mortadela|apresuntado|cheester/.test(nome)) return 'Laticínios e frios';
  if (/farinha|arroz|feijão|macarrão|espaguete|aveia|açúcar|amido|fubá|granola|castanha|amendoim|tapioca|goma|puba|massa|flocão/.test(nome)) return 'Mercearia e massas';
  if (/chocolate|bombom|nutella|kinder|pirulito|paçoquinha|ovo surpresa|granulado|cereja|red velvet|gelatina|cremogema|bolacha|nescau/.test(nome)) return 'Confeitaria e doces';
  if (/molho|azeite|óleo|vinagre|ketchup|mostarda|pimenta|maionese|sazon|caldo|colorau|açafrão|sal|adoçante|mel|café|vinho|cachaça|suco/.test(nome)) return 'Molhos, temperos e bebidas';
  if (/copo|quentinha|saco|papel|bloco|bandeja|cesta|laço|embalagem/.test(nome)) return 'Embalagens e papelaria';
  if (/sabão|detergente|desinfetante|água sanitária|cloro|álcool|vassoura|rodo|esponja|pano|lustra|multiuso|veja|soda|ácido|escova|isqueiro|fósforo|lâmpada/.test(nome)) return 'Limpeza e utilidades';
  if (/sabonete|shampoo|rexona|absorvente|pasta colgate|pasta sorriso|barbeador|gilete|aerosol/.test(nome)) return 'Higiene pessoal';
  return 'Outros produtos';
};
