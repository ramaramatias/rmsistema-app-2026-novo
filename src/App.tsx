import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AbaDados } from './abas/dados/AbaDados';
import { AbaCotacao } from './abas/cotacao/AbaCotacao';
import { AbaElieuda } from './abas/elieuda/AbaElieuda';
import { AbaManutencao } from './abas/manutencao/AbaManutencao';
import { AbaCadastroProdutos } from './abas/cadastro-produtos/AbaCadastroProdutos';
import { AbaCadastroFornecedores } from './abas/cadastro-fornecedores/AbaCadastroFornecedores';
import { AbaCompras } from './abas/compras/AbaCompras';
import { AbaPendencias } from './abas/pendencias/AbaPendencias';
import { AbaConferencia } from './abas/conferencia/AbaConferencia';
import { AbaPagamentos } from './abas/pagamentos/AbaPagamentos';
import { AbaReciboComprador } from './abas/recibo-comprador/AbaReciboComprador';
import { AbaRelatorios } from './abas/relatorios/AbaRelatorios';
import { AbaSeguranca } from './abas/seguranca/AbaSeguranca';
import { AbaProducao } from './abas/producao/AbaProducao';
import { montarItensEmbalagens, montarItensLaticinios } from './catalogo/secoesDados';
import { aplicarCustosRecebidos, aplicarMargemSecao, custosCatalogoVazio, lerCustosCatalogo, registrarCustosDoPedido, type CustosCatalogoState } from './catalogo/custosCatalogo';
import { config } from '../config';
import type {
  ArquivoConferencia,
  DadosConferenciaFornecedor,
  FornecedorCotacao,
  ItemCotacao,
  LotePagamentoHistorico,
  LancamentoProducao,
  LancamentoRota,
  LancamentoDeposito,
  OrdemManutencao,
  PagamentosState,
  PedidoCompra,
  ProdutoElieuda,
  QuantidadesElieuda,
  RegistroConferencia,
  RelatorioPedidoCotacao,
  SenhasUsuarios,
  TipoDivergencia,
  Setor,
  StatusOrdemManutencao,
  StatusTarefa,
  Tarefa,
  TarefaDeletada,
  Usuario
} from './tipos';
import {
  FORNECEDORES_OFICIAIS,
  ITENS_COTACAO_OFICIAIS,
  LOCAIS_MANUTENCAO,
  MOTIVOS_COMPRA_PAUSA,
  MOTIVOS_PAUSA_MANUTENCAO,
  PAGAMENTOS_PADRAO,
  PERMISSOES_OPCOES,
  PRODUTOS_PADARIA_PADRAO,
  CONTAS_DEPOSITO_PADRAO,
  SETORES_PADRAO,
  TIPOS_MANUTENCAO,
  USUARIOS_SISTEMA,
  listaProdutosElieudaPadrao
} from './dados/padroes';
import {
  gravarJsonLocal,
  lerJsonLocal,
  limparChavesLocaisPesadas,
  pedidosSemPdfPesado,
  resgatarBackupGeral,
  setoresSemFotos
} from './util/armazenamento';
import {
  classeStatusOrdem,
  rotuloStatusOrdem,
  statusOrdemNormalizado
} from './util/manutencao';
import {
  aplicarFotosNasOrdens,
  aplicarFotosNasTarefas,
  buscarFotoNuvem,
  carregarFotosPendencias,
  coletarFotosOrdens,
  coletarFotosSetores,
  comprimirFotoPendencia,
  enviarFotoNuvem,
  enxugarFotosNuvem,
  extrairFotosOrdens,
  extrairFotosSetores,
  filtrarFotosUsadas,
  guardarFotosLocal,
  ordensSemFotos,
  salvarFotoPendencia,
  unirFotosPendencias
} from './util/fotos';
import {
  filtrarPedidosNaoDeletados,
  idsDeTarefasDeletadas,
  mesclarSetores,
  nomeSetorSemEmoji,
  normalizarSetores,
  parseDataConclusao,
  statusDaTarefa,
  unirConferencias,
  unirIds,
  unirLotesPagamento,
  unirOrdensManutencao,
  identidadePagamento,
  unirPagamentosAbertos,
  unirPedidosCotacao,
  unirLancamentosProducao,
  unirLancamentosRota,
  unirLancamentosDeposito,
  unirNomesProdutosProducao,
  unirTarefasDeletadas
} from './util/mesclar';
import {
  aplicarPermissoesSalvas,
  hashSenha,
  lerSenhasLocais,
  lerUsuariosExtraDeletados,
  omitirIdsDoMapa,
  permissoesPadraoNovoUsuario,
  rotuloPermissoes,
  unirPermissoesUsuarios,
  unirUsuariosCadastrados,
  unirUsuariosExtraAtivos
} from './util/usuarios';
import {
  gerarPdfPedidoFornecedor,
  gerarPdfRelatorioPagamentos
} from './util/pdf';
import {
  marcarItensCotacaoAgora,
  mesclarItensCotacao,
  normalizarItensCotacao,
  qtdPedirNumero
} from './util/cotacao';
import {
  enviarRegistroNuvem,
  recordDoJsonBin
} from './util/nuvem';
import { LogoRm } from './componentes/LogoRm';

// ==========================================
// 🔑 CONFIGURAÇÕES & CREDENCIAIS
// ==========================================
const SENHA_MEU_SISTEMA = config.system.password;















// 🥕 72 PRODUTOS DE HORTIFRÚTI DA DONA ELIEUDA







limparChavesLocaisPesadas();
























































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
      return salvo ? unirUsuariosExtraAtivos(lerUsuariosExtraDeletados(), JSON.parse(salvo)) : [];
    } catch {
      return [];
    }
  });
  const [usuariosExtraDeletados, setUsuariosExtraDeletados] = useState<string[]>(() => lerUsuariosExtraDeletados());
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

  const [tabAtiva, setTabAtiva] = useState<'pendencias' | 'compras' | 'cotacao' | 'cadastroProdutos' | 'cadastroFornecedores' | 'pagamentos' | 'reciboComprador' | 'elieuda' | 'conferencia' | 'relatorios' | 'seguranca' | 'manutencao' | 'dados' | 'producao'>('pendencias');
  const [ordensManutencao, setOrdensManutencao] = useState<OrdemManutencao[]>(() => {
    try {
      const salvo = resgatarBackupGeral('rm_ordens_manutencao', []);
      if (!Array.isArray(salvo)) return [];
      const idsRemovidos = (() => {
        try {
          const salvoIds = localStorage.getItem('rm_ordens_manutencao_deletadas');
          return salvoIds ? JSON.parse(salvoIds) : [];
        } catch {
          return [];
        }
      })();
      return unirOrdensManutencao(idsRemovidos, extrairFotosOrdens(salvo).semFotos);
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
  const [ordensManutencaoDeletadas, setOrdensManutencaoDeletadas] = useState<string[]>(() => {
    try {
      const salvo = localStorage.getItem('rm_ordens_manutencao_deletadas');
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });
  const ordensManutencaoDeletadasRef = useRef(ordensManutencaoDeletadas);
  ordensManutencaoDeletadasRef.current = ordensManutencaoDeletadas;

  const [produtosProducao, setProdutosProducao] = useState<string[]>(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem('rm_produtos_producao') || '[]');
      return unirNomesProdutosProducao(PRODUTOS_PADARIA_PADRAO, Array.isArray(salvo) ? salvo : []);
    } catch {
      return [...PRODUTOS_PADARIA_PADRAO];
    }
  });
  const [lancamentosProducao, setLancamentosProducao] = useState<LancamentoProducao[]>(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem('rm_lancamentos_producao') || '[]');
      return Array.isArray(salvo) ? salvo : [];
    } catch {
      return [];
    }
  });
  const [lancamentosProducaoDeletados, setLancamentosProducaoDeletados] = useState<string[]>(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem('rm_lancamentos_producao_deletados') || '[]');
      return Array.isArray(salvo) ? salvo : [];
    } catch {
      return [];
    }
  });
  const produtosProducaoRef = useRef(produtosProducao);
  const lancamentosProducaoRef = useRef(lancamentosProducao);
  const lancamentosProducaoDeletadosRef = useRef(lancamentosProducaoDeletados);
  produtosProducaoRef.current = produtosProducao;
  lancamentosProducaoRef.current = lancamentosProducao;
  lancamentosProducaoDeletadosRef.current = lancamentosProducaoDeletados;

  const [lancamentosRota, setLancamentosRota] = useState<LancamentoRota[]>(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem('rm_lancamentos_rota') || '[]');
      return Array.isArray(salvo) ? salvo : [];
    } catch {
      return [];
    }
  });
  const [lancamentosRotaDeletados, setLancamentosRotaDeletados] = useState<string[]>(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem('rm_lancamentos_rota_deletados') || '[]');
      return Array.isArray(salvo) ? salvo : [];
    } catch {
      return [];
    }
  });
  const lancamentosRotaRef = useRef(lancamentosRota);
  const lancamentosRotaDeletadosRef = useRef(lancamentosRotaDeletados);
  lancamentosRotaRef.current = lancamentosRota;
  lancamentosRotaDeletadosRef.current = lancamentosRotaDeletados;

  const [contasDeposito, setContasDeposito] = useState<string[]>(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem('rm_contas_deposito') || '[]');
      return unirNomesProdutosProducao(CONTAS_DEPOSITO_PADRAO, Array.isArray(salvo) ? salvo : []);
    } catch {
      return [...CONTAS_DEPOSITO_PADRAO];
    }
  });
  const [lancamentosDeposito, setLancamentosDeposito] = useState<LancamentoDeposito[]>(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem('rm_lancamentos_deposito') || '[]');
      return Array.isArray(salvo) ? salvo : [];
    } catch {
      return [];
    }
  });
  const [lancamentosDepositoDeletados, setLancamentosDepositoDeletados] = useState<string[]>(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem('rm_lancamentos_deposito_deletados') || '[]');
      return Array.isArray(salvo) ? salvo : [];
    } catch {
      return [];
    }
  });
  const contasDepositoRef = useRef(contasDeposito);
  const lancamentosDepositoRef = useRef(lancamentosDeposito);
  const lancamentosDepositoDeletadosRef = useRef(lancamentosDepositoDeletados);
  contasDepositoRef.current = contasDeposito;
  lancamentosDepositoRef.current = lancamentosDeposito;
  lancamentosDepositoDeletadosRef.current = lancamentosDepositoDeletados;

  const [setores, setSetores] = useState<Setor[]>(() => {
    try {
      return normalizarSetores(resgatarBackupGeral('rm_setores', SETORES_PADRAO));
    } catch {
      return SETORES_PADRAO;
    }
  });
  
  const [pagamentosDeletados, setPagamentosDeletados] = useState<string[]>(() => {
    try {
      const salvo = localStorage.getItem('rm_pagamentos_deletados');
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });
  const pagamentosDeletadosRef = useRef(pagamentosDeletados);
  pagamentosDeletadosRef.current = pagamentosDeletados;

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
      return unirPagamentosAbertos(direto && typeof direto === 'object' ? direto : PAGAMENTOS_PADRAO, backup?.pagamentos, lotes, pagamentosDeletadosRef.current);
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
  const [custosCatalogo, setCustosCatalogo] = useState<CustosCatalogoState>(() => {
    try {
      return lerCustosCatalogo(resgatarBackupGeral('rm_custos_catalogo', custosCatalogoVazio()));
    } catch {
      return custosCatalogoVazio();
    }
  });
  const custosCatalogoRef = useRef(custosCatalogo);
  custosCatalogoRef.current = custosCatalogo;
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
    let lista: RegistroConferencia[] = [];
    try {
      const backup = localStorage.getItem('rm_backup_conferencia');
      if (backup) {
        const dados = JSON.parse(backup);
        lista = dados.conferencias || [];
      }
    } catch (e) {
      console.error('Erro ao carregar backup de conferência:', e);
    }
    if (!Array.isArray(lista) || lista.length === 0) {
      lista = resgatarBackupGeral('rm_conferencias', []);
    }
    try {
      const deletadas = JSON.parse(localStorage.getItem('rm_conferencias_deletadas') || '[]');
      if (Array.isArray(deletadas) && deletadas.length) {
        return (lista || []).filter((item: RegistroConferencia) => item?.id && !deletadas.includes(item.id));
      }
    } catch {}
    return lista || [];
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
  const usuariosExtraDeletadosRef = useRef(usuariosExtraDeletados);
  const permissoesUsuariosRef = useRef(permissoesUsuarios);
  pagamentosRef.current = pagamentos;
  historicoPagamentosRef.current = historicoPagamentos;
  itensCotacaoRef.current = itensCotacao;
  setoresRef.current = setores;
  usuariosExtraRef.current = usuariosExtra;
  usuariosExtraDeletadosRef.current = usuariosExtraDeletados;
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
  const [novoFornecedorCadastro, setNovoFornecedorCadastro] = useState({ razaoSocial: '', nomeFantasia: '', cnpj: '', nomePessoaFisica: '', cpf: '', endereco: '', cidade: '' });
  const [mostrarRelatorioPedidos, setMostrarRelatorioPedidos] = useState(true);
  const [pedidoEmVisualizacao, setPedidoEmVisualizacao] = useState<{ fornecedor: FornecedorCotacao; itens: ItemCotacao[] } | null>(null);
  const [buscaProduto, setBuscaProduto] = useState('');

  const [mostrarModalImportacao, setMostrarModalImportacao] = useState(false);
  const [textoImportacao, setTextoImportacao] = useState('');
  const [modoImportacao, setModoImportacao] = useState<'adicionar' | 'substituir'>('adicionar');
  const [unidadePadraoImportacao, setUnidadePadraoImportacao] = useState('Kg');

  const [novaConf, setNovaConf] = useState({ conferente: '', valor: '', obs: '', divergencia: false });
  const [novaConferencia, setNovaConferencia] = useState({ data: new Date().toISOString().split('T')[0], nomeConferente: '', fornecedor: '', valorRecebido: 0, houveDivergencia: false, tipoDivergencia: '' as TipoDivergencia, observacoes: '' });
  const [conferenciasPorPedido, setConferenciasPorPedido] = useState<{ [pedidoId: string]: { conferente: string; valor: string; obs: string; divergencia: boolean; tipoDivergencia: TipoDivergencia } }>({});
  const [pedidosConferidosLocais, setPedidosConferidosLocais] = useState<string[]>(() => {
    const lista = lerJsonLocal('rm_pedidos_conferidos', []);
    return Array.isArray(lista) ? lista : [];
  });
  const pedidosConferidosRef = useRef(pedidosConferidosLocais);
  pedidosConferidosRef.current = pedidosConferidosLocais;
  const [abaConferencia, setAbaConferencia] = useState<'pedidos' | 'criar' | 'avulsa' | 'conferidos' | 'divergencias'>('pedidos');
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
  const versaoNuvemRef = useRef<string>('');
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
        if (Array.isArray(record.usuariosExtraDeletados)) {
          const deletados = unirIds(usuariosExtraDeletadosRef.current, record.usuariosExtraDeletados);
          usuariosExtraDeletadosRef.current = deletados;
          setUsuariosExtraDeletados(deletados);
          localStorage.setItem('rm_usuarios_extra_deletados', JSON.stringify(deletados));
        }
        if (Array.isArray(record.usuariosExtra)) {
          extrasAtuais = unirUsuariosExtraAtivos(usuariosExtraDeletadosRef.current, usuariosExtra, record.usuariosExtra);
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
            setPagamentos(atuaisPag => unirPagamentosAbertos(atuaisPag, dados.pagamentos, uniaoLotes, pagamentosDeletadosRef.current));
            return uniaoLotes;
          });
        }
        if (Array.isArray(dados.fornecedoresCotacao)) setFornecedoresCotacao(dados.fornecedoresCotacao);
        if (Array.isArray(dados.itensCotacao)) setItensCotacao(itensAtuais => mesclarItensCotacao(itensAtuais, dados.itensCotacao));
        if (dados.quantidadesElieuda) setQuantidadesElieuda(dados.quantidadesElieuda);
        if (dados.custosCatalogo) setCustosCatalogo(atuais => aplicarCustosRecebidos(atuais, dados.custosCatalogo));
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
          const uniaoPag = unirPagamentosAbertos(atuaisPag, registroNuvem.pagamentos, uniaoLotes, pagamentosDeletadosRef.current);
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
    const deletados = unirIds(usuariosExtraDeletadosRef.current, [usuarioId]);
    usuariosExtraDeletadosRef.current = deletados;
    setUsuariosExtraDeletados(deletados);
    localStorage.setItem('rm_usuarios_extra_deletados', JSON.stringify(deletados));
    const extrasAtualizados = unirUsuariosExtraAtivos(deletados, usuariosExtra);
    usuariosExtraRef.current = extrasAtualizados;
    setUsuariosExtra(extrasAtualizados);
    localStorage.setItem('rm_usuarios_extra', JSON.stringify(extrasAtualizados));
    const permissoesAtualizadas = omitirIdsDoMapa(permissoesUsuarios, [usuarioId]);
    permissoesUsuariosRef.current = permissoesAtualizadas;
    setPermissoesUsuarios(permissoesAtualizadas);
    localStorage.setItem('rm_permissoes_usuarios', JSON.stringify(permissoesAtualizadas));
    const senhasAtualizadas = omitirIdsDoMapa(senhasUsuarios, [usuarioId]);
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
        reciboComprador: 'pagamentos',
        elieuda: 'elieuda',
        conferencia: 'conferencias',
        relatorios: 'relatorios',
        manutencao: 'manutencao',
        dados: 'dados',
        producao: 'producao'
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
      const versaoConhecida = versaoNuvemRef.current;
      const resposta = await fetch(
        versaoConhecida ? `/api/nuvem?desde=${encodeURIComponent(versaoConhecida)}` : '/api/nuvem',
        { method: 'GET', cache: 'no-store', signal: controlador.signal }
      );

      if (resposta.status === 503) {
        setStatusNuvem('⚠️ Nuvem fora do ar — só neste aparelho');
        return;
      }

      const dadosBrutos = await resposta.json();
      if (dadosBrutos?.versao) versaoNuvemRef.current = dadosBrutos.versao;

      // A nuvem avisou que nada mudou, então não há o que baixar nem remontar.
      if (dadosBrutos?.semMudanca) {
        setStatusNuvem('🟢 Nuvem');
        return;
      }
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
        if (Array.isArray(dados.record.pagamentosDeletados)) {
          const uniao = unirIds(pagamentosDeletadosRef.current, dados.record.pagamentosDeletados);
          pagamentosDeletadosRef.current = uniao;
          setPagamentosDeletados(uniao);
          localStorage.setItem('rm_pagamentos_deletados', JSON.stringify(uniao));
        }
        if (dados.record.pagamentos || Array.isArray(dados.record.historicoPagamentos)) {
          setHistoricoPagamentos(atuais => {
            const uniaoLotes = unirLotesPagamento(atuais, dados.record.historicoPagamentos);
            localStorage.setItem('rm_historico_pagamentos', JSON.stringify(uniaoLotes));
            setPagamentos(atuaisPag => {
              const uniaoPag = unirPagamentosAbertos(atuaisPag, dados.record.pagamentos, uniaoLotes, pagamentosDeletadosRef.current);
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
        if (dados.record.custosCatalogo) setCustosCatalogo(atuais => aplicarCustosRecebidos(atuais, dados.record.custosCatalogo));
        if (Array.isArray(dados.record.conferenciasDeletadas)) {
          const uniao = unirIds(conferenciasDeletadasRef.current, dados.record.conferenciasDeletadas);
          conferenciasDeletadasRef.current = uniao;
          setConferenciasDeletadas(uniao);
          localStorage.setItem('rm_conferencias_deletadas', JSON.stringify(uniao));
        }
        if (Array.isArray(dados.record.conferencias)) {
          setConferencias(atuais => {
            const uniao = unirConferencias(atuais, dados.record.conferencias).filter(item => !conferenciasDeletadasRef.current.includes(item.id));
            localStorage.setItem('rm_conferencias', JSON.stringify(uniao));
            localStorage.setItem('rm_backup_conferencia', JSON.stringify({ conferencias: uniao }));
            conferenciasRef.current = uniao;
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
        if (Array.isArray(dados.record.usuariosExtraDeletados)) {
          const uniaoDel = unirIds(usuariosExtraDeletadosRef.current, dados.record.usuariosExtraDeletados);
          usuariosExtraDeletadosRef.current = uniaoDel;
          setUsuariosExtraDeletados(uniaoDel);
          localStorage.setItem('rm_usuarios_extra_deletados', JSON.stringify(uniaoDel));
        }
        if (Array.isArray(dados.record.usuariosExtra)) {
          setUsuariosExtra(atuais => {
            const uniao = unirUsuariosExtraAtivos(usuariosExtraDeletadosRef.current, atuais, dados.record.usuariosExtra);
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
        if (Array.isArray(dados.record.ordensManutencaoDeletadas)) {
          const uniao = unirIds(ordensManutencaoDeletadasRef.current, dados.record.ordensManutencaoDeletadas);
          ordensManutencaoDeletadasRef.current = uniao;
          setOrdensManutencaoDeletadas(uniao);
          localStorage.setItem('rm_ordens_manutencao_deletadas', JSON.stringify(uniao));
        }
        if (Array.isArray(dados.record.ordensManutencao)) {
          const extraidos = extrairFotosOrdens(dados.record.ordensManutencao);
          const fotosNuvem = unirFotosPendencias(fotosPendenciasRef.current, dados.record.fotosPendencias, extraidos.fotos);
          fotosPendenciasRef.current = fotosNuvem;
          guardarFotosLocal(fotosNuvem);
          setOrdensManutencao(atuais => {
            const uniao = aplicarFotosNasOrdens(unirOrdensManutencao(ordensManutencaoDeletadasRef.current, atuais, extraidos.semFotos), fotosNuvem);
            gravarJsonLocal('rm_ordens_manutencao', ordensSemFotos(uniao));
            return uniao;
          });
        }
        if (Array.isArray(dados.record.producaoLancamentosDeletados)) {
          const uniao = unirIds(lancamentosProducaoDeletadosRef.current, dados.record.producaoLancamentosDeletados);
          lancamentosProducaoDeletadosRef.current = uniao;
          setLancamentosProducaoDeletados(uniao);
          localStorage.setItem('rm_lancamentos_producao_deletados', JSON.stringify(uniao));
        }
        if (dados.record.producaoPadaria) {
          const produtos = unirNomesProdutosProducao(produtosProducaoRef.current, dados.record.producaoPadaria.produtos);
          const lancamentos = unirLancamentosProducao(
            lancamentosProducaoDeletadosRef.current,
            lancamentosProducaoRef.current,
            dados.record.producaoPadaria.lancamentos
          );
          produtosProducaoRef.current = produtos;
          lancamentosProducaoRef.current = lancamentos;
          setProdutosProducao(produtos);
          setLancamentosProducao(lancamentos);
          localStorage.setItem('rm_produtos_producao', JSON.stringify(produtos));
          localStorage.setItem('rm_lancamentos_producao', JSON.stringify(lancamentos));
        }
        if (Array.isArray(dados.record.producaoRotaDeletados)) {
          const uniao = unirIds(lancamentosRotaDeletadosRef.current, dados.record.producaoRotaDeletados);
          lancamentosRotaDeletadosRef.current = uniao;
          setLancamentosRotaDeletados(uniao);
          localStorage.setItem('rm_lancamentos_rota_deletados', JSON.stringify(uniao));
        }
        if (dados.record.producaoPadaria?.lancamentosRota || Array.isArray(dados.record.lancamentosRota)) {
          const lista = unirLancamentosRota(
            lancamentosRotaDeletadosRef.current,
            lancamentosRotaRef.current,
            dados.record.producaoPadaria?.lancamentosRota,
            dados.record.lancamentosRota
          );
          lancamentosRotaRef.current = lista;
          setLancamentosRota(lista);
          localStorage.setItem('rm_lancamentos_rota', JSON.stringify(lista));
        }
        if (Array.isArray(dados.record.producaoDepositoDeletados)) {
          const uniao = unirIds(lancamentosDepositoDeletadosRef.current, dados.record.producaoDepositoDeletados);
          lancamentosDepositoDeletadosRef.current = uniao;
          setLancamentosDepositoDeletados(uniao);
          localStorage.setItem('rm_lancamentos_deposito_deletados', JSON.stringify(uniao));
        }
        if (dados.record.producaoPadaria) {
          const contas = unirNomesProdutosProducao(contasDepositoRef.current, dados.record.producaoPadaria.contasDeposito);
          const depositos = unirLancamentosDeposito(
            lancamentosDepositoDeletadosRef.current,
            lancamentosDepositoRef.current,
            dados.record.producaoPadaria.lancamentosDeposito
          );
          contasDepositoRef.current = contas;
          lancamentosDepositoRef.current = depositos;
          setContasDeposito(contas);
          setLancamentosDeposito(depositos);
          localStorage.setItem('rm_contas_deposito', JSON.stringify(contas));
          localStorage.setItem('rm_lancamentos_deposito', JSON.stringify(depositos));
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
    const intervalo = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      void carregarTudo();
    }, 60000);
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
    if (dados.custosCatalogo) setCustosCatalogo(atuais => aplicarCustosRecebidos(atuais, dados.custosCatalogo));
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
        if (dados.custosCatalogo) setCustosCatalogo(atuais => aplicarCustosRecebidos(atuais, dados.custosCatalogo));
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
      let pagamentosDeletadosParaNuvem = pagamentosDeletadosRef.current;
      let pedidosCotacaoDeletadosParaNuvem = pedidosCotacaoDeletadosRef.current;
      let usuariosParaNuvem = usuariosExtraRef.current;
      let usuariosDeletadosParaNuvem = usuariosExtraDeletadosRef.current;
      let permissoesParaNuvem = permissoesUsuariosRef.current;
      let ordensParaNuvem = ordensManutencaoRef.current;
      let ordensDeletadasParaNuvem = ordensManutencaoDeletadasRef.current;
      let fotosPendenciasParaNuvem = fotosPendenciasRef.current;
      let produtosProducaoParaNuvem = produtosProducaoRef.current;
      let lancamentosProducaoParaNuvem = lancamentosProducaoRef.current;
      let lancamentosProducaoDeletadosParaNuvem = lancamentosProducaoDeletadosRef.current;
      let lancamentosRotaParaNuvem = lancamentosRotaRef.current;
      let lancamentosRotaDeletadosParaNuvem = lancamentosRotaDeletadosRef.current;
      let contasDepositoParaNuvem = contasDepositoRef.current;
      let lancamentosDepositoParaNuvem = lancamentosDepositoRef.current;
      let lancamentosDepositoDeletadosParaNuvem = lancamentosDepositoDeletadosRef.current;
      let conseguiuLerNuvem = false;
      try {
        const respostaAtual = await fetch('/api/nuvem', { cache: 'no-store' });
        const dadosAtuaisBrutos = await respostaAtual.json();
        const dadosAtuais = { record: recordDoJsonBin(dadosAtuaisBrutos) };
        if (respostaAtual.ok && dadosAtuais.record) {
          conseguiuLerNuvem = true;
          if (dadosAtuais.record.custosCatalogo) {
            const uniaoCustos = aplicarCustosRecebidos(custosCatalogoRef.current, dadosAtuais.record.custosCatalogo);
            custosCatalogoRef.current = uniaoCustos;
            setCustosCatalogo(uniaoCustos);
          }
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
          pagamentosDeletadosParaNuvem = unirIds(pagamentosDeletadosRef.current, dadosAtuais.record.pagamentosDeletados);
          pagamentosDeletadosRef.current = pagamentosDeletadosParaNuvem;
          setPagamentosDeletados(pagamentosDeletadosParaNuvem);
          localStorage.setItem('rm_pagamentos_deletados', JSON.stringify(pagamentosDeletadosParaNuvem));
          pagamentosParaNuvem = unirPagamentosAbertos(
            pagamentosRef.current,
            unirPagamentosAbertos(dadosPagamentos, dadosAtuais.record.pagamentos, historicoParaNuvem, pagamentosDeletadosParaNuvem),
            historicoParaNuvem,
            pagamentosDeletadosParaNuvem
          );
          pagamentosRef.current = pagamentosParaNuvem;
          historicoPagamentosRef.current = historicoParaNuvem;
          setHistoricoPagamentos(historicoParaNuvem);
          setPagamentos(atuais => unirPagamentosAbertos(atuais, pagamentosParaNuvem, historicoParaNuvem, pagamentosDeletadosParaNuvem));
          localStorage.setItem('rm_historico_pagamentos', JSON.stringify(historicoParaNuvem));
          localStorage.setItem('rm_pagamentos', JSON.stringify(pagamentosParaNuvem));
          pedidosCotacaoDeletadosParaNuvem = unirIds(pedidosCotacaoDeletadosRef.current, dadosAtuais.record.pedidosCotacaoDeletados);
          pedidosCotacaoDeletadosRef.current = pedidosCotacaoDeletadosParaNuvem;
          setPedidosCotacaoDeletados(pedidosCotacaoDeletadosParaNuvem);
          localStorage.setItem('rm_pedidos_cotacao_deletados', JSON.stringify(pedidosCotacaoDeletadosParaNuvem));
          setRelatoriosPedidosCotacao(atuais => {
            const uniao = unirPedidosCotacao(pedidosCotacaoDeletadosParaNuvem, atuais, relatoriosPedidosRef.current, dadosAtuais.record.relatoriosPedidosCotacao);
            relatoriosPedidosRef.current = uniao;
            pedidosParaNuvem = uniao;
            try { localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(uniao)); } catch { /* ignora cota */ }
            return uniao;
          });
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
          senhasParaNuvem = omitirIdsDoMapa({ ...senhasNuvem, ...dadosSenhas }, usuariosDeletadosParaNuvem);
          if (senhaRemovidaId) delete senhasParaNuvem[senhaRemovidaId];
          setSenhasUsuarios(senhasParaNuvem);
          localStorage.setItem('rm_senhas_usuarios', JSON.stringify(senhasParaNuvem));
          if (Array.isArray(dadosAtuais.record.usuariosExtraDeletados)) {
            usuariosDeletadosParaNuvem = unirIds(usuariosExtraDeletadosRef.current, dadosAtuais.record.usuariosExtraDeletados);
            usuariosExtraDeletadosRef.current = usuariosDeletadosParaNuvem;
            setUsuariosExtraDeletados(usuariosDeletadosParaNuvem);
            localStorage.setItem('rm_usuarios_extra_deletados', JSON.stringify(usuariosDeletadosParaNuvem));
          }
          if (Array.isArray(dadosAtuais.record.usuariosExtra)) {
            usuariosParaNuvem = unirUsuariosExtraAtivos(usuariosDeletadosParaNuvem, usuariosExtraRef.current, dadosAtuais.record.usuariosExtra);
            usuariosExtraRef.current = usuariosParaNuvem;
            setUsuariosExtra(usuariosParaNuvem);
            localStorage.setItem('rm_usuarios_extra', JSON.stringify(usuariosParaNuvem));
          }
          if (dadosAtuais.record.permissoesUsuarios && typeof dadosAtuais.record.permissoesUsuarios === 'object') {
            permissoesParaNuvem = omitirIdsDoMapa(unirPermissoesUsuarios(dadosAtuais.record.permissoesUsuarios, permissoesUsuariosRef.current), usuariosDeletadosParaNuvem);
            permissoesUsuariosRef.current = permissoesParaNuvem;
            setPermissoesUsuarios(permissoesParaNuvem);
            localStorage.setItem('rm_permissoes_usuarios', JSON.stringify(permissoesParaNuvem));
          }
          if (Array.isArray(dadosAtuais.record.ordensManutencaoDeletadas)) {
            ordensDeletadasParaNuvem = unirIds(ordensManutencaoDeletadasRef.current, dadosAtuais.record.ordensManutencaoDeletadas);
            ordensManutencaoDeletadasRef.current = ordensDeletadasParaNuvem;
            setOrdensManutencaoDeletadas(ordensDeletadasParaNuvem);
            localStorage.setItem('rm_ordens_manutencao_deletadas', JSON.stringify(ordensDeletadasParaNuvem));
          }
          if (Array.isArray(dadosAtuais.record.ordensManutencao)) {
            const extraidos = extrairFotosOrdens(dadosAtuais.record.ordensManutencao);
            fotosPendenciasParaNuvem = unirFotosPendencias(fotosPendenciasParaNuvem, extraidos.fotos);
            ordensParaNuvem = unirOrdensManutencao(ordensDeletadasParaNuvem, ordensManutencaoRef.current, extraidos.semFotos);
            const comFotos = aplicarFotosNasOrdens(ordensParaNuvem, fotosPendenciasParaNuvem);
            ordensManutencaoRef.current = ordensSemFotos(comFotos);
            setOrdensManutencao(comFotos);
            gravarJsonLocal('rm_ordens_manutencao', ordensSemFotos(comFotos));
          }
          if (Array.isArray(dadosAtuais.record.producaoLancamentosDeletados)) {
            lancamentosProducaoDeletadosParaNuvem = unirIds(lancamentosProducaoDeletadosRef.current, dadosAtuais.record.producaoLancamentosDeletados);
            lancamentosProducaoDeletadosRef.current = lancamentosProducaoDeletadosParaNuvem;
            setLancamentosProducaoDeletados(lancamentosProducaoDeletadosParaNuvem);
            localStorage.setItem('rm_lancamentos_producao_deletados', JSON.stringify(lancamentosProducaoDeletadosParaNuvem));
          }
          if (dadosAtuais.record.producaoPadaria) {
            produtosProducaoParaNuvem = unirNomesProdutosProducao(produtosProducaoRef.current, dadosAtuais.record.producaoPadaria.produtos);
            lancamentosProducaoParaNuvem = unirLancamentosProducao(
              lancamentosProducaoDeletadosParaNuvem,
              lancamentosProducaoRef.current,
              dadosAtuais.record.producaoPadaria.lancamentos
            );
            produtosProducaoRef.current = produtosProducaoParaNuvem;
            lancamentosProducaoRef.current = lancamentosProducaoParaNuvem;
            setProdutosProducao(produtosProducaoParaNuvem);
            setLancamentosProducao(lancamentosProducaoParaNuvem);
            localStorage.setItem('rm_produtos_producao', JSON.stringify(produtosProducaoParaNuvem));
            localStorage.setItem('rm_lancamentos_producao', JSON.stringify(lancamentosProducaoParaNuvem));
          }
          if (Array.isArray(dadosAtuais.record.producaoRotaDeletados)) {
            lancamentosRotaDeletadosParaNuvem = unirIds(lancamentosRotaDeletadosRef.current, dadosAtuais.record.producaoRotaDeletados);
            lancamentosRotaDeletadosRef.current = lancamentosRotaDeletadosParaNuvem;
            setLancamentosRotaDeletados(lancamentosRotaDeletadosParaNuvem);
            localStorage.setItem('rm_lancamentos_rota_deletados', JSON.stringify(lancamentosRotaDeletadosParaNuvem));
          }
          if (dadosAtuais.record.producaoPadaria?.lancamentosRota || Array.isArray(dadosAtuais.record.lancamentosRota)) {
            lancamentosRotaParaNuvem = unirLancamentosRota(
              lancamentosRotaDeletadosParaNuvem,
              lancamentosRotaRef.current,
              dadosAtuais.record.producaoPadaria?.lancamentosRota,
              dadosAtuais.record.lancamentosRota
            );
            lancamentosRotaRef.current = lancamentosRotaParaNuvem;
            setLancamentosRota(lancamentosRotaParaNuvem);
            localStorage.setItem('rm_lancamentos_rota', JSON.stringify(lancamentosRotaParaNuvem));
          }
          if (Array.isArray(dadosAtuais.record.producaoDepositoDeletados)) {
            lancamentosDepositoDeletadosParaNuvem = unirIds(lancamentosDepositoDeletadosRef.current, dadosAtuais.record.producaoDepositoDeletados);
            lancamentosDepositoDeletadosRef.current = lancamentosDepositoDeletadosParaNuvem;
            setLancamentosDepositoDeletados(lancamentosDepositoDeletadosParaNuvem);
            localStorage.setItem('rm_lancamentos_deposito_deletados', JSON.stringify(lancamentosDepositoDeletadosParaNuvem));
          }
          if (dadosAtuais.record.producaoPadaria) {
            contasDepositoParaNuvem = unirNomesProdutosProducao(contasDepositoRef.current, dadosAtuais.record.producaoPadaria.contasDeposito);
            lancamentosDepositoParaNuvem = unirLancamentosDeposito(
              lancamentosDepositoDeletadosParaNuvem,
              lancamentosDepositoRef.current,
              dadosAtuais.record.producaoPadaria.lancamentosDeposito
            );
            contasDepositoRef.current = contasDepositoParaNuvem;
            lancamentosDepositoRef.current = lancamentosDepositoParaNuvem;
            setContasDeposito(contasDepositoParaNuvem);
            setLancamentosDeposito(lancamentosDepositoParaNuvem);
            localStorage.setItem('rm_contas_deposito', JSON.stringify(contasDepositoParaNuvem));
            localStorage.setItem('rm_lancamentos_deposito', JSON.stringify(lancamentosDepositoParaNuvem));
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
      pagamentosDeletadosParaNuvem = unirIds(pagamentosDeletadosRef.current, pagamentosDeletadosParaNuvem);
      pagamentosParaNuvem = unirPagamentosAbertos(pagamentosRef.current, pagamentosParaNuvem, historicoParaNuvem, pagamentosDeletadosParaNuvem);
      pagamentosRef.current = pagamentosParaNuvem;
      historicoPagamentosRef.current = historicoParaNuvem;
      pedidosCotacaoDeletadosParaNuvem = unirIds(pedidosCotacaoDeletadosRef.current, pedidosCotacaoDeletadosParaNuvem);
      pedidosParaNuvem = unirPedidosCotacao(pedidosCotacaoDeletadosParaNuvem, relatoriosPedidosRef.current, pedidosParaNuvem);
      conferenciasDeletadasParaNuvem = unirIds(conferenciasDeletadasRef.current, conferenciasDeletadasParaNuvem);
      conferenciasParaNuvem = unirConferencias(conferenciasRef.current, conferenciasParaNuvem).filter(item => !conferenciasDeletadasParaNuvem.includes(item.id));
      ordensDeletadasParaNuvem = unirIds(ordensManutencaoDeletadasRef.current, ordensDeletadasParaNuvem);
      ordensParaNuvem = unirOrdensManutencao(ordensDeletadasParaNuvem, ordensManutencaoRef.current, ordensParaNuvem);
      conferidosParaNuvem = unirIds(pedidosConferidosRef.current, conferidosParaNuvem);
      usuariosDeletadosParaNuvem = unirIds(usuariosExtraDeletadosRef.current, usuariosDeletadosParaNuvem);
      usuariosParaNuvem = unirUsuariosExtraAtivos(usuariosDeletadosParaNuvem, usuariosExtraRef.current, usuariosParaNuvem);
      permissoesParaNuvem = omitirIdsDoMapa(unirPermissoesUsuarios(permissoesParaNuvem, permissoesUsuariosRef.current), usuariosDeletadosParaNuvem);
      produtosProducaoParaNuvem = unirNomesProdutosProducao(produtosProducaoRef.current, produtosProducaoParaNuvem);
      lancamentosProducaoDeletadosParaNuvem = unirIds(lancamentosProducaoDeletadosRef.current, lancamentosProducaoDeletadosParaNuvem);
      lancamentosProducaoParaNuvem = unirLancamentosProducao(lancamentosProducaoDeletadosParaNuvem, lancamentosProducaoRef.current, lancamentosProducaoParaNuvem);
      lancamentosRotaDeletadosParaNuvem = unirIds(lancamentosRotaDeletadosRef.current, lancamentosRotaDeletadosParaNuvem);
      lancamentosRotaParaNuvem = unirLancamentosRota(lancamentosRotaDeletadosParaNuvem, lancamentosRotaRef.current, lancamentosRotaParaNuvem);
      contasDepositoParaNuvem = unirNomesProdutosProducao(contasDepositoRef.current, contasDepositoParaNuvem);
      lancamentosDepositoDeletadosParaNuvem = unirIds(lancamentosDepositoDeletadosRef.current, lancamentosDepositoDeletadosParaNuvem);
      lancamentosDepositoParaNuvem = unirLancamentosDeposito(lancamentosDepositoDeletadosParaNuvem, lancamentosDepositoRef.current, lancamentosDepositoParaNuvem);
      fotosPendenciasParaNuvem = enxugarFotosNuvem(filtrarFotosUsadas(unirFotosPendencias(
        fotosPendenciasParaNuvem,
        fotosPendenciasRef.current,
        coletarFotosSetores(setoresRef.current),
        coletarFotosOrdens(ordensManutencaoRef.current)
      ), setoresParaNuvem, ordensParaNuvem), 800000);
      fotosPendenciasRef.current = fotosPendenciasParaNuvem;
      guardarFotosLocal(fotosPendenciasParaNuvem);
      await Promise.all(Object.entries(fotosPendenciasParaNuvem).map(([id, foto]) => enviarFotoNuvem(id, foto)));

      const registroNuvem = { setores: setoresSemFotos(setoresParaNuvem), pagamentos: pagamentosParaNuvem, historicoPagamentos: historicoParaNuvem, tarefasDeletadas: deletadasParaSalvar, fornecedoresCotacao: dadosFornCotacao, itensCotacao: dadosItensCotacao, quantidadesElieuda: dadosElieuda, custosCatalogo: custosCatalogoRef.current, conferencias: conferenciasParaNuvem, pedidosConferidos: conferidosParaNuvem, conferenciasDeletadas: conferenciasDeletadasParaNuvem, pagamentosDeletados: pagamentosDeletadosParaNuvem, pedidosCotacaoDeletados: pedidosCotacaoDeletadosParaNuvem, relatoriosPedidosCotacao: pedidosParaNuvem, senhasUsuarios: senhasParaNuvem, usuariosExtra: usuariosParaNuvem, usuariosExtraDeletados: usuariosDeletadosParaNuvem, permissoesUsuarios: permissoesParaNuvem, ordensManutencao: ordensSemFotos(ordensParaNuvem), ordensManutencaoDeletadas: ordensDeletadasParaNuvem, fotosPendencias: fotosPendenciasParaNuvem, fotosPendenciaIds: Object.keys(fotosPendenciasParaNuvem), producaoPadaria: { produtos: produtosProducaoParaNuvem, lancamentos: lancamentosProducaoParaNuvem, lancamentosRota: lancamentosRotaParaNuvem, contasDeposito: contasDepositoParaNuvem, lancamentosDeposito: lancamentosDepositoParaNuvem }, producaoLancamentosDeletados: lancamentosProducaoDeletadosParaNuvem, producaoRotaDeletados: lancamentosRotaDeletadosParaNuvem, producaoDepositoDeletados: lancamentosDepositoDeletadosParaNuvem, ultimaAtualizacao: agora };
      const respostaGravar = await enviarRegistroNuvem(registroNuvem);
      if (!respostaGravar.ok) {
        setStatusNuvem(respostaGravar.status === 503 ? '⚠️ Nuvem fora do ar — só neste aparelho' : '⚠️ Não gravou na nuvem');
        return false;
      }
      try {
        const gravado = await respostaGravar.json();
        if (gravado?.versao) versaoNuvemRef.current = gravado.versao;
      } catch {
        versaoNuvemRef.current = '';
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

  const salvarProdutoProducao = (nome: string) => {
    const produtos = unirNomesProdutosProducao(produtosProducaoRef.current, [nome]);
    produtosProducaoRef.current = produtos;
    setProdutosProducao(produtos);
    localStorage.setItem('rm_produtos_producao', JSON.stringify(produtos));
    void gravarNaWeb();
  };

  const adicionarLancamentoProducao = (item: Omit<LancamentoProducao, 'id'>) => {
    const novo: LancamentoProducao = { ...item, id: String(Date.now()) };
    const lista = unirLancamentosProducao(lancamentosProducaoDeletadosRef.current, lancamentosProducaoRef.current, [novo]);
    lancamentosProducaoRef.current = lista;
    setLancamentosProducao(lista);
    localStorage.setItem('rm_lancamentos_producao', JSON.stringify(lista));
    void gravarNaWeb();
  };

  const removerLancamentoProducao = (id: string) => {
    const deletados = unirIds(lancamentosProducaoDeletadosRef.current, [id]);
    lancamentosProducaoDeletadosRef.current = deletados;
    setLancamentosProducaoDeletados(deletados);
    localStorage.setItem('rm_lancamentos_producao_deletados', JSON.stringify(deletados));
    const lista = unirLancamentosProducao(deletados, lancamentosProducaoRef.current);
    lancamentosProducaoRef.current = lista;
    setLancamentosProducao(lista);
    localStorage.setItem('rm_lancamentos_producao', JSON.stringify(lista));
    void gravarNaWeb();
  };

  const adicionarLancamentoRota = (item: Omit<LancamentoRota, 'id'>) => {
    const novo: LancamentoRota = { ...item, id: String(Date.now()) };
    const lista = unirLancamentosRota(lancamentosRotaDeletadosRef.current, lancamentosRotaRef.current, [novo]);
    lancamentosRotaRef.current = lista;
    setLancamentosRota(lista);
    localStorage.setItem('rm_lancamentos_rota', JSON.stringify(lista));
    void gravarNaWeb();
  };

  const removerLancamentoRota = (id: string) => {
    const deletados = unirIds(lancamentosRotaDeletadosRef.current, [id]);
    lancamentosRotaDeletadosRef.current = deletados;
    setLancamentosRotaDeletados(deletados);
    localStorage.setItem('rm_lancamentos_rota_deletados', JSON.stringify(deletados));
    const lista = unirLancamentosRota(deletados, lancamentosRotaRef.current);
    lancamentosRotaRef.current = lista;
    setLancamentosRota(lista);
    localStorage.setItem('rm_lancamentos_rota', JSON.stringify(lista));
    void gravarNaWeb();
  };

  const salvarContaDeposito = (nome: string) => {
    const contas = unirNomesProdutosProducao(contasDepositoRef.current, [nome]);
    contasDepositoRef.current = contas;
    setContasDeposito(contas);
    localStorage.setItem('rm_contas_deposito', JSON.stringify(contas));
    void gravarNaWeb();
  };

  const adicionarLancamentoDeposito = (item: Omit<LancamentoDeposito, 'id'>) => {
    const novo: LancamentoDeposito = { ...item, id: String(Date.now()) };
    const lista = unirLancamentosDeposito(lancamentosDepositoDeletadosRef.current, lancamentosDepositoRef.current, [novo]);
    lancamentosDepositoRef.current = lista;
    setLancamentosDeposito(lista);
    localStorage.setItem('rm_lancamentos_deposito', JSON.stringify(lista));
    void gravarNaWeb();
  };

  const removerLancamentoDeposito = (id: string) => {
    const deletados = unirIds(lancamentosDepositoDeletadosRef.current, [id]);
    lancamentosDepositoDeletadosRef.current = deletados;
    setLancamentosDepositoDeletados(deletados);
    localStorage.setItem('rm_lancamentos_deposito_deletados', JSON.stringify(deletados));
    const lista = unirLancamentosDeposito(deletados, lancamentosDepositoRef.current);
    lancamentosDepositoRef.current = lista;
    setLancamentosDeposito(lista);
    localStorage.setItem('rm_lancamentos_deposito', JSON.stringify(lista));
    void gravarNaWeb();
  };

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
    const proximas = (ordensManutencaoRef.current || []).filter(ordem => ordem.id !== id);
    const deletadas = unirIds(ordensManutencaoDeletadasRef.current, [id]);
    ordensManutencaoDeletadasRef.current = deletadas;
    setOrdensManutencaoDeletadas(deletadas);
    localStorage.setItem('rm_ordens_manutencao_deletadas', JSON.stringify(deletadas));
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
    const origem = pagamentosRef.current && Array.isArray(pagamentosRef.current[tipo])
      ? pagamentosRef.current[tipo]
      : [];
    const bloqueados = new Set(pagamentosDeletadosRef.current);
    return origem
      .map(item => (item?.id ? item : { ...item, id: identidadePagamento(item) }))
      .filter(item => item?.id && !bloqueados.has(item.id));
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
    const atuais = pagamentosRef.current;
    const listaAtual = Array.isArray(atuais[tipo]) ? atuais[tipo] : [];
    const alvo = listaAtual.find(item => item.id === id)
      || listaAtual.find(item => identidadePagamento(item) === id);
    const aindaNaLista = listaAtual.filter(item => {
      if (alvo) {
        if (alvo.id && item.id === alvo.id) return false;
        if (!item.id && identidadePagamento(item) === identidadePagamento(alvo)) return false;
      }
      return item.id !== id;
    });
    const novosPagamentos: PagamentosState = {
      caixa: tipo === 'caixa' ? aindaNaLista : (atuais.caixa || []),
      cheque: tipo === 'cheque' ? aindaNaLista : (atuais.cheque || []),
      caben: tipo === 'caben' ? aindaNaLista : (atuais.caben || [])
    };
    const marcas = [id, alvo?.id, alvo ? identidadePagamento(alvo) : ''].filter(Boolean);
    const deletados = unirIds(pagamentosDeletadosRef.current, marcas);
    pagamentosDeletadosRef.current = deletados;
    setPagamentosDeletados(deletados);
    localStorage.setItem('rm_pagamentos_deletados', JSON.stringify(deletados));
    pagamentosRef.current = novosPagamentos;
    setPagamentos(novosPagamentos);
    localStorage.setItem('rm_pagamentos', JSON.stringify(novosPagamentos));
    localStorage.setItem('rm_backup_completo', JSON.stringify({ pagamentos: novosPagamentos, historicoPagamentos: historicoPagamentosRef.current }));
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
      const doCatalogo = montarItensLaticinios(base).find(item => item.id === itemId)
        || montarItensEmbalagens(base).find(item => item.id === itemId);
      if (!doCatalogo) return base;
      return [...base, { ...doCatalogo, [campo]: valor, atualizadoEm: agora, secao: doCatalogo.secao || 'Laticínios' }];
    });
  };

  const atualizarPrecoCotacao = (itemId: string, fornecedorId: string, valor: string) => {
    const agora = new Date().toISOString();
    setItensCotacao(atuais => {
      const base = Array.isArray(atuais) ? atuais : [];
      const itemAtual = base.find(item => item.id === itemId)
        || montarItensLaticinios(base).find(item => item.id === itemId)
        || montarItensEmbalagens(base).find(item => item.id === itemId);
      if (!itemAtual) return base;
      const precosAtualizados = { ...(itemAtual.precos || {}), [fornecedorId]: valor };
      const custos = Object.values(precosAtualizados).map(preco => parseFloat(String(preco).replace(',', '.'))).filter(preco => !Number.isNaN(preco) && preco > 0);
      if (base.some(item => item.id === itemId)) {
        return base.map(item => item.id === itemId ? { ...item, precos: precosAtualizados, menorCusto: custos.length ? Math.min(...custos) : item.menorCusto, atualizadoEm: agora } : item);
      }
      return [...base, { ...itemAtual, precos: precosAtualizados, menorCusto: custos.length ? Math.min(...custos) : undefined, atualizadoEm: agora, secao: itemAtual.secao || 'Laticínios' }];
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
    const unidade = novoProdutoCadastro.unidade.trim() || 'Kg';
    const novoItem: ItemCotacao = { id: `cad_${Date.now()}`, produto: nome, unit: unidade, estoqueAtual: '', qtdSugerida: '', qtdPedir: '', precos: {} };
    const novosItens = [...itensCotacao, novoItem];
    setItensCotacao(novosItens);
    setNovoProdutoCadastro({ nome: '', unidade });
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
    const novos = [...fornecedoresCotacao, { id: `f_${Date.now()}`, nome: novoFornecedorNome.trim().toUpperCase(), tipoPessoa: 'juridica' as const }];
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
  const cadastrarFornecedor = (dadosFormulario?: { tipoPessoa?: 'fisica' | 'juridica'; razaoSocial: string; nomeFantasia: string; cnpj: string; nomePessoaFisica: string; cpf: string; endereco: string; cidade: string }) => {
    const origem = dadosFormulario || novoFornecedorCadastro;
    const tipoPessoa = origem.tipoPessoa === 'fisica' ? 'fisica' : 'juridica';
    const razaoSocial = (origem.razaoSocial || '').trim();
    const nomeFantasia = (origem.nomeFantasia || '').trim();
    const cnpj = (origem.cnpj || '').trim();
    const nomePessoaFisica = (origem.nomePessoaFisica || '').trim();
    const cpf = (origem.cpf || '').trim();
    const endereco = (origem.endereco || '').trim();
    const cidade = (origem.cidade || '').trim();
    if (tipoPessoa === 'juridica' && (!razaoSocial || !nomeFantasia || !cnpj)) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Preencha razão social, nome fantasia e CNPJ.' });
      return;
    }
    if (tipoPessoa === 'fisica' && (!nomePessoaFisica || !cpf)) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Preencha o nome da pessoa física e o CPF.' });
      return;
    }
    if (cnpj && fornecedoresCotacao.some(fornecedor => fornecedor.cnpj === cnpj)) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Este CNPJ já está cadastrado.' });
      return;
    }
    if (cpf && fornecedoresCotacao.some(fornecedor => fornecedor.cpf === cpf)) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Este CPF já está cadastrado.' });
      return;
    }
    const novoFornecedor: FornecedorCotacao = tipoPessoa === 'fisica'
      ? {
          id: `f_cad_${Date.now()}`,
          nome: nomePessoaFisica.toUpperCase(),
          tipoPessoa,
          nomePessoaFisica,
          cpf,
          endereco: endereco || undefined,
          cidade: cidade || undefined
        }
      : {
          id: `f_cad_${Date.now()}`,
          nome: nomeFantasia.toUpperCase(),
          tipoPessoa,
          razaoSocial,
          nomeFantasia,
          cnpj,
          endereco: endereco || undefined,
          cidade: cidade || undefined
        };
    const novos = [...fornecedoresCotacao, novoFornecedor];
    setFornecedoresCotacao(novos);
    setNovoFornecedorCadastro({ razaoSocial: '', nomeFantasia: '', cnpj: '', nomePessoaFisica: '', cpf: '', endereco: '', cidade: '' });
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
    if (menor !== Infinity) return { menorPreco: menor, vencedorFornId };
    if (somenteFornecedores?.length) {
      const ultimo = Number(item?.ultimoPrecoCompra);
      if (Number.isFinite(ultimo) && ultimo > 0) {
        return { menorPreco: ultimo, vencedorFornId: somenteFornecedores[0] };
      }
    }
    return { menorPreco: null, vencedorFornId: '' };
  };

  const garantirEmbalagensNaCotacao = () => {
    setItensCotacao(atuais => {
      const base = Array.isArray(atuais) ? atuais : [];
      const montados = montarItensEmbalagens(base);
      const porId = new Map(montados.map(item => [item.id, item]));
      let mudou = false;
      const atualizados = base.map(item => {
        const catalogo = porId.get(item.id);
        if (!catalogo) return item;
        const precisaPreco = !(Number(item.ultimoPrecoCompra) > 0) && Number(catalogo.ultimoPrecoCompra) > 0;
        const precisaSecao = item.secao !== 'Embalagens';
        if (!precisaPreco && !precisaSecao) return item;
        mudou = true;
        return {
          ...item,
          secao: 'Embalagens',
          ultimoPrecoCompra: precisaPreco ? catalogo.ultimoPrecoCompra : item.ultimoPrecoCompra
        };
      });
      const ids = new Set(atualizados.map(item => item.id));
      const novos = montados.filter(item => !ids.has(item.id));
      if (!novos.length && !mudou) return base;
      return [...atualizados, ...novos];
    });
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

  const gravarCustosCatalogo = (proximo: CustosCatalogoState) => {
    custosCatalogoRef.current = proximo;
    setCustosCatalogo(proximo);
    localStorage.setItem('rm_custos_catalogo', JSON.stringify(proximo));
  };

  const registrarCustosPedido = (linhas: Array<{ id?: string; produto?: string; nome?: string; valorUnitario?: number }>) => {
    const resultado = registrarCustosDoPedido(custosCatalogoRef.current, linhas);
    if (resultado.alterados) gravarCustosCatalogo(resultado.estado);
    return resultado.alterados;
  };

  const atualizarVendaSecao = (secao: string, porcentagem: number) => {
    const resultado = aplicarMargemSecao(custosCatalogoRef.current, secao, porcentagem);
    if (resultado.atualizados) {
      gravarCustosCatalogo(resultado.estado);
      gravarNaWeb();
      setAlerta({ tipo: 'sucesso', msg: `✓ ${resultado.atualizados} produto${resultado.atualizados > 1 ? 's' : ''} de ${secao} com preço de venda atualizado.` });
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

  const salvarRelatorioPedidoCotacao = (escopo?: {
    itens?: ItemCotacao[];
    fornecedores?: FornecedorCotacao[];
    somenteFornecedores?: string[];
    enviarConferencia?: boolean;
  }) => {
    const itensFonte = Array.isArray(escopo?.itens) ? escopo.itens : itensCotacao;
    const fornecedoresFonte = Array.isArray(escopo?.fornecedores) && escopo.fornecedores.length
      ? escopo.fornecedores
      : fornecedoresCotacao;
    const idsForn = escopo?.somenteFornecedores;
    const enviarConferencia = Boolean(escopo?.enviarConferencia);
    const relatoriosNovos = fornecedoresFonte.map(fornecedor => {
      const itensFornecedor = itensFonte.filter(item => {
        const quantidade = qtdPedirNumero(item);
        return quantidade > 0 && calcularMenorPrecoItem(item, idsForn).vencedorFornId === fornecedor.id;
      }).map(item => {
        const { menorPreco } = calcularMenorPrecoItem(item, idsForn);
        const quantidade = qtdPedirNumero(item);
        return {
          produto: item.produto,
          unit: item.unit,
          quantidade: item.qtdPedir,
          valorUnitario: menorPreco || 0,
          valorTotal: (menorPreco || 0) * quantidade,
          fornecedor: fornecedor.nomeFantasia || fornecedor.nome || fornecedor.razaoSocial || 'Fornecedor'
        };
      });
      if (itensFornecedor.length === 0) return null;
      return {
        id: `pedido_${fornecedor.id}_${Date.now()}`,
        data: new Date().toLocaleString('pt-BR'),
        itens: itensFornecedor,
        totalGeral: itensFornecedor.reduce((total, item) => total + item.valorTotal, 0),
        enviadoConferencia
      } as RelatorioPedidoCotacao;
    }).filter((relatorio): relatorio is RelatorioPedidoCotacao => relatorio !== null);
    if (relatoriosNovos.length === 0) return false;
    registrarCustosPedido(relatoriosNovos.flatMap(relatorio => relatorio.itens.map(item => ({
      produto: item.produto,
      valorUnitario: item.valorUnitario
    }))));
    const idsSalvos = new Set(
      itensFonte.filter(item => qtdPedirNumero(item) > 0 && calcularMenorPrecoItem(item, idsForn).vencedorFornId).map(item => item.id)
    );
    const itensLimpos = itensCotacao.map(item => idsSalvos.has(item.id) ? { ...item, qtdPedir: '' } : item);
    const atualizados = [...relatoriosNovos, ...(Array.isArray(relatoriosPedidosRef.current) ? relatoriosPedidosRef.current : [])].slice(0, 50);
    relatoriosPedidosRef.current = atualizados;
    setRelatoriosPedidosCotacao(atualizados);
    try { localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(atualizados)); } catch { /* ignora cota */ }
    itensCotacaoRef.current = itensLimpos;
    setItensCotacao(itensLimpos);
    localStorage.setItem('rm_itens_cotacao', JSON.stringify(itensLimpos));
    gravarNaWeb(undefined, undefined, undefined, undefined, itensLimpos);
    if (enviarConferencia) {
      setMostrarRelatoriosCotacao(false);
      setTabAtiva('conferencia');
    } else {
      setMostrarRelatoriosCotacao(true);
    }
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

  const salvarPedidoFornecedor = (
    fornecedor: FornecedorCotacao,
    itensFornecedor: ItemCotacao[],
    escopo?: { somenteFornecedores?: string[]; enviarConferencia?: boolean }
  ) => {
    try {
    const idsForn = escopo?.somenteFornecedores;
    const enviarConferencia = Boolean(escopo?.enviarConferencia);
    const idsItens = new Set(itensFornecedor.map(item => item.id));
    const itensAtualizados = itensCotacao.map(item => idsItens.has(item.id)
      ? { ...item, ultimoPrecoCompra: calcularMenorPrecoItem(item, idsForn).menorPreco || item.ultimoPrecoCompra, qtdPedir: '' }
      : item);
    const itens = itensFornecedor.map(item => {
      const { menorPreco } = calcularMenorPrecoItem(item, idsForn);
      const quantidade = qtdPedirNumero(item);
      return {
        produto: item.produto,
        unit: item.unit,
        quantidade: item.qtdPedir,
        valorUnitario: menorPreco || 0,
        valorTotal: (menorPreco || 0) * quantidade,
        fornecedor: fornecedor.nomeFantasia || fornecedor.nome || fornecedor.razaoSocial || 'Fornecedor'
      };
    });
    const novoRelatorio: RelatorioPedidoCotacao = {
      id: `pedido_${Date.now()}`,
      data: new Date().toLocaleString('pt-BR'),
      itens,
      totalGeral: itens.reduce((total, item) => total + item.valorTotal, 0),
      enviadoConferencia: enviarConferencia ? true : false
    };
    const atualizados = [novoRelatorio, ...(Array.isArray(relatoriosPedidosRef.current) ? relatoriosPedidosRef.current : [])].slice(0, 50);
    relatoriosPedidosRef.current = atualizados;
    setRelatoriosPedidosCotacao(atualizados);
    try { localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(atualizados)); } catch { /* ignora cota */ }
    itensCotacaoRef.current = itensAtualizados;
    setItensCotacao(itensAtualizados);
    localStorage.setItem('rm_itens_cotacao', JSON.stringify(itensAtualizados));
    registrarCustosPedido(itensFornecedor.map(item => ({
      id: item.id,
      produto: item.produto,
      valorUnitario: calcularMenorPrecoItem(item, idsForn).menorPreco || 0
    })));
    gravarNaWeb(undefined, undefined, undefined, undefined, itensAtualizados);
    if (enviarConferencia) {
      setMostrarRelatoriosCotacao(false);
      setTabAtiva('conferencia');
      setAlerta({ tipo: 'sucesso', msg: `✓ Pedido de ${fornecedor.nome} enviado para a Conferência.` });
      return true;
    }
    setMostrarRelatoriosCotacao(true);
    setAlerta({ tipo: 'sucesso', msg: `✓ Pedido de ${fornecedor.nome} salvo. Ficou em Pedidos salvos. A tela não mudou.` });
    return true;
    } catch (erro) {
      console.error(erro);
      setAlerta({ tipo: 'erro', msg: '⚠️ Não foi possível salvar o pedido. Tente de novo.' });
      return false;
    }
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

  const criarPedidoNaConferencia = (dados: {
    fornecedor: string;
    data: string;
    itens: { produto: string; unit: string; quantidade: string; valorUnitario: number; valorTotal: number }[];
    pdf?: { nome: string; conteudo: string };
  }) => {
    const fornecedor = dados.fornecedor.trim();
    if (!fornecedor) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Informe o nome do fornecedor.' });
      return false;
    }
    const itensValidos = (dados.itens || []).filter(item => item.produto.trim());
    if (itensValidos.length === 0 && !dados.pdf) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Adicione pelo menos um produto ou anexe um PDF.' });
      return false;
    }
    const itens = (itensValidos.length
      ? itensValidos
      : [{ produto: 'Pedido em PDF anexado', unit: '-', quantidade: '-', valorUnitario: 0, valorTotal: 0 }]
    ).map(item => ({
      produto: item.produto.trim(),
      unit: (item.unit || 'Und').trim() || 'Und',
      quantidade: item.quantidade || '1',
      valorUnitario: Number(item.valorUnitario) || 0,
      valorTotal: Number(item.valorTotal) || 0,
      fornecedor
    }));
    const novoRelatorio: RelatorioPedidoCotacao = {
      id: `pedido_avulso_${Date.now()}`,
      data: dados.data || new Date().toLocaleString('pt-BR'),
      itens,
      totalGeral: itens.reduce((total, item) => total + (Number(item.valorTotal) || 0), 0),
      enviadoConferencia: true,
      pdfFornecedor: dados.pdf
        ? { nome: dados.pdf.nome, conteudo: dados.pdf.conteudo, anexadoEm: new Date().toLocaleString('pt-BR') }
        : undefined
    };
    const atualizados = [novoRelatorio, ...relatoriosPedidosRef.current].slice(0, 50);
    relatoriosPedidosRef.current = atualizados;
    setRelatoriosPedidosCotacao(atualizados);
    localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(atualizados));
    gravarNaWeb();
    setAbaConferencia('pedidos');
    setAlerta({ tipo: 'sucesso', msg: `✓ Pedido de ${fornecedor} criado e enviado para Pedidos Pendentes.` });
    return true;
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
    setConferenciasPorPedido(prev => {
      const atual = { conferente: '', valor: '', obs: '', divergencia: false, tipoDivergencia: '' as TipoDivergencia, ...prev[pedidoId], [campo]: valor };
      if (campo === 'tipoDivergencia') atual.divergencia = Boolean(valor);
      return { ...prev, [pedidoId]: atual };
    });
  };

  const salvarConferenciaPedido = (relatorio: RelatorioPedidoCotacao, formularioInformado?: { conferente: string; valor: string; obs: string; divergencia: boolean; tipoDivergencia: TipoDivergencia }) => {
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

  const urlPdfParaVisualizar = (conteudo: string) => {
    if (!conteudo) return '';
    if (conteudo.startsWith('blob:')) return conteudo;
    if (!conteudo.startsWith('data:')) return conteudo;
    try {
      const [meta, data] = conteudo.split(',');
      const binario = atob(data || '');
      const bytes = new Uint8Array(binario.length);
      for (let i = 0; i < binario.length; i += 1) bytes[i] = binario.charCodeAt(i);
      const tipo = /data:([^;]+)/.exec(meta || '')?.[1] || 'application/pdf';
      return URL.createObjectURL(new Blob([bytes], { type: tipo }));
    } catch {
      return conteudo;
    }
  };

  const visualizarPdfFornecedor = (relatorio: RelatorioPedidoCotacao) => {
    if (!relatorio.pdfFornecedor) return;
    setPdfFornecedorVisualizacao({
      nome: relatorio.pdfFornecedor.nome,
      conteudo: urlPdfParaVisualizar(relatorio.pdfFornecedor.conteudo)
    });
  };

  const visualizarPedidoLancadoPdf = (relatorio: RelatorioPedidoCotacao) => {
    const itens = Array.isArray(relatorio.itens) ? relatorio.itens : [];
    const linhas = itens.map(item => ({
      produto: item.produto,
      unit: item.unit,
      quantidade: String(item.quantidade ?? ''),
      valorUnitario: Number(item.valorUnitario) || 0,
      valorTotal: Number(item.valorTotal) || 0
    }));
    const fornecedor = itens[0]?.fornecedor || 'Fornecedor';
    const blob = gerarPdfPedidoFornecedor(fornecedor, linhas, Number(relatorio.totalGeral) || 0, relatorio.data);
    const url = URL.createObjectURL(blob);
    setPdfFornecedorVisualizacao({ nome: `Pedido ${fornecedor}.pdf`, conteudo: url });
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

  const imprimirPedidoIndividual = (fornecedor: FornecedorCotacao, itensInformados?: ItemCotacao[]) => {
    const itensDoFornecedor = Array.isArray(itensInformados) ? itensInformados : itensCotacao.filter(item => {
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
      fornecedor: novaConferencia.fornecedor.trim() || undefined,
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
      fornecedor: '',
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
    if (!window.confirm('Tem certeza que deseja excluir esta conferência?')) return;
    const novasConferencias = (conferenciasRef.current || []).filter(conf => conf.id !== id);
    const deletadas = unirIds(conferenciasDeletadasRef.current, [id]);
    conferenciasDeletadasRef.current = deletadas;
    setConferenciasDeletadas(deletadas);
    localStorage.setItem('rm_conferencias_deletadas', JSON.stringify(deletadas));
    conferenciasRef.current = novasConferencias;
    setConferencias(novasConferencias);
    localStorage.setItem('rm_conferencias', JSON.stringify(novasConferencias));
    localStorage.setItem('rm_backup_conferencia', JSON.stringify({ conferencias: novasConferencias }));
    gravarNaWeb(undefined, undefined, undefined, undefined, undefined, undefined, novasConferencias);
    setAlerta({ tipo: 'sucesso', msg: '✓ Conferência excluída!' });
    setTimeout(() => setAlerta(null), 3000);
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
  const telaInteiraAtiva = ['conferencia', 'cotacao', 'pagamentos', 'elieuda', 'relatorios', 'seguranca', 'manutencao', 'producao'].includes(tabAtiva) || (tabAtiva === 'pendencias' && sairTelaInteira);
  const ordensLista = (Array.isArray(ordensManutencao) ? ordensManutencao : []).filter(ordem => !ordensManutencaoDeletadasRef.current.includes(ordem.id));
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
  const conferenciasLista = (Array.isArray(conferencias) ? conferencias : []).filter(conf => !conferenciasDeletadasRef.current.includes(conf.id));
  const relatoriosPedidosLista = (Array.isArray(relatoriosPedidosCotacao) ? relatoriosPedidosCotacao : []).filter(relatorio => !pedidosCotacaoDeletadosRef.current.includes(relatorio.id));
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
          className={classeAba(['compras', 'cotacao', 'cadastroProdutos', 'cadastroFornecedores', 'pagamentos', 'reciboComprador', 'elieuda', 'conferencia'].includes(tabAtiva))}
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
      {usuarioLogado?.permissoes.producao && (
        <button onClick={() => setTabAtiva('producao')} className={classeAba(tabAtiva === 'producao')}>Produção</button>
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
              conferencias={conferenciasLista}
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
            <AbaPendencias
              adicionarTarefaCentral={adicionarTarefaCentral}
              alternarStatusTarefa={alternarStatusTarefa}
              escolherFotoPendencia={escolherFotoPendencia}
              filtroResponsavel={filtroResponsavel}
              filtroStatusTarefas={filtroStatusTarefas}
              fotoAmpliada={fotoAmpliada}
              mostrarHistoricoDelete={mostrarHistoricoDelete}
              mudarResponsavel={mudarResponsavel}
              nomeSetorSemEmoji={nomeSetorSemEmoji}
              novaTarefaCentral={novaTarefaCentral}
              novaTarefaFoto={novaTarefaFoto}
              recuperarTarefa={recuperarTarefa}
              removerTarefa={removerTarefa}
              responsavelSelecionado={responsavelSelecionado}
              sairTelaInteira={sairTelaInteira}
              setFiltroResponsavel={setFiltroResponsavel}
              setFiltroStatusTarefas={setFiltroStatusTarefas}
              setFotoAmpliada={setFotoAmpliada}
              setMostrarHistoricoDelete={setMostrarHistoricoDelete}
              setNovaTarefaCentral={setNovaTarefaCentral}
              setNovaTarefaFoto={setNovaTarefaFoto}
              setResponsavelSelecionado={setResponsavelSelecionado}
              setSairTelaInteira={setSairTelaInteira}
              setSetorSelecionadoNovaTarefa={setSetorSelecionadoNovaTarefa}
              setorRealDaTarefa={setorRealDaTarefa}
              setorSelecionadoNovaTarefa={setorSelecionadoNovaTarefa}
              setores={setores}
              setoresExibidos={setoresExibidos}
              statusDaTarefa={statusDaTarefa}
              tarefasDeletadas={tarefasDeletadas}
              taxaConclusaoGeral={taxaConclusaoGeral}
              totalAbertasGeral={totalAbertasGeral}
              totalConcluidasGeral={totalConcluidasGeral}
              usuariosDoSistema={usuariosDoSistema}
            />
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
              ordensManutencao={ordensLista}
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

          {tabAtiva === 'producao' && usuarioLogado?.permissoes.producao && (
            <AbaProducao
              produtos={produtosProducao}
              lancamentos={lancamentosProducao}
              lancamentosRota={lancamentosRota}
              salvarProduto={salvarProdutoProducao}
              adicionarLancamento={adicionarLancamentoProducao}
              removerLancamento={removerLancamentoProducao}
              adicionarRota={adicionarLancamentoRota}
              removerRota={removerLancamentoRota}
              contasDeposito={contasDeposito}
              lancamentosDeposito={lancamentosDeposito}
              salvarContaDeposito={salvarContaDeposito}
              adicionarDeposito={adicionarLancamentoDeposito}
              removerDeposito={removerLancamentoDeposito}
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
              custosCatalogo={custosCatalogo}
              aplicarMargemSecao={atualizarVendaSecao}
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
            <AbaPagamentos
              adicionarPagamentoCaben={adicionarPagamentoCaben}
              adicionarPagamentoCaixa={adicionarPagamentoCaixa}
              adicionarPagamentoCheque={adicionarPagamentoCheque}
              enviarRelatorioPagamentosPdf={enviarRelatorioPagamentosPdf}
              fecharLotePagamentos={fecharLotePagamentos}
              historicoPagamentos={historicoPagamentos}
              imprimirRelatorioPagamentos={imprimirRelatorioPagamentos}
              listaCabenSegura={listaCabenSegura}
              listaCaixaSegura={listaCaixaSegura}
              listaChequeSegura={listaChequeSegura}
              mostrarPastaHistorico={mostrarPastaHistorico}
              novoCaben={novoCaben}
              novoCaixa={novoCaixa}
              novoCheque={novoCheque}
              pagamentos={pagamentos}
              removerLoteHistorico={removerLoteHistorico}
              removerPagamento={removerPagamento}
              setMostrarPastaHistorico={setMostrarPastaHistorico}
              setNovoCaben={setNovoCaben}
              setNovoCaixa={setNovoCaixa}
              setNovoCheque={setNovoCheque}
              setTabAtiva={setTabAtiva}
              totalCaben={totalCaben}
              totalCaixa={totalCaixa}
              totalCheque={totalCheque}
              totalGeralPagamentos={totalGeralPagamentos}
            />
          )}

          {tabAtiva === 'reciboComprador' && usuarioLogado?.permissoes.pagamentos && (
            <AbaReciboComprador setTabAtiva={setTabAtiva} fornecedoresCotacao={fornecedoresCotacao} itensCotacao={itensCotacao} />
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
            <AbaConferencia
              abaConferencia={abaConferencia}
              adicionarConferencia={adicionarConferencia}
              anexarPdfFornecedor={anexarPdfFornecedor}
              arquivoConferencia={arquivoConferencia}
              atualizarConferenciaPedido={atualizarConferenciaPedido}
              buscaFornecedorConferencia={buscaFornecedorConferencia}
              conferencias={conferenciasLista}
              conferenciasFiltradas={conferenciasFiltradas}
              conferenciasPorPedido={conferenciasPorPedido}
              criarPedidoNaConferencia={criarPedidoNaConferencia}
              divergenciasFiltradas={divergenciasFiltradas}
              fornecedoresCotacao={fornecedoresCotacao}
              enviarPdfConferenciaCompartilhado={enviarPdfConferenciaCompartilhado}
              excluirConferencia={excluirConferencia}
              excluirPedidoNaConferencia={excluirPedidoNaConferencia}
              importarBackupConferencia={importarBackupConferencia}
              imprimirRelatorioConferencia={imprimirRelatorioConferencia}
              novaConferencia={novaConferencia}
              pedidosPendentesConferencia={pedidosPendentesConferencia}
              pedidosPendentesFiltrados={pedidosPendentesFiltrados}
              pedidosPendentesTotal={pedidosPendentesTotal}
              pedidosRealizadosTotal={pedidosRealizadosTotal}
              podeExcluirPedidoConferencia={podeExcluirPedidoConferencia}
              relatoriosPedidosCotacao={relatoriosPedidosCotacao}
              removerPdfConferenciaCompartilhado={removerPdfConferenciaCompartilhado}
              salvarConferenciaPedido={salvarConferenciaPedido}
              setAbaConferencia={setAbaConferencia}
              setBuscaFornecedorConferencia={setBuscaFornecedorConferencia}
              setNovaConferencia={setNovaConferencia}
              setPdfFornecedorVisualizacao={setPdfFornecedorVisualizacao}
              setTabAtiva={setTabAtiva}
              visualizarPedidoLancadoPdf={visualizarPedidoLancadoPdf}
              visualizarPdfFornecedor={visualizarPdfFornecedor}
            />
          )}

          {pdfFornecedorVisualizacao && (
            <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-slate-900/85 p-2">
              <div className="flex h-[96vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-200 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">📄</span>
                    <div>
                      <strong className="block text-sm text-slate-900">{pdfFornecedorVisualizacao.nome}</strong>
                      <span className="text-[10px] text-slate-500">Pedido completo em PDF. Role para ver todas as páginas.</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <a href={pdfFornecedorVisualizacao.conteudo} download={pdfFornecedorVisualizacao.nome} className="cursor-pointer rounded-lg bg-teal-700 px-3 py-1.5 text-[11px] font-bold text-white no-underline hover:bg-teal-600">
                      Baixar
                    </a>
                    <button type="button" onClick={() => window.open(pdfFornecedorVisualizacao.conteudo, '_blank')} className="cursor-pointer rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
                      Abrir nova aba
                    </button>
                    <button type="button" onClick={() => setPdfFornecedorVisualizacao(null)} className="cursor-pointer rounded-lg bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100">
                      Fechar
                    </button>
                  </div>
                </div>
                <div className="min-h-0 flex-1 bg-slate-700">
                  <iframe src={`${pdfFornecedorVisualizacao.conteudo}#view=FitH&toolbar=1`} title="PDF do pedido" className="h-full w-full border-0" />
                </div>
              </div>
            </div>
          )}

      {tabAtiva === 'relatorios' && (
        <AbaRelatorios
          calcularMenorPrecoItem={calcularMenorPrecoItem}
          conferencias={conferenciasLista}
          dataSelecionada={dataSelecionada}
          enviarPedidoWhatsAppPdf={enviarPedidoWhatsAppPdf}
          fornecedoresCotacao={fornecedoresCotacao}
          imprimirPedidoIndividual={imprimirPedidoIndividual}
          imprimirRelatorioPedidosPorVendedor={imprimirRelatorioPedidosPorVendedor}
          itensCotacao={itensCotacao}
          nomeSetorSemEmoji={nomeSetorSemEmoji}
          pagamentos={pagamentos}
          qtdPedirNumero={qtdPedirNumero}
          relatoriosPorData={relatoriosPorData}
          setDataSelecionada={setDataSelecionada}
          setTabAtiva={setTabAtiva}
          setores={setores}
        />
      )}

      {tabAtiva === 'seguranca' && (
        <AbaSeguranca
          PERMISSOES_OPCOES={PERMISSOES_OPCOES}
          USUARIOS_SISTEMA={USUARIOS_SISTEMA}
          adicionarNovoUsuario={adicionarNovoUsuario}
          alterarPermissaoUsuario={alterarPermissaoUsuario}
          confirmarSenha={confirmarSenha}
          erroNovoUsuario={erroNovoUsuario}
          erroSenha={erroSenha}
          fazerLogout={fazerLogout}
          historicoBackupsUsuario={historicoBackupsUsuario}
          novaSenha={novaSenha}
          novoUsuarioNome={novoUsuarioNome}
          novoUsuarioPermissoes={novoUsuarioPermissoes}
          novoUsuarioSenha={novoUsuarioSenha}
          redefinirSenhaUsuario={redefinirSenhaUsuario}
          removerUsuarioCadastrado={removerUsuarioCadastrado}
          restaurarBackupDoUsuarioAtual={restaurarBackupDoUsuarioAtual}
          rotuloPermissoes={rotuloPermissoes}
          salvandoSenha={salvandoSenha}
          salvarMinhaSenha={salvarMinhaSenha}
          senhasUsuarios={senhasUsuarios}
          setConfirmarSenha={setConfirmarSenha}
          setNovaSenha={setNovaSenha}
          setNovoUsuarioNome={setNovoUsuarioNome}
          setNovoUsuarioPermissoes={setNovoUsuarioPermissoes}
          setNovoUsuarioSenha={setNovoUsuarioSenha}
          setTabAtiva={setTabAtiva}
          statusSalvoSeguranca={statusSalvoSeguranca}
          usuarioLogado={usuarioLogado}
          usuarioPermissaoSalvaId={usuarioPermissaoSalvaId}
          usuariosDoSistema={usuariosDoSistema}
        />
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