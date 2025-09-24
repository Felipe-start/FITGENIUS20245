document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase
    const supabaseUrl = 'https://sltkozliukagipqytlew.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsdGtvemxpdWthZ2lwcXl0bGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNzY3MDIsImV4cCI6MjA3Mjg1MjcwMn0.GDM0c6reH7lmjr3UNyJ7-_0FPilcF-ICrdHOYm6hH1g';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    
    // Hide loader after page load
    setTimeout(() => {
        document.querySelector('.loader').classList.add('hidden');
    }, 1000);
    
    // Check if user is authenticated
    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = 'home.html';
        } else {
            // Update user info in the UI
            const user = session.user;
            const userBtn = document.querySelector('.user-btn span');
            if (userBtn && user.user_metadata && user.user_metadata.full_name) {
                userBtn.textContent = user.user_metadata.full_name;
            }
            
            const welcomeTitle = document.querySelector('.welcome-content h1');
            if (welcomeTitle && user.user_metadata && user.user_metadata.full_name) {
                welcomeTitle.textContent = `¡Bienvenido de nuevo, ${user.user_metadata.full_name.split(' ')[0]}!`;
            }
        }
    }
    
    checkAuth();
    
    // Mobile menu toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.querySelector('i').classList.toggle('fa-bars');
            navToggle.querySelector('i').classList.toggle('fa-times');
        });
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const { error } = await supabase.auth.signOut();
            if (!error) {
                window.location.href = 'login.html';
            } else {
                console.error('Error al cerrar sesión:', error.message);
            }
        });
    }
    
    // Workout card interactions
    const workoutCards = document.querySelectorAll('.workout-card');
    workoutCards.forEach(card => {
        card.addEventListener('click', () => {
            const workoutTitle = card.querySelector('h3').textContent;
            alert(`Comenzando: ${workoutTitle}`);
        });
    });
    
    // Update stats periodically (simulated)
    setInterval(() => {
        const caloriesElem = document.querySelector('.stat-info h3');
        if (caloriesElem) {
            const currentCalories = parseInt(caloriesElem.textContent.replace(',', ''));
            caloriesElem.textContent = (currentCalories + 5).toLocaleString();
        }
    }, 60000);
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add animation to elements when they come into view
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.stat-card, .workout-card, .achievement-card').forEach(el => {
        observer.observe(el);
    });
});