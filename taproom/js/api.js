// API服务

// 基础URL
const BASE_URL = 'https://api.example.com';

// 创建Supabase客户端
const apiSupabase = window.supabase.createClient(
    'https://your-supabase-url.supabase.co',
    'your-supabase-anon-key'
);

// API服务对象
const api = {
    // 角色管理API
    roles: {
        // 获取所有角色
        async getAll() {
            try {
                // 这里使用模拟数据，实际项目中应该使用Supabase或其他后端API
                // const { data, error } = await apiSupabase.from('roles').select('*');
                
                // 模拟API响应延迟
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // 模拟数据
                const data = [
                    {
                        id: 1,
                        name: '超级管理员',
                        description: '拥有系统的所有权限，可以管理所有功能和用户。',
                        userCount: 1,
                        permissions: ['所有权限'],
                        color: 'admin',
                        isDefault: true
                    },
                    {
                        id: 2,
                        name: '店铺经理',
                        description: '管理店铺日常运营，包括排班、库存和基础报表。',
                        userCount: 3,
                        permissions: ['排班管理', '库存管理', '基础报表', '员工管理'],
                        color: 'manager',
                        isDefault: false
                    },
                    {
                        id: 3,
                        name: '普通员工',
                        description: '执行日常工作，查看自己的排班和基本信息。',
                        userCount: 12,
                        permissions: ['查看排班', '个人信息'],
                        color: 'staff',
                        isDefault: false
                    }
                ];
                
                return { data, error: null };
            } catch (error) {
                console.error('获取角色列表失败:', error);
                return { data: null, error };
            }
        },
        
        // 获取单个角色
        async getById(id) {
            try {
                // 实际项目中应该使用Supabase或其他后端API
                // const { data, error } = await apiSupabase.from('roles').select('*').eq('id', id).single();
                
                // 模拟API响应延迟
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // 模拟数据
                const roles = [
                    {
                        id: 1,
                        name: '超级管理员',
                        description: '拥有系统的所有权限，可以管理所有功能和用户。',
                        userCount: 1,
                        permissions: ['所有权限'],
                        color: 'admin',
                        isDefault: true
                    },
                    {
                        id: 2,
                        name: '店铺经理',
                        description: '管理店铺日常运营，包括排班、库存和基础报表。',
                        userCount: 3,
                        permissions: ['排班管理', '库存管理', '基础报表', '员工管理'],
                        color: 'manager',
                        isDefault: false
                    },
                    {
                        id: 3,
                        name: '普通员工',
                        description: '执行日常工作，查看自己的排班和基本信息。',
                        userCount: 12,
                        permissions: ['查看排班', '个人信息'],
                        color: 'staff',
                        isDefault: false
                    }
                ];
                
                const data = roles.find(role => role.id === parseInt(id));
                const error = data ? null : new Error('角色不存在');
                
                return { data, error };
            } catch (error) {
                console.error(`获取角色ID:${id}失败:`, error);
                return { data: null, error };
            }
        },
        
        // 创建角色
        async create(roleData) {
            try {
                // 实际项目中应该使用Supabase或其他后端API
                // const { data, error } = await apiSupabase.from('roles').insert([roleData]).select();
                
                // 模拟API响应延迟
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // 模拟创建成功
                const data = {
                    id: 4, // 模拟新ID
                    ...roleData,
                    userCount: 0,
                    isDefault: false
                };
                
                return { data, error: null };
            } catch (error) {
                console.error('创建角色失败:', error);
                return { data: null, error };
            }
        },
        
        // 更新角色
        async update(id, roleData) {
            try {
                // 实际项目中应该使用Supabase或其他后端API
                // const { data, error } = await apiSupabase.from('roles').update(roleData).eq('id', id).select();
                
                // 模拟API响应延迟
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // 模拟更新成功
                const data = {
                    id: parseInt(id),
                    ...roleData
                };
                
                return { data, error: null };
            } catch (error) {
                console.error(`更新角色ID:${id}失败:`, error);
                return { data: null, error };
            }
        },
        
        // 删除角色
        async delete(id) {
            try {
                // 实际项目中应该使用Supabase或其他后端API
                // const { data, error } = await apiSupabase.from('roles').delete().eq('id', id);
                
                // 模拟API响应延迟
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // 模拟删除成功
                return { data: { success: true }, error: null };
            } catch (error) {
                console.error(`删除角色ID:${id}失败:`, error);
                return { data: null, error };
            }
        },
        
        // 获取角色权限
        async getPermissions(id) {
            try {
                // 实际项目中应该使用Supabase或其他后端API
                // const { data, error } = await apiSupabase.from('role_permissions').select('*').eq('role_id', id);
                
                // 模拟API响应延迟
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // 模拟数据
                let data = [];
                
                if (id == 1) { // 超级管理员
                    // 所有权限
                    data = [
                        'user_view', 'user_create', 'user_edit', 'user_delete',
                        'role_view', 'role_create', 'role_edit', 'role_delete',
                        'schedule_view', 'schedule_create', 'schedule_edit', 'schedule_delete',
                        'inventory_view', 'inventory_add', 'inventory_edit', 'inventory_delete',
                        'report_basic', 'report_sales', 'report_inventory', 'report_employee',
                        'settings_view', 'settings_edit', 'settings_backup', 'settings_restore'
                    ];
                } else if (id == 2) { // 店铺经理
                    data = [
                        'user_view', 'user_create', 'user_edit',
                        'role_view',
                        'schedule_view', 'schedule_create', 'schedule_edit', 'schedule_delete',
                        'inventory_view', 'inventory_add', 'inventory_edit', 'inventory_delete',
                        'report_basic', 'report_sales', 'report_inventory', 'report_employee',
                        'settings_view'
                    ];
                } else if (id == 3) { // 普通员工
                    data = [
                        'schedule_view',
                        'inventory_view'
                    ];
                }
                
                return { data, error: null };
            } catch (error) {
                console.error(`获取角色ID:${id}的权限失败:`, error);
                return { data: null, error };
            }
        },
        
        // 更新角色权限
        async updatePermissions(id, permissions) {
            try {
                // 实际项目中应该使用Supabase或其他后端API
                // 首先删除现有权限
                // await apiSupabase.from('role_permissions').delete().eq('role_id', id);
                
                // 然后添加新权限
                // const permissionData = permissions.map(permId => ({
                //     role_id: id,
                //     permission_id: permId
                // }));
                // const { data, error } = await apiSupabase.from('role_permissions').insert(permissionData);
                
                // 模拟API响应延迟
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // 模拟更新成功
                return { data: { success: true, permissions }, error: null };
            } catch (error) {
                console.error(`更新角色ID:${id}的权限失败:`, error);
                return { data: null, error };
            }
        }
    },
    
    // 用户管理API
    users: {
        // 获取所有用户
        async getAll() {
            try {
                // 实际项目中应该使用Supabase或其他后端API
                // const { data, error } = await apiSupabase.from('users').select('*, roles(*)');
                
                // 模拟API响应延迟
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // 模拟数据
                const data = [
                    {
                        id: 1,
                        name: '张三',
                        email: 'zhangsan@example.com',
                        role: {
                            id: 1,
                            name: '超级管理员',
                            color: 'admin'
                        },
                        status: 'active',
                        lastLogin: '2023-06-15 14:30'
                    },
                    {
                        id: 2,
                        name: '李四',
                        email: 'lisi@example.com',
                        role: {
                            id: 2,
                            name: '店铺经理',
                            color: 'manager'
                        },
                        status: 'active',
                        lastLogin: '2023-06-14 09:15'
                    },
                    {
                        id: 3,
                        name: '王五',
                        email: 'wangwu@example.com',
                        role: {
                            id: 2,
                            name: '店铺经理',
                            color: 'manager'
                        },
                        status: 'active',
                        lastLogin: '2023-06-13 16:45'
                    },
                    {
                        id: 4,
                        name: '赵六',
                        email: 'zhaoliu@example.com',
                        role: {
                            id: 3,
                            name: '普通员工',
                            color: 'staff'
                        },
                        status: 'inactive',
                        lastLogin: '2023-05-30 11:20'
                    },
                    {
                        id: 5,
                        name: '钱七',
                        email: 'qianqi@example.com',
                        role: {
                            id: 3,
                            name: '普通员工',
                            color: 'staff'
                        },
                        status: 'locked',
                        lastLogin: '2023-06-01 08:10'
                    }
                ];
                
                return { data, error: null };
            } catch (error) {
                console.error('获取用户列表失败:', error);
                return { data: null, error };
            }
        },
        
        // 更新用户角色
        async updateRole(userId, roleId) {
            try {
                // 实际项目中应该使用Supabase或其他后端API
                // const { data, error } = await apiSupabase.from('users').update({ role_id: roleId }).eq('id', userId);
                
                // 模拟API响应延迟
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // 模拟更新成功
                return { data: { success: true }, error: null };
            } catch (error) {
                console.error(`更新用户ID:${userId}的角色失败:`, error);
                return { data: null, error };
            }
        }
    },
    
    // 权限管理API
    permissions: {
        // 获取所有权限
        async getAll() {
            try {
                // 实际项目中应该使用Supabase或其他后端API
                // const { data, error } = await apiSupabase.from('permissions').select('*');
                
                // 模拟API响应延迟
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // 模拟数据
                const data = [
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
                    },
                    {
                        group: '库存管理',
                        items: [
                            { id: 'inventory_view', name: '查看库存' },
                            { id: 'inventory_add', name: '添加库存' },
                            { id: 'inventory_edit', name: '编辑库存' },
                            { id: 'inventory_delete', name: '删除库存' }
                        ]
                    },
                    {
                        group: '报表管理',
                        items: [
                            { id: 'report_basic', name: '基础报表' },
                            { id: 'report_sales', name: '销售报表' },
                            { id: 'report_inventory', name: '库存报表' },
                            { id: 'report_employee', name: '员工报表' }
                        ]
                    },
                    {
                        group: '系统设置',
                        items: [
                            { id: 'settings_view', name: '查看设置' },
                            { id: 'settings_edit', name: '编辑设置' },
                            { id: 'settings_backup', name: '系统备份' },
                            { id: 'settings_restore', name: '系统恢复' }
                        ]
                    }
                ];
                
                return { data, error: null };
            } catch (error) {
                console.error('获取权限列表失败:', error);
                return { data: null, error };
            }
        }
    }
};

// 导出API服务
window.api = api; 