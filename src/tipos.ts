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
export type SenhasUsuarios = { [usuarioId: string]: string };
export type LinhaPedidoPdf = { produto: string; unit: string; quantidade: string; valorUnitario: number; valorTotal: number };
export type LinhaPdfPagamento = { tipo: 'secao' | 'item'; rotulo: string; valor?: string };
