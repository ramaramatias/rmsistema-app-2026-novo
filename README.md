# Sistema de Gestão Pão da Vida

Sistema de gestão integrado para o Pão da Vida, centralizando operações administrativas e operacionais.

## 🚀 Tecnologias

- React 18 + TypeScript + Vite
- Vercel (deploy)
- JSONBin.io (armazenamento)
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
