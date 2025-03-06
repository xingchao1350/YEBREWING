/**
 * 野鹅微醺门店管理系统 - 主JavaScript文件
 */

// 调试日志
function debug(message, type = 'info') {
    console.log(`[DEBUG] ${message}`);
    if (window.debugLog) {
        window.debugLog(message, type);
    }
}

// 初始化调试
debug('main.js 加载开始');

// Supabase配置
const SUPABASE_URL = 'https://rrckxifdelcqnibwoxsx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyY2t4aWZkZWxjcW5pYndveHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczNzM3MTMsImV4cCI6MjA1Mjk0OTcxM30.vdOVQhrUS_Ykd78w9AX28IbekJhsTX2YixAPrRwAgh4';

// 初始化Supabase客户端
let supabase;
try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    debug('Supabase客户端初始化成功');
} catch (error) {
    debug(`Supabase客户端初始化失败: ${error.message}`, 'error');
}

// 模块配置
const MODULES = {
    dashboard: {
        path: './modules/dashboard.html',
        title: '门店总览'
    },
    inventory: {
        path: './modules/inventory.html',
        title: '库存管理'
    },
    finance: {
        path: './modules/finance.html',
        title: '财务管理'
    },
    tools: {
        path: './modules/tools.html',
        title: '工具模块'
    },
    resources: {
        path: './modules/resources.html',
        title: '资源中心'
    }
};

document.addEventListener('DOMContentLoaded', function() {
    debug('DOMContentLoaded事件触发');
    
    try {
        // 检查用户是否已登录
        checkUserSession();
        
        // 侧边栏控制
        initSidebar();
        
        // 初始化通知功能
        initNotifications();
        
        // 初始化用户菜单
        initUserMenu();
        
        // 初始化模块加载
        initModuleLoading();
        
        // 默认加载门店总览模块
        debug('准备加载默认模块: dashboard');
        loadModule('dashboard');
    } catch (error) {
        debug(`初始化过程中出错: ${error.message}`, 'error');
    }
});

/**
 * 检查用户是否已登录
 */
async function checkUserSession() {
    debug('检查用户会话');
    
    try {
        if (!supabase) {
            debug('Supabase客户端未初始化，跳过会话检查', 'error');
            return;
        }
        
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!user) {
            // 用户未登录，重定向到登录页面
            debug('用户未登录，准备重定向到登录页面');
            // 在开发阶段，暂时注释掉重定向，以便测试
            // window.location.href = 'login.html';
            return;
        }
        
        // 更新用户信息显示
        debug('用户已登录，更新用户信息');
        updateUserInfo(user);
        
    } catch (error) {
        debug(`会话检查失败: ${error.message}`, 'error');
        // 在开发阶段，暂时注释掉重定向，以便测试
        // window.location.href = 'login.html';
    }
}

/**
 * 更新用户信息显示
 */
async function updateUserInfo(user) {
    debug('更新用户信息显示');
    
    try {
        // 从user_profiles表获取用户详细信息
        const { data: userProfile, error } = await supabase
            .from('user_profiles')
            .select('username, role')
            .eq('user_id', user.id)
            .maybeSingle();
        
        if (error) {
            console.error('获取用户资料失败:', error);
        }
        
        // 用户名显示
        const nameElement = document.querySelector('.user .name');
        if (nameElement) {
            // 优先使用user_profiles中的username
            if (userProfile && userProfile.username) {
                nameElement.textContent = userProfile.username;
            } else {
                // 回退到user_metadata或邮箱
                nameElement.textContent = user.user_metadata?.name || user.email.split('@')[0];
            }
        }
        
        // 角色显示
        const roleElement = document.querySelector('.user .role');
        if (roleElement) {
            let roleText = '员工';
            
            if (userProfile && userProfile.role) {
                // 角色映射
                const roleMap = {
                    'SUPER_ADMIN': '超级管理员',
                    'STORE_ADMIN': '门店管理员',
                    'STORE_EMPLOYEE': '门店员工'
                };
                roleText = roleMap[userProfile.role] || '员工';
            }
            
            roleElement.textContent = roleText;
        }
        
    } catch (err) {
        console.error('更新用户信息显示失败:', err);
    }
}

/**
 * 初始化侧边栏功能
 */
function initSidebar() {
    debug('初始化侧边栏');
    
    try {
        const menuItems = document.querySelectorAll('.nav-links li');
        const currentPage = window.location.pathname.split('/').pop();
        
        menuItems.forEach(item => {
            const link = item.querySelector('a');
            if (link) {
                debug(`设置侧边栏链接: ${link.getAttribute('href')}`);
            }
        });
        
        // 移动端菜单按钮
        const menuBtn = document.querySelector('.menu-btn');
        const container = document.querySelector('.container');
        const sidebar = document.querySelector('.sidebar');
        
        if (menuBtn && container && sidebar) {
            menuBtn.addEventListener('click', function() {
                debug('菜单按钮点击');
                container.classList.toggle('sidebar-active');
                sidebar.classList.toggle('active');
            });
        } else {
            debug('未找到菜单按钮或容器或侧边栏元素', 'error');
        }
    } catch (error) {
        debug(`初始化侧边栏出错: ${error.message}`, 'error');
    }
}

/**
 * 初始化通知功能
 */
function initNotifications() {
    debug('初始化通知功能');
    
    // 这里可以添加通知相关的初始化代码
    // 例如，获取未读通知数量，设置通知点击事件等
}

/**
 * 初始化用户菜单
 */
function initUserMenu() {
    debug('初始化用户菜单');
    
    // 绑定用户头像点击事件
    const userProfileLink = document.getElementById('user-profile-link');
    if (userProfileLink) {
        userProfileLink.addEventListener('click', function() {
            // 加载个人信息页面
            loadProfilePage();
        });
    }
}

/**
 * 加载个人信息页面
 */
async function loadProfilePage() {
    try {
        const contentContainer = document.getElementById('content-container');
        if (!contentContainer) return;
        
        // 显示加载中
        contentContainer.innerHTML = `
            <div class="loading-placeholder">
                <div class="spinner"></div>
                <p>加载中...</p>
            </div>
        `;
        
        // 加载个人信息页面
        const response = await fetch('modules/profile.html');
        if (!response.ok) {
            throw new Error('加载个人信息页面失败');
        }
        
        const html = await response.text();
        contentContainer.innerHTML = html;
        
        // 移除所有导航项的活动状态
        document.querySelectorAll('.nav-links li').forEach(item => {
            item.classList.remove('active');
        });
        
        // 更新页面标题
        document.title = '个人信息 - 野鹅微醺门店管理系统';
        
    } catch (error) {
        console.error('加载个人信息页面失败:', error);
        
        // 显示错误信息
        const contentContainer = document.getElementById('content-container');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 40px 20px;">
                    <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #EF4444; margin-bottom: 16px;"></i>
                    <h3>加载失败</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

/**
 * 初始化图表（模拟数据）
 * 实际项目中应该使用Chart.js或ECharts等图表库
 */
function initCharts() {
    const chartPlaceholders = document.querySelectorAll('.chart-placeholder');
    
    chartPlaceholders.forEach(placeholder => {
        // 添加一个简单的加载动画
        placeholder.innerHTML = '<div class="loading-spinner"></div>';
        
        // 模拟加载延迟
        setTimeout(() => {
            placeholder.innerHTML = `
                <div class="chart-message">
                    <i class="fas fa-chart-line"></i>
                    <p>图表将在实际项目中使用Chart.js或ECharts渲染</p>
                </div>
            `;
        }, 1000);
    });
    
    // 刷新按钮功能
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            const chartCard = this.closest('.chart-card');
            const placeholder = chartCard.querySelector('.chart-placeholder');
            
            // 添加旋转动画
            this.classList.add('rotating');
            
            // 显示加载中
            placeholder.innerHTML = '<div class="loading-spinner"></div>';
            
            // 模拟加载延迟
            setTimeout(() => {
                placeholder.innerHTML = `
                    <div class="chart-message">
                        <i class="fas fa-chart-pie"></i>
                        <p>数据已刷新</p>
                    </div>
                `;
                
                // 移除旋转动画
                this.classList.remove('rotating');
            }, 800);
        });
    }
}

/**
 * 初始化预订管理标签页
 */
function initReservationsTab() {
    const reservationsTab = document.getElementById('reservations');
    if (!reservationsTab) return;
    
    // 添加预订按钮点击事件
    const addReservationBtn = reservationsTab.querySelector('.btn');
    if (addReservationBtn) {
        addReservationBtn.addEventListener('click', function() {
            alert('添加预订功能即将上线！');
        });
    }
    
    // 日期导航按钮点击事件
    const prevDateBtn = reservationsTab.querySelector('.reservations-date-nav button:first-child');
    const nextDateBtn = reservationsTab.querySelector('.reservations-date-nav button:last-child');
    const currentDateSpan = reservationsTab.querySelector('.current-date');
    
    if (prevDateBtn && nextDateBtn && currentDateSpan) {
        prevDateBtn.addEventListener('click', function() {
            alert('切换到上个月的预订数据');
        });
        
        nextDateBtn.addEventListener('click', function() {
            alert('切换到下个月的预订数据');
        });
    }
    
    // 编辑和删除按钮点击事件
    const editBtns = reservationsTab.querySelectorAll('.fa-edit');
    const deleteBtns = reservationsTab.querySelectorAll('.fa-trash');
    
    editBtns.forEach(btn => {
        btn.parentElement.addEventListener('click', function() {
            const row = this.closest('tr');
            const customer = row.cells[2].textContent;
            alert(`编辑 ${customer} 的预订信息`);
        });
    });
    
    deleteBtns.forEach(btn => {
        btn.parentElement.addEventListener('click', function() {
            const row = this.closest('tr');
            const customer = row.cells[2].textContent;
            if (confirm(`确定要删除 ${customer} 的预订信息吗？`)) {
                alert('预订信息已删除');
            }
        });
    });
    
    // 分页按钮点击事件
    const paginationBtns = reservationsTab.querySelectorAll('.reservations-pagination button');
    
    paginationBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            alert('切换到其他页面的预订数据');
        });
    });
}

/**
 * 初始化分配模块标签页
 */
function initAllocationTabs() {
    // 东四咖啡分配标签页
    const dongsiTab = document.getElementById('dongsi-allocation');
    if (dongsiTab) {
        initAllocationTab(dongsiTab, '东四咖啡');
    }
    
    // 白塔寺分配标签页
    const baitasiTab = document.getElementById('baitasi-allocation');
    if (baitasiTab) {
        initAllocationTab(baitasiTab, '白塔寺');
    }
}

/**
 * 初始化单个分配标签页
 * @param {HTMLElement} tabElement - 标签页元素
 * @param {string} storeName - 门店名称
 */
function initAllocationTab(tabElement, storeName) {
    // 添加分配按钮点击事件
    const addAllocationBtn = tabElement.querySelector('.btn');
    if (addAllocationBtn) {
        addAllocationBtn.addEventListener('click', function() {
            alert(`添加${storeName}分配项目`);
        });
    }
    
    // 时间周期选择事件
    const periodSelect = tabElement.querySelector('.finance-period');
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            const period = this.value;
            alert(`切换到${storeName}的${period}分配数据`);
        });
    }
    
    // 日期范围选择事件
    const dateInputs = tabElement.querySelectorAll('.date-input');
    if (dateInputs.length === 2) {
        dateInputs.forEach(input => {
            input.addEventListener('change', function() {
                alert(`更新${storeName}的日期范围筛选`);
            });
        });
    }
    
    // 查看和编辑按钮点击事件
    const viewBtns = tabElement.querySelectorAll('.fa-eye');
    const editBtns = tabElement.querySelectorAll('.fa-edit');
    
    viewBtns.forEach(btn => {
        btn.parentElement.addEventListener('click', function() {
            const row = this.closest('tr');
            const project = row.cells[0].textContent;
            alert(`查看${storeName}的${project}分配详情`);
        });
    });
    
    editBtns.forEach(btn => {
        btn.parentElement.addEventListener('click', function() {
            const row = this.closest('tr');
            const project = row.cells[0].textContent;
            alert(`编辑${storeName}的${project}分配信息`);
        });
    });
}

/**
 * 初始化咖啡分配计算器
 */
function initCoffeeCalculator() {
    // 检查是否存在咖啡计算器元素
    const coffeeCalculator = document.querySelector('.coffee-calculator');
    if (!coffeeCalculator) return;
    
    // 初始化输入框事件
    const posRevenueInput = document.getElementById('posRevenue');
    const selfRevenueInput = document.getElementById('selfRevenue');
    
    if (posRevenueInput && selfRevenueInput) {
        // 添加输入事件，当输入变化时自动计算
        posRevenueInput.addEventListener('input', function() {
            if (this.value && selfRevenueInput.value) {
                calculateCoffeeAllocation();
            }
        });
        
        selfRevenueInput.addEventListener('input', function() {
            if (this.value && posRevenueInput.value) {
                calculateCoffeeAllocation();
            }
        });
    }
}

/**
 * 计算咖啡分配金额
 */
function calculateCoffeeAllocation() {
    // 获取输入值
    const posRevenue = parseFloat(document.getElementById('posRevenue').value) || 0;
    const selfRevenue = parseFloat(document.getElementById('selfRevenue').value) || 0;
    
    // 常量
    const WITHDRAWAL_FEE_RATE = 0.0038; // 0.38%
    const MIN_RENT = 8000;
    const UTILITY_FEE = 1000;
    const REVENUE_PERCENTAGE_RATE = 0.15; // 15%
    
    // 计算
    const totalRevenue = posRevenue + selfRevenue;
    const withdrawalFee = posRevenue * WITHDRAWAL_FEE_RATE;
    const revenuePercentage = totalRevenue * REVENUE_PERCENTAGE_RATE;
    const actualRent = Math.max(revenuePercentage, MIN_RENT);
    const totalPayment = actualRent + UTILITY_FEE + withdrawalFee;
    const finalAmount = posRevenue - totalPayment;
    
    // 显示结果
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('withdrawalFee').textContent = formatCurrency(withdrawalFee);
    document.getElementById('revenuePercentage').textContent = formatCurrency(revenuePercentage);
    document.getElementById('actualRent').textContent = formatCurrency(actualRent);
    document.getElementById('totalPayment').textContent = formatCurrency(totalPayment);
    document.getElementById('finalAmount').textContent = formatCurrency(finalAmount);
    
    // 显示结果区域
    document.getElementById('coffeeResult').style.display = 'block';
}

/**
 * 清空咖啡计算器数据
 */
function clearCoffeeCalculator() {
    // 清空输入框
    document.getElementById('posRevenue').value = '';
    document.getElementById('selfRevenue').value = '';
    
    // 隐藏结果区域
    document.getElementById('coffeeResult').style.display = 'none';
}

/**
 * 格式化货币显示
 * @param {number} value - 要格式化的数值
 * @returns {string} 格式化后的货币字符串
 */
function formatCurrency(value) {
    return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' 元';
}

/**
 * 初始化模块加载功能
 */
function initModuleLoading() {
    debug('初始化模块加载功能');
    
    // 检查模块加载器是否存在
    if (!window.moduleLoader) {
        debug('模块加载器不存在，使用传统加载方式', 'warning');
        
        // 获取所有模块链接
        const moduleLinks = document.querySelectorAll('.nav-links a[data-module]');
        
        debug(`找到 ${moduleLinks.length} 个模块链接`);
        
        // 为每个链接添加点击事件
        moduleLinks.forEach(link => {
            const moduleName = link.getAttribute('data-module');
            debug(`设置模块链接: ${moduleName}`);
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // 获取模块名称
                const moduleName = this.getAttribute('data-module');
                debug(`点击模块: ${moduleName}`);
                
                // 加载对应模块
                loadModule(moduleName);
                
                // 更新活动链接样式
                updateActiveLink(this);
            });
        });
    } else {
        debug('使用新的模块加载器');
        
        // 获取所有模块链接
        const moduleLinks = document.querySelectorAll('.nav-links a[data-module]');
        
        debug(`找到 ${moduleLinks.length} 个模块链接`);
        
        // 为每个链接添加点击事件
        moduleLinks.forEach(link => {
            const moduleName = link.getAttribute('data-module');
            debug(`设置模块链接: ${moduleName}`);
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // 获取模块名称
                const moduleName = this.getAttribute('data-module');
                debug(`点击模块: ${moduleName}`);
                
                // 使用模块加载器加载模块
                window.moduleLoader.loadModule(moduleName);
            });
        });
    }
    
    // 添加全局错误处理
    window.addEventListener('error', function(event) {
        debug(`全局错误: ${event.error}`, 'error');
        
        const contentContainer = document.getElementById('content-container');
        if (contentContainer && contentContainer.innerHTML === '') {
            contentContainer.innerHTML = `
                <div class="error-container">
                    <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    <h2>发生错误</h2>
                    <p>加载模块时发生错误，请刷新页面重试</p>
                    <button class="btn" onclick="location.reload()">刷新页面</button>
                </div>
            `;
        }
    });
}

// 获取当前页面的基础路径
function getBasePath() {
    const path = window.location.pathname;
    return path.substring(0, path.lastIndexOf('/') + 1);
}

/**
 * 加载指定模块
 * @param {string} moduleName - 模块名称
 */
window.loadModule = async function(moduleName) {
    debug(`开始加载模块: ${moduleName}`);
    
    // 显示加载指示器
    const loader = document.getElementById('page-loader');
    if (loader) {
        loader.style.display = 'flex';
    } else {
        debug('未找到加载指示器元素', 'error');
    }
    
    // 获取内容容器
    const contentContainer = document.getElementById('content-container');
    if (!contentContainer) {
        debug('未找到内容容器元素', 'error');
        if (loader) loader.style.display = 'none';
        return;
    }
    
    try {
        // 检查模块是否存在
        if (!MODULES[moduleName]) {
            throw new Error(`模块 "${moduleName}" 不存在`);
        }
        
        // 获取模块配置
        const moduleConfig = MODULES[moduleName];
        
        // 构建完整路径
        const fullPath = new URL(moduleConfig.path, window.location.href).href;
        
        debug(`模块路径: ${moduleConfig.path}`);
        debug(`完整路径: ${fullPath}`);
        
        // 加载模块HTML
        const response = await fetch(fullPath, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`无法加载模块: ${response.status} ${response.statusText}`);
        }
        
        // 获取HTML内容
        const html = await response.text();
        
        debug(`模块 ${moduleName} 加载成功，内容长度: ${html.length}`, 'success');
        
        // 更新页面内容
        contentContainer.innerHTML = html;
        
        // 更新页面标题
        document.title = `${moduleConfig.title} - 野鹅微醺门店管理系统`;
        
        // 初始化模块内的标签页
        initTabsInModule();
        
        // 根据模块名称执行特定初始化
        switch(moduleName) {
            case 'dashboard':
                if (typeof initCharts === 'function') {
                    debug('初始化图表');
                    initCharts();
                } else {
                    debug('initCharts函数不存在', 'error');
                }
                
                if (typeof initReservationsTab === 'function') {
                    debug('初始化预订管理标签页');
                    initReservationsTab();
                } else {
                    debug('initReservationsTab函数不存在', 'error');
                }
                break;
                
            case 'inventory':
                debug('库存模块不需要特殊初始化');
                break;
                
            case 'finance':
                if (typeof initAllocationTabs === 'function') {
                    debug('初始化分配标签页');
                    initAllocationTabs();
                } else {
                    debug('initAllocationTabs函数不存在', 'error');
                }
                
                if (typeof initCoffeeCalculator === 'function') {
                    debug('初始化咖啡计算器');
                    initCoffeeCalculator();
                } else {
                    debug('initCoffeeCalculator函数不存在', 'error');
                }
                break;
                
            case 'tools':
                debug('工具模块不需要特殊初始化');
                break;
                
            case 'resources':
                debug('资源模块不需要特殊初始化');
                break;
        }
    } catch (error) {
        debug(`加载模块失败: ${error.message}`, 'error');
        contentContainer.innerHTML = `
            <div class="error-container">
                <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <h2>加载失败</h2>
                <p>${error.message}</p>
                <p>请确保您通过Web服务器访问此页面，而不是直接从文件系统打开。</p>
                <p>详情请参阅 <a href="README-SERVER.md">README-SERVER.md</a></p>
                <button class="btn" onclick="loadModule('dashboard')">返回首页</button>
            </div>
        `;
    } finally {
        // 隐藏加载指示器
        if (loader) {
            loader.style.display = 'none';
        }
    }
};

// 为了兼容性，保留原来的函数
async function loadModule(moduleName) {
    debug(`调用 loadModule: ${moduleName}`);
    
    // 如果存在新的模块加载器，则使用它
    if (window.moduleLoader) {
        debug('使用新的模块加载器');
        return window.moduleLoader.loadModule(moduleName);
    }
    
    // 否则使用传统方式
    debug('使用传统加载方式');
    return window.loadModule(moduleName);
}

/**
 * 更新活动链接样式
 * @param {HTMLElement} activeLink - 当前活动链接
 */
function updateActiveLink(activeLink) {
    debug('更新活动链接样式');
    
    // 移除所有链接的活动状态
    document.querySelectorAll('.nav-links li').forEach(item => {
        item.classList.remove('active');
    });
    
    // 为当前链接添加活动状态
    activeLink.closest('li').classList.add('active');
}

/**
 * 初始化模块内的标签页
 */
function initTabsInModule() {
    debug('初始化模块内的标签页');
    const tabLinks = document.querySelectorAll('.tabs a');
    
    debug(`找到 ${tabLinks.length} 个标签页链接`);
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取目标标签页ID
            const targetId = this.getAttribute('href');
            debug(`点击标签页: ${targetId}`);
            
            // 获取当前标签组
            const tabGroup = this.closest('.tabs');
            const allTabLinks = tabGroup.querySelectorAll('a');
            
            // 移除当前标签组中所有标签的活动状态
            allTabLinks.forEach(tabLink => {
                tabLink.classList.remove('active');
            });
            
            // 添加当前标签的活动状态
            this.classList.add('active');
            
            // 获取标签内容容器
            const tabContent = this.closest('.dashboard-tabs-container').querySelector('.tab-content');
            
            // 隐藏所有标签页
            tabContent.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            // 显示目标标签页
            const targetPane = tabContent.querySelector(targetId);
            if (targetPane) {
                targetPane.classList.add('active');
            } else {
                debug(`找不到标签页内容: ${targetId}`, 'error');
            }
        });
    });
    
    // 确保每个标签组中的第一个标签是活动的
    document.querySelectorAll('.tabs').forEach(tabGroup => {
        const firstTab = tabGroup.querySelector('a');
        const firstTabContent = firstTab?.getAttribute('href');
        
        if (firstTab && !firstTab.classList.contains('active')) {
            firstTab.classList.add('active');
            
            if (firstTabContent) {
                const tabContent = tabGroup.closest('.dashboard-tabs-container').querySelector('.tab-content');
                const firstPane = tabContent.querySelector(firstTabContent);
                
                if (firstPane) {
                    tabContent.querySelectorAll('.tab-pane').forEach(pane => {
                        pane.classList.remove('active');
                    });
                    firstPane.classList.add('active');
                }
            }
        }
    });
}

// 在文件末尾添加调试信息
debug('main.js 加载完成', 'success');