// Login and Registration functionality
let users = JSON.parse(localStorage.getItem('finapp_users')) || {};
let isDarkMode = localStorage.getItem('finapp_darkMode') === 'true';

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('finapp_currentUser');
    if (currentUser) {
        window.location.href = 'app.html';
    }
    
    // Initialize dark mode
    initializeDarkModeLogin();
    
    // Set up form event listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
});

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showMessage('Por favor, preencha todos os campos', 'error');
        return;
    }
    
    if (users[username] && users[username].password === password) {
        // Login successful
        localStorage.setItem('finapp_currentUser', username);
        showMessage('Login realizado com sucesso!', 'success');
        
        // Redirect to main app after a short delay
        setTimeout(() => {
            window.location.href = 'app.html';
        }, 1000);
    } else {
        showMessage('Usuário ou senha incorretos', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (!username || !password || !confirmPassword) {
        showMessage('Por favor, preencha todos os campos', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('As senhas não coincidem', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('A senha deve ter pelo menos 6 caracteres', 'error');
        return;
    }
    
    if (users[username]) {
        showMessage('Este usuário já existe', 'error');
        return;
    }
    
    // Create new user
    users[username] = {
        password: password,
        createdAt: new Date().toISOString()
    };
    
    // Save users to localStorage
    localStorage.setItem('finapp_users', JSON.stringify(users));
    
    showMessage('Conta criada com sucesso!', 'success');
    
    // Switch back to login form
    setTimeout(() => {
        showLoginForm();
        document.getElementById('loginForm').reset();
    }, 1500);
}

function showRegisterForm() {
    document.getElementById('loginCard').style.display = 'none';
    document.getElementById('registerCard').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('registerCard').style.display = 'none';
    document.getElementById('loginCard').style.display = 'block';
}

function showMessage(message, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Add to page
    document.querySelector('.login-container').appendChild(messageDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// ===== FUNÇÕES DE DARK MODE PARA LOGIN =====

function initializeDarkModeLogin() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        updateDarkModeButtonLogin(true);
    } else {
        document.body.classList.remove('dark-mode');
        updateDarkModeButtonLogin(false);
    }
}

function toggleDarkModeLogin() {
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        updateDarkModeButtonLogin(true);
        localStorage.setItem('finapp_darkMode', 'true');
        showMessage('Modo escuro ativado', 'success');
    } else {
        document.body.classList.remove('dark-mode');
        updateDarkModeButtonLogin(false);
        localStorage.setItem('finapp_darkMode', 'false');
        showMessage('Modo claro ativado', 'success');
    }
}

function updateDarkModeButtonLogin(isDark) {
    const darkModeBtns = document.querySelectorAll('.dark-mode-btn-login');
    darkModeBtns.forEach(btn => {
        if (isDark) {
            btn.classList.add('active');
            btn.innerHTML = '<i class="fas fa-sun"></i>';
            btn.title = 'Alternar para modo claro';
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '<i class="fas fa-moon"></i>';
            btn.title = 'Alternar para modo escuro';
        }
    });
}
