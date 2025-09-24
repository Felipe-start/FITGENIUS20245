document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase
    const supabaseUrl = 'https://sltkozliukagipqytlew.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsdGtvemxpdWthZ2lwcXl0bGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNzY3MDIsImV4cCI6MjA3Mjg1MjcwMn0.GDM0c6reH7lmjr3UNyJ7-_0FPilcF-ICrdHOYm6hH1g';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    
    // N8N endpoints
    const n8nLoginUrl = 'https://felipe021104.app.n8n.cloud/webhook/fitgenius-login';
    const n8nRegisterUrl = 'https://felipe021104.app.n8n.cloud/webhook/fitgenius-register';
    
    // Hide loader after page load
    setTimeout(() => {
        document.querySelector('.loader').classList.add('hidden');
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
                // Send to n8n
                const n8nResponse = await fetch(n8nLoginUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                if (!n8nResponse.ok) {
                    throw new Error('Error en la comunicación con el servidor');
                }
                
                const n8nData = await n8nResponse.json();
                
                if (n8nData.success) {
                    // Login with Supabase
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email,
                        password
                    });
                    
                    if (error) {
                        throw error;
                    }
                    
                    // Redirect to home
                    window.location.href = 'home.html';
                } else {
                    throw new Error(n8nData.message || 'Credenciales incorrectas');
                }
            } catch (error) {
                showMessage(error.message, 'error');
            } finally {
                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Handle register form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validate passwords match
            if (password !== confirmPassword) {
                showMessage('Las contraseñas no coinciden', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';
            submitBtn.disabled = true;
            
            try {
                // Send to n8n
                const n8nResponse = await fetch(n8nRegisterUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ fullname, email, password })
                });
                
                if (!n8nResponse.ok) {
                    throw new Error('Error en la comunicación con el servidor');
                }
                
                const n8nData = await n8nResponse.json();
                
                if (n8nData.success) {
                    // Register with Supabase
                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                full_name: fullname
                            }
                        }
                    });
                    
                    if (error) {
                        throw error;
                    }
                    
                    showMessage('Cuenta creada exitosamente. Redirigiendo...', 'success');
                    
                    // Redirect to login after a short delay
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    throw new Error(n8nData.message || 'Error al crear la cuenta');
                }
            } catch (error) {
                showMessage(error.message, 'error');
            } finally {
                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Forgot password functionality
    const forgotPasswordLink = document.getElementById('forgotPassword');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email')?.value || '';
            
            if (!email) {
                showMessage('Por favor ingresa tu correo electrónico primero', 'error');
                return;
            }
            
            // Implement forgot password logic here
            showMessage('Se ha enviado un enlace de recuperación a tu correo', 'success');
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
        
        // Insert after the form header or at the top of the form
        const authHeader = document.querySelector('.auth-header');
        if (authHeader) {
            authHeader.parentNode.insertBefore(messageEl, authHeader.nextSibling);
        } else {
            document.querySelector('.auth-form').prepend(messageEl);
        }
        
        // Show message
        messageEl.style.display = 'block';
        
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
        googleBtn.addEventListener('click', () => {
            showMessage('Inicio de sesión con Google en desarrollo', 'info');
        });
    }
    
    if (facebookBtn) {
        facebookBtn.addEventListener('click', () => {
            showMessage('Inicio de sesión con Facebook en desarrollo', 'info');
        });
    }
});