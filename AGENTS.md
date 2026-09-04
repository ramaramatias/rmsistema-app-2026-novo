# Sistema de Gestão Pão da Vida - Documentação

## 📋 Visão Geral

Este é um sistema de gestão integrado desenvolvido para o Pão da Vida, que centraliza diversas operações administrativas e operacionais em uma única plataforma web.

## 🚀 Stack Tecnológica

- **Frontend**: React 18 + TypeScript + Vite
- **Deploy**: Vercel
- **Armazenamento de Dados**: JSONBin.io
- **Integrações**: Varejo Fácil (sistema de PDV)
- **Autenticação**: Senha simples (configurável)

## 🎯 Funcionalidades Principais

### 1. Gestão de Pendências/Tarefas
- Organização por setores (Loja, Restaurante, Padaria, Embalagem, Cozinha, Confeitaria, Almoxarifado, Sítio, CABEN, Ave Cristo, Manutenção)
- Status de tarefas (aberta/concluída)
- Atribuição de responsáveis
- Priorização (baixa, média, alta, urgente)
- Histórico de tarefas deletadas

### 2. Sistema de Cotação de Produtos
- Catálogo com 334 produtos organizados
- 11 fornecedores oficiais cadastrados
- Comparação de preços entre fornecedores
- Cálculo automático de menor custo
- Separação por seções (Carnes, Aves, Peixes, Frutas, Laticínios, etc.)

### 3. Gestão de Pagamentos
- Controle de pagamentos em 3 categorias: Caixa, Cheque, CABEN
- Registro de histórico de fechamentos
- Cálculo automático de totais
- Data de registro dos pagamentos

### 4. Conferência de Fornecedores
- Registro de conferências de entregas
- Identificação de divergências (valor, kg, quantidade)
- Upload de arquivos de conferência
- Registro de conferentes

### 5. Controle de Hortifrutigranjeiros
- Gestão de 72 produtos da Dona Elieuda
- Controle de quantidades por dia (terça, quinta, sábado)
- Unidades de medida específicas

### 6. Integração com Varejo Fácil
- Atualização automática de preços
- Consulta de status do PDV
- Sincronização de dados

### 7. Sistema de Usuários e Permissões
- **Admin (Ramara)**: Acesso total a todas as funcionalidades
- **Gabriela, Assunção, Luzia, Leandro, Idenaldo**: Pendências e Conferências
- **Elias (Manutenção)**: Apenas Pendências

## 🔧 Configuração

### Variáveis de Ambiente

Para configurar o sistema, crie um arquivo `config.ts` na raiz do projeto baseado no `config.example.ts`:

```typescript
export const config = {
  jsonbin: {
    apiKey: 'sua-chave-jsonbin',
    binId: 'seu-bin-id'
  },
  system: {
    password: 'sua-senha'
  },
  varejoFacil: {
    url: 'https://paodavida.varejofacil.com'
  }
};
```

⚠️ **Importante**: O arquivo `config.ts` não deve ser commitado no controle de versão.

## 📦 Comandos Disponíveis

### Desenvolvimento
```bash
npm run dev
```
Inicia o servidor de desenvolvimento com hot reload.

### Build
```bash
npm run build
```
Cria a versão de produção para deploy.

### Deploy
```bash
npm run deploy
```
Build e deploy automático para Vercel.

### Lint
```bash
npm run lint
```
Verifica problemas de código com ESLint.

## 🏗️ Estrutura do Projeto

```
meu-sistema-gestao/
├── src/
│   ├── App.tsx              # Componente principal (estado e telas)
│   ├── main.tsx             # Entry point da aplicação
│   ├── tipos.ts             # Interfaces e tipos compartilhados
│   ├── dados/               # Dados fixos do sistema
│   │   └── padroes.ts       # Catálogo, setores, usuários e permissões
│   ├── util/                # Funções auxiliares separadas por assunto
│   │   ├── armazenamento.ts # localStorage e limites de tamanho
│   │   ├── cotacao.ts       # Regras dos itens de cotação
│   │   ├── fotos.ts         # Compressão, IndexedDB e fotos na nuvem
│   │   ├── manutencao.ts    # Status das ordens de manutenção
│   │   ├── mesclar.ts       # União dos dados locais com os da nuvem
│   │   ├── nuvem.ts         # Envio e leitura do registro na nuvem
│   │   ├── pdf.ts           # Geração de PDF de pedidos e pagamentos
│   │   └── usuarios.ts      # Permissões e senhas
│   ├── componentes/         # Componentes reutilizáveis
│   ├── abas/                # Uma pasta por aba do sistema
│   ├── api/                 # Endpoints da Vercel Functions
│   │   ├── atualizarPreco.ts
│   │   └── statusPDV.ts
│   └── services/            # Serviços de integração
│       └── varejoService.ts
├── api/                     # Endpoints adicionais
│   └── catalogo.ts
├── public/                  # Arquivos estáticos
├── config.example.ts        # Exemplo de configuração
├── config.ts               # Configuração sensível (não commitar)
└── package.json
```

## 🔐 Segurança

- Credenciais movidas para arquivo de configuração separado
- `config.ts` incluído no `.gitignore`
- Senha de acesso configurável
- API keys não mais hardcoded no código

## 🚨 Próximos Passos Recomendados

### Alta Prioridade
1. **Refatoração do App.tsx**: Tipos, dados fixos e funções auxiliares já foram movidos para `src/tipos.ts`, `src/dados/` e `src/util/`. Falta dividir o próprio componente `App()`, que ainda concentra todo o estado e todas as telas
2. **Implementar Testes**: Criar testes unitários para as funcionalidades principais
3. **Melhorar Autenticação**: Implementar sistema de autenticação mais robusto

### Média Prioridade
4. **Otimização de Performance**: Melhorar o carregamento e resposta da aplicação
5. **Interface Responsiva**: Garantir bom funcionamento em dispositivos móveis
6. **Validação de Formulários**: Adicionar validações mais robustas

### Baixa Prioridade
7. **Logs e Monitoramento**: Implementar sistema de logs e monitoramento
8. **Backup Automático**: Criar sistema de backup automático dos dados
9. **Documentação de API**: Documentar os endpoints da API

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.

## 📝 Notas de Desenvolvimento

- O sistema utiliza JSONBin.io para armazenamento de dados
- A integração com Varejo Fácil é feita via API REST
- O sistema foi desenvolvido com foco em uso interno do Pão da Vida
- A interface está em português brasileiro