import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AbaDados } from './abas/dados/AbaDados';
import { AbaCotacao } from './abas/cotacao/AbaCotacao';
import { AbaElieuda } from './abas/elieuda/AbaElieuda';
import { AbaManutencao } from './abas/manutencao/AbaManutencao';
import { AbaCadastroProdutos } from './abas/cadastro-produtos/AbaCadastroProdutos';
import { AbaCadastroFornecedores } from './abas/cadastro-fornecedores/AbaCadastroFornecedores';
import { AbaCompras } from './abas/compras/AbaCompras';
import { montarItensLaticinios, PRODUTOS_POR_SECAO } from './catalogo/secoesDados';
import { config } from '../config';

// ==========================================
// 🔑 CONFIGURAÇÕES & CREDENCIAIS
// ==========================================
const SENHA_MEU_SISTEMA = config.system.password;

export type StatusTarefa = 'aberta' | 'concluida';
export type TipoUsuario = 'admin' | 'gabriela' | 'assuncao' | 'luzia' | 'leandro' | 'idenaldo' | 'manutencao' | 'usuario';
export interface Tarefa { id: string; texto: string; status: StatusTarefa; concluida?: boolean; criadaEm: string; concluidaEm?: string; criador: string; dataCriacao: string; responsavel?: string; prioridade?: 'baixa' | 'media' | 'alta' | 'urgente'; foto?: string; }
export interface TarefaDeletada { id: string; texto: string; status: StatusTarefa; criadaEm: string; criador: string; deletadaEm: string; deletadaPor: string; setorId: string; foto?: string; }
export interface Setor { id: string; nome: string; cor: string; tarefas: Tarefa[]; }
export interface ItemPagamento { id: string; descricao: string; valor: number; data?: string; }
export interface PagamentosState { caixa: ItemPagamento[]; cheque: ItemPagamento[]; caben: ItemPagamento[]; }
export interface LotePagamentoHistorico { id: string; dataFechamento: string; totalGeral: number; totalCaixa: number; totalCheque: number; totalCaben: number; dados: PagamentosState; }
export interface QuantidadeDia { terca?: string; quinta?: string; sabado?: string; }
export interface QuantidadesElieuda { [produto: string]: QuantidadeDia; }
export interface ProdutoElieuda { produto: string; unit: string; }
export interface ItemCotacao { id: string; produto: string; unit: string; estoqueAtual: string; qtdSugerida?: string; qtdPedir: string; menorCusto?: number; ultimoPrecoCompra?: number; precos: { [fornecedorId: string]: string }; atualizadoEm?: string; secao?: string; fornecedorId?: string; }
export interface FornecedorCotacao { id: string; nome: string; razaoSocial?: string; nomeFantasia?: string; cnpj?: string; diasEntrega?: string; }
export interface RegistroConferencia { id: string; data: string; nomeConferente: string; valorRecebido: number; observacoes: string; houveDivergencia: boolean; tipoDivergencia?: 'valor' | 'kg' | 'quantidade' | ''; pedidoId?: string; fornecedor?: string; valorEsperado?: number; itensConferidos?: { produto: string; unit: string; quantidade: string; valorUnitario: number; valorTotal: number; fornecedor: string }[]; conferentePor?: string; dataPreenchimento?: string; }
export interface ArquivoConferencia { id: string; nome: string; dataUpload: string; uploadPor: string; conteudo: string; }
export interface DadosConferenciaFornecedor { fornecedorId: string; fornecedorNome: string; valorNota: number; valorRecebido: number; divergencia: boolean; conferentePor: string; dataPreenchimento: string; }
export interface PedidoCompra { id: string; data: string; fornecedorId: string; fornecedorNome: string; itens: { produtoId: string; produto: string; quantidade: number; precoUnitario: number; total: number }[]; totalGeral: number; status: 'pendente' | 'enviado' | 'recebido'; }
export interface RelatorioPedidoCotacao { id: string; data: string; itens: { produto: string; unit: string; quantidade: string; valorUnitario: number; valorTotal: number; fornecedor: string }[]; totalGeral: number; enviadoConferencia?: boolean; pdfFornecedor?: { nome: string; conteudo: string; anexadoEm: string; valor?: number; observacao?: string }; }
export type StatusOrdemManutencao = 'pendente' | 'andamento' | 'pausada' | 'concluida' | 'nao_realizada' | 'aberta';
export interface OrdemManutencao {
  id: string;
  local: string;
  tipo: string;
  descricao: string;
  status: StatusOrdemManutencao;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  criadoPor: string;
  criadoEm: string;
  atualizadoEm: string;
  concluidaEm?: string;
  responsavel?: string;
  motivoPausa?: string;
  foto?: string;
  observacaoConclusao?: string;
  assinadoPor?: string;
  assinatura?: string;
  equipamento?: string;
  solicitadoPor?: string;
  compradoPor?: string;
  valorEquipamento?: number;
  dataCompra?: string;
  autorizadoPor?: string;
  assinaturaAutorizacao?: string;
}
export interface Usuario { id: string; nome: string; tipo: TipoUsuario; permissoes: { pendencias: boolean; conferencias: boolean; cotacao: boolean; pagamentos: boolean; relatorios: boolean; elieuda: boolean; manutencao: boolean; dados: boolean; }; }

const FORNECEDORES_OFICIAIS: FornecedorCotacao[] = [
  { id: 'f_jfrios', nome: 'JFRIOS' }, { id: 'f_laredo', nome: 'LAREDO' }, { id: 'f_facanha', nome: 'FAÇANHA' },
  { id: 'f_minerva', nome: 'MINERVA' }, { id: 'f_fortale', nome: 'FORTALE' }, { id: 'f_zeni', nome: 'ZENI' },
  { id: 'f_rocha', nome: 'ROCHA' }, { id: 'f_dsl', nome: 'DSL' }, { id: 'f_ja', nome: 'JA' },
  { id: 'f_solmar', nome: 'SOLMAR' }, { id: 'f_fernando', nome: 'FERNANDO FRIOS' }
];

const ITENS_COTACAO_OFICIAIS: ItemCotacao[] = [
  { id: 'c1', produto: 'Músculo de carne moída', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c2', produto: 'Carne do sol jfrios', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c3', produto: 'Ossobuco resfriado', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c4', produto: 'Molho para carnes', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c5', produto: 'Legumes a vapor (alarcate)', unit: 'Kg/Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c6', produto: 'Filemigon resfriado (alarcate) FRIGORIFICO', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c7', produto: 'Galinha caipira sitio', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c8', produto: 'Pato sitio', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c9', produto: 'Porco sitio', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c10', produto: 'Puruca (sitio)', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c11', produto: 'Costela suina', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c12', produto: 'Carre suino', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c13', produto: 'Lombo suino', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c14', produto: 'Pernil suino', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c15', produto: 'Paleta bovino (carne caseira) FRIGORIFICO', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c16', produto: 'Coxao mole', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c17', produto: 'Largato', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c18', produto: 'Maminha', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c19', produto: 'Patinho', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c20', produto: 'Costela bovina', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c21', produto: 'Cupim', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c22', produto: 'Fígado bovino', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c23', produto: 'Tripa', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c24', produto: 'Bucho', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c25', produto: 'Mocotó', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c26', produto: 'Carne de bode sítio', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c27', produto: 'Bacon', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c28', produto: 'Carne de hambúrguer Texas', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c29', produto: 'Salsicha Seara', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c30', produto: 'Batata palito Laredo 7mm', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c31', produto: 'Calabresa Seara', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c32', produto: 'Linguiça Dália', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c33', produto: 'Filé de frango', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c34', produto: 'Coxa e sobrecoxa', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c35', produto: 'Filé de merluza', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c36', produto: 'Filé de panga', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c37', produto: 'Filé de tilápia', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c38', produto: 'Bacalhau lombo', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c39', produto: 'Camarão', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c40', produto: 'Salmão', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c41', produto: 'Cumurupim', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c42', produto: 'Peixe cara', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c43', produto: 'Filé de atum', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c44', produto: 'Pé de galinha', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c45', produto: 'Macaxeira palito', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c46', produto: 'Seleta de legumes', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c47', produto: 'Massa de macaxeira pronta', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c48', produto: 'Linguiça caseira', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c49', produto: 'Goma fresca', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c50', produto: 'Puba fresca', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c51', produto: 'Coco ralado congelado', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c52', produto: 'Feijão verde', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c53', produto: 'Gelo', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c54', produto: 'Polpa de morango', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c55', produto: 'Polpa de manga', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c56', produto: 'Polpa de maracujá', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c57', produto: 'Polpa de acerola', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c58', produto: 'Polpa de goiaba', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c59', produto: 'Polpa de abacaxi', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c60', produto: 'Polpa de açaí', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c61', produto: 'Polpa de caju', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c62', produto: 'Polpa de tamarindo', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c63', produto: 'Polpa de tangerina', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c64', produto: 'Polpa de siriguela', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c65', produto: 'Polpa de sapoti', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c66', produto: 'Polpa de cupuaçu', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c67', produto: 'Polpa de ameixa', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c68', produto: 'Polpa de cajá', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c69', produto: 'Polpa de graviola', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c70', produto: 'Polpa de uva', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c71', produto: 'Massa de pastel', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c72', produto: 'Damasco', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c73', produto: 'Nata pura', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c74', produto: 'Margarina folheada', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c75', produto: 'Geleia de pimenta caseira', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c76', produto: 'Requeijão para pizza', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c77', produto: 'Requeijão Betânia', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c78', produto: 'Queijo cheddar', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c79', produto: 'Cream cheese', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c80', produto: 'Queijo mussarela', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c81', produto: 'Queijo coalho', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c82', produto: 'Presunto sem capa de gordura', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c83', produto: 'Presunto de peru', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c84', produto: 'Peito de peru defumado', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c85', produto: 'Cheester lanche', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c86', produto: 'Apresuntado', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c87', produto: 'Mortadela defumada gourmet', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c88', produto: 'Leite composto', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c89', produto: 'Farinha panko', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c90', produto: 'Milho', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c91', produto: 'Ervilha', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c92', produto: 'Coco seco', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c93', produto: 'Leite de coco', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c94', produto: 'Creme de leite', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c95', produto: 'Leite condensado', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c96', produto: 'Maizena', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c97', produto: 'Cremogema de chocolate', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c98', produto: 'Açúcar demerara', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c99', produto: 'Açúcar refinado', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c100', produto: 'Açúcar mascavo', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c101', produto: 'Caldo de galinha', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c102', produto: 'Sazon de legumes', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c103', produto: 'Maionese', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c104', produto: 'Molho de tomate', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c105', produto: 'Molho de pizza', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c106', produto: 'Ketchup', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c107', produto: 'Molho barbecue', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c108', produto: 'Mostarda', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c109', produto: 'Vinagre balsâmico', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c110', produto: 'Molho shoyu', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c111', produto: 'Molho inglês', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c112', produto: 'Azeite', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c113', produto: 'Doce de goiaba', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c114', produto: 'Frutas cristalizadas', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c115', produto: 'Uva passa', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c116', produto: 'Ameixa sem caroço', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c117', produto: 'Arroz arbóreo', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c118', produto: 'Café', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c119', produto: 'Colorau', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c120', produto: 'Açafrão', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c121', produto: 'Granola', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c122', produto: 'Flocão de arroz', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c123', produto: 'Fubá de milho', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c124', produto: 'Castanha xerém', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c125', produto: 'Castanha inteira', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c126', produto: 'Castanha do Pará', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c127', produto: 'Amendoim xerém', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c128', produto: 'Amendoim debulhado', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c129', produto: 'Creme de cebola', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c130', produto: 'Leite integral', unit: 'L', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c131', produto: 'Leite desnatado', unit: 'L', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c132', produto: 'Leite zero lactose', unit: 'L', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c133', produto: 'Leite semidesnatado', unit: 'L', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c134', produto: 'Leite em pó', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c135', produto: 'Manteiga', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c136', produto: 'Margarina Qualy', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c137', produto: 'Margarina Primor', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c138', produto: 'Margarina 1kg', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c139', produto: 'Tapioca média', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c140', produto: 'Farinha integral', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c141', produto: 'Farinha integral 25kg', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c142', produto: 'Feijão carioca', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c143', produto: 'Feijão preto', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c144', produto: 'Feijão de corda', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c145', produto: 'Espaguete', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c146', produto: 'Macarrão búzio', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c147', produto: 'Macarrão parafuso', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c148', produto: 'Macarrão penne', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c149', produto: 'Macarrão lasanha', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c150', produto: 'Macarrão ninho', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c151', produto: 'Arroz branco', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c152', produto: 'Arroz parboilizado', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c153', produto: 'Arroz integral', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c154', produto: 'Aveia em flocos', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c155', produto: 'Açúcar 1kg', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c156', produto: 'Açúcar 50kg', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c157', produto: 'Amido de milho', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c158', produto: 'Óleo', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c159', produto: 'Margarina 15kg', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c160', produto: 'Gordura vegetal', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c161', produto: 'Farinha de sítio', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c162', produto: 'Ácido sórbico', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c163', produto: 'Sorbato de potássio', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c164', produto: 'Farinha de pastel', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c165', produto: 'Farinha com fermento', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c166', produto: 'Farinha para pizza', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c167', produto: 'Farinha sem fermento', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c168', produto: 'Cogumelo seco funghi', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c169', produto: 'Palmito em rodelas', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c170', produto: 'Azeitona preta sem caroço', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c171', produto: 'Azeitona verde sem caroço', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c172', produto: 'Pimenta biquinho', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c173', produto: 'Cebolinha', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c174', produto: 'Tomate seco', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c175', produto: 'Red velvet', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c176', produto: 'Champignon inteiro', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c177', produto: 'Alcaparras', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c178', produto: 'Champignon em pedaços', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c179', produto: 'Palmito picado', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c180', produto: 'Queijo parmesão', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c181', produto: 'Gelatina sem sabor', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c182', produto: 'Vinho branco', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c183', produto: 'Vinho tinto', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c184', produto: 'Vinho suave', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c185', produto: 'Cachaça', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c186', produto: 'Azeite de dendê', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c187', produto: 'Nescau', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c188', produto: 'Bolacha maizena', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c189', produto: 'Suco de uva 300ml', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c190', produto: 'Suco de uva 1 litro', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c191', produto: 'Vinagre', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c192', produto: 'Sal sachê', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c193', produto: 'Adoçante sachê', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c194', produto: 'Mel de abelha', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c195', produto: 'Óleo de coco', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c196', produto: 'Azeite de coco', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c197', produto: 'Barra de cereal', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c198', produto: 'Bombom', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c199', produto: 'Chocolate', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c200', produto: 'Pirulito', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c201', produto: 'Paçoquinha', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c202', produto: 'Ovo surpresa', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c203', produto: 'Nutella', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c204', produto: 'Kinder', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c205', produto: 'Batata palha', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c206', produto: 'Chocolate em pó 50%', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c207', produto: 'Adoçante líquido', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c208', produto: 'Chocolate em gotas', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c209', produto: 'Barra de chocolate branco', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c210', produto: 'Barra de chocolate meio amargo', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c211', produto: 'Barra de chocolate ao leite', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c212', produto: 'Figo', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c213', produto: 'Pêssego', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c214', produto: 'Coco ralado médio', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c215', produto: 'Granulado crocante', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c216', produto: 'Granulado colorido', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c217', produto: 'Creme de avelã', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c218', produto: 'Pasta de dente', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c219', produto: 'Copos 50ml', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c220', produto: 'Copos 180ml', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c221', produto: 'Copos 300ml', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c222', produto: 'Copos 400ml', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c223', produto: 'Desengordurante', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c224', produto: 'Sabão em barra', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c225', produto: 'Sabão em pó', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c226', produto: 'Vassoura', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c227', produto: 'Rodo', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c228', produto: 'Multiuso', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c229', produto: 'Sabonete', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c230', produto: 'Folha A4', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c231', produto: 'Velas de aniversário', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c232', produto: 'Papel toalha', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c233', produto: 'Esponja para grelha', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c234', produto: 'Esponja dupla face', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c235', produto: 'Bombril', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c236', produto: 'Álcool 70%', unit: 'L', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c237', produto: 'Água sanitária', unit: 'L', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c238', produto: 'Detergente', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c239', produto: 'Desinfetante', unit: 'L', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c240', produto: 'Flanela', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c241', produto: 'Lustra móveis', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c242', produto: 'Lâmpada de forno', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c243', produto: 'Aerosol', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c244', produto: 'Shampoo', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c245', produto: 'Guardanapos', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c246', produto: 'Papel higiênico', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c247', produto: 'Absorvente', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c248', produto: 'Quentinha de isopor', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c249', produto: 'Bom ar', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c250', produto: 'Bandeja', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c251', produto: 'Bloco de delivery', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c252', produto: 'Bloco de pedido', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c253', produto: 'Bloco de almoxarifado', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c254', produto: 'Bloco de recibo', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c255', produto: 'Papel seda', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c256', produto: 'Cesta de cipó', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c257', produto: 'Laço 50mm', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c258', produto: 'Óleo de coco extra virgem', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c259', produto: 'Azeite de coco babaçu', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c260', produto: 'Barra de cereal Trio', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c261', produto: 'Bombom mole', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c262', produto: 'Caixa de chocolate Garoto', unit: 'Cx', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c263', produto: 'Bombom duro', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c264', produto: 'Ovo surpresa slime', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c265', produto: 'Ovo surpresa dinossauro', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c266', produto: 'Ovo surpresa pulseira', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c267', produto: 'Ovo surpresa carro', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c268', produto: 'Nutella 140g', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c269', produto: 'Nutella 350g', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c270', produto: 'Kinder menino', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c271', produto: 'Kinder menina', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c272', produto: 'Kinder Bueno', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c273', produto: 'Nutella B-Ready', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c274', produto: 'Chocolate 50% em pó', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c275', produto: 'Chocolate gota branco', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c276', produto: 'Barra de chocolate amargo', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c277', produto: 'Cereja', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c278', produto: 'Granulado em escamas', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c279', produto: 'Chocolate gota 2,5kg', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c280', produto: 'Creme de avelã', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c281', produto: 'Pasta Colgate', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c282', produto: 'Pasta Sorriso', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c283', produto: 'Veja desengordurante', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c284', produto: 'Sabão em barra Dul Vale', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c285', produto: 'Sabão em pó Ala', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c286', produto: 'Vassoura Noviça', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c287', produto: 'Rodo Noviça', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c288', produto: 'Qboa multiuso', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c289', produto: 'Sabonete Palmolive', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c290', produto: 'Sabonete Protex', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c291', produto: 'Velas faisca', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c292', produto: 'Papel toalha interfolheado', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c293', produto: 'Esponja para grelha Santa Maria', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c294', produto: 'Esponja dupla face 3M', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c295', produto: 'Polidor', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c296', produto: 'Álcool 70% 1L', unit: 'L', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c297', produto: 'Água sanitária Dragão', unit: 'L', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c298', produto: 'Detergente neutro', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c299', produto: 'Desinfetante Juá', unit: 'L', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c300', produto: 'Flanela 38x48', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c301', produto: 'Lustra móveis', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c302', produto: 'Lâmpada para forno', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c303', produto: 'Rexona', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c304', produto: 'Aerosol Dove', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c305', produto: 'Barbeador', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c306', produto: 'Shampoo Pantene', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c307', produto: 'Shampoo Tresemmé', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c308', produto: 'Guardanapos Girassol', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c309', produto: 'Soda cáustica', unit: 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c310', produto: 'Ácido muriático', unit: 'L', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c311', produto: 'Cloro gel', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c312', produto: 'Pano de chão', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c313', produto: 'Isqueiro', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c314', produto: 'Fósforo', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c315', produto: 'Escova de roupa', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c316', produto: 'Pá de lixo', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c317', produto: 'Escovão Noviça', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c318', produto: 'Saco de lixo 30L', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c319', produto: 'Saco de lixo 50L', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c320', produto: 'Papel higiênico floral', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c321', produto: 'Absorvente Sempre Livre', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c322', produto: 'Absorvente Always', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c323', produto: 'Absorvente Conto Baby', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c324', produto: 'Quentinha de isopor 750ml', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c325', produto: 'Gilete para forno', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c326', produto: 'Bom Ar', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c327', produto: 'Bandete', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c328', produto: 'Bloco delivery', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c329', produto: 'Bloco de pedido P', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c330', produto: 'Bloco de almoxarifado grande', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c331', produto: 'Bloco de recibo', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c332', produto: 'Papel seda', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c333', produto: 'Cesta de cipó Fortaleza', unit: 'Und', estoqueAtual: '', qtdPedir: '', precos: {} },
  { id: 'c334', produto: 'Laço 50mm Fortaleza', unit: 'Pct', estoqueAtual: '', qtdPedir: '', precos: {} }
];

const SETORES_PADRAO: Setor[] = [
  { id: 'loja', nome: 'Loja', cor: '#d97706', tarefas: [] },
  { id: 'restaurante', nome: 'Restaurante', cor: '#0f766e', tarefas: [] },
  { id: 'padaria', nome: 'Padaria', cor: '#ea580c', tarefas: [] },
  { id: 'embalagem', nome: 'Embalagem', cor: '#ca8a04', tarefas: [] },
  { id: 'cozinha-principal', nome: 'Cozinha Principal', cor: '#16a34a', tarefas: [] },
  { id: 'confeitaria-principal', nome: 'Confeitaria Principal', cor: '#db2777', tarefas: [] },
  { id: 'confeitaria-auxiliar', nome: 'Confeitaria Auxiliar', cor: '#9333ea', tarefas: [] },
  { id: 'almoxarifado', nome: 'Almoxarifado', cor: '#2563eb', tarefas: [] },
  { id: 'sitio', nome: 'Sítio', cor: '#16a34a', tarefas: [] },
  { id: 'caben', nome: 'CABEN', cor: '#2563eb', tarefas: [] },
  { id: 'ave-cristo', nome: 'Ave Cristo', cor: '#7c3aed', tarefas: [] },
  { id: 'manutencao', nome: 'Manutenção', cor: '#0284c7', tarefas: [] }
];

const nomeSetorSemEmoji = (nome: string) => nome.replace(/^(🥖|🌳|🏢|⛪)\s*/, '');

const normalizarSetores = (setoresSalvos: Setor[]) => {
  if (!Array.isArray(setoresSalvos)) return SETORES_PADRAO;
  const comTarefas = (setor?: Setor): Setor | undefined => setor ? { ...setor, tarefas: Array.isArray(setor.tarefas) ? setor.tarefas : [] } : setor;
  const setorAntigo = comTarefas(setoresSalvos.find(setor => setor.id === 'pao-da-vida'));
  const salvosPorId = new Map(setoresSalvos.filter(setor => setor.id !== 'pao-da-vida').map(setor => [setor.id, comTarefas(setor)!]));
  const setoresAtualizados = SETORES_PADRAO.map(setorPadrao => {
    const setorSalvo = salvosPorId.get(setorPadrao.id);
    if (setorSalvo) return setorSalvo;
    if (setorPadrao.id === 'padaria' && setorAntigo) return { ...setorPadrao, tarefas: setorAntigo.tarefas };
    return setorPadrao;
  });
  const idsAtuais = new Set(setoresAtualizados.map(setor => setor.id));
  return [...setoresAtualizados, ...setoresSalvos.filter(setor => setor.id !== 'pao-da-vida' && !idsAtuais.has(setor.id)).map(setor => comTarefas(setor)!)];
};

const USUARIOS_SISTEMA: Usuario[] = [
  {
    id: 'admin_ramara',
    nome: 'Ramara',
    tipo: 'admin',
    permissoes: {
      pendencias: true,
      conferencias: true,
      cotacao: true,
      pagamentos: true,
      relatorios: true,
      elieuda: true,
      manutencao: true,
      dados: true
    }
  },
  {
    id: 'gabriela',
    nome: 'Gabriela',
    tipo: 'gabriela',
    permissoes: {
      pendencias: true,
      conferencias: true,
      cotacao: false,
      pagamentos: false,
      relatorios: false,
      elieuda: true,
      manutencao: false,
      dados: false
    }
  },
  {
    id: 'assuncao_duarte',
    nome: 'Assunção Duarte',
    tipo: 'assuncao',
    permissoes: {
      pendencias: true,
      conferencias: true,
      cotacao: false,
      pagamentos: false,
      relatorios: false,
      elieuda: false,
      manutencao: false,
      dados: false
    }
  },
  {
    id: 'luzia_santos',
    nome: 'Luzia Santos',
    tipo: 'luzia',
    permissoes: {
      pendencias: true,
      conferencias: true,
      cotacao: false,
      pagamentos: false,
      relatorios: false,
      elieuda: false,
      manutencao: false,
      dados: false
    }
  },
  {
    id: 'leandro',
    nome: 'Leandro',
    tipo: 'leandro',
    permissoes: {
      pendencias: true,
      conferencias: true,
      cotacao: false,
      pagamentos: false,
      relatorios: false,
      elieuda: false,
      manutencao: false,
      dados: false
    }
  },
  {
    id: 'idenaldo',
    nome: 'Idenaldo',
    tipo: 'idenaldo',
    permissoes: {
      pendencias: true,
      conferencias: true,
      cotacao: false,
      pagamentos: false,
      relatorios: false,
      elieuda: false,
      manutencao: false,
      dados: false
    }
  },
  {
    id: 'elias_manutencao',
    nome: 'Elias (Manutenção)',
    tipo: 'manutencao',
    permissoes: {
      pendencias: true,
      conferencias: false,
      cotacao: false,
      pagamentos: false,
      relatorios: false,
      elieuda: false,
      manutencao: true,
      dados: false
    }
  },
];

const PERMISSOES_OPCOES: { chave: keyof Usuario['permissoes']; nome: string; detalhe: string }[] = [
  { chave: 'pendencias', nome: 'Pendências', detalhe: 'Tela inicial e tarefas dos setores' },
  { chave: 'conferencias', nome: 'Conferência', detalhe: 'Conferir mercadoria que chega' },
  { chave: 'cotacao', nome: 'Cotação', detalhe: 'Cotar preços, cadastro de produtos e fornecedores' },
  { chave: 'pagamentos', nome: 'Pagamentos', detalhe: 'Caixa, Cheque e CABEN' },
  { chave: 'elieuda', nome: 'Pedido Elieuda', detalhe: 'Pedido de hortifrúti' },
  { chave: 'relatorios', nome: 'Relatórios', detalhe: 'Estatísticas do sistema' },
  { chave: 'manutencao', nome: 'Manutenção', detalhe: 'Ordens de serviço e reparos' },
  { chave: 'dados', nome: 'Dados', detalhe: 'Nuvem, backup e gerenciamento' }
];

const permissoesPadraoNovoUsuario = (): Usuario['permissoes'] => ({
  pendencias: true,
  conferencias: false,
  cotacao: false,
  pagamentos: false,
  relatorios: false,
  elieuda: false,
  manutencao: false,
  dados: false
});

const rotuloPermissoes = (permissoes: Usuario['permissoes']) => {
  const ativas = PERMISSOES_OPCOES.filter(opcao => permissoes[opcao.chave]).map(opcao => opcao.nome);
  return ativas.length ? ativas.join(' • ') : 'Sem abas (apenas Segurança)';
};

const normalizarUsuarioCadastrado = (usuario: Usuario): Usuario | null => {
  if (!usuario?.id || !usuario?.nome) return null;
  return {
    id: String(usuario.id),
    nome: String(usuario.nome).trim(),
    tipo: usuario.tipo === 'admin' ? 'admin' : 'usuario',
    permissoes: {
      pendencias: Boolean(usuario.permissoes?.pendencias),
      conferencias: Boolean(usuario.permissoes?.conferencias),
      cotacao: Boolean(usuario.permissoes?.cotacao),
      pagamentos: Boolean(usuario.permissoes?.pagamentos),
      relatorios: Boolean(usuario.permissoes?.relatorios),
      elieuda: Boolean(usuario.permissoes?.elieuda),
      manutencao: Boolean(usuario.permissoes?.manutencao),
      dados: Boolean(usuario.permissoes?.dados)
    }
  };
};

const unirUsuariosCadastrados = (...listas: Array<Usuario[] | undefined>) => {
  const oficiaisPorId = new Map(USUARIOS_SISTEMA.map(usuario => [usuario.id, usuario]));
  const extrasPorId = new Map<string, Usuario>();
  listas.forEach(lista => {
    (lista || []).forEach(item => {
      const normalizado = normalizarUsuarioCadastrado(item);
      if (!normalizado || oficiaisPorId.has(normalizado.id)) return;
      extrasPorId.set(normalizado.id, normalizado);
    });
  });
  return [...USUARIOS_SISTEMA, ...Array.from(extrasPorId.values())];
};

const unirPermissoesUsuarios = (...mapas: Array<{ [id: string]: Usuario['permissoes'] } | undefined>) => {
  const uniao: { [id: string]: Usuario['permissoes'] } = {};
  mapas.forEach(mapa => {
    Object.entries(mapa || {}).forEach(([id, permissoes]) => {
      if (!id || !permissoes) return;
      uniao[id] = { ...permissoesPadraoNovoUsuario(), ...permissoes };
    });
  });
  return uniao;
};

const aplicarPermissoesSalvas = (usuario: Usuario, permissoesSalvas: { [id: string]: Usuario['permissoes'] }) => (
  {
    ...usuario,
    permissoes: {
      ...permissoesPadraoNovoUsuario(),
      ...usuario.permissoes,
      ...(permissoesSalvas[usuario.id] || {})
    }
  }
);

const PAGAMENTOS_PADRAO: PagamentosState = { caixa: [], cheque: [], caben: [] };

// 🥕 72 PRODUTOS DE HORTIFRÚTI DA DONA ELIEUDA
const listaProdutosElieudaPadrao: ProdutoElieuda[] = [
  { produto: 'Batata Inglesa', unit: 'Kg' }, { produto: 'Tomate', unit: 'Kg' }, { produto: 'Cenoura', unit: 'Kg' },
  { produto: 'Pimentão', unit: 'Kg' }, { produto: 'Chuchu', unit: 'Kg' }, { produto: 'Repolho Verde', unit: 'Und' },
  { produto: 'Repolho Roxo', unit: 'Und' }, { produto: 'Alface Roxa', unit: 'Molho' }, { produto: 'Abobrinha', unit: 'Kg' },
  { produto: 'Berinjela', unit: 'Kg' }, { produto: 'Acelga', unit: 'Und' }, { produto: 'Alface Americano', unit: 'Molho' },
  { produto: 'Folhagem Sálvia', unit: 'Molho' }, { produto: 'Folhagem Mastruz', unit: 'Molho' }, { produto: 'Folhagem Alecrim', unit: 'Molho' },
  { produto: 'Pepino', unit: 'Kg' }, { produto: 'Beterraba', unit: 'Kg' }, { produto: 'Uva Roxa', unit: 'Cx/Kg' },
  { produto: 'Uva Verde', unit: 'Cx/Kg' }, { produto: 'Pimentinha de Cheiro', unit: 'Kg' }, { produto: 'Pimentão Colorido', unit: 'Kg' },
  { produto: 'Kiwi', unit: 'Kg' }, { produto: 'Ameixa', unit: 'Kg' }, { produto: 'Tomate Cereja', unit: 'Bandeja' },
  { produto: 'Morango', unit: 'Bandeja' }, { produto: 'Alface', unit: 'Molho' }, { produto: 'Limão', unit: 'Kg' },
  { produto: 'Batata Doce', unit: 'Kg' }, { produto: 'Cebola Branca', unit: 'Kg' }, { produto: 'Melancia', unit: 'Und/Kg' },
  { produto: 'Melão', unit: 'Und/Kg' }, { produto: 'Mamão', unit: 'Und/Kg' }, { produto: 'Manga', unit: 'Kg' },
  { produto: 'Maçã', unit: 'Kg' }, { produto: 'Laranja', unit: 'Cento/Kg' }, { produto: 'Abacate', unit: 'Kg' },
  { produto: 'Abacaxi', unit: 'Und' }, { produto: 'Banana', unit: 'Palma/Kg' }, { produto: 'Chia', unit: 'Pct/Kg' },
  { produto: 'Hibisco', unit: 'Pct/Kg' }, { produto: 'Alecrim', unit: 'Pct/Kg' }, { produto: 'Semente de Mostarda', unit: 'Pct/Kg' },
  { produto: 'Erva Doce', unit: 'Pct/Kg' }, { produto: 'Cravo', unit: 'Pct/Kg' }, { produto: 'Pimenta do Reino', unit: 'Pct/Kg' },
  { produto: 'Linhaça', unit: 'Pct/Kg' }, { produto: 'Gergelim Branco', unit: 'Pct/Kg' }, { produto: 'Gergelim Preto', unit: 'Pct/Kg' },
  { produto: 'Orégano', unit: 'Pct/Kg' }, { produto: 'Amendoim Descascado', unit: 'Kg' }, { produto: 'Amendoim Inteiro', unit: 'Kg' },
  { produto: 'Canela em Casca', unit: 'Pct/Kg' }, { produto: 'Gengibre', unit: 'Kg' }, { produto: 'Alho Número 6', unit: 'Kg' },
  { produto: 'Colorau', unit: 'Pct/Kg' }, { produto: 'Coco Seco', unit: 'Und' }, { produto: 'Açafrão', unit: 'Pct/Kg' },
  { produto: 'Brócolis', unit: 'Und/Kg' }, { produto: 'Alho Poró', unit: 'Und' }, { produto: 'Couve Flor', unit: 'Und' },
  { produto: 'Espinafre', unit: 'Molho' }, { produto: 'Cheiro Verde', unit: 'Molho' }, { produto: 'Espiga de Milho', unit: 'Und' },
  { produto: 'Jerimum', unit: 'Kg' }, { produto: 'Manjericão', unit: 'Molho' }, { produto: 'Salsa', unit: 'Molho' },
  { produto: 'Quiabo', unit: 'Kg' }, { produto: 'Maxixe', unit: 'Kg' }, { produto: 'Rabanete', unit: 'Molho/Kg' },
  { produto: 'Couve Folha', unit: 'Molho' }, { produto: 'Hortelã', unit: 'Molho' }, { produto: 'Capim Santo', unit: 'Molho' }
];

const LIMITE_JSON_LOCAL = 800000;

const tarefaSemFoto = (tarefa: Tarefa): Tarefa => {
  if (!tarefa?.foto) return tarefa;
  const { foto: _foto, ...resto } = tarefa;
  return resto;
};

const setoresSemFotos = (lista?: Setor[]) =>
  (lista || []).map(setor => ({
    ...setor,
    tarefas: (setor.tarefas || []).map(tarefaSemFoto)
  }));

const pedidosSemPdfPesado = (lista?: RelatorioPedidoCotacao[]) =>
  (lista || []).map(pedido => {
    if (!pedido?.pdfFornecedor?.conteudo || !String(pedido.pdfFornecedor.conteudo).startsWith('data:')) return pedido;
    const { conteudo: _c, ...meta } = pedido.pdfFornecedor;
    return { ...pedido, pdfFornecedor: { ...meta, conteudo: '' } };
  });

const gravarJsonLocal = (chave: string, valor: unknown) => {
  try {
    const texto = JSON.stringify(valor);
    if (texto.length > LIMITE_JSON_LOCAL) {
      localStorage.removeItem(chave);
      return false;
    }
    localStorage.setItem(chave, texto);
    return true;
  } catch {
    try { localStorage.removeItem(chave); } catch {}
    return false;
  }
};

const limparChavesLocaisPesadas = () => {
  try {
    const chaves: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const chave = localStorage.key(i);
      if (chave) chaves.push(chave);
    }
    chaves.forEach(chave => {
      if (!chave.startsWith('rm_')) return;
      const valor = localStorage.getItem(chave);
      if (valor && valor.length > LIMITE_JSON_LOCAL) localStorage.removeItem(chave);
    });
  } catch {}
};

limparChavesLocaisPesadas();

const lerJsonLocal = (chave: string, padrao: any) => {
  try {
    const salvo = localStorage.getItem(chave);
    if (!salvo) return padrao;
    return JSON.parse(salvo);
  } catch {
    return padrao;
  }
};

const resgatarBackupGeral = (chaveBase: string, valorPadrao: any) => {
  try {
  for (let i = 70; i >= 1; i--) {
    const salvo = localStorage.getItem(`${chaveBase}_v${i}`);
    if (salvo && salvo.length <= LIMITE_JSON_LOCAL) {
      try {
        const parsed = JSON.parse(salvo);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        if (typeof parsed === 'object' && Object.keys(parsed).length > 0) return parsed;
      } catch (e) {}
    }
  }
  const direto = localStorage.getItem(chaveBase);
  if (direto && direto.length > LIMITE_JSON_LOCAL) {
    try { localStorage.removeItem(chaveBase); } catch {}
    return valorPadrao;
  }
  if (direto) {
    try { return JSON.parse(direto); } catch (e) {}
  }
  } catch {}
  return valorPadrao;
};

const idsDeTarefasDeletadas = (lista: Array<{ id?: string } | string> = []) =>
  lista.map(item => (typeof item === 'string' ? item : item?.id)).filter((id): id is string => Boolean(id));

const statusDaTarefa = (tarefa: Tarefa): StatusTarefa =>
  tarefa.status === 'concluida' || tarefa.concluida ? 'concluida' : 'aberta';

const parseDataConclusao = (valor?: string): Date | null => {
  if (!valor) return null;
  const direto = new Date(valor);
  if (!Number.isNaN(direto.getTime())) return direto;
  const partes = valor.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?(?:,?\s*(\d{1,2}):(\d{2}))?/);
  if (!partes) return null;
  const dia = Number(partes[1]);
  const mes = Number(partes[2]) - 1;
  const anoInformado = partes[3];
  const ano = anoInformado ? Number(anoInformado.length === 2 ? `20${anoInformado}` : anoInformado) : new Date().getFullYear();
  const hora = partes[4] ? Number(partes[4]) : 0;
  const minuto = partes[5] ? Number(partes[5]) : 0;
  const data = new Date(ano, mes, dia, hora, minuto);
  return Number.isNaN(data.getTime()) ? null : data;
};

const escolherTarefaMaisAvancada = (local: Tarefa, recebida: Tarefa): Tarefa => {
  const statusLocal = statusDaTarefa(local);
  const statusRecebida = statusDaTarefa(recebida);
  const escolhida = statusLocal === 'concluida' && statusRecebida !== 'concluida'
    ? { ...local, status: 'concluida' as StatusTarefa }
    : statusRecebida === 'concluida' && statusLocal !== 'concluida'
      ? { ...recebida, status: 'concluida' as StatusTarefa }
      : local;
  return { ...escolhida, foto: escolhida.foto || local.foto || recebida.foto };
};

const mesclarSetores = (setoresBase: Setor[], setoresNovos: Setor[], idsRemovidos: string[] = []) => {
  const removidos = new Set(idsRemovidos);
  const novosPorId = new Map((setoresNovos || []).map(setor => [setor.id, setor]));
  const idsBase = new Set((setoresBase || []).map(setor => setor.id));
  const setoresMesclados = (setoresBase || []).map(setorBase => {
    const tarefasBase = Array.isArray(setorBase.tarefas) ? setorBase.tarefas : [];
    const setorNovo = novosPorId.get(setorBase.id);
    if (!setorNovo) return { ...setorBase, tarefas: tarefasBase.filter(tarefa => !removidos.has(tarefa.id)) };
    const tarefasPorId = new Map<string, Tarefa>();
    const incorporar = (tarefa: Tarefa) => {
      if (!tarefa?.id || removidos.has(tarefa.id)) return;
      const existente = tarefasPorId.get(tarefa.id);
      tarefasPorId.set(tarefa.id, existente ? escolherTarefaMaisAvancada(existente, tarefa) : tarefa);
    };
    tarefasBase.forEach(incorporar);
    (setorNovo.tarefas || []).forEach(incorporar);
    return { ...setorBase, tarefas: Array.from(tarefasPorId.values()) };
  });
  const setoresSoNaNuvem = (setoresNovos || [])
    .filter(setor => !idsBase.has(setor.id))
    .map(setor => ({ ...setor, tarefas: (setor.tarefas || []).filter(tarefa => !removidos.has(tarefa.id)) }));
  return [...setoresMesclados, ...setoresSoNaNuvem];
};

const unirTarefasDeletadas = (atuais: TarefaDeletada[], extras: Array<TarefaDeletada | { id: string }>) => {
  const porId = new Map<string, TarefaDeletada | { id: string }>();
  [...atuais, ...extras].forEach(item => {
    if (item?.id && !porId.has(item.id)) porId.set(item.id, item);
  });
  return Array.from(porId.values()) as TarefaDeletada[];
};

const contarItensPagamento = (dados?: PagamentosState) =>
  (dados?.caixa?.length || 0) + (dados?.cheque?.length || 0) + (dados?.caben?.length || 0);

const unirRelatoriosPedidos = (...listas: Array<RelatorioPedidoCotacao[] | undefined>) => {
  const porId = new Map<string, RelatorioPedidoCotacao>();
  listas.forEach(lista => {
    (lista || []).forEach(item => {
      if (!item?.id) return;
      const atual = porId.get(item.id);
      if (!atual) {
        porId.set(item.id, item);
        return;
      }
      porId.set(item.id, {
        ...atual,
        ...item,
        enviadoConferencia: Boolean(atual.enviadoConferencia || item.enviadoConferencia)
      });
    });
  });
  return Array.from(porId.values());
};

const filtrarPedidosNaoDeletados = (lista: RelatorioPedidoCotacao[] | undefined, deletados: string[] | undefined) => {
  const ids = new Set(deletados || []);
  return (lista || []).filter(item => item?.id && !ids.has(item.id));
};

const unirPedidosCotacao = (deletados: string[] | undefined, ...listas: Array<RelatorioPedidoCotacao[] | undefined>) =>
  filtrarPedidosNaoDeletados(unirRelatoriosPedidos(...listas), deletados);

const unirConferencias = (...listas: Array<RegistroConferencia[] | undefined>) => {
  const porId = new Map<string, RegistroConferencia>();
  listas.forEach(lista => {
    (lista || []).forEach(item => {
      if (item?.id && !porId.has(item.id)) porId.set(item.id, item);
    });
  });
  return Array.from(porId.values());
};

const unirIds = (...listas: Array<string[] | undefined>) => Array.from(new Set(listas.flatMap(lista => lista || []).filter(Boolean)));

const unirLotesPagamento = (...listas: Array<LotePagamentoHistorico[] | undefined>) => {
  const porId = new Map<string, LotePagamentoHistorico>();
  listas.forEach(lista => {
    (lista || []).forEach(lote => {
      if (!lote?.id) return;
      const atual = porId.get(lote.id);
      if (!atual || contarItensPagamento(lote.dados) > contarItensPagamento(atual.dados) || (lote.totalGeral || 0) > (atual.totalGeral || 0)) {
        porId.set(lote.id, lote);
      }
    });
  });
  return Array.from(porId.values()).sort((a, b) => Number(b.id) - Number(a.id));
};

const idsItensDeLotes = (lotes: LotePagamentoHistorico[]) => {
  const ids = new Set<string>();
  lotes.forEach(lote => {
    (['caixa', 'cheque', 'caben'] as const).forEach(tipo => {
      (lote.dados?.[tipo] || []).forEach(item => {
        if (item?.id) ids.add(item.id);
      });
    });
  });
  return ids;
};

const garantirIdPagamento = (item: ItemPagamento, indice: number) => {
  if (item?.id) return item;
  return {
    ...item,
    id: `pag-${String(item?.descricao || 'item').toLowerCase().replace(/\s+/g, '-')}-${Number(item?.valor) || 0}-${indice}`
  };
};

const unirListaPagamento = (a: ItemPagamento[] = [], b: ItemPagamento[] = [], idsFechados: Set<string>) => {
  const porId = new Map<string, ItemPagamento>();
  [...a, ...b].map(garantirIdPagamento).forEach(item => {
    if (!item?.id || idsFechados.has(item.id) || porId.has(item.id)) return;
    porId.set(item.id, item);
  });
  return Array.from(porId.values());
};

const unirPagamentosAbertos = (a: PagamentosState | undefined, b: PagamentosState | undefined, lotes: LotePagamentoHistorico[]) => {
  const idsFechados = idsItensDeLotes(lotes);
  return {
    caixa: unirListaPagamento(a?.caixa, b?.caixa, idsFechados),
    cheque: unirListaPagamento(a?.cheque, b?.cheque, idsFechados),
    caben: unirListaPagamento(a?.caben, b?.caben, idsFechados)
  };
};

type SenhasUsuarios = { [usuarioId: string]: string };

const lerSenhasLocais = (): SenhasUsuarios => {
  try {
    const salvo = localStorage.getItem('rm_senhas_usuarios');
    const parsed = salvo ? JSON.parse(salvo) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const hashSenha = async (senha: string) => {
  const dados = new TextEncoder().encode(`rm-sistema-gestao:${senha}`);
  const buffer = await crypto.subtle.digest('SHA-256', dados);
  return Array.from(new Uint8Array(buffer)).map(byte => byte.toString(16).padStart(2, '0')).join('');
};

const comprimirFotoPendencia = (arquivo: File) => new Promise<string>((resolve, reject) => {
  const leitor = new FileReader();
  leitor.onerror = () => reject(new Error('Não foi possível ler a foto'));
  leitor.onload = () => {
    const imagem = new Image();
    imagem.onload = () => {
      const max = 400;
      const escala = Math.min(1, max / Math.max(imagem.width, imagem.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(imagem.width * escala));
      canvas.height = Math.max(1, Math.round(imagem.height * escala));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(String(leitor.result));
        return;
      }
      ctx.drawImage(imagem, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.5));
    };
    imagem.onerror = () => reject(new Error('Foto inválida'));
    imagem.src = String(leitor.result);
  };
  leitor.readAsDataURL(arquivo);
});

const abrirBancoFotos = () => new Promise<IDBDatabase>((resolve, reject) => {
  const pedido = indexedDB.open('rm-pendencias-fotos', 1);
  pedido.onupgradeneeded = () => {
    if (!pedido.result.objectStoreNames.contains('fotos')) pedido.result.createObjectStore('fotos');
  };
  pedido.onsuccess = () => resolve(pedido.result);
  pedido.onerror = () => reject(pedido.error);
});

const salvarFotoPendencia = async (id: string, foto: string) => {
  if (!id || !foto) return;
  try {
    const db = await abrirBancoFotos();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('fotos', 'readwrite');
      tx.objectStore('fotos').put(foto, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {}
};

const carregarFotosPendencias = async () => {
  const fotos: { [id: string]: string } = {};
  try {
    const db = await abrirBancoFotos();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('fotos', 'readonly');
      const pedido = tx.objectStore('fotos').openCursor();
      pedido.onsuccess = () => {
        const cursor = pedido.result;
        if (!cursor) return;
        if (typeof cursor.key === 'string' && typeof cursor.value === 'string') fotos[cursor.key] = cursor.value;
        cursor.continue();
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {}
  return fotos;
};

const aplicarFotosNasTarefas = (lista: Setor[], fotos: { [id: string]: string }) =>
  (Array.isArray(lista) ? lista : []).map(setor => ({
    ...setor,
    tarefas: (setor.tarefas || []).map(tarefa => ({ ...tarefa, foto: tarefa.foto || fotos[tarefa.id] }))
  }));

const extrairFotosSetores = (lista?: Setor[]) => {
  const fotos: { [id: string]: string } = {};
  const semFotos = (lista || []).map(setor => ({
    ...setor,
    tarefas: (setor.tarefas || []).map(tarefa => {
      if (tarefa.foto && tarefa.foto.startsWith('data:')) {
        fotos[tarefa.id] = tarefa.foto;
        return tarefaSemFoto(tarefa);
      }
      return tarefa;
    })
  }));
  Object.entries(fotos).forEach(([id, foto]) => { void salvarFotoPendencia(id, foto); });
  return { semFotos, fotos };
};

const ordemSemFoto = (ordem: OrdemManutencao): OrdemManutencao => {
  if (!ordem?.foto) return ordem;
  const { foto: _foto, ...resto } = ordem;
  return resto;
};

const ordensSemFotos = (lista?: OrdemManutencao[]) => (lista || []).map(ordemSemFoto);

const aplicarFotosNasOrdens = (lista: OrdemManutencao[], fotos: { [id: string]: string }) =>
  (Array.isArray(lista) ? lista : []).map(ordem => ({ ...ordem, foto: ordem.foto || fotos[ordem.id] }));

const extrairFotosOrdens = (lista?: OrdemManutencao[]) => {
  const fotos: { [id: string]: string } = {};
  const semFotos = (lista || []).map(ordem => {
    if (ordem.foto && ordem.foto.startsWith('data:')) {
      fotos[ordem.id] = ordem.foto;
      return ordemSemFoto(ordem);
    }
    return ordem;
  });
  Object.entries(fotos).forEach(([id, foto]) => { void salvarFotoPendencia(id, foto); });
  return { semFotos, fotos };
};

const unirFotosPendencias = (...mapas: Array<{ [id: string]: string } | undefined>) => {
  const uniao: { [id: string]: string } = {};
  mapas.forEach(mapa => {
    Object.entries(mapa || {}).forEach(([id, foto]) => {
      if (id && typeof foto === 'string' && foto.length > 30) uniao[id] = foto;
    });
  });
  return uniao;
};

const coletarFotosSetores = (lista?: Setor[]) => {
  const fotos: { [id: string]: string } = {};
  (lista || []).forEach(setor => {
    (setor.tarefas || []).forEach(tarefa => {
      if (tarefa?.id && tarefa.foto) fotos[tarefa.id] = tarefa.foto;
    });
  });
  return fotos;
};

const coletarFotosOrdens = (lista?: OrdemManutencao[]) => {
  const fotos: { [id: string]: string } = {};
  (lista || []).forEach(ordem => {
    if (ordem?.id && ordem.foto) fotos[ordem.id] = ordem.foto;
  });
  return fotos;
};

const filtrarFotosUsadas = (fotos: { [id: string]: string }, setores?: Setor[], ordens?: OrdemManutencao[]) => {
  const ids = new Set<string>();
  (setores || []).forEach(setor => (setor.tarefas || []).forEach(tarefa => { if (tarefa?.id) ids.add(tarefa.id); }));
  (ordens || []).forEach(ordem => { if (ordem?.id) ids.add(ordem.id); });
  const filtrado: { [id: string]: string } = {};
  Object.entries(fotos).forEach(([id, foto]) => {
    if (ids.has(id)) filtrado[id] = foto;
  });
  return filtrado;
};

const enxugarFotosNuvem = (fotos: { [id: string]: string }, limite = 600000) => {
  const entradas = Object.entries(fotos).sort((a, b) => Number(b[0]) - Number(a[0]));
  const resultado: { [id: string]: string } = {};
  let tamanho = 2;
  entradas.forEach(([id, foto]) => {
    const extra = id.length + foto.length + 8;
    if (tamanho + extra > limite) return;
    resultado[id] = foto;
    tamanho += extra;
  });
  return resultado;
};

const guardarFotosLocal = (fotos: { [id: string]: string }) => {
  Object.entries(fotos).forEach(([id, foto]) => { void salvarFotoPendencia(id, foto); });
};

const enviarFotoNuvem = async (id: string, foto: string) => {
  if (!id || !foto || !foto.startsWith('data:image')) return;
  try {
    await fetch('/api/foto', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, foto })
    });
  } catch {}
};

const buscarFotoNuvem = async (id: string) => {
  try {
    const resposta = await fetch(`/api/foto?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
    if (!resposta.ok) return '';
    const dados = await resposta.json();
    return typeof dados?.foto === 'string' && dados.foto.startsWith('data:image') ? dados.foto : '';
  } catch {
    return '';
  }
};

const unirOrdensManutencao = (...listas: Array<OrdemManutencao[] | undefined>) => {
  const porId = new Map<string, OrdemManutencao>();
  listas.forEach(lista => {
    (lista || []).forEach(ordem => {
      if (!ordem?.id) return;
      const atual = porId.get(ordem.id);
      if (!atual || avancaoStatusOrdem(ordem.status) > avancaoStatusOrdem(atual.status) || (ordem.atualizadoEm || '') > (atual.atualizadoEm || '')) {
        porId.set(ordem.id, { ...atual, ...ordem, foto: ordem.foto || atual?.foto });
      }
    });
  });
  return Array.from(porId.values()).sort((a, b) => Number(b.id) - Number(a.id));
};

const LOCAIS_MANUTENCAO = ['Loja', 'Restaurante', 'Padaria', 'Embalagem', 'Cozinha', 'Confeitaria', 'Almoxarifado', 'Sítio', 'CABEN', 'Ave Cristo', 'Área comum', 'Outro'];
const TIPOS_MANUTENCAO = ['Elétrica', 'Hidráulica', 'Refrigeração', 'Máquina / equipamento', 'Predial / estrutura', 'Outro'];
const MOTIVOS_PAUSA_MANUTENCAO = [
  'Falta de equipamento',
  'Falta de material',
  'Preciso de auxílio',
  'Preciso de autorização',
  'Aguardando fornecedor',
  'Problema não identificado',
  'Outro motivo'
];
const MOTIVOS_COMPRA_PAUSA = ['Falta de equipamento', 'Falta de material'];
const statusOrdemNormalizado = (status?: string): Exclude<StatusOrdemManutencao, 'aberta'> =>
  status === 'andamento' ? 'andamento'
    : status === 'pausada' ? 'pausada'
    : status === 'concluida' ? 'concluida'
    : status === 'nao_realizada' ? 'nao_realizada'
    : 'pendente';
const rotuloStatusOrdem = (status?: string) => {
  const atual = statusOrdemNormalizado(status);
  return atual === 'andamento' ? 'Em andamento'
    : atual === 'pausada' ? 'Pausada'
    : atual === 'concluida' ? 'Concluída'
    : atual === 'nao_realizada' ? 'Não realizada'
    : 'Pendente';
};
const classeStatusOrdem = (status?: string) => {
  const atual = statusOrdemNormalizado(status);
  return atual === 'andamento' ? 'bg-amber-100 text-amber-800'
    : atual === 'pausada' ? 'bg-violet-100 text-violet-800'
    : atual === 'concluida' ? 'bg-emerald-100 text-emerald-800'
    : atual === 'nao_realizada' ? 'bg-slate-200 text-slate-700'
    : 'bg-sky-100 text-sky-800';
};

const avancaoStatusOrdem = (status: StatusOrdemManutencao) => {
  const atual = statusOrdemNormalizado(status);
  return atual === 'concluida' || atual === 'nao_realizada' ? 2 : atual === 'andamento' || atual === 'pausada' ? 1 : 0;
};

const publicarRegistroSemFotos = async (record: any) => {
  if (!record || typeof record !== 'object') return;
  try {
    await fetch('/api/nuvem', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...record, setores: setoresSemFotos(record.setores) })
    });
  } catch {}
};

const recordDoJsonBin = (dados: any) =>
  dados?.record && typeof dados.record === 'object' && !Array.isArray(dados.record) ? dados.record : dados;

const enviarRegistroNuvem = async (registro: Record<string, unknown>) => {
  const tentar = (corpo: Record<string, unknown>) => fetch('/api/nuvem', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
  const leve = {
    ...registro,
    fotosPendencias: enxugarFotosNuvem((registro.fotosPendencias as { [id: string]: string }) || {}, 400000),
    relatoriosPedidosCotacao: pedidosSemPdfPesado(registro.relatoriosPedidosCotacao as RelatorioPedidoCotacao[])
  };
  let resposta = await tentar(leve);
  if (!resposta.ok) {
    resposta = await tentar({
      setores: leve.setores,
      tarefasDeletadas: leve.tarefasDeletadas,
      pagamentos: leve.pagamentos,
      historicoPagamentos: leve.historicoPagamentos,
      conferencias: leve.conferencias,
      fornecedoresCotacao: leve.fornecedoresCotacao,
      itensCotacao: leve.itensCotacao,
      quantidadesElieuda: leve.quantidadesElieuda,
      pedidosConferidos: leve.pedidosConferidos,
      conferenciasDeletadas: leve.conferenciasDeletadas,
      pedidosCotacaoDeletados: leve.pedidosCotacaoDeletados,
      relatoriosPedidosCotacao: leve.relatoriosPedidosCotacao,
      senhasUsuarios: leve.senhasUsuarios,
      usuariosExtra: leve.usuariosExtra,
      permissoesUsuarios: leve.permissoesUsuarios,
      ordensManutencao: leve.ordensManutencao,
      ultimaAtualizacao: leve.ultimaAtualizacao
    });
  }
  return resposta;
};

const LogoRm = ({ size, compact = false }: { size: number; compact?: boolean }) => (
  <img
    src="/rm-icon.png"
    alt="RM"
    width={size}
    height={size}
    decoding="async"
    style={{ width: size, height: size, borderRadius: Math.max(6, Math.round(size * 0.18)), objectFit: 'cover', display: 'block', flexShrink: 0, boxShadow: '0 4px 10px rgba(15,23,42,0.16)' }}
  />
);

type LinhaPedidoPdf = { produto: string; unit: string; quantidade: string; valorUnitario: number; valorTotal: number };

const textoPdf = (valor: string) =>
  valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const gerarPdfPedidoFornecedor = (fornecedorNome: string, linhas: LinhaPedidoPdf[], totalGeral: number) => {
  const largura = 595;
  const altura = 842;
  const linhasPorPagina = 28;
  const paginas: LinhaPedidoPdf[][] = [];
  for (let i = 0; i < Math.max(linhas.length, 1); i += linhasPorPagina) {
    paginas.push(linhas.slice(i, i + linhasPorPagina));
  }

  const desenharPagina = (itensPagina: LinhaPedidoPdf[], numero: number, totalPaginas: number) => {
    const comandos: string[] = ['BT', '/F1 16 Tf', '0.06 0.46 0.43 rg', `50 ${altura - 50} Td`, `(RM SISTEMA-GESTAO) Tj`, '0 g', '/F1 11 Tf', '0 -22 Td', `(Pedido de compra) Tj`, '0 -16 Td', `(Fornecedor: ${textoPdf(fornecedorNome)}) Tj`, '0 -14 Td', `(Data: ${textoPdf(new Date().toLocaleString('pt-BR'))}${totalPaginas > 1 ? `  |  Pagina ${numero}/${totalPaginas}` : ''}) Tj`, 'ET'];
    let y = altura - 130;
    const cabecalho = [
      { x: 50, t: 'Produto', w: 220 },
      { x: 270, t: 'Unid', w: 50 },
      { x: 320, t: 'Qtd', w: 50 },
      { x: 380, t: 'Vl unit.', w: 80 },
      { x: 470, t: 'Total', w: 75 }
    ];
    comandos.push('0.06 0.09 0.16 rg', `50 ${y - 4} ${495} 18 re`, 'f', '1 1 1 rg', 'BT', '/F1 9 Tf');
    cabecalho.forEach((col, i) => {
      comandos.push(i === 0 ? `1 0 0 1 ${col.x} ${y + 2} Tm` : `1 0 0 1 ${col.x} ${y + 2} Tm`, `(${col.t}) Tj`);
    });
    comandos.push('ET', '0 g');
    y -= 22;
    itensPagina.forEach((item, indice) => {
      if (indice % 2 === 1) {
        comandos.push('0.97 0.98 0.99 rg', `50 ${y - 4} 495 16 re`, 'f', '0 g');
      }
      const produto = textoPdf(item.produto).slice(0, 42);
      const unitario = item.valorUnitario ? `R$ ${item.valorUnitario.toFixed(2)}` : '-';
      const total = item.valorTotal ? `R$ ${item.valorTotal.toFixed(2)}` : '-';
      comandos.push('BT', '/F1 8 Tf', `1 0 0 1 52 ${y} Tm`, `(${produto}) Tj`, `1 0 0 1 270 ${y} Tm`, `(${textoPdf(item.unit)}) Tj`, `1 0 0 1 320 ${y} Tm`, `(${textoPdf(item.quantidade)}) Tj`, `1 0 0 1 380 ${y} Tm`, `(${unitario}) Tj`, `1 0 0 1 470 ${y} Tm`, `(${total}) Tj`, 'ET');
      y -= 16;
    });
    if (numero === totalPaginas) {
      comandos.push('BT', '/F1 12 Tf', `1 0 0 1 320 ${Math.max(y - 10, 40)} Tm`, `(Total geral: R$ ${totalGeral.toFixed(2)}) Tj`, 'ET');
    }
    return comandos.join('\n');
  };

  const streams = paginas.map((itensPagina, indice) => desenharPagina(itensPagina, indice + 1, paginas.length));
  return montarArquivoPdf(streams, largura, altura);
};

const montarArquivoPdf = (streams: string[], largura = 595, altura = 842) => {
  const objetos: string[] = [];
  objetos.push('<< /Type /Catalog /Pages 2 0 R >>');
  const kids = streams.map((_, i) => `${3 + i * 2} 0 R`).join(' ');
  objetos.push(`<< /Type /Pages /Kids [${kids}] /Count ${streams.length} >>`);
  streams.forEach((conteudo, i) => {
    const pageId = 3 + i * 2;
    const contentId = pageId + 1;
    objetos.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${largura} ${altura}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${3 + streams.length * 2} 0 R >> >> >>`);
    objetos.push(`<< /Length ${conteudo.length} >>\nstream\n${conteudo}\nendstream`);
  });
  objetos.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objetos.forEach((objeto, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objeto}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(off => {
    pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
};

type LinhaPdfPagamento = { tipo: 'secao' | 'item'; rotulo: string; valor?: string };

const gerarPdfRelatorioPagamentos = (dados: PagamentosState, valorTotal: number, dataRotulo?: string) => {
  const largura = 595;
  const altura = 842;
  const secoes: { nome: string; itens: ItemPagamento[] }[] = [
    { nome: '1. Caixa', itens: Array.isArray(dados.caixa) ? dados.caixa : [] },
    { nome: '2. Cheque', itens: Array.isArray(dados.cheque) ? dados.cheque : [] },
    { nome: '3. CABEN', itens: Array.isArray(dados.caben) ? dados.caben : [] }
  ];
  const linhas: LinhaPdfPagamento[] = [];
  secoes.forEach(secao => {
    if (secao.itens.length === 0) return;
    const subtotal = secao.itens.reduce((soma, item) => soma + Number(item.valor || 0), 0);
    linhas.push({ tipo: 'secao', rotulo: `${secao.nome}  -  Subtotal: R$ ${subtotal.toFixed(2)}` });
    secao.itens.forEach(item => {
      linhas.push({ tipo: 'item', rotulo: textoPdf(item.descricao || '-').slice(0, 68), valor: `R$ ${Number(item.valor || 0).toFixed(2)}` });
    });
  });
  if (linhas.length === 0) {
    linhas.push({ tipo: 'item', rotulo: 'Nenhum pagamento lancado neste relatorio.' });
  }

  const linhasPorPagina = 30;
  const paginas: LinhaPdfPagamento[][] = [];
  for (let i = 0; i < linhas.length; i += linhasPorPagina) {
    paginas.push(linhas.slice(i, i + linhasPorPagina));
  }

  const desenharPagina = (itensPagina: LinhaPdfPagamento[], numero: number, totalPaginas: number) => {
    const emissao = textoPdf(dataRotulo || new Date().toLocaleString('pt-BR'));
    const comandos: string[] = ['BT', '/F1 16 Tf', '0.06 0.46 0.43 rg', `50 ${altura - 50} Td`, `(RM SISTEMA-GESTAO) Tj`, '0 g', '/F1 11 Tf', '0 -22 Td', `(Relatorio de Pagamentos) Tj`, '0 -16 Td', `(Emissao: ${emissao}${totalPaginas > 1 ? `  |  Pagina ${numero}/${totalPaginas}` : ''}) Tj`, 'ET'];
    let y = altura - 130;
    comandos.push('0.06 0.09 0.16 rg', `50 ${y - 4} 495 18 re`, 'f', '1 1 1 rg', 'BT', '/F1 9 Tf', `1 0 0 1 52 ${y + 2} Tm`, `(Descricao) Tj`, `1 0 0 1 470 ${y + 2} Tm`, `(Valor) Tj`, 'ET', '0 g');
    y -= 22;
    itensPagina.forEach(linha => {
      if (linha.tipo === 'secao') {
        comandos.push('0.06 0.46 0.43 rg', `50 ${y - 4} 495 16 re`, 'f', '1 1 1 rg', 'BT', '/F1 8 Tf', `1 0 0 1 52 ${y} Tm`, `(${textoPdf(linha.rotulo).slice(0, 78)}) Tj`, 'ET', '0 g');
      } else {
        comandos.push('BT', '/F1 8 Tf', `1 0 0 1 52 ${y} Tm`, `(${linha.rotulo}) Tj`, `1 0 0 1 455 ${y} Tm`, `(${textoPdf(linha.valor || '')}) Tj`, 'ET');
      }
      y -= 16;
    });
    if (numero === totalPaginas) {
      comandos.push('BT', '/F1 12 Tf', `1 0 0 1 320 ${Math.max(y - 14, 50)} Tm`, `(Total geral: R$ ${valorTotal.toFixed(2)}) Tj`, 'ET');
      comandos.push('BT', '/F1 9 Tf', `1 0 0 1 180 ${40} Tm`, `(Visto Autorizacao Financeiro) Tj`, 'ET');
    }
    return comandos.join('\n');
  };

  const streams = paginas.map((itensPagina, indice) => desenharPagina(itensPagina, indice + 1, paginas.length));
  return montarArquivoPdf(streams, largura, altura);
};

const garantirItemCotacao = (item: ItemCotacao): ItemCotacao => ({
  id: item?.id || '',
  produto: item?.produto || '',
  unit: item?.unit || 'Kg',
  estoqueAtual: item?.estoqueAtual || '',
  qtdSugerida: item?.qtdSugerida || '',
  qtdPedir: item?.qtdPedir || '',
  menorCusto: item?.menorCusto,
  ultimoPrecoCompra: item?.ultimoPrecoCompra,
  precos: item?.precos && typeof item.precos === 'object' ? item.precos : {},
  atualizadoEm: item?.atualizadoEm,
  secao: item?.secao,
  fornecedorId: item?.fornecedorId
});
const qtdPedirNumero = (item: { qtdPedir?: string }) => parseFloat(String(item?.qtdPedir || '').replace(',', '.')) || 0;
const pesoItemCotacao = (item: ItemCotacao) =>
  Object.values(item.precos || {}).filter(valor => String(valor || '').trim()).length
  + (item.estoqueAtual?.trim() ? 1 : 0)
  + (item.qtdPedir?.trim() ? 1 : 0)
  + (item.qtdSugerida?.trim() ? 1 : 0);

const tempoItemCotacao = (item?: ItemCotacao | null) => {
  if (!item?.atualizadoEm) return 0;
  const tempo = Date.parse(String(item.atualizadoEm));
  return Number.isNaN(tempo) ? 0 : tempo;
};

const escolherItemCotacao = (atual: ItemCotacao, candidato: ItemCotacao) => {
  const tempoAtual = tempoItemCotacao(atual);
  const tempoNovo = tempoItemCotacao(candidato);
  if (tempoNovo !== tempoAtual) return tempoNovo > tempoAtual ? candidato : atual;
  const pesoAtual = pesoItemCotacao(atual);
  const pesoNovo = pesoItemCotacao(candidato);
  if (pesoNovo !== pesoAtual) return pesoNovo > pesoAtual ? candidato : atual;
  return candidato;
};

const mesclarItensCotacao = (...listas: Array<ItemCotacao[] | undefined>) => {
  const porId = new Map<string, ItemCotacao>();
  listas.forEach(lista => {
    (lista || []).forEach(item => {
      if (!item?.id) return;
      const atual = porId.get(item.id);
      porId.set(item.id, garantirItemCotacao(atual ? escolherItemCotacao(atual, item) : item));
    });
  });
  return Array.from(porId.values());
};

const normalizarItensCotacao = (itensSalvos: ItemCotacao[]) => mesclarItensCotacao(ITENS_COTACAO_OFICIAIS, itensSalvos);
const marcarItensCotacaoAgora = (itens: ItemCotacao[]) => {
  const agora = new Date().toISOString();
  return itens.map(item => ({ ...item, atualizadoEm: agora }));
};

function App() {
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<string>('');
  const [senhaDigitada, setSenhaDigitada] = useState('');
  const [mostrarSenhaLogin, setMostrarSenhaLogin] = useState(false);
  const [erroLogin, setErroLogin] = useState(false);
  const [entrando, setEntrando] = useState(false);
  const [senhasUsuarios, setSenhasUsuarios] = useState<SenhasUsuarios>(() => lerSenhasLocais());
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [mostrarModalSenha, setMostrarModalSenha] = useState(false);
  const [usuarioResetSenha, setUsuarioResetSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [usuariosExtra, setUsuariosExtra] = useState<Usuario[]>(() => {
    try {
      const salvo = localStorage.getItem('rm_usuarios_extra');
      return salvo ? unirUsuariosCadastrados(JSON.parse(salvo)).filter(u => !USUARIOS_SISTEMA.some(o => o.id === u.id)) : [];
    } catch {
      return [];
    }
  });
  const [novoUsuarioNome, setNovoUsuarioNome] = useState('');
  const [novoUsuarioSenha, setNovoUsuarioSenha] = useState('');
  const [novoUsuarioPermissoes, setNovoUsuarioPermissoes] = useState<Usuario['permissoes']>(permissoesPadraoNovoUsuario);
  const [erroNovoUsuario, setErroNovoUsuario] = useState('');
  const [statusSalvoSeguranca, setStatusSalvoSeguranca] = useState('');
  const [usuarioPermissaoSalvaId, setUsuarioPermissaoSalvaId] = useState('');
  const [permissoesUsuarios, setPermissoesUsuarios] = useState<{ [id: string]: Usuario['permissoes'] }>(() => {
    try {
      const salvo = localStorage.getItem('rm_permissoes_usuarios');
      return salvo ? unirPermissoesUsuarios(JSON.parse(salvo)) : {};
    } catch {
      return {};
    }
  });

  const [tabAtiva, setTabAtiva] = useState<'pendencias' | 'compras' | 'cotacao' | 'cadastroProdutos' | 'cadastroFornecedores' | 'pagamentos' | 'elieuda' | 'conferencia' | 'relatorios' | 'seguranca' | 'manutencao' | 'dados'>('pendencias');
  const [ordensManutencao, setOrdensManutencao] = useState<OrdemManutencao[]>(() => {
    try {
      const salvo = resgatarBackupGeral('rm_ordens_manutencao', []);
      if (!Array.isArray(salvo)) return [];
      return extrairFotosOrdens(salvo).semFotos;
    } catch {
      return [];
    }
  });
  const [filtroOrdensManutencao, setFiltroOrdensManutencao] = useState<'pendente' | 'andamento' | 'pausada' | 'concluida' | 'nao_realizada' | 'todas'>('pendente');
  const [novaOrdemLocal, setNovaOrdemLocal] = useState(LOCAIS_MANUTENCAO[0]);
  const [novaOrdemTipo, setNovaOrdemTipo] = useState(TIPOS_MANUTENCAO[0]);
  const [novaOrdemDescricao, setNovaOrdemDescricao] = useState('');
  const [novaOrdemPrioridade, setNovaOrdemPrioridade] = useState<'baixa' | 'media' | 'alta' | 'urgente'>('media');
  const [novaOrdemFoto, setNovaOrdemFoto] = useState('');
  const [ordemPausaId, setOrdemPausaId] = useState('');
  const [motivoPausaEscolhido, setMotivoPausaEscolhido] = useState(MOTIVOS_PAUSA_MANUTENCAO[0]);
  const [motivoPausaOutro, setMotivoPausaOutro] = useState('');
  const ordensManutencaoRef = useRef(ordensManutencao);
  ordensManutencaoRef.current = ordensManutencao;

  const [setores, setSetores] = useState<Setor[]>(() => {
    try {
      return normalizarSetores(resgatarBackupGeral('rm_setores', SETORES_PADRAO));
    } catch {
      return SETORES_PADRAO;
    }
  });
  
  // Carregar pagamentos do backup_completo.json se existir
  const carregarPagamentosBackup = () => {
    try {
      const direto = resgatarBackupGeral('rm_pagamentos', null);
      const backupStr = localStorage.getItem('rm_backup_completo');
      const backup = backupStr ? JSON.parse(backupStr) : null;
      const lotes = unirLotesPagamento(
        Array.isArray(backup?.historicoPagamentos) ? backup.historicoPagamentos : [],
        resgatarBackupGeral('rm_historico_pagamentos', [])
      );
      return unirPagamentosAbertos(direto && typeof direto === 'object' ? direto : PAGAMENTOS_PADRAO, backup?.pagamentos, lotes);
    } catch (e) {
      console.error('Erro ao carregar backup de pagamentos:', e);
    }
    return resgatarBackupGeral('rm_pagamentos', PAGAMENTOS_PADRAO);
  };
  
  const [pagamentos, setPagamentos] = useState<PagamentosState>(carregarPagamentosBackup);
  const [historicoPagamentos, setHistoricoPagamentos] = useState<LotePagamentoHistorico[]>(() => {
    try {
      const backupStr = localStorage.getItem('rm_backup_completo');
      const backup = backupStr ? JSON.parse(backupStr) : null;
      return unirLotesPagamento(
        resgatarBackupGeral('rm_historico_pagamentos', []),
        Array.isArray(backup?.historicoPagamentos) ? backup.historicoPagamentos : []
      );
    } catch (e) {
      console.error('Erro ao carregar histórico:', e);
    }
    return resgatarBackupGeral('rm_historico_pagamentos', []);
  });
  const [fornecedoresCotacao, setFornecedoresCotacao] = useState<FornecedorCotacao[]>(FORNECEDORES_OFICIAIS);
  const [itensCotacao, setItensCotacao] = useState<ItemCotacao[]>(() => {
    try {
      const recuperados = resgatarBackupGeral('rm_itens_cotacao', []);
      return Array.isArray(recuperados) && recuperados.length > 0 ? normalizarItensCotacao(recuperados) : ITENS_COTACAO_OFICIAIS;
    } catch {
      return ITENS_COTACAO_OFICIAIS;
    }
  });
  const [quantidadesElieuda, setQuantidadesElieuda] = useState<QuantidadesElieuda>(() => {
    try {
      const salvo = resgatarBackupGeral('rm_elieuda', {});
      return salvo && typeof salvo === 'object' ? salvo : {};
    } catch {
      return {};
    }
  });
  
  // Carregar dados de conferência do backup
  const carregarDadosConferenciaBackup = () => {
    try {
      const backup = localStorage.getItem('rm_backup_conferencia');
      if (backup) {
        const dados = JSON.parse(backup);
        return dados.conferencias || [];
      }
    } catch (e) {
      console.error('Erro ao carregar backup de conferência:', e);
    }
    return resgatarBackupGeral('rm_conferencias', []);
  };
  
  const [conferencias, setConferencias] = useState<RegistroConferencia[]>(carregarDadosConferenciaBackup);
  const conferenciasRef = useRef(conferencias);
  conferenciasRef.current = conferencias;
  const [conferenciasDeletadas, setConferenciasDeletadas] = useState<string[]>(() => {
    try {
      const salvo = localStorage.getItem('rm_conferencias_deletadas');
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });
  const conferenciasDeletadasRef = useRef(conferenciasDeletadas);
  conferenciasDeletadasRef.current = conferenciasDeletadas;
  const [pedidosCotacaoDeletados, setPedidosCotacaoDeletados] = useState<string[]>(() => {
    try {
      const salvo = localStorage.getItem('rm_pedidos_cotacao_deletados');
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });
  const pedidosCotacaoDeletadosRef = useRef(pedidosCotacaoDeletados);
  pedidosCotacaoDeletadosRef.current = pedidosCotacaoDeletados;
  const pagamentosRef = useRef(pagamentos);
  const historicoPagamentosRef = useRef(historicoPagamentos);
  const itensCotacaoRef = useRef(itensCotacao);
  const setoresRef = useRef(setores);
  setoresRef.current = setores;

  useEffect(() => {
    if (!usuarioLogado) return;
    let ativo = true;
    carregarFotosPendencias().then(fotos => {
      if (!ativo || !fotos || Object.keys(fotos).length === 0) return;
      try {
        setSetores(atuais => aplicarFotosNasTarefas(atuais, fotos));
        setOrdensManutencao(atuais => aplicarFotosNasOrdens(atuais, fotos));
      } catch {}
    }).catch(() => {});
    return () => { ativo = false; };
  }, [usuarioLogado]);
  const gravacaoFilaRef = useRef(Promise.resolve());
  const usuariosExtraRef = useRef(usuariosExtra);
  const permissoesUsuariosRef = useRef(permissoesUsuarios);
  pagamentosRef.current = pagamentos;
  historicoPagamentosRef.current = historicoPagamentos;
  itensCotacaoRef.current = itensCotacao;
  setoresRef.current = setores;
  usuariosExtraRef.current = usuariosExtra;
  permissoesUsuariosRef.current = permissoesUsuarios;
  ordensManutencaoRef.current = ordensManutencao;

  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>(() => {
    try {
      return localStorage.getItem('rm_ultima_atualizacao') || 'Sincronizado';
    } catch {
      return 'Sincronizado';
    }
  });

  const [mostrarPastaHistorico, setMostrarPastaHistorico] = useState(true);
  const [mostrarHistoricoBackups, setMostrarHistoricoBackups] = useState(false);
  const [novoItemNome, setNovoItemNome] = useState('');
  const [novoItemUnit, setNovoItemUnit] = useState('Kg');
  const [novoFornecedorNome, setNovoFornecedorNome] = useState('');
  const [buscaCotacao, setBuscaCotacao] = useState('');
  const [novoProdutoCadastro, setNovoProdutoCadastro] = useState({ nome: '', unidade: 'Kg' });
  const [novoFornecedorCadastro, setNovoFornecedorCadastro] = useState({ razaoSocial: '', nomeFantasia: '', cnpj: '' });
  const [mostrarRelatorioPedidos, setMostrarRelatorioPedidos] = useState(true);
  const [pedidoEmVisualizacao, setPedidoEmVisualizacao] = useState<{ fornecedor: FornecedorCotacao; itens: ItemCotacao[] } | null>(null);
  const [buscaProduto, setBuscaProduto] = useState('');

  const [mostrarModalImportacao, setMostrarModalImportacao] = useState(false);
  const [textoImportacao, setTextoImportacao] = useState('');
  const [modoImportacao, setModoImportacao] = useState<'adicionar' | 'substituir'>('adicionar');
  const [unidadePadraoImportacao, setUnidadePadraoImportacao] = useState('Kg');

  const [novaConf, setNovaConf] = useState({ conferente: '', valor: '', obs: '', divergencia: false });
  const [novaConferencia, setNovaConferencia] = useState({ data: new Date().toISOString().split('T')[0], nomeConferente: '', valorRecebido: 0, houveDivergencia: false, tipoDivergencia: '' as 'valor' | 'kg' | 'quantidade' | '', observacoes: '' });
  const [conferenciasPorPedido, setConferenciasPorPedido] = useState<{ [pedidoId: string]: { conferente: string; valor: string; obs: string; divergencia: boolean; tipoDivergencia: 'valor' | 'kg' | 'quantidade' | '' } }>({});
  const [pedidosConferidosLocais, setPedidosConferidosLocais] = useState<string[]>(() => {
    const lista = lerJsonLocal('rm_pedidos_conferidos', []);
    return Array.isArray(lista) ? lista : [];
  });
  const pedidosConferidosRef = useRef(pedidosConferidosLocais);
  pedidosConferidosRef.current = pedidosConferidosLocais;
  const [abaConferencia, setAbaConferencia] = useState<'pedidos' | 'conferidos' | 'divergencias'>('pedidos');
  const [buscaFornecedorConferencia, setBuscaFornecedorConferencia] = useState('');
  const [sairTelaInteira, setSairTelaInteira] = useState(false);

  const [filtroStatus, setFiltroStatus] = useState<{ [setorId: string]: 'todas' | StatusTarefa }>({
    'pao-da-vida': 'todas', 'sitio': 'todas', 'caben': 'todas', 'ave-cristo': 'todas'
  });

  const [novaTarefaTexto, setNovaTarefaTexto] = useState<{ [setorId: string]: string }>({});
  const [prioridadeSelecionada, setPrioridadeSelecionada] = useState<Record<string, 'baixa' | 'media' | 'alta' | 'urgente'>>({});
  const [novaTarefaCentral, setNovaTarefaCentral] = useState('');
  const [novaTarefaFoto, setNovaTarefaFoto] = useState('');
  const [fotoAmpliada, setFotoAmpliada] = useState('');
  const [setorSelecionadoNovaTarefa, setSetorSelecionadoNovaTarefa] = useState(SETORES_PADRAO[0]?.id || '');
  const [novoCaixa, setNovoCaixa] = useState({ descricao: '', valor: '' });
  const [novoCheque, setNovoCheque] = useState({ descricao: '', valor: '' });
  const [novoCaben, setNovoCaben] = useState({ descricao: '', valor: '' });

  const [statusNuvem, setStatusNuvem] = useState<string>('🟢 Nuvem');
  const [alerta, setAlerta] = useState<{ tipo: 'sucesso' | 'erro'; msg: string } | null>(null);

  // Calendário e Relatórios por Data
  const [dataSelecionada, setDataSelecionada] = useState<string>(new Date().toISOString().split('T')[0]);
  const [relatoriosPorData, setRelatoriosPorData] = useState<{ [data: string]: { pendentes: number; concluidas: number; pagamentos: number; conferencias: number } }>(() => {
    return lerJsonLocal('rm_relatorios_por_data', {});
  });

  // Histórico de Tarefas Deletadas
  const [tarefasDeletadas, setTarefasDeletadas] = useState<TarefaDeletada[]>(() => {
    return lerJsonLocal('rm_tarefas_deletadas', []);
  });
  const tarefasDeletadasRef = useRef(tarefasDeletadas);
  tarefasDeletadasRef.current = tarefasDeletadas;
  const sincronizacaoEmCursoRef = useRef(false);
  const gravandoNuvemRef = useRef(false);
  const fotosPendenciasRef = useRef<{ [id: string]: string }>({});
  const puxarFotosDaNuvem = async (ids: string[]) => {
    const unicos = Array.from(new Set((ids || []).filter(Boolean))).filter(id => {
      const atual = fotosPendenciasRef.current[id];
      return !atual || atual.length < 40;
    }).slice(0, 50);
    if (unicos.length === 0) return;
    const recebidas: { [id: string]: string } = {};
    await Promise.all(unicos.map(async id => {
      const foto = await buscarFotoNuvem(id);
      if (foto) recebidas[id] = foto;
    }));
    if (Object.keys(recebidas).length === 0) return;
    fotosPendenciasRef.current = unirFotosPendencias(fotosPendenciasRef.current, recebidas);
    Object.entries(recebidas).forEach(([id, foto]) => { void salvarFotoPendencia(id, foto); });
    setSetores(atuais => aplicarFotosNasTarefas(atuais, fotosPendenciasRef.current));
    setOrdensManutencao(atuais => aplicarFotosNasOrdens(atuais, fotosPendenciasRef.current));
  };
  const idsParaBuscarFoto = (extra: string[] = []) => [
    ...extra,
    ...Object.keys(fotosPendenciasRef.current),
    ...(setoresRef.current || []).flatMap(setor => (setor.tarefas || []).map(tarefa => tarefa.id)),
    ...(ordensManutencaoRef.current || []).map(ordem => ordem.id)
  ];
  const [mostrarHistoricoDelete, setMostrarHistoricoDelete] = useState(false);
  const [filtroStatusTarefas, setFiltroStatusTarefas] = useState<'todas' | 'concluida'>('todas');

  // Arquivo compartilhado na conferência
  const [arquivoConferencia, setArquivoConferencia] = useState<ArquivoConferencia | null>(() => {
    return lerJsonLocal('rm_arquivo_conferencia', null);
  });

  // Dados de conferência preenchidos por fornecedor
  const [dadosConferenciaFornecedor, setDadosConferenciaFornecedor] = useState<DadosConferenciaFornecedor[]>(() => {
    return lerJsonLocal('rm_dados_conferencia_fornecedor', []);
  });

  // Pedidos de compra gerados automaticamente
  const [pedidosCompra, setPedidosCompra] = useState<PedidoCompra[]>(() => {
    return lerJsonLocal('rm_pedidos_compra', []);
  });
  const [relatoriosPedidosCotacao, setRelatoriosPedidosCotacao] = useState<RelatorioPedidoCotacao[]>(() => {
    let lista: RelatorioPedidoCotacao[] = [];
    try {
      const backup = localStorage.getItem('rm_backup_conferencia');
      if (backup) {
        const dados = JSON.parse(backup);
        lista = dados.relatoriosPedidosCotacao || [];
      }
    } catch (e) {
      console.error('Erro ao carregar backup de relatórios:', e);
    }
    if (!lista.length) lista = lerJsonLocal('rm_relatorios_pedidos_cotacao', []);
    try {
      const deletados = localStorage.getItem('rm_pedidos_cotacao_deletados');
      return filtrarPedidosNaoDeletados(lista, deletados ? JSON.parse(deletados) : []);
    } catch {
      return lista;
    }
  });
  const relatoriosPedidosRef = useRef(relatoriosPedidosCotacao);
  relatoriosPedidosRef.current = relatoriosPedidosCotacao;
  const [mostrarRelatoriosCotacao, setMostrarRelatoriosCotacao] = useState(false);
  const [relatorioPagamentosVisualizacao, setRelatorioPagamentosVisualizacao] = useState<{ dados: PagamentosState; valorTotal: number; dataRotulo?: string } | null>(null);
  const [relatorioElieudaVisualizacao, setRelatorioElieudaVisualizacao] = useState<{ itens: ProdutoElieuda[]; quantidades: QuantidadesElieuda } | null>(null);
  const [pedidoConferenciaId, setPedidoConferenciaId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('rm_pedido_conferencia_id');
    } catch {
      return null;
    }
  });
  const [pedidoConferenciaVisualizacao, setPedidoConferenciaVisualizacao] = useState<RelatorioPedidoCotacao | null>(null);
  const [dadosPdfFornecedor, setDadosPdfFornecedor] = useState<{ [pedidoId: string]: { valor: string; observacao: string } }>({});
  const [pdfFornecedorVisualizacao, setPdfFornecedorVisualizacao] = useState<{ nome: string; conteudo: string } | null>(null);
  const [mostrarAnexoFornecedorExterno, setMostrarAnexoFornecedorExterno] = useState(false);
  const [nomeFornecedorExterno, setNomeFornecedorExterno] = useState('');

  const [mostrarPedidosCompra, setMostrarPedidosCompra] = useState(false);
  const [mostrarRobo, setMostrarRobo] = useState(false);
  const [mensagemRobo, setMensagemRobo] = useState('');
  const [conversaRobo, setConversaRobo] = useState<{ autor: 'robo' | 'voce'; texto: string }[]>([
    { autor: 'robo', texto: 'Olá! Posso consultar pendências, resumir setores, criar ou concluir tarefas.' }
  ]);

  // 🔔 Notificações de Pendências
  const notificacoesEnviadasRef = useRef<Set<string>>(new Set());
  const resumoNotificacaoEnviadoRef = useRef(false);
  const [permissaoNotificacao, setPermissaoNotificacao] = useState<NotificationPermission>('default');

  //  Responsáveis pelas tarefas
  const [filtroResponsavel, setFiltroResponsavel] = useState<{ [setorId: string]: string }>({
    'pao-da-vida': '', 'sitio': '', 'caben': '', 'ave-cristo': ''
  });
  const [responsavelSelecionado, setResponsavelSelecionado] = useState<{ [setorId: string]: string }>({
    'pao-da-vida': '', 'sitio': '', 'caben': '', 'ave-cristo': ''
  });

// Solicitar permissão de notificação ao fazer login
  useEffect(() => {
    if (autenticado && usuarioLogado) {
      if ('Notification' in window) {
        setPermissaoNotificacao(Notification.permission);
        if (Notification.permission === 'default') {
          Notification.requestPermission().then(permission => {
            setPermissaoNotificacao(permission);
          });
        }
      }
    }
  }, [autenticado, usuarioLogado]);
  // Uma notificação-resumo no login do Ramara — sem loop e sem uma alerta por tarefa (isso travava o celular)
  useEffect(() => {
    if (!autenticado || usuarioLogado?.id !== 'admin_ramara') {
      resumoNotificacaoEnviadoRef.current = false;
      return;
    }
    if (!usuarioLogado.permissoes.pendencias || permissaoNotificacao !== 'granted') return;
    if (!('Notification' in window)) return;

    const abertas = (Array.isArray(setores) ? setores : []).flatMap(setor =>
      (setor.tarefas || []).filter(t => t.status === 'aberta').map(t => t.id)
    );
    const novas = abertas.filter(id => !notificacoesEnviadasRef.current.has(id));
    novas.forEach(id => notificacoesEnviadasRef.current.add(id));
    if (abertas.length === 0) notificacoesEnviadasRef.current.clear();
    if (resumoNotificacaoEnviadoRef.current || novas.length === 0) return;
    resumoNotificacaoEnviadoRef.current = true;
    try {
      new Notification('RM Sistema', {
        body: novas.length === 1 ? 'Há 1 pendência aberta.' : `Há ${abertas.length} pendências abertas.`,
        tag: 'rm-pendencias-resumo'
      });
    } catch {}
  }, [setores, autenticado, usuarioLogado, permissaoNotificacao]);

  // 🧹 Limpar automaticamente tarefas concluídas após 7 dias
  useEffect(() => {
    if (!autenticado) return;
    
    const limparTarefasAntigas = () => {
      const limite = Date.now() - 7 * 24 * 60 * 60 * 1000;

      setSetores(setoresAtuais => {
        const expiradas: TarefaDeletada[] = [];
        const atualizados = setoresAtuais.map(setor => ({
          ...setor,
          tarefas: (setor.tarefas || []).filter(tarefa => {
            if (statusDaTarefa(tarefa) !== 'concluida') return true;
            const dataConclusao = parseDataConclusao(tarefa.concluidaEm);
            if (!dataConclusao || dataConclusao.getTime() > limite) return true;
            expiradas.push({
              id: tarefa.id,
              texto: tarefa.texto,
              status: 'concluida',
              criadaEm: tarefa.criadaEm,
              criador: tarefa.criador,
              deletadaEm: new Date().toISOString(),
              deletadaPor: 'limpeza automática',
              setorId: setor.id
            });
            return false;
          })
        }));

        if (expiradas.length > 0) {
          setTarefasDeletadas(atuais => {
            const uniao = unirTarefasDeletadas(atuais, expiradas);
            localStorage.setItem('rm_tarefas_deletadas', JSON.stringify(uniao));
            return uniao;
          });
          return atualizados;
        }
        return setoresAtuais;
      });
    };

    const intervalo = setInterval(limparTarefasAntigas, 60000); // Verificar a cada minuto
    return () => clearInterval(intervalo);
  }, [autenticado]);

  const fazerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroLogin(false);
    setErroSenha('');
    if (!usuarioSelecionado) {
      setErroSenha('Selecione quem está acessando.');
      return;
    }
    if (!senhaDigitada.trim()) {
      setErroSenha('Digite a senha de acesso.');
      return;
    }

    setEntrando(true);
    try {
    let senhasAtuais = senhasUsuarios;
    let extrasAtuais = usuariosExtra;
    let permissoesAtuais = permissoesUsuarios;
    let registroNuvem: any = null;
    try {
      const controlador = new AbortController();
      const tempoLimite = window.setTimeout(() => controlador.abort(), 25000);
      const resposta = await fetch('/api/nuvem', { signal: controlador.signal, cache: 'no-store' });
      window.clearTimeout(tempoLimite);
      const dados = await resposta.json();
      const record = recordDoJsonBin(dados);
      if (resposta.ok && record && typeof record === 'object') {
        registroNuvem = record;
        if (Array.isArray(record.setores)) {
          const extraidos = extrairFotosSetores(record.setores);
          record.setores = extraidos.semFotos;
          registroNuvem.setores = extraidos.semFotos;
          fotosPendenciasRef.current = unirFotosPendencias(fotosPendenciasRef.current, record.fotosPendencias, extraidos.fotos);
          guardarFotosLocal(fotosPendenciasRef.current);
          const idsRemovidos = [...idsDeTarefasDeletadas(tarefasDeletadas), ...idsDeTarefasDeletadas(record.tarefasDeletadas)];
          setSetores(atuais => aplicarFotosNasTarefas(normalizarSetores(mesclarSetores(atuais, extraidos.semFotos, idsRemovidos)), fotosPendenciasRef.current));
        }
        if (Array.isArray(record.usuariosExtra)) {
          extrasAtuais = unirUsuariosCadastrados(usuariosExtra, record.usuariosExtra).filter(u => !USUARIOS_SISTEMA.some(o => o.id === u.id));
          setUsuariosExtra(extrasAtuais);
          localStorage.setItem('rm_usuarios_extra', JSON.stringify(extrasAtuais));
        }
        if (record.permissoesUsuarios && typeof record.permissoesUsuarios === 'object') {
          permissoesAtuais = unirPermissoesUsuarios(permissoesUsuarios, record.permissoesUsuarios);
          setPermissoesUsuarios(permissoesAtuais);
          localStorage.setItem('rm_permissoes_usuarios', JSON.stringify(permissoesAtuais));
        }
        if (record.senhasUsuarios && typeof record.senhasUsuarios === 'object') {
          senhasAtuais = { ...senhasAtuais, ...record.senhasUsuarios };
          setSenhasUsuarios(senhasAtuais);
          localStorage.setItem('rm_senhas_usuarios', JSON.stringify(senhasAtuais));
        }
      }
    } catch {}

    const usuario = unirUsuariosCadastrados(extrasAtuais).find(u => u.id === usuarioSelecionado);
    if (!usuario) {
      setErroLogin(true);
      return;
    }

    let hashDigitada = '';
    try {
      hashDigitada = await hashSenha(senhaDigitada);
    } catch {}
    const hashSalva = senhasAtuais[usuario.id];
    const senhaPessoalOk = Boolean(hashSalva && hashDigitada && hashDigitada === hashSalva);
    const senhaPadraoOk = senhaDigitada === SENHA_MEU_SISTEMA;
    if (!senhaPessoalOk && !senhaPadraoOk) {
      setErroLogin(true);
      setSenhaDigitada('');
      return;
    }

    setUsuarioLogado(aplicarPermissoesSalvas(usuario, permissoesAtuais));
    setAutenticado(true);
    setErroLogin(false);
    setNovaSenha('');
    setConfirmarSenha('');
    setErroSenha('');

    const chaveUsuario = `rm_backup_usuario_${usuario.id}`;
    let backupUsuario: string | null = null;
    try {
      backupUsuario = localStorage.getItem(chaveUsuario);
    } catch {}
    if (backupUsuario) {
      try {
        const dados = JSON.parse(backupUsuario);
        const deletadasBackup = Array.isArray(dados.tarefasDeletadas) ? dados.tarefasDeletadas : [];
        const idsRemovidos = [...idsDeTarefasDeletadas(tarefasDeletadas), ...idsDeTarefasDeletadas(deletadasBackup)];
        if (deletadasBackup.length > 0) {
          setTarefasDeletadas(atuais => unirTarefasDeletadas(atuais, deletadasBackup));
        }
        if (Array.isArray(dados.setores)) {
          const extraidos = extrairFotosSetores(dados.setores);
          setSetores(setoresAtuais => aplicarFotosNasTarefas(normalizarSetores(mesclarSetores(setoresAtuais, extraidos.semFotos, idsRemovidos)), extraidos.fotos));
        }
        if (dados.pagamentos || Array.isArray(dados.historicoPagamentos)) {
          setHistoricoPagamentos(atuais => {
            const uniaoLotes = unirLotesPagamento(atuais, dados.historicoPagamentos);
            setPagamentos(atuaisPag => unirPagamentosAbertos(atuaisPag, dados.pagamentos, uniaoLotes));
            return uniaoLotes;
          });
        }
        if (Array.isArray(dados.fornecedoresCotacao)) setFornecedoresCotacao(dados.fornecedoresCotacao);
        if (Array.isArray(dados.itensCotacao)) setItensCotacao(itensAtuais => mesclarItensCotacao(itensAtuais, dados.itensCotacao));
        if (dados.quantidadesElieuda) setQuantidadesElieuda(dados.quantidadesElieuda);
        if (Array.isArray(dados.conferencias)) {
          setConferencias(atuais => unirConferencias(atuais, dados.conferencias).filter(item => !conferenciasDeletadasRef.current.includes(item.id)));
        }
        if (Array.isArray(dados.pedidosCotacaoDeletados)) {
          const uniaoDel = unirIds(pedidosCotacaoDeletadosRef.current, dados.pedidosCotacaoDeletados);
          pedidosCotacaoDeletadosRef.current = uniaoDel;
          setPedidosCotacaoDeletados(uniaoDel);
          localStorage.setItem('rm_pedidos_cotacao_deletados', JSON.stringify(uniaoDel));
        }
        if (Array.isArray(dados.relatoriosPedidosCotacao)) {
          const uniao = unirPedidosCotacao(pedidosCotacaoDeletadosRef.current, relatoriosPedidosRef.current, pedidosSemPdfPesado(dados.relatoriosPedidosCotacao));
          relatoriosPedidosRef.current = uniao;
          setRelatoriosPedidosCotacao(uniao);
          localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(uniao));
        }
        if (dados.relatoriosPorData) setRelatoriosPorData(dados.relatoriosPorData);
        if (dados.ultimaAtualizacao) setUltimaAtualizacao(dados.ultimaAtualizacao);
      } catch {}
    }

    if (registroNuvem && (registroNuvem.pagamentos || Array.isArray(registroNuvem.historicoPagamentos))) {
      setHistoricoPagamentos(atuais => {
        const uniaoLotes = unirLotesPagamento(atuais, registroNuvem.historicoPagamentos);
        localStorage.setItem('rm_historico_pagamentos', JSON.stringify(uniaoLotes));
        setPagamentos(atuaisPag => {
          const uniaoPag = unirPagamentosAbertos(atuaisPag, registroNuvem.pagamentos, uniaoLotes);
          localStorage.setItem('rm_pagamentos', JSON.stringify(uniaoPag));
          return uniaoPag;
        });
        return uniaoLotes;
      });
    }

    setTabAtiva(usuario.tipo === 'manutencao' ? 'manutencao' : 'pendencias');
    setSairTelaInteira(false);
    const idsFotoLogin = [
      ...Object.keys(registroNuvem?.fotosPendencias || {}),
      ...(Array.isArray(registroNuvem?.fotosPendenciaIds) ? registroNuvem.fotosPendenciaIds : [])
    ];
    window.setTimeout(() => { void puxarFotosDaNuvem(idsParaBuscarFoto(idsFotoLogin)); }, 500);
    } finally {
      setEntrando(false);
    }
  };

  const salvarMinhaSenha = async () => {
    if (!usuarioLogado) return;
    setErroSenha('');
    if (novaSenha.trim().length < 4) {
      setErroSenha('A senha precisa ter pelo menos 4 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErroSenha('A confirmação não confere com a nova senha.');
      return;
    }
    setSalvandoSenha(true);
    try {
      const hashNova = await hashSenha(novaSenha.trim());
      const atualizadas = { ...senhasUsuarios, [usuarioLogado.id]: hashNova };
      setSenhasUsuarios(atualizadas);
      localStorage.setItem('rm_senhas_usuarios', JSON.stringify(atualizadas));
      await gravarNaWeb(undefined, undefined, undefined, undefined, undefined, undefined, undefined, [], undefined, atualizadas);
      setNovaSenha('');
      setConfirmarSenha('');
      setMostrarModalSenha(false);
      setAlerta({ tipo: 'sucesso', msg: '✓ Sua senha foi salva. Use-a no próximo acesso.' });
    } finally {
      setSalvandoSenha(false);
    }
  };

  const redefinirSenhaUsuario = async (usuarioIdInformado?: string) => {
    const idAlvo = usuarioIdInformado || usuarioResetSenha;
    if (usuarioLogado?.tipo !== 'admin' || !idAlvo) return;
    const atualizadas = { ...senhasUsuarios };
    delete atualizadas[idAlvo];
    setSenhasUsuarios(atualizadas);
    localStorage.setItem('rm_senhas_usuarios', JSON.stringify(atualizadas));
    await gravarNaWeb(undefined, undefined, undefined, undefined, undefined, undefined, undefined, [], undefined, atualizadas, idAlvo);
    const nome = unirUsuariosCadastrados(usuariosExtra).find(u => u.id === idAlvo)?.nome || 'usuário';
    setUsuarioResetSenha('');
    setAlerta({ tipo: 'sucesso', msg: `✓ Senha de ${nome} redefinida. No próximo acesso use a senha padrão do sistema e crie uma nova.` });
  };

  const adicionarNovoUsuario = async () => {
    if (usuarioLogado?.tipo !== 'admin') return;
    setErroNovoUsuario('');
    const nome = novoUsuarioNome.trim();
    if (nome.length < 2) {
      setErroNovoUsuario('Informe o nome do novo usuário.');
      return;
    }
    const jaExiste = unirUsuariosCadastrados(usuariosExtra).some(usuario => usuario.nome.toLowerCase() === nome.toLowerCase());
    if (jaExiste) {
      setErroNovoUsuario('Já existe um usuário com esse nome.');
      return;
    }
    if (novoUsuarioSenha.trim() && novoUsuarioSenha.trim().length < 4) {
      setErroNovoUsuario('A senha inicial precisa ter pelo menos 4 caracteres, ou deixe em branco para usar a senha padrão.');
      return;
    }
    const novoUsuario: Usuario = {
      id: `user_${Date.now()}`,
      nome,
      tipo: 'usuario',
      permissoes: { ...novoUsuarioPermissoes }
    };
    const extrasAtualizados = [...usuariosExtra, novoUsuario];
    usuariosExtraRef.current = extrasAtualizados;
    setUsuariosExtra(extrasAtualizados);
    localStorage.setItem('rm_usuarios_extra', JSON.stringify(extrasAtualizados));
    const permissoesAtualizadas = { ...permissoesUsuarios, [novoUsuario.id]: { ...novoUsuario.permissoes } };
    permissoesUsuariosRef.current = permissoesAtualizadas;
    setPermissoesUsuarios(permissoesAtualizadas);
    localStorage.setItem('rm_permissoes_usuarios', JSON.stringify(permissoesAtualizadas));
    let senhasAtualizadas = senhasUsuarios;
    if (novoUsuarioSenha.trim()) {
      const hashNova = await hashSenha(novoUsuarioSenha.trim());
      senhasAtualizadas = { ...senhasUsuarios, [novoUsuario.id]: hashNova };
      setSenhasUsuarios(senhasAtualizadas);
      localStorage.setItem('rm_senhas_usuarios', JSON.stringify(senhasAtualizadas));
    }
    await gravarNaWeb(undefined, undefined, undefined, undefined, undefined, undefined, undefined, [], undefined, senhasAtualizadas);
    setNovoUsuarioNome('');
    setNovoUsuarioSenha('');
    setNovoUsuarioPermissoes(permissoesPadraoNovoUsuario());
    setAlerta({ tipo: 'sucesso', msg: `✓ Usuário ${nome} criado. Permissões: ${rotuloPermissoes(novoUsuario.permissoes)}.` });
    setStatusSalvoSeguranca(`✓ SALVO — usuário ${nome} criado. Pode acessar: ${rotuloPermissoes(novoUsuario.permissoes)}`);
    setUsuarioPermissaoSalvaId(novoUsuario.id);
  };

  const removerUsuarioCadastrado = async (usuarioId: string) => {
    if (usuarioLogado?.tipo !== 'admin' || USUARIOS_SISTEMA.some(usuario => usuario.id === usuarioId)) return;
    if (!window.confirm('Remover este usuário do sistema?')) return;
    const extrasAtualizados = usuariosExtra.filter(usuario => usuario.id !== usuarioId);
    usuariosExtraRef.current = extrasAtualizados;
    setUsuariosExtra(extrasAtualizados);
    localStorage.setItem('rm_usuarios_extra', JSON.stringify(extrasAtualizados));
    const permissoesAtualizadas = { ...permissoesUsuarios };
    delete permissoesAtualizadas[usuarioId];
    permissoesUsuariosRef.current = permissoesAtualizadas;
    setPermissoesUsuarios(permissoesAtualizadas);
    localStorage.setItem('rm_permissoes_usuarios', JSON.stringify(permissoesAtualizadas));
    const senhasAtualizadas = { ...senhasUsuarios };
    delete senhasAtualizadas[usuarioId];
    setSenhasUsuarios(senhasAtualizadas);
    localStorage.setItem('rm_senhas_usuarios', JSON.stringify(senhasAtualizadas));
    await gravarNaWeb(undefined, undefined, undefined, undefined, undefined, undefined, undefined, [], undefined, senhasAtualizadas, usuarioId);
    setAlerta({ tipo: 'sucesso', msg: '✓ Usuário removido.' });
  };

  const alterarPermissaoUsuario = async (usuarioId: string, chave: keyof Usuario['permissoes'], marcado: boolean) => {
    if (usuarioLogado?.tipo !== 'admin') return;
    const usuarioBase = unirUsuariosCadastrados(usuariosExtra).find(usuario => usuario.id === usuarioId);
    if (!usuarioBase) return;
    const atuais = permissoesUsuarios[usuarioId] || usuarioBase.permissoes;
    const novasPermissoes = { ...atuais, [chave]: marcado };
    const permissoesAtualizadas = { ...permissoesUsuarios, [usuarioId]: novasPermissoes };
    permissoesUsuariosRef.current = permissoesAtualizadas;
    setPermissoesUsuarios(permissoesAtualizadas);
    localStorage.setItem('rm_permissoes_usuarios', JSON.stringify(permissoesAtualizadas));
    if (!USUARIOS_SISTEMA.some(oficial => oficial.id === usuarioId)) {
      const extrasAtualizados = usuariosExtra.map(usuario => usuario.id === usuarioId ? { ...usuario, permissoes: novasPermissoes } : usuario);
      usuariosExtraRef.current = extrasAtualizados;
      setUsuariosExtra(extrasAtualizados);
      localStorage.setItem('rm_usuarios_extra', JSON.stringify(extrasAtualizados));
    }
    if (usuarioLogado.id === usuarioId) {
      setUsuarioLogado({ ...usuarioLogado, permissoes: novasPermissoes });
      const abaPorPermissao: { [aba: string]: keyof Usuario['permissoes'] } = {
        pendencias: 'pendencias',
        cotacao: 'cotacao',
        cadastroProdutos: 'cotacao',
        cadastroFornecedores: 'cotacao',
        pagamentos: 'pagamentos',
        elieuda: 'elieuda',
        conferencia: 'conferencias',
        relatorios: 'relatorios',
        manutencao: 'manutencao',
        dados: 'dados'
      };
      const permissaoDaAba = abaPorPermissao[tabAtiva];
    if (permissaoDaAba && !novasPermissoes[permissaoDaAba]) setTabAtiva('seguranca');
    const aindaTemCompras = novasPermissoes.cotacao || novasPermissoes.pagamentos || novasPermissoes.elieuda || novasPermissoes.conferencias;
    if (tabAtiva === 'compras' && !aindaTemCompras) setTabAtiva('seguranca');
    }
    setStatusSalvoSeguranca('Salvando na nuvem...');
    setUsuarioPermissaoSalvaId(usuarioId);
    await gravarNaWeb();
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const mensagem = `✓ SALVO às ${hora} — ${usuarioBase.nome}: ${rotuloPermissoes(novasPermissoes)}`;
    setStatusSalvoSeguranca(mensagem);
    setAlerta({ tipo: 'sucesso', msg: mensagem });
  };

  const fazerLogout = () => {
    setAutenticado(false);
    setUsuarioLogado(null);
    setUsuarioSelecionado('');
    setSenhaDigitada('');
    setNovaSenha('');
    setConfirmarSenha('');
    setErroSenha('');
    setMostrarModalSenha(false);
  };

 const carregarTudo = useCallback(async () => {
    if (sincronizacaoEmCursoRef.current || gravandoNuvemRef.current) return;
    sincronizacaoEmCursoRef.current = true;
    const controlador = new AbortController();
    const tempoLimite = window.setTimeout(() => controlador.abort(), 25000);
    try {
      setStatusNuvem('⏳ Sincronizando...');
      const resposta = await fetch('/api/nuvem', {
        method: 'GET',
        cache: 'no-store',
        signal: controlador.signal
      });
      const dadosBrutos = await resposta.json();
      const dados = { record: recordDoJsonBin(dadosBrutos) };
      if (resposta.ok && dados.record && typeof dados.record === 'object') {
        const deletadasNuvem = Array.isArray(dados.record.tarefasDeletadas) ? dados.record.tarefasDeletadas : [];
        const idsRemovidos = [...idsDeTarefasDeletadas(tarefasDeletadasRef.current), ...idsDeTarefasDeletadas(deletadasNuvem)];
        if (deletadasNuvem.length > 0) {
          setTarefasDeletadas(atuais => {
            const uniao = unirTarefasDeletadas(atuais, deletadasNuvem);
            localStorage.setItem('rm_tarefas_deletadas', JSON.stringify(uniao));
            return uniao;
          });
        }
        if (Array.isArray(dados.record.setores)) {
          const extraidos = extrairFotosSetores(dados.record.setores);
          dados.record.setores = extraidos.semFotos;
          const fotosNuvem = unirFotosPendencias(fotosPendenciasRef.current, dados.record.fotosPendencias, extraidos.fotos);
          fotosPendenciasRef.current = fotosNuvem;
          guardarFotosLocal(fotosNuvem);
          setSetores(setoresAtuais => {
            const uniao = aplicarFotosNasTarefas(normalizarSetores(mesclarSetores(setoresAtuais, extraidos.semFotos, idsRemovidos)), fotosNuvem);
            gravarJsonLocal('rm_setores', setoresSemFotos(uniao));
            return uniao;
          });
        }
        if (dados.record.pagamentos || Array.isArray(dados.record.historicoPagamentos)) {
          setHistoricoPagamentos(atuais => {
            const uniaoLotes = unirLotesPagamento(atuais, dados.record.historicoPagamentos);
            localStorage.setItem('rm_historico_pagamentos', JSON.stringify(uniaoLotes));
            setPagamentos(atuaisPag => {
              const uniaoPag = unirPagamentosAbertos(atuaisPag, dados.record.pagamentos, uniaoLotes);
              localStorage.setItem('rm_pagamentos', JSON.stringify(uniaoPag));
              return uniaoPag;
            });
            return uniaoLotes;
          });
        }
        if (Array.isArray(dados.record.fornecedoresCotacao)) setFornecedoresCotacao(dados.record.fornecedoresCotacao);
        if (Array.isArray(dados.record.itensCotacao)) {
          setItensCotacao(itensAtuais => mesclarItensCotacao(itensAtuais, dados.record.itensCotacao));
        }
        if (dados.record.quantidadesElieuda) setQuantidadesElieuda(dados.record.quantidadesElieuda);
        if (Array.isArray(dados.record.conferencias)) {
          setConferencias(atuais => {
            const uniao = unirConferencias(atuais, dados.record.conferencias).filter(item => !conferenciasDeletadasRef.current.includes(item.id));
            localStorage.setItem('rm_conferencias', JSON.stringify(uniao));
            localStorage.setItem('rm_backup_conferencia', JSON.stringify({ conferencias: uniao }));
            return uniao;
          });
        }
        if (Array.isArray(dados.record.pedidosConferidos)) {
          setPedidosConferidosLocais(atuais => {
            const uniao = unirIds(atuais, dados.record.pedidosConferidos);
            localStorage.setItem('rm_pedidos_conferidos', JSON.stringify(uniao));
            return uniao;
          });
        }
        if (Array.isArray(dados.record.conferenciasDeletadas)) {
          setConferenciasDeletadas(atuais => {
            const uniao = unirIds(atuais, dados.record.conferenciasDeletadas);
            conferenciasDeletadasRef.current = uniao;
            localStorage.setItem('rm_conferencias_deletadas', JSON.stringify(uniao));
            return uniao;
          });
        }
        if (Array.isArray(dados.record.pedidosCotacaoDeletados)) {
          setPedidosCotacaoDeletados(atuais => {
            const uniao = unirIds(atuais, dados.record.pedidosCotacaoDeletados);
            pedidosCotacaoDeletadosRef.current = uniao;
            localStorage.setItem('rm_pedidos_cotacao_deletados', JSON.stringify(uniao));
            return uniao;
          });
        }
        if (Array.isArray(dados.record.relatoriosPedidosCotacao)) {
          setRelatoriosPedidosCotacao(atuais => {
            const uniao = unirPedidosCotacao(pedidosCotacaoDeletadosRef.current, atuais, dados.record.relatoriosPedidosCotacao);
            relatoriosPedidosRef.current = uniao;
            localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(uniao));
            return uniao;
          });
        }
        if (dados.record.senhasUsuarios && typeof dados.record.senhasUsuarios === 'object') {
          setSenhasUsuarios(atuais => {
            const uniao = { ...atuais, ...dados.record.senhasUsuarios };
            localStorage.setItem('rm_senhas_usuarios', JSON.stringify(uniao));
            return uniao;
          });
        }
        if (Array.isArray(dados.record.usuariosExtra)) {
          setUsuariosExtra(atuais => {
            const uniao = unirUsuariosCadastrados(atuais, dados.record.usuariosExtra).filter(u => !USUARIOS_SISTEMA.some(o => o.id === u.id));
            localStorage.setItem('rm_usuarios_extra', JSON.stringify(uniao));
            return uniao;
          });
        }
        if (dados.record.permissoesUsuarios && typeof dados.record.permissoesUsuarios === 'object') {
          setPermissoesUsuarios(atuais => {
            const uniao = unirPermissoesUsuarios(atuais, dados.record.permissoesUsuarios);
            localStorage.setItem('rm_permissoes_usuarios', JSON.stringify(uniao));
            return uniao;
          });
        }
        if (Array.isArray(dados.record.ordensManutencao)) {
          const extraidos = extrairFotosOrdens(dados.record.ordensManutencao);
          const fotosNuvem = unirFotosPendencias(fotosPendenciasRef.current, dados.record.fotosPendencias, extraidos.fotos);
          fotosPendenciasRef.current = fotosNuvem;
          guardarFotosLocal(fotosNuvem);
          setOrdensManutencao(atuais => {
            const uniao = aplicarFotosNasOrdens(unirOrdensManutencao(atuais, extraidos.semFotos), fotosNuvem);
            gravarJsonLocal('rm_ordens_manutencao', ordensSemFotos(uniao));
            return uniao;
          });
        }
        setStatusNuvem('🟢 Nuvem');
        const idsFoto = [
          ...Object.keys(dados.record.fotosPendencias || {}),
          ...(Array.isArray(dados.record.fotosPendenciaIds) ? dados.record.fotosPendenciaIds : [])
        ];
        void puxarFotosDaNuvem(idsParaBuscarFoto(idsFoto));
      }
    } catch (e) {
      setStatusNuvem('💾 Só neste aparelho');
    } finally {
      window.clearTimeout(tempoLimite);
      sincronizacaoEmCursoRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!autenticado) return;
    void carregarTudo();
    const intervalo = window.setInterval(() => { void carregarTudo(); }, 40000);
    const sincronizarSeVisivel = () => {
      if (document.visibilityState === 'visible') void carregarTudo();
    };
    document.addEventListener('visibilitychange', sincronizarSeVisivel);
    window.addEventListener('focus', sincronizarSeVisivel);
    window.addEventListener('online', sincronizarSeVisivel);
    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener('visibilitychange', sincronizarSeVisivel);
      window.removeEventListener('focus', sincronizarSeVisivel);
      window.removeEventListener('online', sincronizarSeVisivel);
    };
  }, [autenticado, carregarTudo]);
// Salvar relatório do dia automaticamente
  useEffect(() => {
    if (!autenticado) return;
    const hoje = new Date().toISOString().split('T')[0];
    const novoRelatorio = {
      pendentes: setores.reduce((acc, s) => acc + (s.tarefas || []).filter(t => t.status === 'aberta').length, 0),
      concluidas: setores.reduce((acc, s) => acc + (s.tarefas || []).filter(t => t.status === 'concluida').length, 0),
      pagamentos: Math.round(((pagamentos?.caixa || []).reduce((a, i) => a + i.valor, 0) + (pagamentos?.cheque || []).reduce((a, i) => a + i.valor, 0) + (pagamentos?.caben || []).reduce((a, i) => a + i.valor, 0)) * 100) / 100,
      conferencias: conferencias.length
    };
    
    const novosDados = { ...relatoriosPorData, [hoje]: novoRelatorio };
    setRelatoriosPorData(novosDados);
    localStorage.setItem('rm_relatorios_por_data', JSON.stringify(novosDados));
  }, [autenticado, setores, pagamentos, conferencias]);

  useEffect(() => {
    if (autenticado) {
      gravarJsonLocal('rm_setores', setoresSemFotos(setores));
    }
  }, [setores, autenticado]);

  useEffect(() => {
    if (autenticado) {
      gravarJsonLocal('rm_ordens_manutencao', ordensSemFotos(ordensManutencao));
    }
  }, [ordensManutencao, autenticado]);

  useEffect(() => {
    if (autenticado) {
      localStorage.setItem('rm_itens_cotacao', JSON.stringify(itensCotacao));
    }
  }, [itensCotacao, autenticado]);

  const salvarCopiaSegura = useCallback((override?: Partial<{ setores: Setor[]; pagamentos: PagamentosState; historicoPagamentos: LotePagamentoHistorico[]; fornecedoresCotacao: FornecedorCotacao[]; itensCotacao: ItemCotacao[]; quantidadesElieuda: QuantidadesElieuda; conferencias: RegistroConferencia[]; relatoriosPedidosCotacao: RelatorioPedidoCotacao[]; relatoriosPorData: { [data: string]: { pendentes: number; concluidas: number; pagamentos: number; conferencias: number } }; ultimaAtualizacao: string; tarefasDeletadas: TarefaDeletada[] }>) => {
    const payload = {
      setores: setoresSemFotos(override?.setores ?? setores),
      pagamentos: override?.pagamentos ?? pagamentos,
      historicoPagamentos: override?.historicoPagamentos ?? historicoPagamentos,
      fornecedoresCotacao: override?.fornecedoresCotacao ?? fornecedoresCotacao,
      itensCotacao: override?.itensCotacao ?? itensCotacao,
      quantidadesElieuda: override?.quantidadesElieuda ?? quantidadesElieuda,
      conferencias: override?.conferencias ?? conferencias,
      relatoriosPedidosCotacao: pedidosSemPdfPesado(override?.relatoriosPedidosCotacao ?? relatoriosPedidosCotacao),
      relatoriosPorData: override?.relatoriosPorData ?? relatoriosPorData,
      tarefasDeletadas: override?.tarefasDeletadas ?? tarefasDeletadas,
      ultimaAtualizacao: override?.ultimaAtualizacao ?? new Date().toLocaleString('pt-BR')
    };

    const usuarioId = usuarioLogado?.id || 'visitante';
    try {
      const historico = JSON.parse(localStorage.getItem('rm_backups_automáticos') || '[]');
      const proximo = [{ ...payload, salvoEm: new Date().toISOString(), usuarioId }, ...historico].slice(0, 8);
      gravarJsonLocal('rm_backups_automáticos', proximo);
      gravarJsonLocal('rm_backup_ultimo', payload);
      if (usuarioLogado?.id) {
        gravarJsonLocal(`rm_backup_usuario_${usuarioLogado.id}`, payload);
      }
    } catch {}
    return payload;
  }, [setores, pagamentos, historicoPagamentos, fornecedoresCotacao, itensCotacao, quantidadesElieuda, conferencias, relatoriosPedidosCotacao, relatoriosPorData, tarefasDeletadas, usuarioLogado]);

  const gravarNaWebRef = useRef<(...args: any[]) => Promise<unknown> | void>(() => Promise.resolve());
  const gravacaoAutomaticaInicialRef = useRef(true);
  useEffect(() => {
    if (!autenticado) {
      gravacaoAutomaticaInicialRef.current = true;
      return;
    }
    if (gravacaoAutomaticaInicialRef.current) {
      gravacaoAutomaticaInicialRef.current = false;
      return;
    }
    const espera = window.setTimeout(() => { void gravarNaWebRef.current(); }, 1800);
    return () => window.clearTimeout(espera);
  }, [autenticado, itensCotacao, quantidadesElieuda]);

  if (!usuarioLogado) {
    let usuariosParaLogin = USUARIOS_SISTEMA;
    try {
      usuariosParaLogin = unirUsuariosCadastrados(usuariosExtra).map(usuario => aplicarPermissoesSalvas(usuario, permissoesUsuarios));
    } catch {
      usuariosParaLogin = USUARIOS_SISTEMA;
    }
    const campoLogin = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/15';
    return (
      <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-br from-teal-950 via-teal-700 to-emerald-900 font-sans">
        <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-teal-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-24 h-80 w-80 rounded-full bg-emerald-300/15 blur-3xl" />
        <div className="relative z-10 flex flex-1 items-center justify-center p-5">
          <div className="w-full max-w-[440px] overflow-hidden rounded-3xl border border-white/70 bg-white/95 p-8 text-center shadow-2xl shadow-teal-950/30 backdrop-blur-xl">
            <div className="mb-5 inline-flex items-center gap-3 rounded-2xl bg-teal-50 p-2 pr-4 ring-1 ring-teal-100">
              <LogoRm size={80} />
              <div className="text-left">
                <p className="m-0 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700">RM</p>
                <h2 className="m-0 text-xl font-black tracking-tight text-slate-900">Sistema-Gestão</h2>
              </div>
            </div>
            <p className="mb-1 mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">Inovação & Gestão</p>
            <p className="mb-6 mt-2 text-sm text-slate-500">Entre com o seu usuário para acessar o painel</p>
            <form onSubmit={fazerLogin} className="flex flex-col gap-4 text-left">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Usuário</label>
                <select value={usuarioSelecionado} onChange={(e) => setUsuarioSelecionado(e.target.value)} className={campoLogin}>
                  <option value="">Selecione quem está acessando...</option>
                  {usuariosParaLogin.map(u => (
                    <option key={u.id} value={u.id}>{u.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Senha de acesso</label>
                <div className="flex items-stretch gap-2">
                  <input type={mostrarSenhaLogin ? 'text' : 'password'} placeholder="Digite sua senha" value={senhaDigitada} onChange={(e) => setSenhaDigitada(e.target.value)} autoComplete="current-password" className={`${campoLogin} min-w-0 flex-1`} />
                  <button type="button" onClick={() => setMostrarSenhaLogin(atual => !atual)} className="login-mostrar shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-bold uppercase tracking-wide text-teal-700 hover:bg-teal-50">
                    {mostrarSenhaLogin ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>
              {erroLogin && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-center text-sm font-bold text-red-700">Usuário ou senha inválidos</div>
              )}
              {erroSenha && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-center text-sm font-bold text-amber-800">{erroSenha}</div>
              )}
              <button type="submit" disabled={entrando} className="mt-1 w-full cursor-pointer rounded-xl border-0 bg-teal-700 px-4 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-teal-900/20 transition hover:bg-teal-600 active:scale-[0.99] disabled:cursor-wait disabled:opacity-80">
                {entrando ? 'Entrando...' : 'Entrar no sistema'}
              </button>
            </form>
          </div>
        </div>
        <p className="relative z-10 mx-auto mb-6 max-w-2xl px-6 text-center text-sm italic leading-relaxed text-white/90">
          “O que começou como uma forma de organizar minhas próprias pendências se transformou em uma ideia maior: criar, inovar e transformar desafios em soluções.”
        </p>
      </div>
    );
  }

  const exportarBackup = (opcoes?: { silencioso?: boolean; pagamentos?: PagamentosState; historicoPagamentos?: LotePagamentoHistorico[] }) => {
    salvarCopiaSegura({
      pagamentos: opcoes?.pagamentos ?? pagamentosRef.current,
      historicoPagamentos: opcoes?.historicoPagamentos ?? historicoPagamentosRef.current
    });
  };

  const aplicarBackup = (dados: any) => {
    if (Array.isArray(dados.setores)) {
      const extraidos = extrairFotosSetores(dados.setores);
      setSetores(normalizarSetores(aplicarFotosNasTarefas(extraidos.semFotos, extraidos.fotos)));
      dados.setores = extraidos.semFotos;
    }
    if (dados.pagamentos) setPagamentos(dados.pagamentos);
    if (Array.isArray(dados.historicoPagamentos)) setHistoricoPagamentos(dados.historicoPagamentos);
    if (Array.isArray(dados.fornecedoresCotacao)) setFornecedoresCotacao(dados.fornecedoresCotacao);
    if (Array.isArray(dados.itensCotacao)) setItensCotacao(mesclarItensCotacao(itensCotacao, dados.itensCotacao));
    if (dados.quantidadesElieuda) setQuantidadesElieuda(dados.quantidadesElieuda);
    if (Array.isArray(dados.conferencias)) {
      const uniao = unirConferencias(conferenciasRef.current, dados.conferencias).filter(item => !conferenciasDeletadasRef.current.includes(item.id));
      setConferencias(uniao);
      localStorage.setItem('rm_backup_conferencia', JSON.stringify({ conferencias: uniao }));
    }
    if (Array.isArray(dados.pedidosCotacaoDeletados)) {
      const uniaoDel = unirIds(pedidosCotacaoDeletadosRef.current, dados.pedidosCotacaoDeletados);
      pedidosCotacaoDeletadosRef.current = uniaoDel;
      setPedidosCotacaoDeletados(uniaoDel);
      localStorage.setItem('rm_pedidos_cotacao_deletados', JSON.stringify(uniaoDel));
    }
    if (Array.isArray(dados.relatoriosPedidosCotacao)) {
      const uniao = unirPedidosCotacao(pedidosCotacaoDeletadosRef.current, relatoriosPedidosRef.current, dados.relatoriosPedidosCotacao);
      relatoriosPedidosRef.current = uniao;
      setRelatoriosPedidosCotacao(uniao);
      localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(uniao));
    }
    if (dados.relatoriosPorData) setRelatoriosPorData(dados.relatoriosPorData);
    if (dados.ultimaAtualizacao) setUltimaAtualizacao(dados.ultimaAtualizacao);

    gravarJsonLocal('rm_setores', setoresSemFotos(dados.setores || setores));
    localStorage.setItem('rm_pagamentos', JSON.stringify(dados.pagamentos || pagamentos));
    localStorage.setItem('rm_historico_pagamentos', JSON.stringify(dados.historicoPagamentos || historicoPagamentos));
    localStorage.setItem('rm_fornecedores_cotacao', JSON.stringify(dados.fornecedoresCotacao || fornecedoresCotacao));
    localStorage.setItem('rm_itens_cotacao', JSON.stringify(dados.itensCotacao || itensCotacao));
    localStorage.setItem('rm_elieuda', JSON.stringify(dados.quantidadesElieuda || quantidadesElieuda));
    localStorage.setItem('rm_conferencias', JSON.stringify(dados.conferencias || conferencias));
    localStorage.setItem('rm_relatorios_por_data', JSON.stringify(dados.relatoriosPorData || relatoriosPorData));
    localStorage.setItem('rm_ultima_atualizacao', dados.ultimaAtualizacao || ultimaAtualizacao);
  };

  const restaurarBackupDoUsuarioAtual = (backup?: any) => {
    const salvo = backup || localStorage.getItem(`rm_backup_usuario_${usuarioLogado?.id}`);
    if (!salvo || !usuarioLogado) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Nenhum backup deste usuário foi encontrado.' });
      return;
    }

    try {
      const dados = typeof salvo === 'string' ? JSON.parse(salvo) : salvo;
      aplicarBackup(dados);
      localStorage.setItem('rm_backup_ultimo', JSON.stringify(dados));
      setAlerta({ tipo: 'sucesso', msg: `✓ Backup de ${usuarioLogado.nome} restaurado.` });
    } catch {
      setAlerta({ tipo: 'erro', msg: '⚠️ O backup deste usuário está inválido.' });
    }
  };

  const restaurarUltimoBackup = () => {
    const ultimo = localStorage.getItem('rm_backup_ultimo');
    if (!ultimo) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Nenhum backup recente encontrado para restaurar.' });
      return;
    }

    try {
      const dados = JSON.parse(ultimo);
      aplicarBackup(dados);

      setAlerta({ tipo: 'sucesso', msg: '✓ Último backup restaurado com sucesso.' });
    } catch {
      setAlerta({ tipo: 'erro', msg: '⚠️ Backup recente inválido.' });
    }
  };

  const importarBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const texto = await file.text();
        const dados = JSON.parse(texto);
        if (!dados || typeof dados !== 'object') throw new Error('Arquivo inválido');

        if (Array.isArray(dados.setores)) {
          const extraidos = extrairFotosSetores(dados.setores);
          setSetores(normalizarSetores(aplicarFotosNasTarefas(extraidos.semFotos, extraidos.fotos)));
          dados.setores = extraidos.semFotos;
        }
        if (dados.pagamentos) setPagamentos(dados.pagamentos);
        if (Array.isArray(dados.historicoPagamentos)) setHistoricoPagamentos(dados.historicoPagamentos);
        if (Array.isArray(dados.fornecedoresCotacao)) setFornecedoresCotacao(dados.fornecedoresCotacao);
        if (Array.isArray(dados.itensCotacao)) setItensCotacao(mesclarItensCotacao(itensCotacao, dados.itensCotacao));
        if (dados.quantidadesElieuda) setQuantidadesElieuda(dados.quantidadesElieuda);
        if (Array.isArray(dados.conferencias)) {
          const uniao = unirConferencias(conferenciasRef.current, dados.conferencias).filter(item => !conferenciasDeletadasRef.current.includes(item.id));
          setConferencias(uniao);
          localStorage.setItem('rm_backup_conferencia', JSON.stringify({ conferencias: uniao }));
        }
        if (Array.isArray(dados.relatoriosPedidosCotacao)) {
          const uniao = unirPedidosCotacao(pedidosCotacaoDeletadosRef.current, relatoriosPedidosRef.current, dados.relatoriosPedidosCotacao);
          relatoriosPedidosRef.current = uniao;
          setRelatoriosPedidosCotacao(uniao);
        }
        if (dados.relatoriosPorData) setRelatoriosPorData(dados.relatoriosPorData);
        if (dados.ultimaAtualizacao) setUltimaAtualizacao(dados.ultimaAtualizacao);

        gravarJsonLocal('rm_setores', setoresSemFotos(Array.isArray(dados.setores) ? dados.setores : setores));
        localStorage.setItem('rm_pagamentos', JSON.stringify(dados.pagamentos || pagamentos));
        localStorage.setItem('rm_historico_pagamentos', JSON.stringify(Array.isArray(dados.historicoPagamentos) ? dados.historicoPagamentos : historicoPagamentos));
        localStorage.setItem('rm_fornecedores_cotacao', JSON.stringify(Array.isArray(dados.fornecedoresCotacao) ? dados.fornecedoresCotacao : fornecedoresCotacao));
        localStorage.setItem('rm_itens_cotacao', JSON.stringify(Array.isArray(dados.itensCotacao) ? dados.itensCotacao : itensCotacao));
        localStorage.setItem('rm_elieuda', JSON.stringify(dados.quantidadesElieuda || quantidadesElieuda));
        localStorage.setItem('rm_conferencias', JSON.stringify(Array.isArray(dados.conferencias) ? dados.conferencias : conferencias));
        localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(Array.isArray(dados.relatoriosPedidosCotacao) ? dados.relatoriosPedidosCotacao : relatoriosPedidosCotacao));
        localStorage.setItem('rm_relatorios_por_data', JSON.stringify(dados.relatoriosPorData || relatoriosPorData));
        localStorage.setItem('rm_ultima_atualizacao', dados.ultimaAtualizacao || ultimaAtualizacao);
        localStorage.setItem('rm_backup_ultimo', JSON.stringify(dados));

        setAlerta({ tipo: 'sucesso', msg: '✓ Backup importado com sucesso.' });
      } catch (erro) {
        setAlerta({ tipo: 'erro', msg: '⚠️ Arquivo de backup inválido.' });
      }
    };
    input.click();
  };

  const gravarNaWeb = async (novosSetores?: Setor[], novosPagamentos?: PagamentosState, novoHistorico?: LotePagamentoHistorico[], novosFornCotacao?: FornecedorCotacao[], novosItensCotacao?: ItemCotacao[], novasQuantidades?: QuantidadesElieuda, novasConferencias?: RegistroConferencia[], idsTarefasRemovidas: string[] = [], listaDeletadas?: TarefaDeletada[], novasSenhas?: SenhasUsuarios, senhaRemovidaId?: string) => {
    const executar = async () => {
    gravandoNuvemRef.current = true;
    try {
    const dadosSetores = novosSetores !== undefined ? novosSetores : setoresRef.current;
    const dadosPagamentos = novosPagamentos !== undefined ? novosPagamentos : pagamentosRef.current;
    const dadosHistorico = novoHistorico !== undefined ? novoHistorico : historicoPagamentosRef.current;
    const dadosFornCotacao = novosFornCotacao !== undefined ? novosFornCotacao : fornecedoresCotacao;
    const dadosItensCotacao = novosItensCotacao !== undefined ? novosItensCotacao : itensCotacaoRef.current;
    const dadosElieuda = novasQuantidades !== undefined ? novasQuantidades : quantidadesElieuda;
    const dadosConferencias = novasConferencias !== undefined ? novasConferencias : conferenciasRef.current;
    const deletadasParaSalvar = unirTarefasDeletadas(listaDeletadas ?? tarefasDeletadas, idsTarefasRemovidas.map(id => ({ id })));
    const dadosSenhas = novasSenhas ?? senhasUsuarios;
    const agora = new Date().toLocaleString('pt-BR');

    salvarCopiaSegura({
      setores: setoresSemFotos(dadosSetores),
      pagamentos: dadosPagamentos,
      historicoPagamentos: dadosHistorico,
      fornecedoresCotacao: dadosFornCotacao,
      itensCotacao: dadosItensCotacao,
      quantidadesElieuda: dadosElieuda,
      conferencias: dadosConferencias,
      relatoriosPorData,
      tarefasDeletadas: deletadasParaSalvar,
      ultimaAtualizacao: agora
    });

    gravarJsonLocal('rm_setores', setoresSemFotos(dadosSetores));
    localStorage.setItem('rm_pagamentos', JSON.stringify(dadosPagamentos));
    localStorage.setItem('rm_historico_pagamentos', JSON.stringify(dadosHistorico));
    localStorage.setItem('rm_fornecedores_cotacao', JSON.stringify(dadosFornCotacao));
    localStorage.setItem('rm_itens_cotacao', JSON.stringify(dadosItensCotacao));
    localStorage.setItem('rm_elieuda', JSON.stringify(dadosElieuda));
    localStorage.setItem('rm_conferencias', JSON.stringify(dadosConferencias));
    localStorage.setItem('rm_backup_conferencia', JSON.stringify({ conferencias: dadosConferencias }));
    conferenciasRef.current = dadosConferencias;
    localStorage.setItem('rm_tarefas_deletadas', JSON.stringify(deletadasParaSalvar));
    localStorage.setItem('rm_ultima_atualizacao', agora);
    setUltimaAtualizacao(agora);

    try {
      let setoresParaNuvem = dadosSetores;
      let senhasParaNuvem = dadosSenhas;
      let historicoParaNuvem = dadosHistorico;
      let pagamentosParaNuvem = dadosPagamentos;
      let pedidosParaNuvem = relatoriosPedidosRef.current;
      let conferenciasParaNuvem = dadosConferencias;
      let conferidosParaNuvem = pedidosConferidosRef.current;
      let conferenciasDeletadasParaNuvem = conferenciasDeletadasRef.current;
      let pedidosCotacaoDeletadosParaNuvem = pedidosCotacaoDeletadosRef.current;
      let usuariosParaNuvem = usuariosExtraRef.current;
      let permissoesParaNuvem = permissoesUsuariosRef.current;
      let ordensParaNuvem = ordensManutencaoRef.current;
      let fotosPendenciasParaNuvem = fotosPendenciasRef.current;
      let conseguiuLerNuvem = false;
      try {
        const respostaAtual = await fetch('/api/nuvem', { cache: 'no-store' });
        const dadosAtuaisBrutos = await respostaAtual.json();
        const dadosAtuais = { record: recordDoJsonBin(dadosAtuaisBrutos) };
        if (respostaAtual.ok && dadosAtuais.record) {
          conseguiuLerNuvem = true;
          if (Array.isArray(dadosAtuais.record.setores)) {
            const extraidosNuvem = extrairFotosSetores(dadosAtuais.record.setores);
            const idsNuvem = idsDeTarefasDeletadas(dadosAtuais.record.tarefasDeletadas || []);
            const idsRemovidos = [...idsDeTarefasDeletadas(deletadasParaSalvar), ...idsNuvem];
            const locaisAgora = mesclarSetores(dadosSetores, setoresRef.current, idsRemovidos);
            setoresParaNuvem = setoresSemFotos(mesclarSetores(locaisAgora, extraidosNuvem.semFotos, idsRemovidos));
            fotosPendenciasParaNuvem = unirFotosPendencias(fotosPendenciasParaNuvem, extraidosNuvem.fotos, dadosAtuais.record.fotosPendencias);
            setSetores(atuais => {
              const fotos = unirFotosPendencias(fotosPendenciasParaNuvem, Object.fromEntries((atuais || []).flatMap(s => (s.tarefas || []).filter(t => t.foto).map(t => [t.id, t.foto as string]))));
              const uniao = aplicarFotosNasTarefas(mesclarSetores(atuais, setoresParaNuvem, idsRemovidos), fotos);
              setoresRef.current = uniao;
              gravarJsonLocal('rm_setores', setoresSemFotos(uniao));
              return uniao;
            });
          }
          historicoParaNuvem = unirLotesPagamento(historicoPagamentosRef.current, dadosHistorico, dadosAtuais.record.historicoPagamentos);
          pagamentosParaNuvem = unirPagamentosAbertos(
            pagamentosRef.current,
            unirPagamentosAbertos(dadosPagamentos, dadosAtuais.record.pagamentos, historicoParaNuvem),
            historicoParaNuvem
          );
          pagamentosRef.current = pagamentosParaNuvem;
          historicoPagamentosRef.current = historicoParaNuvem;
          setHistoricoPagamentos(historicoParaNuvem);
          setPagamentos(atuais => unirPagamentosAbertos(atuais, pagamentosParaNuvem, historicoParaNuvem));
          localStorage.setItem('rm_historico_pagamentos', JSON.stringify(historicoParaNuvem));
          localStorage.setItem('rm_pagamentos', JSON.stringify(pagamentosParaNuvem));
          pedidosCotacaoDeletadosParaNuvem = unirIds(pedidosCotacaoDeletadosRef.current, dadosAtuais.record.pedidosCotacaoDeletados);
          pedidosCotacaoDeletadosRef.current = pedidosCotacaoDeletadosParaNuvem;
          setPedidosCotacaoDeletados(pedidosCotacaoDeletadosParaNuvem);
          localStorage.setItem('rm_pedidos_cotacao_deletados', JSON.stringify(pedidosCotacaoDeletadosParaNuvem));
          pedidosParaNuvem = unirPedidosCotacao(pedidosCotacaoDeletadosParaNuvem, relatoriosPedidosRef.current, dadosAtuais.record.relatoriosPedidosCotacao);
          relatoriosPedidosRef.current = pedidosParaNuvem;
          setRelatoriosPedidosCotacao(pedidosParaNuvem);
          localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(pedidosParaNuvem));
          conferenciasDeletadasParaNuvem = unirIds(conferenciasDeletadasRef.current, dadosAtuais.record.conferenciasDeletadas);
          conferenciasDeletadasRef.current = conferenciasDeletadasParaNuvem;
          setConferenciasDeletadas(conferenciasDeletadasParaNuvem);
          localStorage.setItem('rm_conferencias_deletadas', JSON.stringify(conferenciasDeletadasParaNuvem));
          conferenciasParaNuvem = unirConferencias(conferenciasRef.current, dadosConferencias, dadosAtuais.record.conferencias).filter(item => !conferenciasDeletadasParaNuvem.includes(item.id));
          conferenciasRef.current = conferenciasParaNuvem;
          setConferencias(conferenciasParaNuvem);
          localStorage.setItem('rm_conferencias', JSON.stringify(conferenciasParaNuvem));
          localStorage.setItem('rm_backup_conferencia', JSON.stringify({ conferencias: conferenciasParaNuvem }));
          conferidosParaNuvem = unirIds(pedidosConferidosRef.current, dadosAtuais.record.pedidosConferidos);
          pedidosConferidosRef.current = conferidosParaNuvem;
          setPedidosConferidosLocais(conferidosParaNuvem);
          localStorage.setItem('rm_pedidos_conferidos', JSON.stringify(conferidosParaNuvem));
          const senhasNuvem = dadosAtuais.record.senhasUsuarios && typeof dadosAtuais.record.senhasUsuarios === 'object'
            ? dadosAtuais.record.senhasUsuarios
            : {};
          senhasParaNuvem = { ...senhasNuvem, ...dadosSenhas };
          if (senhaRemovidaId) delete senhasParaNuvem[senhaRemovidaId];
          setSenhasUsuarios(senhasParaNuvem);
          localStorage.setItem('rm_senhas_usuarios', JSON.stringify(senhasParaNuvem));
          if (Array.isArray(dadosAtuais.record.usuariosExtra)) {
            usuariosParaNuvem = unirUsuariosCadastrados(usuariosExtraRef.current, dadosAtuais.record.usuariosExtra).filter(u => !USUARIOS_SISTEMA.some(o => o.id === u.id));
            usuariosExtraRef.current = usuariosParaNuvem;
            setUsuariosExtra(usuariosParaNuvem);
            localStorage.setItem('rm_usuarios_extra', JSON.stringify(usuariosParaNuvem));
          }
          if (dadosAtuais.record.permissoesUsuarios && typeof dadosAtuais.record.permissoesUsuarios === 'object') {
            permissoesParaNuvem = unirPermissoesUsuarios(dadosAtuais.record.permissoesUsuarios, permissoesUsuariosRef.current);
            permissoesUsuariosRef.current = permissoesParaNuvem;
            setPermissoesUsuarios(permissoesParaNuvem);
            localStorage.setItem('rm_permissoes_usuarios', JSON.stringify(permissoesParaNuvem));
          }
          if (Array.isArray(dadosAtuais.record.ordensManutencao)) {
            const extraidos = extrairFotosOrdens(dadosAtuais.record.ordensManutencao);
            fotosPendenciasParaNuvem = unirFotosPendencias(fotosPendenciasParaNuvem, extraidos.fotos);
            ordensParaNuvem = unirOrdensManutencao(ordensManutencaoRef.current, extraidos.semFotos);
            const comFotos = aplicarFotosNasOrdens(ordensParaNuvem, fotosPendenciasParaNuvem);
            ordensManutencaoRef.current = ordensSemFotos(comFotos);
            setOrdensManutencao(comFotos);
            gravarJsonLocal('rm_ordens_manutencao', ordensSemFotos(comFotos));
          }
        }
      } catch {
        setStatusNuvem('⚠️ Sem nuvem');
      }

      const temPendenciaLocal = (setoresRef.current || []).some(setor => (setor.tarefas || []).length > 0);
      if (!conseguiuLerNuvem && !temPendenciaLocal) {
        setStatusNuvem('⚠️ Sem nuvem');
        return false;
      }

      setoresParaNuvem = setoresSemFotos(mesclarSetores(setoresRef.current, setoresParaNuvem, idsDeTarefasDeletadas(deletadasParaSalvar)));
      historicoParaNuvem = unirLotesPagamento(historicoPagamentosRef.current, historicoParaNuvem);
      pagamentosParaNuvem = unirPagamentosAbertos(pagamentosRef.current, pagamentosParaNuvem, historicoParaNuvem);
      pagamentosRef.current = pagamentosParaNuvem;
      historicoPagamentosRef.current = historicoParaNuvem;
      pedidosCotacaoDeletadosParaNuvem = unirIds(pedidosCotacaoDeletadosRef.current, pedidosCotacaoDeletadosParaNuvem);
      pedidosParaNuvem = unirPedidosCotacao(pedidosCotacaoDeletadosParaNuvem, relatoriosPedidosRef.current, pedidosParaNuvem);
      conferenciasDeletadasParaNuvem = unirIds(conferenciasDeletadasRef.current, conferenciasDeletadasParaNuvem);
      conferenciasParaNuvem = unirConferencias(conferenciasRef.current, conferenciasParaNuvem).filter(item => !conferenciasDeletadasParaNuvem.includes(item.id));
      conferidosParaNuvem = unirIds(pedidosConferidosRef.current, conferidosParaNuvem);
      usuariosParaNuvem = unirUsuariosCadastrados(usuariosExtraRef.current, usuariosParaNuvem).filter(u => !USUARIOS_SISTEMA.some(o => o.id === u.id));
      permissoesParaNuvem = unirPermissoesUsuarios(permissoesParaNuvem, permissoesUsuariosRef.current);
      fotosPendenciasParaNuvem = enxugarFotosNuvem(filtrarFotosUsadas(unirFotosPendencias(
        fotosPendenciasParaNuvem,
        fotosPendenciasRef.current,
        coletarFotosSetores(setoresRef.current),
        coletarFotosOrdens(ordensManutencaoRef.current)
      ), setoresParaNuvem, ordensParaNuvem), 800000);
      fotosPendenciasRef.current = fotosPendenciasParaNuvem;
      guardarFotosLocal(fotosPendenciasParaNuvem);
      await Promise.all(Object.entries(fotosPendenciasParaNuvem).map(([id, foto]) => enviarFotoNuvem(id, foto)));

      const registroNuvem = { setores: setoresSemFotos(setoresParaNuvem), pagamentos: pagamentosParaNuvem, historicoPagamentos: historicoParaNuvem, tarefasDeletadas: deletadasParaSalvar, fornecedoresCotacao: dadosFornCotacao, itensCotacao: dadosItensCotacao, quantidadesElieuda: dadosElieuda, conferencias: conferenciasParaNuvem, pedidosConferidos: conferidosParaNuvem, conferenciasDeletadas: conferenciasDeletadasParaNuvem, pedidosCotacaoDeletados: pedidosCotacaoDeletadosParaNuvem, relatoriosPedidosCotacao: pedidosParaNuvem, senhasUsuarios: senhasParaNuvem, usuariosExtra: usuariosParaNuvem, permissoesUsuarios: permissoesParaNuvem, ordensManutencao: ordensSemFotos(ordensParaNuvem), fotosPendencias: fotosPendenciasParaNuvem, fotosPendenciaIds: Object.keys(fotosPendenciasParaNuvem), ultimaAtualizacao: agora };
      const respostaGravar = await enviarRegistroNuvem(registroNuvem);
      if (!respostaGravar.ok) {
        setStatusNuvem('⚠️ Não gravou na nuvem');
        return false;
      }
      setSetores(atuais => aplicarFotosNasTarefas(atuais, fotosPendenciasParaNuvem));
      setOrdensManutencao(atuais => aplicarFotosNasOrdens(atuais, fotosPendenciasParaNuvem));
      setStatusNuvem('🟢 Gravado na nuvem');
      return true;
    } catch (err) {
      setStatusNuvem('⚠️ Modo Offline');
      return false;
    }
    } finally {
      gravandoNuvemRef.current = false;
    }
    };
    const proxima = gravacaoFilaRef.current.then(executar, executar);
    gravacaoFilaRef.current = proxima;
    return proxima;
  };
  gravarNaWebRef.current = gravarNaWeb;

  const adicionarOrdemManutencao = () => {
    const descricao = novaOrdemDescricao.trim();
    if (!descricao) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Descreva o problema da manutenção.' });
      return;
    }
    const agora = new Date().toISOString();
    const nova: OrdemManutencao = {
      id: `${Date.now()}`,
      local: novaOrdemLocal,
      tipo: novaOrdemTipo,
      descricao,
      status: 'pendente',
      prioridade: novaOrdemPrioridade,
      criadoPor: usuarioLogado?.nome || 'Desconhecido',
      criadoEm: agora,
      atualizadoEm: agora,
      responsavel: usuarioLogado?.tipo === 'manutencao' ? usuarioLogado.nome : '',
      ...(novaOrdemFoto ? { foto: novaOrdemFoto } : {})
    };
    if (novaOrdemFoto) void salvarFotoPendencia(nova.id, novaOrdemFoto);
    const proximas = [nova, ...ordensManutencao];
    setOrdensManutencao(proximas);
    ordensManutencaoRef.current = ordensSemFotos(proximas);
    gravarJsonLocal('rm_ordens_manutencao', ordensSemFotos(proximas));
    setNovaOrdemDescricao('');
    setNovaOrdemFoto('');
    setNovaOrdemPrioridade('media');
    gravarNaWeb();
    setAlerta({ tipo: 'sucesso', msg: '✓ Ordem de manutenção aberta.' });
  };

  const atualizarStatusOrdem = (id: string, status: StatusOrdemManutencao, motivoPausa?: string) => {
    const agora = new Date().toISOString();
    const proximas = ordensManutencao.map(ordem => ordem.id !== id ? ordem : {
      ...ordem,
      status,
      atualizadoEm: agora,
      concluidaEm: status === 'concluida' || status === 'nao_realizada' ? agora : undefined,
      responsavel: ordem.responsavel || usuarioLogado?.nome || '',
      motivoPausa: status === 'pausada' ? (motivoPausa || ordem.motivoPausa) : status === 'andamento' || status === 'pendente' ? undefined : ordem.motivoPausa
    });
    setOrdensManutencao(proximas);
    ordensManutencaoRef.current = ordensSemFotos(proximas);
    gravarJsonLocal('rm_ordens_manutencao', ordensSemFotos(proximas));
    gravarNaWeb();
  };

  const pedirMotivoPausa = (id: string) => {
    setOrdemPausaId(id);
    setMotivoPausaEscolhido(MOTIVOS_PAUSA_MANUTENCAO[0]);
    setMotivoPausaOutro('');
  };

  const confirmarPausaOrdem = (extras?: {
    compra?: { solicitante: string; equipamento: string };
    autorizacao?: { nome: string; assinatura: string };
  }) => {
    if (!ordemPausaId) return;
    const motivo = motivoPausaEscolhido === 'Outro motivo'
      ? (motivoPausaOutro.trim() || 'Outro motivo')
      : motivoPausaEscolhido;
    const agora = new Date().toISOString();
    const proximas = ordensManutencao.map(ordem => ordem.id !== ordemPausaId ? ordem : {
      ...ordem,
      status: 'pausada' as StatusOrdemManutencao,
      atualizadoEm: agora,
      responsavel: ordem.responsavel || usuarioLogado?.nome || '',
      motivoPausa: motivo,
      ...(extras?.compra ? {
        solicitadoPor: extras.compra.solicitante,
        equipamento: extras.compra.equipamento
      } : {}),
      ...(extras?.autorizacao ? {
        autorizadoPor: extras.autorizacao.nome,
        assinaturaAutorizacao: extras.autorizacao.assinatura
      } : {})
    });
    setOrdensManutencao(proximas);
    ordensManutencaoRef.current = ordensSemFotos(proximas);
    gravarJsonLocal('rm_ordens_manutencao', ordensSemFotos(proximas));
    gravarNaWeb();
    setOrdemPausaId('');
    setMotivoPausaOutro('');
  };

  const confirmarConclusaoOrdem = (id: string, dados: { observacao: string; assinadoPor: string; assinatura: string }) => {
    const agora = new Date().toISOString();
    const proximas = ordensManutencao.map(ordem => ordem.id !== id ? ordem : {
      ...ordem,
      status: 'concluida' as StatusOrdemManutencao,
      atualizadoEm: agora,
      concluidaEm: agora,
      responsavel: ordem.responsavel || usuarioLogado?.nome || '',
      observacaoConclusao: dados.observacao,
      assinadoPor: dados.assinadoPor,
      assinatura: dados.assinatura
    });
    setOrdensManutencao(proximas);
    ordensManutencaoRef.current = ordensSemFotos(proximas);
    gravarJsonLocal('rm_ordens_manutencao', ordensSemFotos(proximas));
    gravarNaWeb();
    setAlerta({ tipo: 'sucesso', msg: '✓ Ordem concluída e assinada.' });
  };

  const registrarCompraOrdem = (id: string, dados: { comprador: string; valor: number }) => {
    const agora = new Date().toISOString();
    const proximas = ordensManutencao.map(ordem => ordem.id !== id ? ordem : {
      ...ordem,
      atualizadoEm: agora,
      compradoPor: dados.comprador,
      valorEquipamento: dados.valor,
      dataCompra: agora
    });
    setOrdensManutencao(proximas);
    ordensManutencaoRef.current = ordensSemFotos(proximas);
    gravarJsonLocal('rm_ordens_manutencao', ordensSemFotos(proximas));
    gravarNaWeb();
    setAlerta({ tipo: 'sucesso', msg: '✓ Valor da compra registrado no mês.' });
  };

  const removerOrdemManutencao = (id: string) => {
    if (usuarioLogado?.tipo !== 'admin') {
      setAlerta({ tipo: 'erro', msg: '⚠️ Só a Ramara pode excluir ordem de serviço.' });
      return;
    }
    if (!window.confirm('Excluir esta ordem de serviço?')) return;
    const proximas = ordensManutencao.filter(ordem => ordem.id !== id);
    setOrdensManutencao(proximas);
    ordensManutencaoRef.current = proximas;
    gravarJsonLocal('rm_ordens_manutencao', ordensSemFotos(proximas));
    gravarNaWeb();
  };

  const escolherFotoOrdem = async (event: React.ChangeEvent<HTMLInputElement>, ordemId?: string) => {
    const arquivo = event.target.files?.[0];
    event.target.value = '';
    if (!arquivo) return;
    if (!arquivo.type.startsWith('image/')) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Escolha um arquivo de imagem.' });
      return;
    }
    try {
      const foto = await comprimirFotoPendencia(arquivo);
      if (!ordemId) {
        setNovaOrdemFoto(foto);
        return;
      }
      const proximas = ordensManutencao.map(ordem => ordem.id === ordemId ? { ...ordem, foto } : ordem);
      setOrdensManutencao(proximas);
      void salvarFotoPendencia(ordemId, foto);
      ordensManutencaoRef.current = ordensSemFotos(proximas);
      gravarJsonLocal('rm_ordens_manutencao', ordensSemFotos(proximas));
      gravarNaWeb();
    } catch {
      setAlerta({ tipo: 'erro', msg: '⚠️ Não foi possível usar esta foto.' });
    }
  };

  // Funções de Tarefas
 const adicionarTarefa = (setorId: string, textoInformado?: string, fotoInformada?: string) => {
    const texto = (textoInformado ?? novaTarefaTexto[setorId])?.trim();
    if (!texto) return;
 
    const dataHora = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    
    const novaTarefa: Tarefa = { 
      id: `${Date.now()}`, 
      texto, 
      concluida: false,
      status: 'aberta' as StatusTarefa, 
      criadaEm: dataHora, 
      criador: usuarioLogado?.nome || 'Desconhecido', 
      dataCriacao: new Date().toLocaleDateString('pt-BR'), 
      responsavel: responsavelSelecionado[setorId] || '',
      prioridade: prioridadeSelecionada[setorId] || 'media',
      ...(fotoInformada ? { foto: fotoInformada } : {})
    };
    if (fotoInformada) void salvarFotoPendencia(novaTarefa.id, fotoInformada);

    const novos = setores.map(s => s.id === setorId ? { ...s, tarefas: [novaTarefa, ...(s.tarefas || [])] } : s);
    setoresRef.current = novos;
    setSetores(novos);
    gravarJsonLocal('rm_setores', setoresSemFotos(novos));
    setNovaTarefaTexto({ ...novaTarefaTexto, [setorId]: '' });
    setPrioridadeSelecionada({ ...prioridadeSelecionada, [setorId]: 'media' });
    setAlerta({ tipo: 'sucesso', msg: '✓ Pendência lançada. Gravando na nuvem…' });
    void gravarNaWeb(novos).then(ok => {
      if (ok) setAlerta({ tipo: 'sucesso', msg: '✓ Pendência gravada na nuvem. Aparece no site e nos outros aparelhos.' });
      else setAlerta({ tipo: 'erro', msg: '⚠️ Não gravou na nuvem. Clique em Salvar agora e tente de novo.' });
    });
  };

  const adicionarTarefaCentral = () => {
    if (!setorSelecionadoNovaTarefa) return;
    adicionarTarefa(setorSelecionadoNovaTarefa, novaTarefaCentral, novaTarefaFoto);
    setNovaTarefaCentral('');
    setNovaTarefaFoto('');
  };

  const escolherFotoPendencia = async (event: React.ChangeEvent<HTMLInputElement>, destino?: { setorId: string; tarefaId: string }) => {
    const arquivo = event.target.files?.[0];
    event.target.value = '';
    if (!arquivo) return;
    if (!arquivo.type.startsWith('image/')) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Escolha um arquivo de imagem.' });
      return;
    }
    try {
      const foto = await comprimirFotoPendencia(arquivo);
      if (destino) {
        const novos = setores.map(s => s.id === destino.setorId
          ? { ...s, tarefas: s.tarefas.map(t => t.id === destino.tarefaId ? { ...t, foto } : t) }
          : s);
        setSetores(novos);
        void salvarFotoPendencia(destino.tarefaId, foto);
        gravarNaWeb(setoresSemFotos(novos));
        setAlerta({ tipo: 'sucesso', msg: '✓ Foto adicionada à pendência.' });
        return;
      }
      setNovaTarefaFoto(foto);
    } catch {
      setAlerta({ tipo: 'erro', msg: '⚠️ Não foi possível usar esta foto.' });
    }
  };

  const alternarStatusTarefa = (setorId: string, tarefaId: string) => {
    const agoraIso = new Date().toISOString();
    const novos = setores.map(s => s.id === setorId ? { ...s, tarefas: s.tarefas.map(t => {
      if (t.id !== tarefaId) return t;
      const estavaConcluida = statusDaTarefa(t) === 'concluida';
      return {
        ...t,
        status: (estavaConcluida ? 'aberta' : 'concluida') as StatusTarefa,
        concluida: !estavaConcluida,
        concluidaEm: estavaConcluida ? undefined : agoraIso
      };
    }) } : s);
    setSetores(novos);
    gravarNaWeb(novos);
  };

  const removerTarefa = (setorId: string, tarefaId: string) => {
    if (!window.confirm('Confirma a exclusão? (Será salva no histórico de deletadas)')) return;
    const tarefaParaRemover = setores.find(s => s.id === setorId)?.tarefas.find(t => t.id === tarefaId);
    if (tarefaParaRemover) {
      const agora = new Date().toLocaleDateString('pt-BR');
      const novasDeletadas: TarefaDeletada = {
        id: tarefaParaRemover.id,
        texto: tarefaParaRemover.texto,
        status: tarefaParaRemover.status,
        criadaEm: tarefaParaRemover.criadaEm,
        criador: tarefaParaRemover.criador,
        deletadaEm: agora,
        deletadaPor: usuarioLogado?.nome || 'Desconhecido',
        setorId: setorId,
        foto: tarefaParaRemover.foto
      };
      const novaListaDeletadas = unirTarefasDeletadas(tarefasDeletadas, [novasDeletadas]);
      setTarefasDeletadas(novaListaDeletadas);
      localStorage.setItem('rm_tarefas_deletadas', JSON.stringify(novaListaDeletadas));
      setAlerta({ tipo: 'sucesso', msg: '✓ Tarefa deletada (pode ser recuperada no histórico)' });
      const novos = setores.map(s => s.id === setorId ? { ...s, tarefas: s.tarefas.filter(t => t.id !== tarefaId) } : s);
      setSetores(novos);
      gravarNaWeb(novos, undefined, undefined, undefined, undefined, undefined, undefined, [tarefaId], novaListaDeletadas);
      return;
    }
    const novos = setores.map(s => s.id === setorId ? { ...s, tarefas: s.tarefas.filter(t => t.id !== tarefaId) } : s);
    setSetores(novos);
    gravarNaWeb(novos, undefined, undefined, undefined, undefined, undefined, undefined, [tarefaId]);
  };

  const recuperarTarefa = (tarefaDeletada: TarefaDeletada) => {
    const novaTarefa: Tarefa = {
      id: tarefaDeletada.id,
      texto: tarefaDeletada.texto,
      status: 'aberta' as StatusTarefa,
      criadaEm: tarefaDeletada.criadaEm,
      criador: tarefaDeletada.criador,
      dataCriacao: tarefaDeletada.criadaEm,
      foto: tarefaDeletada.foto
    };
    const novos = setores.map(s => s.id === tarefaDeletada.setorId ? { ...s, tarefas: [...s.tarefas, novaTarefa] } : s);
    const novaListaDeletadas = tarefasDeletadas.filter(t => t.id !== tarefaDeletada.id);
    setSetores(novos);
    setTarefasDeletadas(novaListaDeletadas);
    localStorage.setItem('rm_tarefas_deletadas', JSON.stringify(novaListaDeletadas));
    gravarNaWeb(novos, undefined, undefined, undefined, undefined, undefined, undefined, [], novaListaDeletadas);
    setAlerta({ tipo: 'sucesso', msg: '✓ Tarefa recuperada com sucesso!' });
  };

  const mudarResponsavel = (setorId: string, tarefaId: string, novoResponsavel: string) => {
    const novos = setores.map(s => s.id === setorId ? { ...s, tarefas: s.tarefas.map(t => t.id === tarefaId ? { ...t, responsavel: novoResponsavel } : t) } : s);
    setSetores(novos);
    gravarNaWeb(novos);
  };

  const conversarComRobo = () => {
    const comando = mensagemRobo.trim();
    if (!comando) return;
    const normalizado = comando.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let resposta = 'Ainda estou aprendendo. Tente: "pendencias", "setores", "criar tarefa texto no setor Loja" ou "concluir tarefa texto".';
    const agora = new Date();
    const registroNoMesAtual = (data: string) => {
      const partes = data.split(',')[0].split('/').map(Number);
      return partes.length === 3 && partes[1] === agora.getMonth() + 1 && partes[2] === agora.getFullYear();
    };
    const normalizarFornecedor = (nome: string) => nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
    const formatarMoeda = (valor: number) => `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (normalizado.includes('valor') && (normalizado.includes('comprado') || normalizado.includes('comprada')) && normalizado.includes('fornecedor')) {
      const totaisPorFornecedor = fornecedoresCotacao.map(fornecedor => {
        const nomeFornecedor = normalizarFornecedor(fornecedor.nome);
        const compras = relatoriosPedidosCotacao.filter(relatorio => {
          const fornecedorDoPedido = normalizarFornecedor(relatorio.itens[0]?.fornecedor || '');
          return fornecedorDoPedido === nomeFornecedor && registroNoMesAtual(relatorio.data);
        });
        const conferenciasDoFornecedor = conferencias.filter(conferencia => {
          const pedido = relatoriosPedidosCotacao.find(relatorio => relatorio.id === conferencia.pedidoId);
          const fornecedorDaConferencia = normalizarFornecedor(pedido?.itens[0]?.fornecedor || '');
          return fornecedorDaConferencia === nomeFornecedor && registroNoMesAtual(conferencia.data);
        });
        return {
          nome: fornecedor.nome,
          comprado: compras.reduce((total, compra) => total + compra.totalGeral, 0),
          recebido: conferenciasDoFornecedor.reduce((total, conferencia) => total + conferencia.valorRecebido, 0)
        };
      }).filter(item => item.comprado > 0 || item.recebido > 0);
      const recebidoPorConferente = new Map<string, number>();
      conferencias.filter(conferencia => registroNoMesAtual(conferencia.data)).forEach(conferencia => {
        recebidoPorConferente.set(conferencia.nomeConferente, (recebidoPorConferente.get(conferencia.nomeConferente) || 0) + conferencia.valorRecebido);
      });
      const formatarValor = (valor: number) => `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      const totalRecebido = Array.from(recebidoPorConferente.values()).reduce((total, valor) => total + valor, 0);
      const resumoFornecedores = totaisPorFornecedor.length > 0
        ? totaisPorFornecedor.map(item => `${item.nome}: comprado ${formatarValor(item.comprado)}, recebido ${formatarValor(item.recebido)}`).join(' | ')
        : 'nenhuma compra ou conferência registrada';
      const resumoConferentes = recebidoPorConferente.size > 0
        ? Array.from(recebidoPorConferente.entries()).map(([nome, valor]) => `${nome}: ${formatarValor(valor)}`).join(' | ')
        : 'nenhum recebimento registrado';
      resposta = `Resumo deste mês por fornecedor: ${resumoFornecedores}. Total recebido pelos conferentes: ${formatarValor(totalRecebido)} (${resumoConferentes}).`;
    } else if ((normalizado.includes('preco') || normalizado.includes('valor') || normalizado.includes('custo')) && (normalizado.includes('bebida') || normalizado.includes('bebidas'))) {
      const itensBebidas = itensCotacao.filter(item => secaoProduto(item.produto) === 'Molhos, temperos e bebidas');
      const resumoBebidas = itensBebidas.map(item => {
        const calculo = calcularMenorPrecoItem(item);
        const fornecedor = fornecedoresCotacao.find(itemFornecedor => itemFornecedor.id === calculo.vencedorFornId);
        const preco = calculo.menorPreco === null ? 'sem preço' : `menor preço ${formatarMoeda(calculo.menorPreco)}`;
        const custo = item.menorCusto ? `menor custo registrado ${formatarMoeda(item.menorCusto)}` : 'sem custo registrado';
        return `${item.produto}: ${preco}${fornecedor ? ` com ${fornecedor.nome}` : ''}; ${custo}`;
      });
      resposta = resumoBebidas.length > 0
        ? `Consulta de bebidas: ${resumoBebidas.join(' | ')}.`
        : 'Não encontrei produtos na seção de bebidas.';
    } else if (normalizado.includes('conferente') && (normalizado.includes('nota') || normalizado.includes('pedido'))) {
      const fornecedorSolicitado = fornecedoresCotacao.find(fornecedor => normalizado.includes(normalizarFornecedor(fornecedor.nome)));
      const conferenciasEncontradas = conferencias.filter(conferencia => {
        const pedido = relatoriosPedidosCotacao.find(relatorio => relatorio.id === conferencia.pedidoId);
        const fornecedorDoPedido = normalizarFornecedor(pedido?.itens[0]?.fornecedor || '');
        return fornecedorSolicitado ? fornecedorDoPedido === normalizarFornecedor(fornecedorSolicitado.nome) : true;
      });
      const conferencia = conferenciasEncontradas[0];
      if (!conferencia) {
        resposta = fornecedorSolicitado ? `Não encontrei conferência registrada para ${fornecedorSolicitado.nome}.` : 'Não encontrei nenhuma conferência registrada.';
      } else {
        const pedido = relatoriosPedidosCotacao.find(relatorio => relatorio.id === conferencia.pedidoId);
        const fornecedor = pedido?.itens[0]?.fornecedor || 'fornecedor não identificado';
        resposta = `O conferente foi ${conferencia.nomeConferente}, na nota da ${fornecedor}, em ${conferencia.data}. Valor recebido: R$ ${conferencia.valorRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Observações: ${conferencia.observacoes || 'nenhuma'}.`;
      }
    } else if ((normalizado.includes('quantas') || normalizado.includes('quantos')) && (normalizado.includes('diverg') || normalizado.includes('diveg')) && normalizado.includes('mes')) {
      const registrosDoMes = conferencias.filter(conferencia => registroNoMesAtual(conferencia.data));
      const divergentes = registrosDoMes.filter(conferencia => conferencia.houveDivergencia).length;
      resposta = `Durante este mês houve ${divergentes} conferência(s) com divergência.`;
    } else if ((normalizado.includes('quantas') || normalizado.includes('quantos')) && (normalizado.includes('sem diverg') || normalizado.includes('sem diveg'))) {
      const registrosDoMes = conferencias.filter(conferencia => registroNoMesAtual(conferencia.data));
      const semDivergencia = registrosDoMes.filter(conferencia => !conferencia.houveDivergencia).length;
      resposta = `Durante este mês houve ${semDivergencia} conferência(s) sem divergência.`;
    } else if (normalizado.includes('faltou') || normalizado.includes('faltaram') || normalizado.includes('itens faltantes')) {
      const observacoesPorFornecedor = new Map<string, string[]>();
      conferencias.filter(conferencia => registroNoMesAtual(conferencia.data)).forEach(conferencia => {
        if (!conferencia.observacoes.trim()) return;
        const pedido = relatoriosPedidosCotacao.find(relatorio => relatorio.id === conferencia.pedidoId);
        const fornecedor = pedido?.itens[0]?.fornecedor || 'Fornecedor não identificado';
        const observacoes = observacoesPorFornecedor.get(fornecedor) || [];
        observacoes.push(conferencia.observacoes.trim());
        observacoesPorFornecedor.set(fornecedor, observacoes);
      });
      resposta = observacoesPorFornecedor.size === 0
        ? 'Não encontrei observações de itens faltantes neste mês.'
        : `Itens faltantes nas observações: ${Array.from(observacoesPorFornecedor.entries()).map(([fornecedor, observacoes]) => `${fornecedor}: ${observacoes.join(' / ')}`).join(' | ')}.`;
    } else if ((normalizado.includes('quantas') || normalizado.includes('quantos')) && (normalizado.includes('bonific') || normalizado.includes('nota bonificada'))) {
      const notasBonificadas = conferencias.filter(conferencia => registroNoMesAtual(conferencia.data) && /bonific|nota\s+bonificada/i.test(conferencia.observacoes));
      resposta = `Durante este mês foram registradas ${notasBonificadas.length} nota(s) bonificada(s).`;
    } else if (normalizado.includes('ultima compra') || normalizado.includes('ultimo pedido')) {
      const fornecedorSolicitado = fornecedoresCotacao.find(fornecedor => normalizado.includes(normalizarFornecedor(fornecedor.nome)));
      if (!fornecedorSolicitado) {
        resposta = `Informe um fornecedor cadastrado. Disponíveis: ${fornecedoresCotacao.map(fornecedor => fornecedor.nome).join(', ')}.`;
      } else {
        const nomeFornecedor = normalizarFornecedor(fornecedorSolicitado.nome);
        const ultimaCompra = relatoriosPedidosCotacao.find(relatorio => normalizarFornecedor(relatorio.itens[0]?.fornecedor || '') === nomeFornecedor);
        if (!ultimaCompra) {
          resposta = `Não encontrei compra registrada para ${fornecedorSolicitado.nome}.`;
        } else {
          const itens = ultimaCompra.itens.filter(item => item.valorTotal > 0).length;
          resposta = `A última compra da ${fornecedorSolicitado.nome} foi de R$ ${ultimaCompra.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, em ${ultimaCompra.data}, com ${itens} item(ns).`;
        }
      }
    } else if (normalizado.includes('conferencia') && (normalizado.includes('aberta') || normalizado.includes('pendente'))) {
     const pedidosConferidosIds = new Set([
  ...pedidosConferidosLocais,
  ...conferencias.map(c => c.pedidoId).filter((id): id is string => Boolean(id))
]);
    const pedidosAbertosPorFornecedor = fornecedoresCotacao.map(fornecedor => {
  const nomeFornecedor = normalizarFornecedor(fornecedor.nome);
  const abertos = relatoriosPedidosCotacao.filter(relatorio => {
    const fornecedorDoPedido = normalizarFornecedor(relatorio.itens[0]?.fornecedor || '');
    return fornecedorDoPedido === nomeFornecedor && relatorio.enviadoConferencia !== false && !pedidosConferidosIds.has(relatorio.id);
  }).length;
  return `${fornecedor.nome}: ${abertos}`;
});
      resposta = pedidosAbertosPorFornecedor.length > 0
        ? `Conferências abertas por fornecedor: ${pedidosAbertosPorFornecedor.join(' | ')}.`
        : 'Ainda não há fornecedores cadastrados.';
    } else if (normalizado.includes('pendencia')) {
      const abertas = setores.flatMap(setor => setor.tarefas.filter(tarefa => tarefa.status === 'aberta').map(tarefa => `${tarefa.texto} (${nomeSetorSemEmoji(setor.nome)})`));
      resposta = abertas.length === 0 ? 'Não há pendências abertas.' : `Há ${abertas.length} pendência(s) aberta(s): ${abertas.slice(0, 5).join('; ')}${abertas.length > 5 ? '...' : ''}`;
    } else if (normalizado.includes('setor')) {
      resposta = setores.map(setor => `${nomeSetorSemEmoji(setor.nome)}: ${setor.tarefas.filter(tarefa => tarefa.status === 'aberta').length} aberta(s)`).join(' | ');
    } else if (normalizado.startsWith('criar tarefa ')) {
      const correspondencia = comando.match(/^criar tarefa (.+) no setor (.+)$/i);
      const setor = correspondencia && setores.find(item => nomeSetorSemEmoji(item.nome).toLowerCase() === correspondencia[2].trim().toLowerCase());
      if (!correspondencia || !setor) {
        resposta = 'Use o formato: criar tarefa revisar estoque no setor Loja.';
      } else {
        adicionarTarefa(setor.id, correspondencia[1].trim());
        resposta = `Tarefa criada no setor ${nomeSetorSemEmoji(setor.nome)}.`;
      }
    } else if (normalizado.startsWith('concluir tarefa ')) {
      const texto = comando.slice('concluir tarefa '.length).trim().toLowerCase();
      const setorEncontrado = setores.find(setor => setor.tarefas.some(tarefa => tarefa.status === 'aberta' && tarefa.texto.toLowerCase().includes(texto)));
      const tarefaEncontrada = setorEncontrado?.tarefas.find(tarefa => tarefa.status === 'aberta' && tarefa.texto.toLowerCase().includes(texto));
      if (!setorEncontrado || !tarefaEncontrada) {
        resposta = 'Não encontrei uma pendência aberta com esse texto.';
      } else {
        alternarStatusTarefa(setorEncontrado.id, tarefaEncontrada.id);
        resposta = `Tarefa concluída: ${tarefaEncontrada.texto}.`;
      }
    }

    setConversaRobo(prev => [...prev, { autor: 'voce', texto: comando }, { autor: 'robo', texto: resposta }]);
    setMensagemRobo('');
  };

 // Funções de Pagamentos (Blindadas contra nulo / undefined)
  const obterListaSegura = (tipo: 'caixa' | 'cheque' | 'caben') => {
    if (pagamentos && Array.isArray(pagamentos[tipo])) {
      return pagamentos[tipo];
    }
    return [];
  };

  const listaCaixaSegura = obterListaSegura('caixa');
  const listaChequeSegura = obterListaSegura('cheque');
  const listaCabenSegura = obterListaSegura('caben');

  const adicionarPagamentoCaixa = () => {
    if (!novoCaixa.descricao.trim() || !novoCaixa.valor) return;
    const val = parseFloat(novoCaixa.valor.replace(',', '.'));
    if (isNaN(val)) return;
    const atuais = pagamentosRef.current;
    const novosPagamentos: PagamentosState = {
      caixa: [{ id: `${Date.now()}`, descricao: novoCaixa.descricao.trim(), valor: val }, ...(atuais.caixa || [])],
      cheque: atuais.cheque || [],
      caben: atuais.caben || []
    };
    pagamentosRef.current = novosPagamentos;
    setPagamentos(novosPagamentos);
    setNovoCaixa({ descricao: '', valor: '' });
    localStorage.setItem('rm_pagamentos', JSON.stringify(novosPagamentos));
    localStorage.setItem('rm_backup_completo', JSON.stringify({ pagamentos: novosPagamentos, historicoPagamentos: historicoPagamentosRef.current }));
    void gravarNaWeb(undefined, novosPagamentos);
  };

  const adicionarPagamentoCheque = () => {
    if (!novoCheque.descricao.trim() || !novoCheque.valor) return;
    const val = parseFloat(novoCheque.valor.replace(',', '.'));
    if (isNaN(val)) return;
    const atuais = pagamentosRef.current;
    const novosPagamentos: PagamentosState = {
      caixa: atuais.caixa || [],
      cheque: [{ id: `${Date.now()}`, descricao: novoCheque.descricao.trim(), valor: val }, ...(atuais.cheque || [])],
      caben: atuais.caben || []
    };
    pagamentosRef.current = novosPagamentos;
    setPagamentos(novosPagamentos);
    setNovoCheque({ descricao: '', valor: '' });
    localStorage.setItem('rm_pagamentos', JSON.stringify(novosPagamentos));
    localStorage.setItem('rm_backup_completo', JSON.stringify({ pagamentos: novosPagamentos, historicoPagamentos: historicoPagamentosRef.current }));
    void gravarNaWeb(undefined, novosPagamentos);
  };

  const adicionarPagamentoCaben = () => {
    if (!novoCaben.descricao.trim() || !novoCaben.valor) return;
    const val = parseFloat(novoCaben.valor.replace(',', '.'));
    if (isNaN(val)) return;
    const atuais = pagamentosRef.current;
    const novosPagamentos: PagamentosState = {
      caixa: atuais.caixa || [],
      cheque: atuais.cheque || [],
      caben: [{ id: `${Date.now()}`, descricao: novoCaben.descricao.trim(), valor: val }, ...(atuais.caben || [])]
    };
    pagamentosRef.current = novosPagamentos;
    setPagamentos(novosPagamentos);
    setNovoCaben({ descricao: '', valor: '' });
    localStorage.setItem('rm_pagamentos', JSON.stringify(novosPagamentos));
    localStorage.setItem('rm_backup_completo', JSON.stringify({ pagamentos: novosPagamentos, historicoPagamentos: historicoPagamentosRef.current }));
    void gravarNaWeb(undefined, novosPagamentos);
  };

  const removerPagamento = (tipo: 'caixa' | 'cheque' | 'caben', id: string) => {
    if (!window.confirm('Confirma a remoção deste lançamento?')) return;
    const listaAtual = obterListaSegura(tipo);
    const novosPagamentos: PagamentosState = {
      caixa: tipo === 'caixa' ? listaAtual.filter(item => item.id !== id) : listaCaixaSegura,
      cheque: tipo === 'cheque' ? listaAtual.filter(item => item.id !== id) : listaChequeSegura,
      caben: tipo === 'caben' ? listaAtual.filter(item => item.id !== id) : listaCabenSegura
    };
    pagamentosRef.current = novosPagamentos;
    setPagamentos(novosPagamentos);
    localStorage.setItem('rm_pagamentos', JSON.stringify(novosPagamentos));
    void gravarNaWeb(undefined, novosPagamentos);
  };

  const totalCaixa = listaCaixaSegura.reduce((acc, item) => acc + (Number(item?.valor) || 0), 0);
  const totalCheque = listaChequeSegura.reduce((acc, item) => acc + (Number(item?.valor) || 0), 0);
  const totalCaben = listaCabenSegura.reduce((acc, item) => acc + (Number(item?.valor) || 0), 0);
  const totalGeralPagamentos = totalCaixa + totalCheque + totalCaben;

  const fecharLotePagamentos = () => {
    const totalItens = listaCaixaSegura.length + listaChequeSegura.length + listaCabenSegura.length;
    if (totalItens === 0) return alert('Nenhum lançamento ativo!');
    if (!window.confirm(`Fechar lote no valor de R$ ${totalGeralPagamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}?`)) return;
    const novoLote: LotePagamentoHistorico = {
      id: `${Date.now()}`,
      dataFechamento: new Date().toLocaleString('pt-BR'),
      totalGeral: totalGeralPagamentos,
      totalCaixa,
      totalCheque,
      totalCaben,
      dados: {
        caixa: [...listaCaixaSegura],
        cheque: [...listaChequeSegura],
        caben: [...listaCabenSegura]
      }
    };
    const listaHistoricoAtual = Array.isArray(historicoPagamentosRef.current) ? historicoPagamentosRef.current : [];
    const novoHistorico = [novoLote, ...listaHistoricoAtual];
    const pagamentosLimpos: PagamentosState = { caixa: [], cheque: [], caben: [] };
    historicoPagamentosRef.current = novoHistorico;
    pagamentosRef.current = pagamentosLimpos;
    setHistoricoPagamentos(novoHistorico);
    setPagamentos(pagamentosLimpos);
    localStorage.setItem('rm_historico_pagamentos', JSON.stringify(novoHistorico));
    localStorage.setItem('rm_pagamentos', JSON.stringify(pagamentosLimpos));
    void gravarNaWeb(undefined, pagamentosLimpos, novoHistorico);
    setMostrarPastaHistorico(true);
  };

  const removerLoteHistorico = (loteId: string) => {
    if (!window.confirm('Deseja excluir permanentemente este lote?')) return;
    const listaHistoricoAtual = Array.isArray(historicoPagamentos) ? historicoPagamentos : [];
    const novoHistorico = listaHistoricoAtual.filter(h => h.id !== loteId);
    historicoPagamentosRef.current = novoHistorico;
    setHistoricoPagamentos(novoHistorico);
    localStorage.setItem('rm_historico_pagamentos', JSON.stringify(novoHistorico));
    void gravarNaWeb(undefined, undefined, novoHistorico);
  };
  // Funções da Cotação
  const atualizarCampoCotacao = (itemId: string, campo: 'estoqueAtual' | 'qtdSugerida' | 'qtdPedir', valor: string) => {
    const agora = new Date().toISOString();
    setItensCotacao(atuais => {
      const base = Array.isArray(atuais) ? atuais : [];
      if (base.some(item => item.id === itemId)) {
        return base.map(item => item.id === itemId ? { ...item, [campo]: valor, atualizadoEm: agora } : item);
      }
      const doCatalogo = montarItensLaticinios(base).find(item => item.id === itemId);
      if (!doCatalogo) return base;
      return [...base, { ...doCatalogo, [campo]: valor, atualizadoEm: agora, secao: 'Laticínios' }];
    });
  };

  const atualizarPrecoCotacao = (itemId: string, fornecedorId: string, valor: string) => {
    const agora = new Date().toISOString();
    setItensCotacao(atuais => {
      const base = Array.isArray(atuais) ? atuais : [];
      const itemAtual = base.find(item => item.id === itemId) || montarItensLaticinios(base).find(item => item.id === itemId);
      if (!itemAtual) return base;
      const precosAtualizados = { ...(itemAtual.precos || {}), [fornecedorId]: valor };
      const custos = Object.values(precosAtualizados).map(preco => parseFloat(String(preco).replace(',', '.'))).filter(preco => !Number.isNaN(preco) && preco > 0);
      if (base.some(item => item.id === itemId)) {
        return base.map(item => item.id === itemId ? { ...item, precos: precosAtualizados, menorCusto: custos.length ? Math.min(...custos) : item.menorCusto, atualizadoEm: agora } : item);
      }
      return [...base, { ...itemAtual, precos: precosAtualizados, menorCusto: custos.length ? Math.min(...custos) : undefined, atualizadoEm: agora, secao: 'Laticínios' }];
    });
  };

  const adicionarNovoItemCotacao = () => {
    if (!novoItemNome.trim()) return;
    const novos = [...itensCotacao, { id: `item_${Date.now()}`, produto: novoItemNome.trim(), unit: novoItemUnit.trim() || 'Kg', estoqueAtual: '', qtdPedir: '', precos: {} }];
    setItensCotacao(novos);
    setNovoItemNome('');
    gravarNaWeb(undefined, undefined, undefined, undefined, novos);
  };

  const cadastrarProduto = () => {
    const nome = novoProdutoCadastro.nome.trim();
    if (!nome) return;
    if (itensCotacao.some(item => item.produto.toLowerCase() === nome.toLowerCase())) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Este produto já está cadastrado.' });
      return;
    }
    const novoItem: ItemCotacao = { id: `cad_${Date.now()}`, produto: nome, unit: novoProdutoCadastro.unidade, estoqueAtual: '', qtdSugerida: '', qtdPedir: '', precos: {} };
    const novosItens = [...itensCotacao, novoItem];
    setItensCotacao(novosItens);
    setNovoProdutoCadastro({ nome: '', unidade: novoProdutoCadastro.unidade });
    gravarNaWeb(undefined, undefined, undefined, undefined, novosItens);
    setAlerta({ tipo: 'sucesso', msg: '✓ Produto cadastrado na Cotação.' });
  };

  const excluirProdutoCadastrado = (produtoId: string) => {
    if (!window.confirm('Excluir este produto do catálogo?')) return;
    const novosItens = itensCotacao.filter(item => item.id !== produtoId);
    setItensCotacao(novosItens);
    gravarNaWeb(undefined, undefined, undefined, undefined, novosItens);
  };

  const removerItemCotacao = (id: string) => {
    if (!window.confirm('Excluir produto?')) return;
    const novos = itensCotacao.filter(i => i.id !== id);
    setItensCotacao(novos);
    gravarNaWeb(undefined, undefined, undefined, undefined, novos);
  };
  const adicionarFornecedorCotacao = () => {
    if (!novoFornecedorNome.trim()) return;
    const novos = [...fornecedoresCotacao, { id: `f_${Date.now()}`, nome: novoFornecedorNome.trim().toUpperCase() }];
    setFornecedoresCotacao(novos);
    setNovoFornecedorNome('');
    gravarNaWeb(undefined, undefined, undefined, novos);
  };
// Funções auxiliares para controle de entregas por dia da semana
const getDiaSemanaAtual = (): string => {
  const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return dias[new Date().getDay()];
};

const verificaEntregaHoje = (diasEntregaStr?: string): boolean => {
  if (!diasEntregaStr) return false;
  const diaHoje = getDiaSemanaAtual().toLowerCase(); // ex: 'sábado' ou 'segunda-feira'
  const termoCurto = diaHoje.split('-')[0]; // ex: 'segunda' ou 'sábado'
  const str = diasEntregaStr.toLowerCase();
  
  return str.includes(termoCurto) || str.includes(diaHoje);
};
  // 👉 COLE AS DUAS AQUI:
  const trocarFornecedorColuna = (indiceColuna: number, novoFornecedorId: string) => {
    const fornecedorEncontrado = fornecedoresCotacao.find(f => f.id === novoFornecedorId);
    if (!fornecedorEncontrado) return;

    setFornecedoresCotacao(prev => {
      const novos = [...prev];
      novos[indiceColuna] = fornecedorEncontrado;
      return novos;
    });
  };

  const removerFornecedorColuna = (indiceColuna: number) => {
    if (fornecedoresCotacao.length <= 1) {
      alert("A cotação precisa ter ao menos um fornecedor.");
      return;
    }
    setFornecedoresCotacao(prev => prev.filter((_, idx) => idx !== indiceColuna));
  };
  const cadastrarFornecedor = () => {
    const razaoSocial = novoFornecedorCadastro.razaoSocial.trim();
    const nomeFantasia = novoFornecedorCadastro.nomeFantasia.trim();
    const cnpj = novoFornecedorCadastro.cnpj.trim();
    if (!razaoSocial || !nomeFantasia || !cnpj) return;
    if (fornecedoresCotacao.some(fornecedor => fornecedor.cnpj === cnpj)) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Este CNPJ já está cadastrado.' });
      return;
    }
    const novoFornecedor: FornecedorCotacao = { id: `f_cad_${Date.now()}`, nome: nomeFantasia.toUpperCase(), razaoSocial, nomeFantasia, cnpj };
    const novos = [...fornecedoresCotacao, novoFornecedor];
    setFornecedoresCotacao(novos);
    setNovoFornecedorCadastro({ razaoSocial: '', nomeFantasia: '', cnpj: '' });
    gravarNaWeb(undefined, undefined, undefined, novos);
    setAlerta({ tipo: 'sucesso', msg: '✓ Fornecedor cadastrado.' });
  };

  const removerFornecedorCotacao = (id: string) => {
    if (!window.confirm('Remover fornecedor?')) return;
    const novos = fornecedoresCotacao.filter(f => f.id !== id);
    setFornecedoresCotacao(novos);
    gravarNaWeb(undefined, undefined, undefined, novos);
  };

  const limparCotacoesPrecos = () => {
    if (!window.confirm('Zerar preços da cotação?')) return;
    const novos = marcarItensCotacaoAgora(itensCotacao.map(i => ({ ...i, estoqueAtual: '', qtdPedir: '', qtdSugerida: '', precos: {} })));
    itensCotacaoRef.current = novos;
    setItensCotacao(novos);
    localStorage.setItem('rm_itens_cotacao', JSON.stringify(novos));
    gravarNaWeb(undefined, undefined, undefined, undefined, novos);
  };

  const executarImportacaoEmLote = () => {
    if (!textoImportacao.trim()) return;
    const linhas = textoImportacao.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const novosImp = linhas.map((l, idx) => {
      let nome = l;
      let unid = unidadePadraoImportacao;
      if (l.includes(';')) { const p = l.split(';'); nome = p[0].trim(); if(p[1]) unid = p[1].trim(); }
      return { id: `imp_${Date.now()}_${idx}`, produto: nome, unit: unid, estoqueAtual: '', qtdPedir: '', precos: {} };
    });
    const final = modoImportacao === 'substituir' ? novosImp : [...itensCotacao, ...novosImp];
    setItensCotacao(final);
    gravarNaWeb(undefined, undefined, undefined, undefined, final);
    setTextoImportacao('');
    setMostrarModalImportacao(false);
  };

  const registrarConferencia = () => {
    if (!novaConf.conferente.trim() || !novaConf.valor) return alert('Preencha conferente e valor!');
    const val = parseFloat(novaConf.valor.replace(',', '.'));
    if (isNaN(val)) return alert('Valor inválido!');
    const novaLista = unirConferencias([{ id: `conf_${Date.now()}`, data: new Date().toLocaleString('pt-BR'), nomeConferente: novaConf.conferente.trim(), valorRecebido: val, observacoes: novaConf.obs.trim(), houveDivergencia: novaConf.divergencia }], conferenciasRef.current);
    conferenciasRef.current = novaLista;
    setConferencias(novaLista);
    setNovaConf({ conferente: '', valor: '', obs: '', divergencia: false });
    gravarNaWeb(undefined, undefined, undefined, undefined, undefined, undefined, novaLista);
  };

  const removerConferencia = (id: string) => {
    if (!window.confirm('Excluir conferência?')) return;
    const novaLista = conferencias.filter(c => c.id !== id);
    const deletadas = unirIds(conferenciasDeletadasRef.current, [id]);
    conferenciasDeletadasRef.current = deletadas;
    setConferenciasDeletadas(deletadas);
    localStorage.setItem('rm_conferencias_deletadas', JSON.stringify(deletadas));
    conferenciasRef.current = novaLista;
    setConferencias(novaLista);
    localStorage.setItem('rm_conferencias', JSON.stringify(novaLista));
    localStorage.setItem('rm_backup_conferencia', JSON.stringify({ conferencias: novaLista }));
    gravarNaWeb(undefined, undefined, undefined, undefined, undefined, undefined, novaLista);
  };

  const calcularMenorPrecoItem = (item: ItemCotacao, somenteFornecedores?: string[]) => {
    let menor = Infinity; let vencedorFornId = '';
    const precos = item?.precos && typeof item.precos === 'object' ? item.precos : {};
    const ids = somenteFornecedores?.length ? somenteFornecedores : fornecedoresCotacao.map(f => f.id);
    ids.forEach(id => {
      const p = precos[id];
      if (p) { const v = parseFloat(String(p).replace(',', '.')); if (!isNaN(v) && v > 0 && v < menor) { menor = v; vencedorFornId = id; } }
    });
    return { menorPreco: menor === Infinity ? null : menor, vencedorFornId };
  };

  const garantirEmbalagensNaCotacao = () => {
    const catalogo = PRODUTOS_POR_SECAO.Embalagens || [];
  const ids = new Set((Array.isArray(itensCotacao) ? itensCotacao : []).map(item => item.id));
    const novos = catalogo
      .filter(produto => produto.ativo !== false && !ids.has(produto.id))
      .map(produto => {
        const custo = parseFloat(String(produto.custo || '').replace(',', '.'));
        return {
          id: produto.id,
          produto: produto.nome,
          unit: produto.unidade || 'un',
          estoqueAtual: '',
          qtdSugerida: '',
          qtdPedir: '',
          precos: {},
          secao: 'Embalagens',
          ultimoPrecoCompra: Number.isFinite(custo) && custo > 0 ? custo : undefined
        } as ItemCotacao;
      });
    if (!novos.length) return;
    const mesclados = [...itensCotacao, ...novos];
    setItensCotacao(mesclados);
    gravarNaWeb(undefined, undefined, undefined, undefined, mesclados);
  };

  const garantirLaticiniosNaCotacao = () => {
    try {
      setItensCotacao(atuais => {
        const base = Array.isArray(atuais) ? atuais : [];
        const ids = new Set(base.map(item => item.id));
        const novos = montarItensLaticinios(base).filter(item => !ids.has(item.id));
        if (!novos.length) return base;
        return [...base, ...novos.map(item => ({ ...item, secao: 'Laticínios' as const }))];
      });
    } catch {
      /* a aba abre mesmo se a gravação atrasar */
    }
  };

  const totaisPorFornecedor = (() => {
    try {
      return (Array.isArray(fornecedoresCotacao) ? fornecedoresCotacao : []).map(f => {
        let totalR$ = 0; let itensGanhos = 0;
        (Array.isArray(itensCotacao) ? itensCotacao : []).forEach(item => {
          const { menorPreco, vencedorFornId } = calcularMenorPrecoItem(item);
          if (vencedorFornId === f.id && menorPreco !== null) {
            totalR$ += menorPreco * qtdPedirNumero(item);
            itensGanhos++;
          }
        });
        return { fornecedor: f, totalR$, itensGanhos };
      });
    } catch {
      return [];
    }
  })();

  const totalGeralCompraCotacao = totaisPorFornecedor.reduce((a, b) => a + b.totalR$, 0);

  const salvarRelatorioPedidoCotacao = () => {
    const relatoriosNovos = fornecedoresCotacao.map(fornecedor => {
      const itensFornecedor = itensCotacao.filter(item => {
        const quantidade = qtdPedirNumero(item);
        return quantidade > 0 && calcularMenorPrecoItem(item).vencedorFornId === fornecedor.id;
      }).map(item => {
        const { menorPreco } = calcularMenorPrecoItem(item);
        const quantidade = qtdPedirNumero(item);
        return {
          produto: item.produto,
          unit: item.unit,
          quantidade: item.qtdPedir,
          valorUnitario: menorPreco || 0,
          valorTotal: (menorPreco || 0) * quantidade,
          fornecedor: fornecedor.nome
        };
      });
      if (itensFornecedor.length === 0) return null;
      return {
        id: `pedido_${fornecedor.id}_${Date.now()}`,
        data: new Date().toLocaleString('pt-BR'),
        itens: itensFornecedor,
        totalGeral: itensFornecedor.reduce((total, item) => total + item.valorTotal, 0),
        enviadoConferencia: false
      } as RelatorioPedidoCotacao;
    }).filter((relatorio): relatorio is RelatorioPedidoCotacao => relatorio !== null);
    if (relatoriosNovos.length === 0) return false;
    const idsSalvos = new Set(
      itensCotacao.filter(item => qtdPedirNumero(item) > 0 && calcularMenorPrecoItem(item).vencedorFornId).map(item => item.id)
    );
    const itensLimpos = itensCotacao.map(item => idsSalvos.has(item.id) ? { ...item, qtdPedir: '' } : item);
    setItensCotacao(itensLimpos);
    localStorage.setItem('rm_itens_cotacao', JSON.stringify(itensLimpos));
    const atualizados = [...relatoriosNovos, ...relatoriosPedidosCotacao].slice(0, 50);
    relatoriosPedidosRef.current = atualizados;
    setRelatoriosPedidosCotacao(atualizados);
    localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(atualizados));
    gravarNaWeb(undefined, undefined, undefined, undefined, itensLimpos);
    setMostrarRelatoriosCotacao(true);
    return true;
  };

  const marcarPedidoSalvoNaConferencia = (relatorio: RelatorioPedidoCotacao) => {
    if (relatorio.enviadoConferencia) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Este pedido já foi enviado para a Conferência.' });
      return;
    }
    const atualizados = relatoriosPedidosCotacao.map(item => item.id === relatorio.id ? { ...item, enviadoConferencia: true } : item);
    relatoriosPedidosRef.current = atualizados;
    setRelatoriosPedidosCotacao(atualizados);
    localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(atualizados));
    gravarNaWeb();
    setAlerta({ tipo: 'sucesso', msg: '✓ Pedido saiu da lista da Cotação e ficou salvo na Conferência. A tela não mudou.' });
  };

  const salvarPedidoFornecedor = (fornecedor: FornecedorCotacao, itensFornecedor: ItemCotacao[]) => {
    const idsItens = new Set(itensFornecedor.map(item => item.id));
    const itensAtualizados = itensCotacao.map(item => idsItens.has(item.id)
      ? { ...item, ultimoPrecoCompra: calcularMenorPrecoItem(item).menorPreco || item.ultimoPrecoCompra, qtdPedir: '' }
      : item);
    setItensCotacao(itensAtualizados);
    localStorage.setItem('rm_itens_cotacao', JSON.stringify(itensAtualizados));
    const itens = itensFornecedor.map(item => {
      const { menorPreco } = calcularMenorPrecoItem(item);
      const quantidade = qtdPedirNumero(item);
      return {
        produto: item.produto,
        unit: item.unit,
        quantidade: item.qtdPedir,
        valorUnitario: menorPreco || 0,
        valorTotal: (menorPreco || 0) * quantidade,
        fornecedor: fornecedor.nome
      };
    });
    const novoRelatorio: RelatorioPedidoCotacao = {
      id: `pedido_${Date.now()}`,
      data: new Date().toLocaleString('pt-BR'),
      itens,
      totalGeral: itens.reduce((total, item) => total + item.valorTotal, 0),
      enviadoConferencia: false
    };
    const atualizados = [novoRelatorio, ...relatoriosPedidosCotacao].slice(0, 50);
    relatoriosPedidosRef.current = atualizados;
    setRelatoriosPedidosCotacao(atualizados);
    localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(atualizados));
    gravarNaWeb(undefined, undefined, undefined, undefined, itensAtualizados);
    setMostrarRelatoriosCotacao(true);
    setAlerta({ tipo: 'sucesso', msg: `✓ Pedido de ${fornecedor.nome} salvo. Saiu da lista em aberto e ficou em Pedidos salvos.` });
  };

  const anexarPdfFornecedor = (relatorio: RelatorioPedidoCotacao) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,.pdf';
    input.onchange = async (evento: Event) => {
      const arquivo = (evento.target as HTMLInputElement).files?.[0];
      if (!arquivo) return;
      const leitor = new FileReader();
      leitor.onload = () => {
        const dados = dadosPdfFornecedor[relatorio.id] || { valor: '', observacao: '' };
        const conteudo = String(leitor.result);
        const atualizados = relatoriosPedidosCotacao.map(item => item.id === relatorio.id ? { ...item, pdfFornecedor: { nome: arquivo.name, conteudo, anexadoEm: new Date().toLocaleString('pt-BR'), valor: dados.valor ? parseFloat(dados.valor.replace(',', '.')) : undefined, observacao: dados.observacao } } : item);
        setRelatoriosPedidosCotacao(atualizados);
        localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(atualizados));
        setAlerta({ tipo: 'sucesso', msg: '✓ PDF do fornecedor anexado ao pedido.' });
      };
      leitor.readAsDataURL(arquivo);
    };
    input.click();
  };

  const anexarPedidoFornecedorExterno = () => {
    if (!nomeFornecedorExterno.trim()) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Informe o nome do fornecedor.' });
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,.pdf';
    input.onchange = (evento: Event) => {
      const arquivo = (evento.target as HTMLInputElement).files?.[0];
      if (!arquivo) return;
      const leitor = new FileReader();
      leitor.onload = () => {
        const novoRelatorio: RelatorioPedidoCotacao = { id: `pedido_externo_${Date.now()}`, data: new Date().toLocaleString('pt-BR'), itens: [], totalGeral: 0, enviadoConferencia: true, pdfFornecedor: { nome: arquivo.name, conteudo: String(leitor.result), anexadoEm: new Date().toLocaleString('pt-BR'), valor: undefined, observacao: '' } };
        const relatoriosAtualizados = [{ ...novoRelatorio, itens: [{ produto: 'Pedido em PDF anexado', unit: '-', quantidade: '-', valorUnitario: 0, valorTotal: 0, fornecedor: nomeFornecedorExterno.trim() }] }, ...relatoriosPedidosCotacao].slice(0, 50);
        setRelatoriosPedidosCotacao(relatoriosAtualizados);
        localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(relatoriosAtualizados));
        setNomeFornecedorExterno('');
        setMostrarAnexoFornecedorExterno(false);
        setAlerta({ tipo: 'sucesso', msg: '✓ Pedido externo anexado à Conferência.' });
      };
      leitor.readAsDataURL(arquivo);
    };
    input.click();
  };

  const excluirRelatorioPedidoCotacao = (relatorioId: string) => {
    if (!window.confirm('Excluir este pedido salvo permanentemente?')) return;
    const atualizados = relatoriosPedidosCotacao.filter(relatorio => relatorio.id !== relatorioId);
    const deletados = unirIds(pedidosCotacaoDeletadosRef.current, [relatorioId]);
    pedidosCotacaoDeletadosRef.current = deletados;
    setPedidosCotacaoDeletados(deletados);
    localStorage.setItem('rm_pedidos_cotacao_deletados', JSON.stringify(deletados));
    relatoriosPedidosRef.current = atualizados;
    setRelatoriosPedidosCotacao(atualizados);
    localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(atualizados));
    if (pedidoConferenciaId === relatorioId) {
      setPedidoConferenciaId(null);
      localStorage.removeItem('rm_pedido_conferencia_id');
    }
    gravarNaWeb();
    setAlerta({ tipo: 'sucesso', msg: '✓ Pedido salvo excluído. Não volta mais para a lista em aberto.' });
  };

  const atualizarConferenciaPedido = (pedidoId: string, campo: 'conferente' | 'valor' | 'obs' | 'divergencia' | 'tipoDivergencia', valor: string | boolean) => {
    setConferenciasPorPedido(prev => ({ ...prev, [pedidoId]: { conferente: '', valor: '', obs: '', divergencia: false, tipoDivergencia: '', ...prev[pedidoId], [campo]: valor } }));
  };

  const salvarConferenciaPedido = (relatorio: RelatorioPedidoCotacao, formularioInformado?: { conferente: string; valor: string; obs: string; divergencia: boolean; tipoDivergencia: 'valor' | 'kg' | 'quantidade' | '' }) => {
    const formulario = formularioInformado || conferenciasPorPedido[relatorio.id] || { conferente: '', valor: '', obs: '', divergencia: false, tipoDivergencia: '' as const };
    const valorRecebido = formulario.valor.trim() ? parseFloat(formulario.valor.replace(',', '.')) : 0;
    if (!formulario.conferente.trim() || Number.isNaN(valorRecebido)) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Informe pelo menos o nome do conferente.' });
      return;
    }
    const registro: RegistroConferencia = { 
      id: `conf_${relatorio.id}_${Date.now()}`, 
      pedidoId: relatorio.id, 
      data: new Date().toLocaleString('pt-BR'), 
      fornecedor: relatorio.itens[0]?.fornecedor || 'Fornecedor não informado',
      valorEsperado: relatorio.totalGeral || 0,
      itensConferidos: relatorio.itens || [],
      nomeConferente: formulario.conferente.trim(), 
      valorRecebido, 
      observacoes: formulario.obs.trim(), 
      houveDivergencia: formulario.divergencia, 
      tipoDivergencia: formulario.divergencia ? formulario.tipoDivergencia : '' 
    };
    const novaLista = unirConferencias([registro], conferenciasRef.current);
    const pedidosConferidosAtualizados = unirIds(pedidosConferidosRef.current, [relatorio.id]);
    pedidosConferidosRef.current = pedidosConferidosAtualizados;
    setPedidosConferidosLocais(pedidosConferidosAtualizados);
    localStorage.setItem('rm_pedidos_conferidos', JSON.stringify(pedidosConferidosAtualizados));
    conferenciasRef.current = novaLista;
    setConferencias(novaLista);
    localStorage.setItem('rm_conferencias', JSON.stringify(novaLista));
    localStorage.setItem('rm_backup_conferencia', JSON.stringify({ conferencias: novaLista }));
    gravarNaWeb(undefined, undefined, undefined, undefined, undefined, undefined, novaLista);
    if (tabAtiva === 'conferencia') setAbaConferencia('conferidos');
    setAlerta({ tipo: 'sucesso', msg: '✓ Mercadoria e conferência registradas com sucesso!' });
  };

  const importarBackupConferencia = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    try {
      const texto = await arquivo.text();
      const dados = JSON.parse(texto);
      
      if (dados.conferencias && Array.isArray(dados.conferencias)) {
        const uniao = unirConferencias(conferenciasRef.current, dados.conferencias).filter(item => !conferenciasDeletadasRef.current.includes(item.id));
        conferenciasRef.current = uniao;
        setConferencias(uniao);
        localStorage.setItem('rm_backup_conferencia', JSON.stringify({ conferencias: uniao }));
        localStorage.setItem('rm_conferencias', JSON.stringify(uniao));
        setAlerta({ tipo: 'sucesso', msg: `✓ ${uniao.length} conferências importadas!` });
      }
      
      if (Array.isArray(dados.pedidosCotacaoDeletados)) {
        const uniaoDel = unirIds(pedidosCotacaoDeletadosRef.current, dados.pedidosCotacaoDeletados);
        pedidosCotacaoDeletadosRef.current = uniaoDel;
        setPedidosCotacaoDeletados(uniaoDel);
        localStorage.setItem('rm_pedidos_cotacao_deletados', JSON.stringify(uniaoDel));
      }
      if (dados.relatoriosPedidosCotacao && Array.isArray(dados.relatoriosPedidosCotacao)) {
        const uniao = unirPedidosCotacao(pedidosCotacaoDeletadosRef.current, relatoriosPedidosRef.current, dados.relatoriosPedidosCotacao);
        relatoriosPedidosRef.current = uniao;
        setRelatoriosPedidosCotacao(uniao);
        localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(uniao));
        setAlerta({ tipo: 'sucesso', msg: `✓ ${uniao.length} pedidos importados!` });
      }
      
      setTimeout(() => setAlerta(null), 3000);
    } catch (erro) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Erro ao importar arquivo JSON!' });
      setTimeout(() => setAlerta(null), 3000);
    }
  };

  const enviarPdfConferenciaCompartilhado = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,.pdf';
    input.onchange = async (evento: Event) => {
      const arquivo = (evento.target as HTMLInputElement).files?.[0];
      if (!arquivo) return;
      const leitor = new FileReader();
      leitor.onload = () => {
        const novoArquivo: ArquivoConferencia = {
          id: `pdf_conf_${Date.now()}`,
          nome: arquivo.name,
          dataUpload: new Date().toLocaleString('pt-BR'),
          uploadPor: usuarioLogado?.nome || 'Sistema',
          conteudo: String(leitor.result)
        };
        setArquivoConferencia(novoArquivo);
        localStorage.setItem('rm_arquivo_conferencia', JSON.stringify(novoArquivo));
        setAlerta({ tipo: 'sucesso', msg: `✓ PDF "${arquivo.name}" compartilhado na conferência!` });
        setTimeout(() => setAlerta(null), 3000);
      };
      leitor.readAsDataURL(arquivo);
    };
    input.click();
  };

  const removerPdfConferenciaCompartilhado = () => {
    if (!window.confirm('Remover o PDF compartilhado da conferência?')) return;
    setArquivoConferencia(null);
    localStorage.removeItem('rm_arquivo_conferencia');
    setAlerta({ tipo: 'sucesso', msg: '✓ PDF removido.' });
    setTimeout(() => setAlerta(null), 3000);
  };

  const visualizarPdfFornecedor = (relatorio: RelatorioPedidoCotacao) => {
    if (relatorio.pdfFornecedor) {
      setPdfFornecedorVisualizacao({ nome: relatorio.pdfFornecedor.nome, conteudo: relatorio.pdfFornecedor.conteudo });
    }
  };

  const imprimirRelatorioCotacao = () => {
    const win = window.open('', '_blank');
    if (win) {
      const itensComTotal = itensCotacao.filter(item => qtdPedirNumero(item) > 0).map(item => {
        const { menorPreco, vencedorFornId } = calcularMenorPrecoItem(item);
        const totalItem = (menorPreco || 0) * qtdPedirNumero(item);
        return `<tr><td style="padding:8px;border-bottom:1px solid #ddd;">${item.produto}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${item.unit}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;font-weight:bold;">${item.qtdPedir}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">${menorPreco ? `R$ ${menorPreco.toFixed(2)}` : '-'}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;font-weight:bold;">R$ ${totalItem.toFixed(2)}</td></tr>`;
      }).join('');
      win.document.write(`<html><head><title>Cotação</title></head><body style="font-family:Arial;padding:20px;color:#0f172a;"><h2>Mapa de Cotação</h2><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#0f172a;color:#fff;"><th style="padding:8px;text-align:left;">Produto</th><th style="padding:8px;text-align:center;">Uni/Kg</th><th style="padding:8px;text-align:right;">Quantidade</th><th style="padding:8px;text-align:right;">Valor unitário</th><th style="padding:8px;text-align:right;">Valor total</th></tr></thead><tbody>${itensComTotal || '<tr><td colspan="5" style="padding:12px;">Nenhum pedido com quantidade preenchida.</td></tr>'}</tbody></table><h2 style="text-align:right;margin-top:20px;border-top:2px solid #0f172a;padding-top:10px;">Total geral: R$ ${totalGeralCompraCotacao.toFixed(2)}</h2></body></html>`);
      win.document.close();
      win.print();
    }
  };

  const imprimirRelatorioPedidosPorVendedor = () => {
    salvarRelatorioPedidoCotacao();
    const pedidosPorVendedor = fornecedoresCotacao.map(fornecedor => ({
      fornecedor,
      itens: itensCotacao.filter(item => {
        const quantidade = qtdPedirNumero(item);
        return quantidade > 0 && calcularMenorPrecoItem(item).vencedorFornId === fornecedor.id;
      })
    })).filter(grupo => grupo.itens.length > 0);

    const itensSemVendedor = itensCotacao.filter(item => {
      const quantidade = qtdPedirNumero(item);
      return quantidade > 0 && !calcularMenorPrecoItem(item).vencedorFornId;
    });

    const grupos = pedidosPorVendedor.map(grupo => {
      const subtotal = grupo.itens.reduce((total, item) => {
        const { menorPreco } = calcularMenorPrecoItem(item);
        return total + (menorPreco || 0) * qtdPedirNumero(item);
      }, 0);
      return `
      <section style="margin-bottom:24px;">
        <h2 style="font-size:18px;border-bottom:2px solid #0f172a;padding-bottom:6px;">${grupo.fornecedor.nome} <span style="float:right;">Subtotal: R$ ${subtotal.toFixed(2)}</span></h2>
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:#0f172a;color:#fff;"><th style="padding:8px;text-align:left;">Produto</th><th style="padding:8px;text-align:center;">Uni/Kg</th><th style="padding:8px;text-align:right;">Quantidade</th><th style="padding:8px;text-align:right;">Valor unitário</th><th style="padding:8px;text-align:right;">Valor total</th></tr></thead>
          <tbody>${grupo.itens.map(item => { const { menorPreco } = calcularMenorPrecoItem(item); const totalItem = (menorPreco || 0) * qtdPedirNumero(item); return `<tr><td style="padding:8px;border-bottom:1px solid #ddd;">${item.produto}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${item.unit}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;font-weight:bold;">${item.qtdPedir}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">${menorPreco ? `R$ ${menorPreco.toFixed(2)}` : '-'}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;font-weight:bold;">R$ ${totalItem.toFixed(2)}</td></tr>`; }).join('')}</tbody>
        </table>
      </section>`;
    }).join('');

    const semVendedor = itensSemVendedor.length > 0 ? `
      <section style="margin-bottom:24px;"><h2 style="font-size:18px;border-bottom:2px solid #0f766e;padding-bottom:6px;">Sem vendedor definido</h2>
      <table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#64748b;color:#fff;"><th style="padding:8px;text-align:left;">Produto</th><th style="padding:8px;text-align:center;">Uni/Kg</th><th style="padding:8px;text-align:right;">Quantidade</th><th style="padding:8px;text-align:right;">Valor unitário</th><th style="padding:8px;text-align:right;">Valor total</th></tr></thead>
      <tbody>${itensSemVendedor.map(item => `<tr><td style="padding:8px;border-bottom:1px solid #ddd;">${item.produto}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${item.unit}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;font-weight:bold;">${item.qtdPedir}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">-</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;font-weight:bold;">-</td></tr>`).join('')}</tbody></table></section>` : '';

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<html><head><title>Pedidos por vendedor</title></head><body style="font-family:Arial;padding:24px;color:#0f172a;"><h1 style="margin:0 0 4px;">Relatório de pedidos</h1><p style="color:#64748b;">Produtos, quantidades e valores totais</p>${grupos || '<p>Nenhum pedido com quantidade preenchida.</p>'}${semVendedor}<h2 style="text-align:right;border-top:2px solid #0f172a;padding-top:10px;">Total geral: R$ ${totalGeralCompraCotacao.toFixed(2)}</h2></body></html>`);
      win.document.close();
      win.print();
    }
  };

  const imprimirPedidoIndividual = (fornecedor: FornecedorCotacao) => {
    const itensDoFornecedor = itensCotacao.filter(item => {
      const quantidade = qtdPedirNumero(item);
      return quantidade > 0 && calcularMenorPrecoItem(item).vencedorFornId === fornecedor.id;
    });
    setPedidoEmVisualizacao({ fornecedor, itens: itensDoFornecedor });
  };

  const linhasPedidoFornecedor = (fornecedor: FornecedorCotacao, itensInformados?: ItemCotacao[]) => {
    const itens = itensInformados || itensCotacao.filter(item => {
      const quantidade = qtdPedirNumero(item);
      return quantidade > 0 && calcularMenorPrecoItem(item).vencedorFornId === fornecedor.id;
    });
    const linhas = itens.map(item => {
      const quantidade = qtdPedirNumero(item);
      const valorUnitario = calcularMenorPrecoItem(item).menorPreco || 0;
      return {
        produto: item.produto,
        unit: item.unit,
        quantidade: item.qtdPedir,
        valorUnitario,
        valorTotal: valorUnitario * quantidade
      };
    });
    const totalGeral = linhas.reduce((total, item) => total + item.valorTotal, 0);
    return { linhas, totalGeral };
  };

  const enviarPedidoWhatsAppPdf = async (fornecedor: FornecedorCotacao, itensInformados?: ItemCotacao[]) => {
    const { linhas, totalGeral } = linhasPedidoFornecedor(fornecedor, itensInformados);
    if (linhas.length === 0) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Este fornecedor ainda nao tem itens no pedido.' });
      return;
    }
    const blob = gerarPdfPedidoFornecedor(fornecedor.nome, linhas, totalGeral);
    const nomeArquivo = `pedido-${fornecedor.nome.replace(/\s+/g, '-')}.pdf`;
    const arquivo = new File([blob], nomeArquivo, { type: 'application/pdf' });
    const mensagem = `Pedido RM SISTEMA-GESTAO\nFornecedor: ${fornecedor.nome}\nItens: ${linhas.length}\nTotal: R$ ${totalGeral.toFixed(2)}\n\nSegue o pedido em PDF.`;

    const podeCompartilharArquivo = typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [arquivo] });
    if (podeCompartilharArquivo) {
      try {
        await navigator.share({ files: [arquivo], title: `Pedido ${fornecedor.nome}`, text: mensagem });
        setAlerta({ tipo: 'sucesso', msg: '✓ Escolha o WhatsApp para enviar o PDF do pedido.' });
        return;
      } catch (erro) {
        if ((erro as Error).name === 'AbortError') return;
      }
    }

    const urlArquivo = URL.createObjectURL(arquivo);
    const link = document.createElement('a');
    link.href = urlArquivo;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(urlArquivo), 4000);
    window.open(`https://wa.me/?text=${encodeURIComponent(`${mensagem}\n\nO PDF foi baixado. Anexe o arquivo ${nomeArquivo} nesta conversa.`)}`, '_blank');
    setAlerta({ tipo: 'sucesso', msg: '✓ PDF baixado. No WhatsApp, anexe o arquivo do pedido.' });
  };

  const enviarRelatorioPagamentosPdf = async (dp: PagamentosState, valorTotal: number, dataRotulo?: string) => {
    const qtdItens = (dp.caixa?.length || 0) + (dp.cheque?.length || 0) + (dp.caben?.length || 0);
    if (qtdItens === 0) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Não há pagamentos para enviar em PDF.' });
      return;
    }
    const blob = gerarPdfRelatorioPagamentos(dp, valorTotal, dataRotulo);
    const dataArquivo = (dataRotulo || new Date().toLocaleDateString('pt-BR')).replace(/[^\d]+/g, '-');
    const nomeArquivo = `pagamentos-RM-${dataArquivo}.pdf`;
    const arquivo = new File([blob], nomeArquivo, { type: 'application/pdf' });
    const mensagem = `Relatório de Pagamentos — RM SISTEMA-GESTAO\nEmissão: ${dataRotulo || new Date().toLocaleString('pt-BR')}\nLançamentos: ${qtdItens}\nTotal geral: R$ ${valorTotal.toFixed(2)}\n\nSegue o relatório em PDF.`;

    const podeCompartilharArquivo = typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [arquivo] });
    if (podeCompartilharArquivo) {
      try {
        await navigator.share({ files: [arquivo], title: 'Relatório de Pagamentos', text: mensagem });
        setAlerta({ tipo: 'sucesso', msg: '✓ Escolha o WhatsApp para enviar o PDF dos pagamentos.' });
        return;
      } catch (erro) {
        if ((erro as Error).name === 'AbortError') return;
      }
    }

    const urlArquivo = URL.createObjectURL(arquivo);
    const link = document.createElement('a');
    link.href = urlArquivo;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(urlArquivo), 4000);
    window.open(`https://wa.me/?text=${encodeURIComponent(`${mensagem}\n\nO PDF foi baixado. Anexe o arquivo ${nomeArquivo} nesta conversa.`)}`, '_blank');
    setAlerta({ tipo: 'sucesso', msg: '✓ PDF baixado. No WhatsApp, anexe o arquivo dos pagamentos.' });
  };

  const imprimirRelatorioPagamentos = (dp: PagamentosState, valorTotal: number, dataRotulo?: string) => {
    setRelatorioPagamentosVisualizacao({ dados: dp, valorTotal, dataRotulo });
    return;

    const formatarMoeda = (val: number) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const tC = dp.caixa.reduce((a, b) => a + b.valor, 0);
    const tCh = dp.cheque.reduce((a, b) => a + b.valor, 0);
    const tCab = dp.caben.reduce((a, b) => a + b.valor, 0);

    const conteudoHtml = `
      <html>
        <head>
          <title>Relatório Gerencial de Pagamentos</title>
          <style>
            @page { size: portrait; margin: 12mm; }
            body { font-family: Arial, Helvetica, sans-serif; padding: 20px; color: #0f172a; margin: 0; }
            .header-box { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
            .header-title { font-size: 22px; font-weight: 800; color: #0f172a; }
            .header-sub { font-size: 11px; color: #64748b; margin-top: 4px; font-weight: bold; }
            .total-card { border: 2px solid #0f172a; background-color: #f8fafc; padding: 10px 18px; border-radius: 6px; text-align: right; }
            .secao-head { font-size: 13px; font-weight: bold; margin-top: 18px; margin-bottom: 6px; padding: 6px 10px; background-color: #0f172a; color: #ffffff; border-radius: 4px; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
            th { background-color: #f1f5f9; color: #0f172a; padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 12px; text-align: left; font-weight: bold; }
            td { padding: 8px 10px; border: 1px solid #e2e8f0; font-size: 12px; }
            .valor-col { text-align: right; font-weight: bold; width: 140px; }
            .assinatura-box { margin-top: 60px; display: flex; justify-content: center; }
            .assinatura-card { width: 360px; text-align: center; border-top: 2px solid #0f172a; padding-top: 8px; font-weight: bold; font-size: 13px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header-box">
            <div>
              <div class="header-title">RELATÓRIO DE PAGAMENTOS</div>
              <div class="header-sub">Emissão: ${dataRotulo || new Date().toLocaleString('pt-BR')} • Sistema RM Gestão</div>
            </div>
            <div class="total-card">
              <div style="font-size: 10px; font-weight: bold; color: #475569; text-transform: uppercase;">Total Geral</div>
              <div style="font-size: 20px; font-weight: 900; color: #059669;">R$ ${formatarMoeda(valorTotal)}</div>
            </div>
          </div>

          ${dp.caixa.length > 0 ? `
            <div class="secao-head">1. Caixa • Subtotal: R$ ${formatarMoeda(tC)}</div>
            <table><thead><tr><th>Descrição</th><th style="text-align: right;">Valor (R$)</th></tr></thead>
            <tbody>${dp.caixa.map(i => `<tr><td>${i.descricao}</td><td class="valor-col">R$ ${formatarMoeda(i.valor)}</td></tr>`).join('')}</tbody></table>
          ` : ''}

          ${dp.cheque.length > 0 ? `
            <div class="secao-head">2. Cheque • Subtotal: R$ ${formatarMoeda(tCh)}</div>
            <table><thead><tr><th>Favorecido / Motivo</th><th style="text-align: right;">Valor (R$)</th></tr></thead>
            <tbody>${dp.cheque.map(i => `<tr><td>${i.descricao}</td><td class="valor-col">R$ ${formatarMoeda(i.valor)}</td></tr>`).join('')}</tbody></table>
          ` : ''}

          ${dp.caben.length > 0 ? `
            <div class="secao-head">3. CABEN • Subtotal: R$ ${formatarMoeda(tCab)}</div>
            <table><thead><tr><th>Descrição</th><th style="text-align: right;">Valor (R$)</th></tr></thead>
            <tbody>${dp.caben.map(i => `<tr><td>${i.descricao}</td><td class="valor-col">R$ ${formatarMoeda(i.valor)}</td></tr>`).join('')}</tbody></table>
          ` : ''}

          ${dp.caixa.length === 0 && dp.cheque.length === 0 && dp.caben.length === 0 ? '<div style="padding:18px;border:1px solid #cbd5e1;background:#f8fafc;text-align:center;font-weight:bold;color:#475569;">Nenhum pagamento lançado neste relatório.</div>' : ''}

          <div class="assinatura-box">
            <div class="assinatura-card">Visto Autorização Financeiro</div>
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(conteudoHtml);
      win.document.close();
      win.onload = () => win.print();
      setTimeout(() => win.print(), 800);
    }
  };

  const atualizarQtdElieuda = (produto: string, dia: 'terca' | 'quinta' | 'sabado', valor: string) => {
    const novoObj = {
      ...quantidadesElieuda,
      [produto]: {
        ...(quantidadesElieuda[produto] || {}),
        [dia]: valor
      }
    };
    setQuantidadesElieuda(novoObj);
    localStorage.setItem('rm_elieuda', JSON.stringify(novoObj));
  };

  const limparDadosElieuda = () => {
    if (window.confirm('Confirma a limpeza de todas as quantidades para iniciar um novo pedido?')) {
      const novoObj: QuantidadesElieuda = {};
      setQuantidadesElieuda(novoObj);
      gravarNaWeb(undefined, undefined, undefined, undefined, undefined, novoObj);
      setAlerta({ tipo: 'sucesso', msg: '✓ Tabela reiniciada para novo pedido!' });
      setTimeout(() => setAlerta(null), 3000);
    }
  };

  const adicionarConferencia = () => {
    if (!novaConferencia.nomeConferente || !novaConferencia.data) {
      alert('Preencha pelo menos o nome do conferente e a data!');
      return;
    }

    const novaConf: RegistroConferencia = {
      id: Date.now().toString(),
      data: novaConferencia.data,
      nomeConferente: novaConferencia.nomeConferente,
      valorRecebido: parseFloat(novaConferencia.valorRecebido.toString()) || 0,
      observacoes: novaConferencia.observacoes,
      houveDivergencia: novaConferencia.houveDivergencia,
      tipoDivergencia: novaConferencia.tipoDivergencia,
      conferentePor: usuarioLogado?.nome || 'Sistema',
      dataPreenchimento: new Date().toISOString()
    };

    const novasConferencias = [...conferencias, novaConf];
    setConferencias(novasConferencias);
    gravarNaWeb(undefined, undefined, undefined, undefined, undefined, undefined, novasConferencias);
    
    // Resetar formulário
    setNovaConferencia({ 
      data: new Date().toISOString().split('T')[0], 
      nomeConferente: '', 
      valorRecebido: 0, 
      houveDivergencia: false, 
      tipoDivergencia: '', 
      observacoes: '' 
    });
    
    setAlerta({ tipo: 'sucesso', msg: '✓ Conferência registrada com sucesso!' });
    setTimeout(() => setAlerta(null), 3000);
  };

  const podeExcluirPedidoConferencia = usuarioLogado?.id === 'admin_ramara';

  const excluirPedidoNaConferencia = (relatorioId: string) => {
    if (usuarioLogado?.id !== 'admin_ramara') {
      setAlerta({ tipo: 'erro', msg: '⚠️ Só a Ramara pode excluir pedido na Conferência.' });
      return;
    }
    excluirRelatorioPedidoCotacao(relatorioId);
  };

  const excluirConferencia = (id: string) => {
    if (usuarioLogado?.id !== 'admin_ramara') {
      setAlerta({ tipo: 'erro', msg: '⚠️ Só a Ramara pode excluir pedido na Conferência.' });
      return;
    }
    if (window.confirm('Tem certeza que deseja excluir esta conferência?')) {
      const novasConferencias = conferencias.filter(conf => conf.id !== id);
      setConferencias(novasConferencias);
      gravarNaWeb(undefined, undefined, undefined, undefined, undefined, undefined, novasConferencias);
      setAlerta({ tipo: 'sucesso', msg: '✓ Conferência excluída!' });
      setTimeout(() => setAlerta(null), 3000);
    }
  };

  const gerarPdfElieuda = () => {
    const itensPreenchidos = listaProdutosElieudaPadrao.filter(item => {
      const q = quantidadesElieuda[item.produto] || {};
      return q.terca || q.quinta || q.sabado;
    });

    if (itensPreenchidos.length === 0) {
      alert('Nenhuma quantidade preenchida para gerar o relatório!');
      return;
    }

    setRelatorioElieudaVisualizacao({ itens: itensPreenchidos, quantidades: quantidadesElieuda });
    return;

    const conteudoHtml = `
      <html>
        <head>
          <title>Pedido Dona Elieuda - Gestão RM</title>
          <style>
            @page { size: portrait; margin: 12mm; }
            body { font-family: Arial, Helvetica, sans-serif; padding: 20px; color: #0f172a; margin: 0; }
            .head { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
            .head-title { font-size: 22px; font-weight: 800; color: #0f172a; }
            .head-sub { font-size: 11px; color: #64748b; margin-top: 4px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #0f172a; color: #ffffff; padding: 10px; border: 1px solid #0f172a; font-size: 13px; font-weight: bold; text-align: center; }
            th.item-col { text-align: left; }
            td { padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; font-size: 12px; }
            td.item-col { text-align: left; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="head">
            <div>
              <div class="head-title">PEDIDO DONA ELIEUDA</div>
              <div class="head-sub">Emissão: ${new Date().toLocaleString('pt-BR')} • Desenvolvido por Ramara Matias</div>
            </div>
            <div style="font-size: 12px; font-weight: bold; color: #0f172a; border: 1px solid #cbd5e1; padding: 8px 14px; border-radius: 6px; background-color: #f8fafc;">
              Itens Solicitados: ${itensPreenchidos.length}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="item-col">Produto / Item</th>
                <th style="width: 90px;">Unid</th>
                <th style="width: 120px;">Terça-feira</th>
                <th style="width: 120px;">Quinta-feira</th>
                <th style="width: 120px;">Sábado</th>
              </tr>
            </thead>
            <tbody>
              ${itensPreenchidos.map(item => `
                <tr>
                  <td class="item-col">${item.produto}</td>
                  <td>${item.unit}</td>
                  <td>${(quantidadesElieuda[item.produto] && quantidadesElieuda[item.produto].terca) || '-'}</td>
                  <td>${(quantidadesElieuda[item.produto] && quantidadesElieuda[item.produto].quinta) || '-'}</td>
                  <td>${(quantidadesElieuda[item.produto] && quantidadesElieuda[item.produto].sabado) || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(conteudoHtml);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  };

  const imprimirRelatorioConferencia = () => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<html><head><title>Conferência</title></head><body style="font-family:Arial;padding:20px;"><h2>Relatório de Conferência</h2></body></html>`);
      win.document.close();
      win.print();
    }
  };

  const totalPendenciasGeral = (Array.isArray(setores) ? setores : []).reduce((acc, s) => acc + (Array.isArray(s?.tarefas) ? s.tarefas.length : 0), 0);
  const totalConcluidasGeral = (Array.isArray(setores) ? setores : []).reduce((acc, s) => acc + (Array.isArray(s?.tarefas) ? s.tarefas.filter(t => t.status === 'concluida').length : 0), 0);
  const totalAbertasGeral = totalPendenciasGeral - totalConcluidasGeral;
  const taxaConclusaoGeral = totalPendenciasGeral > 0 ? Math.round((totalConcluidasGeral / totalPendenciasGeral) * 100) : 0;
  const secaoProduto = (produto: string) => {
    const nome = produto.toLowerCase();
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
  const telaInteiraAtiva = ['conferencia', 'cotacao', 'pagamentos', 'elieuda', 'relatorios', 'seguranca', 'manutencao'].includes(tabAtiva) || (tabAtiva === 'pendencias' && sairTelaInteira);
  const ordensLista = Array.isArray(ordensManutencao) ? ordensManutencao : [];
  const ordensPendenteQtd = ordensLista.filter(ordem => statusOrdemNormalizado(ordem.status) === 'pendente').length;
  const ordensAndamentoQtd = ordensLista.filter(ordem => statusOrdemNormalizado(ordem.status) === 'andamento').length;
  const ordensPausadaQtd = ordensLista.filter(ordem => statusOrdemNormalizado(ordem.status) === 'pausada').length;
  const ordensConcluidasQtd = ordensLista.filter(ordem => statusOrdemNormalizado(ordem.status) === 'concluida').length;
  const ordensNaoRealizadaQtd = ordensLista.filter(ordem => statusOrdemNormalizado(ordem.status) === 'nao_realizada').length;
  const ordensFiltradas = ordensLista.filter(ordem => {
    if (filtroOrdensManutencao === 'todas') return true;
    return statusOrdemNormalizado(ordem.status) === filtroOrdensManutencao;
  });
  const corPrioridadeOrdem = (prioridade: OrdemManutencao['prioridade']) =>
    prioridade === 'urgente' ? 'bg-rose-100 text-rose-800' : prioridade === 'alta' ? 'bg-orange-100 text-orange-800' : prioridade === 'baixa' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800';
  const usuariosDoSistema = unirUsuariosCadastrados(usuariosExtra).map(usuario => aplicarPermissoesSalvas(usuario, permissoesUsuarios));
  const conferenciasLista = Array.isArray(conferencias) ? conferencias : [];
  const relatoriosPedidosLista = Array.isArray(relatoriosPedidosCotacao) ? relatoriosPedidosCotacao : [];
  const pedidosConferidosIds = new Set([...pedidosConferidosLocais, ...conferenciasLista.filter(conferencia => conferencia.pedidoId).map(conferencia => conferencia.pedidoId)]);
  const pedidosAindaNaCotacao = relatoriosPedidosLista.filter(relatorio => relatorio.enviadoConferencia !== true);
  const pedidosPendentesConferencia = relatoriosPedidosLista.filter(relatorio => relatorio.enviadoConferencia !== false && !pedidosConferidosIds.has(relatorio.id));
  const textoBuscaFornecedor = (texto: string) => (texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
  const pedidoBateFornecedor = (relatorio: RelatorioPedidoCotacao, busca: string) => {
    const termo = textoBuscaFornecedor(busca);
    if (!termo) return true;
    const nomesPedido = (relatorio.itens || []).map(item => item.fornecedor).filter(Boolean);
    const cadastro = fornecedoresCotacao.find(fornecedor =>
      nomesPedido.some(nome => textoBuscaFornecedor(nome) === textoBuscaFornecedor(fornecedor.nome)
        || textoBuscaFornecedor(nome) === textoBuscaFornecedor(fornecedor.nomeFantasia || '')
        || textoBuscaFornecedor(nome) === textoBuscaFornecedor(fornecedor.razaoSocial || ''))
    );
    const nomes = [
      ...nomesPedido,
      cadastro?.nome,
      cadastro?.nomeFantasia,
      cadastro?.razaoSocial
    ].filter(Boolean) as string[];
    return nomes.some(nome => textoBuscaFornecedor(nome).includes(termo));
  };
  const conferenciaBateFornecedor = (conf: RegistroConferencia, busca: string) => {
    const termo = textoBuscaFornecedor(busca);
    if (!termo) return true;
    if (textoBuscaFornecedor(conf.fornecedor || '').includes(termo)) return true;
    const pedido = conf.pedidoId ? relatoriosPedidosLista.find(relatorio => relatorio.id === conf.pedidoId) : undefined;
    return pedido ? pedidoBateFornecedor(pedido, busca) : false;
  };
  const pedidosPendentesFiltrados = pedidosPendentesConferencia.filter(relatorio => pedidoBateFornecedor(relatorio, buscaFornecedorConferencia));
  const conferenciasFiltradas = conferenciasLista.filter(conf => conferenciaBateFornecedor(conf, buscaFornecedorConferencia));
  const divergenciasFiltradas = conferenciasFiltradas.filter(conf => conf.houveDivergencia);
  const pedidosRealizadosTotal = relatoriosPedidosLista.length;
  const pedidosPendentesTotal = pedidosPendentesConferencia.length;
  const divergenciasQuantidadeTotal = conferenciasLista.filter(conferencia => conferencia.tipoDivergencia === 'quantidade').length;
  const divergenciasValorTotal = conferenciasLista.filter(conferencia => conferencia.tipoDivergencia === 'valor').length;
  const totalPedidoVisualizacao = (pedidoEmVisualizacao?.itens || []).reduce((total, item) => {
    const menorPreco = calcularMenorPrecoItem(item).menorPreco || 0;
    const quantidade = qtdPedirNumero(item);
    return total + menorPreco * quantidade;
  }, 0) || 0;
  const linhasImportadasContador = textoImportacao.split('\n').map(l => l.trim()).filter(l => l.length > 0).length;
  const idsSetoresPaoDaVida = SETORES_PADRAO.filter(setor => !['sitio', 'caben', 'ave-cristo', 'manutencao'].includes(setor.id)).map(setor => setor.id);
  
      

 const listaSetores = Array.isArray(setores) ? setores : SETORES_PADRAO;
 const todosSetoresExibidos = [
    {
      ...listaSetores.find(setor => setor.id === 'pao-da-vida') || SETORES_PADRAO[0],
      id: 'pao-da-vida',
      nome: 'Pão da Vida',
      tarefas: listaSetores.filter(setor => idsSetoresPaoDaVida.includes(setor.id)).flatMap(setor => Array.isArray(setor.tarefas) ? setor.tarefas : [])
    },
    ...listaSetores.filter(setor => ['sitio', 'caben', 'ave-cristo', 'manutencao'].includes(setor.id))
  ];

  const setoresExibidos = usuarioLogado?.tipo === 'manutencao'
    ? todosSetoresExibidos.filter(setor => setor.id === 'manutencao')
    : todosSetoresExibidos;

  const setorRealDaTarefa = (setorExibidoId: string, tarefaId: string) => {
    if (setorExibidoId !== 'pao-da-vida') return setorExibidoId;
    return setores.find(setor => idsSetoresPaoDaVida.includes(setor.id) && (setor.tarefas || []).some(tarefa => tarefa.id === tarefaId))?.id || 'padaria';
  };

  const historicoBackupsUsuario = (() => {
    try {
      const historico = JSON.parse(localStorage.getItem('rm_backups_automáticos') || '[]');
      return Array.isArray(historico)
        ? historico.filter(backup => backup.usuarioId === usuarioLogado?.id).slice(0, 10)
        : [];
    } catch {
      return [];
    }
  })();

  // 2️⃣ SISTEMA PRINCIPAL
  const classeAba = (ativa: boolean) =>
    `relative cursor-pointer rounded-full border-0 px-4 py-2 text-[11px] font-bold uppercase tracking-wide transition ${ativa ? 'bg-white text-teal-800 shadow-md' : 'bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25'}`;
  const botaoFerramenta = 'cursor-pointer rounded-lg border-0 px-3 py-1.5 text-[11px] font-bold transition';
  const menuAbas = (
    <nav className="mx-auto flex max-w-6xl flex-wrap justify-center gap-2 px-5">
      {usuarioLogado?.permissoes.pendencias && (
        <button onClick={() => { setFiltroStatusTarefas('todas'); setTabAtiva('pendencias'); }} className={classeAba(tabAtiva === 'pendencias')}>
          Pendências
          {totalAbertasGeral > 0 && (
            <span className="absolute -right-1 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-teal-950 ring-2 ring-teal-800">
              {totalAbertasGeral}
            </span>
          )}
        </button>
      )}
      {(usuarioLogado?.permissoes.cotacao || usuarioLogado?.permissoes.pagamentos || usuarioLogado?.permissoes.elieuda || usuarioLogado?.permissoes.conferencias) && (
        <button
          onClick={() => setTabAtiva('compras')}
          className={classeAba(['compras', 'cotacao', 'cadastroProdutos', 'cadastroFornecedores', 'pagamentos', 'elieuda', 'conferencia'].includes(tabAtiva))}
        >
          Compras
        </button>
      )}
      {usuarioLogado?.permissoes.manutencao && (
        <button onClick={() => setTabAtiva('manutencao')} className={classeAba(tabAtiva === 'manutencao')}>
          Manutenção
          {(ordensPendenteQtd + ordensAndamentoQtd + ordensPausadaQtd) > 0 && (
            <span className="absolute -right-1 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-300 px-1 text-[10px] font-bold text-sky-950 ring-2 ring-teal-800">
              {ordensPendenteQtd + ordensAndamentoQtd + ordensPausadaQtd}
            </span>
          )}
        </button>
      )}
      {usuarioLogado?.permissoes.relatorios && (
        <button onClick={() => setTabAtiva('relatorios')} className={classeAba(tabAtiva === 'relatorios')}>Relatórios</button>
      )}
      {usuarioLogado?.permissoes.dados && (
        <button onClick={() => setTabAtiva('dados')} className={classeAba(tabAtiva === 'dados')}>Dados</button>
      )}
      <button onClick={() => setTabAtiva('seguranca')} className={classeAba(tabAtiva === 'seguranca')}>Segurança</button>
    </nav>
  );
  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-slate-100 font-sans">
      
      <div className="w-full">
        {telaInteiraAtiva && (
          <div className="border-b border-teal-800 bg-teal-800">
            <div className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="inline-flex items-center gap-2.5">
                <LogoRm size={32} compact />
                <strong className="text-sm font-black uppercase tracking-wide text-white">RM Sistema-Gestão</strong>
              </div>
              <button
                onClick={fazerLogout}
                className={`${botaoFerramenta} bg-rose-500/90 text-white hover:bg-rose-400`}
              >
                Sair / Bloquear
              </button>
            </div>
            <div className="bg-gradient-to-r from-teal-900 via-teal-700 to-emerald-700 py-3">
              {menuAbas}
            </div>
          </div>
        )}
        {!telaInteiraAtiva && (
        <header className="w-full bg-gradient-to-b from-teal-950 via-teal-800 to-teal-900 text-white shadow-lg shadow-teal-950/20">
          <div className="h-2 w-full bg-gradient-to-r from-emerald-300 via-teal-300 to-amber-200" />

          <div className="relative mx-auto max-w-6xl px-5 py-5">
            <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-3">
              <div className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold text-white ring-1 ring-white/20">
                {usuarioLogado?.nome}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={fazerLogout}
                  className={`${botaoFerramenta} bg-rose-500/90 text-white hover:bg-rose-400`}
                >
                  Sair / Bloquear
                </button>
              </div>
            </div>

            <div className="mb-1 flex items-center justify-center gap-3">
              <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 p-2 pr-4 ring-1 ring-white/20">
                <LogoRm size={52} />
                <div className="text-left">
                  <p className="m-0 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-200">RM</p>
                  <h1 className="m-0 text-2xl font-black tracking-tight text-white">Sistema-Gestão</h1>
                </div>
              </div>
            </div>

            <p className="mb-4 mt-1 text-center text-[11px] font-semibold uppercase tracking-wide text-teal-100">
              Atualização: <strong className="text-white">{ultimaAtualizacao}</strong>
            </p>

            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-2.5 ring-1 ring-slate-200">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-200">{statusNuvem}</span>
                <span className="text-[11px] font-semibold text-slate-500">Grava e sincroniza sozinho. Não precisa clicar o tempo todo.</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
              <button onClick={async () => { await gravarNaWeb(); setAlerta({ tipo: 'sucesso', msg: '✓ Gravado na NUVEM agora.' }); }} className={`${botaoFerramenta} bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50`}>Salvar agora</button>
              <button onClick={() => { void carregarTudo(); setAlerta({ tipo: 'sucesso', msg: '✓ Buscando o que já está na nuvem.' }); }} className={`${botaoFerramenta} bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50`}>Buscar da nuvem</button>
              <span className="hidden h-5 w-px bg-slate-200 sm:block" />
              <input
                type="file"
                accept="application/json"
                onChange={importarBackupConferencia}
                className="hidden"
                id="importar-conferencia"
              />
              <button
                onClick={() => document.getElementById('importar-conferencia')?.click()}
                className={`${botaoFerramenta} bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50`}
              >
                Importar conferência
              </button>
              <button onClick={() => restaurarBackupDoUsuarioAtual()} className={`${botaoFerramenta} bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50`}>Meu backup</button>
              <button onClick={restaurarUltimoBackup} className={`${botaoFerramenta} bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50`}>Último backup</button>
              </div>
            </div>

            <div className="mx-auto mt-3 max-w-[980px] rounded-2xl bg-white p-3 text-left ring-1 ring-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div>
                  <strong className="block text-xs text-slate-900">Proteção de {usuarioLogado?.nome}</strong>
                  <span className="text-[11px] text-slate-500">{historicoBackupsUsuario.length} visita(s) protegida(s) neste navegador</span>
                </div>
                <button
                  onClick={() => setMostrarHistoricoBackups(!mostrarHistoricoBackups)}
                  className={`${botaoFerramenta} bg-slate-100 text-slate-800 ring-1 ring-slate-200 hover:bg-slate-200`}
                >
                  {mostrarHistoricoBackups ? 'Ocultar histórico' : 'Ver histórico de visitas'}
                </button>
              </div>

              {mostrarHistoricoBackups && (
                <div className="mt-2.5 border-t border-slate-100 pt-2">
                  {historicoBackupsUsuario.length === 0 ? (
                    <span className="text-[11px] text-slate-500">Nenhum backup deste usuário foi registrado ainda.</span>
                  ) : (
                    historicoBackupsUsuario.map((backup, indice) => {
                      const tarefas = Array.isArray(backup.setores) ? backup.setores.reduce((total: number, setor: Setor) => total + setor.tarefas.length, 0) : 0;
                      return (
                        <div key={`${backup.salvoEm}-${indice}`} className={`flex items-center justify-between gap-2.5 py-2 ${indice < historicoBackupsUsuario.length - 1 ? 'border-b border-slate-100' : ''}`}>
                          <div>
                            <strong className="block text-[11px] text-slate-700">{new Date(backup.salvoEm).toLocaleString('pt-BR')}</strong>
                            <span className="text-[10px] text-slate-500">{tarefas} tarefa(s) • atualização {backup.ultimaAtualizacao || 'não informada'}</span>
                          </div>
                          <button onClick={() => restaurarBackupDoUsuarioAtual(backup)} className={`${botaoFerramenta} bg-orange-50 text-orange-700 ring-1 ring-orange-200 hover:bg-orange-100`}>Restaurar esta visita</button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="w-full bg-gradient-to-r from-teal-900 via-teal-700 to-emerald-700 py-3.5 shadow-inner">
            {menuAbas}
          </div>
        </header>
        )}
        <main className={`box-border w-full ${telaInteiraAtiva ? 'min-h-screen p-0' : 'px-5 py-5 sm:px-8'}`}>
          {alerta && (
            <div className={`mb-4 rounded-2xl px-5 py-3 text-sm font-bold ${alerta.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100' : 'bg-rose-50 text-rose-800 ring-1 ring-rose-100'}`}>
              {alerta.msg}
            </div>
          )}

          {/* ABAS */}
          {tabAtiva === 'compras' && (
            <AbaCompras permissoes={usuarioLogado?.permissoes} setTabAtiva={setTabAtiva} />
          )}
          {tabAtiva === 'dados' && usuarioLogado?.permissoes.dados && (
            <AbaDados
              carregarTudo={carregarTudo}
              gravarNaWeb={gravarNaWeb}
              conferencias={conferencias}
              fornecedoresCotacao={fornecedoresCotacao}
              historicoBackupsUsuario={historicoBackupsUsuario}
              historicoPagamentos={historicoPagamentos}
              importarBackup={importarBackup}
              importarBackupConferencia={importarBackupConferencia}
              itensCotacao={itensCotacao}
              mostrarHistoricoBackups={mostrarHistoricoBackups}
              pagamentos={pagamentos}
              quantidadesElieuda={quantidadesElieuda}
              relatoriosPedidosCotacao={relatoriosPedidosCotacao}
              restaurarBackupDoUsuarioAtual={restaurarBackupDoUsuarioAtual}
              restaurarUltimoBackup={restaurarUltimoBackup}
              setMostrarHistoricoBackups={setMostrarHistoricoBackups}
              setTabAtiva={(aba) => setTabAtiva(aba as typeof tabAtiva)}
              setores={setores}
              statusNuvem={statusNuvem}
              ultimaAtualizacao={ultimaAtualizacao}
              usuarioNome={usuarioLogado?.nome || ''}
            />
          )}
          {tabAtiva === 'pendencias' && (
            <section className="mx-auto max-w-6xl">
              <p className="m-0 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">Operação</p>
              <h2 className="mb-3 mt-0 text-xl font-black tracking-tight text-slate-900">Pendências</h2>
              {!sairTelaInteira && <button onClick={() => setSairTelaInteira(true)} className="mb-3.5 cursor-pointer rounded-lg border-0 bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-800">Tela inteira</button>}
              {sairTelaInteira && <button onClick={() => setSairTelaInteira(false)} className="mb-3.5 cursor-pointer rounded-lg border-0 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">Voltar ao sistema</button>}
              <div className="mb-5 flex flex-wrap items-center justify-around gap-3.5 rounded-2xl bg-white px-5 py-3.5 ring-1 ring-slate-200">
                <button onClick={() => setFiltroStatusTarefas('todas')} className={`cursor-pointer rounded-xl px-3 py-1 text-center ${filtroStatusTarefas === 'todas' ? 'bg-slate-100 ring-1 ring-slate-200' : 'bg-transparent'}`}>
                  <div className="text-[11px] font-bold text-slate-800">Abertas</div>
                  <div className="text-xl font-black text-slate-900">{totalAbertasGeral}</div>
                </button>
                <button onClick={() => setFiltroStatusTarefas('concluida')} className={`cursor-pointer rounded-xl px-3 py-1 text-center ${filtroStatusTarefas === 'concluida' ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-transparent'}`}>
                  <div className="text-[11px] font-bold text-emerald-700">Concluídas (7 dias)</div>
                  <div className="text-xl font-black text-emerald-700">{totalConcluidasGeral}</div>
                </button>
                <div className="text-center">
                  <div className="text-[11px] font-bold text-amber-600">Taxa</div>
                  <div className="text-xl font-black text-amber-600">{taxaConclusaoGeral}%</div>
                </div>
              </div>
              {filtroStatusTarefas === 'concluida' && <div className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">Exibindo tarefas concluídas dos últimos 7 dias. Após 7 dias são excluídas automaticamente.</div>}

              <div className="mb-5 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <div className="mb-2 text-xs font-bold text-teal-800">Nova pendência</div>
                <div className="flex flex-wrap gap-2">
                  <input type="text" placeholder="Descreva a pendência..." value={novaTarefaCentral} onChange={e => setNovaTarefaCentral(e.target.value)} onKeyDown={e => e.key === 'Enter' && adicionarTarefaCentral()} className="min-w-[180px] flex-[1_1_240px] rounded-xl border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-teal-500" />
                  <select value={setorSelecionadoNovaTarefa} onChange={e => setSetorSelecionadoNovaTarefa(e.target.value)} className="flex-[1_1_180px] rounded-xl border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 outline-none">
                    {setores.map(setor => <option key={setor.id} value={setor.id}>{nomeSetorSemEmoji(setor.nome)}</option>)}
                  </select>
                  <select value={responsavelSelecionado[setorSelecionadoNovaTarefa] || ''} onChange={e => setResponsavelSelecionado({ ...responsavelSelecionado, [setorSelecionadoNovaTarefa]: e.target.value })} className="flex-[1_1_150px] rounded-xl border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 outline-none">
                    <option value="">Responsável</option>
                    {usuariosDoSistema.map(u => <option key={u.id} value={u.nome}>{u.nome}</option>)}
                  </select>
                  <label className="cursor-pointer rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-bold text-teal-800 ring-1 ring-slate-200 hover:bg-teal-50">
                    Foto
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={event => escolherFotoPendencia(event)} />
                  </label>
                  <button onClick={adicionarTarefaCentral} className="cursor-pointer rounded-xl border-0 bg-teal-700 px-4 py-2.5 font-bold text-white hover:bg-teal-600">Adicionar</button>
                </div>
                {novaTarefaFoto && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={novaTarefaFoto} alt="Prévia da pendência" className="h-16 w-16 rounded-xl object-cover ring-1 ring-slate-200" />
                    <button type="button" onClick={() => setNovaTarefaFoto('')} className="cursor-pointer rounded-lg border-0 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700">Remover foto</button>
                  </div>
                )}
              </div>
              {tarefasDeletadas.length > 0 && (
                <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-300">
                  <span className="text-[13px] font-bold text-amber-900">⚠️ {tarefasDeletadas.length} tarefa(s) deletada(s) • Clique para recuperar</span>
                  <button type="button" onClick={() => setMostrarHistoricoDelete(!mostrarHistoricoDelete)} className="cursor-pointer rounded-lg border-0 bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-400">
                    {mostrarHistoricoDelete ? 'Ocultar' : 'Ver Histórico'}
                  </button>
                </div>
              )}

              {mostrarHistoricoDelete && tarefasDeletadas.length > 0 && (
                <div className="mb-5 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-300">
                  <h3 className="mb-3 mt-0 text-sm font-bold text-amber-900">📋 Tarefas Deletadas (Pode Recuperar)</h3>
                  <div className="flex flex-col gap-2.5">
                    {tarefasDeletadas.map(t => (
                      <div key={t.id} className="flex items-start justify-between gap-2.5 rounded-xl bg-white p-3 ring-1 ring-amber-200">
                        <div className="min-w-0 flex-1">
                          <span className="mb-1 block text-[13px] font-bold text-slate-900">{t.texto}</span>
                          <span className="mb-0.5 block text-[10px] text-slate-500">Criado por: {t.criador} • Data: {t.criadaEm}</span>
                          <span className="block text-[10px] text-amber-600">🗑️ Deletado por: {t.deletadaPor} • {t.deletadaEm}</span>
                          <span className="mt-0.5 block text-[9px] text-amber-500">Setor: {setores.find(s => s.id === t.setorId)?.nome}</span>
                        </div>
                        <button type="button" onClick={() => recuperarTarefa(t)} className="ml-2.5 shrink-0 cursor-pointer rounded-lg border-0 bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-400">✓ Recuperar</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {setoresExibidos.map(setor => {
                  const tarefasDoBloco = Array.isArray(setor.tarefas) ? setor.tarefas : [];
                  return (
                  <div key={setor.id} className="rounded-2xl border-t-4 bg-white p-[18px] ring-1 ring-slate-200" style={{ borderTopColor: setor.cor }}>
                    <h3 className="mb-3 mt-0 text-base font-bold text-slate-900">{nomeSetorSemEmoji(setor.nome)}</h3>
                    <div className="mb-3 flex items-center gap-1.5">
                      <label className="self-center text-[11px] font-bold text-slate-500">Quem criou / responsável:</label>
                      <select value={filtroResponsavel[setor.id] || ''} onChange={e => setFiltroResponsavel({ ...filtroResponsavel, [setor.id]: e.target.value })} className="flex-1 rounded-lg border-0 bg-white px-1.5 py-1.5 text-xs text-slate-900 ring-1 ring-slate-200 outline-none">
                        <option value="">Todos</option>
                        {usuariosDoSistema.map(u => <option key={u.id} value={u.nome}>{u.nome}</option>)}
                      </select>
                    </div>
                    <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto">
                      {(() => {
                        const tarefasVisiveis = tarefasDoBloco
                        .slice()
                        .sort((a, b) => Number(b.id) - Number(a.id) || String(b.criadaEm || '').localeCompare(String(a.criadaEm || '')))
                        .filter(t => {
                          if (filtroStatusTarefas === 'todas' && statusDaTarefa(t) === 'concluida') return false;
                          if (filtroStatusTarefas === 'concluida' && statusDaTarefa(t) !== 'concluida') return false;
                          const pessoa = filtroResponsavel[setor.id];
                          if (pessoa && t.responsavel !== pessoa && t.criador !== pessoa) return false;
                          return true;
                        });
                        if (tarefasVisiveis.length === 0) {
                          return <p className="m-0 text-xs text-slate-400">Nenhuma pendência aberta aqui. Confira o setor escolhido ao lançar.</p>;
                        }
                        return tarefasVisiveis.map(t => (
                        <div key={t.id} className={`flex items-start justify-between gap-2 rounded-xl p-2.5 ring-1 ring-slate-200 ${t.status === 'concluida' ? 'bg-slate-50' : 'bg-white'}`}>
                          {t.foto ? (
                            <button type="button" onClick={() => setFotoAmpliada(t.foto || '')} className="mt-0.5 shrink-0 cursor-pointer border-0 bg-transparent p-0">
                              <img src={t.foto} alt={t.texto} className="h-14 w-14 rounded-lg object-cover ring-1 ring-slate-200" />
                            </button>
                          ) : (
                            <label className="mt-0.5 flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-slate-50 text-center text-[10px] font-bold leading-tight text-teal-800 ring-1 ring-slate-200">
                              + Foto
                              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={event => escolherFotoPendencia(event, { setorId: setorRealDaTarefa(setor.id, t.id), tarefaId: t.id })} />
                            </label>
                          )}
                          <div className="min-w-0 flex-1">
                            <span className={`mb-1 block text-[13px] font-bold ${t.status === 'concluida' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{t.texto}</span>
                            {setor.id === 'pao-da-vida' && (
                              <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-teal-700">{nomeSetorSemEmoji(setores.find(s => (s.tarefas || []).some(x => x.id === t.id))?.nome || '')}</span>
                            )}
                            <span className="mb-0.5 block text-[10px] text-slate-500">Criado por: {t.criador} • Data: {t.dataCriacao}</span>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              <span className="text-[9px] text-slate-400">⏰ {t.criadaEm}</span>
                              <select
                                value={t.responsavel || ''}
                                onChange={e => mudarResponsavel(setorRealDaTarefa(setor.id, t.id), t.id, e.target.value)}
                                className="cursor-pointer rounded border-0 bg-white px-1 py-1 text-[10px] ring-1 ring-slate-200 outline-none"
                              >
                                <option value="">Sem responsável</option>
                                {usuariosDoSistema.map(u => <option key={u.id} value={u.nome}>{u.nome}</option>)}
                              </select>
                              {t.responsavel && <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">Responsável: {t.responsavel}</span>}
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-1.5">
                            <button type="button" onClick={() => alternarStatusTarefa(setorRealDaTarefa(setor.id, t.id), t.id)} className={`cursor-pointer rounded border-0 px-2 py-1 text-[10px] font-bold ${t.status === 'concluida' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>{t.status === 'concluida' ? 'Reabrir' : 'Concluir'}</button>
                            <button type="button" onClick={() => removerTarefa(setorRealDaTarefa(setor.id, t.id), t.id)} className="cursor-pointer rounded border-0 bg-rose-100 px-2 py-1 font-bold text-teal-700 ring-1 ring-rose-200">✕</button>
                          </div>
                        </div>
                      ));
                      })()}
                    </div>
                  </div>
                  );
                })}
              </div>
              {fotoAmpliada && (
                <div className="fixed inset-0 z-[10010] flex items-center justify-center bg-slate-950/80 p-5" onClick={() => setFotoAmpliada('')}>
                  <img src={fotoAmpliada} alt="Foto da pendência" className="max-h-[88vh] max-w-full rounded-2xl object-contain shadow-2xl" />
                </div>
              )}
            </section>
          )}

          {tabAtiva === 'manutencao' && usuarioLogado?.permissoes.manutencao && (
            <AbaManutencao
              LOCAIS_MANUTENCAO={LOCAIS_MANUTENCAO}
              MOTIVOS_PAUSA_MANUTENCAO={MOTIVOS_PAUSA_MANUTENCAO}
              MOTIVOS_COMPRA_PAUSA={MOTIVOS_COMPRA_PAUSA}
              TIPOS_MANUTENCAO={TIPOS_MANUTENCAO}
              adicionarOrdemManutencao={adicionarOrdemManutencao}
              atualizarStatusOrdem={atualizarStatusOrdem}
              confirmarConclusaoOrdem={confirmarConclusaoOrdem}
              confirmarPausaOrdem={confirmarPausaOrdem}
              registrarCompraOrdem={registrarCompraOrdem}
              corPrioridadeOrdem={corPrioridadeOrdem}
              classeStatusOrdem={classeStatusOrdem}
              escolherFotoOrdem={escolherFotoOrdem}
              filtroOrdensManutencao={filtroOrdensManutencao}
              fotoAmpliada={fotoAmpliada}
              motivoPausaEscolhido={motivoPausaEscolhido}
              motivoPausaOutro={motivoPausaOutro}
              nomeUsuarioLogado={usuarioLogado?.nome}
              novaOrdemDescricao={novaOrdemDescricao}
              novaOrdemFoto={novaOrdemFoto}
              novaOrdemLocal={novaOrdemLocal}
              novaOrdemPrioridade={novaOrdemPrioridade}
              novaOrdemTipo={novaOrdemTipo}
              ordemPausaId={ordemPausaId}
              ordensAndamentoQtd={ordensAndamentoQtd}
              ordensConcluidasQtd={ordensConcluidasQtd}
              ordensFiltradas={ordensFiltradas}
              ordensManutencao={ordensManutencao}
              ordensNaoRealizadaQtd={ordensNaoRealizadaQtd}
              ordensPausadaQtd={ordensPausadaQtd}
              ordensPendenteQtd={ordensPendenteQtd}
              pedirMotivoPausa={pedirMotivoPausa}
              removerOrdemManutencao={removerOrdemManutencao}
              rotuloStatusOrdem={rotuloStatusOrdem}
              setFiltroOrdensManutencao={setFiltroOrdensManutencao}
              setFotoAmpliada={setFotoAmpliada}
              setMotivoPausaEscolhido={setMotivoPausaEscolhido}
              setMotivoPausaOutro={setMotivoPausaOutro}
              setNovaOrdemDescricao={setNovaOrdemDescricao}
              setNovaOrdemFoto={setNovaOrdemFoto}
              setNovaOrdemLocal={setNovaOrdemLocal}
              setNovaOrdemPrioridade={setNovaOrdemPrioridade}
              setNovaOrdemTipo={setNovaOrdemTipo}
              setOrdemPausaId={setOrdemPausaId}
              setTabAtiva={setTabAtiva}
              statusOrdemNormalizado={statusOrdemNormalizado}
            />
          )}

          {tabAtiva === 'cotacao' && (
            <AbaCotacao
              adicionarFornecedorCotacao={adicionarFornecedorCotacao}
              atualizarCampoCotacao={atualizarCampoCotacao}
              atualizarPrecoCotacao={atualizarPrecoCotacao}
              buscaCotacao={buscaCotacao}
              cadastrarProduto={cadastrarProduto}
              calcularMenorPrecoItem={calcularMenorPrecoItem}
              enviarPedidoWhatsAppPdf={enviarPedidoWhatsAppPdf}
              excluirRelatorioPedidoCotacao={excluirRelatorioPedidoCotacao}
              fornecedoresCotacao={fornecedoresCotacao}
              getDiaSemanaAtual={getDiaSemanaAtual}
              garantirEmbalagensNaCotacao={garantirEmbalagensNaCotacao}
              garantirLaticiniosNaCotacao={garantirLaticiniosNaCotacao}
              imprimirPedidoIndividual={imprimirPedidoIndividual}
              imprimirRelatorioCotacao={imprimirRelatorioCotacao}
              imprimirRelatorioPedidosPorVendedor={imprimirRelatorioPedidosPorVendedor}
              itensCotacao={itensCotacao}
              limparCotacoesPrecos={limparCotacoesPrecos}
              marcarPedidoSalvoNaConferencia={marcarPedidoSalvoNaConferencia}
              mostrarRelatorioPedidos={mostrarRelatorioPedidos}
              mostrarRelatoriosCotacao={mostrarRelatoriosCotacao}
              novoFornecedorNome={novoFornecedorNome}
              novoProdutoCadastro={novoProdutoCadastro}
              pedidosAindaNaCotacao={pedidosAindaNaCotacao}
              qtdPedirNumero={qtdPedirNumero}
              relatoriosPedidosCotacao={relatoriosPedidosCotacao}
              removerItemCotacao={removerItemCotacao}
              salvarPedidoFornecedor={salvarPedidoFornecedor}
              salvarRelatorioPedidoCotacao={salvarRelatorioPedidoCotacao}
              setAlerta={setAlerta}
              setBuscaCotacao={setBuscaCotacao}
              setFornecedoresCotacao={setFornecedoresCotacao}
              setMostrarModalImportacao={setMostrarModalImportacao}
              setMostrarRelatorioPedidos={setMostrarRelatorioPedidos}
              setMostrarRelatoriosCotacao={setMostrarRelatoriosCotacao}
              setNovoFornecedorNome={setNovoFornecedorNome}
              setNovoProdutoCadastro={setNovoProdutoCadastro}
              setTabAtiva={setTabAtiva}
              totaisPorFornecedor={totaisPorFornecedor}
              totalGeralCompraCotacao={totalGeralCompraCotacao}
              verificaEntregaHoje={verificaEntregaHoje}
            />
          )}

          {tabAtiva === 'cadastroProdutos' && usuarioLogado?.permissoes.cotacao && (
            <AbaCadastroProdutos
              setTabAtiva={setTabAtiva}
              itensCotacao={itensCotacao}
              novoProdutoCadastro={novoProdutoCadastro}
              setNovoProdutoCadastro={setNovoProdutoCadastro}
              cadastrarProduto={cadastrarProduto}
              excluirProdutoCadastrado={excluirProdutoCadastrado}
            />
          )}

          {tabAtiva === 'cadastroFornecedores' && usuarioLogado?.permissoes.cotacao && (
            <AbaCadastroFornecedores
              setTabAtiva={setTabAtiva}
              fornecedoresCotacao={fornecedoresCotacao}
              novoFornecedorCadastro={novoFornecedorCadastro}
              setNovoFornecedorCadastro={setNovoFornecedorCadastro}
              cadastrarFornecedor={cadastrarFornecedor}
              removerFornecedorCotacao={removerFornecedorCotacao}
            />
          )}
{/* 💰 TELA DE PAGAMENTOS (CAIXA, CHEQUE E CABEN) */}
          {tabAtiva === 'pagamentos' && (
            <section style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '20px', border: '1px solid #cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <button onClick={() => setTabAtiva('compras')} style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '5px', padding: '7px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' }}>← Voltar para Compras</button>
                  <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '900', textTransform: 'uppercase' }}>💳 Gestão de Pagamentos</h2>
                  <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#0f766e' }}>Ao lançar (botão +), o pagamento é salvo na nuvem e aparece em qualquer computador ao entrar no site.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => imprimirRelatorioPagamentos(pagamentos, totalGeralPagamentos)} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🖨️ Imprimir / Visualizar</button>
                  <button onClick={() => enviarRelatorioPagamentosPdf(pagamentos, totalGeralPagamentos)} style={{ backgroundColor: '#25d366', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>WhatsApp PDF</button>
                  <button onClick={fecharLotePagamentos} style={{ backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🔒 Fechar Lote</button>
                  <button onClick={() => setMostrarPastaHistorico(!mostrarPastaHistorico)} style={{ backgroundColor: '#e2e8f0', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>📁 Histórico ({historicoPagamentos.length})</button>
                </div>
              </div>

              {/* Totais do Topo */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #0f766e', borderRadius: '6px', padding: '12px 16px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>PAGAMENTOS EM CAIXA</span>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f766e', marginTop: '4px' }}>R$ {totalCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #2563eb', borderRadius: '6px', padding: '12px 16px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>PAGAMENTOS EM CHEQUE</span>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#2563eb', marginTop: '4px' }}>R$ {totalCheque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #7c3aed', borderRadius: '6px', padding: '12px 16px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>PAGAMENTOS CABEN</span>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#7c3aed', marginTop: '4px' }}>R$ {totalCaben.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #86efac', borderRadius: '6px', padding: '12px 16px', textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#065f46', fontWeight: 'bold' }}>TOTAL GERAL</span>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#059669', marginTop: '4px' }}>R$ {totalGeralPagamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>

              {/* As 3 Colunas Principais */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                
                {/* 1. CAIXA */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', backgroundColor: '#ffffff' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0f766e', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '2px solid #0f766e', paddingBottom: '6px' }}>💵 1. Caixa</h3>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                    <input type="text" placeholder="Descrição..." value={novoCaixa.descricao} onChange={e => setNovoCaixa({ ...novoCaixa, descricao: e.target.value })} style={{ flex: 2, padding: '7px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    <input type="text" placeholder="Valor (R$)" value={novoCaixa.valor} onChange={e => setNovoCaixa({ ...novoCaixa, valor: e.target.value })} onKeyDown={e => e.key === 'Enter' && adicionarPagamentoCaixa()} style={{ flex: 1, padding: '7px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    <button onClick={adicionarPagamentoCaixa} style={{ backgroundColor: '#0f766e', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer' }}>＋</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                    {listaCaixaSegura.length === 0 ? <span style={{ fontSize: '11px', color: '#94a3b8' }}>Nenhum lançamento no Caixa.</span> : listaCaixaSegura.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px' }}>
                        <span style={{ fontWeight: 'bold', color: '#334155' }}>{item.descricao}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: '#0f766e' }}>R$ {Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                          <button onClick={() => removerPagamento('caixa', item.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. CHEQUE */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', backgroundColor: '#ffffff' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#2563eb', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '2px solid #2563eb', paddingBottom: '6px' }}>📝 2. Cheque</h3>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                    <input type="text" placeholder="Favorecido / Motivo..." value={novoCheque.descricao} onChange={e => setNovoCheque({ ...novoCheque, descricao: e.target.value })} style={{ flex: 2, padding: '7px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    <input type="text" placeholder="Valor (R$)" value={novoCheque.valor} onChange={e => setNovoCheque({ ...novoCheque, valor: e.target.value })} onKeyDown={e => e.key === 'Enter' && adicionarPagamentoCheque()} style={{ flex: 1, padding: '7px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    <button onClick={adicionarPagamentoCheque} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer' }}>＋</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                    {listaChequeSegura.length === 0 ? <span style={{ fontSize: '11px', color: '#94a3b8' }}>Nenhum lançamento em Cheque.</span> : listaChequeSegura.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px' }}>
                        <span style={{ fontWeight: 'bold', color: '#334155' }}>{item.descricao}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: '#2563eb' }}>R$ {Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                          <button onClick={() => removerPagamento('cheque', item.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. CABEN */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', backgroundColor: '#ffffff' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#7c3aed', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '2px solid #7c3aed', paddingBottom: '6px' }}>🏢 3. CABEN</h3>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                    <input type="text" placeholder="Descrição..." value={novoCaben.descricao} onChange={e => setNovoCaben({ ...novoCaben, descricao: e.target.value })} style={{ flex: 2, padding: '7px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    <input type="text" placeholder="Valor (R$)" value={novoCaben.valor} onChange={e => setNovoCaben({ ...novoCaben, valor: e.target.value })} onKeyDown={e => e.key === 'Enter' && adicionarPagamentoCaben()} style={{ flex: 1, padding: '7px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    <button onClick={adicionarPagamentoCaben} style={{ backgroundColor: '#7c3aed', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer' }}>＋</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                    {listaCabenSegura.length === 0 ? <span style={{ fontSize: '11px', color: '#94a3b8' }}>Nenhum lançamento no CABEN.</span> : listaCabenSegura.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px' }}>
                        <span style={{ fontWeight: 'bold', color: '#334155' }}>{item.descricao}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: '#7c3aed' }}>R$ {Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                          <button onClick={() => removerPagamento('caben', item.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Histórico de Lotes Fechados */}
              <div style={{ marginTop: '24px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0f172a' }}>📁 Histórico de Lotes Fechados ({historicoPagamentos.length})</h3>
                  {historicoPagamentos.length === 0 ? <span style={{ fontSize: '12px', color: '#64748b' }}>Nenhum lote foi fechado ainda.</span> : historicoPagamentos.map(lote => (
                    <div key={lote.id} style={{ padding: '10px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <div>
                          <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a' }}>Fechamento: {lote.dataFechamento}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>Caixa: R$ {lote.totalCaixa.toFixed(2)} | Cheque: R$ {lote.totalCheque.toFixed(2)} | CABEN: R$ {lote.totalCaben.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <strong style={{ fontSize: '14px', color: '#059669' }}>Total: R$ {lote.totalGeral.toFixed(2)}</strong>
                          <button onClick={() => imprimirRelatorioPagamentos(lote.dados, lote.totalGeral, lote.dataFechamento)} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '5px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>🖨️ Ver</button>
                          <button onClick={() => enviarRelatorioPagamentosPdf(lote.dados, lote.totalGeral, lote.dataFechamento)} style={{ backgroundColor: '#25d366', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '5px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>WhatsApp PDF</button>
                          <button onClick={() => removerLoteHistorico(lote.id)} style={{ color: '#ef4444', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '4px', padding: '5px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Excluir</button>
                        </div>
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#334155', lineHeight: 1.45 }}>
                        {(lote.dados?.caixa || []).length > 0 && <div><strong>Caixa:</strong> {(lote.dados.caixa || []).map(i => `${i.descricao} (R$ ${Number(i.valor).toFixed(2)})`).join(', ')}</div>}
                        {(lote.dados?.cheque || []).length > 0 && <div><strong>Cheque:</strong> {(lote.dados.cheque || []).map(i => `${i.descricao} (R$ ${Number(i.valor).toFixed(2)})`).join(', ')}</div>}
                        {(lote.dados?.caben || []).length > 0 && <div><strong>CABEN:</strong> {(lote.dados.caben || []).map(i => `${i.descricao} (R$ ${Number(i.valor).toFixed(2)})`).join(', ')}</div>}
                      </div>
                    </div>
                  ))}
                </div>
            </section>
          )}

          {tabAtiva === 'elieuda' && (
            <AbaElieuda
              atualizarQtdElieuda={atualizarQtdElieuda}
              gerarPdfElieuda={gerarPdfElieuda}
              limparDadosElieuda={limparDadosElieuda}
              listaProdutosElieudaPadrao={listaProdutosElieudaPadrao}
              quantidadesElieuda={quantidadesElieuda}
              setTabAtiva={setTabAtiva}
            />
          )}

          {tabAtiva === 'conferencia' && (
            <section style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '20px', border: '1px solid #cbd5e1' }}>
              <button onClick={() => setTabAtiva('compras')} style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '5px', padding: '7px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '14px' }}>← Voltar para Compras</button>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>✓ Conferência de Pedidos</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={enviarPdfConferenciaCompartilhado} style={{ backgroundColor: arquivoConferencia ? '#059669' : '#fef3c7', color: arquivoConferencia ? '#ffffff' : '#92400e', border: `1px solid ${arquivoConferencia ? '#10b981' : '#fcd34d'}`, borderRadius: '4px', padding: '7px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {arquivoConferencia ? '📄 Meu PDF enviado' : '📤 Enviar meu PDF'}
                  </button>
                  <label style={{ backgroundColor: '#e2e8f0', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '7px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                    📥 Importar Backup
                    <input type="file" accept=".json" onChange={importarBackupConferencia} style={{ display: 'none' }} />
                  </label>
                  <button onClick={imprimirRelatorioConferencia} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '7px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>🖨️ Imprimir Relatório</button>
                </div>
              </div>

              <div style={{ marginBottom: '16px', padding: '12px 14px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>🔎 Pesquisar fornecedor</label>
                <input
                  type="text"
                  value={buscaFornecedorConferencia}
                  onChange={event => {
                    setBuscaFornecedorConferencia(event.target.value);
                    setAbaConferencia('pedidos');
                  }}
                  placeholder="Ex.: JFRIOS, Laredo, Minerva... mostra os pedidos abertos da empresa"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '2px solid #2563eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold' }}
                />
                {buscaFornecedorConferencia.trim() && (
                  <span style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: '#1e40af' }}>
                    {pedidosPendentesFiltrados.length} pedido(s) aberto(s) de “{buscaFornecedorConferencia.trim()}”
                  </span>
                )}
              </div>

              {/* SEÇÃO DO PDF COMPARTILHADO DA CONFERÊNCIA */}
              {arquivoConferencia && (
                <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: '#eff6ff', border: '2px solid #60a5fa', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ fontSize: '32px' }}>📄</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e3a8a' }}>{arquivoConferencia.nome}</div>
                        <div style={{ fontSize: '10px', color: '#475569' }}>
                          Enviado em {arquivoConferencia.dataUpload} por {arquivoConferencia.uploadPor}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <a 
                        href={arquivoConferencia.conteudo} 
                        download={arquivoConferencia.nome}
                        style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', textDecoration: 'none', cursor: 'pointer' }}
                      >
                        ⬇️ Baixar PDF
                      </a>
                      <button 
                        onClick={() => window.open(arquivoConferencia.conteudo, '_blank')}
                        style={{ backgroundColor: '#ffffff', color: '#1e3a8a', border: '1px solid #93c5fd', borderRadius: '4px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        👁️ Visualizar
                      </button>
                      <button 
                        onClick={removerPdfConferenciaCompartilhado}
                        style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '4px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        ✕ Remover
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CARDS DE ESTATÍSTICAS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb', padding: '12px 16px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#1e40af', fontWeight: 'bold', textTransform: 'uppercase' }}>Pedidos Gerados</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#1e3a8a', marginTop: '4px' }}>{pedidosRealizadosTotal}</div>
                </div>
                <div style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #d97706', padding: '12px 16px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#92400e', fontWeight: 'bold', textTransform: 'uppercase' }}>Aguardando Conferência</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#78350f', marginTop: '4px' }}>{pedidosPendentesTotal}</div>
                </div>
                <div style={{ backgroundColor: '#ecfdf5', borderLeft: '4px solid #059669', padding: '12px 16px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#065f46', fontWeight: 'bold', textTransform: 'uppercase' }}>Conferidos</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#064e3b', marginTop: '4px' }}>{conferencias.length}</div>
                </div>
                <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #dc2626', padding: '12px 16px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#991b1b', fontWeight: 'bold', textTransform: 'uppercase' }}>Com Divergência</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#7f1d1d', marginTop: '4px' }}>{conferencias.filter(c => c.houveDivergencia).length}</div>
                </div>
              </div>

              {/* FORMULÁRIO DE CONFERÊNCIA AVULSA */}
              <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: '#065f46', fontWeight: 'bold' }}>📋 Conferência Avulsa (sem pedido)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Data</label>
                    <input 
                      type="date" 
                      value={novaConferencia.data} 
                      onChange={(e) => setNovaConferencia({ ...novaConferencia, data: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Nome do Conferente</label>
                    <input 
                      type="text" 
                      placeholder="Seu nome..." 
                      value={novaConferencia.nomeConferente} 
                      onChange={(e) => setNovaConferencia({ ...novaConferencia, nomeConferente: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Valor Recebido (R$)</label>
                    <input 
                      type="text" 
                      placeholder="0,00" 
                      value={novaConferencia.valorRecebido} 
                      onChange={(e) => setNovaConferencia({ ...novaConferencia, valorRecebido: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Houve Divergência?</label>
                    <select 
                      value={novaConferencia.houveDivergencia ? 'true' : 'false'} 
                      onChange={(e) => setNovaConferencia({ ...novaConferencia, houveDivergencia: e.target.value === 'true' })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                    >
                      <option value="false">Não</option>
                      <option value="true">Sim</option>
                    </select>
                  </div>
                  {novaConferencia.houveDivergencia && (
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Tipo de Divergência</label>
                      <select 
                        value={novaConferencia.tipoDivergencia || ''} 
                        onChange={(e) => setNovaConferencia({ ...novaConferencia, tipoDivergencia: e.target.value as any })}
                        style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                      >
                        <option value="">Selecione...</option>
                        <option value="valor">Valor</option>
                        <option value="kg">Peso/Kg</option>
                        <option value="quantidade">Quantidade</option>
                      </select>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Observações</label>
                  <textarea 
                    placeholder="Detalhes da conferência..." 
                    value={novaConferencia.observacoes} 
                    onChange={(e) => setNovaConferencia({ ...novaConferencia, observacoes: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', minHeight: '60px', resize: 'vertical' }}
                  />
                </div>
                <button 
                  onClick={adicionarConferencia}
                  style={{ marginTop: '12px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ✓ Registrar Conferência
                </button>
              </div>

              {/* SUB-ABAS */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', borderBottom: '2px solid #e2e8f0', paddingBottom: '0' }}>
                {(['pedidos', 'conferidos', 'divergencias'] as const).map(aba => (
                  <button 
                    key={aba}
                    onClick={() => setAbaConferencia(aba)}
                    style={{ 
                      backgroundColor: abaConferencia === aba ? '#2563eb' : '#ffffff', 
                      color: abaConferencia === aba ? '#ffffff' : '#334155', 
                      border: '1px solid #cbd5e1', 
                      borderBottom: abaConferencia === aba ? 'none' : '1px solid #cbd5e1',
                      borderRadius: '6px 6px 0 0', 
                      padding: '10px 16px', 
                      fontSize: '12px', 
                      fontWeight: 'bold', 
                      cursor: 'pointer',
                      transform: abaConferencia === aba ? 'translateY(2px)' : 'none'
                    }}
                  >
                    {aba === 'pedidos' && `📦 Pedidos Pendentes (${buscaFornecedorConferencia.trim() ? pedidosPendentesFiltrados.length : pedidosPendentesTotal})`}
                    {aba === 'conferidos' && `✅ Conferidos (${buscaFornecedorConferencia.trim() ? conferenciasFiltradas.length : conferencias.length})`}
                    {aba === 'divergencias' && `⚠️ Divergências (${buscaFornecedorConferencia.trim() ? divergenciasFiltradas.length : conferencias.filter(c => c.houveDivergencia).length})`}
                  </button>
                ))}
              </div>

              {/* ABA: PEDIDOS PENDENTES */}
              {abaConferencia === 'pedidos' && (
                <div>
                  {pedidosPendentesConferencia.length === 0 ? (
                    <div style={{ padding: '40px 20px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎉</div>
                      <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>Nenhum pedido pendente!</strong>
                      Todos os pedidos já foram conferidos. Gere novos pedidos na aba de Cotação.
                    </div>
                  ) : pedidosPendentesFiltrados.length === 0 ? (
                    <div style={{ padding: '40px 20px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '6px', textAlign: 'center', color: '#9a3412', fontSize: '13px' }}>
                      <strong style={{ display: 'block', fontSize: '14px', color: '#7c2d12', marginBottom: '4px' }}>Nenhum pedido aberto deste fornecedor</strong>
                      Não achei “{buscaFornecedorConferencia.trim()}” nos Pedidos Pendentes. Confira o nome ou limpe a pesquisa.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {pedidosPendentesFiltrados.map(relatorio => (
                        <section key={relatorio.id} style={{ width: '100%', boxSizing: 'border-box', border: '2px solid #2563eb', borderRadius: '6px', padding: '14px', backgroundColor: '#ffffff' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', backgroundColor: '#eff6ff', borderBottom: '1px solid #bfdbfe', margin: '-14px -14px 10px', padding: '10px 14px' }}>
                            <div>
                              <strong style={{ display: 'block', fontSize: '14px', color: '#1e3a8a' }}>
                                📦 {relatorio.itens[0]?.fornecedor || 'Fornecedor não informado'}
                              </strong>
                              <span style={{ fontSize: '11px', color: '#475569' }}>
                                {relatorio.data} • {relatorio.itens.length} item(ns) • 
                                <strong style={{ color: '#1e3a8a' }}> Valor Nota: R$ {relatorio.totalGeral.toFixed(2)}</strong>
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                              {podeExcluirPedidoConferencia && (
                                <button onClick={() => excluirPedidoNaConferencia(relatorio.id)} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '4px', padding: '4px 10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                                  Excluir pedido
                                </button>
                              )}
                              {!relatorio.pdfFornecedor ? (
                                <button onClick={() => anexarPdfFornecedor(relatorio)} style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', borderRadius: '4px', padding: '4px 10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                                  📎 Anexar PDF do fornecedor
                                </button>
                              ) : (
                                <>
                                  <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #fcd34d' }}>
                                    📄 {relatorio.pdfFornecedor.nome}
                                  </span>
                                  <button onClick={() => visualizarPdfFornecedor(relatorio)} style={{ backgroundColor: '#ffffff', color: '#1e3a8a', border: '1px solid #93c5fd', borderRadius: '4px', padding: '3px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    👁️ Ver
                                  </button>
                                  <a href={relatorio.pdfFornecedor.conteudo} download={relatorio.pdfFornecedor.nome} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none' }}>
                                    ⬇️
                                  </a>
                                </>
                              )}
                            </div>
                          </div>

                          <div style={{ marginTop: '7px', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                            {Object.entries(relatorio.itens.reduce((grupos, item) => { (grupos[item.fornecedor] ||= []).push(item); return grupos; }, {} as { [fornecedor: string]: typeof relatorio.itens })).map(([fornecedor, itensFornecedor]) => (
                              <div key={`${relatorio.id}-${fornecedor}`}>
                                {itensFornecedor.map((item, indice) => (
                                  <div key={`${relatorio.id}-${fornecedor}-${indice}`} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 90px', gap: '6px', fontSize: '11px', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
                                    <span style={{ color: '#334155' }}>{item.produto}</span>
                                    <strong style={{ color: '#0f172a' }}>{item.quantidade} {item.unit}</strong>
                                    <span style={{ textAlign: 'right', color: '#334155' }}>R$ {item.valorTotal.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>

                          <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '5px' }}>
                            <strong style={{ display: 'block', fontSize: '11px', color: '#1e3a8a', marginBottom: '7px' }}>✓ Preencher Conferência deste Pedido</strong>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '6px' }}>
                              <input placeholder="Nome do conferente" value={conferenciasPorPedido[relatorio.id]?.conferente || ''} onChange={event => atualizarConferenciaPedido(relatorio.id, 'conferente', event.target.value)} style={{ padding: '6px', border: '1px solid #93c5fd', borderRadius: '4px', fontSize: '11px' }} />
                              <input placeholder="Valor recebido (R$)" value={conferenciasPorPedido[relatorio.id]?.valor || ''} onChange={event => atualizarConferenciaPedido(relatorio.id, 'valor', event.target.value)} style={{ padding: '6px', border: '1px solid #93c5fd', borderRadius: '4px', fontSize: '11px' }} />
                              <input placeholder="Detalhes / observações" value={conferenciasPorPedido[relatorio.id]?.obs || ''} onChange={event => atualizarConferenciaPedido(relatorio.id, 'obs', event.target.value)} style={{ padding: '6px', border: '1px solid #93c5fd', borderRadius: '4px', fontSize: '11px' }} />
                              <select value={conferenciasPorPedido[relatorio.id]?.tipoDivergencia || ''} onChange={event => atualizarConferenciaPedido(relatorio.id, 'tipoDivergencia', event.target.value)} style={{ padding: '6px', border: '1px solid #93c5fd', borderRadius: '4px', fontSize: '11px' }}>
                                <option value="">Sem divergência</option>
                                <option value="valor">Divergência de valor</option>
                                <option value="kg">Divergência de Kg</option>
                                <option value="quantidade">Divergência de quantidade</option>
                              </select>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#1e3a8a' }}>
                                <input type="checkbox" checked={conferenciasPorPedido[relatorio.id]?.divergencia || false} onChange={event => atualizarConferenciaPedido(relatorio.id, 'divergencia', event.target.checked)} /> Houve divergência
                              </label>
                            </div>

                            <button onClick={() => salvarConferenciaPedido(relatorio)} style={{ marginTop: '7px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '6px 14px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                              💾 Salvar e Marcar como Conferido
                            </button>
                          </div>
                        </section>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ABA: CONFERIDOS */}
              {abaConferencia === 'conferidos' && (
                <div>
                  {conferencias.length === 0 ? (
                    <div style={{ padding: '40px 20px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                      <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>Nenhuma conferência registrada ainda.</strong>
                      Conforme os pedidos chegarem, eles aparecerão aqui após serem conferidos.
                    </div>
                  ) : conferenciasFiltradas.length === 0 ? (
                    <div style={{ padding: '24px 20px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '6px', textAlign: 'center', color: '#9a3412', fontSize: '13px' }}>
                      Nenhuma conferência deste fornecedor.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {conferenciasFiltradas.map((conf) => (
                        <div key={conf.id} style={{ padding: '14px', backgroundColor: conf.houveDivergencia ? '#fff7ed' : '#ffffff', border: `1px solid ${conf.houveDivergencia ? '#fed7aa' : '#cbd5e1'}`, borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '13px', color: '#0f172a' }}>{conf.nomeConferente}</strong>
                              <span style={{ fontSize: '11px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{conf.data}</span>
                              {conf.fornecedor && (
                                <span style={{ fontSize: '11px', color: '#1e3a8a', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                  📦 {conf.fornecedor}
                                </span>
                              )}
                              {conf.houveDivergencia && (
                                <span style={{ fontSize: '10px', color: '#dc2626', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                  ⚠️ Divergência: {conf.tipoDivergencia}
                                </span>
                              )}
                              {!conf.houveDivergencia && (
                                <span style={{ fontSize: '10px', color: '#047857', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                  ✓ Sem divergências
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginBottom: '8px' }}>
                              {conf.valorEsperado !== undefined && (
                                <div style={{ fontSize: '11px', color: '#334155' }}>
                                  <strong>Valor Nota:</strong> R$ {conf.valorEsperado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                              )}
                              <div style={{ fontSize: '11px', color: '#334155' }}>
                                <strong>Valor Recebido:</strong> <span style={{ color: conf.valorEsperado && conf.valorRecebido !== conf.valorEsperado ? '#dc2626' : '#065f46', fontWeight: 'bold' }}>R$ {conf.valorRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                              {conf.valorEsperado !== undefined && conf.valorRecebido !== conf.valorEsperado && (
                                <div style={{ fontSize: '11px', color: '#dc2626' }}>
                                  <strong>Diferença:</strong> R$ {Math.abs(conf.valorRecebido - conf.valorEsperado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                              )}
                            </div>
                            {conf.itensConferidos && conf.itensConferidos.length > 0 && (
                              <details style={{ marginBottom: '6px' }}>
                                <summary style={{ fontSize: '11px', color: '#334155', cursor: 'pointer', fontWeight: 'bold' }}>
                                  📋 Ver itens conferidos ({conf.itensConferidos.length})
                                </summary>
                                <div style={{ marginTop: '6px', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                  {conf.itensConferidos.map((item, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 90px', gap: '6px', fontSize: '10px', borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none', paddingTop: idx > 0 ? '4px' : '0' }}>
                                      <span>{item.produto}</span>
                                      <strong>{item.quantidade} {item.unit}</strong>
                                      <span style={{ textAlign: 'right' }}>R$ {item.valorTotal.toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}
                            {(() => {
                              const pedidoOriginal = conf.pedidoId ? relatoriosPedidosCotacao.find(r => r.id === conf.pedidoId) : null;
                              if (!pedidoOriginal?.pdfFornecedor) return null;
                              return (
                                <div style={{ marginBottom: '6px', padding: '6px 10px', backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '14px' }}>📄</span>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#92400e' }}>{pedidoOriginal.pdfFornecedor.nome}</span>
                                    <span style={{ fontSize: '10px', color: '#64748b' }}>({pedidoOriginal.pdfFornecedor.anexadoEm})</span>
                                  </div>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button onClick={() => setPdfFornecedorVisualizacao({ nome: pedidoOriginal.pdfFornecedor!.nome, conteudo: pedidoOriginal.pdfFornecedor!.conteudo })} style={{ backgroundColor: '#ffffff', color: '#1e3a8a', border: '1px solid #93c5fd', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                                      👁️ Ver
                                    </button>
                                    <a href={pedidoOriginal.pdfFornecedor.conteudo} download={pedidoOriginal.pdfFornecedor.nome} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none' }}>
                                      ⬇️ Baixar
                                    </a>
                                  </div>
                                </div>
                              );
                            })()}
                            {conf.observacoes && (
                              <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', borderLeft: '3px solid #cbd5e1', paddingLeft: '8px' }}>
                                "{conf.observacoes}"
                              </div>
                            )}
                          </div>
                          {podeExcluirPedidoConferencia && (
                          <button 
                            onClick={() => excluirConferencia(conf.id)}
                            style={{ color: '#ef4444', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 }}
                          >
                            ✕
                          </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ABA: DIVERGÊNCIAS */}
              {abaConferencia === 'divergencias' && (
                <div>
                  {conferencias.filter(c => c.houveDivergencia).length === 0 ? (
                    <div style={{ padding: '40px 20px', backgroundColor: '#ecfdf5', border: '1px solid #86efac', borderRadius: '6px', textAlign: 'center', color: '#065f46', fontSize: '13px' }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>✅</div>
                      <strong style={{ display: 'block', fontSize: '14px', color: '#064e3b', marginBottom: '4px' }}>Ótimo! Nenhuma divergência registrada.</strong>
                      Todas as conferências estão sem problemas.
                    </div>
                  ) : divergenciasFiltradas.length === 0 ? (
                    <div style={{ padding: '24px 20px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '6px', textAlign: 'center', color: '#9a3412', fontSize: '13px' }}>
                      Nenhuma divergência deste fornecedor.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {divergenciasFiltradas.map((conf) => (
                        <div key={conf.id} style={{ padding: '14px', backgroundColor: '#fff7ed', border: '2px solid #f97316', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', color: '#ffffff', backgroundColor: '#dc2626', padding: '3px 10px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                ⚠️ Divergência de {conf.tipoDivergencia}
                              </span>
                              <strong style={{ fontSize: '13px', color: '#0f172a' }}>{conf.nomeConferente}</strong>
                              <span style={{ fontSize: '11px', color: '#64748b', backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>{conf.data}</span>
                              {conf.fornecedor && (
                                <span style={{ fontSize: '11px', color: '#1e3a8a', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                  📦 {conf.fornecedor}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '8px' }}>
                              {conf.valorEsperado !== undefined && (
                                <div style={{ fontSize: '11px', color: '#334155', padding: '6px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #fed7aa' }}>
                                  <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Valor da Nota</div>
                                  <div style={{ fontSize: '15px', fontWeight: '900', color: '#1e3a8a' }}>R$ {conf.valorEsperado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                </div>
                              )}
                              <div style={{ fontSize: '11px', color: '#334155', padding: '6px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #fed7aa' }}>
                                <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Valor Recebido</div>
                                <div style={{ fontSize: '15px', fontWeight: '900', color: '#dc2626' }}>R$ {conf.valorRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                              </div>
                              {conf.valorEsperado !== undefined && (
                                <div style={{ fontSize: '11px', color: '#334155', padding: '6px', backgroundColor: '#fee2e2', borderRadius: '4px', border: '1px solid #fca5a5' }}>
                                  <div style={{ color: '#991b1b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Diferença</div>
                                  <div style={{ fontSize: '15px', fontWeight: '900', color: '#991b1b' }}>R$ {Math.abs(conf.valorRecebido - conf.valorEsperado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                </div>
                              )}
                            </div>
                            {(() => {
                              const pedidoOriginal = conf.pedidoId ? relatoriosPedidosCotacao.find(r => r.id === conf.pedidoId) : null;
                              if (!pedidoOriginal?.pdfFornecedor) return null;
                              return (
                                <div style={{ marginBottom: '8px', padding: '6px 10px', backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '14px' }}>📄</span>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#92400e' }}>{pedidoOriginal.pdfFornecedor.nome}</span>
                                    <span style={{ fontSize: '10px', color: '#64748b' }}>({pedidoOriginal.pdfFornecedor.anexadoEm})</span>
                                  </div>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button onClick={() => setPdfFornecedorVisualizacao({ nome: pedidoOriginal.pdfFornecedor!.nome, conteudo: pedidoOriginal.pdfFornecedor!.conteudo })} style={{ backgroundColor: '#ffffff', color: '#1e3a8a', border: '1px solid #93c5fd', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                                      👁️ Ver
                                    </button>
                                    <a href={pedidoOriginal.pdfFornecedor.conteudo} download={pedidoOriginal.pdfFornecedor.nome} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none' }}>
                                      ⬇️ Baixar
                                    </a>
                                  </div>
                                </div>
                              );
                            })()}
                            {conf.observacoes && (
                              <div style={{ fontSize: '11px', color: '#334155', backgroundColor: '#ffffff', border: '1px solid #fed7aa', borderRadius: '4px', padding: '8px' }}>
                                <strong style={{ color: '#9a3412' }}>📝 Observações:</strong><br />
                                "{conf.observacoes}"
                              </div>
                            )}
                          </div>
                          {podeExcluirPedidoConferencia && (
                          <button 
                            onClick={() => excluirConferencia(conf.id)}
                            style={{ color: '#ef4444', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 }}
                          >
                            ✕
                          </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {pdfFornecedorVisualizacao && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: 999999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div style={{ width: '100%', maxWidth: '900px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '22px' }}>📄</div>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{pdfFornecedorVisualizacao.nome}</strong>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>Visualização do PDF</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <a href={pdfFornecedorVisualizacao.conteudo} download={pdfFornecedorVisualizacao.nome} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none' }}>
                      ⬇️ Baixar
                    </a>
                    <button onClick={() => window.open(pdfFornecedorVisualizacao.conteudo, '_blank')} style={{ backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                      ↗️ Abrir nova aba
                    </button>
                    <button onClick={() => setPdfFornecedorVisualizacao(null)} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '4px', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                      ✕ Fechar
                    </button>
                  </div>
                </div>
                <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#000000' }}>
                  <iframe src={pdfFornecedorVisualizacao.conteudo} title="PDF do fornecedor" style={{ width: '100%', height: '100%', minHeight: '70vh', border: 'none' }} />
                </div>
              </div>
            </div>
          )}

      {tabAtiva === 'relatorios' && (

          <section style={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '20px', marginTop: '20px' }}>
            <button onClick={() => setTabAtiva('pendencias')} style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '5px', padding: '7px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '14px' }}>← Voltar ao sistema</button>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>📈 Relatórios e Estatísticas</h2>
                <input 
                  type="date" 
                  value={dataSelecionada} 
                  onChange={(e) => setDataSelecionada(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '4px', border: '2px solid #cbd5e1', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}
                />
              </div>

              {(() => {
                const dadosData = relatoriosPorData[dataSelecionada] || { pendentes: 0, concluidas: 0, pagamentos: 0, conferencias: 0 };
                const isSelecionadoHoje = dataSelecionada === new Date().toISOString().split('T')[0];
                const economiaPorFornecedor = fornecedoresCotacao.map(fornecedor => {
                  const itensDoFornecedor = itensCotacao.filter(item => {
                    const quantidade = qtdPedirNumero(item);
                    return quantidade > 0 && calcularMenorPrecoItem(item).vencedorFornId === fornecedor.id;
                  });
                  const valores = itensDoFornecedor.map(item => {
                    const quantidade = qtdPedirNumero(item);
                    const precosValidos = Object.values(item.precos).map(preco => parseFloat(preco.replace(',', '.'))).filter(preco => !Number.isNaN(preco) && preco > 0);
                    const menor = calcularMenorPrecoItem(item).menorPreco || 0;
                    const referencia = (precosValidos.length ? Math.max(...precosValidos) : menor) * quantidade;
                    const pago = menor * quantidade;
                    return { referencia, pago };
                  });
                  const referencia = valores.reduce((total, item) => total + item.referencia, 0);
                  const pago = valores.reduce((total, item) => total + item.pago, 0);
                  const economia = referencia - pago;
                  return { fornecedor, referencia, economia, percentual: referencia > 0 ? (economia / referencia) * 100 : 0 };
                }).filter(item => item.referencia > 0);
                
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ backgroundColor: '#f0f9ff', borderLeft: '3px solid #0f172a', padding: '10px 12px', borderRadius: '5px' }}>
                      <h3 style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Tarefas Pendentes</h3>
                      <p style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{isSelecionadoHoje ? setores.reduce((acc, s) => acc + s.tarefas.filter(t => t.status === 'aberta').length, 0) : dadosData.pendentes}</p>
                      <p style={{ fontSize: '10px', color: '#64748b', margin: '4px 0 0 0' }}>Em {setores.length} setores</p>
                    </div>

                    <div style={{ backgroundColor: '#f0fdf4', borderLeft: '3px solid #059669', padding: '10px 12px', borderRadius: '5px' }}>
                      <h3 style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Tarefas Concluídas</h3>
                      <p style={{ fontSize: '18px', fontWeight: '900', color: '#059669', margin: 0 }}>{isSelecionadoHoje ? setores.reduce((acc, s) => acc + s.tarefas.filter(t => t.status === 'concluida').length, 0) : dadosData.concluidas}</p>
                      <p style={{ fontSize: '10px', color: '#64748b', margin: '4px 0 0 0' }}>Completas</p>
                    </div>

                    <div style={{ backgroundColor: '#fef3c7', borderLeft: '3px solid #059669', padding: '10px 12px', borderRadius: '5px' }}>
                      <h3 style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Total Pagamentos</h3>
                      <p style={{ fontSize: '18px', fontWeight: '900', color: '#059669', margin: 0 }}>R$ {isSelecionadoHoje ? ((pagamentos.caixa.reduce((a, i) => a + i.valor, 0) + pagamentos.cheque.reduce((a, i) => a + i.valor, 0) + pagamentos.caben.reduce((a, i) => a + i.valor, 0))).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : dadosData.pagamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p style={{ fontSize: '10px', color: '#64748b', margin: '4px 0 0 0' }}>Registrados</p>
                    </div>

                    <div style={{ backgroundColor: '#fce7f3', borderLeft: '3px solid #2563eb', padding: '10px 12px', borderRadius: '5px' }}>
                      <h3 style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Conferências</h3>
                      <p style={{ fontSize: '18px', fontWeight: '900', color: '#2563eb', margin: 0 }}>{isSelecionadoHoje ? conferencias.length : dadosData.conferencias}</p>
                      <p style={{ fontSize: '10px', color: '#64748b', margin: '4px 0 0 0' }}>Registradas</p>
                    </div>
                  <div style={{ gridColumn: '1 / -1', marginTop: '4px', padding: '12px', backgroundColor: '#ecfdf5', border: '1px solid #86efac', borderRadius: '6px' }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '13px', color: '#065f46' }}>Economia por fornecedor</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                      {economiaPorFornecedor.length === 0 ? <span style={{ fontSize: '11px', color: '#64748b' }}>Nenhuma compra com preços comparáveis.</span> : economiaPorFornecedor.map(item => <div key={item.fornecedor.id} style={{ padding: '9px', backgroundColor: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '5px' }}><strong style={{ display: 'block', fontSize: '11px', color: '#334155' }}>{item.fornecedor.nome}</strong><span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>Referência: R$ {item.referencia.toFixed(2)}</span><strong style={{ display: 'block', marginTop: '3px', fontSize: '13px', color: '#047857' }}>Economia: R$ {item.economia.toFixed(2)} ({item.percentual.toFixed(1)}%)</strong></div>)}
                    </div>
                  </div>
                  </div>
                );
              })()}

              <div style={{ marginTop: '30px', padding: '18px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>Pedidos por fornecedor</h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>Cada produto está no fornecedor com o menor preço.</p>
                  </div>
                  <button onClick={imprimirRelatorioPedidosPorVendedor} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '7px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Imprimir todos</button>
                </div>
                {fornecedoresCotacao.map(fornecedor => {
                  const itensDoFornecedor = itensCotacao.filter(item => {
                    const quantidade = qtdPedirNumero(item);
                    return quantidade > 0 && calcularMenorPrecoItem(item).vencedorFornId === fornecedor.id;
                  });
                  if (itensDoFornecedor.length === 0) return null;
                  return (
                    <div key={fornecedor.id} style={{ marginBottom: '12px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', padding: '8px 10px', backgroundColor: '#0f172a' }}>
                        <strong style={{ color: '#ffffff', fontSize: '12px' }}>{fornecedor.nome}</strong>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={() => imprimirPedidoIndividual(fornecedor)} style={{ backgroundColor: '#ffffff', color: '#0f172a', border: 'none', borderRadius: '3px', padding: '4px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Imprimir pedido</button>
                          <button onClick={() => enviarPedidoWhatsAppPdf(fornecedor, itensDoFornecedor)} style={{ backgroundColor: '#25d366', color: '#ffffff', border: 'none', borderRadius: '3px', padding: '4px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>WhatsApp PDF</button>
                        </div>
                      </div>
                  {itensDoFornecedor.map(item => <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: '8px', padding: '7px 10px', borderBottom: '1px solid #e2e8f0', fontSize: '11px' }}><span>{item.produto}</span><span>{item.unit}</span><strong style={{ textAlign: 'right' }}>{item.qtdPedir}</strong></div>)}
                </div>
              );
            })}
            {itensCotacao.filter(item => qtdPedirNumero(item) > 0 && !calcularMenorPrecoItem(item).vencedorFornId).length > 0 && <div style={{ padding: '10px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '4px', fontSize: '11px', color: '#9a3412' }}>Existem produtos com quantidade preenchida, mas ainda sem preço para definir o fornecedor.</div>}
          </div>

          <div style={{ marginTop: '30px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 12px 0', textTransform: 'uppercase' }}>Resumo por Setor</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f1f5f9' }}>
                  <tr>
                    <th style={{ padding: '10px 12px', fontSize: '11px', color: '#0f172a', fontWeight: 'bold', borderBottom: '2px solid #cbd5e1' }}>Setor</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px', color: '#0f172a', fontWeight: 'bold', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>Tarefas Abertas</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px', color: '#0f172a', fontWeight: 'bold', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>Tarefas Concluídas</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px', color: '#0f172a', fontWeight: 'bold', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>Total</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px', color: '#0f172a', fontWeight: 'bold', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>Taxa Conclusão</th>
                  </tr>
                </thead>
                <tbody>
                  {setores.map((setor, idx) => {
                    const abertas = setor.tarefas.filter(t => t.status === 'aberta').length;
                    const concluidas = setor.tarefas.filter(t => t.status === 'concluida').length;
                    const total = setor.tarefas.length;
                    const taxa = total === 0 ? 0 : Math.round((concluidas / total) * 100);
                    return (
                      <tr key={setor.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '12px', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>{nomeSetorSemEmoji(setor.nome)}</td>
                        <td style={{ padding: '12px', fontSize: '12px', textAlign: 'center', color: '#ef4444', fontWeight: 'bold' }}>{abertas}</td>
                        <td style={{ padding: '12px', fontSize: '12px', textAlign: 'center', color: '#059669', fontWeight: 'bold' }}>{concluidas}</td>
                        <td style={{ padding: '12px', fontSize: '12px', textAlign: 'center', color: '#0f172a', fontWeight: 'bold' }}>{total}</td>
                        <td style={{ padding: '12px', fontSize: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${taxa}%`, height: '100%', backgroundColor: taxa >= 75 ? '#059669' : taxa >= 50 ? '#ea580c' : '#ef4444', transition: 'width 0.3s ease' }}></div>
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b' }}>{taxa}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tabAtiva === 'seguranca' && (
        <section style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '20px', border: '1px solid #cbd5e1' }}>
          <button onClick={() => setTabAtiva('pendencias')} style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '5px', padding: '7px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '14px' }}>← Voltar ao sistema</button>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px', textTransform: 'uppercase' }}>🛡 Segurança</h2>
          <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>Senhas, usuários e bloqueio do sistema. Fica nesta tela até você voltar.</p>
          {statusSalvoSeguranca && (
            <div style={{ position: 'sticky', top: '8px', zIndex: 20, marginBottom: '16px', padding: '12px 14px', backgroundColor: statusSalvoSeguranca.startsWith('Salvando') ? '#fffbeb' : '#d1fae5', color: statusSalvoSeguranca.startsWith('Salvando') ? '#92400e' : '#065f46', border: `2px solid ${statusSalvoSeguranca.startsWith('Salvando') ? '#fcd34d' : '#10b981'}`, borderRadius: '8px', fontSize: '14px', fontWeight: '900' }}>
              {statusSalvoSeguranca}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '16px' }}>
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', backgroundColor: '#f8fafc' }}>
              <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', marginBottom: '6px' }}>Usuário ativo</strong>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f766e' }}>{usuarioLogado?.nome}</div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>{usuarioLogado?.tipo === 'admin' ? 'Administrador' : 'Usuário do sistema'}</span>
              <button onClick={fazerLogout} style={{ marginTop: '12px', width: '100%', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                🔒 Sair / Bloquear
              </button>
            </div>

            <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px' }}>
              <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', marginBottom: '8px' }}>Minha senha</strong>
              <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#64748b' }}>
                {usuarioLogado && senhasUsuarios[usuarioLogado.id]
                  ? 'Altere a senha pessoal. Ela vale em qualquer computador.'
                  : 'Defina uma senha só sua. Depois ela substitui a senha padrão neste usuário.'}
              </p>
              <input type="password" placeholder="Nova senha" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginBottom: '8px' }} />
              <input type="password" placeholder="Confirmar nova senha" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginBottom: '8px' }} />
              {erroSenha && (
                <div style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>{erroSenha}</div>
              )}
              <button onClick={salvarMinhaSenha} disabled={salvandoSenha} style={{ width: '100%', backgroundColor: '#0f766e', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '9px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                {salvandoSenha ? 'Salvando...' : 'Salvar senha'}
              </button>
            </div>
          </div>

          {usuarioLogado?.tipo === 'admin' && (
            <>
            <div style={{ border: '1px solid #86efac', borderRadius: '8px', padding: '16px', marginBottom: '16px', backgroundColor: '#f0fdf4' }}>
              <strong style={{ display: 'block', fontSize: '13px', color: '#065f46', marginBottom: '6px' }}>＋ Adicionar novo usuário</strong>
              <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#047857' }}>Marque as permissões: é isso que a pessoa vai poder abrir no sistema.</p>
              <input
                type="text"
                placeholder="Nome do usuário"
                value={novoUsuarioNome}
                onChange={e => setNovoUsuarioNome(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid #86efac', fontSize: '13px', marginBottom: '8px' }}
              />
              <input
                type="password"
                placeholder="Senha inicial (opcional — se vazio, usa a senha padrão)"
                value={novoUsuarioSenha}
                onChange={e => setNovoUsuarioSenha(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid #86efac', fontSize: '13px', marginBottom: '12px' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                {PERMISSOES_OPCOES.map(opcao => (
                  <label key={opcao.chave} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px', backgroundColor: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '12px', color: '#0f172a', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={novoUsuarioPermissoes[opcao.chave]}
                      onChange={e => setNovoUsuarioPermissoes(atuais => ({ ...atuais, [opcao.chave]: e.target.checked }))}
                      style={{ marginTop: '2px' }}
                    />
                    <span>
                      <strong style={{ display: 'block' }}>{opcao.nome}</strong>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>{opcao.detalhe}</span>
                    </span>
                  </label>
                ))}
              </div>
              <div style={{ fontSize: '11px', color: '#065f46', marginBottom: '10px', fontWeight: 'bold' }}>
                Vai poder acessar: {rotuloPermissoes(novoUsuarioPermissoes)}
              </div>
              {erroNovoUsuario && (
                <div style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>{erroNovoUsuario}</div>
              )}
              <button onClick={adicionarNovoUsuario} style={{ width: '100%', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                Salvar novo usuário
              </button>
            </div>

            <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', marginBottom: '8px' }}>Usuários e permissões</strong>
              <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#64748b' }}>Marque ou desmarque o que cada pessoa pode abrir. A mudança vale no próximo acesso e também agora, se ela estiver logada neste computador.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {usuariosDoSistema.map(usuario => (
                  <div key={usuario.id} style={{ padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <div style={{ flex: 1, minWidth: '180px' }}>
                        <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a' }}>{usuario.nome}</strong>
                        <span style={{ display: 'block', fontSize: '11px', color: '#1e40af', margin: '4px 0' }}>
                          Pode acessar: {rotuloPermissoes(usuario.permissoes)}
                        </span>
                        {usuarioPermissaoSalvaId === usuario.id && statusSalvoSeguranca.startsWith('✓') && (
                          <span style={{ display: 'inline-block', marginBottom: '4px', backgroundColor: '#059669', color: '#ffffff', borderRadius: '4px', padding: '2px 8px', fontSize: '10px', fontWeight: 'bold' }}>✓ Gravado</span>
                        )}
                        <span style={{ fontSize: '11px', color: senhasUsuarios[usuario.id] ? '#047857' : '#b45309' }}>
                          {senhasUsuarios[usuario.id] ? '✓ Senha pessoal cadastrada' : '⚠ Ainda usa a senha padrão'}
                        </span>
                      </div>
                      {usuario.id !== usuarioLogado.id && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button onClick={() => redefinirSenhaUsuario(usuario.id)} style={{ backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fdba74', borderRadius: '5px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Voltar à senha padrão
                          </button>
                          {!USUARIOS_SISTEMA.some(oficial => oficial.id === usuario.id) && (
                            <button onClick={() => removerUsuarioCadastrado(usuario.id)} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '5px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                              Remover
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '6px' }}>
                      {PERMISSOES_OPCOES.map(opcao => (
                        <label key={`${usuario.id}-${opcao.chave}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#0f172a', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px 8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(usuario.permissoes[opcao.chave])}
                            onChange={e => alterarPermissaoUsuario(usuario.id, opcao.chave, e.target.checked)}
                          />
                          {opcao.nome}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </>
          )}

          <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px' }}>
            <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', marginBottom: '6px' }}>Proteção de {usuarioLogado?.nome}</strong>
            <span style={{ fontSize: '11px', color: '#64748b' }}>{historicoBackupsUsuario.length} visita(s) protegida(s) neste navegador</span>
            <div style={{ marginTop: '12px' }}>
              {historicoBackupsUsuario.length === 0 ? (
                <span style={{ fontSize: '11px', color: '#64748b' }}>Nenhum backup deste usuário foi registrado ainda.</span>
              ) : (
                historicoBackupsUsuario.map((backup, indice) => {
                  const tarefas = Array.isArray(backup.setores) ? backup.setores.reduce((total: number, setor: Setor) => total + setor.tarefas.length, 0) : 0;
                  return (
                    <div key={`${backup.salvoEm}-${indice}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: indice < historicoBackupsUsuario.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: '11px', color: '#334155' }}>{new Date(backup.salvoEm).toLocaleString('pt-BR')}</strong>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>{tarefas} tarefa(s) • atualização {backup.ultimaAtualizacao || 'não informada'}</span>
                      </div>
                      <button onClick={() => restaurarBackupDoUsuarioAtual(backup)} style={{ backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fdba74', borderRadius: '5px', padding: '5px 9px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Restaurar esta visita</button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      )}

      {relatorioPagamentosVisualizacao && (
        <div className="relatorio-pagamentos-modal" style={{ position: 'fixed', inset: 0, zIndex: 10000, backgroundColor: 'rgba(15,23,42,0.75)', padding: '20px', overflowY: 'auto' }}>
          <style>{`@media print { body * { visibility: hidden !important; } .relatorio-pagamentos-modal, .relatorio-pagamentos-modal * { visibility: visible !important; } .relatorio-pagamentos-modal { position: absolute !important; inset: 0 !important; background: #ffffff !important; padding: 0 !important; overflow: visible !important; } .relatorio-pagamentos-conteudo { max-width: none !important; padding: 0 !important; margin: 0 !important; } .relatorio-pagamentos-acoes { display: none !important; } }`}</style>
          <div className="relatorio-pagamentos-conteudo" style={{ backgroundColor: '#ffffff', maxWidth: '850px', margin: '0 auto', padding: '28px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
              <div><h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a' }}>Relatório Gerencial de Pagamentos</h2><small style={{ display: 'block', marginTop: '4px', color: '#64748b', fontWeight: 'bold' }}>Emissão: {relatorioPagamentosVisualizacao.dataRotulo || new Date().toLocaleString('pt-BR')} • Solicitante: Ramara Matias</small></div>
              <div style={{ border: '2px solid #0f172a', backgroundColor: '#f8fafc', padding: '10px 18px', borderRadius: '6px', textAlign: 'right' }}><small style={{ display: 'block', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>Total Geral</small><strong style={{ fontSize: '20px', color: '#059669' }}>R$ {relatorioPagamentosVisualizacao.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
            </div>
            {(['caixa', 'cheque', 'caben'] as const).map((tipo, indice) => {
              const itens = relatorioPagamentosVisualizacao.dados[tipo];
              const subtotal = itens.reduce((total, item) => total + item.valor, 0);
              if (itens.length === 0) return null;
              const nomeTipo = tipo === 'caixa' ? 'Caixa' : tipo === 'cheque' ? 'Cheque' : 'CABEN';
              const tituloColuna = tipo === 'cheque' ? 'Favorecido / Motivo' : 'Descrição';
              return <section key={tipo} style={{ marginTop: '18px' }}><h3 style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '8px 10px', margin: 0, fontSize: '13px', borderRadius: '4px', textTransform: 'uppercase' }}>{indice + 1}. {nomeTipo} • Subtotal: R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3><table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}><thead><tr><th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}>{tituloColuna}</th><th style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}>Valor (R$)</th></tr></thead><tbody>{itens.map(item => <tr key={item.id}><td style={{ padding: '8px 10px', border: '1px solid #e2e8f0' }}>{item.descricao}</td><td style={{ padding: '8px 10px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 'bold' }}>R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>)}</tbody></table></section>;
            })}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px', paddingBottom: '8px' }}>
              <div style={{ width: '360px', textAlign: 'center', borderTop: '2px solid #0f172a', paddingTop: '8px', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>Visto Autorização Financeiro</div>
            </div>
            <div className="relatorio-pagamentos-acoes" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
              <button onClick={() => setRelatorioPagamentosVisualizacao(null)} style={{ padding: '8px 14px' }}>Fechar</button>
              <button onClick={() => enviarRelatorioPagamentosPdf(relatorioPagamentosVisualizacao.dados, relatorioPagamentosVisualizacao.valorTotal, relatorioPagamentosVisualizacao.dataRotulo)} style={{ padding: '8px 14px', border: 'none', backgroundColor: '#25d366', color: '#ffffff', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Enviar WhatsApp PDF</button>
              <button onClick={() => window.print()} style={{ padding: '8px 14px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', fontWeight: 'bold' }}>🖨️ Imprimir</button>
            </div>
          </div>
        </div>
      )}

      {relatorioElieudaVisualizacao && (
        <div className="relatorio-elieuda-modal" style={{ position: 'fixed', inset: 0, zIndex: 10001, backgroundColor: 'rgba(15,23,42,0.75)', padding: '20px', overflowY: 'auto' }}>
          <style>{`@media print { body * { visibility: hidden !important; } .relatorio-elieuda-modal, .relatorio-elieuda-modal * { visibility: visible !important; } .relatorio-elieuda-modal { position: absolute !important; inset: 0 !important; background: #ffffff !important; padding: 0 !important; overflow: visible !important; } .relatorio-elieuda-conteudo { max-width: none !important; padding: 0 !important; margin: 0 !important; } .relatorio-elieuda-acoes { display: none !important; } }`}</style>
          <div className="relatorio-elieuda-conteudo" style={{ backgroundColor: '#ffffff', maxWidth: '850px', margin: '0 auto', padding: '28px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>PEDIDO DONA ELIEUDA</h2>
                <small style={{ display: 'block', marginTop: '4px', color: '#64748b', fontWeight: 'bold' }}>Emissão: {new Date().toLocaleString('pt-BR')} • Solicitante: Ramara Matias</small>
              </div>
              <strong style={{ border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '6px', backgroundColor: '#f8fafc' }}>Itens solicitados: {relatorioElieudaVisualizacao.itens.length}</strong>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Produto / Item</th>
                  <th style={{ padding: '10px' }}>Unid</th>
                  <th style={{ padding: '10px' }}>Terça-feira</th>
                  <th style={{ padding: '10px' }}>Quinta-feira</th>
                  <th style={{ padding: '10px' }}>Sábado</th>
                </tr>
              </thead>
              <tbody>
                {relatorioElieudaVisualizacao.itens.map(item => { 
                  const quantidade = relatorioElieudaVisualizacao.quantidades[item.produto] || {}; 
                  return (
                    <tr key={item.produto}>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>{item.produto}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{item.unit}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{quantidade.terca || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{quantidade.quinta || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{quantidade.sabado || '-'}</td>
                    </tr>
                  ); 
                })}
              </tbody>
            </table>
            <div className="relatorio-elieuda-acoes" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
              <button onClick={() => setRelatorioElieudaVisualizacao(null)} style={{ padding: '8px 14px' }}>Fechar</button>
              <button onClick={() => window.print()} style={{ padding: '8px 14px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', fontWeight: 'bold' }}>🖨️ Salvar / Gerar PDF</button>
            </div>
          </div>
        </div>
      )}

      {pedidoConferenciaVisualizacao && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10002, backgroundColor: 'rgba(15,23,42,0.75)', padding: '20px', overflowY: 'auto' }}>
          <div style={{ backgroundColor: '#ffffff', maxWidth: '850px', margin: '0 auto', padding: '28px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #0f172a', paddingBottom: '12px' }}>
              <div>
                <h2 style={{ margin: 0 }}>Pedido de compra</h2>
                <small>Data: {pedidoConferenciaVisualizacao.data} • Solicitante: Ramara Matias</small>
              </div>
              <strong>R$ {pedidoConferenciaVisualizacao.totalGeral.toFixed(2)}</strong>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '18px' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                  <th style={{ padding: '9px', textAlign: 'left' }}>Produto</th>
                  <th style={{ padding: '9px' }}>Uni/Kg</th>
                  <th style={{ padding: '9px' }}>Quantidade</th>
                  <th style={{ padding: '9px', textAlign: 'right' }}>Valor unitário</th>
                  <th style={{ padding: '9px', textAlign: 'right' }}>Valor total</th>
                  <th style={{ padding: '9px' }}>Fornecedor</th>
                </tr>
              </thead>
              <tbody>
                {pedidoConferenciaVisualizacao.itens.map((item, indice) => (
                  <tr key={`${pedidoConferenciaVisualizacao.id}-${indice}`}>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{item.produto}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{item.unit}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{item.quantidade}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'right' }}>R$ {item.valorUnitario.toFixed(2)}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold' }}>R$ {item.valorTotal.toFixed(2)}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{item.fornecedor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setPedidoConferenciaVisualizacao(null)} style={{ padding: '8px 14px' }}>Fechar</button>
            </div>
          </div>
        </div>
      )}

   
      {pedidoEmVisualizacao && (
        <div className="pedido-impressao-modal" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998, padding: '20px' }}>
          <style>{`@media print { body * { visibility: hidden !important; } .pedido-impressao-modal, .pedido-impressao-modal * { visibility: visible !important; } .pedido-impressao-modal { position: absolute !important; inset: 0 !important; display: block !important; background: #ffffff !important; padding: 0 !important; } .pedido-impressao-conteudo { max-width: none !important; max-height: none !important; overflow: visible !important; padding: 0 !important; } .acoes-impressao { display: none !important; } }`}</style>
          <div className="pedido-impressao-conteudo" style={{ backgroundColor: '#ffffff', borderRadius: '8px', maxWidth: '760px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '18px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#0f172a' }}>Pedido de compra</h2>
                <h3 style={{ margin: '5px 0 0', color: '#475569' }}>{pedidoEmVisualizacao.fornecedor.nome}</h3>
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748b' }}>Prévia do pedido individual</p>
              </div>
              <button onClick={() => setPedidoEmVisualizacao(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '22px', cursor: 'pointer' }}>×</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Produto</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Uni/Kg</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Quantidade</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Valor unitário</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Valor total</th>
                </tr>
              </thead>
              <tbody>
                {pedidoEmVisualizacao.itens.length > 0 ? pedidoEmVisualizacao.itens.map(item => {
                  const precoUnitario = calcularMenorPrecoItem(item).menorPreco || 0;
                  const totalItem = precoUnitario * qtdPedirNumero(item);
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px' }}>{item.produto}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{item.unit}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{item.qtdPedir}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>R$ {precoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>R$ {totalItem.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '14px', textAlign: 'center', color: '#64748b' }}>Nenhum item com quantidade preenchida.</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>
              Valor total: R$ {totalPedidoVisualizacao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="acoes-impressao" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '18px' }}>
              <button onClick={() => setPedidoEmVisualizacao(null)} style={{ padding: '8px 14px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', borderRadius: '4px', cursor: 'pointer' }}>Fechar</button>
              <button onClick={() => enviarPedidoWhatsAppPdf(pedidoEmVisualizacao.fornecedor, pedidoEmVisualizacao.itens)} style={{ padding: '8px 14px', border: 'none', backgroundColor: '#25d366', color: '#ffffff', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Enviar WhatsApp PDF</button>
              <button onClick={() => window.print()} style={{ padding: '8px 14px', border: 'none', backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Imprimir</button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalImportacao && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', maxWidth: '500px', width: '100%', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3>Importar Lote</h3>
            <textarea rows={6} placeholder="Produto 1; Kg&#10;Produto 2; Und" value={textoImportacao} onChange={e => setTextoImportacao(e.target.value)} style={{ width: '100%', padding: '8px', fontFamily: 'monospace', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setMostrarModalImportacao(false)} style={{ padding: '6px 12px' }}>Cancelar</button>
              <button onClick={executarImportacaoEmLote} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px' }}>Importar ({linhasImportadasContador})</button>
            </div>
          </div>
        </div>
      )}

        {mostrarRobo && (
            <div style={{ position: 'fixed', right: '20px', bottom: '82px', zIndex: 10004, width: 'min(360px, calc(100vw - 32px))', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', boxShadow: '0 12px 35px rgba(15,23,42,0.22)', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>RM Robô Assistente</strong>
                <button onClick={() => setMostrarRobo(false)} aria-label="Fechar robô" style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '20px', cursor: 'pointer' }}>×</button>
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {conversaRobo.map((mensagem, indice) => (
                  <div key={`${mensagem.autor}-${indice}`} style={{ alignSelf: mensagem.autor === 'voce' ? 'flex-end' : 'flex-start', maxWidth: '88%', padding: '8px 10px', borderRadius: '8px', backgroundColor: mensagem.autor === 'voce' ? '#e0f2fe' : '#f1f5f9', color: '#0f172a', fontSize: '12px' }}>{mensagem.texto}</div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '6px', padding: '10px', borderTop: '1px solid #e2e8f0' }}>
                <input value={mensagemRobo} onChange={event => setMensagemRobo(event.target.value)} onKeyDown={event => event.key === 'Enter' && conversarComRobo()} placeholder="Digite um comando..." style={{ flex: 1, minWidth: 0, padding: '9px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }} />
                <button onClick={conversarComRobo} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0 12px', fontWeight: 'bold', cursor: 'pointer' }}>Enviar</button>
              </div>
            </div>
          )}

          <button 
            onClick={() => setMostrarRobo(!mostrarRobo)} 
            aria-label="Abrir robô assistente" 
            style={{ position: 'fixed', right: '20px', bottom: '20px', zIndex: 10005, width: '52px', height: '52px', padding: 0, borderRadius: '50%', border: '3px solid #ffffff', backgroundColor: '#0f766e', cursor: 'pointer', boxShadow: '0 5px 18px rgba(15,23,42,0.3)', overflow: 'hidden' }}
          >
            <img src="/rm-icon.png" alt="RM" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </button>
<footer className="mt-8 border-t border-slate-200 bg-white px-7 py-4 text-center">
            <p className="m-0 text-sm font-semibold text-slate-600">© 2026 RM Sistema • Desenvolvido por Ramara Matias</p>
          </footer>
        </main>
      </div>
      {mostrarModalSenha && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 10030, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#ffffff', borderRadius: '14px', padding: '24px', boxShadow: '0 20px 40px rgba(15,23,42,0.25)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '18px', fontWeight: '900' }}>Minha senha</h3>
            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '13px' }}>
              {usuarioLogado && senhasUsuarios[usuarioLogado.id]
                ? 'Altere a senha pessoal deste usuário. Ela vale em qualquer computador.'
                : 'Defina uma senha só sua. Depois ela substitui a senha padrão neste usuário.'}
            </p>
            <input
              type="password"
              placeholder="Nova senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', marginBottom: '8px' }}
            />
            <input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', marginBottom: '10px' }}
            />
            {erroSenha && (
              <div style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>
                {erroSenha}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginBottom: usuarioLogado?.tipo === 'admin' ? '16px' : 0 }}>
              <button onClick={() => { setMostrarModalSenha(false); setNovaSenha(''); setConfirmarSenha(''); setErroSenha(''); }} style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                Agora não
              </button>
              <button onClick={salvarMinhaSenha} disabled={salvandoSenha} style={{ backgroundColor: '#0f766e', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                {salvandoSenha ? 'Salvando...' : 'Salvar senha'}
              </button>
            </div>
            {usuarioLogado?.tipo === 'admin' && (
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <strong style={{ display: 'block', fontSize: '12px', color: '#0f172a', marginBottom: '8px' }}>Redefinir senha de outro usuário</strong>
                <select value={usuarioResetSenha} onChange={(e) => setUsuarioResetSenha(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginBottom: '8px', backgroundColor: '#f8fafc' }}>
                  <option value="">Selecione o usuário...</option>
                  {usuariosDoSistema.filter(u => u.id !== usuarioLogado.id).map(u => (
                    <option key={u.id} value={u.id}>{u.nome}{senhasUsuarios[u.id] ? '' : ' (sem senha própria)'}</option>
                  ))}
                </select>
                <button onClick={redefinirSenhaUsuario} style={{ width: '100%', backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fdba74', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Voltar este usuário para a senha padrão
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;