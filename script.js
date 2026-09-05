// ===== DATA STORE =====
const DATA = {
    branches: [
        { id: 1, name: 'Kopi Nusantara - Menteng', location: 'Jakarta Pusat' },
        { id: 2, name: 'Kopi Nusantara - Senayan', location: 'Jakarta Selatan' },
        { id: 3, name: 'Kopi Nusantara - Kelapa Gading', location: 'Jakarta Utara' },
        { id: 4, name: 'Kopi Nusantara - Bandung', location: 'Bandung' }
    ],
    menu: [
        { id: 1, name: 'Espresso' },
        { id: 2, name: 'Cappuccino' },
        { id: 3, name: 'Latte' },
        { id: 4, name: 'Americano' },
        { id: 5, name: 'Mocha' },
        { id: 6, name: 'Matcha Latte' },
        { id: 7, name: 'Croissant' },
        { id: 8, name: 'Cheesecake' }
    ],
    ingredients: [
        { id: 1, name: 'Kopi Arabica', unit: 'kg' },
        { id: 2, name: 'Susu UHT', unit: 'liter' },
        { id: 3, name: 'Gula', unit: 'kg' },
        { id: 4, name: 'Tepung', unit: 'kg' },
        { id: 5, name: 'Cokelat Bubuk', unit: 'kg' },
        { id: 6, name: 'Matcha', unit: 'kg' }
    ],
    transactions: [],
    stocks: [],
    stockAdditions: [],
    _nextTxId: 1,
    _nextStockId: 1,
    _nextAddId: 1
};

// ===== USER CREDENTIALS =====
const USERS = [
    { 
        username: 'admin', 
        password: 'admin123', 
        name: 'Administrator', 
        role: 'Pemilik' 
    },
    { 
        username: 'manager', 
        password: 'manager123', 
        name: 'Manager Utama', 
        role: 'Manager' 
    },
    { 
        username: 'staff', 
        password: 'staff123', 
        name: 'Staff Operasional', 
        role: 'Staff' 
    }
];

// ===== INITIALIZE DATA =====
function initData() {
    const now = new Date();
    
    // Generate transactions
    const menuNames = DATA.menu.map(m => m.name);
    const branchNames = DATA.branches.map(b => b.name);
    
    for (let i = 0; i < 45; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - Math.floor(Math.random() * 30));
        d.setHours(Math.floor(Math.random() * 12) + 8);
        d.setMinutes(Math.floor(Math.random() * 60));
        
        const menu = menuNames[Math.floor(Math.random() * menuNames.length)];
        const qty = Math.floor(Math.random() * 5) + 1;
        const price = Math.floor(Math.random() * 30000) + 15000;
        
        DATA.transactions.push({
            id: DATA._nextTxId++,
            date: d.toISOString(),
            branch: branchNames[Math.floor(Math.random() * branchNames.length)],
            menu: menu,
            qty: qty,
            total: qty * price
        });
    }
    
    // Generate stocks
    const ingredientNames = DATA.ingredients.map(i => i.name);
    const units = DATA.ingredients.map(i => i.unit);
    
    for (const branch of DATA.branches) {
        for (let i = 0; i < ingredientNames.length; i++) {
            const qty = Math.floor(Math.random() * 50) + 10;
            DATA.stocks.push({
                id: DATA._nextStockId++,
                name: ingredientNames[i],
                qty: qty,
                unit: units[i],
                branch: branch.name,
                status: qty > 30 ? 'baik' : qty > 15 ? 'sedang' : 'kritis'
            });
        }
    }
    
    // Generate stock additions
    for (let i = 0; i < 20; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - Math.floor(Math.random() * 20));
        
        DATA.stockAdditions.push({
            id: DATA._nextAddId++,
            name: ingredientNames[Math.floor(Math.random() * ingredientNames.length)],
            qty: Math.floor(Math.random() * 20) + 5,
            unit: units[Math.floor(Math.random() * units.length)],
            branch: branchNames[Math.floor(Math.random() * branchNames.length)],
            date: d.toISOString()
        });
    }
}

// ===== APP STATE =====
const state = {
    currentUser: null,
    currentPage: 'dashboard',
    selectedBranch: 'all',
    periods: {
        dashboard: 'month',
        income: 'month',
        topMenu: 'month'
    }
};

// ===== DOM REFS =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ===== AUTH FUNCTIONS =====
function handleLogin(e) {
    e.preventDefault();
    const username = $('#username').value.trim();
    const password = $('#password').value.trim();
    const errorEl = $('#login-error');
    
    const user = USERS.find(u => u.username === username && u.password === password);
    
    if (user) {
        state.currentUser = user;
        errorEl.textContent = '';
        $('#login-page').style.display = 'none';
        $('#app').style.display = 'flex';
        
        // Update user info
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        $('#user-avatar').textContent = initials;
        $('#user-name').textContent = user.name;
        
        // Populate branch selector
        populateBranchSelector();
        
        // Render all data
        renderAll();
    } else {
        errorEl.textContent = '❌ Username atau password salah!';
        errorEl.style.color = '#E74C3C';
    }
}

function handleLogout() {
    state.currentUser = null;
    $('#app').style.display = 'none';
    $('#login-page').style.display = 'flex';
    $('#login-form').reset();
    $('#login-error').textContent = '';
}

// ===== BRANCH SELECTOR =====
function populateBranchSelector() {
    const select = $('#global-branch-select');
    select.innerHTML = '<option value="all">🌐 Semua Cabang</option>';
    DATA.branches.forEach(b => {
        select.innerHTML += `<option value="${b.id}">📍 ${b.name}</option>`;
    });
    select.value = state.selectedBranch;
    select.onchange = (e) => {
        state.selectedBranch = e.target.value;
        renderAll();
    };
}

// ===== NAVIGATION =====
function navigateTo(page) {
    state.currentPage = page;
    
    // Update nav
    $$('.nav-item').forEach(el => el.classList.remove('active'));
    const navBtn = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navBtn) navBtn.classList.add('active');
    
    // Update pages
    $$('.page').forEach(el => el.classList.remove('active'));
    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) pageEl.classList.add('active');
    
    // Update topbar subtitle
    const pageNames = {
        dashboard: 'Memantau ' + DATA.branches.length + ' cabang',
        income: 'Analisis pemasukan per cabang',
        transactions: 'Riwayat transaksi POS',
        stock: 'Manajemen stok bahan baku',
        'stock-add': 'Riwayat penambahan stok',
        'top-menu': 'Menu terlaris berdasarkan penjualan',
        branches: 'Perbandingan kinerja cabang'
    };
    $('#topbar-subtitle').textContent = pageNames[page] || '';
    
    renderAll();
}

// ===== PERIOD HANDLING =====
function setupPeriodButtons() {
    $$('.segmented').forEach(group => {
        const periodGroup = group.dataset.periodGroup;
        group.querySelectorAll('button').forEach(btn => {
            btn.onclick = () => {
                group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.periods[periodGroup] = btn.dataset.period;
                renderAll();
            };
        });
    });
}

// ===== FILTER FUNCTIONS =====
function getFilteredTransactions() {
    const branch = state.selectedBranch;
    const branchName = branch === 'all' ? null : DATA.branches.find(b => b.id == branch)?.name;
    
    let filtered = DATA.transactions;
    if (branchName) {
        filtered = filtered.filter(t => t.branch === branchName);
    }
    return filtered;
}

function getTransactionsByPeriod(period, transactions) {
    const now = new Date();
    const start = new Date(now);
    
    switch(period) {
        case 'today':
            start.setHours(0, 0, 0, 0);
            break;
        case 'week':
            start.setDate(start.getDate() - 7);
            break;
        case 'month':
        default:
            start.setDate(start.getDate() - 30);
            break;
    }
    
    return transactions.filter(t => new Date(t.date) >= start);
}

function getPeriodLabel(period) {
    const labels = {
        today: 'Hari ini',
        week: '7 hari terakhir',
        month: '30 hari terakhir'
    };
    return labels[period] || '30 hari terakhir';
}

// ===== RENDER FUNCTIONS =====

// Dashboard
function renderDashboard() {
    const period = state.periods.dashboard;
    const transactions = getFilteredTransactions();
    const periodTx = getTransactionsByPeriod(period, transactions);
    
    // Stats
    const totalTx = periodTx.length;
    const totalIncome = periodTx.reduce((sum, t) => sum + t.total, 0);
    const avgIncome = totalTx > 0 ? totalIncome / totalTx : 0;
    const uniqueMenus = new Set(periodTx.map(t => t.menu)).size;
    
    const statGrid = $('#dash-stat-grid');
    statGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-card__label">💳 Total Transaksi</div>
            <div class="stat-card__value">${totalTx}</div>
            <div class="stat-card__change positive">${getPeriodLabel(period)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-card__label">💰 Total Pemasukan</div>
            <div class="stat-card__value">Rp${formatNumber(totalIncome)}</div>
            <div class="stat-card__change positive">${getPeriodLabel(period)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-card__label">📊 Rata-rata Transaksi</div>
            <div class="stat-card__value">Rp${formatNumber(Math.round(avgIncome))}</div>
            <div class="stat-card__change positive">Per transaksi</div>
        </div>
        <div class="stat-card">
            <div class="stat-card__label">🍽️ Menu Terjual</div>
            <div class="stat-card__value">${uniqueMenus}</div>
            <div class="stat-card__change positive">Varian menu</div>
        </div>
    `;
    
    // Income trend chart
    const chartEl = $('#dash-income-chart');
    const sortedTx = [...periodTx].sort((a, b) => new Date(a.date) - new Date(b.date));
    const dailyIncome = {};
    sortedTx.forEach(t => {
        const date = new Date(t.date).toLocaleDateString('id-ID');
        dailyIncome[date] = (dailyIncome[date] || 0) + t.total;
    });
    
    const dates = Object.keys(dailyIncome);
    const values = Object.values(dailyIncome);
    
    if (dates.length === 0) {
        chartEl.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:40px 0;">Belum ada data transaksi</p>';
    } else {
        const maxVal = Math.max(...values, 1);
        chartEl.innerHTML = `
            <div style="display:flex;align-items:flex-end;gap:6px;height:180px;padding-top:10px;">
                ${dates.slice(-14).map((d, i) => {
                    const val = dailyIncome[d];
                    const height = (val / maxVal) * 160;
                    const dateLabel = d.split('/').slice(0,2).join('/');
                    return `
                        <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
                            <div style="width:100%;background:var(--primary);border-radius:4px 4px 0 0;height:${height}px;min-height:4px;transition:height 0.3s;"></div>
                            <span style="font-size:10px;color:var(--text-light);">${dateLabel}</span>
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:11px;color:var(--text-light);">
                <span>Total: Rp${formatNumber(totalIncome)}</span>
                <span>${periodTx.length} transaksi</span>
            </div>
        `;
    }
    $('#dash-income-hint').textContent = getPeriodLabel(period);
    
    // Top menu
    const menuSold = {};
    periodTx.forEach(t => {
        menuSold[t.menu] = (menuSold[t.menu] || 0) + t.qty;
    });
    const sortedMenu = Object.entries(menuSold).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topMenuEl = $('#dash-top-menu');
    
    if (sortedMenu.length === 0) {
        topMenuEl.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:20px 0;">Belum ada data penjualan</p>';
    } else {
        topMenuEl.innerHTML = sortedMenu.map(([name, qty], i) => `
            <div class="top-menu-item">
                <span class="rank">#${i + 1}</span>
                <span class="name">${name}</span>
                <span class="sold">${qty} terjual</span>
            </div>
        `).join('');
    }
}

// Income Page
function renderIncome() {
    const period = state.periods.income;
    const transactions = getFilteredTransactions();
    const periodTx = getTransactionsByPeriod(period, transactions);
    
    // Stats per branch
    const branchStats = {};
    DATA.branches.forEach(b => {
        const tx = periodTx.filter(t => t.branch === b.name);
        branchStats[b.name] = {
            count: tx.length,
            total: tx.reduce((sum, t) => sum + t.total, 0)
        };
    });
    
    const totalIncome = periodTx.reduce((sum, t) => sum + t.total, 0);
    const avgIncome = periodTx.length > 0 ? totalIncome / periodTx.length : 0;
    
    const statGrid = $('#income-stat-grid');
    statGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-card__label">💰 Total Pemasukan</div>
            <div class="stat-card__value">Rp${formatNumber(totalIncome)}</div>
            <div class="stat-card__change positive">${getPeriodLabel(period)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-card__label">📊 Rata-rata</div>
            <div class="stat-card__value">Rp${formatNumber(Math.round(avgIncome))}</div>
            <div class="stat-card__change positive">Per transaksi</div>
        </div>
        <div class="stat-card">
            <div class="stat-card__label">🏪 Cabang Aktif</div>
            <div class="stat-card__value">${Object.keys(branchStats).filter(name => branchStats[name].count > 0).length}</div>
            <div class="stat-card__change positive">Dari ${DATA.branches.length} cabang</div>
        </div>
    `;
    
    // Income chart by branch
    const chartEl = $('#income-chart');
    const branchNames = Object.keys(branchStats);
    const branchValues = branchNames.map(name => branchStats[name].total);
    const maxVal = Math.max(...branchValues, 1);
    
    if (branchNames.length === 0 || branchValues.every(v => v === 0)) {
        chartEl.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:40px 0;">Belum ada data pemasukan</p>';
    } else {
        const colors = ['#6F4E37', '#8B6B4F', '#C49A6C', '#4A3228', '#A87B5A'];
        chartEl.innerHTML = `
            <div style="display:flex;align-items:flex-end;gap:16px;height:200px;padding-top:10px;justify-content:center;">
                ${branchNames.map((name, i) => {
                    const val = branchValues[i];
                    const height = (val / maxVal) * 170;
                    const shortName = name.split(' - ')[1] || name;
                    return `
                        <div style="flex:1;max-width:120px;display:flex;flex-direction:column;align-items:center;gap:4px;">
                            <div style="width:100%;background:${colors[i % colors.length]};border-radius:4px 4px 0 0;height:${Math.max(height, 4)}px;transition:height 0.3s;position:relative;">
                                <span style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);font-size:12px;font-weight:600;color:var(--text);">Rp${formatNumber(val)}</span>
                            </div>
                            <span style="font-size:11px;color:var(--text-light);text-align:center;">${shortName}</span>
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:12px;font-size:11px;color:var(--text-light);">
                <span>Total: Rp${formatNumber(totalIncome)}</span>
                <span>${periodTx.length} transaksi</span>
            </div>
        `;
    }
    $('#income-chart-hint').textContent = getPeriodLabel(period);
}

// Transactions Page
function renderTransactions() {
    const transactions = getFilteredTransactions();
    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const tbody = $('#tx-table-body');
    $('#tx-count-hint').textContent = `${sorted.length} transaksi`;
    
    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-light);">Belum ada transaksi</td></tr>`;
        return;
    }
    
    tbody.innerHTML = sorted.slice(0, 50).map(t => `
        <tr>
            <td><strong>#${String(t.id).padStart(4, '0')}</strong></td>
            <td>${formatDate(t.date)}</td>
            <td>${t.branch}</td>
            <td>${t.menu}</td>
            <td class="num">${t.qty}</td>
            <td class="num">Rp${formatNumber(t.total)}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteTransaction(${t.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// Stock Page
function renderStock() {
    const branch = state.selectedBranch;
    let stocks = [...DATA.stocks];
    
    if (branch !== 'all') {
        const branchName = DATA.branches.find(b => b.id == branch)?.name;
        if (branchName) {
            stocks = stocks.filter(s => s.branch === branchName);
        }
    }
    
    const tbody = $('#stock-table-body');
    
    if (stocks.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-light);">Belum ada data stok</td></tr>`;
        return;
    }
    
    const statusLabels = {
        baik: '✅ Baik',
        sedang: '⚠️ Sedang',
        kritis: '🔴 Kritis'
    };
    
    tbody.innerHTML = stocks.map(s => `
        <tr>
            <td><strong>${s.name}</strong></td>
            <td class="num">${s.qty}</td>
            <td>${s.unit}</td>
            <td>${s.branch}</td>
            <td><span class="status-badge ${s.status}">${statusLabels[s.status]}</span></td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editStock(${s.id})">✏️</button>
            </td>
        </tr>
    `).join('');
}

// Stock Additions Page
function renderStockAdditions() {
    const branch = state.selectedBranch;
    let additions = [...DATA.stockAdditions];
    
    if (branch !== 'all') {
        const branchName = DATA.branches.find(b => b.id == branch)?.name;
        if (branchName) {
            additions = additions.filter(a => a.branch === branchName);
        }
    }
    
    const sorted = [...additions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const tbody = $('#stock-add-table-body');
    $('#stock-add-hint').textContent = `${sorted.length} riwayat`;
    
    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-light);">Belum ada riwayat penambahan</td></tr>`;
        return;
    }
    
    tbody.innerHTML = sorted.slice(0, 30).map(a => `
        <tr>
            <td><strong>${a.name}</strong></td>
            <td class="num">${a.qty}</td>
            <td>${a.unit}</td>
            <td>${a.branch}</td>
            <td>${formatDate(a.date)}</td>
        </tr>
    `).join('');
}

// Top Menu Page
function renderTopMenu() {
    const period = state.periods.topMenu;
    const transactions = getFilteredTransactions();
    const periodTx = getTransactionsByPeriod(period, transactions);
    
    const menuSold = {};
    periodTx.forEach(t => {
        menuSold[t.menu] = (menuSold[t.menu] || 0) + t.qty;
    });
    const sorted = Object.entries(menuSold).sort((a, b) => b[1] - a[1]);
    
    const chartEl = $('#top-menu-chart');
    $('#top-menu-hint').textContent = getPeriodLabel(period);
    
    if (sorted.length === 0) {
        chartEl.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:40px 0;">Belum ada data penjualan</p>';
        return;
    }
    
    const top10 = sorted.slice(0, 10);
    const maxVal = Math.max(...top10.map(([, qty]) => qty), 1);
    const colors = ['#6F4E37', '#8B6B4F', '#C49A6C', '#4A3228', '#A87B5A', '#D4A574', '#E8C9A0', '#B8956E', '#8D6E4E', '#5C4033'];
    
    chartEl.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:8px;padding:8px 0;">
            ${top10.map(([name, qty], i) => {
                const width = (qty / maxVal) * 100;
                return `
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-weight:700;color:var(--primary);width:30px;font-size:14px;">#${i+1}</span>
                        <span style="width:100px;font-weight:500;font-size:14px;">${name}</span>
                        <div style="flex:1;background:var(--bg);border-radius:4px;height:28px;overflow:hidden;">
                            <div style="height:100%;background:${colors[i % colors.length]};border-radius:4px;width:${Math.max(width, 2)}%;transition:width 0.5s;display:flex;align-items:center;padding-left:8px;color:white;font-size:12px;font-weight:600;">
                                ${qty}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <div style="margin-top:12px;font-size:13px;color:var(--text-light);text-align:center;">
            Total ${sorted.length} menu terjual · ${periodTx.length} transaksi
        </div>
    `;
}

// Branches Page
function renderBranches() {
    const period = 'month';
    const transactions = getTransactionsByPeriod(period, DATA.transactions);
    
    const branchStats = {};
    DATA.branches.forEach(b => {
        const tx = transactions.filter(t => t.branch === b.name);
        const totalIncome = tx.reduce((sum, t) => sum + t.total, 0);
        const uniqueMenus = new Set(tx.map(t => t.menu)).size;
        branchStats[b.name] = {
            count: tx.length,
            total: totalIncome,
            avg: tx.length > 0 ? totalIncome / tx.length : 0,
            menus: uniqueMenus
        };
    });
    
    const grid = $('#branch-grid');
    
    grid.innerHTML = DATA.branches.map(b => {
        const stats = branchStats[b.name] || { count: 0, total: 0, avg: 0, menus: 0 };
        return `
            <div class="branch-card">
                <div class="branch-card__name">📍 ${b.name}</div>
                <div class="branch-card__location">${b.location}</div>
                <div class="branch-card__stats">
                    <div class="branch-card__stat">
                        <div class="value">${stats.count}</div>
                        <div class="label">Transaksi</div>
                    </div>
                    <div class="branch-card__stat">
                        <div class="value">Rp${formatNumber(stats.total)}</div>
                        <div class="label">Pemasukan</div>
                    </div>
                    <div class="branch-card__stat">
                        <div class="value">Rp${formatNumber(Math.round(stats.avg))}</div>
                        <div class="label">Rata-rata</div>
                    </div>
                    <div class="branch-card__stat">
                        <div class="value">${stats.menus}</div>
                        <div class="label">Menu Terjual</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ===== UTILITY FUNCTIONS =====
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function deleteTransaction(id) {
    if (confirm('Hapus transaksi ini?')) {
        DATA.transactions = DATA.transactions.filter(t => t.id !== id);
        renderAll();
    }
}

function editStock(id) {
    const stock = DATA.stocks.find(s => s.id === id);
    if (!stock) return;
    
    const newQty = prompt(`Edit stok "${stock.name}" (${stock.branch}):`, stock.qty);
    if (newQty !== null && !isNaN(newQty) && Number(newQty) >= 0) {
        stock.qty = Number(newQty);
        stock.status = stock.qty > 30 ? 'baik' : stock.qty > 15 ? 'sedang' : 'kritis';
        renderAll();
    }
}

// ===== MODAL FUNCTIONS =====
function showAddTransaction() {
    const modal = $('#modal');
    const body = $('#modal-body');
    $('#modal-title').textContent = '➕ Tambah Transaksi';
    
    body.innerHTML = `
        <form id="add-transaction-form">
            <div class="form-group">
                <label>Cabang</label>
                <select id="tx-branch" required>
                    ${DATA.branches.map(b => `<option value="${b.name}">${b.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Menu</label>
                <select id="tx-menu" required>
                    ${DATA.menu.map(m => `<option value="${m.name}">${m.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Jumlah</label>
                <input type="number" id="tx-qty" value="1" min="1" required>
            </div>
            <div class="form-group">
                <label>Harga (Rp)</label>
                <input type="number" id="tx-price" value="25000" min="1000" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button>
                <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
        </form>
    `;
    
    modal.style.display = 'flex';
    
    $('#add-transaction-form').onsubmit = (e) => {
        e.preventDefault();
        const branch = $('#tx-branch').value;
        const menu = $('#tx-menu').value;
        const qty = parseInt($('#tx-qty').value);
        const price = parseInt($('#tx-price').value);
        
        DATA.transactions.push({
            id: DATA._nextTxId++,
            date: new Date().toISOString(),
            branch,
            menu,
            qty,
            total: qty * price
        });
        
        closeModal();
        renderAll();
    };
}

function showAddStock() {
    const modal = $('#modal');
    const body = $('#modal-body');
    $('#modal-title').textContent = '📥 Tambah Stok';
    
    body.innerHTML = `
        <form id="add-stock-form">
            <div class="form-group">
                <label>Nama Bahan</label>
                <input type="text" id="stock-name" placeholder="Nama bahan baku" required>
            </div>
            <div class="form-group">
                <label>Jumlah</label>
                <input type="number" id="stock-qty" value="10" min="1" required>
            </div>
            <div class="form-group">
                <label>Satuan</label>
                <select id="stock-unit">
                    <option value="kg">kg</option>
                    <option value="liter">liter</option>
                    <option value="gram">gram</option>
                    <option value="pcs">pcs</option>
                    <option value="pack">pack</option>
                </select>
            </div>
            <div class="form-group">
                <label>Cabang</label>
                <select id="stock-branch" required>
                    ${DATA.branches.map(b => `<option value="${b.name}">${b.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button>
                <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
        </form>
    `;
    
    modal.style.display = 'flex';
    
    $('#add-stock-form').onsubmit = (e) => {
        e.preventDefault();
        const name = $('#stock-name').value.trim();
        const qty = parseInt($('#stock-qty').value);
        const unit = $('#stock-unit').value;
        const branch = $('#stock-branch').value;
        
        DATA.stocks.push({
            id: DATA._nextStockId++,
            name,
            qty,
            unit,
            branch,
            status: qty > 30 ? 'baik' : qty > 15 ? 'sedang' : 'kritis'
        });
        
        // Also add to stock additions
        DATA.stockAdditions.push({
            id: DATA._nextAddId++,
            name,
            qty,
            unit,
            branch,
            date: new Date().toISOString()
        });
        
        closeModal();
        renderAll();
    };
}

function showAddBranch() {
    const modal = $('#modal');
    const body = $('#modal-body');
    $('#modal-title').textContent = '📍 Tambah Cabang';
    
    body.innerHTML = `
        <form id="add-branch-form">
            <div class="form-group">
                <label>Nama Cabang</label>
                <input type="text" id="branch-name" placeholder="Contoh: Kopi Nusantara - Lokasi" required>
            </div>
            <div class="form-group">
                <label>Lokasi</label>
                <input type="text" id="branch-location" placeholder="Kota / Daerah" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button>
                <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
        </form>
    `;
    
    modal.style.display = 'flex';
    
    $('#add-branch-form').onsubmit = (e) => {
        e.preventDefault();
        const name = $('#branch-name').value.trim();
        const location = $('#branch-location').value.trim();
        
        DATA.branches.push({
            id: DATA.branches.length + 1,
            name,
            location
        });
        
        populateBranchSelector();
        closeModal();
        renderAll();
    };
}

function closeModal() {
    $('#modal').style.display = 'none';
    $('#modal-body').innerHTML = '';
}

// ===== REFRESH =====
function refreshData() {
    renderAll();
}

// ===== MAIN RENDER =====
function renderAll() {
    renderDashboard();
    renderIncome();
    renderTransactions();
    renderStock();
    renderStockAdditions();
    renderTopMenu();
    renderBranches();
}

// ===== INITIALIZATION =====
function init() {
    // Initialize data
    if (DATA.transactions.length === 0) {
        initData();
    }
    
    // Setup login
    $('#login-form').onsubmit = handleLogin;
    $('#logout-btn').onclick = handleLogout;
    
    // Setup navigation
    $$('.nav-item').forEach(btn => {
        btn.onclick = () => {
            navigateTo(btn.dataset.page);
        };
    });
    
    // Setup period buttons
    setupPeriodButtons();
    
    // Show login page initially
    $('#login-page').style.display = 'flex';
    $('#app').style.display = 'none';
    
    // Close modal on overlay click
    $('#modal').onclick = (e) => {
        if (e.target === $('#modal')) closeModal();
    };
    
    // Close modal on Escape key
    document.onkeydown = (e) => {
        if (e.key === 'Escape') closeModal();
    };
}
// Close button di sidebar
const closeBtn = document.getElementById('sidebarCloseBtn');
if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeSidebar();
    });
}

// Start the app
document.addEventListener('DOMContentLoaded', init);