/**
 * 野鹅微醺门店管理系统 - 登录页面JavaScript
 */

// Supabase配置
const SUPABASE_URL = 'https://rrckxifdelcqnibwoxsx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyY2t4aWZkZWxjcW5pYndveHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczNzM3MTMsImV4cCI6MjA1Mjk0OTcxM30.vdOVQhrUS_Ykd78w9AX28IbekJhsTX2YixAPrRwAgh4';

// 初始化Supabase客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', function() {
    // 检查用户是否已登录
    checkUserSession();
    
    // 初始化登录表单
    initLoginForm();
    
    // 初始化密码显示切换
    initPasswordToggle();
    
    // 初始化记住我功能
    initRememberMe();
    
    // 初始化忘记密码功能
    initForgotPassword();
});

/**
 * 检查用户是否已登录
 */
async function checkUserSession() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (user) {
            // 用户已登录，重定向到主页
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('会话检查失败:', error.message);
    }
}

/**
 * 初始化登录表单
 */
function initLoginForm() {
    const loginButton = document.getElementById('login-button');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const loginMessage = document.getElementById('login-message');
    
    // 添加输入事件监听器，清除错误信息
    emailInput.addEventListener('input', () => {
        emailError.textContent = '';
        loginMessage.textContent = '';
        loginMessage.className = 'login-message';
    });
    
    passwordInput.addEventListener('input', () => {
        passwordError.textContent = '';
        loginMessage.textContent = '';
        loginMessage.className = 'login-message';
    });
    
    // 添加回车键登录功能
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginButton.click();
        }
    });
    
    // 登录按钮点击事件
    loginButton.addEventListener('click', async () => {
        // 清除之前的错误信息
        emailError.textContent = '';
        passwordError.textContent = '';
        loginMessage.textContent = '';
        loginMessage.className = 'login-message';
        
        // 获取输入值
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // 表单验证
        let isValid = true;
        
        if (!email) {
            emailError.textContent = '请输入邮箱地址';
            isValid = false;
        } else if (!isValidEmail(email)) {
            emailError.textContent = '请输入有效的邮箱地址';
            isValid = false;
        }
        
        if (!password) {
            passwordError.textContent = '请输入密码';
            isValid = false;
        }
        
        if (!isValid) {
            return;
        }
        
        // 显示加载状态
        loginButton.disabled = true;
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登录中...';
        
        try {
            // 使用Supabase进行身份验证
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) {
                throw error;
            }
            
            // 登录成功
            loginMessage.textContent = '登录成功，正在跳转...';
            loginMessage.className = 'login-message success';
            
            // 如果选择了"记住我"，设置本地存储
            if (document.getElementById('remember-me').checked) {
                localStorage.setItem('remember_email', email);
            } else {
                localStorage.removeItem('remember_email');
            }
            
            // 跳转到主页
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } catch (error) {
            console.error('登录失败:', error.message);
            
            // 显示错误信息
            loginMessage.textContent = getErrorMessage(error);
            loginMessage.className = 'login-message error';
            
            // 添加抖动效果
            const loginCard = document.querySelector('.login-card');
            loginCard.classList.add('shake');
            
            // 移除抖动效果
            setTimeout(() => {
                loginCard.classList.remove('shake');
            }, 600);
            
        } finally {
            // 恢复按钮状态
            loginButton.disabled = false;
            loginButton.innerHTML = '<span>登录</span><i class="fas fa-arrow-right"></i>';
        }
    });
}

/**
 * 初始化密码显示切换
 */
function initPasswordToggle() {
    const toggleButton = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    
    toggleButton.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // 切换图标
        toggleButton.innerHTML = type === 'password' 
            ? '<i class="fas fa-eye"></i>' 
            : '<i class="fas fa-eye-slash"></i>';
    });
}

/**
 * 初始化记住我功能
 */
function initRememberMe() {
    const emailInput = document.getElementById('email');
    const rememberMeCheckbox = document.getElementById('remember-me');
    
    // 检查是否有保存的邮箱
    const savedEmail = localStorage.getItem('remember_email');
    
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }
}

/**
 * 初始化忘记密码功能
 */
function initForgotPassword() {
    const forgotPasswordLink = document.querySelector('.forgot-password');
    
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        
        if (!email || !isValidEmail(email)) {
            alert('请先输入有效的邮箱地址');
            document.getElementById('email').focus();
            return;
        }
        
        // 这里可以添加忘记密码的逻辑，例如打开一个模态框或发送重置密码邮件
        alert('密码重置功能即将上线，请联系管理员重置密码。');
    });
}

/**
 * 验证邮箱格式
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * 获取错误信息
 */
function getErrorMessage(error) {
    // 根据错误类型返回友好的错误信息
    switch (error.message) {
        case 'Invalid login credentials':
            return '邮箱或密码错误，请重试';
        case 'Email not confirmed':
            return '邮箱未验证，请先验证邮箱';
        case 'User not found':
            return '用户不存在';
        case 'Too many requests':
            return '请求过于频繁，请稍后再试';
        default:
            return '登录失败，请稍后再试';
    }
} 