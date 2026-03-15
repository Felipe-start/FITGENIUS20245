// auth.js - Versión actualizada solo con Supabase
document.addEventListener('DOMContentLoaded', function() {
    // Configuración de Supabase
    const SUPABASE_URL = 'https://mbrlhpqbjypdrgsjqycs.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icmxocHFianlwZHJnc2pxeWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NDU1MDYsImV4cCI6MjA4OTEyMTUwNn0.C5plEF0kwXqkGBqq_iSO0XLFdMPkrI9DEXbXCAQ8YCA';
    
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Hide loader after page load
    setTimeout(() => {
        document.querySelector('.loader')?.classList.add('hidden');
    }, 1000);
    
    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const eyeIcon = this.querySelector('i');
            eyeIcon.classList.toggle('fa-eye');
            eyeIcon.classList.toggle('fa-eye-slash');
        });
    }
    
    // Check if user is already logged in
    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            window.location.href = 'home.html';
        }
    }
    
    checkAuth();
    
    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
            submitBtn.disabled = true;
            
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (error) throw error;
                
                showMessage('¡Inicio de sesión exitoso!', 'success');
                
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1000);
            } catch (error) {
                showMessage(error.message || 'Error al iniciar sesión', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const { error } = await supabase.auth.signOut();
            if (!error) {
                window.location.href = 'login.html';
            } else {
                showMessage('Error al cerrar sesión', 'error');
            }
        });
    }
    
    // Show message function
    function showMessage(message, type) {
        // Remove any existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create new message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        
        // Style the message
        messageEl.style.cssText = `
            padding: 10px 15px;
            border-radius: 5px;
            margin-bottom: 15px;
            text-align: center;
            font-size: 14px;
            ${type === 'error' ? 'background: #fee; color: #c33;' : 'background: #e8f5e9; color: #2e7d32;'}
        `;
        
        // Insert after the form header
        const authHeader = document.querySelector('.auth-header');
        if (authHeader) {
            authHeader.parentNode.insertBefore(messageEl, authHeader.nextSibling);
        } else {
            document.querySelector('.auth-form').prepend(messageEl);
        }
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                messageEl.remove();
            }, 500);
        }, 5000);
    }
    
    // Social login handlers
    const googleBtn = document.querySelector('.btn-google');
    const facebookBtn = document.querySelector('.btn-facebook');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            try {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: window.location.origin + '/home.html'
                    }
                });
                
                if (error) throw error;
            } catch (error) {
                showMessage(error.message || 'Error con Google', 'error');
            }
        });
    }
    
    if (facebookBtn) {
        facebookBtn.addEventListener('click', async () => {
            try {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'facebook',
                    options: {
                        redirectTo: window.location.origin + '/home.html'
                    }
                });
                
                if (error) throw error;
            } catch (error) {
                showMessage(error.message || 'Error con Facebook', 'error');
            }
        });
    }
});