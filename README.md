# FinApp - Controle Financeiro Mobile

Um aplicativo de controle financeiro desenvolvido com Ionic e Angular, replicando exatamente a funcionalidade do aplicativo web original.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Autenticação**: Login/Registro com usuário admin padrão
- **Dashboard**: Visão geral do saldo, receitas e despesas
- **Transações**: Adicionar receitas e despesas com categorias
- **Investimentos**: 
  - Acompanhar ações favoritas
  - Visualizar ações populares
  - Gerenciar portfólio de investimentos
- **Metas**: Criar e acompanhar metas financeiras com progresso
- **Modo Escuro**: Tema escuro/claro com persistência
- **Design Responsivo**: Otimizado para dispositivos móveis

## 🔐 Credenciais de Acesso

**Usuário Admin Padrão:**
- **Usuário**: `admin`
- **Senha**: `admin123`

## 🛠️ Tecnologias Utilizadas

- **Ionic 8** - Framework para desenvolvimento mobile
- **Angular 20** - Framework web
- **TypeScript** - Linguagem de programação
- **Ionicons** - Biblioteca de ícones
- **LocalStorage** - Persistência de dados local

## 📱 Estrutura do Projeto

```
src/
├── app/
│   ├── models/           # Modelos de dados
│   ├── services/         # Serviços (Auth, Transactions, etc.)
│   ├── guards/           # Guards de autenticação
│   ├── login/            # Página de login/registro
│   ├── dashboard/        # Dashboard principal
│   ├── transactions/     # Módulo de transações
│   ├── investments/      # Módulo de investimentos
│   └── goals/           # Módulo de metas
├── theme/               # Variáveis de tema
└── global.scss         # Estilos globais
```

## 🎨 Design

O aplicativo mantém o mesmo design visual do aplicativo web original:
- Gradientes azuis (#288CFA → #103766)
- Cards com sombras suaves
- Animações fluidas
- Modo escuro completo
- Ícones do Ionic

## 📊 Funcionalidades Detalhadas

### Dashboard
- Saldo total com cores dinâmicas (verde/vermelho)
- Cards de receitas e despesas
- Botões de ação rápida
- Lista de transações recentes com filtros

### Transações
- Adicionar receitas e despesas
- Categorias pré-definidas
- Filtros por tipo (todas/receitas/despesas)
- Exclusão de transações

### Investimentos
- **Aba Favoritos**: Ações marcadas como favoritas
- **Aba Populares**: Lista de ações populares
- **Aba Portfólio**: Gerenciamento de investimentos
- Busca de ações
- Adicionar/remover do portfólio
- Cálculo automático de lucro/prejuízo

### Metas
- Criar metas com título, descrição e valor
- Upload de imagens para as metas
- Barra de progresso visual
- Adicionar dinheiro às metas
- Exclusão de metas

## 🚀 Como Executar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Executar em desenvolvimento:**
   ```bash
   ionic serve
   ```

3. **Build para produção:**
   ```bash
   ionic build
   ```

4. **Executar em dispositivo:**
   ```bash
   ionic capacitor run android
   ionic capacitor run ios
   ```

## 📱 Compatibilidade

- **Android**: 5.0+ (API 21+)
- **iOS**: 11.0+
- **Navegadores**: Chrome, Safari, Firefox, Edge

## 🔧 Configuração

### Variáveis de Ambiente
O aplicativo não requer configuração de variáveis de ambiente, utilizando apenas localStorage para persistência.

### Capacitor
Para executar em dispositivos móveis, certifique-se de ter o Capacitor configurado:

```bash
ionic capacitor add android
ionic capacitor add ios
```

## 📝 Notas de Desenvolvimento

- Todos os dados são persistidos localmente usando localStorage
- O usuário admin é criado automaticamente na primeira execução
- O modo escuro é persistido entre sessões
- Dados de exemplo são carregados para novos usuários
- Simulação de atualizações em tempo real para investimentos

## 🎯 Próximos Passos

- [ ] Integração com API real
- [ ] Sincronização em nuvem
- [ ] Notificações push
- [ ] Relatórios e gráficos
- [ ] Exportação de dados
- [ ] Backup automático

## 📄 Licença

Este projeto é desenvolvido para fins educacionais e de demonstração.
