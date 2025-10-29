// Estado global da aplicação
let currentUser = localStorage.getItem('finapp_currentUser');
let transactions = [];
let currentFilter = 'all';
let favorites = [];
let portfolio = [];
let goals = [];
let popularStocks = [];
let currentTab = 'favorites';
let currentStockForPortfolio = null;
let currentGoalForMoney = null;
let isDarkMode = localStorage.getItem('finapp_darkMode') === 'true';

// Check if user is logged in
if (!currentUser) {
    window.location.href = 'index.html';
} else {
    // Load user-specific data
    loadUserData();
    document.getElementById('currentUser').textContent = currentUser;
}

// Categorias disponíveis
const categories = {
  salary: 'Salário',
  freelance: 'Freelance',
  investment: 'Investimento',
  food: 'Alimentação',
  transport: 'Transporte',
  housing: 'Moradia',
  entertainment: 'Entretenimento',
  health: 'Saúde',
  education: 'Educação',
  other: 'Outros'
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  loadSampleData();
});

// ===== FUNÇÕES DE GERENCIAMENTO DE USUÁRIO =====
function loadUserData() {
  const userKey = `finapp_${currentUser}`;
  transactions = JSON.parse(localStorage.getItem(`${userKey}_transactions`)) || [];
  favorites = JSON.parse(localStorage.getItem(`${userKey}_favorites`)) || [];
  portfolio = JSON.parse(localStorage.getItem(`${userKey}_portfolio`)) || [];
  goals = JSON.parse(localStorage.getItem(`${userKey}_goals`)) || [];
}

function saveUserData() {
  const userKey = `finapp_${currentUser}`;
  localStorage.setItem(`${userKey}_transactions`, JSON.stringify(transactions));
  localStorage.setItem(`${userKey}_favorites`, JSON.stringify(favorites));
  localStorage.setItem(`${userKey}_portfolio`, JSON.stringify(portfolio));
  localStorage.setItem(`${userKey}_goals`, JSON.stringify(goals));
}

function logout() {
  localStorage.removeItem('finapp_currentUser');
  window.location.href = 'index.html';
}

function initializeApp() {
  updateBalance();
  renderTransactions();
  setupEventListeners();
  setCurrentDate();
  initializeDarkMode();
}

function setupEventListeners() {
  // Form de transação
  document.getElementById('transactionForm').addEventListener('submit', handleTransactionSubmit);
  
  // Filtros
  document.querySelectorAll('.filter-option').forEach(option => {
    option.addEventListener('click', handleFilterChange);
  });
  
  // Fechar modal ao clicar fora
  document.getElementById('transactionModal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeTransactionModal();
    }
  });
  
  // Fechar modal de investimentos ao clicar fora
  document.getElementById('investmentModal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeInvestmentModal();
    }
  });
}

// Funções do Modal
function showTransactionModal(type) {
  const modal = document.getElementById('transactionModal');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('transactionForm');
  
  // Limpar formulário
  form.reset();
  
  // Definir tipo de transação
  form.dataset.type = type;
  modalTitle.textContent = type === 'income' ? 'Nova Receita' : 'Nova Despesa';
  
  // Mostrar modal
  modal.classList.add('active');
  
  // Focar no primeiro campo
  setTimeout(() => {
    document.getElementById('description').focus();
  }, 300);
}

function closeTransactionModal() {
  const modal = document.getElementById('transactionModal');
  modal.classList.remove('active');
}



// Manipulação de transações
function handleTransactionSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const type = e.target.dataset.type;
  
  const transaction = {
    id: Date.now(),
    type: type,
    description: formData.get('description') || document.getElementById('description').value,
    amount: parseFloat(formData.get('amount') || document.getElementById('amount').value),
    category: formData.get('category') || document.getElementById('category').value,
    date: formData.get('date') || document.getElementById('date').value,
    createdAt: new Date().toISOString()
  };
  
  addTransaction(transaction);
  closeTransactionModal();
}

function addTransaction(transaction) {
  transactions.unshift(transaction);
  saveTransactions();
  updateBalance();
  renderTransactions();
  
  // Feedback visual
  showNotification(`${transaction.type === 'income' ? 'Receita' : 'Despesa'} adicionada com sucesso!`);
}

function deleteTransaction(id) {
  if (confirm('Tem certeza que deseja excluir esta transação?')) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    updateBalance();
    renderTransactions();
    showNotification('Transação excluída com sucesso!');
  }
}

// Renderização
function renderTransactions() {
  const container = document.getElementById('transactionsList');
  const filteredTransactions = getFilteredTransactions();
  
  if (filteredTransactions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-receipt"></i>
        <h3>Nenhuma transação encontrada</h3>
        <p>${currentFilter === 'all' ? 'Adicione sua primeira transação clicando nos botões acima.' : 'Nenhuma transação encontrada para este filtro.'}</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filteredTransactions.map(transaction => `
    <div class="transaction-item" data-id="${transaction.id}">
      <div class="transaction-info">
        <div class="transaction-description">${transaction.description}</div>
        <div class="transaction-category">${categories[transaction.category] || transaction.category}</div>
        <div class="transaction-date">${formatDate(transaction.date)}</div>
      </div>
      <div class="transaction-amount ${transaction.type}">
        ${transaction.type === 'income' ? '+' : '-'} R$ ${transaction.amount.toFixed(2).replace('.', ',')}
      </div>
      <button class="delete-btn" onclick="deleteTransaction(${transaction.id})" title="Excluir">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');
}

function updateBalance() {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalBalance = totalIncome - totalExpense;
  
  const balanceElement = document.getElementById('totalBalance');
  balanceElement.textContent = formatCurrency(totalBalance);
  
  // Aplicar cor dinâmica baseada no saldo
  if (totalBalance >= 0) {
    balanceElement.style.color = '#2E865F'; // Verde para saldo positivo
  } else {
    balanceElement.style.color = '#FF4C4C'; // Vermelho para saldo negativo
  }
  
  document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
  document.getElementById('totalExpense').textContent = formatCurrency(totalExpense);
}

// Filtros
function handleFilterChange(e) {
  const filter = e.target.dataset.filter;
  
  // Atualizar botões ativos
  document.querySelectorAll('.filter-option').forEach(btn => {
    btn.classList.remove('active');
  });
  e.target.classList.add('active');
  
  currentFilter = filter;
  renderTransactions();
}

function getFilteredTransactions() {
  if (currentFilter === 'all') {
    return transactions;
  }
  return transactions.filter(t => t.type === currentFilter);
}

function toggleFilter() {
  const filterOptions = document.getElementById('filterOptions');
  filterOptions.style.display = filterOptions.style.display === 'none' ? 'flex' : 'none';
}

// Utilitários
function formatCurrency(value) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

function setCurrentDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
}

function saveTransactions() {
  saveUserData();
}

function showNotification(message) {
  // Criar notificação
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 1001;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Animar entrada
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remover após 3 segundos
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Dados de exemplo para demonstração
function loadSampleData() {
  // Only load sample data for new users (no existing data)
  const userKey = `finapp_${currentUser}`;
  const hasExistingData = localStorage.getItem(`${userKey}_transactions`) || 
                          localStorage.getItem(`${userKey}_favorites`) || 
                          localStorage.getItem(`${userKey}_portfolio`) || 
                          localStorage.getItem(`${userKey}_goals`);
  
  if (!hasExistingData && transactions.length === 0) {
    const sampleData = [
      {
        id: 1,
        type: 'income',
        description: 'Salário',
        amount: 3500.00,
        category: 'salary',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        type: 'expense',
        description: 'Aluguel',
        amount: 1200.00,
        category: 'housing',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        type: 'expense',
        description: 'Supermercado',
        amount: 450.00,
        category: 'food',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: 4,
        type: 'income',
        description: 'Freelance',
        amount: 800.00,
        category: 'freelance',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      }
    ];
    
    transactions = sampleData;
    saveTransactions();
    updateBalance();
    renderTransactions();
  }
}

// Adicionar estilos CSS para o botão de deletar
const style = document.createElement('style');
style.textContent = `
  .delete-btn {
    background: none;
    border: none;
    color: #dc3545;
    cursor: pointer;
    padding: 5px;
    border-radius: 5px;
    transition: background-color 0.2s ease;
  }
  
  .delete-btn:hover {
    background-color: rgba(220, 53, 69, 0.1);
  }
  
  .notification {
    font-weight: 500;
    font-size: 14px;
  }
`;
document.head.appendChild(style);

// ===== FUNÇÕES DE INVESTIMENTO =====

// Dados simulados de ações populares
const popularStocksData = [
  { symbol: 'PETR4', name: 'Petrobras PN', price: 32.45, change: 1.23, changePercent: 3.95 },
  { symbol: 'VALE3', name: 'Vale ON', price: 68.90, change: -2.10, changePercent: -2.96 },
  { symbol: 'ITUB4', name: 'Itaú PN', price: 28.75, change: 0.45, changePercent: 1.59 },
  { symbol: 'BBDC4', name: 'Bradesco PN', price: 14.20, change: -0.30, changePercent: -2.07 },
  { symbol: 'ABEV3', name: 'Ambev ON', price: 12.85, change: 0.15, changePercent: 1.18 },
  { symbol: 'WEGE3', name: 'WEG ON', price: 36.80, change: 0.80, changePercent: 2.22 },
  { symbol: 'RENT3', name: 'Localiza ON', price: 45.60, change: -1.20, changePercent: -2.56 },
  { symbol: 'LREN3', name: 'Lojas Renner ON', price: 18.90, change: 0.40, changePercent: 2.16 },
  { symbol: 'MGLU3', name: 'Magazine Luiza ON', price: 2.15, change: 0.05, changePercent: 2.38 },
  { symbol: 'CVCB3', name: 'CVC ON', price: 6.80, change: -0.20, changePercent: -2.86 }
];

// Funções do Modal de Investimentos
function showInvestmentModal() {
  const modal = document.getElementById('investmentModal');
  modal.classList.add('active');
  loadInvestmentData();
}

function closeInvestmentModal() {
  const modal = document.getElementById('investmentModal');
  modal.classList.remove('active');
}

function loadInvestmentData() {
  loadFavorites();
  loadPopularStocks();
  setupInvestmentEventListeners();
}

function setupInvestmentEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const tab = this.dataset.tab;
      switchTab(tab);
    });
  });
}

function switchTab(tab) {
  currentTab = tab;
  
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tab}Tab`).classList.add('active');
  
  // Load appropriate data
  if (tab === 'favorites') {
    loadFavorites();
  } else if (tab === 'popular') {
    loadPopularStocks();
  } else if (tab === 'portfolio') {
    loadPortfolio();
  }
}

function loadFavorites() {
  const container = document.getElementById('favoritesList');
  const emptyState = document.getElementById('emptyFavorites');
  
  if (favorites.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  container.style.display = 'block';
  emptyState.style.display = 'none';
  
  // Simular dados atualizados para favoritos
  const favoritesWithData = favorites.map(symbol => {
    const stock = popularStocksData.find(s => s.symbol === symbol) || {
      symbol: symbol,
      name: `${symbol} - Empresa`,
      price: (Math.random() * 100 + 10).toFixed(2),
      change: (Math.random() * 10 - 5).toFixed(2),
      changePercent: (Math.random() * 10 - 5).toFixed(2)
    };
    return stock;
  });
  
  container.innerHTML = favoritesWithData.map(stock => createStockItem(stock, true)).join('');
}

function loadPopularStocks() {
  const container = document.getElementById('popularList');
  
  // Simular carregamento
  container.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Carregando ações populares...</p></div>';
  
  setTimeout(() => {
    container.innerHTML = popularStocksData.map(stock => {
      const isFavorite = favorites.includes(stock.symbol);
      return createStockItem(stock, isFavorite);
    }).join('');
  }, 1000);
}

function createStockItem(stock, isFavorite) {
  const changeClass = parseFloat(stock.change) >= 0 ? 'positive' : 'negative';
  const changeSign = parseFloat(stock.change) >= 0 ? '+' : '';
  const isInPortfolio = portfolio.some(item => item.symbol === stock.symbol);
  
  return `
    <div class="stock-item">
      <div class="stock-info">
        <div class="stock-symbol">${stock.symbol}</div>
        <div class="stock-name">${stock.name}</div>
        <div class="stock-price">R$ ${parseFloat(stock.price).toFixed(2).replace('.', ',')}</div>
      </div>
      <div class="stock-change">
        <div class="change-amount ${changeClass}">
          ${changeSign}R$ ${Math.abs(parseFloat(stock.change)).toFixed(2).replace('.', ',')}
        </div>
        <div class="change-percent ${changeClass}">
          ${changeSign}${Math.abs(parseFloat(stock.changePercent)).toFixed(2).replace('.', ',')}%
        </div>
      </div>
      <div class="stock-actions">
        <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                onclick="toggleFavorite('${stock.symbol}')" 
                title="${isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
          <i class="fas fa-star"></i>
        </button>
        <button class="portfolio-btn ${isInPortfolio ? 'in-portfolio' : ''}" 
                onclick="showPortfolioModal('${stock.symbol}')" 
                title="${isInPortfolio ? 'Editar no portfólio' : 'Adicionar ao portfólio'}">
          <i class="fas fa-briefcase"></i>
        </button>
      </div>
    </div>
  `;
}

function toggleFavorite(symbol) {
  const index = favorites.indexOf(symbol);
  
  if (index > -1) {
    favorites.splice(index, 1);
    showNotification(`${symbol} removido dos favoritos`);
  } else {
    favorites.push(symbol);
    showNotification(`${symbol} adicionado aos favoritos`);
  }
  
  saveFavorites();
  
  // Re-render current tab
  if (currentTab === 'favorites') {
    loadFavorites();
  } else {
    loadPopularStocks();
  }
}

function searchStocks() {
  const searchTerm = document.getElementById('stockSearch').value.toLowerCase();
  const container = currentTab === 'favorites' ? document.getElementById('favoritesList') : document.getElementById('popularList');
  
  if (currentTab === 'favorites') {
    const filteredFavorites = favorites.filter(symbol => 
      symbol.toLowerCase().includes(searchTerm)
    );
    
    if (filteredFavorites.length === 0) {
      container.innerHTML = '<div class="empty-favorites"><i class="fas fa-search"></i><h4>Nenhum resultado encontrado</h4></div>';
    } else {
      loadFavorites(); // Re-render with current search
    }
  } else {
    const filteredStocks = popularStocksData.filter(stock => 
      stock.symbol.toLowerCase().includes(searchTerm) || 
      stock.name.toLowerCase().includes(searchTerm)
    );
    
    if (filteredStocks.length === 0) {
      container.innerHTML = '<div class="empty-favorites"><i class="fas fa-search"></i><h4>Nenhum resultado encontrado</h4></div>';
    } else {
      container.innerHTML = filteredStocks.map(stock => {
        const isFavorite = favorites.includes(stock.symbol);
        return createStockItem(stock, isFavorite);
      }).join('');
    }
  }
}

function saveFavorites() {
  saveUserData();
}

// Simular atualizações em tempo real (a cada 30 segundos)
setInterval(() => {
  if (document.getElementById('investmentModal').classList.contains('active')) {
    // Atualizar dados simulados
    popularStocksData.forEach(stock => {
      const change = (Math.random() - 0.5) * 2; // Mudança aleatória entre -1 e 1
      stock.price = Math.max(0.01, parseFloat(stock.price) + change);
      stock.change = (Math.random() - 0.5) * 4; // Mudança aleatória entre -2 e 2
      stock.changePercent = (stock.change / (stock.price - stock.change)) * 100;
    });
    
    // Re-render current tab
    if (currentTab === 'favorites') {
      loadFavorites();
    } else if (currentTab === 'popular') {
      loadPopularStocks();
    } else if (currentTab === 'portfolio') {
      loadPortfolio();
    }
  }
}, 30000);

// ===== FUNÇÕES DO PORTFÓLIO =====

function showPortfolioModal(symbol) {
  currentStockForPortfolio = symbol;
  const modal = document.getElementById('portfolioModal');
  const modalTitle = document.getElementById('portfolioModalTitle');
  const form = document.getElementById('portfolioForm');
  
  // Verificar se já existe no portfólio
  const existingItem = portfolio.find(item => item.symbol === symbol);
  
  if (existingItem) {
    modalTitle.textContent = `Editar ${symbol} no Portfólio`;
    document.getElementById('portfolioQuantity').value = existingItem.quantity;
    document.getElementById('portfolioPrice').value = existingItem.averagePrice;
  } else {
    modalTitle.textContent = `Adicionar ${symbol} ao Portfólio`;
    form.reset();
    document.getElementById('portfolioQuantity').value = 1;
  }
  
  modal.classList.add('active');
}

function closePortfolioModal() {
  const modal = document.getElementById('portfolioModal');
  modal.classList.remove('active');
  currentStockForPortfolio = null;
}

function increaseQuantity() {
  const input = document.getElementById('portfolioQuantity');
  input.value = parseInt(input.value) + 1;
}

function decreaseQuantity() {
  const input = document.getElementById('portfolioQuantity');
  const currentValue = parseInt(input.value);
  if (currentValue > 1) {
    input.value = currentValue - 1;
  }
}

// Adicionar event listener para o formulário do portfólio
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('portfolioForm').addEventListener('submit', handlePortfolioSubmit);
  
  // Fechar modal do portfólio ao clicar fora
  document.getElementById('portfolioModal').addEventListener('click', function(e) {
    if (e.target === this) {
      closePortfolioModal();
    }
  });
});

function handlePortfolioSubmit(e) {
  e.preventDefault();
  
  const quantity = parseInt(document.getElementById('portfolioQuantity').value);
  const averagePrice = parseFloat(document.getElementById('portfolioPrice').value);
  
  if (!currentStockForPortfolio) return;
  
  const stock = popularStocksData.find(s => s.symbol === currentStockForPortfolio) || {
    symbol: currentStockForPortfolio,
    name: `${currentStockForPortfolio} - Empresa`,
    price: averagePrice
  };
  
  const portfolioItem = {
    symbol: currentStockForPortfolio,
    name: stock.name,
    quantity: quantity,
    averagePrice: averagePrice,
    currentPrice: stock.price,
    totalInvested: quantity * averagePrice,
    currentValue: quantity * stock.price,
    profit: (quantity * stock.price) - (quantity * averagePrice),
    profitPercent: ((stock.price - averagePrice) / averagePrice) * 100
  };
  
  // Verificar se já existe no portfólio
  const existingIndex = portfolio.findIndex(item => item.symbol === currentStockForPortfolio);
  
  if (existingIndex > -1) {
    portfolio[existingIndex] = portfolioItem;
    showNotification(`${currentStockForPortfolio} atualizado no portfólio`);
  } else {
    portfolio.push(portfolioItem);
    showNotification(`${currentStockForPortfolio} adicionado ao portfólio`);
  }
  
  savePortfolio();
  closePortfolioModal();
  
  // Re-render current tab
  if (currentTab === 'portfolio') {
    loadPortfolio();
  } else {
    loadFavorites();
    loadPopularStocks();
  }
}

function loadPortfolio() {
  const container = document.getElementById('portfolioList');
  const emptyState = document.getElementById('emptyPortfolio');
  
  if (portfolio.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
    updatePortfolioSummary(0, 0, 0);
    return;
  }
  
  container.style.display = 'block';
  emptyState.style.display = 'none';
  
  // Atualizar dados do portfólio com preços atuais
  portfolio.forEach(item => {
    const stock = popularStocksData.find(s => s.symbol === item.symbol);
    if (stock) {
      item.currentPrice = stock.price;
      item.currentValue = item.quantity * stock.price;
      item.profit = item.currentValue - item.totalInvested;
      item.profitPercent = ((stock.price - item.averagePrice) / item.averagePrice) * 100;
    }
  });
  
  container.innerHTML = portfolio.map(item => createPortfolioItem(item)).join('');
  
  // Calcular totais
  const totalInvested = portfolio.reduce((sum, item) => sum + item.totalInvested, 0);
  const currentValue = portfolio.reduce((sum, item) => sum + item.currentValue, 0);
  const totalProfit = currentValue - totalInvested;
  
  updatePortfolioSummary(totalInvested, currentValue, totalProfit);
}

function createPortfolioItem(item) {
  const profitClass = item.profit >= 0 ? 'positive' : 'negative';
  const profitSign = item.profit >= 0 ? '+' : '';
  
  return `
    <div class="portfolio-item">
      <div class="portfolio-item-header">
        <div class="portfolio-stock-info">
          <div class="portfolio-stock-symbol">${item.symbol}</div>
          <div class="portfolio-stock-name">${item.name}</div>
        </div>
        <div class="portfolio-quantity">${item.quantity} ações</div>
      </div>
      <div class="portfolio-details">
        <div class="portfolio-detail">
          <div class="portfolio-detail-label">Preço Médio</div>
          <div class="portfolio-detail-value">R$ ${item.averagePrice.toFixed(2).replace('.', ',')}</div>
        </div>
        <div class="portfolio-detail">
          <div class="portfolio-detail-label">Preço Atual</div>
          <div class="portfolio-detail-value">R$ ${item.currentPrice.toFixed(2).replace('.', ',')}</div>
        </div>
        <div class="portfolio-detail">
          <div class="portfolio-detail-label">Total Investido</div>
          <div class="portfolio-detail-value">R$ ${item.totalInvested.toFixed(2).replace('.', ',')}</div>
        </div>
        <div class="portfolio-detail">
          <div class="portfolio-detail-label">Valor Atual</div>
          <div class="portfolio-detail-value">R$ ${item.currentValue.toFixed(2).replace('.', ',')}</div>
        </div>
        <div class="portfolio-detail">
          <div class="portfolio-detail-label">Lucro/Prejuízo</div>
          <div class="portfolio-detail-value ${profitClass}">
            ${profitSign}R$ ${Math.abs(item.profit).toFixed(2).replace('.', ',')}
          </div>
        </div>
        <div class="portfolio-detail">
          <div class="portfolio-detail-label">Rentabilidade</div>
          <div class="portfolio-detail-value ${profitClass}">
            ${profitSign}${Math.abs(item.profitPercent).toFixed(2).replace('.', ',')}%
          </div>
        </div>
      </div>
      <div class="portfolio-actions">
        <button class="portfolio-action-btn edit-btn" onclick="showPortfolioModal('${item.symbol}')">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="portfolio-action-btn remove-btn" onclick="removeFromPortfolio('${item.symbol}')">
          <i class="fas fa-trash"></i> Remover
        </button>
      </div>
    </div>
  `;
}

function removeFromPortfolio(symbol) {
  if (confirm(`Tem certeza que deseja remover ${symbol} do seu portfólio?`)) {
    portfolio = portfolio.filter(item => item.symbol !== symbol);
    savePortfolio();
    loadPortfolio();
    showNotification(`${symbol} removido do portfólio`);
    
    // Re-render other tabs
    if (currentTab !== 'portfolio') {
      loadFavorites();
      loadPopularStocks();
    }
  }
}

function updatePortfolioSummary(totalInvested, currentValue, totalProfit) {
  document.getElementById('totalInvested').textContent = formatCurrency(totalInvested);
  document.getElementById('currentValue').textContent = formatCurrency(currentValue);
  
  const profitElement = document.getElementById('totalProfit');
  profitElement.textContent = formatCurrency(totalProfit);
  profitElement.className = 'portfolio-card-value ' + (totalProfit >= 0 ? 'positive' : 'negative');
}

function savePortfolio() {
  saveUserData();
}

// ===== FUNÇÕES DE METAS =====

function showGoalsModal() {
  const modal = document.getElementById('goalsModal');
  modal.classList.add('active');
  loadGoals();
}

function closeGoalsModal() {
  const modal = document.getElementById('goalsModal');
  modal.classList.remove('active');
}

function showAddGoalModal() {
  const modal = document.getElementById('addGoalModal');
  modal.classList.add('active');
  resetGoalForm();
}

function closeAddGoalModal() {
  const modal = document.getElementById('addGoalModal');
  modal.classList.remove('active');
  resetGoalForm();
}

function showAddMoneyModal(goalId) {
  currentGoalForMoney = goalId;
  const modal = document.getElementById('addMoneyModal');
  const goal = goals.find(g => g.id === goalId);
  if (goal) {
    document.getElementById('addMoneyModalTitle').textContent = `Adicionar dinheiro para: ${goal.title}`;
  }
  modal.classList.add('active');
}

function closeAddMoneyModal() {
  const modal = document.getElementById('addMoneyModal');
  modal.classList.remove('active');
  currentGoalForMoney = null;
}

function resetGoalForm() {
  document.getElementById('goalForm').reset();
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('previewImg').src = '';
}

function previewGoalImage(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('previewImg').src = e.target.result;
      document.getElementById('imagePreview').style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

function removeGoalImage() {
  document.getElementById('goalImage').value = '';
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('previewImg').src = '';
}

// Adicionar event listeners para os formulários de metas
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('goalForm').addEventListener('submit', handleGoalSubmit);
  document.getElementById('addMoneyForm').addEventListener('submit', handleAddMoneySubmit);
  
  // Fechar modais ao clicar fora
  document.getElementById('goalsModal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeGoalsModal();
    }
  });
  
  document.getElementById('addGoalModal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeAddGoalModal();
    }
  });
  
  document.getElementById('addMoneyModal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeAddMoneyModal();
    }
  });
});

function handleGoalSubmit(e) {
  e.preventDefault();
  
  const title = document.getElementById('goalTitle').value;
  const description = document.getElementById('goalDescription').value;
  const target = parseFloat(document.getElementById('goalTarget').value);
  const imageFile = document.getElementById('goalImage').files[0];
  
  const goal = {
    id: Date.now(),
    title: title,
    description: description,
    target: target,
    current: 0,
    image: null,
    createdAt: new Date().toISOString()
  };
  
  // Processar imagem se fornecida
  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function(e) {
      goal.image = e.target.result;
      saveGoal(goal);
    };
    reader.readAsDataURL(imageFile);
  } else {
    saveGoal(goal);
  }
}

function saveGoal(goal) {
  goals.push(goal);
  saveGoals();
  closeAddGoalModal();
  loadGoals();
  showNotification(`Meta "${goal.title}" criada com sucesso!`);
}

function handleAddMoneySubmit(e) {
  e.preventDefault();
  
  const amount = parseFloat(document.getElementById('moneyAmount').value);
  
  if (!currentGoalForMoney) return;
  
  const goal = goals.find(g => g.id === currentGoalForMoney);
  if (goal) {
    goal.current += amount;
    saveGoals();
    closeAddMoneyModal();
    loadGoals();
    showNotification(`R$ ${amount.toFixed(2).replace('.', ',')} adicionado à meta "${goal.title}"`);
  }
}

function loadGoals() {
  const container = document.getElementById('goalsList');
  const emptyState = document.getElementById('emptyGoals');
  
  if (goals.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  container.style.display = 'block';
  emptyState.style.display = 'none';
  
  container.innerHTML = goals.map(goal => createGoalItem(goal)).join('');
}

function createGoalItem(goal) {
  const percentage = Math.min((goal.current / goal.target) * 100, 100);
  const isCompleted = goal.current >= goal.target;
  
  return `
    <div class="goal-item ${isCompleted ? 'completed' : ''}">
      <div class="goal-header">
        <div class="goal-image">
          ${goal.image ? `<img src="${goal.image}" alt="${goal.title}">` : '<i class="fas fa-bullseye"></i>'}
        </div>
        <div class="goal-info">
          <div class="goal-title">${goal.title}</div>
          ${goal.description ? `<div class="goal-description">${goal.description}</div>` : ''}
        </div>
      </div>
      <div class="goal-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
        <div class="goal-amounts">
          <span class="goal-current">R$ ${goal.current.toFixed(2).replace('.', ',')}</span>
          <span class="goal-percentage">${percentage.toFixed(1)}%</span>
          <span class="goal-target">R$ ${goal.target.toFixed(2).replace('.', ',')}</span>
        </div>
      </div>
      <div class="goal-actions">
        <button class="goal-action-btn add-money-btn" onclick="showAddMoneyModal(${goal.id})">
          <i class="fas fa-plus"></i> Adicionar
        </button>
        <button class="goal-action-btn edit-goal-btn" onclick="editGoal(${goal.id})">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="goal-action-btn delete-goal-btn" onclick="deleteGoal(${goal.id})">
          <i class="fas fa-trash"></i> Excluir
        </button>
      </div>
    </div>
  `;
}

function editGoal(goalId) {
  const goal = goals.find(g => g.id === goalId);
  if (!goal) return;
  
  // Preencher formulário com dados da meta
  document.getElementById('goalTitle').value = goal.title;
  document.getElementById('goalDescription').value = goal.description || '';
  document.getElementById('goalTarget').value = goal.target;
  
  if (goal.image) {
    document.getElementById('previewImg').src = goal.image;
    document.getElementById('imagePreview').style.display = 'block';
  }
  
  // Remover meta antiga e criar nova
  goals = goals.filter(g => g.id !== goalId);
  
  // Mostrar modal de edição
  document.getElementById('addGoalModalTitle').textContent = 'Editar Meta';
  showAddGoalModal();
}

function deleteGoal(goalId) {
  const goal = goals.find(g => g.id === goalId);
  if (!goal) return;
  
  if (confirm(`Tem certeza que deseja excluir a meta "${goal.title}"?`)) {
    goals = goals.filter(g => g.id !== goalId);
    saveGoals();
    loadGoals();
    showNotification(`Meta "${goal.title}" excluída com sucesso!`);
  }
}

function saveGoals() {
  saveUserData();
}

// ===== FUNÇÕES DE DARK MODE =====

function initializeDarkMode() {
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    updateDarkModeButton(true);
  } else {
    document.body.classList.remove('dark-mode');
    updateDarkModeButton(false);
  }
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    updateDarkModeButton(true);
    localStorage.setItem('finapp_darkMode', 'true');
    showNotification('Modo escuro ativado');
  } else {
    document.body.classList.remove('dark-mode');
    updateDarkModeButton(false);
    localStorage.setItem('finapp_darkMode', 'false');
    showNotification('Modo claro ativado');
  }
}

function updateDarkModeButton(isDark) {
  const darkModeBtn = document.querySelector('.dark-mode-btn');
  if (darkModeBtn) {
    if (isDark) {
      darkModeBtn.classList.add('active');
      darkModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
      darkModeBtn.title = 'Alternar para modo claro';
    } else {
      darkModeBtn.classList.remove('active');
      darkModeBtn.innerHTML = '<i class="fas fa-moon"></i>';
      darkModeBtn.title = 'Alternar para modo escuro';
    }
  }
}

 