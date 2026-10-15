export type StatusTarefa = 'aberta' | 'concluida';
export type TipoUsuario = 'admin' | 'gabriela' | 'assuncao' | 'luzia' | 'leandro' | 'idenaldo' | 'manutencao' | 'usuario';
export interface Tarefa { id: string; texto: string; status: StatusTarefa; concluida?: boolean; criadaEm: string; concluidaEm?: string; criador: string; dataCriacao: string; responsavel?: string; prioridade?: 'baixa' | 'media' | 'alta' | 'urgente'; foto?: string; }
export interface TarefaDeletada { id: string; texto: string; status: StatusTarefa; criadaEm: string; criador: string; deletadaEm: string; deletadaPor: string; setorId: string; foto?: string; }
export interface Setor { id: string; nome: string; cor: string; tarefas: Tarefa[]; }
export interface ItemChecklist { id: string; texto: string; concluido: boolean; criadoEm: string; atualizadoEm: string; }
export interface ItemPagamento { id: string; descricao: string; valor: number; data?: string; }
export interface PagamentosState { caixa: ItemPagamento[]; cheque: ItemPagamento[]; caben: ItemPagamento[]; }
export interface LotePagamentoHistorico { id: string; dataFechamento: string; totalGeral: number; totalCaixa: number; totalCheque: number; totalCaben: number; dados: PagamentosState; }
export interface QuantidadeDia { terca?: string; quinta?: string; sabado?: string; }
export interface QuantidadesElieuda { [produto: string]: QuantidadeDia; }
export interface ProdutoElieuda { produto: string; unit: string; }
export interface ItemCotacao { id: string; produto: string; unit: string; estoqueAtual: string; qtdSugerida?: string; qtdPedir: string; menorCusto?: number; ultimoPrecoCompra?: number; precos: { [fornecedorId: string]: string }; atualizadoEm?: string; secao?: string; fornecedorId?: string; }
export type TipoPessoaFornecedor = 'fisica' | 'juridica';
export interface FornecedorCotacao { id: string; nome: string; tipoPessoa?: TipoPessoaFornecedor; razaoSocial?: string; nomeFantasia?: string; cnpj?: string; nomePessoaFisica?: string; cpf?: string; endereco?: string; cidade?: string; diasEntrega?: string; }
export const tipoPessoaFornecedor = (fornecedor: Pick<FornecedorCotacao, 'tipoPessoa' | 'cpf' | 'cnpj'>): TipoPessoaFornecedor => {
  if (fornecedor.tipoPessoa === 'fisica' || fornecedor.tipoPessoa === 'juridica') return fornecedor.tipoPessoa;
  if (fornecedor.cpf && !fornecedor.cnpj) return 'fisica';
  return 'juridica';
};
export type TipoDivergencia = 'valor' | 'produto' | 'envio_indevido' | 'kg' | 'kg_mais' | 'kg_menos' | 'valor_mais' | 'valor_menos' | 'quantidade' | '';
export const rotuloTipoDivergencia = (tipo?: string) => {
  const mapa: Record<string, string> = {
    valor: 'Produto',
    produto: 'Produto',
    envio_indevido: 'Envio indevido',
    kg: 'Quilo',
    kg_mais: 'Quilo a mais',
    kg_menos: 'Quilo a menos',
    valor_mais: 'Valor a mais',
    valor_menos: 'Valor a menos',
    quantidade: 'Quantidade'
  };
  return mapa[tipo || ''] || tipo || '';
};

export function diferencaValorConferencia(recebido?: number, esperado?: number) {
  if (esperado === undefined || esperado === null || Number.isNaN(Number(esperado)) || Number(esperado) <= 0) return null;
  const cents = Math.round((Number(recebido || 0) - Number(esperado)) * 100);
  const valor = Math.abs(cents) / 100;
  const texto = valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (cents === 0) return { tipo: 'igual' as const, valor: 0, rotulo: 'Valores iguais', detalhe: 'O recebido bateu com o valor que comprei.' };
  if (cents > 0) return { tipo: 'mais' as const, valor, rotulo: `Valor a mais: R$ ${texto}`, detalhe: `Recebido ficou R$ ${texto} acima do valor que comprei.` };
  return { tipo: 'menos' as const, valor, rotulo: `Valor a menos: R$ ${texto}`, detalhe: `Recebido ficou R$ ${texto} abaixo do valor que comprei.` };
}
export interface RegistroConferencia { id: string; data: string; nomeConferente: string; valorRecebido: number; observacoes: string; houveDivergencia: boolean; tipoDivergencia?: TipoDivergencia; pedidoId?: string; fornecedor?: string; categoria?: string; valorEsperado?: number; itensConferidos?: { produto: string; unit: string; quantidade: string; valorUnitario: number; valorTotal: number; fornecedor: string; bonificado?: boolean }[]; conferentePor?: string; dataPreenchimento?: string; veioBonificacao?: boolean; notaBonificada?: boolean; }
export interface ArquivoConferencia { id: string; nome: string; dataUpload: string; uploadPor: string; conteudo: string; }
export interface DadosConferenciaFornecedor { fornecedorId: string; fornecedorNome: string; valorNota: number; valorRecebido: number; divergencia: boolean; conferentePor: string; dataPreenchimento: string; }
export interface PedidoCompra { id: string; data: string; fornecedorId: string; fornecedorNome: string; itens: { produtoId: string; produto: string; quantidade: number; precoUnitario: number; total: number }[]; totalGeral: number; status: 'pendente' | 'enviado' | 'recebido'; }
export interface RelatorioPedidoCotacao { id: string; data: string; itens: { produto: string; unit: string; quantidade: string; valorUnitario: number; valorTotal: number; fornecedor: string; bonificado?: boolean }[]; totalGeral: number; enviadoConferencia?: boolean; categoria?: string; pdfFornecedor?: { nome: string; conteudo: string; anexadoEm: string; valor?: number; observacao?: string }; bonificacaoResolvida?: boolean; veioBonificacao?: boolean; }
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
export type TurnoProducao = 'Manhã' | 'Tarde';
export type TipoLancamentoProducao = 'Produção' | 'Encomenda';
export type RotaRevenda = 'Cidade' | 'Sítio';
export interface LancamentoProducao {
  id: string;
  data: string;
  turno: TurnoProducao;
  tipo: TipoLancamentoProducao;
  produto: string;
  telas: string;
  unidTela: string;
  totalUnid: string;
  peso: string;
}
export interface ProdutoRota { nome: string; preco: number; }
export interface LancamentoRota {
  id: string;
  rota: RotaRevenda;
  data: string;
  vendedor: string;
  cliente: string;
  produto: string;
  levou: string;
  devBom: string;
  devRuim: string;
  vendeu: number;
  valUnit: number;
  subtotal: number;
  pago: number;
}
export type OrigemDeposito = 'Sítio' | 'Cidade';
export interface LancamentoDeposito {
  id: string;
  data: string;
  origem: OrigemDeposito;
  destino: string;
  forma: string;
  valor: number;
  obs: string;
}
export type TipoMovimentoCaixa = 'entrada' | 'saida';
export type NaturezaMovimentoCaixa = 'aporte' | 'reposicao' | 'compra' | 'emprestimo' | 'debito';
export interface MovimentoCaixaOperacional {
  id: string;
  criadoEm: string;
  tipo: TipoMovimentoCaixa;
  natureza: NaturezaMovimentoCaixa;
  descricao: string;
  valor: number;
  responsavel: string;
}
export const SALDO_INICIAL_CAIXA_OPERACIONAL = 3700;
export interface Usuario { id: string; nome: string; tipo: TipoUsuario; permissoes: { pendencias: boolean; conferencias: boolean; cotacao: boolean; pagamentos: boolean; relatorios: boolean; elieuda: boolean; manutencao: boolean; dados: boolean; producao: boolean; caixaOperacional: boolean; estoque: boolean; conciliacao: boolean; }; }
export type SenhasUsuarios = { [usuarioId: string]: string };
export type LinhaPedidoPdf = { produto: string; unit: string; quantidade: string; valorUnitario: number; valorTotal: number; bonificado?: boolean };
export type LinhaPdfPagamento = { tipo: 'secao' | 'item'; rotulo: string; valor?: string };
export type MarcaConciliacao = 'nenhuma' | 'vermelha' | 'verde';
export interface ItemLoteConciliacao {
  produto: string;
  quantidade: number;
  unidade: string;
  precoNf: number;
  precoCeasa: number | null;
  semPreco: boolean;
  detalhe: string;
  marca: MarcaConciliacao;
  justificativa: string;
}
export interface LoteConciliacao {
  id: string;
  arquivadoEm: string;
  mes: string;
  empresa: string;
  numeroNf: string;
  dataNf: string;
  dataCeasa: string;
  origem: string;
  totalNf: number;
  totalCeasa: number;
  margemValor: number;
  margemPct: number | null;
  imagemRelatorioId?: string;
  linhas: ItemLoteConciliacao[];
}
