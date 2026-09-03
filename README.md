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

1. Copie `config.example.ts` para `config.ts`
2. Preencha com suas credenciais reais
3. Não commit o arquivo `config.ts`

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
