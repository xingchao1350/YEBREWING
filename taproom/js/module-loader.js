/**
 * 野鹅微醺门店管理系统 - 模块加载器
 * 用于按需加载模块和子模块
 */

// 调试日志
function debug(message, type = 'info') {
    console.log(`[MODULE-LOADER] ${message}`);
    if (window.debugLog) {
        window.debugLog(message, type);
    }
}

// 模块配置
const MODULE_CONFIG = {
    // 门店总览模块
    dashboard: {
        path: './modules/dashboard.html',
        title: '门店总览',
        subModules: {
            overview: {
                path: './modules/dashboard/overview.html',
                title: '总览数据'
            },
            schedule: {
                path: './modules/dashboard/schedule.html',
                title: '排班安排'
            },
            calendar: {
                path: './modules/dashboard/calendar.html',
                title: '活动日历'
            },
            reservations: {
                path: './modules/dashboard/reservations.html',
                title: '预订管理'
            },
            dailyReport: {
                path: './modules/dashboard/daily-report.html',
                title: '日报管理'
            }
        }
    },
    // 库存模块
    inventory: {
        path: './modules/inventory.html',
        title: '库存管理',
        subModules: {
            'draft-beer': {
                path: './modules/inventory/draft-beer.html',
                title: '生啤库存'
            },
            'canned-beer': {
                path: './modules/inventory/canned-beer.html',
                title: '易拉罐库存'
            },
            'other-alcohol': {
                path: './modules/inventory/other-alcohol.html',
                title: '其他酒水库存'
            },
            'soft-drinks': {
                path: './modules/inventory/soft-drinks.html',
                title: '软饮库存'
            },
            'materials': {
                path: './modules/inventory/materials.html',
                title: '物料库存'
            }
        }
    },
    // 财务模块
    finance: {
        path: './modules/finance.html',
        title: '财务',
        subModules: {
            overview: {
                path: './modules/finance/overview.html',
                title: '发起报销'
            },
            income: {
                path: './modules/finance/income.html',
                title: '收入管理'
            },
            expenses: {
                path: './modules/finance/expenses.html',
                title: '支出管理'
            },
            dongsi: {
                path: './modules/finance/dongsi.html',
                title: '东四咖啡合作'
            },
            baitasi: {
                path: './modules/finance/baitasi.html',
                title: '白塔寺合作'
            },
            reports: {
                path: './modules/finance/reports.html',
                title: '财务报表'
            }
        }
    },
    // 工具模块
    tools: {
        path: './modules/tools.html',
        title: '工具',
        subModules: {
            'drink-menu': {
                path: './modules/tools/drink-menu.html',
                title: '酒单设计'
            },
            'food-menu': {
                path: './modules/tools/food-menu.html',
                title: '餐单设计'
            },
            'card-design': {
                path: './modules/tools/card-design.html',
                title: '卡片设计'
            },
            'poster-design': {
                path: './modules/tools/poster-design.html',
                title: '海报设计'
            },
            'other-tools': {
                path: './modules/tools/other-tools.html',
                title: '店长工具'
            }
        }
    },
    // 资源模块
    resources: {
        path: './modules/resources.html',
        title: '资源',
        subModules: {
            training: {
                path: './modules/resources/training.html',
                title: '员工资源'
            },
            templates: {
                path: './modules/resources/templates.html',
                title: '品牌资源'
            },
            media: {
                path: './modules/resources/media.html',
                title: '行业资源'
            },
            documents: {
                path: './modules/resources/documents.html',
                title: '门店档案'
            }
        }
    }
};

/**
 * 加载模块
 * @param {string} moduleName - 模块名称
 * @returns {Promise<void>}
 */
async function loadModule(moduleName) {
    debug(`加载模块: ${moduleName}`);
    
    try {
        // 获取内容容器
        const contentContainer = document.getElementById('content-container');
        if (!contentContainer) {
            throw new Error('找不到内容容器');
        }
        
        // 显示加载指示器
        contentContainer.innerHTML = `
            <div class="module-loader">
                <div class="spinner"></div>
                <p>加载中...</p>
            </div>
        `;
        
        // 加载模块HTML
        const moduleUrl = `modules/${moduleName}.html`;
        const response = await fetch(moduleUrl);
        
        if (!response.ok) {
            throw new Error(`加载模块失败: ${response.status} ${response.statusText}`);
        }
        
        const html = await response.text();
        
        // 更新内容
        contentContainer.innerHTML = html;
        debug(`模块HTML已加载: ${moduleName}`);
        
        // 更新活动链接
        updateActiveLink(moduleName);
        
        // 初始化模块内的标签页
        initTabsInModule(contentContainer);
        
        // 查找默认子模块
        const defaultSubModule = contentContainer.querySelector('[data-default-submodule]');
        if (defaultSubModule) {
            const subModulePath = defaultSubModule.getAttribute('data-default-submodule');
            if (subModulePath) {
                debug(`加载默认子模块: ${subModulePath}`);
                try {
                    await loadSubModule(subModulePath, defaultSubModule);
                    defaultSubModule.setAttribute('data-loaded', 'true');
                    debug(`默认子模块加载完成: ${subModulePath}`);
                } catch (subModuleError) {
                    debug(`默认子模块加载失败: ${subModuleError.message}`, 'error');
                }
            }
        } else {
            debug('没有找到默认子模块');
            
            // 尝试加载第一个标签页的内容
            const firstTabContent = contentContainer.querySelector('.tab-pane.active');
            if (firstTabContent && !firstTabContent.getAttribute('data-loaded')) {
                const tabId = firstTabContent.id;
                if (tabId) {
                    debug(`尝试加载第一个标签页内容: ${moduleName}/${tabId}.html`);
                    try {
                        await loadSubModule(`${moduleName}/${tabId}.html`, firstTabContent);
                        firstTabContent.setAttribute('data-loaded', 'true');
                        debug(`第一个标签页内容加载完成: ${moduleName}/${tabId}.html`);
                    } catch (tabContentError) {
                        debug(`第一个标签页内容加载失败: ${tabContentError.message}`, 'error');
                    }
                }
            }
        }
        
        // 触发模块加载完成事件
        const event = new CustomEvent('moduleLoaded', { detail: { moduleName } });
        document.dispatchEvent(event);
        
        debug(`模块加载完成: ${moduleName}`);
    } catch (error) {
        debug(`加载模块失败: ${error.message}`, 'error');
        showError(`加载模块失败: ${error.message}`);
    }
}

/**
 * 加载子模块
 * @param {string} subModulePath - 子模块路径
 * @param {HTMLElement} container - 容器元素
 * @returns {Promise<void>}
 */
async function loadSubModule(subModulePath, container) {
    debug(`加载子模块: ${subModulePath}`);
    
    try {
        if (!container) {
            throw new Error('子模块容器不存在');
        }
        
        // 显示加载指示器
        container.innerHTML = `
            <div class="submodule-loader">
                <div class="spinner"></div>
                <p>加载中...</p>
            </div>
        `;
        
        // 加载子模块HTML
        const subModuleUrl = `modules/${subModulePath}`;
        debug(`请求子模块URL: ${subModuleUrl}`);
        
        const response = await fetch(subModuleUrl);
        
        if (!response.ok) {
            throw new Error(`加载子模块失败: ${response.status} ${response.statusText}`);
        }
        
        const html = await response.text();
        
        // 更新容器内容
        container.innerHTML = html;
        debug(`子模块HTML已加载: ${subModulePath}`);
        
        // 初始化子模块内的标签页
        setTimeout(() => {
            initSubModuleTabs();
        }, 100);
        
        // 触发子模块加载完成事件
        const event = new CustomEvent('subModuleLoaded', { 
            detail: { 
                path: subModulePath,
                container: container
            } 
        });
        document.dispatchEvent(event);
        
        debug(`子模块加载完成: ${subModulePath}`);
    } catch (error) {
        debug(`加载子模块失败: ${error.message}`, 'error');
        
        // 显示错误信息
        if (container) {
            container.innerHTML = `
                <div class="error-container">
                    <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    <h2>子模块加载失败</h2>
                    <p>${error.message}</p>
                    <button class="btn" onclick="moduleLoader.loadSubModule('${subModulePath}', this.closest('.tab-pane'))">重试</button>
                </div>
            `;
        }
    }
}

/**
 * 更新活动链接
 * @param {string} moduleName - 活动模块名称
 */
function updateActiveLink(moduleName) {
    // 移除所有活动类
    document.querySelectorAll('.nav-links li').forEach(item => {
        item.classList.remove('active');
    });
    
    // 添加活动类到当前模块链接
    const activeLink = document.querySelector(`.nav-links a[data-module="${moduleName}"]`);
    if (activeLink) {
        activeLink.closest('li').classList.add('active');
    }
}

/**
 * 初始化模块内的标签页
 * @param {HTMLElement} moduleContainer - 模块容器元素
 */
function initTabsInModule(moduleContainer) {
    debug('初始化模块内的标签页');
    
    if (!moduleContainer) {
        debug('模块容器不存在，无法初始化标签页', 'error');
        return;
    }
    
    // 查找所有标签页链接
    const tabLinks = moduleContainer.querySelectorAll('.tab-item a, .tabs a');
    debug(`找到 ${tabLinks.length} 个标签页链接`);
    
    if (tabLinks.length === 0) {
        debug('没有找到标签页链接，跳过初始化', 'warn');
        return;
    }
    
    // 移除所有现有的点击事件处理程序
    tabLinks.forEach(link => {
        const clone = link.cloneNode(true);
        if (link.parentNode) {
            link.parentNode.replaceChild(clone, link);
        }
    });
    
    // 重新获取所有标签链接（因为我们刚刚替换了它们）
    const newTabLinks = moduleContainer.querySelectorAll('.tab-item a, .tabs a');
    debug(`重新获取到 ${newTabLinks.length} 个标签页链接`);
    
    // 为每个标签页链接添加点击事件
    newTabLinks.forEach(link => {
        link.addEventListener('click', async function(event) {
            event.preventDefault();
            
            const href = this.getAttribute('href');
            const tabId = href.startsWith('#') ? href.substring(1) : href;
            debug(`点击标签页: ${this.textContent.trim()} (${tabId})`);
            
            // 获取当前标签组
            const tabGroup = this.closest('.tabs, .settings-tabs');
            if (!tabGroup) {
                debug('找不到标签组', 'error');
                return;
            }
            
            // 获取内容容器
            const tabsContainer = this.closest('.dashboard-tabs-container, .module-tabs-container');
            if (!tabsContainer) {
                debug('找不到标签容器', 'error');
                return;
            }
            
            const contentContainer = tabsContainer.querySelector('.tab-content');
            if (!contentContainer) {
                debug('找不到内容容器', 'error');
                return;
            }
            
            // 移除所有标签的active类
            tabGroup.querySelectorAll('a').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // 隐藏所有标签内容
            contentContainer.querySelectorAll('.tab-pane').forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            // 为当前标签添加active类
            this.classList.add('active');
            
            // 显示对应的标签内容
            const targetContent = contentContainer.querySelector(`#${tabId}`);
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.style.display = 'block';
                debug(`显示标签内容: #${tabId}`);
                
                // 检查是否需要加载子模块
                if (!targetContent.getAttribute('data-loaded')) {
                    // 检查是否有指定的子模块路径
                    const submodulePath = targetContent.getAttribute('data-submodule') || targetContent.getAttribute('data-default-submodule');
                    if (submodulePath) {
                        debug(`加载指定子模块: ${submodulePath}`);
                        try {
                            await loadSubModule(submodulePath, targetContent);
                            targetContent.setAttribute('data-loaded', 'true');
                        } catch (error) {
                            debug(`加载指定子模块失败: ${error.message}`, 'error');
                        }
                    } else {
                        // 获取当前主模块
                        const activeNavLink = document.querySelector('.nav-links li.active a');
                        if (activeNavLink) {
                            const moduleName = activeNavLink.getAttribute('data-module');
                            if (moduleName) {
                                debug(`加载子模块: ${moduleName}/${tabId}.html`);
                                try {
                                    await loadSubModule(`${moduleName}/${tabId}.html`, targetContent);
                                    targetContent.setAttribute('data-loaded', 'true');
                                } catch (error) {
                                    debug(`加载子模块失败: ${error.message}`, 'error');
                                }
                            }
                        }
                    }
                }
                
                // 触发一个自定义事件，通知其他组件标签已更改
                const tabChangeEvent = new CustomEvent('tabChange', {
                    detail: { tabId: tabId }
                });
                document.dispatchEvent(tabChangeEvent);
            } else {
                debug(`找不到目标标签内容: #${tabId}`, 'error');
            }
        });
    });
    
    // 确保第一个标签是活动的
    const activeTab = moduleContainer.querySelector('.tab-item a.active, .tabs a.active');
    if (!activeTab) {
        const firstTab = moduleContainer.querySelector('.tab-item a, .tabs a');
        if (firstTab) {
            debug(`激活默认标签页: ${firstTab.textContent.trim()}`);
            // 模拟点击第一个标签
            firstTab.click();
        }
    } else {
        debug(`已有活动标签页: ${activeTab.textContent.trim()}`);
        // 确保对应的内容也是可见的
        const href = activeTab.getAttribute('href');
        const tabId = href.startsWith('#') ? href.substring(1) : href;
        const tabsContainer = activeTab.closest('.dashboard-tabs-container, .module-tabs-container');
        if (tabsContainer) {
            const contentContainer = tabsContainer.querySelector('.tab-content');
            if (contentContainer) {
                const targetContent = contentContainer.querySelector(`#${tabId}`);
                if (targetContent) {
                    targetContent.classList.add('active');
                    targetContent.style.display = 'block';
                    
                    // 检查是否需要加载子模块
                    if (!targetContent.getAttribute('data-loaded')) {
                        // 模拟点击活动标签，触发子模块加载
                        setTimeout(() => {
                            activeTab.click();
                        }, 100);
                    }
                }
            }
        }
    }
}

/**
 * 初始化子模块内的标签页（如category-tab等）
 */
function initSubModuleTabs() {
    debug('初始化子模块内的标签页');
    
    // 初始化category-tab类型的标签页
    const categoryTabs = document.querySelectorAll('.category-tab');
    debug(`找到 ${categoryTabs.length} 个分类标签页`);
    
    if (categoryTabs.length === 0) {
        debug('没有找到分类标签页，跳过初始化', 'warn');
        return;
    }
    
    // 移除所有现有的点击事件处理程序
    categoryTabs.forEach(tab => {
        const clone = tab.cloneNode(true);
        if (tab.parentNode) {
            tab.parentNode.replaceChild(clone, tab);
        }
    });
    
    // 重新获取所有分类标签（因为我们刚刚替换了它们）
    const newCategoryTabs = document.querySelectorAll('.category-tab');
    debug(`重新获取到 ${newCategoryTabs.length} 个分类标签页`);
    
    // 为所有分类标签添加点击事件
    newCategoryTabs.forEach(tab => {
        tab.addEventListener('click', function(event) {
            debug(`点击分类标签: ${this.textContent.trim()} (${this.dataset.category})`);
            
            // 获取当前标签组
            const tabGroup = this.closest('.category-tabs');
            if (!tabGroup) {
                debug('找不到分类标签组', 'error');
                return;
            }
            
            // 移除所有标签的active类
            tabGroup.querySelectorAll('.category-tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // 为当前标签添加active类
            this.classList.add('active');
            
            const category = this.dataset.category;
            debug(`选择分类: ${category}`);
            
            // 如果有筛选功能，执行筛选
            try {
                if (category === 'all') {
                    // 显示所有项目
                    const items = document.querySelectorAll('[data-category]');
                    let itemCount = 0;
                    
                    items.forEach(item => {
                        if (item.classList.contains('category-tab')) return; // 跳过标签本身
                        item.style.display = '';
                        itemCount++;
                    });
                    
                    debug(`显示所有项目: ${itemCount} 个`);
                } else {
                    // 只显示匹配类别的项目
                    let matchCount = 0;
                    let totalCount = 0;
                    
                    document.querySelectorAll('[data-category]').forEach(item => {
                        if (item.classList.contains('category-tab')) return; // 跳过标签本身
                        totalCount++;
                        
                        if (item.dataset.category === category) {
                            item.style.display = '';
                            matchCount++;
                        } else {
                            item.style.display = 'none';
                        }
                    });
                    
                    debug(`筛选项目: 匹配 ${matchCount}/${totalCount} 个`);
                }
                
                // 触发一个自定义事件，通知其他组件分类已更改
                const categoryChangeEvent = new CustomEvent('categoryChange', {
                    detail: { category: category }
                });
                document.dispatchEvent(categoryChangeEvent);
                
            } catch (error) {
                debug(`筛选项目出错: ${error.message}`, 'error');
            }
        });
    });
    
    // 确保每个分类标签组中的第一个标签是活动的
    document.querySelectorAll('.category-tabs').forEach(tabGroup => {
        const activeTab = tabGroup.querySelector('.category-tab.active');
        if (!activeTab) {
            const firstTab = tabGroup.querySelector('.category-tab');
            if (firstTab) {
                firstTab.classList.add('active');
                debug(`激活默认分类标签: ${firstTab.textContent.trim()} (${firstTab.dataset.category})`);
                
                // 模拟点击第一个标签
                firstTab.click();
            }
        }
    });
}

/**
 * 显示错误信息
 * @param {string} message - 错误信息
 */
function showError(message) {
    debug(`显示错误: ${message}`, 'error');
    
    const contentContainer = document.getElementById('content-container');
    if (!contentContainer) {
        debug('找不到内容容器，无法显示错误信息', 'error');
        return;
    }
    
    contentContainer.innerHTML = `
        <div class="error-container">
            <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <h2>操作失败</h2>
            <p>${message}</p>
            <p>请检查网络连接或联系系统管理员。</p>
            <button class="btn" onclick="location.reload()">刷新页面</button>
        </div>
    `;
}

// 导出模块加载器
window.moduleLoader = {
    loadModule,
    loadSubModule,
    initTabsInModule,
    initSubModuleTabs,
    showError
};

// 初始化
debug('模块加载器初始化完成'); 