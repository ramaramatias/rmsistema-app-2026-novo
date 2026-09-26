const campo = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15';
const botaoPrimario = 'w-full cursor-pointer rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-600 disabled:cursor-wait disabled:opacity-80';
const botaoPerigo = 'cursor-pointer rounded-lg bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100';
const botaoAlerta = 'cursor-pointer rounded-lg bg-orange-50 px-3 py-1.5 text-[11px] font-bold text-orange-800 ring-1 ring-orange-200 hover:bg-orange-100';
const aviso = 'mb-2 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs font-bold text-amber-800 ring-1 ring-amber-200';

export function AbaSeguranca(p: {
  PERMISSOES_OPCOES: any;
  USUARIOS_SISTEMA: any;
  adicionarNovoUsuario: any;
  alterarPermissaoUsuario: any;
  confirmarSenha: any;
  erroNovoUsuario: any;
  erroSenha: any;
  fazerLogout: any;
  historicoBackupsUsuario: any;
  novaSenha: any;
  novoUsuarioNome: any;
  novoUsuarioPermissoes: any;
  novoUsuarioSenha: any;
  redefinirSenhaUsuario: any;
  removerUsuarioCadastrado: any;
  restaurarBackupDoUsuarioAtual: any;
  rotuloPermissoes: any;
  salvandoSenha: any;
  salvarMinhaSenha: any;
  senhasUsuarios: any;
  setConfirmarSenha: any;
  setNovaSenha: any;
  setNovoUsuarioNome: any;
  setNovoUsuarioPermissoes: any;
  setNovoUsuarioSenha: any;
  setTabAtiva: any;
  statusSalvoSeguranca: any;
  usuarioLogado: any;
  usuarioPermissaoSalvaId: any;
  usuariosDoSistema: any;
}) {
  const {
    PERMISSOES_OPCOES,
    USUARIOS_SISTEMA,
    adicionarNovoUsuario,
    alterarPermissaoUsuario,
    confirmarSenha,
    erroNovoUsuario,
    erroSenha,
    fazerLogout,
    historicoBackupsUsuario,
    novaSenha,
    novoUsuarioNome,
    novoUsuarioPermissoes,
    novoUsuarioSenha,
    redefinirSenhaUsuario,
    removerUsuarioCadastrado,
    restaurarBackupDoUsuarioAtual,
    rotuloPermissoes,
    salvandoSenha,
    salvarMinhaSenha,
    senhasUsuarios,
    setConfirmarSenha,
    setNovaSenha,
    setNovoUsuarioNome,
    setNovoUsuarioPermissoes,
    setNovoUsuarioSenha,
    setTabAtiva,
    statusSalvoSeguranca,
    usuarioLogado,
    usuarioPermissaoSalvaId,
    usuariosDoSistema
  } = p;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 sm:p-6">
      <button type="button" onClick={() => setTabAtiva('pendencias')} className="mb-4 cursor-pointer rounded-lg bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-white">
        ← Voltar ao sistema
      </button>
      <h2 className="m-0 text-lg font-black uppercase tracking-tight text-slate-900">Segurança</h2>
      <p className="mb-4 mt-1 text-xs text-slate-500">Senhas, usuários e bloqueio do sistema. Fica nesta tela até você voltar.</p>

      {statusSalvoSeguranca && (
        <div className={`sticky top-2 z-20 mb-4 rounded-2xl px-4 py-3 text-sm font-black ring-1 ${
          statusSalvoSeguranca.startsWith('Salvando')
            ? 'bg-amber-50 text-amber-900 ring-amber-200'
            : 'bg-teal-50 text-teal-900 ring-teal-200'
        }`}>
          {statusSalvoSeguranca}
        </div>
      )}

      <div className="mb-4 grid gap-3.5 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <strong className="mb-1.5 block text-sm text-slate-900">Usuário ativo</strong>
          <div className="text-base font-black text-teal-700">{usuarioLogado?.nome}</div>
          <span className="text-[11px] text-slate-500">{usuarioLogado?.tipo === 'admin' ? 'Administrador' : 'Usuário do sistema'}</span>
          <button type="button" onClick={fazerLogout} className="mt-3 w-full cursor-pointer rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800 ring-1 ring-rose-200 hover:bg-rose-100">
            Sair / Bloquear
          </button>
        </div>

        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <strong className="mb-2 block text-sm text-slate-900">Minha senha</strong>
          <p className="mb-2.5 mt-0 text-[11px] text-slate-500">
            {usuarioLogado && senhasUsuarios[usuarioLogado.id]
              ? 'Altere a senha pessoal. Ela vale em qualquer computador.'
              : 'Defina uma senha só sua. Depois ela substitui a senha padrão neste usuário.'}
          </p>
          <input type="password" placeholder="Nova senha" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} className={`${campo} mb-2`} />
          <input type="password" placeholder="Confirmar nova senha" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} className={`${campo} mb-2`} />
          {erroSenha && <div className={aviso}>{erroSenha}</div>}
          <button type="button" onClick={salvarMinhaSenha} disabled={salvandoSenha} className={botaoPrimario}>
            {salvandoSenha ? 'Salvando...' : 'Salvar senha'}
          </button>
        </div>
      </div>

      {usuarioLogado?.tipo === 'admin' && (
        <>
          <div className="mb-4 rounded-2xl bg-teal-50 p-4 ring-1 ring-teal-200">
            <strong className="mb-1.5 block text-sm text-teal-950">Adicionar novo usuário</strong>
            <p className="mb-3 mt-0 text-[11px] text-teal-800">Marque as permissões: é isso que a pessoa vai poder abrir no sistema.</p>
            <input type="text" placeholder="Nome do usuário" value={novoUsuarioNome} onChange={e => setNovoUsuarioNome(e.target.value)} className={`${campo} mb-2`} />
            <input type="password" placeholder="Senha inicial (opcional — se vazio, usa a senha padrão)" value={novoUsuarioSenha} onChange={e => setNovoUsuarioSenha(e.target.value)} className={`${campo} mb-3`} />
            <div className="mb-2.5 grid gap-2 sm:grid-cols-2">
              {PERMISSOES_OPCOES.map((opcao: any) => (
                <label key={opcao.chave} className="flex cursor-pointer items-start gap-2 rounded-xl bg-white p-2 ring-1 ring-teal-100">
                  <input
                    type="checkbox"
                    checked={novoUsuarioPermissoes[opcao.chave]}
                    onChange={e => setNovoUsuarioPermissoes((atuais: any) => ({ ...atuais, [opcao.chave]: e.target.checked }))}
                    className="mt-0.5 h-4 w-4 accent-teal-700"
                  />
                  <span>
                    <strong className="block text-xs text-slate-900">{opcao.nome}</strong>
                    <span className="text-[10px] text-slate-500">{opcao.detalhe}</span>
                  </span>
                </label>
              ))}
            </div>
            <div className="mb-2.5 text-[11px] font-bold text-teal-900">
              Vai poder acessar: {rotuloPermissoes(novoUsuarioPermissoes)}
            </div>
            {erroNovoUsuario && <div className={aviso}>{erroNovoUsuario}</div>}
            <button type="button" onClick={adicionarNovoUsuario} className={botaoPrimario}>
              Salvar novo usuário
            </button>
          </div>

          <div className="mb-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <strong className="mb-2 block text-sm text-slate-900">Usuários e permissões</strong>
            <p className="mb-3 mt-0 text-[11px] text-slate-500">Marque ou desmarque o que cada pessoa pode abrir. Quem você criou aqui pode ser removido; Ramara e os usuários oficiais do sistema não saem da lista.</p>
            <div className="flex flex-col gap-2">
              {usuariosDoSistema.map((usuario: any) => (
                <div key={usuario.id} className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-2.5">
                    <div className="min-w-[180px] flex-1">
                      <strong className="block text-sm text-slate-900">{usuario.nome}</strong>
                      <span className="my-1 block text-[11px] text-sky-800">
                        Pode acessar: {rotuloPermissoes(usuario.permissoes)}
                      </span>
                      {usuarioPermissaoSalvaId === usuario.id && statusSalvoSeguranca.startsWith('✓') && (
                        <span className="mb-1 inline-block rounded-full bg-teal-700 px-2 py-0.5 text-[10px] font-bold text-white">Gravado</span>
                      )}
                      <span className={`text-[11px] font-semibold ${senhasUsuarios[usuario.id] ? 'text-teal-800' : 'text-amber-700'}`}>
                        {senhasUsuarios[usuario.id] ? 'Senha pessoal cadastrada' : 'Ainda usa a senha padrão'}
                      </span>
                    </div>
                    {usuario.id !== usuarioLogado.id && (
                      <div className="flex flex-wrap gap-1.5">
                        <button type="button" onClick={() => redefinirSenhaUsuario(usuario.id)} className={botaoAlerta}>
                          Voltar à senha padrão
                        </button>
                        {!USUARIOS_SISTEMA.some((oficial: any) => oficial.id === usuario.id) && (
                          <button type="button" onClick={() => removerUsuarioCadastrado(usuario.id)} className={botaoPerigo}>
                            Remover
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-4">
                    {PERMISSOES_OPCOES.map((opcao: any) => (
                      <label key={`${usuario.id}-${opcao.chave}`} className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white px-2 py-1.5 text-[11px] text-slate-900 ring-1 ring-slate-200">
                        <input
                          type="checkbox"
                          checked={Boolean(usuario.permissoes[opcao.chave])}
                          onChange={e => alterarPermissaoUsuario(usuario.id, opcao.chave, e.target.checked)}
                          className="h-3.5 w-3.5 accent-teal-700"
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

      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <strong className="mb-1.5 block text-sm text-slate-900">Proteção de {usuarioLogado?.nome}</strong>
        <span className="text-[11px] text-slate-500">{historicoBackupsUsuario.length} visita(s) protegida(s) neste navegador</span>
        <div className="mt-3">
          {historicoBackupsUsuario.length === 0 ? (
            <span className="text-[11px] text-slate-500">Nenhum backup deste usuário foi registrado ainda.</span>
          ) : (
            historicoBackupsUsuario.map((backup: any, indice: number) => {
              const tarefas = Array.isArray(backup.setores) ? backup.setores.reduce((total: number, setor: any) => total + (setor.tarefas?.length || 0), 0) : 0;
              return (
                <div key={`${backup.salvoEm}-${indice}`} className={`flex items-center justify-between gap-2.5 py-2 ${indice < historicoBackupsUsuario.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div>
                    <strong className="block text-[11px] text-slate-700">{new Date(backup.salvoEm).toLocaleString('pt-BR')}</strong>
                    <span className="text-[10px] text-slate-500">{tarefas} tarefa(s) • atualização {backup.ultimaAtualizacao || 'não informada'}</span>
                  </div>
                  <button type="button" onClick={() => restaurarBackupDoUsuarioAtual(backup)} className={botaoAlerta}>
                    Restaurar esta visita
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
