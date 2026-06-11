const STORAGE_KEY = 'expense-budget-visualizer-transactions';
const CATEGORIES_KEY = 'expense-budget-visualizer-categories';
const SORT_KEY = 'expense-budget-visualizer-sort';
const LIMIT_KEY = 'expense-budget-visualizer-limit';
const THEME_KEY = 'expense-budget-visualizer-theme';
const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];

const form = document.getElementById('transactionForm');
const categoryForm = document.getElementById('categoryForm');
const itemNameInput = document.getElementById('itemName');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const transactionDateInput = document.getElementById('transactionDate');
const customCategoryInput = document.getElementById('customCategory');
const sortOptionInput = document.getElementById('sortOption');
const spendingLimitInput = document.getElementById('spendingLimit');
const themeToggleButton = document.getElementById('themeToggle');
const formMessage = document.getElementById('formMessage');
const categoryMessage = document.getElementById('categoryMessage');
const totalBalanceElement = document.getElementById('totalBalance');
const transactionCountElement = document.getElementById('transactionCount');
const transactionListElement = document.getElementById('transactionList');
const emptyStateElement = document.getElementById('emptyState');
const categoryListElement = document.getElementById('categoryList');
const monthlySummaryElement = document.getElementById('monthlySummary');
const activeLimitTextElement = document.getElementById('activeLimitText');
const rootElement = document.documentElement;

let transactions = loadTransactions();
let categories = loadCategories();
let currentSort = loadSortOption();
let spendingLimit = loadSpendingLimit();
let currentTheme = loadTheme();
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

function loadCategories() {
  try {
    const storedCategories = localStorage.getItem(CATEGORIES_KEY);
    const parsed = storedCategories ? JSON.parse(storedCategories) : DEFAULT_CATEGORIES;
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...parsed]));
  } catch (error) {
    console.error('Failed to load categories:', error);
    return [...DEFAULT_CATEGORIES];
  }
}

function saveCategories() {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

function loadSortOption() {
  return localStorage.getItem(SORT_KEY) || 'latest';
}

function saveSortOption() {
  localStorage.setItem(SORT_KEY, currentSort);
}

function loadSpendingLimit() {
  const storedLimit = localStorage.getItem(LIMIT_KEY);
  return storedLimit ? Number(storedLimit) : 0;
}

function saveSpendingLimit() {
  localStorage.setItem(LIMIT_KEY, String(spendingLimit));
}

function loadTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

function saveTheme() {
  localStorage.setItem(THEME_KEY, currentTheme);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMonth(dateValue) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateValue));
}

function setMessage(element, message, type = '') {
  element.textContent = message;
  element.className = 'form-message';

  if (type) {
    element.classList.add(`is-${type}`);
  }
}

function updateThemeUI() {
  rootElement.setAttribute('data-theme', currentTheme);
  const icon = themeToggleButton.querySelector('.material-symbols-outlined');

  if (icon) {
    icon.textContent = currentTheme === 'dark' ? 'light_mode' : 'dark_mode';
  }

  themeToggleButton.setAttribute(
    'aria-label',
    currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  );
}

function getCategoryTotals() {
  return categories.map((category) =>
    transactions
      .filter((transaction) => transaction.category === category)
      .reduce((total, transaction) => total + transaction.amount, 0)
  );
}

function getSortedTransactions() {
  const sorted = [...transactions];

  switch (currentSort) {
    case 'oldest':
      sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'amount-desc':
      sorted.sort((a, b) => b.amount - a.amount);
      break;
    case 'amount-asc':
      sorted.sort((a, b) => a.amount - b.amount);
      break;
    case 'category-asc':
      sorted.sort((a, b) => a.category.localeCompare(b.category) || b.createdAt - a.createdAt);
      break;
    case 'latest':
    default:
      sorted.sort((a, b) => b.createdAt - a.createdAt);
      break;
  }

  return sorted;
}

function renderChart() {
  const chartData = getCategoryTotals();
  const hasTransactions = chartData.some((value) => value > 0);
  const data = hasTransactions ? chartData : categories.map(() => 1);
  const palette = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'];
  const backgroundColor = hasTransactions
    ? categories.map((_, index) => palette[index % palette.length])
    : categories.map(() => '#cbd5e1');

  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(document.getElementById('expenseChart'), {
    type: 'pie',
    data: {
      labels: categories,
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
            color: getComputedStyle(document.body).color,
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

function renderCategoryOptions() {
  categoryInput.innerHTML = '<option value="">Select category</option>';

  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryInput.appendChild(option);
  });
}

function renderCategoryTags() {
  categoryListElement.innerHTML = '';

  categories.forEach((category) => {
    const tag = document.createElement('div');
    tag.className = 'category-tag';

    const text = document.createElement('span');
    text.textContent = category;

    tag.appendChild(text);

    if (!DEFAULT_CATEGORIES.includes(category)) {
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'category-remove';
      removeButton.textContent = '×';
      removeButton.setAttribute('aria-label', `Remove ${category}`);
      removeButton.addEventListener('click', () => removeCategory(category));
      tag.appendChild(removeButton);
    }

    categoryListElement.appendChild(tag);
  });
}

function renderMonthlySummary() {
  monthlySummaryElement.innerHTML = '';

  if (transactions.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'monthly-summary-empty';
    empty.textContent = 'No monthly data yet.';
    monthlySummaryElement.appendChild(empty);
    return;
  }

  const groupedByMonth = transactions.reduce((summary, transaction) => {
    const monthKey = transaction.date.slice(0, 7);
    summary[monthKey] = (summary[monthKey] || 0) + transaction.amount;
    return summary;
  }, {});

  Object.entries(groupedByMonth)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .forEach(([monthKey, total]) => {
      const item = document.createElement('div');
      item.className = 'monthly-summary-item';

      const label = document.createElement('strong');
      label.textContent = formatMonth(`${monthKey}-01`);

      const amount = document.createElement('span');
      amount.textContent = formatCurrency(total);

      item.append(label, amount);
      monthlySummaryElement.appendChild(item);
    });
}

function createTransactionElement(transaction) {
  const item = document.createElement('article');
  item.className = 'transaction-item';

  if (spendingLimit > 0 && transaction.amount > spendingLimit) {
    item.classList.add('is-over-limit');
  }

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

  titleRow.append(title, categoryBadge);

  if (spendingLimit > 0 && transaction.amount > spendingLimit) {
    const limitBadge = document.createElement('span');
    limitBadge.className = 'limit-badge';
    limitBadge.textContent = 'Over limit';
    titleRow.appendChild(limitBadge);
  }

  const meta = document.createElement('p');
  meta.className = 'transaction-meta';
  meta.textContent = `${formatMonth(transaction.date)} • ${transaction.date}`;

  const amount = document.createElement('div');
  amount.className = 'transaction-amount';
  amount.textContent = formatCurrency(transaction.amount);

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'delete-button';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => deleteTransaction(transaction.id));

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

  getSortedTransactions().forEach((transaction) => {
    transactionListElement.appendChild(createTransactionElement(transaction));
  });
}

function renderControls() {
  sortOptionInput.value = currentSort;
  spendingLimitInput.value = spendingLimit || '';
  activeLimitTextElement.textContent = spendingLimit > 0 ? `Limit: ${formatCurrency(spendingLimit)}` : 'Limit: Not set';
}

function renderApp() {
  renderSummary();
  renderCategoryOptions();
  renderCategoryTags();
  renderMonthlySummary();
  renderControls();
  renderTransactions();
  renderChart();
  updateThemeUI();
}

function deleteTransaction(transactionId) {
  transactions = transactions.filter((transaction) => transaction.id !== transactionId);
  saveTransactions();
  renderApp();
  setMessage(formMessage, 'Transaction deleted.', 'success');
}

function removeCategory(categoryToRemove) {
  const categoryStillUsed = transactions.some((transaction) => transaction.category === categoryToRemove);

  if (categoryStillUsed) {
    setMessage(categoryMessage, 'Delete transactions using this category first.', 'error');
    return;
  }

  categories = categories.filter((category) => category !== categoryToRemove);
  saveCategories();
  renderApp();
  setMessage(categoryMessage, 'Category removed.', 'success');
}

function validateTransaction(itemName, amount, category, date) {
  if (!itemName || !amount || !category || !date) {
    return 'All transaction fields are required.';
  }

  if (Number.isNaN(amount) || amount <= 0) {
    return 'Amount must be a valid number greater than 0.';
  }

  if (!categories.includes(category)) {
    return 'Please choose a valid category.';
  }

  return '';
}

function validateCustomCategory(categoryName) {
  if (!categoryName) {
    return 'Category name cannot be empty.';
  }

  if (categories.some((category) => category.toLowerCase() === categoryName.toLowerCase())) {
    return 'Category already exists.';
  }

  return '';
}

function handleSubmit(event) {
  event.preventDefault();

  const itemName = itemNameInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const date = transactionDateInput.value;
  const validationError = validateTransaction(itemName, amount, category, date);

  if (validationError) {
    setMessage(formMessage, validationError, 'error');
    return;
  }

  const createdAt = Date.now();
  const newTransaction = {
    id: `trx-${createdAt}`,
    itemName,
    amount,
    category,
    date,
    createdAt,
  };

  transactions.push(newTransaction);
  saveTransactions();
  renderApp();
  form.reset();
  setDefaultDate();
  setMessage(formMessage, 'Transaction added successfully.', 'success');
  itemNameInput.focus();
}

function handleCategorySubmit(event) {
  event.preventDefault();

  const categoryName = customCategoryInput.value.trim();
  const validationError = validateCustomCategory(categoryName);

  if (validationError) {
    setMessage(categoryMessage, validationError, 'error');
    return;
  }

  categories.push(categoryName);
  saveCategories();
  renderApp();
  categoryForm.reset();
  setMessage(categoryMessage, 'Custom category added.', 'success');
  customCategoryInput.focus();
}

function handleSortChange(event) {
  currentSort = event.target.value;
  saveSortOption();
  renderTransactions();
}

function handleSpendingLimitChange(event) {
  spendingLimit = Number(event.target.value) || 0;
  saveSpendingLimit();
  renderTransactions();
}

function handleThemeToggle() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  saveTheme();
  updateThemeUI();
  renderChart();
}

function setDefaultDate() {
  transactionDateInput.value = new Date().toISOString().split('T')[0];
}

form.addEventListener('submit', handleSubmit);
categoryForm.addEventListener('submit', handleCategorySubmit);
sortOptionInput.addEventListener('change', handleSortChange);
spendingLimitInput.addEventListener('input', handleSpendingLimitChange);
themeToggleButton.addEventListener('click', handleThemeToggle);

setDefaultDate();
renderApp();