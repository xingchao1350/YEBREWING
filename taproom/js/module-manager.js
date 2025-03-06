/**
 * 模块管理器 - 负责模块的增删改查
 */
class ModuleManager {
  constructor() {
    this.modules = [];
    this.templates = {};
    this.init();
  }

  /**
   * 初始化模块管理器
   */
  async init() {
    // 加载模块配置
    await this.loadModules();
    // 加载模块模板
    await this.loadTemplates();
    
    // 确保模块列表容器结构正确
    this.setupModuleListContainer();
    
    // 渲染模块列表
    this.renderModuleList();
    // 绑定事件
    this.bindEvents();
  }

  /**
   * 设置模块列表容器结构
   */
  setupModuleListContainer() {
    const moduleCard = document.querySelector('.module-card');
    if (!moduleCard) return;
    
    // 检查是否已存在模块列表容器
    let listContainer = moduleCard.querySelector('.module-list-container');
    if (!listContainer) {
      listContainer = document.createElement('div');
      listContainer.className = 'module-list-container';
      moduleCard.appendChild(listContainer);
    }
    
    // 检查是否已存在模块列表头部
    let listHeader = listContainer.querySelector('.module-list-header');
    if (!listHeader) {
      listHeader = document.createElement('div');
      listHeader.className = 'module-list-header';
      listHeader.style.display = 'flex';
      listHeader.style.justifyContent = 'space-between';
      listHeader.style.alignItems = 'center';
      listHeader.style.marginBottom = '15px';
      
      const title = document.createElement('h4');
      title.textContent = '模块列表';
      title.style.margin = '0';
      
      const actions = document.createElement('div');
      actions.className = 'actions';
      
      const addButton = document.createElement('button');
      addButton.id = 'add-new-module';
      addButton.className = 'btn btn-primary';
      addButton.innerHTML = '<i class="fas fa-plus"></i> 新建模块';
      
      actions.appendChild(addButton);
      listHeader.appendChild(title);
      listHeader.appendChild(actions);
      listContainer.appendChild(listHeader);
    }
    
    // 检查是否已存在模块列表表格
    let table = listContainer.querySelector('table.module-list');
    if (!table) {
      table = document.createElement('table');
      table.className = 'module-list';
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      
      const thead = document.createElement('thead');
      thead.innerHTML = `
        <tr>
          <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid #E5E7EB; background-color: #F9FAFB; font-weight: 600; color: #4B5563;">模块名称</th>
          <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid #E5E7EB; background-color: #F9FAFB; font-weight: 600; color: #4B5563;">显示顺序</th>
          <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid #E5E7EB; background-color: #F9FAFB; font-weight: 600; color: #4B5563;">状态</th>
          <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid #E5E7EB; background-color: #F9FAFB; font-weight: 600; color: #4B5563;">操作</th>
        </tr>
      `;
      
      const tbody = document.createElement('tbody');
      tbody.id = 'module-list-body';
      
      table.appendChild(thead);
      table.appendChild(tbody);
      listContainer.appendChild(table);
    }
  }

  /**
   * 加载模块配置
   */
  async loadModules() {
    try {
      // 从localStorage加载模块配置
      const savedModules = localStorage.getItem('custom_modules');
      if (savedModules) {
        this.modules = JSON.parse(savedModules);
      } else {
        // 如果没有自定义模块，则加载默认模块配置
        const response = await fetch('js/default-modules.json');
        if (response.ok) {
          const defaultModules = await response.json();
          this.modules = defaultModules;
          // 保存到localStorage
          this.saveModules();
        }
      }
    } catch (error) {
      console.error('加载模块配置失败:', error);
      // 使用内置的默认配置
      this.modules = MODULE_CONFIG;
      this.saveModules();
    }
  }

  /**
   * 加载模块模板
   */
  async loadTemplates() {
    try {
      const response = await fetch('js/module-templates.json');
      if (response.ok) {
        this.templates = await response.json();
        console.log('成功加载模板:', this.templates);
      }
    } catch (error) {
      console.error('加载模块模板失败:', error);
      // 使用内置的默认模板
      this.templates = {
        default: {
          id: "default",
          name: "默认模板",
          html: `<div class="module-container">
                  <h2>{{模块名称}}</h2>
                  <div class="content">
                    <!-- 内容将在这里显示 -->
                  </div>
                </div>`,
          css: `.module-container { padding: 20px; }`,
          js: `console.log("模块已加载");`
        },
        tabbed: {
          id: "tabbed",
          name: "标签页模板",
          html: `<div class="tabbed-module">
                  <div class="tabs">
                    <!-- 标签页将在这里显示 -->
                  </div>
                  <div class="tab-content">
                    <!-- 标签内容将在这里显示 -->
                  </div>
                </div>`,
          css: `.tabbed-module { padding: 20px; }`,
          js: `console.log("标签页模块已加载");`
        }
      };
    }
  }

  /**
   * 保存模块配置到localStorage
   */
  saveModules() {
    localStorage.setItem('custom_modules', JSON.stringify(this.modules));
    // 触发模块更新事件
    document.dispatchEvent(new CustomEvent('modulesUpdated', {
      detail: { modules: this.modules }
    }));
  }

  /**
   * 渲染模块列表
   */
  renderModuleList() {
    const listBody = document.getElementById('module-list-body');
    if (!listBody) return;

    // 清空列表
    listBody.innerHTML = '';

    // 按顺序排序模块
    const sortedModules = [...this.modules].sort((a, b) => a.order - b.order);

    // 添加刷新和重置按钮到模块列表上方
    const moduleListContainer = document.querySelector('.module-list-container');
    if (moduleListContainer) {
      // 检查是否已存在按钮容器
      let headerActions = document.querySelector('.module-list-header .actions');
      if (headerActions) {
        // 检查是否已存在刷新按钮
        let refreshButton = document.getElementById('refresh-module-list');
        if (!refreshButton) {
          refreshButton = document.createElement('button');
          refreshButton.id = 'refresh-module-list';
          refreshButton.className = 'btn btn-outline-secondary';
          refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> 刷新';
          refreshButton.style.marginRight = '10px';
          refreshButton.addEventListener('click', () => {
            this.loadModules().then(() => {
              this.renderModuleList();
              this.updateMainInterface();
              this.showNotification('模块列表已刷新');
            });
          });
          headerActions.prepend(refreshButton);
        }
        
        // 检查是否已存在重置按钮
        let resetButton = document.getElementById('reset-module-list');
        if (!resetButton) {
          resetButton = document.createElement('button');
          resetButton.id = 'reset-module-list';
          resetButton.className = 'btn btn-outline-danger';
          resetButton.innerHTML = '<i class="fas fa-trash-alt"></i> 重置';
          resetButton.style.marginRight = '10px';
          resetButton.addEventListener('click', () => {
            if (confirm('确定要重置所有模块配置吗？这将删除所有自定义设置并恢复默认配置。')) {
              this.resetModules();
            }
          });
          headerActions.prepend(resetButton);
        }
      }
    }

    // 渲染每个模块
    sortedModules.forEach(module => {
      const row = document.createElement('tr');
      row.dataset.moduleId = module.id;
      
      row.innerHTML = `
        <td>
          <i class="${module.icon}"></i>
          <span class="module-name">${module.name}</span>
        </td>
        <td>
          <div class="order-controls">
            <button class="btn btn-sm btn-outline-secondary move-up" title="上移">
              <i class="fas fa-arrow-up"></i>
            </button>
            <span class="order-number">${module.order}</span>
            <button class="btn btn-sm btn-outline-secondary move-down" title="下移">
              <i class="fas fa-arrow-down"></i>
            </button>
          </div>
        </td>
        <td>
          <div class="custom-switch">
            <input type="checkbox" id="module-status-${module.id}" 
                  class="module-status" ${module.enabled ? 'checked' : ''}>
            <label for="module-status-${module.id}">
              ${module.enabled ? '启用' : '禁用'}
            </label>
          </div>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm btn-primary edit-module" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-info submodules-module" title="子模块">
              <i class="fas fa-sitemap"></i>
            </button>
            <button class="btn btn-sm btn-warning code-module" title="自定义代码">
              <i class="fas fa-code"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-module" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      
      listBody.appendChild(row);
    });
    
    console.log('模块列表已渲染，共 ' + sortedModules.length + ' 个模块');
  }

  /**
   * 重置模块配置
   */
  async resetModules() {
    try {
      // 清除localStorage中的模块配置
      localStorage.removeItem('custom_modules');
      console.log('已清除localStorage中的模块配置');
      
      // 重新加载默认配置
      await this.loadModules();
      
      // 刷新界面
      this.renderModuleList();
      this.updateMainInterface();
      
      this.showNotification('模块配置已重置为默认值');
      
      // 刷新页面
      if (confirm('模块配置已重置。是否刷新页面以应用更改？')) {
        window.location.reload();
      }
    } catch (error) {
      console.error('重置模块配置失败:', error);
      this.showNotification('重置模块配置失败: ' + error.message, 'error');
    }
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 添加新模块按钮
    const addButton = document.getElementById('add-new-module');
    if (addButton) {
      addButton.addEventListener('click', () => this.showModuleForm());
    }

    // 模块列表事件委托
    const listBody = document.getElementById('module-list-body');
    if (listBody) {
      listBody.addEventListener('click', (event) => {
        const target = event.target.closest('button');
        if (!target) return;

        const row = target.closest('tr');
        const moduleId = row.dataset.moduleId;
        const module = this.getModuleById(moduleId);

        if (target.classList.contains('edit-module')) {
          this.showModuleForm(module);
        } else if (target.classList.contains('delete-module')) {
          this.confirmDeleteModule(module);
        } else if (target.classList.contains('submodules-module')) {
          this.showSubModuleManager(module);
        } else if (target.classList.contains('code-module')) {
          this.showCodeEditor(module);
        } else if (target.classList.contains('move-up')) {
          this.moveModuleUp(module);
        } else if (target.classList.contains('move-down')) {
          this.moveModuleDown(module);
        }
      });

      // 模块状态切换
      listBody.addEventListener('change', (event) => {
        if (event.target.classList.contains('module-status')) {
          const row = event.target.closest('tr');
          const moduleId = row.dataset.moduleId;
          const module = this.getModuleById(moduleId);
          
          module.enabled = event.target.checked;
          this.saveModules();
          
          // 更新标签文本
          const label = event.target.nextElementSibling;
          if (label) {
            label.textContent = module.enabled ? '启用' : '禁用';
          }
          
          // 显示状态变更通知
          this.showNotification(`模块"${module.name}"已${module.enabled ? '启用' : '禁用'}`);
          
          // 刷新模块列表以确保界面更新
          this.renderModuleList();
        }
      });
    }
  }

  /**
   * 根据ID获取模块
   */
  getModuleById(id) {
    return this.modules.find(module => module.id === id);
  }

  /**
   * 显示模块表单（新建或编辑）
   */
  showModuleForm(module = null) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    // 创建模态框内容
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.borderRadius = '8px';
    modalContent.style.width = '600px';
    modalContent.style.maxWidth = '90%';
    modalContent.style.maxHeight = '90vh';
    modalContent.style.overflow = 'auto';
    modalContent.style.padding = '20px';
    modalContent.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

    // 创建表单
    const form = document.createElement('form');
    form.id = 'module-form';
    
    // 表单标题
    const title = document.createElement('h3');
    title.textContent = module ? '编辑模块' : '新建模块';
    title.style.marginBottom = '20px';
    title.style.borderBottom = '1px solid #E5E7EB';
    title.style.paddingBottom = '10px';
    
    form.appendChild(title);
    
    // 模块ID（隐藏字段）
    const idField = document.createElement('input');
    idField.type = 'hidden';
    idField.name = 'id';
    idField.value = module ? module.id : `module-${Date.now()}`;
    form.appendChild(idField);
    
    // 模块名称
    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';
    nameGroup.style.marginBottom = '15px';
    
    const nameLabel = document.createElement('label');
    nameLabel.htmlFor = 'module-name';
    nameLabel.textContent = '模块名称';
    nameLabel.style.display = 'block';
    nameLabel.style.marginBottom = '5px';
    nameLabel.style.fontWeight = '500';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'module-name';
    nameInput.name = 'name';
    nameInput.className = 'form-control';
    nameInput.value = module ? module.name : '';
    nameInput.required = true;
    nameInput.style.width = '100%';
    nameInput.style.padding = '8px';
    nameInput.style.border = '1px solid #E5E7EB';
    nameInput.style.borderRadius = '4px';
    
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    form.appendChild(nameGroup);
    
    // 模块图标
    const iconGroup = document.createElement('div');
    iconGroup.className = 'form-group';
    iconGroup.style.marginBottom = '15px';
    
    const iconLabel = document.createElement('label');
    iconLabel.htmlFor = 'module-icon';
    iconLabel.textContent = '模块图标';
    iconLabel.style.display = 'block';
    iconLabel.style.marginBottom = '5px';
    iconLabel.style.fontWeight = '500';
    
    const iconInput = document.createElement('input');
    iconInput.type = 'text';
    iconInput.id = 'module-icon';
    iconInput.name = 'icon';
    iconInput.className = 'form-control';
    iconInput.value = module ? module.icon : 'fas fa-cube';
    iconInput.required = true;
    iconInput.style.width = '100%';
    iconInput.style.padding = '8px';
    iconInput.style.border = '1px solid #E5E7EB';
    iconInput.style.borderRadius = '4px';
    
    const iconHelp = document.createElement('small');
    iconHelp.className = 'form-text';
    iconHelp.textContent = '使用FontAwesome图标类名，例如: fas fa-chart-bar';
    iconHelp.style.display = 'block';
    iconHelp.style.marginTop = '5px';
    iconHelp.style.fontSize = '12px';
    iconHelp.style.color = '#6B7280';
    
    iconGroup.appendChild(iconLabel);
    iconGroup.appendChild(iconInput);
    iconGroup.appendChild(iconHelp);
    form.appendChild(iconGroup);
    
    // 模块路径
    const pathGroup = document.createElement('div');
    pathGroup.className = 'form-group';
    pathGroup.style.marginBottom = '15px';
    
    const pathLabel = document.createElement('label');
    pathLabel.htmlFor = 'module-path';
    pathLabel.textContent = '模块路径';
    pathLabel.style.display = 'block';
    pathLabel.style.marginBottom = '5px';
    pathLabel.style.fontWeight = '500';
    
    const pathInput = document.createElement('input');
    pathInput.type = 'text';
    pathInput.id = 'module-path';
    pathInput.name = 'path';
    pathInput.className = 'form-control';
    pathInput.value = module ? module.path : '';
    pathInput.style.width = '100%';
    pathInput.style.padding = '8px';
    pathInput.style.border = '1px solid #E5E7EB';
    pathInput.style.borderRadius = '4px';
    
    const pathHelp = document.createElement('small');
    pathHelp.className = 'form-text';
    pathHelp.textContent = '模块的路径，例如: modules/dashboard.html';
    pathHelp.style.display = 'block';
    pathHelp.style.marginTop = '5px';
    pathHelp.style.fontSize = '12px';
    pathHelp.style.color = '#6B7280';
    
    pathGroup.appendChild(pathLabel);
    pathGroup.appendChild(pathInput);
    pathGroup.appendChild(pathHelp);
    form.appendChild(pathGroup);
    
    // 模块模板
    const templateGroup = document.createElement('div');
    templateGroup.className = 'form-group';
    templateGroup.style.marginBottom = '15px';
    
    const templateLabel = document.createElement('label');
    templateLabel.htmlFor = 'module-template';
    templateLabel.textContent = '模块模板';
    templateLabel.style.display = 'block';
    templateLabel.style.marginBottom = '5px';
    templateLabel.style.fontWeight = '500';
    
    const templateSelect = document.createElement('select');
    templateSelect.id = 'module-template';
    templateSelect.name = 'template';
    templateSelect.className = 'form-control';
    templateSelect.style.width = '100%';
    templateSelect.style.padding = '8px';
    templateSelect.style.border = '1px solid #E5E7EB';
    templateSelect.style.borderRadius = '4px';
    
    // 添加默认选项
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '选择模板...';
    templateSelect.appendChild(defaultOption);
    
    // 添加模板选项
    if (this.templates) {
      // 如果templates是对象，转换为数组
      const templatesArray = Object.keys(this.templates).map(key => {
        return {
          id: key,
          ...this.templates[key]
        };
      });
      
      templatesArray.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.name;
        option.selected = module && module.template === template.id;
        templateSelect.appendChild(option);
      });
    }
    
    templateGroup.appendChild(templateLabel);
    templateGroup.appendChild(templateSelect);
    form.appendChild(templateGroup);
    
    // 启用状态
    const enabledGroup = document.createElement('div');
    enabledGroup.className = 'form-group';
    enabledGroup.style.marginBottom = '15px';
    
    const enabledCheck = document.createElement('input');
    enabledCheck.type = 'checkbox';
    enabledCheck.id = 'module-enabled';
    enabledCheck.name = 'enabled';
    enabledCheck.checked = module ? module.enabled : true;
    enabledCheck.style.marginRight = '8px';
    
    const enabledLabel = document.createElement('label');
    enabledLabel.htmlFor = 'module-enabled';
    enabledLabel.textContent = '启用模块';
    enabledLabel.style.fontWeight = '500';
    
    enabledGroup.appendChild(enabledCheck);
    enabledGroup.appendChild(enabledLabel);
    form.appendChild(enabledGroup);
    
    // 按钮组
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'form-group';
    buttonGroup.style.marginTop = '20px';
    buttonGroup.style.display = 'flex';
    buttonGroup.style.justifyContent = 'flex-end';
    buttonGroup.style.gap = '10px';
    
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'btn btn-secondary';
    cancelButton.textContent = '取消';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.backgroundColor = '#9CA3AF';
    cancelButton.style.color = '#fff';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.cursor = 'pointer';
    
    const saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.className = 'btn btn-primary';
    saveButton.textContent = '保存';
    saveButton.style.padding = '8px 16px';
    saveButton.style.backgroundColor = '#6366F1';
    saveButton.style.color = '#fff';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '4px';
    saveButton.style.cursor = 'pointer';
    
    buttonGroup.appendChild(cancelButton);
    buttonGroup.appendChild(saveButton);
    form.appendChild(buttonGroup);
    
    // 添加表单到模态框
    modalContent.appendChild(form);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // 取消按钮事件
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 表单提交事件
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const moduleData = {
            id: formData.get('id'),
            name: formData.get('name'),
            icon: formData.get('icon'),
            path: formData.get('path'),
            template: formData.get('template'),
            enabled: formData.get('enabled') === 'on',
            order: module ? module.order : this.modules.length + 1,
            subModules: module ? module.subModules : [],
            customCode: module ? module.customCode : {
                html: '',
                css: '',
                js: ''
            }
        };
        
        console.log('保存模块数据:', moduleData);
        
        if (module) {
            // 更新现有模块
            const index = this.modules.findIndex(m => m.id === module.id);
            if (index !== -1) {
                console.log(`更新模块 ${module.id} (索引: ${index})`);
                console.log('旧数据:', this.modules[index]);
                this.modules[index] = moduleData;
                console.log('新数据:', this.modules[index]);
            } else {
                console.error(`找不到要更新的模块: ${module.id}`);
            }
        } else {
            // 添加新模块
            console.log('添加新模块');
            this.modules.push(moduleData);
        }
        
        // 保存并刷新
        this.saveModules();
        
        // 确保界面更新
        setTimeout(() => {
            console.log('延迟刷新模块列表');
            this.renderModuleList();
            // 尝试更新主界面
            this.updateMainInterface();
        }, 100);
        
        // 关闭模态框
        document.body.removeChild(modal);
        
        // 添加成功提示
        this.showNotification(module ? '模块更新成功' : '模块添加成功');
        
        // 强制刷新页面以确保所有更改生效
        if (confirm('模块已' + (module ? '更新' : '添加') + '成功。是否刷新页面以应用更改？')) {
            window.location.reload();
        }
    });
    
    // 聚焦到名称输入框
    nameInput.focus();
  }

  /**
   * 显示通知消息
   */
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '4px';
    notification.style.backgroundColor = type === 'success' ? '#10B981' : '#EF4444';
    notification.style.color = 'white';
    notification.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    notification.style.zIndex = '9999';
    
    document.body.appendChild(notification);
    
    // 3秒后自动消失
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 500);
    }, 3000);
  }

  /**
   * 确认删除模块
   */
  confirmDeleteModule(module) {
    if (confirm(`确定要删除模块"${module.name}"吗？此操作不可撤销。`)) {
      const index = this.modules.findIndex(m => m.id === module.id);
      if (index !== -1) {
        this.modules.splice(index, 1);
        
        // 重新排序
        this.modules.forEach((m, i) => {
          m.order = i + 1;
        });
        
        this.saveModules();
        this.renderModuleList();
        
        // 显示删除成功通知
        this.showNotification(`模块"${module.name}"已删除`, 'success');
      }
    }
  }

  /**
   * 显示子模块管理器
   */
  showSubModuleManager(module) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    // 创建模态框内容
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.borderRadius = '8px';
    modalContent.style.width = '800px';
    modalContent.style.maxWidth = '90%';
    modalContent.style.maxHeight = '90vh';
    modalContent.style.overflow = 'auto';
    modalContent.style.padding = '20px';
    modalContent.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

    // 创建标题
    const title = document.createElement('h3');
    title.textContent = `${module.name} - 子模块管理`;
    title.style.marginBottom = '20px';
    title.style.borderBottom = '1px solid #E5E7EB';
    title.style.paddingBottom = '10px';
    title.style.display = 'flex';
    title.style.justifyContent = 'space-between';
    title.style.alignItems = 'center';

    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.innerHTML = '&times;';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0';
    closeButton.style.lineHeight = '1';
    closeButton.style.color = '#6B7280';
    title.appendChild(closeButton);

    modalContent.appendChild(title);

    // 创建子模块列表容器
    const listContainer = document.createElement('div');
    listContainer.style.marginBottom = '20px';

    // 创建子模块列表头部
    const listHeader = document.createElement('div');
    listHeader.style.display = 'flex';
    listHeader.style.justifyContent = 'space-between';
    listHeader.style.alignItems = 'center';
    listHeader.style.marginBottom = '15px';

    const listTitle = document.createElement('h4');
    listTitle.textContent = '子模块列表';
    listTitle.style.margin = '0';
    listTitle.style.fontSize = '16px';
    listTitle.style.fontWeight = '600';

    const addButton = document.createElement('button');
    addButton.id = 'add-submodule';
    addButton.className = 'btn btn-primary';
    addButton.innerHTML = '<i class="fas fa-plus"></i> 添加子模块';
    addButton.style.padding = '6px 12px';
    addButton.style.backgroundColor = '#6366F1';
    addButton.style.color = '#fff';
    addButton.style.border = 'none';
    addButton.style.borderRadius = '4px';
    addButton.style.fontSize = '14px';
    addButton.style.cursor = 'pointer';

    listHeader.appendChild(listTitle);
    listHeader.appendChild(addButton);
    listContainer.appendChild(listHeader);

    // 创建子模块表格
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    // 创建表头
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid #E5E7EB; background-color: #F9FAFB; font-weight: 600; color: #4B5563;">名称</th>
        <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid #E5E7EB; background-color: #F9FAFB; font-weight: 600; color: #4B5563;">顺序</th>
        <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid #E5E7EB; background-color: #F9FAFB; font-weight: 600; color: #4B5563;">状态</th>
        <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid #E5E7EB; background-color: #F9FAFB; font-weight: 600; color: #4B5563;">操作</th>
      </tr>
    `;
    table.appendChild(thead);

    // 创建表格内容
    const tbody = document.createElement('tbody');
    tbody.id = 'submodule-list';

    if (!module.subModules || module.subModules.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 15px;">暂无子模块</td></tr>';
    } else {
      // 按顺序排序子模块
      const sortedSubModules = [...module.subModules].sort((a, b) => a.order - b.order);
      
      sortedSubModules.forEach((subModule, index) => {
        const row = document.createElement('tr');
        row.dataset.submoduleId = subModule.id;
        row.style.borderBottom = '1px solid #E5E7EB';
        
        row.innerHTML = `
          <td style="padding: 12px 15px;">${subModule.name}</td>
          <td style="padding: 12px 15px;">
            <div class="order-controls" style="display: flex; align-items: center; gap: 5px;">
              <button class="btn btn-sm btn-outline-secondary move-up-sub" 
                     ${index === 0 ? 'disabled' : ''} style="padding: 4px 8px; background-color: #F3F4F6; border: 1px solid #D1D5DB; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-arrow-up"></i>
              </button>
              <span class="order-number" style="display: inline-block; min-width: 30px; text-align: center;">${subModule.order}</span>
              <button class="btn btn-sm btn-outline-secondary move-down-sub"
                     ${index === module.subModules.length - 1 ? 'disabled' : ''} style="padding: 4px 8px; background-color: #F3F4F6; border: 1px solid #D1D5DB; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-arrow-down"></i>
              </button>
            </div>
          </td>
          <td style="padding: 12px 15px;">
            <div class="custom-switch" style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="submodule-status-${subModule.id}" 
                    class="submodule-status" ${subModule.enabled ? 'checked' : ''} style="appearance: none; width: 40px; height: 20px; background-color: ${subModule.enabled ? '#10B981' : '#E5E7EB'}; border-radius: 20px; position: relative; cursor: pointer; transition: background-color 0.3s;">
              <label for="submodule-status-${subModule.id}" style="margin: 0; cursor: pointer;">
                ${subModule.enabled ? '启用' : '禁用'}
              </label>
            </div>
          </td>
          <td style="padding: 12px 15px;">
            <div class="action-buttons" style="display: flex; gap: 5px;">
              <button class="btn btn-sm btn-primary edit-submodule" style="padding: 6px 10px; background-color: #6366F1; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-warning code-submodule" style="padding: 6px 10px; background-color: #F59E0B; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-code"></i>
              </button>
              <button class="btn btn-sm btn-danger delete-submodule" style="padding: 6px 10px; background-color: #EF4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        `;
        
        tbody.appendChild(row);
      });
    }

    table.appendChild(tbody);
    listContainer.appendChild(table);
    modalContent.appendChild(listContainer);

    // 创建底部按钮
    const footer = document.createElement('div');
    footer.style.marginTop = '20px';
    footer.style.display = 'flex';
    footer.style.justifyContent = 'flex-end';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'btn btn-secondary';
    closeBtn.textContent = '关闭';
    closeBtn.style.padding = '8px 16px';
    closeBtn.style.backgroundColor = '#9CA3AF';
    closeBtn.style.color = '#fff';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '4px';
    closeBtn.style.cursor = 'pointer';

    footer.appendChild(closeBtn);
    modalContent.appendChild(footer);

    // 添加模态框到页面
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 添加子模块按钮事件
    addButton.addEventListener('click', () => {
      document.body.removeChild(modal);
      this.showSubModuleForm(module);
    });

    // 关闭按钮事件
    closeButton.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    // 子模块列表事件委托
    tbody.addEventListener('click', (event) => {
      const target = event.target.closest('button');
      if (!target) return;
      
      const row = target.closest('tr');
      if (!row) return;
      
      const subModuleId = row.dataset.submoduleId;
      const subModule = module.subModules.find(sm => sm.id === subModuleId);
      
      if (target.classList.contains('edit-submodule')) {
        document.body.removeChild(modal);
        this.showSubModuleForm(module, subModule);
      } else if (target.classList.contains('delete-submodule')) {
        this.confirmDeleteSubModule(module, subModule);
        document.body.removeChild(modal);
      } else if (target.classList.contains('code-submodule')) {
        document.body.removeChild(modal);
        this.showCodeEditor(module, subModule);
      } else if (target.classList.contains('move-up-sub')) {
        this.moveSubModuleUp(module, subModule);
        document.body.removeChild(modal);
        this.showSubModuleManager(module);
      } else if (target.classList.contains('move-down-sub')) {
        this.moveSubModuleDown(module, subModule);
        document.body.removeChild(modal);
        this.showSubModuleManager(module);
      }
    });
    
    // 子模块状态切换
    tbody.addEventListener('change', (event) => {
      if (event.target.classList.contains('submodule-status')) {
        const row = event.target.closest('tr');
        const subModuleId = row.dataset.submoduleId;
        const subModule = module.subModules.find(sm => sm.id === subModuleId);
        
        subModule.enabled = event.target.checked;
        this.saveModules();
        
        // 更新标签文本
        const label = event.target.nextElementSibling;
        if (label) {
          label.textContent = subModule.enabled ? '启用' : '禁用';
        }
        
        // 更新开关样式
        event.target.style.backgroundColor = subModule.enabled ? '#10B981' : '#E5E7EB';
      }
    });
  }

  /**
   * 显示子模块表单（新建或编辑）
   */
  showSubModuleForm(module, subModule = null) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    // 创建模态框内容
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.borderRadius = '8px';
    modalContent.style.width = '600px';
    modalContent.style.maxWidth = '90%';
    modalContent.style.maxHeight = '90vh';
    modalContent.style.overflow = 'auto';
    modalContent.style.padding = '20px';
    modalContent.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

    // 创建表单
    const form = document.createElement('form');
    form.id = 'submodule-form';
    
    // 表单标题
    const title = document.createElement('h3');
    title.textContent = subModule ? '编辑子模块' : '新建子模块';
    title.style.marginBottom = '20px';
    title.style.borderBottom = '1px solid #E5E7EB';
    title.style.paddingBottom = '10px';
    
    form.appendChild(title);
    
    // 父模块信息
    const parentInfo = document.createElement('div');
    parentInfo.className = 'form-group';
    parentInfo.style.marginBottom = '15px';
    parentInfo.style.padding = '10px';
    parentInfo.style.backgroundColor = '#F9FAFB';
    parentInfo.style.borderRadius = '4px';
    
    const parentLabel = document.createElement('label');
    parentLabel.textContent = '父模块:';
    parentLabel.style.fontWeight = '500';
    parentLabel.style.marginRight = '8px';
    
    const parentName = document.createElement('span');
    parentName.textContent = module.name;
    
    parentInfo.appendChild(parentLabel);
    parentInfo.appendChild(parentName);
    form.appendChild(parentInfo);
    
    // 子模块ID（隐藏字段）
    const idField = document.createElement('input');
    idField.type = 'hidden';
    idField.name = 'id';
    idField.value = subModule ? subModule.id : `submodule-${Date.now()}`;
    form.appendChild(idField);
    
    // 父模块ID（隐藏字段）
    const parentIdField = document.createElement('input');
    parentIdField.type = 'hidden';
    parentIdField.name = 'parentId';
    parentIdField.value = module.id;
    form.appendChild(parentIdField);
    
    // 子模块名称
    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';
    nameGroup.style.marginBottom = '15px';
    
    const nameLabel = document.createElement('label');
    nameLabel.htmlFor = 'submodule-name';
    nameLabel.textContent = '子模块名称';
    nameLabel.style.display = 'block';
    nameLabel.style.marginBottom = '5px';
    nameLabel.style.fontWeight = '500';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'submodule-name';
    nameInput.name = 'name';
    nameInput.className = 'form-control';
    nameInput.value = subModule ? subModule.name : '';
    nameInput.required = true;
    nameInput.style.width = '100%';
    nameInput.style.padding = '8px';
    nameInput.style.border = '1px solid #E5E7EB';
    nameInput.style.borderRadius = '4px';
    
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    form.appendChild(nameGroup);
    
    // 子模块路径
    const pathGroup = document.createElement('div');
    pathGroup.className = 'form-group';
    pathGroup.style.marginBottom = '15px';
    
    const pathLabel = document.createElement('label');
    pathLabel.htmlFor = 'submodule-path';
    pathLabel.textContent = '子模块路径';
    pathLabel.style.display = 'block';
    pathLabel.style.marginBottom = '5px';
    pathLabel.style.fontWeight = '500';
    
    const pathInput = document.createElement('input');
    pathInput.type = 'text';
    pathInput.id = 'submodule-path';
    pathInput.name = 'path';
    pathInput.className = 'form-control';
    pathInput.value = subModule ? subModule.path : '';
    pathInput.style.width = '100%';
    pathInput.style.padding = '8px';
    pathInput.style.border = '1px solid #E5E7EB';
    pathInput.style.borderRadius = '4px';
    
    const pathHelp = document.createElement('small');
    pathHelp.className = 'form-text';
    pathHelp.textContent = '子模块的路径，例如: modules/dashboard/overview.html';
    pathHelp.style.display = 'block';
    pathHelp.style.marginTop = '5px';
    pathHelp.style.fontSize = '12px';
    pathHelp.style.color = '#6B7280';
    
    pathGroup.appendChild(pathLabel);
    pathGroup.appendChild(pathInput);
    pathGroup.appendChild(pathHelp);
    form.appendChild(pathGroup);
    
    // 启用状态
    const enabledGroup = document.createElement('div');
    enabledGroup.className = 'form-group';
    enabledGroup.style.marginBottom = '15px';
    
    const enabledCheck = document.createElement('input');
    enabledCheck.type = 'checkbox';
    enabledCheck.id = 'submodule-enabled';
    enabledCheck.name = 'enabled';
    enabledCheck.checked = subModule ? subModule.enabled : true;
    enabledCheck.style.marginRight = '8px';
    
    const enabledLabel = document.createElement('label');
    enabledLabel.htmlFor = 'submodule-enabled';
    enabledLabel.textContent = '启用子模块';
    enabledLabel.style.fontWeight = '500';
    
    enabledGroup.appendChild(enabledCheck);
    enabledGroup.appendChild(enabledLabel);
    form.appendChild(enabledGroup);
    
    // 按钮组
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'form-group';
    buttonGroup.style.marginTop = '20px';
    buttonGroup.style.display = 'flex';
    buttonGroup.style.justifyContent = 'flex-end';
    buttonGroup.style.gap = '10px';
    
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'btn btn-secondary';
    cancelButton.textContent = '取消';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.backgroundColor = '#9CA3AF';
    cancelButton.style.color = '#fff';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.cursor = 'pointer';
    
    const saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.className = 'btn btn-primary';
    saveButton.textContent = '保存';
    saveButton.style.padding = '8px 16px';
    saveButton.style.backgroundColor = '#6366F1';
    saveButton.style.color = '#fff';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '4px';
    saveButton.style.cursor = 'pointer';
    
    buttonGroup.appendChild(cancelButton);
    buttonGroup.appendChild(saveButton);
    form.appendChild(buttonGroup);
    
    // 添加表单到模态框
    modalContent.appendChild(form);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // 取消按钮事件
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 表单提交事件
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const submoduleData = {
            id: formData.get('id'),
            name: formData.get('name'),
            path: formData.get('path'),
            enabled: formData.get('enabled') === 'on',
            order: subModule ? subModule.order : (module.subModules ? module.subModules.length + 1 : 1),
            customCode: subModule ? subModule.customCode : {
                html: '',
                css: '',
                js: ''
            }
        };
        
        // 找到父模块
        const parentIndex = this.modules.findIndex(m => m.id === module.id);
        if (parentIndex !== -1) {
            if (!this.modules[parentIndex].subModules) {
                this.modules[parentIndex].subModules = [];
            }
            
            if (subModule) {
                // 更新现有子模块
                const subIndex = this.modules[parentIndex].subModules.findIndex(s => s.id === subModule.id);
                if (subIndex !== -1) {
                    this.modules[parentIndex].subModules[subIndex] = submoduleData;
                }
            } else {
                // 添加新子模块
                this.modules[parentIndex].subModules.push(submoduleData);
            }
            
            // 保存并刷新
            this.saveModules();
            this.renderModuleList();
            
            // 关闭表单并显示子模块管理器
            document.body.removeChild(modal);
            setTimeout(() => {
                this.showSubModuleManager(module);
            }, 100);
        } else {
            alert('找不到父模块，无法保存子模块');
            document.body.removeChild(modal);
        }
    });
    
    // 聚焦到名称输入框
    nameInput.focus();
  }

  /**
   * 确认删除子模块
   */
  confirmDeleteSubModule(module, subModule) {
    if (confirm(`确定要删除子模块"${subModule.name}"吗？此操作不可撤销。`)) {
      const index = module.subModules.findIndex(sm => sm.id === subModule.id);
      if (index !== -1) {
        module.subModules.splice(index, 1);
        
        // 重新排序
        module.subModules.forEach((sm, i) => {
          sm.order = i + 1;
        });
        
        this.saveModules();
        
        // 重新显示子模块管理器
        setTimeout(() => {
            this.showSubModuleManager(module);
        }, 100);
      }
    }
  }

  /**
   * 显示代码编辑器
   */
  showCodeEditor(module, subModule = null) {
    const target = subModule || module;
    const title = subModule ? 
      `${module.name} - ${subModule.name} - 代码编辑` : 
      `${module.name} - 代码编辑`;
    
    // 确保customCode对象存在
    if (!target.customCode) {
      target.customCode = {
        html: '',
        css: '',
        js: ''
      };
    }
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    // 创建模态框内容
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.borderRadius = '8px';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '1200px';
    modalContent.style.maxHeight = '90vh';
    modalContent.style.overflow = 'auto';
    modalContent.style.padding = '20px';
    modalContent.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

    // 创建标题
    const headerDiv = document.createElement('div');
    headerDiv.style.display = 'flex';
    headerDiv.style.justifyContent = 'space-between';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.marginBottom = '20px';
    headerDiv.style.borderBottom = '1px solid #E5E7EB';
    headerDiv.style.paddingBottom = '10px';

    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    titleEl.style.margin = '0';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.innerHTML = '&times;';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0';
    closeButton.style.lineHeight = '1';
    closeButton.style.color = '#6B7280';

    headerDiv.appendChild(titleEl);
    headerDiv.appendChild(closeButton);
    modalContent.appendChild(headerDiv);

    // 创建标签页
    const tabsDiv = document.createElement('div');
    tabsDiv.style.marginBottom = '15px';

    const tabsList = document.createElement('ul');
    tabsList.id = 'code-editor-tabs';
    tabsList.style.display = 'flex';
    tabsList.style.listStyle = 'none';
    tabsList.style.padding = '0';
    tabsList.style.margin = '0';
    tabsList.style.borderBottom = '1px solid #E5E7EB';

    const tabs = [
      { id: 'html-editor', text: 'HTML', active: true },
      { id: 'css-editor', text: 'CSS', active: false },
      { id: 'js-editor', text: 'JavaScript', active: false }
    ];

    tabs.forEach(tab => {
      const li = document.createElement('li');
      li.style.marginRight = '5px';

      const a = document.createElement('a');
      a.href = `#${tab.id}`;
      a.textContent = tab.text;
      a.style.display = 'block';
      a.style.padding = '10px 15px';
      a.style.textDecoration = 'none';
      a.style.color = tab.active ? '#6366F1' : '#64748B';
      a.style.borderBottom = tab.active ? '2px solid #6366F1' : '2px solid transparent';
      a.dataset.target = tab.id;

      li.appendChild(a);
      tabsList.appendChild(li);
    });

    tabsDiv.appendChild(tabsList);
    modalContent.appendChild(tabsDiv);

    // 创建标签内容
    const tabContentDiv = document.createElement('div');
    tabContentDiv.className = 'tab-content';
    tabContentDiv.style.marginTop = '15px';

    // HTML 编辑器
    const htmlPane = document.createElement('div');
    htmlPane.id = 'html-editor';
    htmlPane.style.display = 'block';

    const htmlTextarea = document.createElement('textarea');
    htmlTextarea.id = 'html-code';
    htmlTextarea.className = 'code-editor';
    htmlTextarea.value = target.customCode.html || '';
    htmlTextarea.style.width = '100%';
    htmlTextarea.style.height = '400px';
    htmlTextarea.style.fontFamily = 'monospace';

    htmlPane.appendChild(htmlTextarea);
    tabContentDiv.appendChild(htmlPane);

    // CSS 编辑器
    const cssPane = document.createElement('div');
    cssPane.id = 'css-editor';
    cssPane.style.display = 'none';

    const cssTextarea = document.createElement('textarea');
    cssTextarea.id = 'css-code';
    cssTextarea.className = 'code-editor';
    cssTextarea.value = target.customCode.css || '';
    cssTextarea.style.width = '100%';
    cssTextarea.style.height = '400px';
    cssTextarea.style.fontFamily = 'monospace';

    cssPane.appendChild(cssTextarea);
    tabContentDiv.appendChild(cssPane);

    // JavaScript 编辑器
    const jsPane = document.createElement('div');
    jsPane.id = 'js-editor';
    jsPane.style.display = 'none';

    const jsTextarea = document.createElement('textarea');
    jsTextarea.id = 'js-code';
    jsTextarea.className = 'code-editor';
    jsTextarea.value = target.customCode.js || '';
    jsTextarea.style.width = '100%';
    jsTextarea.style.height = '400px';
    jsTextarea.style.fontFamily = 'monospace';

    jsPane.appendChild(jsTextarea);
    tabContentDiv.appendChild(jsPane);

    modalContent.appendChild(tabContentDiv);

    // 创建底部按钮
    const footerDiv = document.createElement('div');
    footerDiv.style.marginTop = '20px';
    footerDiv.style.display = 'flex';
    footerDiv.style.justifyContent = 'flex-end';
    footerDiv.style.gap = '10px';

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'btn btn-secondary';
    cancelButton.textContent = '取消';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.backgroundColor = '#9CA3AF';
    cancelButton.style.color = '#fff';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.cursor = 'pointer';

    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.id = 'save-code';
    saveButton.className = 'btn btn-primary';
    saveButton.textContent = '保存';
    saveButton.style.padding = '8px 16px';
    saveButton.style.backgroundColor = '#6366F1';
    saveButton.style.color = '#fff';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '4px';
    saveButton.style.cursor = 'pointer';

    footerDiv.appendChild(cancelButton);
    footerDiv.appendChild(saveButton);
    modalContent.appendChild(footerDiv);

    // 添加模态框到页面
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 初始化代码编辑器
    try {
      const editors = {
        html: CodeMirror.fromTextArea(htmlTextarea, {
          mode: 'xml',
          theme: 'monokai',
          lineNumbers: true,
          autoCloseTags: true,
          matchBrackets: true,
          indentUnit: 2,
          tabSize: 2,
          lineWrapping: true
        }),
        css: CodeMirror.fromTextArea(cssTextarea, {
          mode: 'css',
          theme: 'monokai',
          lineNumbers: true,
          matchBrackets: true,
          indentUnit: 2,
          tabSize: 2,
          lineWrapping: true
        }),
        js: CodeMirror.fromTextArea(jsTextarea, {
          mode: 'javascript',
          theme: 'monokai',
          lineNumbers: true,
          matchBrackets: true,
          indentUnit: 2,
          tabSize: 2,
          lineWrapping: true
        })
      };
      
      // 标签切换事件
      tabsList.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.tagName === 'A') {
          // 移除所有活动标签样式
          tabsList.querySelectorAll('a').forEach(a => {
            a.style.color = '#64748B';
            a.style.borderBottom = '2px solid transparent';
          });
          
          // 添加当前标签活动样式
          e.target.style.color = '#6366F1';
          e.target.style.borderBottom = '2px solid #6366F1';
          
          // 隐藏所有标签内容
          tabContentDiv.querySelectorAll('div[id]').forEach(div => {
            div.style.display = 'none';
          });
          
          // 显示目标内容
          const targetId = e.target.dataset.target;
          document.getElementById(targetId).style.display = 'block';
          
          // 刷新编辑器
          if (targetId === 'html-editor') editors.html.refresh();
          if (targetId === 'css-editor') editors.css.refresh();
          if (targetId === 'js-editor') editors.js.refresh();
        }
      });

      // 保存按钮事件
      saveButton.addEventListener('click', () => {
        try {
          target.customCode = {
            html: editors.html.getValue(),
            css: editors.css.getValue(),
            js: editors.js.getValue()
          };
          
          this.saveModules();
          document.body.removeChild(modal);
          
          // 如果是子模块，重新显示子模块管理器
          if (subModule) {
            setTimeout(() => {
              this.showSubModuleManager(module);
            }, 100);
          }
        } catch (error) {
          console.error('保存代码时出错:', error);
          alert('保存代码时出错: ' + error.message);
        }
      });
    } catch (error) {
      console.error('初始化代码编辑器时出错:', error);
      const errorMessage = document.createElement('div');
      errorMessage.style.color = 'red';
      errorMessage.style.padding = '20px';
      errorMessage.textContent = `初始化代码编辑器时出错: ${error.message}。请确保已加载CodeMirror库。`;
      tabContentDiv.innerHTML = '';
      tabContentDiv.appendChild(errorMessage);
    }

    // 关闭按钮事件
    closeButton.addEventListener('click', () => {
      document.body.removeChild(modal);
      if (subModule) {
        this.showSubModuleManager(module);
      }
    });

    // 取消按钮事件
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(modal);
      if (subModule) {
        this.showSubModuleManager(module);
      }
    });
  }

  /**
   * 上移模块
   */
  moveModuleUp(module) {
    const index = this.modules.findIndex(m => m.id === module.id);
    if (index > 0) {
      // 交换顺序
      const temp = this.modules[index - 1].order;
      this.modules[index - 1].order = this.modules[index].order;
      this.modules[index].order = temp;
      
      // 交换位置
      [this.modules[index - 1], this.modules[index]] = [this.modules[index], this.modules[index - 1]];
      
      this.saveModules();
      this.renderModuleList();
    }
  }

  /**
   * 下移模块
   */
  moveModuleDown(module) {
    const index = this.modules.findIndex(m => m.id === module.id);
    if (index < this.modules.length - 1) {
      // 交换顺序
      const temp = this.modules[index + 1].order;
      this.modules[index + 1].order = this.modules[index].order;
      this.modules[index].order = temp;
      
      // 交换位置
      [this.modules[index + 1], this.modules[index]] = [this.modules[index], this.modules[index + 1]];
      
      this.saveModules();
      this.renderModuleList();
    }
  }

  /**
   * 上移子模块
   */
  moveSubModuleUp(module, subModule) {
    const index = module.subModules.findIndex(sm => sm.id === subModule.id);
    if (index > 0) {
      // 交换顺序
      const temp = module.subModules[index - 1].order;
      module.subModules[index - 1].order = module.subModules[index].order;
      module.subModules[index].order = temp;
      
      // 交换位置
      [module.subModules[index - 1], module.subModules[index]] = 
        [module.subModules[index], module.subModules[index - 1]];
      
      this.saveModules();
      this.showSubModuleManager(module);
    }
  }

  /**
   * 下移子模块
   */
  moveSubModuleDown(module, subModule) {
    const index = module.subModules.findIndex(sm => sm.id === subModule.id);
    if (index < module.subModules.length - 1) {
      // 交换顺序
      const temp = module.subModules[index + 1].order;
      module.subModules[index + 1].order = module.subModules[index].order;
      module.subModules[index].order = temp;
      
      // 交换位置
      [module.subModules[index + 1], module.subModules[index]] = 
        [module.subModules[index], module.subModules[index + 1]];
      
      this.saveModules();
      this.showSubModuleManager(module);
    }
  }
}

// 初始化模块管理器
document.addEventListener('DOMContentLoaded', function() {
  try {
    window.moduleManager = new ModuleManager();
    console.log('模块管理器初始化成功');
  } catch (error) {
    console.error('模块管理器初始化失败:', error);
  }
}); 