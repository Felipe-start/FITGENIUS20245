// script.js - Versión actualizada
document.addEventListener('DOMContentLoaded', function() {
    // Loader
    const loader = document.querySelector('.loader');
    
    // Simular carga
    setTimeout(() => {
        loader?.classList.add('hidden');
    }, 1500);

    // Header scroll effect
    const header = document.querySelector('.main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.innerHTML = mainNav.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (mainNav?.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    });

    // Personalization form steps (si existe)
    const formSteps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.btn-next');
    const prevButtons = document.querySelectorAll('.btn-prev');
    
    let currentStep = 0;
    
    function showStep(stepIndex) {
        formSteps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });
        currentStep = stepIndex;
    }
    
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep < formSteps.length - 1) {
                showStep(currentStep + 1);
            }
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 0) {
                showStep(currentStep - 1);
            }
        });
    });

    // Testimonial slider
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    
    let currentTestimonial = 0;
    
    function showTestimonial(index) {
        testimonialCards.forEach(card => card.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        testimonialCards[index]?.classList.add('active');
        dots[index]?.classList.add('active');
        currentTestimonial = index;
    }
    
    if (nextBtn && prevBtn && testimonialCards.length > 0) {
        nextBtn.addEventListener('click', () => {
            let nextIndex = currentTestimonial + 1;
            if (nextIndex >= testimonialCards.length) nextIndex = 0;
            showTestimonial(nextIndex);
        });
        
        prevBtn.addEventListener('click', () => {
            let prevIndex = currentTestimonial - 1;
            if (prevIndex < 0) prevIndex = testimonialCards.length - 1;
            showTestimonial(prevIndex);
        });
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showTestimonial(index);
            });
        });
        
        // Auto-rotate testimonials
        setInterval(() => {
            let nextIndex = currentTestimonial + 1;
            if (nextIndex >= testimonialCards.length) nextIndex = 0;
            showTestimonial(nextIndex);
        }, 5000);
    }

    // Modal functionality (si existe)
    const modal = document.getElementById('planModal');
    const startBtn = document.getElementById('startBtn');
    const closeModal = document.querySelector('.modal-close');
    
    function openModal() {
        modal?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModalFunc() {
        modal?.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    if (startBtn && modal) {
        startBtn.addEventListener('click', openModal);
        closeModal?.addEventListener('click', closeModalFunc);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModalFunc();
            }
        });
    }
});