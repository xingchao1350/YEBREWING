/**
 * 用户管理器类 - 负责用户的增删改查和权限管理
 */
class UserManager {
  constructor() {
    // Supabase客户端配置
    this.supabase = supabase;
    this.roles = {
      SUPER_ADMIN: '超级管理员',
      STORE_ADMIN: '门店管理员',
      STORE_EMPLOYEE: '门店员工'
    };
    this.currentUser = null;
    this.init();
  }

  /**
   * 初始化用户管理器
   */
  async init() {
    try {
      // 显示用户信息加载状态
      this.updateUserInfoDisplay(null, null, true);
      
      // 获取当前登录用户
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!user) {
        throw new Error('未登录，请先登录');
      }
      
      this.currentUser = user;
      
      // 使用直接查询方式获取用户角色，避免触发RLS策略
      const { data: userRole, error: roleError } = await this.supabase
        .from('user_profiles')
        .select('role, username')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // 如果用户不存在于user_profiles表中，创建一个默认的超级管理员配置文件
      if (!userRole && !roleError) {
        try {
          const { error: insertError } = await this.supabase
            .from('user_profiles')
            .insert({
              user_id: user.id,
              username: user.email.split('@')[0],
              role: 'SUPER_ADMIN'
            });
          
          if (insertError) {
            console.error('创建用户配置文件失败:', insertError);
          } else {
            // 更新界面显示
            this.updateUserInfoDisplay(user.email.split('@')[0], 'SUPER_ADMIN');
          }
        } catch (err) {
          console.error('创建用户配置文件时出错:', err);
        }
      } else if (userRole) {
        // 更新界面显示
        this.updateUserInfoDisplay(userRole.username || user.email.split('@')[0], userRole.role);
      }
      
      // 加载用户列表
      await this.loadUsers();
      
      // 设置用户列表容器
      this.setupUserListContainer();
      
      // 渲染用户列表
      this.renderUserList();
      
      // 绑定事件
      this.bindEvents();
      
      // 直接添加新建用户按钮
      this.addSimpleNewUserButton();
      
      console.log('用户管理器初始化成功');
    } catch (error) {
      console.error('初始化用户管理器失败:', error);
      this.showNotification('初始化用户管理器失败: ' + error.message, 'error');
      
      // 出错时也更新用户信息显示为默认状态
      this.updateUserInfoDisplay('未知用户', '未知角色');
    }
  }

  /**
   * 更新用户信息显示
   * @param {string} username - 用户名
   * @param {string} role - 用户角色
   * @param {boolean} isLoading - 是否正在加载
   */
  updateUserInfoDisplay(username, role, isLoading = false) {
    const userInfoContainer = document.querySelector('.user-info .user');
    if (!userInfoContainer) return;
    
    if (isLoading) {
      // 显示加载状态
      userInfoContainer.innerHTML = `
        <div class="avatar">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
        <div>
          <div class="name">加载中...</div>
          <div class="role">请稍候</div>
        </div>
      `;
      return;
    }
    
    // 更新用户名显示
    const nameElement = document.querySelector('.user .name');
    if (nameElement) {
      nameElement.textContent = username || '未知用户';
    }
    
    // 更新角色显示
    const roleElement = document.querySelector('.user .role');
    if (roleElement) {
      const roleMap = {
        'SUPER_ADMIN': '超级管理员',
        'STORE_ADMIN': '门店管理员',
        'STORE_EMPLOYEE': '门店员工'
      };
      roleElement.textContent = role ? (roleMap[role] || '员工') : '未知角色';
    }
  }

  /**
   * 从Supabase加载用户列表
   */
  async loadUsers() {
    try {
      // 检查当前用户是否为超级管理员
      if (!this.currentUser) {
        throw new Error('未登录，请先登录');
      }
      
      // 使用简单的查询获取所有用户配置文件
      const { data: profiles, error: profilesError } = await this.supabase
        .from('user_profiles')
        .select('*');
        
      if (profilesError) {
        console.error('获取用户配置文件失败:', profilesError);
        throw new Error('获取用户数据失败: ' + profilesError.message);
      }
      
      if (!profiles || profiles.length === 0) {
        console.log('没有找到用户配置文件，尝试创建当前用户的配置文件');
        
        // 如果没有用户配置文件，至少确保当前用户有一个配置文件
        const { error: insertError } = await this.supabase
          .from('user_profiles')
          .insert({
            user_id: this.currentUser.id,
            username: this.currentUser.email.split('@')[0],
            role: 'SUPER_ADMIN'
          })
          .select();
        
        if (insertError) {
          console.error('创建当前用户配置文件失败:', insertError);
          // 继续使用默认数据
        } else {
          // 重新获取用户配置文件
          const { data: updatedProfiles, error: updatedError } = await this.supabase
            .from('user_profiles')
            .select('*');
            
          if (!updatedError && updatedProfiles) {
            profiles = updatedProfiles;
          }
        }
      }
      
      // 获取auth.users表中的用户数据，以获取正确的邮箱
      let authUsers = null;
      let authError = null;
      
      try {
        // 尝试从auth_users_view获取数据
        const result = await this.supabase
          .from('auth_users_view')
          .select('id, email');
        
        authUsers = result.data;
        authError = result.error;
        
        if (authError) {
          console.log('从auth_users_view获取数据失败:', authError);
        }
      } catch (viewError) {
        console.log('auth_users_view可能不存在:', viewError);
      }
      
      // 创建邮箱映射
      const emailMap = {};
      if (authUsers && authUsers.length > 0) {
        authUsers.forEach(user => {
          emailMap[user.id] = user.email;
        });
      } else {
        // 如果无法从视图获取邮箱，至少确保当前用户的邮箱是正确的
        emailMap[this.currentUser.id] = this.currentUser.email;
      }
      
      // 使用profiles作为数据源，结合auth用户数据
      this.users = (profiles || []).map(profile => {
        // 尝试从emailMap获取邮箱，如果没有则使用当前用户的邮箱或生成一个占位符
        let email = emailMap[profile.user_id];
        
        // 如果是当前用户且没有在emailMap中找到邮箱
        if (!email && profile.user_id === this.currentUser.id) {
          email = this.currentUser.email;
        }
        
        // 如果仍然没有邮箱，使用用户名生成一个
        if (!email) {
          email = profile.username + '@example.com';
        }
        
        return {
          id: profile.user_id,
          email: email,
          username: profile.username,
          role: profile.role || 'STORE_EMPLOYEE',
          created_at: profile.created_at
        };
      });
      
      // 确保当前用户在列表中
      if (this.users.length === 0 || !this.users.some(u => u.id === this.currentUser.id)) {
        this.users.unshift({
          id: this.currentUser.id,
          username: this.currentUser.email.split('@')[0],
          email: this.currentUser.email,
          role: 'SUPER_ADMIN',
          created_at: new Date().toISOString()
        });
      }
      
      console.log('成功加载用户列表:', this.users);
    } catch (error) {
      console.error('加载用户列表失败:', error);
      // 使用默认数据
      this.users = [
        {
          id: this.currentUser?.id || 'default-1',
          username: '当前用户',
          email: this.currentUser?.email || 'admin@example.com',
          role: 'SUPER_ADMIN',
          created_at: new Date().toISOString()
        }
      ];
      this.showNotification('加载用户列表失败: ' + error.message, 'error');
    }
  }

  /**
   * 设置用户列表容器结构
   */
  setupUserListContainer() {
    const userCard = document.querySelector('.user-management-card');
    if (!userCard) return;

    // 检查是否已存在用户列表容器
    let listContainer = userCard.querySelector('.user-list-container');
    if (!listContainer) {
      listContainer = document.createElement('div');
      listContainer.className = 'user-list-container';
      userCard.appendChild(listContainer);
    }

    // 创建列表头部
    let listHeader = listContainer.querySelector('.user-list-header');
    if (!listHeader) {
      listHeader = document.createElement('div');
      listHeader.className = 'user-list-header';
      listHeader.style.display = 'flex';
      listHeader.style.justifyContent = 'space-between';
      listHeader.style.alignItems = 'center';
      listHeader.style.marginBottom = '15px';
      listHeader.style.padding = '10px 0';

      const title = document.createElement('h4');
      title.textContent = '用户列表';
      title.style.margin = '0';
      title.style.fontSize = '16px';
      title.style.fontWeight = '600';

      const actions = document.createElement('div');
      actions.className = 'actions';

      const addButton = document.createElement('button');
      addButton.id = 'add-new-user';
      addButton.className = 'btn btn-primary';
      addButton.style.backgroundColor = '#6366F1';
      addButton.style.color = 'white';
      addButton.style.border = 'none';
      addButton.style.borderRadius = '4px';
      addButton.style.padding = '8px 16px';
      addButton.style.cursor = 'pointer';
      addButton.style.display = 'flex';
      addButton.style.alignItems = 'center';
      addButton.style.gap = '6px';
      addButton.style.fontSize = '14px';
      addButton.innerHTML = '<i class="fas fa-plus"></i> 新建用户';

      actions.appendChild(addButton);
      listHeader.appendChild(title);
      listHeader.appendChild(actions);
      listContainer.appendChild(listHeader);
    } else {
      // 确保添加用户按钮存在
      let addButton = listHeader.querySelector('#add-new-user');
      if (!addButton) {
        const actions = listHeader.querySelector('.actions') || document.createElement('div');
        if (!actions.className) {
          actions.className = 'actions';
          listHeader.appendChild(actions);
        }
        
        addButton = document.createElement('button');
        addButton.id = 'add-new-user';
        addButton.className = 'btn btn-primary';
        addButton.style.backgroundColor = '#6366F1';
        addButton.style.color = 'white';
        addButton.style.border = 'none';
        addButton.style.borderRadius = '4px';
        addButton.style.padding = '8px 16px';
        addButton.style.cursor = 'pointer';
        addButton.style.display = 'flex';
        addButton.style.alignItems = 'center';
        addButton.style.gap = '6px';
        addButton.style.fontSize = '14px';
        addButton.innerHTML = '<i class="fas fa-plus"></i> 新建用户';
        
        actions.appendChild(addButton);
      }
    }

    // 创建用户列表表格
    let table = listContainer.querySelector('table.user-list');
    if (!table) {
      table = document.createElement('table');
      table.className = 'user-list';
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';

      const thead = document.createElement('thead');
      thead.innerHTML = `
        <tr>
          <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid #E5E7EB; background-color: #F9FAFB; font-weight: 600; color: #4B5563;">用户名</th>
          <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid #E5E7EB; background-color: #F9FAFB; font-weight: 600; color: #4B5563;">邮箱</th>
          <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid #E5E7EB; background-color: #F9FAFB; font-weight: 600; color: #4B5563;">角色</th>
          <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid #E5E7EB; background-color: #F9FAFB; font-weight: 600; color: #4B5563;">操作</th>
        </tr>
      `;

      const tbody = document.createElement('tbody');
      tbody.id = 'user-list-body';

      table.appendChild(thead);
      table.appendChild(tbody);
      listContainer.appendChild(table);
    }
  }

  /**
   * 渲染用户列表
   */
  renderUserList() {
    const listBody = document.getElementById('user-list-body');
    if (!listBody) return;

    // 清空列表
    listBody.innerHTML = '';

    // 渲染每个用户
    this.users.forEach(user => {
        const row = document.createElement('tr');
        row.dataset.userId = user.id;

        // 获取角色样式类
        const getRoleBadgeClass = (role) => {
            switch(role) {
                case 'SUPER_ADMIN': return 'super-admin';
                case 'STORE_ADMIN': return 'store-admin';
                case 'STORE_EMPLOYEE': return 'employee';
                default: return 'employee';
            }
        };

        row.innerHTML = `
            <td style="color: #111827; font-weight: 500;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-user-circle" style="color: #6B7280; font-size: 20px;"></i>
                    <span>${user.username}</span>
                </div>
            </td>
            <td style="color: #4B5563;">${user.email}</td>
            <td>
                <span class="role-badge ${getRoleBadgeClass(user.role)}" style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">
                    ${this.roles[user.role] || '员工'}
                </span>
            </td>
            <td>
                <div class="action-buttons" style="display: flex; gap: 8px;">
                    <button class="btn btn-icon edit-user-btn" title="编辑用户">
                        <i class="fas fa-edit" style="color: #6366F1;"></i>
                    </button>
                    <button class="btn btn-icon manage-permissions-btn" title="管理权限">
                        <i class="fas fa-key" style="color: #10B981;"></i>
                    </button>
                    <button class="btn btn-icon delete-user-btn" title="删除用户">
                        <i class="fas fa-trash-alt" style="color: #EF4444;"></i>
                    </button>
                </div>
            </td>
        `;

        listBody.appendChild(row);
    });

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .role-badge.super-admin {
            background-color: #818CF8;
            color: white;
        }
        .role-badge.store-admin {
            background-color: #34D399;
            color: white;
        }
        .role-badge.employee {
            background-color: #FBBF24;
            color: white;
        }
        .btn-icon {
            background: none;
            border: none;
            cursor: pointer;
            padding: 5px;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        .btn-icon:hover {
            background-color: #F3F4F6;
        }
    `;

    // 检查是否已存在样式
    const existingStyle = document.getElementById('user-list-style');
    if (existingStyle) {
        existingStyle.remove();
    }
    style.id = 'user-list-style';
    document.head.appendChild(style);
  }

  /**
   * 绑定事件处理
   */
  bindEvents() {
    // 绑定用户列表中的操作按钮事件
    document.addEventListener('click', (e) => {
      // 编辑用户
      if (e.target.closest('.edit-user-btn')) {
        const userId = e.target.closest('tr').dataset.userId;
        const user = this.users.find(u => u.id === userId);
        if (user) {
          this.showUserForm(user);
        }
      }
      
      // 删除用户
      if (e.target.closest('.delete-user-btn')) {
        const userId = e.target.closest('tr').dataset.userId;
        const user = this.users.find(u => u.id === userId);
        if (user) {
          this.confirmDeleteUser(user);
        }
      }
      
      // 管理权限
      if (e.target.closest('.manage-permissions-btn')) {
        const userId = e.target.closest('tr').dataset.userId;
        const user = this.users.find(u => u.id === userId);
        if (user) {
          this.showPermissionsManager(user);
        }
      }
    });
    
    // 绑定新建用户按钮事件
    const addUserBtn = document.getElementById('add-new-user-btn');
    if (addUserBtn) {
      addUserBtn.addEventListener('click', () => {
        this.showUserForm();
      });
    }
    
    // 在用户管理选项卡激活时添加新建用户按钮
    const userManagementTab = document.querySelector('a[href="#user-management"]');
    if (userManagementTab) {
      userManagementTab.addEventListener('click', () => {
        // 延迟执行，确保选项卡内容已加载
        setTimeout(() => {
          this.addNewUserButton();
        }, 100);
      });
    }
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
   * 显示用户表单（新建或编辑）
   */
  showUserForm(user = null) {
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
    modalContent.style.width = '500px';
    modalContent.style.maxWidth = '90%';
    modalContent.style.padding = '20px';
    modalContent.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

    // 创建标题
    const title = document.createElement('h3');
    title.textContent = user ? '编辑用户' : '新建用户';
    title.style.marginBottom = '20px';
    title.style.borderBottom = '1px solid #E5E7EB';
    title.style.paddingBottom = '10px';

    modalContent.appendChild(title);

    // 创建表单
    const form = document.createElement('form');
    form.id = 'user-form';

    // 用户名字段
    const usernameGroup = document.createElement('div');
    usernameGroup.className = 'form-group';
    usernameGroup.style.marginBottom = '15px';

    const usernameLabel = document.createElement('label');
    usernameLabel.htmlFor = 'username';
    usernameLabel.textContent = '用户名';
    usernameLabel.style.display = 'block';
    usernameLabel.style.marginBottom = '5px';
    usernameLabel.style.fontWeight = '500';

    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.id = 'username';
    usernameInput.name = 'username';
    usernameInput.value = user ? user.username : '';
    usernameInput.required = true;
    usernameInput.style.width = '100%';
    usernameInput.style.padding = '8px 12px';
    usernameInput.style.border = '1px solid #D1D5DB';
    usernameInput.style.borderRadius = '4px';
    usernameInput.style.fontSize = '14px';

    usernameGroup.appendChild(usernameLabel);
    usernameGroup.appendChild(usernameInput);
    form.appendChild(usernameGroup);

    // 邮箱字段
    const emailGroup = document.createElement('div');
    emailGroup.className = 'form-group';
    emailGroup.style.marginBottom = '15px';

    const emailLabel = document.createElement('label');
    emailLabel.htmlFor = 'email';
    emailLabel.textContent = '邮箱';
    emailLabel.style.display = 'block';
    emailLabel.style.marginBottom = '5px';
    emailLabel.style.fontWeight = '500';

    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'email';
    emailInput.name = 'email';
    emailInput.value = user ? user.email : '';
    emailInput.required = true;
    emailInput.style.width = '100%';
    emailInput.style.padding = '8px 12px';
    emailInput.style.border = '1px solid #D1D5DB';
    emailInput.style.borderRadius = '4px';
    emailInput.style.fontSize = '14px';
    // 如果是编辑用户，禁用邮箱字段
    if (user) {
      emailInput.disabled = true;
      emailInput.style.backgroundColor = '#F3F4F6';
    }

    emailGroup.appendChild(emailLabel);
    emailGroup.appendChild(emailInput);
    form.appendChild(emailGroup);

    // 密码字段（仅新建用户时显示）
    if (!user) {
      const passwordGroup = document.createElement('div');
      passwordGroup.className = 'form-group';
      passwordGroup.style.marginBottom = '15px';

      const passwordLabel = document.createElement('label');
      passwordLabel.htmlFor = 'password';
      passwordLabel.textContent = '密码';
      passwordLabel.style.display = 'block';
      passwordLabel.style.marginBottom = '5px';
      passwordLabel.style.fontWeight = '500';

      const passwordInput = document.createElement('input');
      passwordInput.type = 'password';
      passwordInput.id = 'password';
      passwordInput.name = 'password';
      passwordInput.required = true;
      passwordInput.style.width = '100%';
      passwordInput.style.padding = '8px 12px';
      passwordInput.style.border = '1px solid #D1D5DB';
      passwordInput.style.borderRadius = '4px';
      passwordInput.style.fontSize = '14px';

      passwordGroup.appendChild(passwordLabel);
      passwordGroup.appendChild(passwordInput);
      form.appendChild(passwordGroup);
    }

    // 角色字段
    const roleGroup = document.createElement('div');
    roleGroup.className = 'form-group';
    roleGroup.style.marginBottom = '15px';

    const roleLabel = document.createElement('label');
    roleLabel.htmlFor = 'role';
    roleLabel.textContent = '角色';
    roleLabel.style.display = 'block';
    roleLabel.style.marginBottom = '5px';
    roleLabel.style.fontWeight = '500';

    const roleSelect = document.createElement('select');
    roleSelect.id = 'role';
    roleSelect.name = 'role';
    roleSelect.style.width = '100%';
    roleSelect.style.padding = '8px 12px';
    roleSelect.style.border = '1px solid #D1D5DB';
    roleSelect.style.borderRadius = '4px';
    roleSelect.style.fontSize = '14px';

    // 添加角色选项
    Object.entries(this.roles).forEach(([value, label]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      if (user && user.role === value) {
        option.selected = true;
      }
      roleSelect.appendChild(option);
    });

    roleGroup.appendChild(roleLabel);
    roleGroup.appendChild(roleSelect);
    form.appendChild(roleGroup);

    // 按钮组
    const buttonGroup = document.createElement('div');
    buttonGroup.style.display = 'flex';
    buttonGroup.style.justifyContent = 'flex-end';
    buttonGroup.style.gap = '10px';
    buttonGroup.style.marginTop = '20px';

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
    saveButton.className = 'btn btn-primary btn-save';
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

    modalContent.appendChild(form);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 取消按钮事件
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    // 表单提交事件
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
        role: formData.get('role')
      };

      try {
        const saveBtn = form.querySelector('.btn-save');
        saveBtn.disabled = true;
        saveBtn.textContent = '保存中...';
        
        if (user) {
          // 更新用户
          const { error } = await this.supabase
            .from('user_profiles')
            .update({
              username: userData.username,
              role: userData.role
            })
            .eq('user_id', user.id);

          if (error) throw error;

          // 更新本地数据
          const index = this.users.findIndex(u => u.id === user.id);
          if (index !== -1) {
            this.users[index] = { ...this.users[index], ...userData };
          }
          
          this.showNotification('用户更新成功');
        } else {
          // 创建新用户
          const password = formData.get('password');
          if (!password) {
            throw new Error('新用户必须设置密码');
          }
          
          // 1. 直接使用Supabase Auth API创建用户
          const { data: authData, error: authError } = await this.supabase.auth.signUp({
            email: userData.email,
            password: password,
            options: {
              data: {
                username: userData.username,
                role: userData.role
              }
            }
          });

          if (authError) throw authError;
          
          if (!authData || !authData.user) {
            throw new Error('创建用户失败，未返回用户数据');
          }
          
          // 2. 创建用户配置文件
          const { error: profileError } = await this.supabase
            .from('user_profiles')
            .insert({
              user_id: authData.user.id,
              username: userData.username,
              role: userData.role
            });

          if (profileError) {
            this.showNotification('用户已创建，但配置文件创建失败: ' + profileError.message, 'warning');
          }

          // 添加到本地数据
          this.users.unshift({
            id: authData.user.id,
            ...userData,
            created_at: new Date().toISOString()
          });
          
          this.showNotification('用户创建成功');
        }

        // 刷新界面
        this.renderUserList();
        document.body.removeChild(modal);
      } catch (error) {
        console.error(user ? '更新用户失败:' : '创建用户失败:', error);
        this.showNotification(error.message, 'error');
        
        const saveBtn = form.querySelector('.btn-save');
        saveBtn.disabled = false;
        saveBtn.textContent = '保存';
      }
    });
  }

  /**
   * 确认删除用户
   */
  async confirmDeleteUser(user) {
    if (confirm(`确定要删除用户"${user.username}"吗？此操作不可撤销。`)) {
      try {
        // 删除用户
        const { error } = await this.supabase.auth.admin.deleteUser(user.id);

        if (error) throw error;

        // 刷新用户列表
        await this.loadUsers();
        this.renderUserList();
        this.showNotification('用户删除成功');
      } catch (error) {
        console.error('删除用户失败:', error);
        this.showNotification(error.message, 'error');
      }
    }
  }

  /**
   * 显示权限管理器
   */
  async showPermissionsManager(user) {
    try {
      // 获取所有模块
      const moduleManager = window.moduleManager;
      if (!moduleManager) {
        throw new Error('模块管理器未初始化');
      }

      // 获取用户的模块权限
      const { data: permissions, error } = await this.supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

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
      title.textContent = `${user.username} - 模块权限管理`;
      title.style.marginBottom = '20px';
      title.style.borderBottom = '1px solid #E5E7EB';
      title.style.paddingBottom = '10px';

      modalContent.appendChild(title);

      // 创建权限列表
      const permissionsList = document.createElement('div');
      permissionsList.className = 'permissions-list';
      permissionsList.style.marginBottom = '20px';

      // 遍历所有模块
      moduleManager.modules.forEach(module => {
        const moduleDiv = document.createElement('div');
        moduleDiv.className = 'module-permission';
        moduleDiv.style.marginBottom = '15px';
        moduleDiv.style.padding = '10px';
        moduleDiv.style.backgroundColor = '#F9FAFB';
        moduleDiv.style.borderRadius = '4px';

        // 模块权限
        const moduleCheck = document.createElement('div');
        moduleCheck.style.display = 'flex';
        moduleCheck.style.alignItems = 'center';
        moduleCheck.style.marginBottom = '10px';

        const moduleCheckbox = document.createElement('input');
        moduleCheckbox.type = 'checkbox';
        moduleCheckbox.id = `module-${module.id}`;
        moduleCheckbox.checked = permissions.some(p => p.module_id === module.id);
        moduleCheckbox.style.marginRight = '8px';

        const moduleLabel = document.createElement('label');
        moduleLabel.htmlFor = `module-${module.id}`;
        moduleLabel.textContent = module.name;
        moduleLabel.style.fontWeight = '500';

        moduleCheck.appendChild(moduleCheckbox);
        moduleCheck.appendChild(moduleLabel);
        moduleDiv.appendChild(moduleCheck);

        // 子模块权限
        if (module.subModules && module.subModules.length > 0) {
          const subModulesDiv = document.createElement('div');
          subModulesDiv.style.marginLeft = '20px';

          module.subModules.forEach(subModule => {
            const subModuleCheck = document.createElement('div');
            subModuleCheck.style.display = 'flex';
            subModuleCheck.style.alignItems = 'center';
            subModuleCheck.style.marginBottom = '5px';

            const subModuleCheckbox = document.createElement('input');
            subModuleCheckbox.type = 'checkbox';
            subModuleCheckbox.id = `submodule-${subModule.id}`;
            subModuleCheckbox.checked = permissions.some(p => p.submodule_id === subModule.id);
            subModuleCheckbox.style.marginRight = '8px';

            const subModuleLabel = document.createElement('label');
            subModuleLabel.htmlFor = `submodule-${subModule.id}`;
            subModuleLabel.textContent = subModule.name;

            subModuleCheck.appendChild(subModuleCheckbox);
            subModuleCheck.appendChild(subModuleLabel);
            subModulesDiv.appendChild(subModuleCheck);
          });

          moduleDiv.appendChild(subModulesDiv);
        }

        permissionsList.appendChild(moduleDiv);
      });

      modalContent.appendChild(permissionsList);

      // 创建按钮组
      const buttonGroup = document.createElement('div');
      buttonGroup.style.display = 'flex';
      buttonGroup.style.justifyContent = 'flex-end';
      buttonGroup.style.gap = '10px';
      buttonGroup.style.marginTop = '20px';

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
      modalContent.appendChild(buttonGroup);

      // 添加模态框到页面
      modal.appendChild(modalContent);
      document.body.appendChild(modal);

      // 取消按钮事件
      cancelButton.addEventListener('click', () => {
        document.body.removeChild(modal);
      });

      // 保存按钮事件
      saveButton.addEventListener('click', async () => {
        try {
          // 收集权限数据
          const newPermissions = [];
          moduleManager.modules.forEach(module => {
            const moduleCheckbox = document.getElementById(`module-${module.id}`);
            if (moduleCheckbox && moduleCheckbox.checked) {
              newPermissions.push({
                user_id: user.id,
                module_id: module.id
              });
            }

            if (module.subModules) {
              module.subModules.forEach(subModule => {
                const subModuleCheckbox = document.getElementById(`submodule-${subModule.id}`);
                if (subModuleCheckbox && subModuleCheckbox.checked) {
                  newPermissions.push({
                    user_id: user.id,
                    module_id: module.id,
                    submodule_id: subModule.id
                  });
                }
              });
            }
          });

          // 删除旧权限
          await this.supabase
            .from('user_permissions')
            .delete()
            .eq('user_id', user.id);

          // 添加新权限
          if (newPermissions.length > 0) {
            const { error } = await this.supabase
              .from('user_permissions')
              .insert(newPermissions);

            if (error) throw error;
          }

          document.body.removeChild(modal);
          this.showNotification('权限更新成功');
        } catch (error) {
          console.error('更新权限失败:', error);
          this.showNotification(error.message, 'error');
        }
      });
    } catch (error) {
      console.error('显示权限管理器失败:', error);
      this.showNotification(error.message, 'error');
    }
  }

  /**
   * 添加简单的新建用户按钮
   */
  addSimpleNewUserButton() {
    // 延迟执行，确保DOM已完全加载
    setTimeout(() => {
      // 找到用户管理选项卡内容
      const userTab = document.querySelector('.tab-pane.active');
      if (!userTab) return;
      
      // 找到表格
      const table = userTab.querySelector('table');
      if (!table) return;
      
      // 检查是否已存在按钮
      if (userTab.querySelector('#simple-add-user-btn')) return;
      
      // 创建按钮容器
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.justifyContent = 'flex-end';
      buttonContainer.style.marginBottom = '15px';
      
      // 创建按钮
      const addButton = document.createElement('button');
      addButton.id = 'simple-add-user-btn';
      addButton.innerHTML = '<i class="fas fa-plus"></i> 新建用户';
      addButton.style.backgroundColor = '#6366F1';
      addButton.style.color = 'white';
      addButton.style.border = 'none';
      addButton.style.borderRadius = '4px';
      addButton.style.padding = '8px 16px';
      addButton.style.cursor = 'pointer';
      addButton.style.fontSize = '14px';
      
      // 添加点击事件
      addButton.addEventListener('click', () => {
        this.showUserForm();
      });
      
      // 添加按钮到容器
      buttonContainer.appendChild(addButton);
      
      // 将按钮容器插入到表格前面
      table.parentNode.insertBefore(buttonContainer, table);
      
      console.log('简单新建用户按钮已添加');
    }, 500);
  }
}

// 初始化用户管理器
document.addEventListener('DOMContentLoaded', function() {
  try {
    window.userManager = new UserManager();
  } catch (error) {
    console.error('用户管理器初始化失败:', error);
  }
}); 