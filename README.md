# Sistema de Gestão Pão da Vida

Sistema de gestão integrado para o Pão da Vida, centralizando operações administrativas e operacionais.

## 🚀 Tecnologias

- React 18 + TypeScript + Vite
- Vercel (deploy)
- Firebase Realtime Database (armazenamento)
- Integração com Varejo Fácil

## 📋 Funcionalidades

- Gestão de pendências por setores
- Sistema de cotação de produtos (334 itens, 11 fornecedores)
- Controle de pagamentos (caixa, cheque, CABEN)
- Conferência de fornecedores
- Controle de hortifrutigranjeiros (72 produtos)
- Integração com sistema PDV
- Sistema de usuários com permissões

## 🔧 Configuração

1. Para definir a senha inicial da aplicação, configure `VITE_SYSTEM_PASSWORD` no `.env.local` e nas variáveis de ambiente da Vercel. Se não estiver definida, a senha inicial padrão é `1234`.
2. Não coloque credenciais privadas em módulos importados pelo frontend: variáveis `VITE_*` são incorporadas ao JavaScript enviado ao navegador e não devem conter segredos.
3. No Firebase Console, abra **Configurações do projeto → Contas de serviço → Gerar nova chave privada**. Guarde o arquivo baixado em local seguro; nunca o coloque no frontend nem o envie por chat.
4. No `.env.local` e nas variáveis de ambiente da Vercel, configure `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` e `FIREBASE_DATABASE_URL`. Use `project_id`, `client_email` e `private_key` do arquivo de conta de serviço, e a URL do Realtime Database do projeto. Em `FIREBASE_PRIVATE_KEY`, mantenha as quebras de linha como `\n`.
5. Use Node.js 22 ou superior (local e na configuração do projeto Vercel). Mantenha as regras do Realtime Database fechadas para acesso direto (`.read` e `.write` falsos); a API usa o SDK Admin no servidor e ignora essas regras. Reinicie o Vite após alterar `.env.local`; após configurar a Vercel, faça um novo deploy.

**Atenção:** os endpoints `/api/nuvem` e `/api/foto` ainda não validam uma sessão de usuário. Embora a chave privada fique no servidor, esses endpoints permanecem publicamente acessíveis e permitem ler/gravar dados. Migre para autenticação de API antes de usar dados sensíveis ou expor o sistema publicamente.

## 📦 Comandos

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run deploy   # Deploy para Vercel
npm run lint     # Verificar código
```

## 📖 Documentação

Para documentação detalhada, veja [AGENTS.md](./AGENTS.md)

## 🔐 Segurança

- Credenciais em arquivo de configuração separado
- `config.ts` no `.gitignore`
- Senha configurável
