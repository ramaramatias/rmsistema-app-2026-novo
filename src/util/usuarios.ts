import type { SenhasUsuarios, Usuario } from '../tipos';
import { PERMISSOES_OPCOES, USUARIOS_SISTEMA } from '../dados/padroes';

export const permissoesPadraoNovoUsuario = (): Usuario['permissoes'] => ({
  pendencias: true,
  conferencias: false,
  cotacao: false,
  pagamentos: false,
  relatorios: false,
  elieuda: false,
  manutencao: false,
  dados: false,
  producao: false,
  caixaOperacional: false,
  estoque: false,
  conciliacao: false
});

export const rotuloPermissoes = (permissoes: Usuario['permissoes']) => {
  const ativas = PERMISSOES_OPCOES.filter(opcao => permissoes[opcao.chave]).map(opcao => opcao.nome);
  return ativas.length ? ativas.join(' • ') : 'Sem abas (apenas Segurança)';
};

export const normalizarUsuarioCadastrado = (usuario: Usuario): Usuario | null => {
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
      dados: Boolean(usuario.permissoes?.dados),
      producao: Boolean(usuario.permissoes?.producao),
      caixaOperacional: Boolean(usuario.permissoes?.caixaOperacional),
      estoque: Boolean(usuario.permissoes?.estoque),
      conciliacao: Boolean(usuario.permissoes?.conciliacao)
    }
  };
};

export const unirUsuariosCadastrados = (...listas: Array<Usuario[] | undefined>) => {
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

export const lerUsuariosExtraDeletados = (): string[] => {
  try {
    const salvo = JSON.parse(localStorage.getItem('rm_usuarios_extra_deletados') || '[]');
    return Array.isArray(salvo) ? salvo.map(id => String(id || '').trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
};

export const unirUsuariosExtraAtivos = (idsDeletados: string[] = [], ...listas: Array<Usuario[] | undefined>) => {
  const removidos = new Set((idsDeletados || []).filter(Boolean));
  return unirUsuariosCadastrados(...listas).filter(usuario =>
    !USUARIOS_SISTEMA.some(oficial => oficial.id === usuario.id) && !removidos.has(usuario.id)
  );
};

export const omitirIdsDoMapa = <T,>(mapa: { [id: string]: T } | undefined, idsDeletados: string[] = []) => {
  const uniao = { ...(mapa || {}) };
  (idsDeletados || []).forEach(id => { delete uniao[id]; });
  return uniao;
};

export const unirPermissoesUsuarios = (...mapas: Array<{ [id: string]: Usuario['permissoes'] } | undefined>) => {
  const uniao: { [id: string]: Usuario['permissoes'] } = {};
  mapas.forEach(mapa => {
    Object.entries(mapa || {}).forEach(([id, permissoes]) => {
      if (!id || !permissoes) return;
      uniao[id] = { ...permissoesPadraoNovoUsuario(), ...permissoes };
    });
  });
  return uniao;
};

export const aplicarPermissoesSalvas = (usuario: Usuario, permissoesSalvas: { [id: string]: Usuario['permissoes'] }) => {
  const permissoes = {
    ...permissoesPadraoNovoUsuario(),
    ...usuario.permissoes,
    ...(permissoesSalvas[usuario.id] || {})
  };
  if (usuario.tipo === 'admin') permissoes.estoque = true;
  return { ...usuario, permissoes };
};

export const lerSenhasLocais = (): SenhasUsuarios => {
  try {
    const salvo = localStorage.getItem('rm_senhas_usuarios');
    const parsed = salvo ? JSON.parse(salvo) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const hashSenha = async (senha: string) => {
  const dados = new TextEncoder().encode(`rm-sistema-gestao:${senha}`);
  const buffer = await crypto.subtle.digest('SHA-256', dados);
  return Array.from(new Uint8Array(buffer)).map(byte => byte.toString(16).padStart(2, '0')).join('');
};
