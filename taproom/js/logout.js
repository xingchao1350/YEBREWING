document.addEventListener('DOMContentLoaded', function() {
    // 获取退出链接
    const logoutLink = document.querySelector('.sidebar-footer a[href="#logout"]');
    
    if (logoutLink) {
        // 添加点击事件监听器
        logoutLink.addEventListener('click', async function(e) {
            e.preventDefault(); // 阻止默认的链接行为
            
            try {
                // 显示退出中的提示
                const notification = document.createElement('div');
                notification.textContent = '正在退出登录...';
                notification.style.position = 'fixed';
                notification.style.top = '20px';
                notification.style.right = '20px';
                notification.style.padding = '10px 20px';
                notification.style.backgroundColor = '#3B82F6';
                notification.style.color = 'white';
                notification.style.borderRadius = '4px';
                notification.style.zIndex = '9999';
                document.body.appendChild(notification);
                
                // 调用 Supabase 的退出方法
                const { error } = await supabase.auth.signOut();
                
                if (error) {
                    throw error;
                }
                
                // 清除本地存储中的会话数据
                localStorage.removeItem('supabase.auth.token');
                
                // 显示成功提示
                notification.textContent = '退出成功，即将跳转...';
                notification.style.backgroundColor = '#10B981';
                
                // 延迟后重定向到登录页面
                setTimeout(() => {
                    window.location.href = 'login.html'; // 替换为您的登录页面路径
                }, 1500);
                
            } catch (error) {
                console.error('退出登录失败:', error);
                
                // 显示错误提示
                const errorNotification = document.createElement('div');
                errorNotification.textContent = '退出失败: ' + error.message;
                errorNotification.style.position = 'fixed';
                errorNotification.style.top = '20px';
                errorNotification.style.right = '20px';
                errorNotification.style.padding = '10px 20px';
                errorNotification.style.backgroundColor = '#EF4444';
                errorNotification.style.color = 'white';
                errorNotification.style.borderRadius = '4px';
                errorNotification.style.zIndex = '9999';
                document.body.appendChild(errorNotification);
                
                // 延迟后移除错误提示
                setTimeout(() => {
                    if (document.body.contains(errorNotification)) {
                        document.body.removeChild(errorNotification);
                    }
                }, 3000);
            }
        });
    } else {
        console.warn('退出链接未找到');
    }
});