// ===================================
// Centralized Data Storage
// ===================================
let salesData = [];
let inventoryData = [];
let attendanceData = [];

// Counter for IDs
let salesIdCounter = 1;
let attendanceIdCounter = 1;

// ===================================
// Initialize Application
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize with sample data
    initializeSampleData();
    
    // Setup event listeners
    setupNavigation();
    setupDarkMode();
    setupForms();
    
    // Initial render
    updateDashboard();
    renderSalesTable();
    renderInventoryGrid();
    renderAttendanceTable();
    populateProductDropdown();
    
    // Set today's date as default
    document.getElementById('empDate').valueAsDate = new Date();
});

// ===================================
// Sample Data Initialization
// ===================================
function initializeSampleData() {
    // Initialize inventory
    inventoryData = [
        { id: 1, name: 'Laptop', category: 'Electronics', stock: 50, minStock: 10, price: 45000 },
        { id: 2, name: 'Office Chair', category: 'Furniture', stock: 30, minStock: 5, price: 8000 },
        { id: 3, name: 'Monitor', category: 'Electronics', stock: 40, minStock: 8, price: 15000 },
        { id: 4, name: 'Keyboard', category: 'Electronics', stock: 100, minStock: 20, price: 2000 }
    ];
    
    // Initialize sales
    salesData = [
        { id: salesIdCounter++, date: '2024-01-15', product: 'Laptop', quantity: 5, price: 45000, customer: 'ABC Corp' },
        { id: salesIdCounter++, date: '2024-01-16', product: 'Monitor', quantity: 10, price: 15000, customer: 'XYZ Ltd' },
        { id: salesIdCounter++, date: '2024-01-17', product: 'Office Chair', quantity: 8, price: 8000, customer: 'Tech Solutions' },
        { id: salesIdCounter++, date: '2024-01-18', product: 'Keyboard', quantity: 15, price: 2000, customer: 'StartUp Inc' },
        { id: salesIdCounter++, date: '2024-01-19', product: 'Laptop', quantity: 3, price: 45000, customer: 'Global Systems' }
    ];
    
    // Initialize attendance
    attendanceData = [
        { id: attendanceIdCounter++, employee: 'John Doe', date: '2024-01-15', status: 'Present', hours: 8 },
        { id: attendanceIdCounter++, employee: 'Jane Smith', date: '2024-01-15', status: 'Present', hours: 9 },
        { id: attendanceIdCounter++, employee: 'Mike Johnson', date: '2024-01-16', status: 'Present', hours: 8.5 },
        { id: attendanceIdCounter++, employee: 'Sarah Williams', date: '2024-01-16', status: 'Half Day', hours: 4 },
        { id: attendanceIdCounter++, employee: 'Tom Brown', date: '2024-01-17', status: 'Present', hours: 9 }
    ];
}

// ===================================
// Navigation
// ===================================
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const modules = document.querySelectorAll('.module');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetModule = this.dataset.module;
            
            // Update active states
            navItems.forEach(nav => nav.classList.remove('active'));
            modules.forEach(module => module.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(targetModule).classList.add('active');
            
            // Refresh data when switching modules
            if (targetModule === 'dashboard') {
                updateDashboard();
            }
        });
    });
}

// ===================================
// Dark Mode Toggle
// ===================================
function setupDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // Check for saved preference
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    darkModeToggle.addEventListener('click', function() {
        const theme = document.documentElement.getAttribute('data-theme');
        const newTheme = theme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// ===================================
// Form Setup
// ===================================
function setupForms() {
    // Sales Form
    document.getElementById('salesForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addSale();
    });
    
    // Attendance Form
    document.getElementById('attendanceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addAttendance();
    });
    
    // Correlation Calculator
    document.getElementById('calculateCorrelation').addEventListener('click', calculateCorrelation);
}

// ===================================
// Dashboard Updates
// ===================================
function updateDashboard() {
    // Calculate metrics
    const totalRevenue = calculateTotalRevenue();
    const totalSales = salesData.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalInventory = inventoryData.reduce((sum, item) => sum + item.stock, 0);
    const attendanceRate = calculateAttendanceRate();
    
    // Animate counter updates
    animateValue('dashRevenue', 0, totalRevenue, 1000, true);
    animateValue('dashSales', 0, totalSales, 1000, false);
    animateValue('dashInventory', 0, totalInventory, 1000, false);
    animateValue('dashAttendance', 0, attendanceRate, 1000, false, true);
    
    // Update chart
    updateSalesChart();
}

function animateValue(elementId, start, end, duration, isCurrency = false, isPercentage = false) {
    const element = document.getElementById(elementId);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        let displayValue = Math.round(current);
        if (isCurrency) {
            element.textContent = '₹' + displayValue.toLocaleString('en-IN');
        } else if (isPercentage) {
            element.textContent = displayValue + '%';
        } else {
            element.textContent = displayValue.toLocaleString();
        }
    }, 16);
}

function calculateTotalRevenue() {
    return salesData.reduce((sum, sale) => sum + (sale.quantity * sale.price), 0);
}

function calculateAttendanceRate() {
    if (attendanceData.length === 0) return 0;
    const presentCount = attendanceData.filter(att => att.status === 'Present').length;
    return Math.round((presentCount / attendanceData.length) * 100);
}

function updateSalesChart() {
    const chartContainer = document.getElementById('salesChart');
    chartContainer.innerHTML = '';
    
    // Get last 7 sales or all if less than 7
    const recentSales = salesData.slice(-7);
    
    if (recentSales.length === 0) {
        chartContainer.innerHTML = '<p style="color: var(--text-secondary); margin: auto;">No sales data available</p>';
        return;
    }
    
    // Find max value for scaling
    const maxValue = Math.max(...recentSales.map(sale => sale.quantity * sale.price));
    
    recentSales.forEach((sale, index) => {
        const value = sale.quantity * sale.price;
        const height = (value / maxValue) * 100;
        
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = height + '%';
        
        const label = document.createElement('div');
        label.className = 'chart-bar-label';
        label.textContent = sale.product.substring(0, 8);
        
        const valueLabel = document.createElement('div');
        valueLabel.className = 'chart-bar-value';
        valueLabel.textContent = '₹' + (value / 1000).toFixed(1) + 'K';
        
        bar.appendChild(label);
        bar.appendChild(valueLabel);
        chartContainer.appendChild(bar);
    });
}

// ===================================
// Sales Module
// ===================================
function populateProductDropdown() {
    const select = document.getElementById('saleProduct');
    select.innerHTML = '<option value="">Select Product</option>';
    
    inventoryData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name;
        option.textContent = `${item.name} (Stock: ${item.stock})`;
        select.appendChild(option);
    });
}

function addSale() {
    const product = document.getElementById('saleProduct').value;
    const quantity = parseInt(document.getElementById('saleQuantity').value);
    const price = parseFloat(document.getElementById('salePrice').value);
    const customer = document.getElementById('saleCustomer').value;
    
    // Validate stock availability
    const inventoryItem = inventoryData.find(item => item.name === product);
    if (!inventoryItem) {
        alert('Product not found in inventory');
        return;
    }
    
    if (inventoryItem.stock < quantity) {
        alert(`Insufficient stock! Available: ${inventoryItem.stock}`);
        return;
    }
    
    // Add sale
    const sale = {
        id: salesIdCounter++,
        date: new Date().toISOString().split('T')[0],
        product: product,
        quantity: quantity,
        price: price,
        customer: customer
    };
    
    salesData.push(sale);
    
    // Update inventory (reduce stock)
    inventoryItem.stock -= quantity;
    
    // Update UI
    renderSalesTable();
    renderInventoryGrid();
    populateProductDropdown();
    updateDashboard();
    
    // Reset form
    document.getElementById('salesForm').reset();
    
    // Show success feedback
    showNotification('Sale added successfully!');
}

function renderSalesTable() {
    const tbody = document.getElementById('salesTable');
    tbody.innerHTML = '';
    
    if (salesData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-secondary);">No sales records</td></tr>';
        return;
    }
    
    salesData.forEach(sale => {
        const row = document.createElement('tr');
        const total = sale.quantity * sale.price;
        
        row.innerHTML = `
            <td>${sale.id}</td>
            <td>${sale.date}</td>
            <td>${sale.product}</td>
            <td>${sale.quantity}</td>
            <td>₹${sale.price.toLocaleString('en-IN')}</td>
            <td>₹${total.toLocaleString('en-IN')}</td>
            <td>${sale.customer}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// ===================================
// Inventory Module
// ===================================
function renderInventoryGrid() {
    const grid = document.getElementById('inventoryGrid');
    grid.innerHTML = '';
    
    inventoryData.forEach(item => {
        const stockPercentage = (item.stock / (item.stock + item.minStock + 20)) * 100;
        let statusBadge = 'badge-success';
        let statusText = 'In Stock';
        
        if (item.stock <= item.minStock) {
            statusBadge = 'badge-error';
            statusText = 'Low Stock';
        } else if (item.stock <= item.minStock * 2) {
            statusBadge = 'badge-warning';
            statusText = 'Reorder Soon';
        }
        
        const card = document.createElement('div');
        card.className = 'inventory-card';
        
        card.innerHTML = `
            <div class="inventory-header">
                <div class="inventory-name">${item.name}</div>
                <div class="inventory-badge ${statusBadge}">${statusText}</div>
            </div>
            <div class="inventory-details">
                <div class="inventory-detail">
                    <span>Category:</span>
                    <strong>${item.category}</strong>
                </div>
                <div class="inventory-detail">
                    <span>Current Stock:</span>
                    <strong>${item.stock} units</strong>
                </div>
                <div class="inventory-detail">
                    <span>Min Stock:</span>
                    <strong>${item.minStock} units</strong>
                </div>
                <div class="inventory-detail">
                    <span>Price:</span>
                    <strong>₹${item.price.toLocaleString('en-IN')}</strong>
                </div>
            </div>
            <div class="stock-bar">
                <div class="stock-bar-fill" style="width: ${stockPercentage}%"></div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// ===================================
// HR Module
// ===================================
function addAttendance() {
    const employee = document.getElementById('empName').value;
    const date = document.getElementById('empDate').value;
    const status = document.getElementById('empStatus').value;
    const hours = parseFloat(document.getElementById('empHours').value);
    
    const attendance = {
        id: attendanceIdCounter++,
        employee: employee,
        date: date,
        status: status,
        hours: hours
    };
    
    attendanceData.push(attendance);
    
    // Update UI
    renderAttendanceTable();
    updateDashboard();
    
    // Reset form
    document.getElementById('attendanceForm').reset();
    document.getElementById('empDate').valueAsDate = new Date();
    
    showNotification('Attendance marked successfully!');
}

function renderAttendanceTable() {
    const tbody = document.getElementById('attendanceTable');
    tbody.innerHTML = '';
    
    if (attendanceData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No attendance records</td></tr>';
        return;
    }
    
    let totalProductivity = 0;
    
    attendanceData.forEach(att => {
        const row = document.createElement('tr');
        
        // Calculate productivity (assuming 8 hours is 100%)
        const productivity = Math.min((att.hours / 8) * 100, 100);
        totalProductivity += productivity;
        
        let productivityClass = 'badge-success';
        if (productivity < 50) productivityClass = 'badge-error';
        else if (productivity < 80) productivityClass = 'badge-warning';
        
        row.innerHTML = `
            <td>${att.id}</td>
            <td>${att.employee}</td>
            <td>${att.date}</td>
            <td><span class="inventory-badge ${att.status === 'Present' ? 'badge-success' : att.status === 'Absent' ? 'badge-error' : 'badge-warning'}">${att.status}</span></td>
            <td>${att.hours}h</td>
            <td><span class="inventory-badge ${productivityClass}">${productivity.toFixed(0)}%</span></td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Update average productivity
    const avgProductivity = totalProductivity / attendanceData.length;
    document.getElementById('productivityValue').textContent = avgProductivity.toFixed(1) + '%';
}

// ===================================
// Analytics Module - Correlation
// ===================================
function calculateCorrelation() {
    const var1 = document.getElementById('var1').value;
    const var2 = document.getElementById('var2').value;
    
    if (var1 === var2) {
        alert('Please select two different variables');
        return;
    }
    
    // Get data arrays for selected variables
    const data1 = getVariableData(var1);
    const data2 = getVariableData(var2);
    
    if (data1.length === 0 || data2.length === 0) {
        alert('Insufficient data for correlation analysis');
        return;
    }
    
    // Ensure equal length (use minimum length)
    const length = Math.min(data1.length, data2.length);
    const x = data1.slice(0, length);
    const y = data2.slice(0, length);
    
    // Calculate Pearson correlation coefficient
    const r = pearsonCorrelation(x, y);
    
    // Display result
    displayCorrelationResult(r, var1, var2);
}

function getVariableData(variable) {
    switch(variable) {
        case 'sales':
            return salesData.map(sale => sale.quantity);
        case 'revenue':
            return salesData.map(sale => sale.quantity * sale.price);
        case 'inventory':
            // Get inventory levels at each sale point
            return salesData.map((_, index) => {
                return inventoryData.reduce((sum, item) => sum + item.stock, 0);
            });
        case 'attendance':
            return attendanceData.map(att => att.hours);
        default:
            return [];
    }
}

function pearsonCorrelation(x, y) {
    const n = x.length;
    
    if (n === 0) return 0;
    
    // Calculate means
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;
    
    // Calculate deviations and products
    let numerator = 0;
    let sumXDevSq = 0;
    let sumYDevSq = 0;
    
    for (let i = 0; i < n; i++) {
        const xDev = x[i] - meanX;
        const yDev = y[i] - meanY;
        
        numerator += xDev * yDev;
        sumXDevSq += xDev * xDev;
        sumYDevSq += yDev * yDev;
    }
    
    // Calculate correlation coefficient
    const denominator = Math.sqrt(sumXDevSq * sumYDevSq);
    
    if (denominator === 0) return 0;
    
    return numerator / denominator;
}

function displayCorrelationResult(r, var1, var2) {
    const resultDiv = document.getElementById('correlationResult');
    const rValueSpan = document.getElementById('rValue');
    const interpretationDiv = document.getElementById('correlationInterpretation');
    const graphDiv = document.getElementById('correlationGraph');
    
    // Display r value
    rValueSpan.textContent = r.toFixed(3);
    
    // Determine interpretation
    let interpretation = '';
    let interpretationClass = '';
    
    if (r >= 0.7) {
        interpretation = '<strong>Strong Positive Correlation:</strong> When one variable increases, the other tends to increase significantly. These variables are highly related.';
        interpretationClass = 'strong-positive';
    } else if (r >= 0.3) {
        interpretation = '<strong>Moderate Positive Correlation:</strong> There is a noticeable positive relationship between these variables, but other factors also play a role.';
        interpretationClass = 'moderate-positive';
    } else if (r >= 0) {
        interpretation = '<strong>Weak Positive Correlation:</strong> A slight positive relationship exists, but it\'s not strong enough to make reliable predictions.';
        interpretationClass = 'weak-positive';
    } else {
        interpretation = '<strong>Negative Correlation:</strong> When one variable increases, the other tends to decrease. These variables have an inverse relationship.';
        interpretationClass = 'negative';
    }
    
    interpretationDiv.innerHTML = interpretation;
    interpretationDiv.className = 'correlation-interpretation ' + interpretationClass;
    
    // Create simple visual graph
    const absR = Math.abs(r);
    const graphWidth = absR * 100;
    const graphColor = r >= 0 ? 'var(--success)' : 'var(--error)';
    
    graphDiv.innerHTML = `
        <div style="flex: 1; background: var(--border-color); border-radius: 4px; overflow: hidden;">
            <div class="graph-bar" style="width: ${graphWidth}%; background: ${graphColor}; height: 100%;"></div>
        </div>
        <div style="color: var(--text-secondary); font-size: 0.875rem; min-width: 60px; text-align: right;">
            ${(absR * 100).toFixed(0)}% strength
        </div>
    `;
    
    // Show result
    resultDiv.style.display = 'block';
}

// ===================================
// Utility Functions
// ===================================
function showNotification(message) {
    // Simple notification - could be enhanced with a toast library
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--success);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);