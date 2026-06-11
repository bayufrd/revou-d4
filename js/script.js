const STORAGE_KEY = 'expense-budget-visualizer-transactions';
const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];

const form = document.getElementById('transactionForm');
const itemNameInput = document.getElementById('itemName');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const formMessage = document.getElementById('formMessage');
const totalBalanceElement = document.getElementById('totalBalance');
const transactionCountElement = document.getElementById('transactionCount');
const transactionListElement = document.getElementById('transactionList');
const emptyStateElement = document.getElementById('emptyState');

let transactions = loadTransactions();
let expenseChart;

function loadTransactions() {
  try {
    const storedTransactions = localStorage.getItem(STORAGE_KEY);
    return storedTransactions ? JSON.parse(storedTransactions) : [];
  } catch (error) {
    console.error('Failed to load transactions:', error);
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function setFormMessage(message, type = '') {
  formMessage.textContent = message;
  formMessage.className = 'form-message';

  if (type) {
    formMessage.classList.add(`is-${type}`);
  }
}

function getCategoryTotals() {
  return DEFAULT_CATEGORIES.map((category) =>
    transactions
      .filter((transaction) => transaction.category === category)
      .reduce((total, transaction) => total + transaction.amount, 0)
  );
}

function renderChart() {
  const chartData = getCategoryTotals();
  const hasTransactions = chartData.some((value) => value > 0);
  const data = hasTransactions ? chartData : [1, 1, 1];
  const backgroundColor = hasTransactions
    ? ['#2563eb', '#10b981', '#f59e0b']
    : ['#cbd5e1', '#dbe4f0', '#e2e8f0'];

  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(document.getElementById('expenseChart'), {
    type: 'pie',
    data: {
      labels: DEFAULT_CATEGORIES,
      datasets: [
        {
          data,
          backgroundColor,
          borderColor: '#ffffff',
          borderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 16,
          },
        },
        tooltip: {
          callbacks: {
            label(context) {
              if (!hasTransactions) {
                return `${context.label}: ${formatCurrency(0)}`;
              }

              return `${context.label}: ${formatCurrency(context.parsed)}`;
            },
          },
        },
      },
    },
  });
}

function renderSummary() {
  const totalSpending = transactions.reduce((total, transaction) => total + transaction.amount, 0);
  totalBalanceElement.textContent = formatCurrency(totalSpending);
  transactionCountElement.textContent = `${transactions.length} item${transactions.length === 1 ? '' : 's'}`;
}

function createTransactionElement(transaction) {
  const item = document.createElement('article');
  item.className = 'transaction-item';

  const info = document.createElement('div');
  info.className = 'transaction-info';

  const titleRow = document.createElement('div');
  titleRow.className = 'transaction-title-row';

  const title = document.createElement('h3');
  title.className = 'transaction-title';
  title.textContent = transaction.itemName;

  const categoryBadge = document.createElement('span');
  categoryBadge.className = 'category-badge';
  categoryBadge.textContent = transaction.category;

  const meta = document.createElement('p');
  meta.className = 'transaction-meta';
  meta.textContent = `Amount: ${formatCurrency(transaction.amount)}`;

  const amount = document.createElement('div');
  amount.className = 'transaction-amount';
  amount.textContent = formatCurrency(transaction.amount);

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'delete-button';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => deleteTransaction(transaction.id));

  titleRow.append(title, categoryBadge);
  info.append(titleRow, meta, amount);
  item.append(info, deleteButton);

  return item;
}

function renderTransactions() {
  transactionListElement.innerHTML = '';

  if (transactions.length === 0) {
    emptyStateElement.classList.remove('hidden');
    transactionListElement.classList.add('hidden');
    return;
  }

  emptyStateElement.classList.add('hidden');
  transactionListElement.classList.remove('hidden');

  transactions
    .slice()
    .reverse()
    .forEach((transaction) => {
      transactionListElement.appendChild(createTransactionElement(transaction));
    });
}

function renderApp() {
  renderSummary();
  renderTransactions();
  renderChart();
}

function deleteTransaction(transactionId) {
  transactions = transactions.filter((transaction) => transaction.id !== transactionId);
  saveTransactions();
  renderApp();
  setFormMessage('Transaction deleted.', 'success');
}

function validateForm(itemName, amount, category) {
  if (!itemName || !amount || !category) {
    return 'All fields are required.';
  }

  if (Number.isNaN(amount) || amount <= 0) {
    return 'Amount must be a valid number greater than 0.';
  }

  if (!DEFAULT_CATEGORIES.includes(category)) {
    return 'Please choose a valid category.';
  }

  return '';
}

function handleSubmit(event) {
  event.preventDefault();

  const itemName = itemNameInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const validationError = validateForm(itemName, amount, category);

  if (validationError) {
    setFormMessage(validationError, 'error');
    return;
  }

  const newTransaction = {
    id: `trx-${Date.now()}`,
    itemName,
    amount,
    category,
  };

  transactions.push(newTransaction);
  saveTransactions();
  renderApp();
  form.reset();
  setFormMessage('Transaction added successfully.', 'success');
  itemNameInput.focus();
}

form.addEventListener('submit', handleSubmit);

renderApp();