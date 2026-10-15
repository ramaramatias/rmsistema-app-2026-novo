import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AbaDados } from './abas/dados/AbaDados';
import { AbaCotacao } from './abas/cotacao/AbaCotacao';
import { AbaElieuda } from './abas/elieuda/AbaElieuda';
import { AbaManutencao } from './abas/manutencao/AbaManutencao';
import { AbaCadastroProdutos } from './abas/cadastro-produtos/AbaCadastroProdutos';
import { AbaCadastroFornecedores } from './abas/cadastro-fornecedores/AbaCadastroFornecedores';
import { AbaCompras } from './abas/compras/AbaCompras';
import { AbaConciliacao } from './abas/conciliacao/AbaConciliacao';
import { AbaConciliacaoCompras } from './abas/conciliacao/AbaConciliacaoCompras';
import { AbaHistoricoConciliacao } from './abas/conciliacao/AbaHistoricoConciliacao';
import { AbaArquivoCeasa } from './abas/conciliacao/AbaArquivoCeasa';
import { AbaInteligenciaEstoque } from './abas/conciliacao/AbaInteligenciaEstoque';
import { AbaPendencias } from './abas/pendencias/AbaPendencias';
import { AbaChecklist } from './abas/checklist/AbaChecklist';
import { AbaConferencia } from './abas/conferencia/AbaConferencia';
import { AbaNotasConferidas } from './abas/conferencia/AbaNotasConferidas';
import { AbaPagamentos } from './abas/pagamentos/AbaPagamentos';
import { AbaReciboComprador } from './abas/recibo-comprador/AbaReciboComprador';
import { AbaRelatorios } from './abas/relatorios/AbaRelatorios';
import { AbaSeguranca } from './abas/seguranca/AbaSeguranca';
import { AbaProducao } from './abas/producao/AbaProducao';
import { AbaCaixaOperacional } from './abas/caixa-operacional/AbaCaixaOperacional';
import { AbaEstoque } from './abas/estoque/AbaEstoque';
import type { ItemListaCompleta } from './catalogo/listaCompleta';
import { acharItemCatalogoCotacao, montarItensEmbalagens, montarItensLaticinios } from './catalogo/secoesDados';
import { aplicarCustosRecebidos, aplicarMargemSecao, custosCatalogoVazio, lerCustosCatalogo, registrarCustosDoPedido, type CustosCatalogoState } from './catalogo/custosCatalogo';
import type {
  ArquivoConferencia,
  DadosConferenciaFornecedor,
  FornecedorCotacao,
  ItemCotacao,
  LotePagamentoHistorico,
  LancamentoProducao,
  LancamentoRota,
  LancamentoDeposito,
  MovimentoCaixaOperacional,
  OrdemManutencao,
  ItemChecklist,
  PagamentosState,
  PedidoCompra,
  ProdutoElieuda,
  QuantidadesElieuda,
  RegistroConferencia,
  RelatorioPedidoCotacao,
  LoteConciliacao,
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
  NOMES_VISTO_FINANCEIRO,
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
import { abrirPdfComoArquivo, dispararDownloadPdf, enviarAnexoPdfBytes, enviarAnexoPdfNuvem, garantirAnexoNaNuvem, guardarAnexoLocal, urlArquivoAnexo } from './util/anexoPdf';
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
  marcasItensDoLote,
  unirPagamentosAbertos,
  unirPedidosCotacao,
  unirLancamentosProducao,
  unirLancamentosRota,
  unirLancamentosDeposito,
  unirMovimentosCaixaOperacional,
  unirNomesProdutosProducao,
  unirFornecedoresCotacao,
  unirQuantidadesElieuda,
  unirTarefasDeletadas,
  expirarTarefasDeletadas
} from './util/mesclar';
import { mesclarChecklist } from './util/checklist';
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
import { mesAtualChave } from './abas/pagamentos/relatorioPagamentos';
import { unirLotesConciliacao } from './abas/conciliacao/lotesConciliacao';
import { unirLotesInteligencia, type LoteInteligencia } from './abas/conciliacao/lotesInteligencia';

// ==========================================
// 🔑 CONFIGURAÇÕES & CREDENCIAIS
// ==========================================
const SENHA_MEU_SISTEMA = import.meta.env.VITE_SYSTEM_PASSWORD || '1234';















// 🥕 72 PRODUTOS DE HORTIFRÚTI DA DONA ELIEUDA







limparChavesLocaisPesadas();
























































function App() {
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<string>('');
  const [senhaDigitada, setSenhaDigitada] = useState('');
  const [mostrarSenhaLogin, setMostrarSenhaLogin] = useState(false);
  const [erroLogin, setErroLogin] = useState(false);
  const [agoraLogin, setAgoraLogin] = useState(() => new Date());
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

  const [tabAtiva, setTabAtiva] = useState<'inicio' | 'pendencias' | 'checklist' | 'compras' | 'cotacao' | 'cadastroProdutos' | 'cadastroFornecedores' | 'pagamentos' | 'consultaPagamentos' | 'reciboComprador' | 'elieuda' | 'conferencia' | 'notasConferidas' | 'relatorios' | 'seguranca' | 'manutencao' | 'dados' | 'producao' | 'caixaOperacional' | 'estoque' | 'conciliacao' | 'conciliacaoCompras' | 'arquivoCeasa' | 'inteligenciaEstoque' | 'consultasConciliacao'>('inicio');
  const [itensChecklist, setItensChecklist] = useState<ItemChecklist[]>(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem('rm_checklist_items') || '[]');
      return Array.isArray(salvo) ? salvo : [];
    } catch {
      return [];
    }
  });
  const [itensChecklistDeletados, setItensChecklistDeletados] = useState<string[]>(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem('rm_checklist_deletados') || '[]');
      return Array.isArray(salvo) ? salvo : [];
    } catch {
      return [];
    }
  });
  const itensChecklistRef = useRef(itensChecklist);
  const itensChecklistDeletadosRef = useRef(itensChecklistDeletados);
  itensChecklistRef.current = itensChecklist;
  itensChecklistDeletadosRef.current = itensChecklistDeletados;
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

  const [movimentosCaixaOperacional, setMovimentosCaixaOperacional] = useState<MovimentoCaixaOperacional[]>(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem('rm_caixa_operacional') || '[]');
      return Array.isArray(salvo) ? salvo : [];
    } catch {
      return [];
    }
  });
  const [movimentosCaixaDeletados, setMovimentosCaixaDeletados] = useState<string[]>(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem('rm_caixa_operacional_deletados') || '[]');
      return Array.isArray(salvo) ? salvo : [];
    } catch {
      return [];
    }
  });
  const movimentosCaixaRef = useRef(movimentosCaixaOperacional);
  const movimentosCaixaDeletadosRef = useRef(movimentosCaixaDeletados);
  movimentosCaixaRef.current = movimentosCaixaOperacional;
  movimentosCaixaDeletadosRef.current = movimentosCaixaDeletados;

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
  const [lotesPagamentoDeletados, setLotesPagamentoDeletados] = useState<string[]>(() => {
    try {
      const salvo = localStorage.getItem('rm_lotes_pagamento_deletados');
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });
  const lotesPagamentoDeletadosRef = useRef(lotesPagamentoDeletados);
  lotesPagamentoDeletadosRef.current = lotesPagamentoDeletados;

  // Carregar pagamentos do backup_completo.json se existir
  const carregarPagamentosBackup = () => {
    try {
      const direto = resgatarBackupGeral('rm_pagamentos', null);
      const backupStr = localStorage.getItem('rm_backup_completo');
      const backup = backupStr ? JSON.parse(backupStr) : null;
      const lotes = unirLotesPagamento(
        lotesPagamentoDeletadosRef.current,
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
        lotesPagamentoDeletadosRef.current,
        resgatarBackupGeral('rm_historico_pagamentos', []),
        Array.isArray(backup?.historicoPagamentos) ? backup.historicoPagamentos : []
      );
    } catch (e) {
      console.error('Erro ao carregar histórico:', e);
    }
    return resgatarBackupGeral('rm_historico_pagamentos', []);
  });
  const [lotesConciliacao, setLotesConciliacao] = useState<LoteConciliacao[]>(() => {
    const salvo = resgatarBackupGeral('rm_lotes_conciliacao', []);
    return Array.isArray(salvo) ? unirLotesConciliacao(salvo) : [];
  });
  const [lotesInteligencia, setLotesInteligencia] = useState<LoteInteligencia[]>(() => {
    const salvo = resgatarBackupGeral('rm_lotes_inteligencia', []);
    return Array.isArray(salvo) ? unirLotesInteligencia(salvo) : [];
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
  const lotesConciliacaoRef = useRef(lotesConciliacao);
  const lotesInteligenciaRef = useRef(lotesInteligencia);
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
  lotesConciliacaoRef.current = lotesConciliacao;
  lotesInteligenciaRef.current = lotesInteligencia;
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
  const [conferenciasPorPedido, setConferenciasPorPedido] = useState<{ [pedidoId: string]: { conferente: string; valor: string; obs: string; divergencia: boolean; tipoDivergencia: TipoDivergencia; veioBonificacao: '' | 'sim' | 'nao'; categoria: string } }>({});
  const [pedidosConferidosLocais, setPedidosConferidosLocais] = useState<string[]>(() => {
    const lista = lerJsonLocal('rm_pedidos_conferidos', []);
    return Array.isArray(lista) ? lista : [];
  });
  const pedidosConferidosRef = useRef(pedidosConferidosLocais);
  pedidosConferidosRef.current = pedidosConferidosLocais;
  const [abaConferencia, setAbaConferencia] = useState<'menu' | 'pedidos' | 'criar' | 'avulsa' | 'conferidos' | 'bonificados' | 'divergencias'>('menu');
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
    // unirTarefasDeletadas já reduz a lápide (só id) o que foi deletado há mais de 7 dias
    return unirTarefasDeletadas(lerJsonLocal('rm_tarefas_deletadas', []), []);
  });
  const tarefasDeletadasRef = useRef(tarefasDeletadas);
  tarefasDeletadasRef.current = tarefasDeletadas;
  const sincronizacaoEmCursoRef = useRef(false);
  const sincronizacaoAdiadaRef = useRef(false);
  const atrasoSyncRef = useRef(0);
  const elieudaAlteradaRef = useRef(false);
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
  const [vistoFinanceiroNome, setVistoFinanceiroNome] = useState(() => {
    try {
      const salvo = localStorage.getItem('rm_visto_financeiro');
      return NOMES_VISTO_FINANCEIRO.includes(salvo || '') ? String(salvo) : NOMES_VISTO_FINANCEIRO[0];
    } catch {
      return NOMES_VISTO_FINANCEIRO[0];
    }
  });
  const escolherVistoFinanceiro = (nome: string) => {
    const escolhido = NOMES_VISTO_FINANCEIRO.includes(nome) ? nome : NOMES_VISTO_FINANCEIRO[0];
    setVistoFinanceiroNome(escolhido);
    localStorage.setItem('rm_visto_financeiro', escolhido);
  };
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
  const [pdfFornecedorVisualizacao, setPdfFornecedorVisualizacao] = useState<{ nome: string; conteudo: string; pedidoId?: string } | null>(null);
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

  useEffect(() => {
    if (!autenticado) return;
    const normalizados = pedidosSemPdfPesado(relatoriosPedidosRef.current);
    relatoriosPedidosRef.current = normalizados;
    setRelatoriosPedidosCotacao(normalizados);
    try { localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(normalizados)); } catch { /* ignora cota */ }
    void (async () => {
      let mudou = false;
      const atuais = [...(relatoriosPedidosRef.current || [])];
      for (const pedido of atuais) {
        if (!pedido.pdfFornecedor?.nome) continue;
        const idAnexo = `pedido_${pedido.id}`;
        try {
          await garantirAnexoNaNuvem(idAnexo, pedido.pdfFornecedor.conteudo);
          const conteudo = urlArquivoAnexo(idAnexo, { nome: pedido.pdfFornecedor.nome });
          if (pedido.pdfFornecedor.conteudo !== conteudo) {
            pedido.pdfFornecedor = { ...pedido.pdfFornecedor, conteudo };
            mudou = true;
          }
        } catch { /* este computador não tem o arquivo para reenviar */ }
      }
      if (!mudou) return;
      relatoriosPedidosRef.current = atuais;
      setRelatoriosPedidosCotacao(atuais);
      try { localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(pedidosSemPdfPesado(atuais))); } catch { /* ignora cota */ }
      await gravarNaWeb();
    })();
  }, [autenticado]);
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

  // 🧹 Limpar automaticamente tarefas concluídas após 7 dias e tirar do histórico as deletadas há mais de 7 dias
  useEffect(() => {
    if (!autenticado) return;
    
    const limparTarefasAntigas = () => {
      const limite = Date.now() - 7 * 24 * 60 * 60 * 1000;

      // Histórico de deletadas: após 7 dias fica só o id (lápide), para a tarefa não voltar pela nuvem
      setTarefasDeletadas(atuais => {
        const expiradas = expirarTarefasDeletadas(atuais);
        const mudou = expiradas.length !== atuais.length || expiradas.some((item, indice) => item !== atuais[indice]);
        if (!mudou) return atuais;
        localStorage.setItem('rm_tarefas_deletadas', JSON.stringify(expiradas));
        return expiradas;
      });

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

    limparTarefasAntigas(); // Roda já ao entrar, sem esperar o primeiro minuto
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
    let consultaNuvemFalhou = false;
    let tempoLimite: number | undefined;
    try {
      const controlador = new AbortController();
      tempoLimite = window.setTimeout(() => controlador.abort(), 25000);
      const resposta = await fetch(`/api/nuvem?t=${Date.now()}`, { signal: controlador.signal, cache: 'no-store' });
      if (!resposta.ok) {
        consultaNuvemFalhou = true;
      } else {
        const dados = await resposta.json();
        if (typeof dados?.versao === 'string' && dados.versao) versaoNuvemRef.current = dados.versao;
        const record = recordDoJsonBin(dados);
        if (record && typeof record === 'object') {
          registroNuvem = record;
          if (Array.isArray(record.itensChecklistDeletados)) {
            const deletados = unirIds(itensChecklistDeletadosRef.current, record.itensChecklistDeletados);
            itensChecklistDeletadosRef.current = deletados;
            setItensChecklistDeletados(deletados);
            localStorage.setItem('rm_checklist_deletados', JSON.stringify(deletados));
          }
          if (Array.isArray(record.itensChecklist)) {
            const itens = mesclarChecklist(itensChecklistDeletadosRef.current, itensChecklistRef.current, record.itensChecklist);
            itensChecklistRef.current = itens;
            setItensChecklist(itens);
            localStorage.setItem('rm_checklist_items', JSON.stringify(itens));
          }
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
      }
    } catch {
      consultaNuvemFalhou = true;
    } finally {
      if (tempoLimite !== undefined) window.clearTimeout(tempoLimite);
    }

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
    const senhaPadraoOk = !hashSalva && senhaDigitada === SENHA_MEU_SISTEMA;
    if (!senhaPessoalOk && !senhaPadraoOk) {
      setErroLogin(true);
      setSenhaDigitada('');
      return;
    }

    setUsuarioLogado(aplicarPermissoesSalvas(usuario, permissoesAtuais));
    if (consultaNuvemFalhou) setStatusNuvem('💾 Só neste aparelho');
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
        if (Array.isArray(dados.itensChecklistDeletados)) {
          const deletados = unirIds(itensChecklistDeletadosRef.current, dados.itensChecklistDeletados);
          itensChecklistDeletadosRef.current = deletados;
          setItensChecklistDeletados(deletados);
          localStorage.setItem('rm_checklist_deletados', JSON.stringify(deletados));
        }
        if (Array.isArray(dados.itensChecklist)) {
          const itens = mesclarChecklist(itensChecklistDeletadosRef.current, itensChecklistRef.current, dados.itensChecklist);
          itensChecklistRef.current = itens;
          setItensChecklist(itens);
          localStorage.setItem('rm_checklist_items', JSON.stringify(itens));
        }
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
            const uniaoLotes = unirLotesPagamento(lotesPagamentoDeletadosRef.current, atuais, dados.historicoPagamentos);
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
        if (Array.isArray(dados.lotesConciliacao)) {
          setLotesConciliacao(atuais => {
            const uniao = unirLotesConciliacao(atuais, dados.lotesConciliacao);
            lotesConciliacaoRef.current = uniao;
            return uniao;
          });
        }
        if (Array.isArray(dados.lotesInteligencia)) {
          setLotesInteligencia(atuais => {
            const uniao = unirLotesInteligencia(atuais, dados.lotesInteligencia);
            lotesInteligenciaRef.current = uniao;
            return uniao;
          });
        }
        if (Array.isArray(dados.pedidosCotacaoDeletados)) {
          const uniaoDel = unirIds(pedidosCotacaoDeletadosRef.current, dados.pedidosCotacaoDeletados);
          pedidosCotacaoDeletadosRef.current = uniaoDel;
          setPedidosCotacaoDeletados(uniaoDel);
          localStorage.setItem('rm_pedidos_cotacao_deletados', JSON.stringify(uniaoDel));
        }
        if (Array.isArray(dados.relatoriosPedidosCotacao)) {
          const uniao = pedidosSemPdfPesado(unirPedidosCotacao(pedidosCotacaoDeletadosRef.current, relatoriosPedidosRef.current, pedidosSemPdfPesado(dados.relatoriosPedidosCotacao)));
          relatoriosPedidosRef.current = uniao;
          setRelatoriosPedidosCotacao(uniao);
          localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(uniao));
        }
        if (dados.relatoriosPorData) setRelatoriosPorData(dados.relatoriosPorData);
        if (dados.ultimaAtualizacao) setUltimaAtualizacao(dados.ultimaAtualizacao);
      } catch {}
    }

    if (Array.isArray(registroNuvem?.historicoPagamentosDeletados)) {
      const uniao = unirIds(lotesPagamentoDeletadosRef.current, registroNuvem.historicoPagamentosDeletados);
      lotesPagamentoDeletadosRef.current = uniao;
      setLotesPagamentoDeletados(uniao);
      localStorage.setItem('rm_lotes_pagamento_deletados', JSON.stringify(uniao));
    }
    if (Array.isArray(registroNuvem?.pagamentosDeletados)) {
      const uniao = unirIds(pagamentosDeletadosRef.current, registroNuvem.pagamentosDeletados);
      pagamentosDeletadosRef.current = uniao;
      setPagamentosDeletados(uniao);
      localStorage.setItem('rm_pagamentos_deletados', JSON.stringify(uniao));
    }
    if (registroNuvem && (registroNuvem.pagamentos || Array.isArray(registroNuvem.historicoPagamentos))) {
      setHistoricoPagamentos(atuais => {
        const uniaoLotes = unirLotesPagamento(lotesPagamentoDeletadosRef.current, atuais, registroNuvem.historicoPagamentos);
        localStorage.setItem('rm_historico_pagamentos', JSON.stringify(uniaoLotes));
        setPagamentos(atuaisPag => {
          const uniaoPag = unirPagamentosAbertos(atuaisPag, registroNuvem.pagamentos, uniaoLotes, pagamentosDeletadosRef.current);
          localStorage.setItem('rm_pagamentos', JSON.stringify(uniaoPag));
          return uniaoPag;
        });
        return uniaoLotes;
      });
    }

    setTabAtiva('inicio');
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
      const gravada = await gravarNaWeb(undefined, undefined, undefined, undefined, undefined, undefined, undefined, [], undefined, atualizadas);
      if (!gravada) {
        setErroSenha('A senha ficou salva apenas neste aparelho. Verifique a conexão e tente novamente.');
        return;
      }
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
    const gravada = await gravarNaWeb(undefined, undefined, undefined, undefined, undefined, undefined, undefined, [], undefined, atualizadas, idAlvo);
    if (!gravada) {
      setAlerta({ tipo: 'erro', msg: '⚠️ A redefinição ficou apenas neste aparelho e não foi gravada na nuvem.' });
      return;
    }
    const nome = unirUsuariosCadastrados(usuariosExtra).find(u => u.id === idAlvo)?.nome || 'usuário';
    setUsuarioResetSenha('');
    setAlerta({ tipo: 'sucesso', msg: `✓ Senha de ${nome} redefinida. No próximo acesso use a senha padrão do sistema e crie uma nova.` });
  };

  const confirmarUsuarioNaNuvem = async (usuarioId: string, novasSenhas?: SenhasUsuarios) => {
    const gravado = await gravarNaWeb(undefined, undefined, undefined, undefined, undefined, undefined, undefined, [], undefined, novasSenhas);
    if (!gravado) return false;

    const resposta = await fetch(`/api/nuvem?t=${Date.now()}`, { cache: 'no-store' });
    if (!resposta.ok) return false;
    const registro = recordDoJsonBin(await resposta.json());
    return Array.isArray(registro?.usuariosExtra) &&
      registro.usuariosExtra.some((usuario: Usuario) => usuario.id === usuarioId);
  };

  const adicionarNovoUsuario = async () => {
    if (usuarioLogado?.tipo !== 'admin') return;
    setErroNovoUsuario('');
    const nome = novoUsuarioNome.trim();
    if (nome.length < 2) {
      setErroNovoUsuario('Informe o nome do novo usuário.');
      return;
    }
    const usuarioExistente = unirUsuariosCadastrados(usuariosExtra).find(usuario => usuario.nome.toLowerCase() === nome.toLowerCase());
    if (usuarioExistente) {
      try {
        const sincronizado = await confirmarUsuarioNaNuvem(usuarioExistente.id);
        if (sincronizado) {
          setAlerta({ tipo: 'sucesso', msg: `✓ O usuário ${usuarioExistente.nome} já existia neste aparelho e foi sincronizado com a nuvem.` });
        } else {
          setAlerta({ tipo: 'erro', msg: `⚠️ O usuário ${usuarioExistente.nome} continua apenas neste aparelho. Tente sincronizar novamente quando a conexão estiver disponível.` });
        }
      } catch {
        setAlerta({ tipo: 'erro', msg: `⚠️ Não foi possível confirmar a sincronização de ${usuarioExistente.nome}. Tente novamente.` });
      }
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
    try {
      const sincronizado = await confirmarUsuarioNaNuvem(novoUsuario.id, senhasAtualizadas);
      if (!sincronizado) {
        setAlerta({ tipo: 'erro', msg: '⚠️ O usuário ficou salvo apenas neste aparelho. Tente sincronizá-lo novamente quando a conexão estiver disponível.' });
        return;
      }
    } catch {
      setAlerta({ tipo: 'erro', msg: '⚠️ Não foi possível confirmar a gravação do usuário na nuvem. Tente sincronizá-lo novamente.' });
      return;
    }
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
    const gravado = await gravarNaWeb(undefined, undefined, undefined, undefined, undefined, undefined, undefined, [], undefined, senhasAtualizadas, usuarioId);
    if (!gravado) {
      setAlerta({ tipo: 'erro', msg: '⚠️ O usuário foi removido apenas deste aparelho. A remoção não foi gravada na nuvem.' });
      return;
    }
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
        consultaPagamentos: 'pagamentos',
        reciboComprador: 'pagamentos',
        elieuda: 'elieuda',
        conferencia: 'conferencias',
        notasConferidas: 'conferencias',
        relatorios: 'relatorios',
        manutencao: 'manutencao',
        dados: 'dados',
        producao: 'producao',
        caixaOperacional: 'caixaOperacional',
        estoque: 'estoque',
        conciliacao: 'conciliacao',
        conciliacaoCompras: 'conciliacao',
        arquivoCeasa: 'conciliacao',
        inteligenciaEstoque: 'conciliacao',
        consultasConciliacao: 'conciliacao'
      };
      const permissaoDaAba = abaPorPermissao[tabAtiva];
    if (permissaoDaAba && !novasPermissoes[permissaoDaAba]) setTabAtiva('seguranca');
    const aindaTemCompras = novasPermissoes.cotacao || novasPermissoes.pagamentos || novasPermissoes.elieuda || novasPermissoes.conferencias;
    if (tabAtiva === 'compras' && !aindaTemCompras) setTabAtiva('seguranca');
    }
    setStatusSalvoSeguranca('Salvando na nuvem...');
    setUsuarioPermissaoSalvaId(usuarioId);
    const gravado = await gravarNaWeb();
    if (!gravado) {
      setStatusSalvoSeguranca('⚠️ Permissão alterada apenas neste aparelho; não foi gravada na nuvem.');
      setAlerta({ tipo: 'erro', msg: '⚠️ A permissão foi alterada apenas neste aparelho. Tente salvar novamente quando a conexão estiver disponível.' });
      return;
    }
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
    if (sincronizacaoEmCursoRef.current || gravandoNuvemRef.current) {
      sincronizacaoAdiadaRef.current = true;
      return;
    }
    sincronizacaoEmCursoRef.current = true;
    const controlador = new AbortController();
    const tempoLimite = window.setTimeout(() => controlador.abort(), 25000);
    try {
      setStatusNuvem('⏳ Sincronizando...');
      const versaoConhecida = versaoNuvemRef.current;
      const consulta = new URLSearchParams();
      if (versaoConhecida) consulta.set('desde', versaoConhecida);
      consulta.set('t', String(Date.now()));
      const resposta = await fetch(
        `/api/nuvem?${consulta}`,
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
        if (Array.isArray(dados.record.itensChecklistDeletados)) {
          const deletados = unirIds(itensChecklistDeletadosRef.current, dados.record.itensChecklistDeletados);
          itensChecklistDeletadosRef.current = deletados;
          setItensChecklistDeletados(deletados);
          localStorage.setItem('rm_checklist_deletados', JSON.stringify(deletados));
        }
        if (Array.isArray(dados.record.itensChecklist)) {
          const itens = mesclarChecklist(itensChecklistDeletadosRef.current, itensChecklistRef.current, dados.record.itensChecklist);
          itensChecklistRef.current = itens;
          setItensChecklist(itens);
          localStorage.setItem('rm_checklist_items', JSON.stringify(itens));
        }
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
        if (Array.isArray(dados.record.historicoPagamentosDeletados)) {
          const uniao = unirIds(lotesPagamentoDeletadosRef.current, dados.record.historicoPagamentosDeletados);
          lotesPagamentoDeletadosRef.current = uniao;
          setLotesPagamentoDeletados(uniao);
          localStorage.setItem('rm_lotes_pagamento_deletados', JSON.stringify(uniao));
        }
        if (dados.record.pagamentos || Array.isArray(dados.record.historicoPagamentos)) {
          setHistoricoPagamentos(atuais => {
            const uniaoLotes = unirLotesPagamento(lotesPagamentoDeletadosRef.current, atuais, dados.record.historicoPagamentos);
            localStorage.setItem('rm_historico_pagamentos', JSON.stringify(uniaoLotes));
            setPagamentos(atuaisPag => {
              const uniaoPag = unirPagamentosAbertos(atuaisPag, dados.record.pagamentos, uniaoLotes, pagamentosDeletadosRef.current);
              localStorage.setItem('rm_pagamentos', JSON.stringify(uniaoPag));
              return uniaoPag;
            });
            return uniaoLotes;
          });
        }
        if (Array.isArray(dados.record.fornecedoresCotacao)) {
          setFornecedoresCotacao(atuais => {
            const uniao = unirFornecedoresCotacao(dados.record.fornecedoresCotacao, atuais);
            localStorage.setItem('rm_fornecedores_cotacao', JSON.stringify(uniao));
            return uniao;
          });
        }
        if (Array.isArray(dados.record.itensCotacao)) {
          setItensCotacao(itensAtuais => mesclarItensCotacao(itensAtuais, dados.record.itensCotacao));
        }
        if (dados.record.quantidadesElieuda && !elieudaAlteradaRef.current) {
          setQuantidadesElieuda(dados.record.quantidadesElieuda);
          localStorage.setItem('rm_elieuda', JSON.stringify(dados.record.quantidadesElieuda));
        }
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
        if (Array.isArray(dados.record.lotesConciliacao)) {
          setLotesConciliacao(atuais => {
            const uniao = unirLotesConciliacao(atuais, dados.record.lotesConciliacao);
            lotesConciliacaoRef.current = uniao;
            gravarJsonLocal('rm_lotes_conciliacao', uniao);
            return uniao;
          });
        }
        if (Array.isArray(dados.record.lotesInteligencia)) {
          setLotesInteligencia(atuais => {
            const uniao = unirLotesInteligencia(atuais, dados.record.lotesInteligencia);
            lotesInteligenciaRef.current = uniao;
            gravarJsonLocal('rm_lotes_inteligencia', uniao);
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
        if (Array.isArray(dados.record.caixaOperacionalDeletados)) {
          const uniao = unirIds(movimentosCaixaDeletadosRef.current, dados.record.caixaOperacionalDeletados);
          movimentosCaixaDeletadosRef.current = uniao;
          setMovimentosCaixaDeletados(uniao);
          localStorage.setItem('rm_caixa_operacional_deletados', JSON.stringify(uniao));
        }
        if (Array.isArray(dados.record.caixaOperacional)) {
          const lista = unirMovimentosCaixaOperacional(
            movimentosCaixaDeletadosRef.current,
            movimentosCaixaRef.current,
            dados.record.caixaOperacional
          );
          movimentosCaixaRef.current = lista;
          setMovimentosCaixaOperacional(lista);
          localStorage.setItem('rm_caixa_operacional', JSON.stringify(lista));
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
      if (sincronizacaoAdiadaRef.current) {
        sincronizacaoAdiadaRef.current = false;
        window.clearTimeout(atrasoSyncRef.current);
        atrasoSyncRef.current = window.setTimeout(() => { void carregarTudo(); }, 1500);
      }
    }
  }, []);

  const ultimaSincronizacaoAutomaticaRef = useRef(0);
  const sincronizarAutomaticamente = useCallback(() => {
    if (document.visibilityState !== 'visible') return;
    const agora = Date.now();
    if (agora - ultimaSincronizacaoAutomaticaRef.current < 15000) return;
    ultimaSincronizacaoAutomaticaRef.current = agora;
    void carregarTudo();
  }, [carregarTudo]);

  useEffect(() => {
    if (!autenticado) return;
    sincronizarAutomaticamente();
    const intervalo = window.setInterval(sincronizarAutomaticamente, 120000);
    document.addEventListener('visibilitychange', sincronizarAutomaticamente);
    window.addEventListener('focus', sincronizarAutomaticamente);
    window.addEventListener('online', sincronizarAutomaticamente);
    window.addEventListener('pageshow', sincronizarAutomaticamente);
    return () => {
      window.clearInterval(intervalo);
      window.clearTimeout(atrasoSyncRef.current);
      document.removeEventListener('visibilitychange', sincronizarAutomaticamente);
      window.removeEventListener('focus', sincronizarAutomaticamente);
      window.removeEventListener('online', sincronizarAutomaticamente);
      window.removeEventListener('pageshow', sincronizarAutomaticamente);
    };
  }, [autenticado, sincronizarAutomaticamente]);
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
    
    setRelatoriosPorData(atuais => {
      const atual = atuais[hoje];
      if (
        atual
        && atual.pendentes === novoRelatorio.pendentes
        && atual.concluidas === novoRelatorio.concluidas
        && atual.pagamentos === novoRelatorio.pagamentos
        && atual.conferencias === novoRelatorio.conferencias
      ) {
        return atuais;
      }
      const novosDados = { ...atuais, [hoje]: novoRelatorio };
      localStorage.setItem('rm_relatorios_por_data', JSON.stringify(novosDados));
      return novosDados;
    });
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
    if (!autenticado) return;
    localStorage.setItem('rm_checklist_items', JSON.stringify(itensChecklist));
    localStorage.setItem('rm_checklist_deletados', JSON.stringify(itensChecklistDeletados));
  }, [itensChecklist, itensChecklistDeletados, autenticado]);

  useEffect(() => {
    if (autenticado) {
      localStorage.setItem('rm_itens_cotacao', JSON.stringify(itensCotacao));
    }
  }, [itensCotacao, autenticado]);

  useEffect(() => {
    if (autenticado) {
      gravarJsonLocal('rm_lotes_conciliacao', lotesConciliacao);
    }
  }, [lotesConciliacao, autenticado]);

  useEffect(() => {
    if (autenticado) {
      gravarJsonLocal('rm_lotes_inteligencia', lotesInteligencia);
    }
  }, [lotesInteligencia, autenticado]);

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
      itensChecklist: itensChecklistRef.current,
      itensChecklistDeletados: itensChecklistDeletadosRef.current,
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
  const edicoesAutomaticasPendentesRef = useRef<{ itensCotacao?: ItemCotacao[]; quantidadesElieuda?: QuantidadesElieuda }>({});
  const atrasoGravacaoEdicoesRef = useRef<number | null>(null);
  const virarMesLancamentoPagamentosRef = useRef(() => {});
  useEffect(() => {
    if (!autenticado) return;
    virarMesLancamentoPagamentosRef.current();
  }, [autenticado]);

  const agendarGravacaoEdicao = (alteracoes: { itensCotacao?: ItemCotacao[]; quantidadesElieuda?: QuantidadesElieuda }) => {
    edicoesAutomaticasPendentesRef.current = { ...edicoesAutomaticasPendentesRef.current, ...alteracoes };
    if (atrasoGravacaoEdicoesRef.current !== null) window.clearTimeout(atrasoGravacaoEdicoesRef.current);
    atrasoGravacaoEdicoesRef.current = window.setTimeout(() => {
      atrasoGravacaoEdicoesRef.current = null;
      const pendentes = edicoesAutomaticasPendentesRef.current;
      edicoesAutomaticasPendentesRef.current = {};
      void gravarNaWebRef.current(
        undefined,
        undefined,
        undefined,
        undefined,
        pendentes.itensCotacao,
        pendentes.quantidadesElieuda
      );
    }, 600);
  };

  useEffect(() => () => {
    if (atrasoGravacaoEdicoesRef.current !== null) window.clearTimeout(atrasoGravacaoEdicoesRef.current);
  }, []);

  useEffect(() => {
    if (usuarioLogado) return;
    const id = window.setInterval(() => setAgoraLogin(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [usuarioLogado]);

  if (!usuarioLogado) {
    let usuariosParaLogin = USUARIOS_SISTEMA;
    try {
      usuariosParaLogin = unirUsuariosCadastrados(usuariosExtra).map(usuario => aplicarPermissoesSalvas(usuario, permissoesUsuarios));
    } catch {
      usuariosParaLogin = USUARIOS_SISTEMA;
    }
    const horaLogin = agoraLogin.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const noiteLogin = agoraLogin.getHours() >= 18 || agoraLogin.getHours() < 6;
    return (
      <div className="login-tela grid min-h-screen bg-white text-slate-900 min-[900px]:grid-cols-[minmax(280px,42%)_1fr]" style={{ fontFamily: 'Inter, "Segoe UI", sans-serif' }}>
        <aside className="login-faixa">
          <div className="login-bloco">
            <div className="login-topo">
              <div className="login-marca">
                <img src="/rm-icon-login.png?v=2" alt="RM" />
              </div>
              <div className="leading-none">
                <p className="m-0 text-[11px] font-medium text-white/80">RM</p>
                <strong className="mt-1 block text-[20px] font-semibold tracking-tight">Sistema-Gestão</strong>
              </div>
            </div>
            <p className="login-frase">“O que começou como uma forma de organizar minhas próprias pendências se transformou em uma ideia maior: criar, inovar e transformar desafios em soluções.”</p>
            <div className="login-ilustracao">
              <img src="/login-mulher-montanhas.jpg?v=3" alt="" />
            </div>
          </div>
          <div className="login-rodape">
            <div className="flex items-center gap-2 text-sm font-medium">
              {noiteLogin ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-amber-300" fill="currentColor" aria-hidden="true"><path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-amber-200" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="5" /></svg>
              )}
              <span>{noiteLogin ? 'Noite' : 'Dia'}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/80" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M7 18h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.5-1.5A4 4 0 0 0 7 18z" /></svg>
              <div className="leading-none">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">Hora</span>
                <strong className="text-[15px] font-semibold tabular-nums">{horaLogin}</strong>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex items-center justify-center bg-white px-6 py-10">
          <form onSubmit={fazerLogin} className="w-full max-w-[380px]">
            <h1 className="m-0 text-[30px] font-bold leading-none tracking-tight text-[#111827]">Bem-vindo de volta</h1>
            <p className="mb-7 mt-3 text-sm font-normal leading-5 text-slate-500">Entre para acessar o painel de inovação e gestão.</p>

            <label className="mb-1.5 block text-[13px] font-medium text-slate-800" htmlFor="login-usuario">Usuário</label>
            <div className="mb-4 flex h-11 w-full items-center rounded-lg border border-slate-200 bg-white px-3">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="8" r="3.2" /><path d="M5 19c1.2-3 3.4-4.5 7-4.5s5.8 1.5 7 4.5" /></svg>
              <select id="login-usuario" value={usuarioSelecionado} onChange={(e) => setUsuarioSelecionado(e.target.value)} className={`min-w-0 flex-1 cursor-pointer appearance-none border-0 bg-transparent px-2.5 text-sm font-normal leading-5 outline-none ${usuarioSelecionado ? 'text-slate-800' : 'text-slate-400'}`}>
                <option value="">Selecione o usuário...</option>
                {usuariosParaLogin.map(u => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </select>
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </div>

            <label className="mb-1.5 block text-[13px] font-medium text-slate-800" htmlFor="login-senha">Senha de Acesso</label>
            <div className="mb-5 flex h-11 w-full items-center rounded-lg border border-slate-200 bg-white px-3">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
              <input id="login-senha" type={mostrarSenhaLogin ? 'text' : 'password'} placeholder="Digite sua senha" value={senhaDigitada} onChange={(e) => setSenhaDigitada(e.target.value)} autoComplete="current-password" className="min-w-0 flex-1 border-0 bg-transparent px-2.5 text-sm font-normal leading-5 text-slate-800 outline-none placeholder:text-slate-400" />
              <button type="button" onClick={() => setMostrarSenhaLogin(atual => !atual)} className="login-mostrar shrink-0 cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {mostrarSenhaLogin ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            {erroLogin && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-700">Usuário ou senha inválidos</div>
            )}
            {erroSenha && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm font-medium text-amber-800">{erroSenha}</div>
            )}

            <button type="submit" disabled={entrando} className="h-11 w-full cursor-pointer rounded-lg border-0 bg-[#0a5c56] text-[15px] font-semibold text-white transition hover:bg-[#084843] disabled:cursor-wait disabled:opacity-80">
              {entrando ? 'Entrando...' : 'Entrar no sistema'}
            </button>
            <button type="button" onClick={() => setErroSenha('Peça à administração para redefinir a senha na aba Segurança.')} className="login-mostrar mt-3 w-full cursor-pointer text-center text-[13px] font-medium text-[#0a5c56] underline underline-offset-2">
              Esqueceu a senha?
            </button>
          </form>
        </main>
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
    if (Array.isArray(dados.itensChecklistDeletados)) {
      const deletados = unirIds(itensChecklistDeletadosRef.current, dados.itensChecklistDeletados);
      itensChecklistDeletadosRef.current = deletados;
      setItensChecklistDeletados(deletados);
      localStorage.setItem('rm_checklist_deletados', JSON.stringify(deletados));
    }
    if (Array.isArray(dados.itensChecklist)) {
      const itens = mesclarChecklist(itensChecklistDeletadosRef.current, itensChecklistRef.current, dados.itensChecklist);
      itensChecklistRef.current = itens;
      setItensChecklist(itens);
      localStorage.setItem('rm_checklist_items', JSON.stringify(itens));
    }
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

        if (Array.isArray(dados.itensChecklistDeletados)) {
          const deletados = unirIds(itensChecklistDeletadosRef.current, dados.itensChecklistDeletados);
          itensChecklistDeletadosRef.current = deletados;
          setItensChecklistDeletados(deletados);
          localStorage.setItem('rm_checklist_deletados', JSON.stringify(deletados));
        }
        if (Array.isArray(dados.itensChecklist)) {
          const itens = mesclarChecklist(itensChecklistDeletadosRef.current, itensChecklistRef.current, dados.itensChecklist);
          itensChecklistRef.current = itens;
          setItensChecklist(itens);
          localStorage.setItem('rm_checklist_items', JSON.stringify(itens));
        }
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
    const executar = async (): Promise<boolean | 'retry'> => {
    try {
    const dadosSetores = novosSetores !== undefined ? novosSetores : setoresRef.current;
    const dadosPagamentos = novosPagamentos !== undefined ? novosPagamentos : pagamentosRef.current;
    const dadosHistorico = novoHistorico !== undefined ? novoHistorico : historicoPagamentosRef.current;
    let dadosFornCotacao = novosFornCotacao !== undefined ? novosFornCotacao : fornecedoresCotacao;
    let dadosItensCotacao = novosItensCotacao !== undefined ? novosItensCotacao : itensCotacaoRef.current;
    let dadosElieuda = novasQuantidades !== undefined ? novasQuantidades : quantidadesElieuda;
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
      let lotesPagamentoDeletadosParaNuvem = lotesPagamentoDeletadosRef.current;
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
      let caixaOperacionalParaNuvem = movimentosCaixaRef.current;
      let caixaOperacionalDeletadosParaNuvem = movimentosCaixaDeletadosRef.current;
      let lotesConciliacaoParaNuvem = lotesConciliacaoRef.current;
      let lotesInteligenciaParaNuvem = lotesInteligenciaRef.current;
      let checklistParaNuvem = itensChecklistRef.current;
      let checklistDeletadosParaNuvem = itensChecklistDeletadosRef.current;
      let conseguiuLerNuvem = false;
      let versaoBase = '';
      try {
        const respostaAtual = await fetch(`/api/nuvem?t=${Date.now()}`, { cache: 'no-store' });
        const dadosAtuaisBrutos = await respostaAtual.json();
        if (typeof dadosAtuaisBrutos?.versao === 'string') versaoBase = dadosAtuaisBrutos.versao;
        const dadosAtuais = { record: recordDoJsonBin(dadosAtuaisBrutos) };
        if (respostaAtual.ok && dadosAtuais.record) {
          conseguiuLerNuvem = true;
          checklistDeletadosParaNuvem = unirIds(checklistDeletadosParaNuvem, dadosAtuais.record.itensChecklistDeletados);
          checklistParaNuvem = mesclarChecklist(
            checklistDeletadosParaNuvem,
            checklistParaNuvem,
            Array.isArray(dadosAtuais.record.itensChecklist) ? dadosAtuais.record.itensChecklist : []
          );
          itensChecklistDeletadosRef.current = checklistDeletadosParaNuvem;
          itensChecklistRef.current = checklistParaNuvem;
          setItensChecklistDeletados(checklistDeletadosParaNuvem);
          setItensChecklist(checklistParaNuvem);
          localStorage.setItem('rm_checklist_deletados', JSON.stringify(checklistDeletadosParaNuvem));
          localStorage.setItem('rm_checklist_items', JSON.stringify(checklistParaNuvem));
          if (Array.isArray(dadosAtuais.record.itensCotacao)) {
            dadosItensCotacao = mesclarItensCotacao(dadosAtuais.record.itensCotacao, itensCotacaoRef.current, dadosItensCotacao);
            itensCotacaoRef.current = dadosItensCotacao;
            setItensCotacao(dadosItensCotacao);
            localStorage.setItem('rm_itens_cotacao', JSON.stringify(dadosItensCotacao));
          }
          if (dadosAtuais.record.quantidadesElieuda && typeof dadosAtuais.record.quantidadesElieuda === 'object') {
            const localGanha = elieudaAlteradaRef.current || novasQuantidades !== undefined;
            dadosElieuda = unirQuantidadesElieuda(dadosAtuais.record.quantidadesElieuda, dadosElieuda, localGanha);
            setQuantidadesElieuda(dadosElieuda);
            localStorage.setItem('rm_elieuda', JSON.stringify(dadosElieuda));
          }
          if (Array.isArray(dadosAtuais.record.fornecedoresCotacao)) {
            dadosFornCotacao = unirFornecedoresCotacao(dadosAtuais.record.fornecedoresCotacao, dadosFornCotacao);
            setFornecedoresCotacao(dadosFornCotacao);
            localStorage.setItem('rm_fornecedores_cotacao', JSON.stringify(dadosFornCotacao));
          }
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
          pagamentosDeletadosParaNuvem = unirIds(pagamentosDeletadosRef.current, dadosAtuais.record.pagamentosDeletados);
          pagamentosDeletadosRef.current = pagamentosDeletadosParaNuvem;
          setPagamentosDeletados(pagamentosDeletadosParaNuvem);
          localStorage.setItem('rm_pagamentos_deletados', JSON.stringify(pagamentosDeletadosParaNuvem));
          lotesPagamentoDeletadosParaNuvem = unirIds(lotesPagamentoDeletadosRef.current, dadosAtuais.record.historicoPagamentosDeletados);
          lotesPagamentoDeletadosRef.current = lotesPagamentoDeletadosParaNuvem;
          setLotesPagamentoDeletados(lotesPagamentoDeletadosParaNuvem);
          localStorage.setItem('rm_lotes_pagamento_deletados', JSON.stringify(lotesPagamentoDeletadosParaNuvem));
          historicoParaNuvem = unirLotesPagamento(lotesPagamentoDeletadosParaNuvem, historicoPagamentosRef.current, dadosHistorico, dadosAtuais.record.historicoPagamentos);
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
          if (Array.isArray(dadosAtuais.record.caixaOperacionalDeletados)) {
            caixaOperacionalDeletadosParaNuvem = unirIds(movimentosCaixaDeletadosRef.current, dadosAtuais.record.caixaOperacionalDeletados);
            movimentosCaixaDeletadosRef.current = caixaOperacionalDeletadosParaNuvem;
            setMovimentosCaixaDeletados(caixaOperacionalDeletadosParaNuvem);
            localStorage.setItem('rm_caixa_operacional_deletados', JSON.stringify(caixaOperacionalDeletadosParaNuvem));
          }
          if (Array.isArray(dadosAtuais.record.caixaOperacional)) {
            caixaOperacionalParaNuvem = unirMovimentosCaixaOperacional(
              caixaOperacionalDeletadosParaNuvem,
              movimentosCaixaRef.current,
              dadosAtuais.record.caixaOperacional
            );
            movimentosCaixaRef.current = caixaOperacionalParaNuvem;
            setMovimentosCaixaOperacional(caixaOperacionalParaNuvem);
            localStorage.setItem('rm_caixa_operacional', JSON.stringify(caixaOperacionalParaNuvem));
          }
          if (Array.isArray(dadosAtuais.record.lotesConciliacao)) {
            lotesConciliacaoParaNuvem = unirLotesConciliacao(lotesConciliacaoRef.current, dadosAtuais.record.lotesConciliacao);
            lotesConciliacaoRef.current = lotesConciliacaoParaNuvem;
            setLotesConciliacao(lotesConciliacaoParaNuvem);
            gravarJsonLocal('rm_lotes_conciliacao', lotesConciliacaoParaNuvem);
          }
          if (Array.isArray(dadosAtuais.record.lotesInteligencia)) {
            lotesInteligenciaParaNuvem = unirLotesInteligencia(lotesInteligenciaRef.current, dadosAtuais.record.lotesInteligencia);
            lotesInteligenciaRef.current = lotesInteligenciaParaNuvem;
            setLotesInteligencia(lotesInteligenciaParaNuvem);
            gravarJsonLocal('rm_lotes_inteligencia', lotesInteligenciaParaNuvem);
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
      historicoParaNuvem = unirLotesPagamento(lotesPagamentoDeletadosParaNuvem, historicoPagamentosRef.current, historicoParaNuvem);
      pagamentosDeletadosParaNuvem = unirIds(pagamentosDeletadosRef.current, pagamentosDeletadosParaNuvem);
      lotesPagamentoDeletadosParaNuvem = unirIds(lotesPagamentoDeletadosRef.current, lotesPagamentoDeletadosParaNuvem);
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
      caixaOperacionalDeletadosParaNuvem = unirIds(movimentosCaixaDeletadosRef.current, caixaOperacionalDeletadosParaNuvem);
      caixaOperacionalParaNuvem = unirMovimentosCaixaOperacional(caixaOperacionalDeletadosParaNuvem, movimentosCaixaRef.current, caixaOperacionalParaNuvem);
      lotesConciliacaoParaNuvem = unirLotesConciliacao(lotesConciliacaoRef.current, lotesConciliacaoParaNuvem);
      lotesConciliacaoRef.current = lotesConciliacaoParaNuvem;
      lotesInteligenciaParaNuvem = unirLotesInteligencia(lotesInteligenciaRef.current, lotesInteligenciaParaNuvem);
      lotesInteligenciaRef.current = lotesInteligenciaParaNuvem;
      fotosPendenciasParaNuvem = enxugarFotosNuvem(filtrarFotosUsadas(unirFotosPendencias(
        fotosPendenciasParaNuvem,
        fotosPendenciasRef.current,
        coletarFotosSetores(setoresRef.current),
        coletarFotosOrdens(ordensManutencaoRef.current)
      ), setoresParaNuvem, ordensParaNuvem), 800000);
      fotosPendenciasRef.current = fotosPendenciasParaNuvem;
      guardarFotosLocal(fotosPendenciasParaNuvem);
      void Promise.all(Object.entries(fotosPendenciasParaNuvem).map(([id, foto]) => enviarFotoNuvem(id, foto)));

      const registroNuvem = { setores: setoresSemFotos(setoresParaNuvem), pagamentos: pagamentosParaNuvem, historicoPagamentos: historicoParaNuvem, historicoPagamentosDeletados: lotesPagamentoDeletadosParaNuvem, tarefasDeletadas: deletadasParaSalvar, fornecedoresCotacao: dadosFornCotacao, itensCotacao: dadosItensCotacao, quantidadesElieuda: dadosElieuda, custosCatalogo: custosCatalogoRef.current, conferencias: conferenciasParaNuvem, pedidosConferidos: conferidosParaNuvem, conferenciasDeletadas: conferenciasDeletadasParaNuvem, pagamentosDeletados: pagamentosDeletadosParaNuvem, pedidosCotacaoDeletados: pedidosCotacaoDeletadosParaNuvem, relatoriosPedidosCotacao: pedidosParaNuvem, senhasUsuarios: senhasParaNuvem, usuariosExtra: usuariosParaNuvem, usuariosExtraDeletados: usuariosDeletadosParaNuvem, permissoesUsuarios: permissoesParaNuvem, ordensManutencao: ordensSemFotos(ordensParaNuvem), ordensManutencaoDeletadas: ordensDeletadasParaNuvem, itensChecklist: checklistParaNuvem, itensChecklistDeletados: checklistDeletadosParaNuvem, fotosPendencias: fotosPendenciasParaNuvem, fotosPendenciaIds: Object.keys(fotosPendenciasParaNuvem), producaoPadaria: { produtos: produtosProducaoParaNuvem, lancamentos: lancamentosProducaoParaNuvem, lancamentosRota: lancamentosRotaParaNuvem, contasDeposito: contasDepositoParaNuvem, lancamentosDeposito: lancamentosDepositoParaNuvem }, producaoLancamentosDeletados: lancamentosProducaoDeletadosParaNuvem, producaoRotaDeletados: lancamentosRotaDeletadosParaNuvem, producaoDepositoDeletados: lancamentosDepositoDeletadosParaNuvem, caixaOperacional: caixaOperacionalParaNuvem, caixaOperacionalDeletados: caixaOperacionalDeletadosParaNuvem, lotesConciliacao: lotesConciliacaoParaNuvem, lotesInteligencia: lotesInteligenciaParaNuvem, ultimaAtualizacao: agora, versaoBase };
      const respostaGravar = await enviarRegistroNuvem(registroNuvem);
      if (respostaGravar.status === 409) return 'retry';
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
      elieudaAlteradaRef.current = false;
      setStatusNuvem('🟢 Gravado na nuvem');
      return true;
    } catch (err) {
      setStatusNuvem('⚠️ Modo Offline');
      return false;
    }
    } finally {
      /* a trava da gravação fica em rodar, para a tentativa seguinte não ser interrompida */
    }
    };
    const rodar = async () => {
      gravandoNuvemRef.current = true;
      try {
        let resultado: boolean | 'retry' = 'retry';
        for (let tentativa = 0; tentativa < 3 && resultado === 'retry'; tentativa++) {
          resultado = await executar();
        }
        return resultado === true;
      } finally {
        gravandoNuvemRef.current = false;
        if (sincronizacaoAdiadaRef.current) {
          sincronizacaoAdiadaRef.current = false;
          window.clearTimeout(atrasoSyncRef.current);
          atrasoSyncRef.current = window.setTimeout(() => { void carregarTudo(); }, 800);
        }
      }
    };
    const proxima = gravacaoFilaRef.current.then(rodar, rodar);
    gravacaoFilaRef.current = proxima;
    return proxima;
  };
  gravarNaWebRef.current = gravarNaWeb;

  const salvarItensChecklist = (itens: ItemChecklist[], deletados = itensChecklistDeletadosRef.current) => {
    const filtrados = mesclarChecklist(deletados, itens);
    itensChecklistRef.current = filtrados;
    itensChecklistDeletadosRef.current = deletados;
    setItensChecklist(filtrados);
    setItensChecklistDeletados(deletados);
    localStorage.setItem('rm_checklist_items', JSON.stringify(filtrados));
    localStorage.setItem('rm_checklist_deletados', JSON.stringify(deletados));
    void gravarNaWeb();
  };

  const adicionarItemChecklist = (texto: string) => {
    const agora = new Date().toISOString();
    const novo: ItemChecklist = {
      id: `check_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      texto,
      concluido: false,
      criadoEm: agora,
      atualizadoEm: agora
    };
    salvarItensChecklist([...itensChecklistRef.current, novo]);
  };

  const atualizarItemChecklist = (id: string, texto: string) => {
    const agora = new Date().toISOString();
    salvarItensChecklist(itensChecklistRef.current.map(item =>
      item.id === id ? { ...item, texto, atualizadoEm: agora } : item
    ));
  };

  const alternarItemChecklist = (id: string) => {
    const agora = new Date().toISOString();
    salvarItensChecklist(itensChecklistRef.current.map(item =>
      item.id === id ? { ...item, concluido: !item.concluido, atualizadoEm: agora } : item
    ));
  };

  const removerItemChecklist = (id: string) => {
    const deletados = unirIds(itensChecklistDeletadosRef.current, [id]);
    salvarItensChecklist(itensChecklistRef.current.filter(item => item.id !== id), deletados);
  };

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

  const adicionarMovimentoCaixaOperacional = (item: Omit<MovimentoCaixaOperacional, 'id'>) => {
    const novo: MovimentoCaixaOperacional = { ...item, id: `cx_${Date.now()}` };
    const lista = unirMovimentosCaixaOperacional(movimentosCaixaDeletadosRef.current, movimentosCaixaRef.current, [novo]);
    movimentosCaixaRef.current = lista;
    setMovimentosCaixaOperacional(lista);
    localStorage.setItem('rm_caixa_operacional', JSON.stringify(lista));
    void gravarNaWeb();
    return true;
  };

  const removerMovimentoCaixaOperacional = (id: string) => {
    const deletados = unirIds(movimentosCaixaDeletadosRef.current, [id]);
    movimentosCaixaDeletadosRef.current = deletados;
    setMovimentosCaixaDeletados(deletados);
    localStorage.setItem('rm_caixa_operacional_deletados', JSON.stringify(deletados));
    const lista = unirMovimentosCaixaOperacional(deletados, movimentosCaixaRef.current);
    movimentosCaixaRef.current = lista;
    setMovimentosCaixaOperacional(lista);
    localStorage.setItem('rm_caixa_operacional', JSON.stringify(lista));
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
      caixa: [{ id: `${Date.now()}`, descricao: novoCaixa.descricao.trim(), valor: val, data: new Date().toISOString().slice(0, 10) }, ...(atuais.caixa || [])],
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
      cheque: [{ id: `${Date.now()}`, descricao: novoCheque.descricao.trim(), valor: val, data: new Date().toISOString().slice(0, 10) }, ...(atuais.cheque || [])],
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
      caben: [{ id: `${Date.now()}`, descricao: novoCaben.descricao.trim(), valor: val, data: new Date().toISOString().slice(0, 10) }, ...(atuais.caben || [])]
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

  const fecharLotePagamentos = (opcoes?: { automatico?: boolean; rotulo?: string }) => {
    const listaCaixa = obterListaSegura('caixa');
    const listaCheque = obterListaSegura('cheque');
    const listaCaben = obterListaSegura('caben');
    const somaCaixa = listaCaixa.reduce((acc, item) => acc + (Number(item?.valor) || 0), 0);
    const somaCheque = listaCheque.reduce((acc, item) => acc + (Number(item?.valor) || 0), 0);
    const somaCaben = listaCaben.reduce((acc, item) => acc + (Number(item?.valor) || 0), 0);
    const somaGeral = somaCaixa + somaCheque + somaCaben;
    const totalItens = listaCaixa.length + listaCheque.length + listaCaben.length;
    if (totalItens === 0) {
      if (!opcoes?.automatico) alert('Nenhum lançamento ativo!');
      return false;
    }
    if (!opcoes?.automatico && !window.confirm(`Fechar lote no valor de R$ ${somaGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}?`)) return false;
    const novoLote: LotePagamentoHistorico = {
      id: `${Date.now()}`,
      dataFechamento: opcoes?.rotulo || new Date().toLocaleString('pt-BR'),
      totalGeral: somaGeral,
      totalCaixa: somaCaixa,
      totalCheque: somaCheque,
      totalCaben: somaCaben,
      dados: {
        caixa: [...listaCaixa],
        cheque: [...listaCheque],
        caben: [...listaCaben]
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
    if (!opcoes?.automatico) setMostrarPastaHistorico(true);
    return true;
  };

  const virarMesLancamentoPagamentos = () => {
    const mes = mesAtualChave();
    let salvo = '';
    try { salvo = localStorage.getItem('rm_mes_lancamento_pagamentos') || ''; } catch { /* ignora */ }
    if (!salvo) {
      try { localStorage.setItem('rm_mes_lancamento_pagamentos', mes); } catch { /* ignora */ }
      return;
    }
    if (salvo === mes) return;
    const [ano, mesNum] = salvo.split('-');
    const nomeMes = new Date(Number(ano), Number(mesNum) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    fecharLotePagamentos({
      automatico: true,
      rotulo: `Fechamento automático de ${nomeMes}`
    });
    try { localStorage.setItem('rm_mes_lancamento_pagamentos', mes); } catch { /* ignora */ }
  };
  virarMesLancamentoPagamentosRef.current = virarMesLancamentoPagamentos;

  const removerLoteHistorico = (loteId: string) => {
    if (!window.confirm('Deseja excluir permanentemente este lote?')) return;
    const listaHistoricoAtual = Array.isArray(historicoPagamentosRef.current) ? historicoPagamentosRef.current : [];
    const lote = listaHistoricoAtual.find(item => item.id === loteId);
    const lotesDeletados = unirIds(lotesPagamentoDeletadosRef.current, [loteId]);
    lotesPagamentoDeletadosRef.current = lotesDeletados;
    setLotesPagamentoDeletados(lotesDeletados);
    localStorage.setItem('rm_lotes_pagamento_deletados', JSON.stringify(lotesDeletados));
    const pagamentosMarcados = unirIds(pagamentosDeletadosRef.current, marcasItensDoLote(lote));
    pagamentosDeletadosRef.current = pagamentosMarcados;
    setPagamentosDeletados(pagamentosMarcados);
    localStorage.setItem('rm_pagamentos_deletados', JSON.stringify(pagamentosMarcados));
    const novoHistorico = unirLotesPagamento(lotesDeletados, listaHistoricoAtual.filter(item => item.id !== loteId));
    historicoPagamentosRef.current = novoHistorico;
    setHistoricoPagamentos(novoHistorico);
    localStorage.setItem('rm_historico_pagamentos', JSON.stringify(novoHistorico));
    localStorage.setItem('rm_backup_completo', JSON.stringify({ pagamentos: pagamentosRef.current, historicoPagamentos: novoHistorico }));
    void gravarNaWeb(undefined, undefined, novoHistorico);
  };
  // Funções da Cotação
  const atualizarCampoCotacao = (itemId: string, campo: 'estoqueAtual' | 'qtdSugerida' | 'qtdPedir', valor: string) => {
    const agora = new Date().toISOString();
    const base = Array.isArray(itensCotacaoRef.current) ? itensCotacaoRef.current : [];
    let novos: ItemCotacao[];
    if (base.some(item => item.id === itemId)) {
      novos = base.map(item => item.id === itemId ? { ...item, [campo]: valor, atualizadoEm: agora } : item);
    } else {
      const doCatalogo = acharItemCatalogoCotacao(itemId, base);
      if (!doCatalogo) return;
      novos = [...base, { ...doCatalogo, [campo]: valor, atualizadoEm: agora, secao: doCatalogo.secao || 'Laticínios' }];
    }
    itensCotacaoRef.current = novos;
    setItensCotacao(novos);
    agendarGravacaoEdicao({ itensCotacao: novos });
  };

  const atualizarPrecoCotacao = (itemId: string, fornecedorId: string, valor: string) => {
    const agora = new Date().toISOString();
    const base = Array.isArray(itensCotacaoRef.current) ? itensCotacaoRef.current : [];
    const itemAtual = base.find(item => item.id === itemId)
      || acharItemCatalogoCotacao(itemId, base);
    if (!itemAtual) return;
    const precosAtualizados = { ...(itemAtual.precos || {}), [fornecedorId]: valor };
    const custos = Object.values(precosAtualizados).map(preco => parseFloat(String(preco).replace(',', '.'))).filter(preco => !Number.isNaN(preco) && preco > 0);
    const novos = base.some(item => item.id === itemId)
      ? base.map(item => item.id === itemId ? { ...item, precos: precosAtualizados, menorCusto: custos.length ? Math.min(...custos) : item.menorCusto, atualizadoEm: agora } : item)
      : [...base, { ...itemAtual, precos: precosAtualizados, menorCusto: custos.length ? Math.min(...custos) : undefined, atualizadoEm: agora, secao: itemAtual.secao || 'Laticínios' }];
    itensCotacaoRef.current = novos;
    setItensCotacao(novos);
    agendarGravacaoEdicao({ itensCotacao: novos });
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

  const incluirProdutoEstoqueNaCotacao = (produto: ItemListaCompleta, fornecedorId: string) => {
    if (!fornecedorId) return;
    const id = `est_${produto.id}`;
    const agora = new Date().toISOString();
    const base = Array.isArray(itensCotacao) ? itensCotacao : [];
    const existente = base.find(item => item.id === id);
    const novos = existente
      ? base.map(item => item.id === id ? {
          ...item,
          precos: { ...(item.precos || {}), [fornecedorId]: item.precos?.[fornecedorId] || '' },
          estoqueAtual: item.estoqueAtual || produto.estoque,
          unit: item.unit || produto.embalagem || 'UN',
          atualizadoEm: agora
        } : item)
      : [...base, {
          id,
          produto: produto.descricao,
          unit: produto.embalagem || 'UN',
          estoqueAtual: produto.estoque,
          qtdSugerida: '',
          qtdPedir: '',
          precos: { [fornecedorId]: '' },
          secao: 'Lista completa',
          atualizadoEm: agora
        } satisfies ItemCotacao];
    itensCotacaoRef.current = novos;
    setItensCotacao(novos);
    localStorage.setItem('rm_itens_cotacao', JSON.stringify(novos));
    gravarNaWeb(undefined, undefined, undefined, undefined, novos);
  };

  const retirarProdutoEstoqueDaCotacao = (itemId: string, fornecedorId: string) => {
    const novos = (Array.isArray(itensCotacao) ? itensCotacao : []).flatMap(item => {
      if (item.id !== itemId) return [item];
      const precos = { ...(item.precos || {}) };
      delete precos[fornecedorId];
      const aindaServe = Object.keys(precos).length > 0 || String(item.qtdPedir || '').trim();
      if (!aindaServe && String(item.id).startsWith('est_')) return [];
      return [{ ...item, precos, atualizadoEm: new Date().toISOString() }];
    });
    itensCotacaoRef.current = novos;
    setItensCotacao(novos);
    localStorage.setItem('rm_itens_cotacao', JSON.stringify(novos));
    gravarNaWeb(undefined, undefined, undefined, undefined, novos);
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
    const base = Array.isArray(itensCotacaoRef.current) ? itensCotacaoRef.current : [];
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
    if (!novos.length && !mudou) return;
    const lista = [...atualizados, ...novos];
    itensCotacaoRef.current = lista;
    setItensCotacao(lista);
    agendarGravacaoEdicao({ itensCotacao: lista });
  };

  const garantirLaticiniosNaCotacao = () => {
    const base = Array.isArray(itensCotacaoRef.current) ? itensCotacaoRef.current : [];
    const ids = new Set(base.map(item => item.id));
    const novos = montarItensLaticinios(base).filter(item => !ids.has(item.id));
    if (!novos.length) return;
    const lista = [...base, ...novos.map(item => ({ ...item, secao: 'Laticínios' as const }))];
    itensCotacaoRef.current = lista;
    setItensCotacao(lista);
    agendarGravacaoEdicao({ itensCotacao: lista });
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

  const adicionarBonificacaoNoPedido = (dados: { pedidoId: string; produto: string; fornecedor: string; quantidade: string; unit: string; valor?: string }) => {
    const produto = String(dados.produto || '').trim();
    const fornecedor = String(dados.fornecedor || '').trim();
    const quantidade = String(dados.quantidade || '').trim() || '1';
    const unit = String(dados.unit || '').trim() || 'Und';
    const quantidadeNumero = parseFloat(quantidade.replace(',', '.')) || 1;
    const valorUnitario = parseFloat(String(dados.valor || '').replace(',', '.')) || 0;
    const valorTotal = valorUnitario * quantidadeNumero;
    if (!dados.pedidoId) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Escolha em qual pedido pendente a bonificação vai chegar.' });
      return false;
    }
    if (!produto || !fornecedor) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Informe o produto e o fornecedor da bonificação.' });
      return false;
    }
    if (valorUnitario <= 0) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Informe o valor do produto da bonificação.' });
      return false;
    }
    const atuais = Array.isArray(relatoriosPedidosRef.current) ? relatoriosPedidosRef.current : [];
    const pedido = atuais.find(item => item.id === dados.pedidoId);
    if (!pedido) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Esse pedido não está mais na lista.' });
      return false;
    }
    const atualizados = atuais.map(item => item.id !== pedido.id ? item : {
      ...item,
      itens: [
        ...(item.itens || []),
        { produto, unit, quantidade, valorUnitario, valorTotal, fornecedor, bonificado: true }
      ]
    });
    relatoriosPedidosRef.current = atualizados;
    setRelatoriosPedidosCotacao(atualizados);
    try { localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(pedidosSemPdfPesado(atualizados))); } catch { /* ignora cota */ }
    gravarNaWeb();
    setAlerta({ tipo: 'sucesso', msg: `✓ Registro salvo. ${produto} ficou como pedido bonificado junto com o pedido de ${pedido.itens[0]?.fornecedor || fornecedor}.` });
    return true;
  };

  const nomeFornecedorPedido = (pedido: RelatorioPedidoCotacao) =>
    pedido.itens?.find(item => !item.bonificado)?.fornecedor || pedido.itens?.[0]?.fornecedor || '';

  const localizarFornecedorDoPedido = (pedido: RelatorioPedidoCotacao) => {
    const nome = String(nomeFornecedorPedido(pedido)).trim().toLowerCase();
    if (!nome) return undefined;
    return fornecedoresCotacao.find(candidato =>
      [candidato.nomeFantasia, candidato.nome, candidato.razaoSocial]
        .some(valor => valor && String(valor).trim().toLowerCase() === nome)
    );
  };

  const incluirItensNoPedidoSalvo = (pedidoId: string) => {
    const atuais = Array.isArray(relatoriosPedidosRef.current) ? relatoriosPedidosRef.current : [];
    const pedido = atuais.find(item => item.id === pedidoId);
    if (!pedido || pedido.enviadoConferencia) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Esse pedido já saiu da Cotação e não pode mais receber itens aqui.' });
      return false;
    }
    const fornecedor = localizarFornecedorDoPedido(pedido);
    if (!fornecedor) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Não foi possível identificar o fornecedor deste pedido na cotação.' });
      return false;
    }
    const nomeFornecedor = fornecedor.nomeFantasia || fornecedor.nome || fornecedor.razaoSocial || 'Fornecedor';
    const candidatos = itensCotacao.filter(item => {
      if (qtdPedirNumero(item) <= 0) return false;
      const { vencedorFornId } = calcularMenorPrecoItem(item);
      return vencedorFornId === fornecedor.id || item.fornecedorId === fornecedor.id;
    });
    if (candidatos.length === 0) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Nenhum item novo na cotação com quantidade em Pedir para este fornecedor.' });
      return false;
    }
    const itens = [...(pedido.itens || [])];
    const idsIncluidos: string[] = [];
    candidatos.forEach(item => {
      const { menorPreco } = calcularMenorPrecoItem(item);
      const precoItem = parseFloat(String(item.precos?.[fornecedor.id] ?? '').replace(',', '.'));
      const valorUnitario = (Number.isFinite(precoItem) && precoItem > 0 ? precoItem : menorPreco) || 0;
      const quantidadeNumero = qtdPedirNumero(item);
      const chave = String(item.produto || '').trim().toLowerCase();
      const existente = itens.findIndex(linha => !linha.bonificado && String(linha.produto || '').trim().toLowerCase() === chave);
      if (existente >= 0) {
        const qtdAtual = parseFloat(String(itens[existente].quantidade || '').replace(',', '.')) || 0;
        const quantidade = qtdAtual + quantidadeNumero;
        itens[existente] = {
          ...itens[existente],
          quantidade: String(quantidade),
          valorUnitario,
          valorTotal: valorUnitario * quantidade,
          fornecedor: nomeFornecedor
        };
      } else {
        itens.push({
          produto: item.produto,
          unit: item.unit,
          quantidade: item.qtdPedir,
          valorUnitario,
          valorTotal: valorUnitario * quantidadeNumero,
          fornecedor: nomeFornecedor
        });
      }
      idsIncluidos.push(item.id);
    });
    const idsSalvos = new Set(idsIncluidos);
    const itensLimpos = itensCotacao.map(item => idsSalvos.has(item.id) ? { ...item, qtdPedir: '' } : item);
    const totalGeral = itens.filter(item => !item.bonificado).reduce((total, item) => total + (Number(item.valorTotal) || 0), 0);
    const atualizados = atuais.map(item => item.id !== pedido.id ? item : { ...item, itens, totalGeral });
    relatoriosPedidosRef.current = atualizados;
    setRelatoriosPedidosCotacao(atualizados);
    try { localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(pedidosSemPdfPesado(atualizados))); } catch { /* ignora cota */ }
    itensCotacaoRef.current = itensLimpos;
    setItensCotacao(itensLimpos);
    localStorage.setItem('rm_itens_cotacao', JSON.stringify(itensLimpos));
    registrarCustosPedido(candidatos.map(item => {
      const precoItem = parseFloat(String(item.precos?.[fornecedor.id] ?? '').replace(',', '.'));
      const { menorPreco } = calcularMenorPrecoItem(item);
      return { id: item.id, produto: item.produto, valorUnitario: (Number.isFinite(precoItem) && precoItem > 0 ? precoItem : menorPreco) || 0 };
    }));
    gravarNaWeb(undefined, undefined, undefined, undefined, itensLimpos);
    setAlerta({ tipo: 'sucesso', msg: `✓ ${candidatos.length} item(ns) da cotação incluído(s) no pedido de ${nomeFornecedor}.` });
    return true;
  };

  const removerBonificacaoDoPedido = (pedidoId: string, indiceItem: number) => {
    const atuais = Array.isArray(relatoriosPedidosRef.current) ? relatoriosPedidosRef.current : [];
    const pedido = atuais.find(item => item.id === pedidoId);
    const alvo = pedido?.itens?.[indiceItem];
    if (!alvo?.bonificado) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Só é possível excluir item de bonificação nesta tela.' });
      return false;
    }
    const atualizados = atuais.map(item => item.id !== pedidoId ? item : {
      ...item,
      itens: (item.itens || []).filter((_, indice) => indice !== indiceItem)
    });
    relatoriosPedidosRef.current = atualizados;
    setRelatoriosPedidosCotacao(atualizados);
    try { localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(pedidosSemPdfPesado(atualizados))); } catch { /* ignora cota */ }
    gravarNaWeb();
    setAlerta({ tipo: 'sucesso', msg: `✓ Bonificação "${alvo.produto}" removida.` });
    return true;
  };

  const gravarPdfNoPedido = (pedidoId: string, pdf: RelatorioPedidoCotacao['pdfFornecedor'], lista: RelatorioPedidoCotacao[]) => {
    const atualizados = lista.map(item => item.id === pedidoId ? { ...item, pdfFornecedor: pdf } : item);
    relatoriosPedidosRef.current = atualizados;
    setRelatoriosPedidosCotacao(atualizados);
    try { localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(pedidosSemPdfPesado(atualizados))); } catch { /* ignora cota */ }
    return atualizados;
  };

  const anexarPdfFornecedor = (relatorio: RelatorioPedidoCotacao) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,.pdf';
    input.onchange = async (evento: Event) => {
      const arquivo = (evento.target as HTMLInputElement).files?.[0];
      if (!arquivo) return;
      setAlerta({ tipo: 'sucesso', msg: '⏳ Enviando o PDF do vendedor para a nuvem...' });
      const leitor = new FileReader();
      leitor.onerror = () => setAlerta({ tipo: 'erro', msg: '⚠️ Não foi possível ler o PDF.' });
      leitor.onload = async () => {
        try {
          const dataUrl = String(leitor.result || '');
          const idAnexo = `pedido_${relatorio.id}`;
          await guardarAnexoLocal(idAnexo, dataUrl);
          const dados = dadosPdfFornecedor[relatorio.id] || { valor: '', observacao: '' };
          await enviarAnexoPdfBytes(idAnexo, new Uint8Array(await arquivo.arrayBuffer()));
          gravarPdfNoPedido(relatorio.id, {
            nome: arquivo.name,
            conteudo: urlArquivoAnexo(idAnexo, { nome: arquivo.name }),
            anexadoEm: new Date().toLocaleString('pt-BR'),
            valor: dados.valor ? parseFloat(dados.valor.replace(',', '.')) : undefined,
            observacao: dados.observacao
          }, relatoriosPedidosRef.current);
          await gravarNaWeb();
          setAlerta({ tipo: 'sucesso', msg: '✓ PDF do fornecedor na nuvem. Qualquer computador autorizado consegue abrir.' });
        } catch (erro) {
          setAlerta({ tipo: 'erro', msg: `⚠️ ${erro instanceof Error ? erro.message : 'Não enviou o PDF para a nuvem.'} O pedido ainda não tem anexo para o conferente.` });
        }
      };
      leitor.readAsDataURL(arquivo);
    };
    input.click();
  };

  const baixarPdfFornecedor = async (relatorio: Pick<RelatorioPedidoCotacao, 'id' | 'pdfFornecedor'>) => {
    const pdf = relatorio.pdfFornecedor;
    if (!pdf) return;
    const idAnexo = `pedido_${relatorio.id}`;
    const nome = pdf.nome || 'anexo-fornecedor.pdf';
    setAlerta({ tipo: 'sucesso', msg: '⏳ Buscando o PDF na nuvem...' });
    try {
      await garantirAnexoNaNuvem(idAnexo, pdf.conteudo);
      gravarPdfNoPedido(relatorio.id, {
        ...pdf,
        conteudo: urlArquivoAnexo(idAnexo, { nome })
      }, relatoriosPedidosRef.current);
      await gravarNaWeb();
      dispararDownloadPdf(urlArquivoAnexo(idAnexo, { baixar: true, nome }), nome);
      setAlerta({ tipo: 'sucesso', msg: '✓ PDF baixado em Downloads. O mesmo arquivo já está na nuvem para os outros computadores.' });
      return;
    } catch { /* tenta o arquivo deste aparelho só para quem anexou */ }
    const local = await abrirPdfComoArquivo(idAnexo, pdf.conteudo);
    if (!local) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Este PDF ainda não está na nuvem. Quem anexou precisa abrir o pedido e anexar de novo.' });
      return;
    }
    dispararDownloadPdf(local, nome);
    setAlerta({ tipo: 'erro', msg: '⚠️ PDF abriu só neste computador. Anexe de novo para gravar na nuvem e o conferente ver no outro aparelho.' });
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
    const dataInformada = String(dados.data || '').trim();
    const dataPedido = /^\d{4}-\d{2}-\d{2}$/.test(dataInformada)
      ? dataInformada.split('-').reverse().join('/')
      : (dataInformada || new Date().toLocaleString('pt-BR'));
    const novoRelatorio: RelatorioPedidoCotacao = {
      id: `pedido_avulso_${Date.now()}`,
      data: dataPedido,
      itens,
      totalGeral: itens.reduce((total, item) => total + (Number(item.valorTotal) || 0), 0),
      enviadoConferencia: true,
      pdfFornecedor: dados.pdf?.nome
        ? {
            nome: dados.pdf.nome,
            conteudo: dados.pdf.conteudo || '',
            anexadoEm: new Date().toLocaleString('pt-BR')
          }
        : undefined
    };
    const atuais = Array.isArray(relatoriosPedidosRef.current) ? relatoriosPedidosRef.current : [];
    const atualizados = [novoRelatorio, ...atuais.filter(item => item.id !== novoRelatorio.id)];
    relatoriosPedidosRef.current = atualizados;
    setRelatoriosPedidosCotacao(atualizados);
    try { localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(pedidosSemPdfPesado(atualizados))); } catch { /* ignora cota */ }
    setAbaConferencia('pedidos');
    const temPdfParaNuvem = Boolean(dados.pdf?.conteudo?.startsWith('data:'));
    setAlerta({
      tipo: 'sucesso',
      msg: temPdfParaNuvem
        ? '⏳ Pedido salvo. Enviando o PDF para a nuvem...'
        : `✓ Pedido de ${fornecedor} criado e enviado para Pedidos Pendentes.`
    });
    void (async () => {
      if (temPdfParaNuvem && dados.pdf) {
        const idAnexo = `pedido_${novoRelatorio.id}`;
        await guardarAnexoLocal(idAnexo, dados.pdf.conteudo);
        try {
          await enviarAnexoPdfNuvem(idAnexo, dados.pdf.conteudo);
          gravarPdfNoPedido(novoRelatorio.id, {
            nome: dados.pdf.nome,
            conteudo: urlArquivoAnexo(idAnexo, { nome: dados.pdf.nome }),
            anexadoEm: new Date().toLocaleString('pt-BR')
          }, relatoriosPedidosRef.current);
          await gravarNaWeb();
          setAlerta({ tipo: 'sucesso', msg: `✓ Pedido e PDF de ${fornecedor} na nuvem. O conferente baixa em qualquer computador.` });
          return;
        } catch (erro) {
          setAlerta({ tipo: 'erro', msg: `⚠️ Pedido salvo. O PDF abriu neste aparelho. A nuvem falhou: ${erro instanceof Error ? erro.message : 'anexe de novo em Pedidos Pendentes.'}` });
        }
      }
      await gravarNaWeb();
    })();
    return true;
  };

  const lancarMercadoriaConferidaSemPedido = (dados: { fornecedor: string; categoria: string; valorTotal: string | number; conferente?: string }) => {
    const fornecedor = String(dados.fornecedor || '').trim();
    const categoria = String(dados.categoria || '').trim();
    const valor = parseFloat(String(dados.valorTotal ?? '').replace(',', '.')) || 0;
    if (!fornecedor) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Informe a razão social / fornecedor.' });
      return false;
    }
    if (!categoria) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Selecione a categoria do item.' });
      return false;
    }
    if (valor <= 0) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Informe o valor total da mercadoria.' });
      return false;
    }
    const pedidoId = `pedido_conferido_${Date.now()}`;
    const bonificada = categoria.toLowerCase() === 'bonificada';
    const itens = [{
      produto: categoria,
      unit: 'Lote',
      quantidade: '1',
      valorUnitario: valor,
      valorTotal: valor,
      fornecedor,
      ...(bonificada ? { bonificado: true } : {})
    }];
    const novoRelatorio: RelatorioPedidoCotacao = {
      id: pedidoId,
      data: new Date().toLocaleString('pt-BR'),
      itens,
      totalGeral: valor,
      enviadoConferencia: true,
      categoria
    };
    const registro: RegistroConferencia = {
      id: `conf_${pedidoId}`,
      pedidoId,
      data: new Date().toLocaleString('pt-BR'),
      fornecedor,
      categoria,
      valorEsperado: valor,
      valorRecebido: valor,
      itensConferidos: itens,
      nomeConferente: String(dados.conferente || usuarioLogado?.nome || 'Conferente').trim(),
      observacoes: `Mercadoria conferida sem lançamento prévio. Categoria: ${categoria}.`,
      houveDivergencia: false,
      tipoDivergencia: '',
      conferentePor: usuarioLogado?.nome || 'Sistema',
      dataPreenchimento: new Date().toISOString(),
      veioBonificacao: bonificada,
      notaBonificada: bonificada
    };
    const pedidosAtualizados = [novoRelatorio, ...relatoriosPedidosRef.current].slice(0, 50);
    relatoriosPedidosRef.current = pedidosAtualizados;
    setRelatoriosPedidosCotacao(pedidosAtualizados);
    localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(pedidosAtualizados));
    const pedidosConferidosAtualizados = unirIds(pedidosConferidosRef.current, [pedidoId]);
    pedidosConferidosRef.current = pedidosConferidosAtualizados;
    setPedidosConferidosLocais(pedidosConferidosAtualizados);
    localStorage.setItem('rm_pedidos_conferidos', JSON.stringify(pedidosConferidosAtualizados));
    const novaLista = unirConferencias([registro], conferenciasRef.current);
    conferenciasRef.current = novaLista;
    setConferencias(novaLista);
    localStorage.setItem('rm_conferencias', JSON.stringify(novaLista));
    localStorage.setItem('rm_backup_conferencia', JSON.stringify({ conferencias: novaLista }));
    gravarNaWeb(undefined, undefined, undefined, undefined, undefined, undefined, novaLista);
    setAbaConferencia(bonificada ? 'bonificados' : 'conferidos');
    setAlerta({ tipo: 'sucesso', msg: bonificada ? `✓ Lançamento bonificado de ${fornecedor} foi para Pedidos bonificados.` : `✓ Lançamento de ${fornecedor} criado e marcado como conferido.` });
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
      leitor.onload = async () => {
        try {
          const novoId = `pedido_externo_${Date.now()}`;
          const idAnexo = `pedido_${novoId}`;
          const dataUrl = String(leitor.result);
          await guardarAnexoLocal(idAnexo, dataUrl);
          await enviarAnexoPdfNuvem(idAnexo, dataUrl);
          const novoRelatorio: RelatorioPedidoCotacao = { id: novoId, data: new Date().toLocaleString('pt-BR'), itens: [{ produto: 'Pedido em PDF anexado', unit: '-', quantidade: '-', valorUnitario: 0, valorTotal: 0, fornecedor: nomeFornecedorExterno.trim() }], totalGeral: 0, enviadoConferencia: true, pdfFornecedor: { nome: arquivo.name, conteudo: urlArquivoAnexo(idAnexo, { nome: arquivo.name }), anexadoEm: new Date().toLocaleString('pt-BR'), valor: undefined, observacao: '' } };
          const relatoriosAtualizados = [novoRelatorio, ...relatoriosPedidosRef.current].slice(0, 50);
          relatoriosPedidosRef.current = relatoriosAtualizados;
          setRelatoriosPedidosCotacao(relatoriosAtualizados);
          try { localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(pedidosSemPdfPesado(relatoriosAtualizados))); } catch { /* ignora cota */ }
          setNomeFornecedorExterno('');
          setMostrarAnexoFornecedorExterno(false);
          await gravarNaWeb();
          setAlerta({ tipo: 'sucesso', msg: '✓ Pedido externo anexado à Conferência.' });
        } catch (erro) {
          setAlerta({ tipo: 'erro', msg: `⚠️ ${erro instanceof Error ? erro.message : 'Não enviou o PDF para a nuvem.'}` });
        }
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

  const atualizarConferenciaPedido = (pedidoId: string, campo: 'conferente' | 'valor' | 'obs' | 'divergencia' | 'tipoDivergencia' | 'veioBonificacao' | 'categoria', valor: string | boolean) => {
    setConferenciasPorPedido(prev => {
      const atual = { conferente: '', valor: '', obs: '', divergencia: false, tipoDivergencia: '' as TipoDivergencia, veioBonificacao: '' as const, categoria: '', ...prev[pedidoId], [campo]: valor };
      if (campo === 'tipoDivergencia') atual.divergencia = Boolean(valor);
      return { ...prev, [pedidoId]: atual };
    });
  };

  const persistirPedidosCotacao = (atualizados: RelatorioPedidoCotacao[]) => {
    relatoriosPedidosRef.current = atualizados;
    setRelatoriosPedidosCotacao(atualizados);
    try { localStorage.setItem('rm_relatorios_pedidos_cotacao', JSON.stringify(pedidosSemPdfPesado(atualizados))); } catch { /* ignora cota */ }
  };

  const salvarConferenciaPedido = (relatorio: RelatorioPedidoCotacao, formularioInformado?: { conferente: string; valor: string; obs: string; divergencia: boolean; tipoDivergencia: TipoDivergencia; veioBonificacao?: '' | 'sim' | 'nao' }) => {
    const formulario = formularioInformado || conferenciasPorPedido[relatorio.id] || { conferente: '', valor: '', obs: '', divergencia: false, tipoDivergencia: '' as const, veioBonificacao: '' as const, categoria: '' };
    const valorRecebido = formulario.valor.trim() ? parseFloat(formulario.valor.replace(',', '.')) : 0;
    if (!formulario.conferente.trim() || Number.isNaN(valorRecebido)) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Informe pelo menos o nome do conferente.' });
      return;
    }
    const itensComprados = (relatorio.itens || []).filter(item => !item.bonificado);
    const registro: RegistroConferencia = { 
      id: `conf_${relatorio.id}_${Date.now()}`, 
      pedidoId: relatorio.id, 
      data: new Date().toLocaleString('pt-BR'), 
      fornecedor: itensComprados[0]?.fornecedor || relatorio.itens[0]?.fornecedor || 'Fornecedor não informado',
      valorEsperado: relatorio.totalGeral || 0,
      itensConferidos: itensComprados,
      nomeConferente: formulario.conferente.trim(), 
      valorRecebido, 
      observacoes: formulario.obs.trim(), 
      houveDivergencia: formulario.divergencia, 
      tipoDivergencia: formulario.divergencia ? formulario.tipoDivergencia : '',
      veioBonificacao: false,
      notaBonificada: false
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
    setAbaConferencia('conferidos');
    setAlerta({ tipo: 'sucesso', msg: '✓ Pedido conferido. Foi para Conferidos. A bonificação, se houver, fica em outro card.' });
  };

  const salvarBonificacaoPedido = (relatorio: RelatorioPedidoCotacao) => {
    const formulario = conferenciasPorPedido[`${relatorio.id}__bonif`] || { conferente: '', valor: '', obs: '', divergencia: false, tipoDivergencia: '' as const, veioBonificacao: '' as const, categoria: '' };
    const itensBonificados = (relatorio.itens || []).filter(item => item.bonificado);
    if (itensBonificados.length === 0) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Este pedido não tem bonificação.' });
      return;
    }
    if (formulario.veioBonificacao !== 'sim' && formulario.veioBonificacao !== 'nao') {
      setAlerta({ tipo: 'erro', msg: '⚠️ Informe se a bonificação veio: Sim ou Não.' });
      return;
    }
    const veio = formulario.veioBonificacao === 'sim';
    const valorBonificacao = itensBonificados.reduce((total, item) => total + (Number(item.valorTotal) || 0), 0);
    let valorRecebido = valorBonificacao;
    let quemRecebeu = '';
    let categoria = '';
    let divergiuValor = false;
    let tipoDivergencia: TipoDivergencia = '';
    if (veio) {
      quemRecebeu = formulario.conferente.trim();
      categoria = formulario.categoria.trim();
      const valorTexto = formulario.valor.trim();
      valorRecebido = parseFloat(valorTexto.replace(',', '.'));
      if (!quemRecebeu) {
        setAlerta({ tipo: 'erro', msg: '⚠️ Informe quem recebeu a nota bonificada.' });
        return;
      }
      if (!categoria) {
        setAlerta({ tipo: 'erro', msg: '⚠️ Selecione a categoria da nota bonificada.' });
        return;
      }
      if (!valorTexto || Number.isNaN(valorRecebido) || valorRecebido < 0) {
        setAlerta({ tipo: 'erro', msg: '⚠️ Informe o valor recebido da nota bonificada.' });
        return;
      }
      const cents = Math.round((valorRecebido - valorBonificacao) * 100);
      divergiuValor = formulario.divergencia || cents !== 0;
      tipoDivergencia = !divergiuValor ? '' : cents > 0 ? 'valor_mais' : cents < 0 ? 'valor_menos' : 'valor';
    }
    persistirPedidosCotacao(relatoriosPedidosRef.current.map(item => item.id !== relatorio.id ? item : { ...item, bonificacaoResolvida: true, veioBonificacao: veio }));
    if (veio) {
      const registro: RegistroConferencia = {
        id: `conf_bonif_${relatorio.id}_${Date.now()}`,
        pedidoId: `${relatorio.id}__bonif`,
        data: new Date().toLocaleString('pt-BR'),
        fornecedor: itensBonificados[0]?.fornecedor || relatorio.itens[0]?.fornecedor || 'Fornecedor não informado',
        categoria,
        valorEsperado: valorBonificacao,
        itensConferidos: itensBonificados,
        nomeConferente: quemRecebeu,
        valorRecebido,
        observacoes: formulario.obs.trim(),
        houveDivergencia: divergiuValor,
        tipoDivergencia,
        veioBonificacao: true,
        notaBonificada: true
      };
      const novaLista = unirConferencias([registro], conferenciasRef.current);
      conferenciasRef.current = novaLista;
      setConferencias(novaLista);
      localStorage.setItem('rm_conferencias', JSON.stringify(novaLista));
      localStorage.setItem('rm_backup_conferencia', JSON.stringify({ conferencias: novaLista }));
      gravarNaWeb();
      setAbaConferencia('bonificados');
      setAlerta({ tipo: 'sucesso', msg: '✓ Bonificação concluída. Foi para Pedidos bonificados.' });
      return;
    }
    gravarNaWeb();
    setAlerta({ tipo: 'sucesso', msg: '✓ Bonificação marcada como não veio. O pedido comprado continua em Conferidos.' });
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

    const visualizarPdfFornecedor = async (relatorio: RelatorioPedidoCotacao) => {
    if (!relatorio.pdfFornecedor) return;
    setAlerta({ tipo: 'sucesso', msg: '⏳ Abrindo o PDF anexado...' });
    const idAnexo = `pedido_${relatorio.id}`;
    try {
      await garantirAnexoNaNuvem(idAnexo, relatorio.pdfFornecedor.conteudo);
      gravarPdfNoPedido(relatorio.id, {
        ...relatorio.pdfFornecedor,
        conteudo: urlArquivoAnexo(idAnexo, { nome: relatorio.pdfFornecedor.nome })
      }, relatoriosPedidosRef.current);
      await gravarNaWeb();
    } catch { /* se a nuvem falhar, ainda tenta abrir o arquivo local */ }
    const url = await abrirPdfComoArquivo(idAnexo, relatorio.pdfFornecedor.conteudo);
    if (!url) {
      setAlerta({ tipo: 'erro', msg: '⚠️ Este PDF ainda não está neste aparelho nem na nuvem. Anexe de novo neste pedido.' });
      return;
    }
    setAlerta(null);
    setPdfFornecedorVisualizacao({
      nome: relatorio.pdfFornecedor.nome,
      conteudo: url,
      pedidoId: relatorio.id
    });
  };

  const visualizarPedidoLancadoPdf = (relatorio: RelatorioPedidoCotacao) => {
    const itens = Array.isArray(relatorio.itens) ? relatorio.itens : [];
    const linhas = itens.map(item => ({
      produto: item.bonificado ? `${item.produto} (bonificado)` : item.produto,
      unit: item.unit,
      quantidade: String(item.quantidade ?? ''),
      valorUnitario: Number(item.valorUnitario) || 0,
      valorTotal: Number(item.valorTotal) || 0,
      bonificado: !!item.bonificado
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
    const blob = gerarPdfRelatorioPagamentos(dp, valorTotal, dataRotulo, vistoFinanceiroNome);
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
    elieudaAlteradaRef.current = true;
    agendarGravacaoEdicao({ quantidadesElieuda: novoObj });
  };

  const limparDadosElieuda = () => {
    if (window.confirm('Confirma a limpeza de todas as quantidades para iniciar um novo pedido?')) {
      const novoObj: QuantidadesElieuda = {};
      setQuantidadesElieuda(novoObj);
      elieudaAlteradaRef.current = true;
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
  const pedidosConferidosIds = new Set([...pedidosConferidosLocais, ...conferenciasLista.filter(conferencia => conferencia.pedidoId && !conferencia.notaBonificada).map(conferencia => conferencia.pedidoId)]);
  const pedidosAindaNaCotacao = relatoriosPedidosLista.filter(relatorio => relatorio.enviadoConferencia !== true);
  const pedidosPendentesConferencia = relatoriosPedidosLista.filter(relatorio => relatorio.enviadoConferencia !== false && !pedidosConferidosIds.has(relatorio.id));
  const pedidosBonificacaoPendentes = relatoriosPedidosLista.filter(relatorio => relatorio.enviadoConferencia !== false && !relatorio.bonificacaoResolvida && (relatorio.itens || []).some(item => item.bonificado));
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
  const pedidosBonificacaoPendentesFiltrados = pedidosBonificacaoPendentes.filter(relatorio => pedidoBateFornecedor(relatorio, buscaFornecedorConferencia));
  const conferenciasFiltradas = conferenciasLista.filter(conf => conferenciaBateFornecedor(conf, buscaFornecedorConferencia));
  const divergenciasFiltradas = conferenciasFiltradas.filter(conf => conf.houveDivergencia);
  const pedidosRealizadosTotal = relatoriosPedidosLista.length;
  const pedidosPendentesTotal = pedidosPendentesConferencia.length + pedidosBonificacaoPendentes.filter(relatorio => pedidosConferidosIds.has(relatorio.id)).length;
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
  const botaoFerramenta = 'cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50';
  const comprasAberta = ['compras', 'cotacao', 'cadastroProdutos', 'cadastroFornecedores', 'pagamentos', 'consultaPagamentos', 'reciboComprador', 'elieuda', 'conferencia', 'notasConferidas'].includes(tabAtiva);
  const conciliacaoAberta = tabAtiva === 'conciliacao' || tabAtiva === 'conciliacaoCompras' || tabAtiva === 'arquivoCeasa' || tabAtiva === 'inteligenciaEstoque' || tabAtiva === 'consultasConciliacao';
  const podeConciliar = usuarioLogado?.tipo === 'admin' || Boolean(usuarioLogado?.permissoes.conciliacao);
  const manutencaoAbertas = ordensPendenteQtd + ordensAndamentoQtd + ordensPausadaQtd;
  const nuvemSincronizando = /sincronizando/i.test(statusNuvem);
  const nuvemProblema = /fora|sem nuvem|offline|não gravou|só neste/i.test(statusNuvem);
  const textoNuvemTopo = nuvemSincronizando ? 'Sincronizando...' : nuvemProblema ? 'Nuvem fora do ar' : 'Nuvem Sincronizada (Automático)';
  type ItemMenuLateral = { id: string; rotulo: string; ativo: boolean; aoClicar: () => void; icone: string; selo?: number; seloCor?: 'rose' | 'sky' };
  const itensMenu: ItemMenuLateral[] = [
    { id: 'inicio', rotulo: 'Início', ativo: tabAtiva === 'inicio', aoClicar: () => setTabAtiva('inicio'), icone: 'inicio' }
  ];
  if (usuarioLogado?.permissoes.estoque || usuarioLogado?.tipo === 'admin') itensMenu.push({ id: 'estoque', rotulo: 'Estoque', ativo: tabAtiva === 'estoque', aoClicar: () => setTabAtiva('estoque'), icone: 'estoque' });
  if (usuarioLogado?.permissoes.pendencias) itensMenu.push({ id: 'pendencias', rotulo: 'Pendências', ativo: tabAtiva === 'pendencias', aoClicar: () => { setFiltroStatusTarefas('todas'); setTabAtiva('pendencias'); }, icone: 'pendencias', selo: totalAbertasGeral > 0 ? totalAbertasGeral : undefined, seloCor: 'rose' });
  if (usuarioLogado?.permissoes.pendencias) itensMenu.push({ id: 'checklist', rotulo: 'Checklist', ativo: tabAtiva === 'checklist', aoClicar: () => setTabAtiva('checklist'), icone: 'checklist' });
  if (usuarioLogado?.permissoes.cotacao || usuarioLogado?.permissoes.pagamentos || usuarioLogado?.permissoes.elieuda || usuarioLogado?.permissoes.conferencias) itensMenu.push({ id: 'compras', rotulo: 'Compras', ativo: comprasAberta, aoClicar: () => setTabAtiva('compras'), icone: 'compras' });
  if (podeConciliar) itensMenu.push({ id: 'conciliacao', rotulo: 'Conciliação', ativo: conciliacaoAberta, aoClicar: () => setTabAtiva('conciliacao'), icone: 'conciliacao' });
  if (usuarioLogado?.permissoes.manutencao) itensMenu.push({ id: 'manutencao', rotulo: 'FOLLOW-UP', ativo: tabAtiva === 'manutencao', aoClicar: () => setTabAtiva('manutencao'), icone: 'manutencao', selo: manutencaoAbertas > 0 ? manutencaoAbertas : undefined, seloCor: 'sky' });
  if (usuarioLogado?.permissoes.producao) itensMenu.push({ id: 'producao', rotulo: 'Produção', ativo: tabAtiva === 'producao', aoClicar: () => setTabAtiva('producao'), icone: 'producao' });
  if (usuarioLogado?.permissoes.caixaOperacional) itensMenu.push({ id: 'caixa', rotulo: 'Caixa', ativo: tabAtiva === 'caixaOperacional', aoClicar: () => setTabAtiva('caixaOperacional'), icone: 'caixa' });
  if (usuarioLogado?.permissoes.relatorios) itensMenu.push({ id: 'relatorios', rotulo: 'Relatórios', ativo: tabAtiva === 'relatorios', aoClicar: () => setTabAtiva('relatorios'), icone: 'relatorios' });
  if (usuarioLogado?.permissoes.dados) itensMenu.push({ id: 'dados', rotulo: 'Dados', ativo: tabAtiva === 'dados', aoClicar: () => setTabAtiva('dados'), icone: 'dados' });
  itensMenu.push({ id: 'seguranca', rotulo: 'Segurança', ativo: tabAtiva === 'seguranca', aoClicar: () => setTabAtiva('seguranca'), icone: 'seguranca' });

  const IconeMenu = ({ nome }: { nome: string }) => {
    const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className: 'h-[18px] w-[18px] shrink-0', viewBox: '0 0 24 24', 'aria-hidden': true as const };
    if (nome === 'inicio') return <svg {...p}><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" /></svg>;
    if (nome === 'checklist') return <svg {...p}><path d="m5 12 4 4L19 6" /><path d="M4 4h5M4 20h16" /></svg>;
    if (nome === 'estoque') return <svg {...p}><path d="M4 8 12 4l8 4-8 4-8-4z" /><path d="M4 12l8 4 8-4" /><path d="M4 16l8 4 8-4" /></svg>;
    if (nome === 'pendencias') return <svg {...p}><path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" /><path d="M10 21a2 2 0 0 0 4 0" /></svg>;
    if (nome === 'compras') return <svg {...p}><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /><path d="M3 4h2l2.2 11h11.3l2-7H7" /></svg>;
    if (nome === 'conciliacao') return <svg {...p}><path d="M12 3v18M7 21h10" /><path d="M6 8 3.5 14a3.2 3.2 0 0 0 5 0L6 8zM18 8l-2.5 6a3.2 3.2 0 0 0 5 0L18 8z" /></svg>;
    if (nome === 'manutencao') return <svg {...p}><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4L15 12l-3-3z" /></svg>;
    if (nome === 'producao') return <svg {...p}><path d="M4 19V10M10 19V5M16 19v-7M22 19H2" /></svg>;
    if (nome === 'caixa') return <svg {...p}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>;
    if (nome === 'relatorios') return <svg {...p}><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v6h6M8 13h8M8 17h6" /></svg>;
    if (nome === 'dados') return <svg {...p}><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" /><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></svg>;
    return <svg {...p}><path d="M12 3 5 6v6c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6z" /></svg>;
  };
  const classeItemMenu = (ativo: boolean, compacto = false) =>
    `flex items-center gap-3 rounded-lg border-0 text-left font-semibold tracking-wide cursor-pointer transition ${compacto ? 'shrink-0 px-3 py-2 text-[11px] uppercase' : 'w-full px-3 py-2.5 text-[13px] uppercase'} ${ativo ? 'bg-white/20 text-white' : 'bg-transparent text-white/80 hover:bg-white/10 hover:text-white'}`;
  const desenharItemMenu = (item: ItemMenuLateral, compacto = false) => (
    <button key={`${compacto ? 'm-' : ''}${item.id}`} type="button" onClick={item.aoClicar} className={classeItemMenu(item.ativo, compacto)} aria-current={item.ativo ? 'page' : undefined}>
      <span className="relative text-white">
        <IconeMenu nome={item.icone} />
        {item.icone === 'pendencias' && (item.selo || 0) > 0 && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#0a5c56]" />}
      </span>
      <span>{item.rotulo}</span>
      {(item.selo || 0) > 0 && (
        <span className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white ${item.seloCor === 'sky' ? 'bg-sky-500' : 'bg-rose-500'}`}>{item.selo}</span>
      )}
    </button>
  );

  return (
    <div className="flex min-h-screen w-full bg-[#eef2f6] font-sans">
      <aside className="hidden w-60 shrink-0 flex-col bg-[#0a5c56] text-white md:flex">
        <div className="flex items-center gap-2.5 px-4 pb-4 pt-5">
          <img src="/rm-icon-login.png?v=2" alt="RM" width={36} height={36} className="h-9 w-9 rounded-[10px] bg-white object-cover" />
          <div className="leading-tight">
            <p className="m-0 text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">RM</p>
            <strong className="text-[15px] font-black text-white">Sistema-Gestão</strong>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 pb-6">
          {itensMenu.map(item => desenharItemMenu(item))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <p className="m-0 text-sm text-slate-600">Usuário: <strong className="font-semibold text-slate-800">{usuarioLogado?.nome}</strong></p>
          <div className="flex flex-wrap items-center gap-4">
            <div className={`text-right text-[11px] font-semibold leading-tight ${nuvemProblema ? 'text-amber-700' : 'text-emerald-600'}`}>
              <span className="inline-flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M7 18h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.5-1.5A4 4 0 0 0 7 18z" /></svg>
                {textoNuvemTopo}
              </span>
              <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Atualização: {ultimaAtualizacao}</span>
            </div>
            <button type="button" onClick={fazerLogout} className="cursor-pointer rounded-lg border-0 bg-rose-500 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-400">
              Sair / Bloquear
            </button>
          </div>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-[#084843] bg-[#0a5c56] px-3 py-2 md:hidden">
          {itensMenu.map(item => desenharItemMenu(item, true))}
        </nav>
        <main className="box-border w-full flex-1 px-4 py-5 sm:px-6">
          {alerta && (
            <div className={`mb-4 rounded-2xl px-5 py-3 text-sm font-bold ${alerta.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100' : 'bg-rose-50 text-rose-800 ring-1 ring-rose-100'}`}>
              {alerta.msg}
            </div>
          )}

          {tabAtiva === 'estoque' && (usuarioLogado?.permissoes.estoque || usuarioLogado?.tipo === 'admin') && (
            <AbaEstoque />
          )}

          {tabAtiva === 'inicio' && (
            <div className="mx-auto flex max-w-5xl flex-col gap-4">
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="m-0 mb-4 text-base font-semibold text-slate-900">Gestão de Arquivos & Nuvem</h2>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={async () => { const gravado = await gravarNaWeb(); setAlerta(gravado ? { tipo: 'sucesso', msg: '✓ Gravado na NUVEM agora.' } : { tipo: 'erro', msg: '⚠️ Não foi possível gravar na nuvem. Verifique as credenciais e o status da conexão.' }); }} className={botaoFerramenta}>Salvar agora</button>
                  <button type="button" onClick={() => { void carregarTudo(); setAlerta({ tipo: 'sucesso', msg: '✓ Buscando o que já está na nuvem.' }); }} className={botaoFerramenta}>Buscar da nuvem</button>
                  <input type="file" accept="application/json" onChange={importarBackupConferencia} className="hidden" id="importar-conferencia" />
                  <button type="button" onClick={() => document.getElementById('importar-conferencia')?.click()} className={botaoFerramenta}>Importar conferência</button>
                  <button type="button" onClick={() => restaurarBackupDoUsuarioAtual()} className={botaoFerramenta}>Meu backup</button>
                  <button type="button" onClick={restaurarUltimoBackup} className={botaoFerramenta}>Último backup</button>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="m-0 mb-4 text-base font-semibold text-slate-900">Proteção do Sistema</h2>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <strong className="block text-sm text-slate-900">Proteção de {usuarioLogado?.nome}</strong>
                    <span className="text-xs text-slate-500">{historicoBackupsUsuario.length} visita(s) protegida(s) neste navegador</span>
                  </div>
                  <button type="button" onClick={() => setMostrarHistoricoBackups(!mostrarHistoricoBackups)} className="cursor-pointer border-0 bg-transparent p-0 text-sm text-slate-700 underline">
                    {mostrarHistoricoBackups ? 'Ocultar histórico' : 'Ver histórico de visitas'}
                  </button>
                </div>
                {mostrarHistoricoBackups && (
                  <div className="mt-3 border-t border-slate-100 pt-2">
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
                            <button type="button" onClick={() => restaurarBackupDoUsuarioAtual(backup)} className="cursor-pointer rounded-lg border-0 bg-orange-50 px-3 py-1.5 text-[11px] font-bold text-orange-700 ring-1 ring-orange-200 hover:bg-orange-100">Restaurar esta visita</button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </section>
            </div>
          )}

          {tabAtiva === 'compras' && (
            <AbaCompras
              permissoes={usuarioLogado?.permissoes}
              setTabAtiva={(aba) => {
                if (aba === 'conferencia') setAbaConferencia('menu');
                setTabAtiva(aba);
              }}
            />
          )}
          {tabAtiva === 'conciliacao' && podeConciliar && (
            <AbaConciliacao setTabAtiva={setTabAtiva} />
          )}
          {tabAtiva === 'arquivoCeasa' && podeConciliar && (
            <AbaArquivoCeasa onVoltar={() => setTabAtiva('conciliacao')} />
          )}
          {tabAtiva === 'consultasConciliacao' && podeConciliar && (
            <AbaHistoricoConciliacao lotes={lotesConciliacao} onVoltar={() => setTabAtiva('conciliacao')} />
          )}
          {tabAtiva === 'inteligenciaEstoque' && podeConciliar && (
            <AbaInteligenciaEstoque
              onVoltar={() => setTabAtiva('conciliacao')}
              lotes={lotesInteligencia}
              aoSalvarLote={(lote) => {
                const uniao = unirLotesInteligencia(lotesInteligenciaRef.current, [lote]);
                lotesInteligenciaRef.current = uniao;
                setLotesInteligencia(uniao);
                gravarJsonLocal('rm_lotes_inteligencia', uniao);
                void gravarNaWeb();
              }}
            />
          )}
          {tabAtiva === 'conciliacaoCompras' && podeConciliar && (
            <AbaConciliacaoCompras
              onVoltar={() => setTabAtiva('conciliacao')}
              lotes={lotesConciliacao}
              aoArquivarLote={async (lote) => {
                const uniao = unirLotesConciliacao(lotesConciliacaoRef.current, [lote]);
                lotesConciliacaoRef.current = uniao;
                setLotesConciliacao(uniao);
                gravarJsonLocal('rm_lotes_conciliacao', uniao);
                return await gravarNaWeb();
              }}
            />
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

          {tabAtiva === 'checklist' && usuarioLogado?.permissoes.pendencias && (
            <AbaChecklist
              itens={itensChecklist}
              statusNuvem={statusNuvem}
              adicionarItem={adicionarItemChecklist}
              atualizarItem={atualizarItemChecklist}
              alternarItem={alternarItemChecklist}
              removerItem={removerItemChecklist}
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

          {tabAtiva === 'caixaOperacional' && usuarioLogado?.permissoes.caixaOperacional && (
            <AbaCaixaOperacional
              movimentos={movimentosCaixaOperacional}
              nomeUsuario={usuarioLogado?.nome || ''}
              adicionar={adicionarMovimentoCaixaOperacional}
              remover={removerMovimentoCaixaOperacional}
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
              adicionarBonificacaoNoPedido={adicionarBonificacaoNoPedido}
              incluirItensNoPedidoSalvo={incluirItensNoPedidoSalvo}
              removerBonificacaoDoPedido={removerBonificacaoDoPedido}
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
              incluirProdutoEstoqueNaCotacao={incluirProdutoEstoqueNaCotacao}
              retirarProdutoEstoqueDaCotacao={retirarProdutoEstoqueDaCotacao}
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
              pedidosPendentesConferencia={pedidosPendentesConferencia}
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
          {(tabAtiva === 'pagamentos' || tabAtiva === 'consultaPagamentos') && usuarioLogado?.permissoes.pagamentos && (
            <AbaPagamentos
              abaConsulta={tabAtiva === 'consultaPagamentos'}
              vistoFinanceiroNome={vistoFinanceiroNome}
              setVistoFinanceiroNome={escolherVistoFinanceiro}
              nomesVistoFinanceiro={NOMES_VISTO_FINANCEIRO}
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

          {tabAtiva === 'notasConferidas' && usuarioLogado?.permissoes.conferencias && (
            <AbaNotasConferidas
              conferencias={conferenciasLista}
              setTabAtiva={setTabAtiva}
              voltarParaConferencia={() => {
                setAbaConferencia('menu');
                setTabAtiva('conferencia');
              }}
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
              lancarMercadoriaConferidaSemPedido={lancarMercadoriaConferidaSemPedido}
              nomeConferentePadrao={usuarioLogado?.nome || ''}
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
              pedidosBonificacaoPendentesFiltrados={pedidosBonificacaoPendentesFiltrados}
              pedidosPendentesTotal={pedidosPendentesTotal}
              salvarBonificacaoPedido={salvarBonificacaoPedido}
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
              baixarPdfFornecedor={baixarPdfFornecedor}
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
                    {pdfFornecedorVisualizacao.pedidoId ? (
                      <button
                        type="button"
                        onClick={() => baixarPdfFornecedor({ id: pdfFornecedorVisualizacao.pedidoId, pdfFornecedor: { nome: pdfFornecedorVisualizacao.nome, conteudo: '', anexadoEm: '' } })}
                        className="cursor-pointer rounded-lg bg-teal-700 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-teal-600"
                      >
                        Baixar
                      </button>
                    ) : (
                      <a href={pdfFornecedorVisualizacao.conteudo} download={pdfFornecedorVisualizacao.nome} className="cursor-pointer rounded-lg bg-teal-700 px-3 py-1.5 text-[11px] font-bold text-white no-underline hover:bg-teal-600">
                        Baixar
                      </a>
                    )}
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
              <div style={{ width: '360px', textAlign: 'center', borderTop: '2px solid #0f172a', paddingTop: '8px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>Visto Autorização Financeiro</div>
                <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{vistoFinanceiroNome}</div>
              </div>
            </div>
            <div className="relatorio-pagamentos-acoes" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
              <select value={vistoFinanceiroNome} onChange={e => escolherVistoFinanceiro(e.target.value)} style={{ padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                {NOMES_VISTO_FINANCEIRO.map(nome => (
                  <option key={nome} value={nome}>{nome}</option>
                ))}
              </select>
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