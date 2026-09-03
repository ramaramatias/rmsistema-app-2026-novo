export type ProdutoCatalogo = {
  id: string;
  codigo: string;
  nome: string;
  unidade: string;
  secao: string;
  ativo: boolean;
};

export const SECOES_CATALOGO = [
  'Carnes e frios',
  'Aves',
  'Peixes e frutos do mar',
  'Frutas e polpas',
  'Laticínios e frios',
  'Mercearia e massas',
  'Confeitaria e doces',
  'Molhos, temperos e bebidas',
  'Embalagens e papelaria',
  'Limpeza e utilidades',
  'Higiene pessoal',
  'Hortifruti',
  'Padaria',
  'Outros produtos'
] as const;
