// 角色管理页面的JavaScript功能

document.addEventListener('DOMContentLoaded', async function() {
    // 显示加载状态
    showLoading();
    
    try {
        // 初始化标签页功能
        initTabs();
        
        // 初始化角色管理功能
        await initRoleManagement();
        
        // 初始化用户列表功能
        await initUserList();
        
        // 初始化权限设置功能
        await initPermissionSettings();
        
        // 初始化模态框功能
        initModals();
        
        // 隐藏加载状态
        hideLoading();
    } catch (error) {
        console.error('初始化角色管理页面失败:', error);
        showError('加载页面数据失败，请刷新页面重试。');
        hideLoading();
    }
});

// 显示加载状态
function showLoading() {
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading-overlay';
    loadingEl.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">加载中...</div>
    `;
    document.body.appendChild(loadingEl);
}

// 隐藏加载状态
function hideLoading() {
    const loadingEl = document.querySelector('.loading-overlay');
    if (loadingEl) {
        loadingEl.remove();
    }
}

// 显示错误信息
function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    document.body.appendChild(errorEl);
    
    // 3秒后自动移除
    setTimeout(() => {
        errorEl.remove();
    }, 3000);
}

// 初始化标签页功能
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有标签按钮的active类
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // 移除所有标签内容的active类
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // 为当前点击的按钮添加active类
            button.classList.add('active');
            
            // 获取目标标签内容的ID
            const targetId = button.getAttribute('data-target');
            
            // 为目标标签内容添加active类
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// 初始化角色管理功能
async function initRoleManagement() {
    try {
        // 使用API获取角色数据
        const { data: roles, error } = await window.api.roles.getAll();
        
        if (error) {
            throw error;
        }
        
        // 渲染角色卡片
        renderRoleCards(roles);
        
        // 添加角色按钮事件
        const addRoleBtn = document.querySelector('.add-role-btn');
        if (addRoleBtn) {
            addRoleBtn.addEventListener('click', () => {
                openModal('addRoleModal');
            });
        }
    } catch (error) {
        console.error('初始化角色管理功能失败:', error);
        showError('加载角色数据失败，请刷新页面重试。');
    }
}

// 渲染角色卡片
function renderRoleCards(roles) {
    const rolesListContainer = document.querySelector('.roles-list');
    if (!rolesListContainer) return;
    
    rolesListContainer.innerHTML = '';
    
    roles.forEach(role => {
        const roleCard = document.createElement('div');
        roleCard.className = 'role-card';
        roleCard.dataset.roleId = role.id;
        
        const permissionTags = role.permissions.map(permission => 
            `<span class="tag">${permission}</span>`
        ).join('');
        
        roleCard.innerHTML = `
            <div class="role-header">
                <div class="role-icon ${role.color}">
                    <i class="fas fa-user-shield"></i>
                </div>
                <div class="role-info">
                    <h3>${role.name}</h3>
                    <span class="role-count">${role.userCount} 用户</span>
                </div>
                <div class="role-actions">
                    <button class="action-btn view-btn" title="查看详情">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" title="编辑角色" ${role.isDefault ? 'disabled' : ''}>
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" title="删除角色" ${role.isDefault ? 'disabled' : ''}>
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="role-body">
                <p>${role.description}</p>
                <div class="permission-tags">
                    ${permissionTags}
                </div>
            </div>
        `;
        
        // 添加角色卡片事件
        roleCard.querySelector('.view-btn').addEventListener('click', () => viewRole(role.id));
        
        if (!role.isDefault) {
            roleCard.querySelector('.edit-btn').addEventListener('click', () => editRole(role.id));
            roleCard.querySelector('.delete-btn').addEventListener('click', () => deleteRole(role.id));
        }
        
        rolesListContainer.appendChild(roleCard);
    });
    
    // 更新权限设置侧边栏
    updatePermissionsSidebar(roles);
}

// 查看角色详情
async function viewRole(roleId) {
    console.log(`查看角色ID: ${roleId} 的详情`);
    
    try {
        // 使用API获取角色详情
        const { data: role, error } = await window.api.roles.getById(roleId);
        
        if (error) {
            throw error;
        }
        
        // 这里可以实现查看角色详情的逻辑，例如显示一个模态框
        alert(`角色详情: ${role.name}\n描述: ${role.description}\n用户数: ${role.userCount}`);
    } catch (error) {
        console.error(`获取角色ID:${roleId}的详情失败:`, error);
        showError('获取角色详情失败，请重试。');
    }
}

// 编辑角色
async function editRole(roleId) {
    console.log(`编辑角色ID: ${roleId}`);
    
    try {
        // 使用API获取角色详情
        const { data: role, error } = await window.api.roles.getById(roleId);
        
        if (error) {
            throw error;
        }
        
        // 打开编辑模态框
        openModal('addRoleModal', role);
    } catch (error) {
        console.error(`获取角色ID:${roleId}的详情失败:`, error);
        showError('获取角色详情失败，请重试。');
    }
}

// 删除角色
async function deleteRole(roleId) {
    if (confirm('确定要删除这个角色吗？此操作不可撤销，该角色下的用户将失去相应权限。')) {
        try {
            // 显示加载状态
            showLoading();
            
            // 使用API删除角色
            const { data, error } = await window.api.roles.delete(roleId);
            
            if (error) {
                throw error;
            }
            
            // 隐藏加载状态
            hideLoading();
            
            // 显示成功消息
            showError('角色删除成功！');
            
            // 重新加载角色列表
            const { data: roles } = await window.api.roles.getAll();
            renderRoleCards(roles);
        } catch (error) {
            console.error(`删除角色ID:${roleId}失败:`, error);
            hideLoading();
            showError('删除角色失败，请重试。');
        }
    }
}

// 初始化用户列表功能
async function initUserList() {
    try {
        // 使用API获取用户数据
        const { data: users, error } = await window.api.users.getAll();
        
        if (error) {
            throw error;
        }
        
        // 渲染用户列表
        renderUserList(users);
        
        // 添加筛选事件
        const roleFilter = document.getElementById('roleFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (roleFilter) {
            roleFilter.addEventListener('change', () => {
                filterUsers(users);
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                filterUsers(users);
            });
        }
    } catch (error) {
        console.error('初始化用户列表功能失败:', error);
        showError('加载用户数据失败，请刷新页面重试。');
    }
}

// 渲染用户列表
function renderUserList(users, filters = {}) {
    const userTableBody = document.querySelector('.users-table tbody');
    if (!userTableBody) return;
    
    // 应用筛选
    let filteredUsers = users;
    
    if (filters.role) {
        filteredUsers = filteredUsers.filter(user => user.role.id == filters.role);
    }
    
    if (filters.status) {
        filteredUsers = filteredUsers.filter(user => user.status === filters.status);
    }
    
    userTableBody.innerHTML = '';
    
    if (filteredUsers.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="5" style="text-align: center;">没有找到匹配的用户</td>`;
        userTableBody.appendChild(emptyRow);
        return;
    }
    
    filteredUsers.forEach(user => {
        const userRow = document.createElement('tr');
        
        // 获取状态文本和类
        let statusText, statusClass;
        switch (user.status) {
            case 'active':
                statusText = '活跃';
                statusClass = 'active';
                break;
            case 'inactive':
                statusText = '非活跃';
                statusClass = 'inactive';
                break;
            case 'locked':
                statusText = '已锁定';
                statusClass = 'locked';
                break;
            default:
                statusText = user.status;
                statusClass = '';
        }
        
        userRow.innerHTML = `
            <td>
                <div class="user-cell">
                    <div class="avatar small ${user.role.color}">
                        ${user.name.charAt(0)}
                    </div>
                    <div>
                        <div class="user-name">${user.name}</div>
                        <div class="user-email">${user.email}</div>
                    </div>
                </div>
            </td>
            <td>
                <span class="role-badge ${user.role.color}">${user.role.name}</span>
            </td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </td>
            <td>${user.lastLogin}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit-btn" title="编辑用户">
                        <i class="fas fa-user-edit"></i>
                    </button>
                    <button class="action-btn" title="重置密码">
                        <i class="fas fa-key"></i>
                    </button>
                    <button class="action-btn ${user.status === 'locked' ? 'view-btn' : 'delete-btn'}" 
                            title="${user.status === 'locked' ? '解锁账户' : '锁定账户'}">
                        <i class="fas ${user.status === 'locked' ? 'fa-unlock' : 'fa-lock'}"></i>
                    </button>
                </div>
            </td>
        `;
        
        // 添加用户行事件
        userRow.querySelector('.edit-btn').addEventListener('click', () => editUser(user.id));
        
        userTableBody.appendChild(userRow);
    });
}

// 筛选用户
function filterUsers(users) {
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    const filters = {};
    
    if (roleFilter && roleFilter.value) {
        filters.role = roleFilter.value;
    }
    
    if (statusFilter && statusFilter.value) {
        filters.status = statusFilter.value;
    }
    
    renderUserList(users, filters);
}

// 编辑用户
async function editUser(userId) {
    console.log(`编辑用户ID: ${userId}`);
    
    // 这里可以实现编辑用户的逻辑，例如打开一个模态框
    alert(`编辑用户ID: ${userId}`);
}

// 初始化权限设置功能
async function initPermissionSettings() {
    try {
        // 检查API对象是否存在
        if (!window.api || !window.api.permissions) {
            console.error('API对象未正确初始化');
            // 创建一个模拟的权限数据
            const permissions = [
                {
                    group: '用户管理',
                    items: [
                        { id: 'user_view', name: '查看用户' },
                        { id: 'user_create', name: '创建用户' },
                        { id: 'user_edit', name: '编辑用户' },
                        { id: 'user_delete', name: '删除用户' }
                    ]
                },
                {
                    group: '角色管理',
                    items: [
                        { id: 'role_view', name: '查看角色' },
                        { id: 'role_create', name: '创建角色' },
                        { id: 'role_edit', name: '编辑角色' },
                        { id: 'role_delete', name: '删除角色' }
                    ]
                },
                {
                    group: '排班管理',
                    items: [
                        { id: 'schedule_view', name: '查看排班' },
                        { id: 'schedule_create', name: '创建排班' },
                        { id: 'schedule_edit', name: '编辑排班' },
                        { id: 'schedule_delete', name: '删除排班' }
                    ]
                }
            ];
            
            // 渲染权限组
            renderPermissionGroups(permissions);
        } else {
            // 使用API获取权限数据
            const { data: permissions, error } = await window.api.permissions.getAll();
            
            if (error) {
                throw error;
            }
            
            // 渲染权限组
            renderPermissionGroups(permissions);
        }
        
        // 添加全选按钮事件
        const selectAllBtn = document.querySelector('.select-all-btn');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                const permissionSwitches = document.querySelectorAll('.permission-item input[type="checkbox"]:not(:disabled)');
                const allChecked = Array.from(permissionSwitches).every(checkbox => checkbox.checked);
                
                permissionSwitches.forEach(checkbox => {
                    checkbox.checked = !allChecked;
                });
                
                selectAllBtn.textContent = allChecked ? '全选' : '取消全选';
            });
        }
        
        // 添加保存权限按钮事件
        const savePermissionsBtn = document.querySelector('.save-permissions-btn');
        if (savePermissionsBtn) {
            savePermissionsBtn.addEventListener('click', () => {
                savePermissions();
            });
        }
        
        // 添加角色项点击事件
        const roleItems = document.querySelectorAll('.permissions-role-item');
        roleItems.forEach(item => {
            item.addEventListener('click', () => {
                // 移除所有角色项的active类
                roleItems.forEach(ri => ri.classList.remove('active'));
                
                // 为当前点击的角色项添加active类
                item.classList.add('active');
                
                // 获取角色ID
                const roleId = item.dataset.roleId;
                
                // 加载该角色的权限
                loadRolePermissions(roleId);
            });
        });
    } catch (error) {
        console.error('初始化权限设置功能失败:', error);
        showError('加载权限数据失败，请刷新页面重试。');
    }
}

// 渲染权限组
function renderPermissionGroups(permissions) {
    const permissionsGroupsContainer = document.querySelector('.permissions-groups');
    if (!permissionsGroupsContainer) return;
    
    permissionsGroupsContainer.innerHTML = '';
    
    permissions.forEach(group => {
        const permissionGroup = document.createElement('div');
        permissionGroup.className = 'permission-group';
        
        const permissionItems = group.items.map(item => `
            <div class="permission-item">
                <span>${item.name}</span>
                <label class="toggle-switch">
                    <input type="checkbox" data-permission-id="${item.id}">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `).join('');
        
        permissionGroup.innerHTML = `
            <div class="permission-group-header">
                <h4>${group.group}</h4>
            </div>
            <div class="permission-items">
                ${permissionItems}
            </div>
        `;
        
        permissionsGroupsContainer.appendChild(permissionGroup);
    });
}

// 更新权限设置侧边栏
function updatePermissionsSidebar(roles) {
    const permissionsRoleList = document.querySelector('.permissions-role-list');
    if (!permissionsRoleList) return;
    
    permissionsRoleList.innerHTML = '';
    
    roles.forEach((role, index) => {
        const roleItem = document.createElement('div');
        roleItem.className = 'permissions-role-item' + (index === 0 ? ' active' : '');
        roleItem.dataset.roleId = role.id;
        
        roleItem.innerHTML = `
            <div class="role-icon ${role.color}">
                <i class="fas fa-user-shield"></i>
            </div>
            <span class="role-name">${role.name}</span>
        `;
        
        roleItem.addEventListener('click', () => {
            // 移除所有角色项的active类
            document.querySelectorAll('.permissions-role-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // 为当前点击的角色项添加active类
            roleItem.classList.add('active');
            
            // 加载该角色的权限
            loadRolePermissions(role.id);
        });
        
        permissionsRoleList.appendChild(roleItem);
    });
    
    // 默认加载第一个角色的权限
    if (roles.length > 0) {
        loadRolePermissions(roles[0].id);
    }
}

// 加载角色权限
async function loadRolePermissions(roleId) {
    try {
        // 显示加载状态
        const permissionsContent = document.querySelector('.permissions-content');
        if (permissionsContent) {
            permissionsContent.classList.add('loading');
        }
        
        // 使用API获取角色权限
        const { data: permissions, error } = await window.api.roles.getPermissions(roleId);
        
        if (error) {
            throw error;
        }
        
        // 获取角色信息
        const { data: role } = await window.api.roles.getById(roleId);
        
        // 重置所有权限
        document.querySelectorAll('.permission-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
            checkbox.disabled = false;
        });
        
        // 设置权限
        permissions.forEach(permId => {
            const checkbox = document.querySelector(`.permission-item input[data-permission-id="${permId}"]`);
            if (checkbox) checkbox.checked = true;
        });
        
        // 更新权限标题
        const permissionsHeader = document.querySelector('.permissions-header h3');
        if (permissionsHeader && role) {
            permissionsHeader.textContent = `${role.name}权限`;
        }
        
        // 如果是默认角色（如超级管理员），禁用权限编辑
        if (role && role.isDefault) {
            document.querySelectorAll('.permission-item input[type="checkbox"]').forEach(checkbox => {
                checkbox.disabled = true;
            });
            
            // 禁用保存按钮
            const saveBtn = document.querySelector('.save-permissions-btn');
            if (saveBtn) saveBtn.disabled = true;
            
            // 禁用全选按钮
            const selectAllBtn = document.querySelector('.select-all-btn');
            if (selectAllBtn) selectAllBtn.disabled = true;
        } else {
            // 启用保存按钮
            const saveBtn = document.querySelector('.save-permissions-btn');
            if (saveBtn) saveBtn.disabled = false;
            
            // 启用全选按钮
            const selectAllBtn = document.querySelector('.select-all-btn');
            if (selectAllBtn) selectAllBtn.disabled = false;
        }
        
        // 移除加载状态
        if (permissionsContent) {
            permissionsContent.classList.remove('loading');
        }
    } catch (error) {
        console.error(`加载角色ID:${roleId}的权限失败:`, error);
        showError('加载角色权限失败，请重试。');
        
        // 移除加载状态
        const permissionsContent = document.querySelector('.permissions-content');
        if (permissionsContent) {
            permissionsContent.classList.remove('loading');
        }
    }
}

// 保存权限
async function savePermissions() {
    try {
        // 获取当前选中的角色
        const activeRoleItem = document.querySelector('.permissions-role-item.active');
        if (!activeRoleItem) return;
        
        const roleId = activeRoleItem.dataset.roleId;
        
        // 获取所有选中的权限
        const selectedPermissions = [];
        document.querySelectorAll('.permission-item input[type="checkbox"]:checked').forEach(checkbox => {
            selectedPermissions.push(checkbox.dataset.permissionId);
        });
        
        // 显示加载状态
        showLoading();
        
        // 使用API保存权限
        const { data, error } = await window.api.roles.updatePermissions(roleId, selectedPermissions);
        
        if (error) {
            throw error;
        }
        
        // 隐藏加载状态
        hideLoading();
        
        // 显示成功消息
        showError('权限保存成功！');
    } catch (error) {
        console.error('保存权限失败:', error);
        hideLoading();
        showError('保存权限失败，请重试。');
    }
}

// 初始化模态框功能
function initModals() {
    // 关闭模态框按钮事件
    const closeButtons = document.querySelectorAll('.close-btn, .cancel-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeAllModals();
        });
    });
    
    // 点击模态框外部关闭
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
    
    // 添加角色表单提交事件
    const addRoleForm = document.getElementById('addRoleForm');
    if (addRoleForm) {
        addRoleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                // 获取表单数据
                const formData = new FormData(addRoleForm);
                const roleData = {
                    name: formData.get('roleName'),
                    description: formData.get('roleDescription'),
                    color: formData.get('roleColor'),
                    baseRole: formData.get('baseRole')
                };
                
                // 显示加载状态
                showLoading();
                
                // 检查是否是编辑模式
                const roleId = addRoleForm.dataset.roleId;
                let result;
                
                if (roleId) {
                    // 使用API更新角色
                    result = await window.api.roles.update(roleId, roleData);
                } else {
                    // 使用API创建角色
                    result = await window.api.roles.create(roleData);
                }
                
                const { error } = result;
                
                if (error) {
                    throw error;
                }
                
                // 隐藏加载状态
                hideLoading();
                
                // 显示成功消息
                showError(roleId ? '角色更新成功！' : '角色添加成功！');
                
                // 关闭模态框
                closeAllModals();
                
                // 重置表单
                addRoleForm.reset();
                delete addRoleForm.dataset.roleId;
                
                // 重新加载角色列表
                const { data: roles } = await window.api.roles.getAll();
                renderRoleCards(roles);
            } catch (error) {
                console.error('保存角色失败:', error);
                hideLoading();
                showError('保存角色失败，请重试。');
            }
        });
    }
}

// 打开模态框
function openModal(modalId, data = null) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // 如果有数据，可以填充表单
    if (data && modalId === 'addRoleModal') {
        const form = document.getElementById('addRoleForm');
        if (form) {
            // 设置表单为编辑模式
            form.dataset.roleId = data.id;
            
            // 填充表单数据
            const nameInput = form.querySelector('input[name="roleName"]');
            if (nameInput) nameInput.value = data.name;
            
            const descriptionInput = form.querySelector('textarea[name="roleDescription"]');
            if (descriptionInput) descriptionInput.value = data.description;
            
            const colorInputs = form.querySelectorAll('input[name="roleColor"]');
            colorInputs.forEach(input => {
                if (input.value === data.color) {
                    input.checked = true;
                }
            });
            
            const baseRoleSelect = form.querySelector('select[name="baseRole"]');
            if (baseRoleSelect) {
                const options = baseRoleSelect.querySelectorAll('option');
                options.forEach(option => {
                    if (option.value == data.id) {
                        option.selected = true;
                    }
                });
            }
            
            // 更新模态框标题
            const modalTitle = modal.querySelector('.modal-header h3');
            if (modalTitle) {
                modalTitle.textContent = '编辑角色';
            }
            
            // 更新提交按钮文本
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = '保存修改';
            }
        }
    } else if (modalId === 'addRoleModal') {
        // 重置表单
        const form = document.getElementById('addRoleForm');
        if (form) {
            form.reset();
            delete form.dataset.roleId;
            
            // 更新模态框标题
            const modalTitle = modal.querySelector('.modal-header h3');
            if (modalTitle) {
                modalTitle.textContent = '添加新角色';
            }
            
            // 更新提交按钮文本
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = '创建角色';
            }
        }
    }
    
    modal.classList.add('active');
    
    // 阻止页面滚动
    document.body.style.overflow = 'hidden';
}

// 关闭所有模态框
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
    
    // 恢复页面滚动
    document.body.style.overflow = '';
} 