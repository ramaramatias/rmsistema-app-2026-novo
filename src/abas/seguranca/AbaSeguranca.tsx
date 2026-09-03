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
                  const tarefas = Array.isArray(backup.setores) ? backup.setores.reduce((total: number, setor: any) => total + (setor.tarefas?.length || 0), 0) : 0;
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
  );
}
