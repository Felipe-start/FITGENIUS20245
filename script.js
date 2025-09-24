document.addEventListener('DOMContentLoaded', function() {
    // Loader
    const loader = document.querySelector('.loader');
    
    // Simular carga
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 1500);

    // Header scroll effect
    const header = document.querySelector('.main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        menuToggle.innerHTML = mainNav.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

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
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    });

    // Personalization form steps
    const formSteps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.btn-next');
    const prevButtons = document.querySelectorAll('.btn-prev');
    const personalizationForm = document.getElementById('personalizationForm');
    
    let currentStep = 0;
    
    function showStep(stepIndex) {
        formSteps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });
        
        currentStep = stepIndex;
    }
    
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Validate current step before proceeding
            const currentStepForm = formSteps[currentStep];
            const inputs = currentStepForm.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value) {
                    input.classList.add('error');
                    isValid = false;
                } else {
                    input.classList.remove('error');
                }
            });
            
            if (isValid) {
                showStep(currentStep + 1);
            } else {
                // Add shake animation to indicate error
                currentStepForm.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    currentStepForm.style.animation = '';
                }, 500);
            }
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            showStep(currentStep - 1);
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
        
        testimonialCards[index].classList.add('active');
        dots[index].classList.add('active');
        currentTestimonial = index;
    }
    
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

    // Modal functionality
    const modal = document.getElementById('planModal');
    const startBtn = document.getElementById('startBtn');
    const closeModal = document.querySelector('.modal-close');
    
    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Generate plan content based on form data
        generatePlanContent();
    }
    
    function closeModalFunc() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    startBtn.addEventListener('click', openModal);
    closeModal.addEventListener('click', closeModalFunc);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalFunc();
        }
    });
    
    // Form submission
    personalizationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Here you would normally send the data to a server
        // For this demo, we'll just show the modal with the generated plan
        openModal();
    });
    
    // Generate plan content based on form data
    async function sendToN8N(formData) {
        const loader = document.querySelector('.loader');
        loader.classList.remove('hidden');
        
        try {
            const response = await fetch('https://dev-academy.n8n.itelisoft.org/webhook/fitgenius', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        } finally {
            loader.classList.add('hidden');
        }
    }

    // Modificar la función generatePlanContent para usar IA
    async function generatePlanContent() {
        const formData = new FormData(personalizationForm);
        
        // Convertir FormData a objeto JSON
        const workoutData = {
            age: formData.get('age'),
            gender: formData.get('gender'),
            level: formData.get('fitness-level'),
            goals: formData.getAll('goals'),
            frequency: formData.get('workout-frequency'),
            training_days: getSelectedDays(formData),
            location: 'gym', // Puedes añadir un campo en el formulario para esto
            equipment: formData.getAll('equipment'),
            injuries: formData.get('injuries')
        };

        try {
            const response = await sendToN8N(workoutData);
            
            if (response.status === 'success') {
                displayWorkoutPlan(response.plan);
            } else {
                throw new Error(response.error || 'Error al generar el plan');
            }
        } catch (error) {
            alert('Error al generar tu rutina: ' + error.message);
        }
    }

    // Función para mostrar el plan generado
    function displayWorkoutPlan(planMarkdown) {
        const planContent = document.getElementById('planContent');
        
        // Convertir markdown a HTML (simplificado)
        const htmlContent = markdownToHtml(planMarkdown);
        planContent.innerHTML = htmlContent;
        
        // Mostrar el modal
        openModal();
    }

    // Función auxiliar para convertir markdown a HTML
    function markdownToHtml(markdown) {
        return markdown
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^- (.*$)/gm, '<li>$1</li>')
            .replace(/<p><li>/g, '<ul><li>')
            .replace(/<\/li><p>/g, '</li></ul><p>');
    }

    // Función para obtener días seleccionados
    function getSelectedDays(formData) {
        const frequency = formData.get('workout-frequency');
        switch(frequency) {
            case '1-2': return '2 días a la semana (recomendamos lunes y jueves)';
            case '3-4': return 'Lunes, Miércoles y Viernes';
            case '5+': return 'Lunes a Viernes + Sábado (opcional)';
            default: return '3 días a la semana';
        }
    }

    // ... (resto del código existente)
});
    
   

// 1. Gráfica de progreso (solo para usuarios premium)
if (document.getElementById('progressChart')) {
    const ctx = document.getElementById('progressChart').getContext('2d');
    const progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            datasets: [{
                label: 'Peso (kg)',
                data: [70, 68, 67, 65],
                borderColor: '#6c5ce7',
                backgroundColor: 'rgba(108, 92, 231, 0.1)',
                tension: 0.3,
                fill: true
            },
            {
                label: 'Masa Muscular (%)',
                data: [30, 32, 34, 36],
                borderColor: '#00cec9',
                backgroundColor: 'rgba(0, 206, 201, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// 2. Estado emocional y ciclo menstrual
const moodButtons = document.querySelectorAll('.mood-btn');
if (moodButtons.length > 0) {
    moodButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const mood = this.getAttribute('data-mood');
            
            // Remover selección previa
            moodButtons.forEach(b => {
                b.style.backgroundColor = '';
                b.style.color = '';
            });
            
            // Estilizar botón seleccionado
            this.style.backgroundColor = '#6c5ce7';
            this.style.color = 'white';
            
            // Guardar en localStorage
            localStorage.setItem('userMood', mood);
            
            // Mostrar feedback
            let feedback = '';
            switch(mood) {
                case 'happy':
                    feedback = "¡Genial! Te sugeriremos una rutina energética hoy 💪";
                    break;
                case 'tired':
                    feedback = "Entendido. Tu rutina será más ligera para que te recuperes 🌿";
                    break;
                case 'stressed':
                    feedback = "Hoy nos enfocaremos en ejercicios relajantes y de respiración 🧘";
                    break;
                default:
                    feedback = "Rutina estándar adaptada a tu estado actual";
            }
            
            // Mostrar mensaje temporal
            const moodFeedback = document.createElement('div');
            moodFeedback.className = 'mood-feedback';
            moodFeedback.textContent = feedback;
            moodFeedback.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: #6c5ce7;
                color: white;
                padding: 10px 20px;
                border-radius: 50px;
                z-index: 1000;
                animation: fadeInUp 0.5s;
            `;
            document.body.appendChild(moodFeedback);
            
            setTimeout(() => {
                moodFeedback.style.animation = 'fadeOutDown 0.5s';
                setTimeout(() => moodFeedback.remove(), 500);
            }, 3000);
        });
    });
}

// 3. Sistema de fotos de progreso
const photoUploadButtons = document.querySelectorAll('.photo-box button');
if (photoUploadButtons.length > 0) {
    photoUploadButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const box = this.closest('.photo-box');
            const placeholder = box.querySelector('.photo-placeholder');
            
            // Simular subida de foto (en producción sería un input type=file real)
            placeholder.innerHTML = `
                <div style="width:100%;height:100%;background:#f5f6fa;display:flex;align-items:center;justify-content:center;">
                    <i class="fas fa-check-circle" style="font-size:40px;color:#6c5ce7;"></i>
                </div>
                <p style="margin-top:10px;color:#6c5ce7;">Foto subida</p>
            `;
            this.textContent = 'Cambiar foto';
            
            // Guardar referencia en localStorage
            const photoType = box.querySelector('h4').textContent.toLowerCase();
            localStorage.setItem(`photo_${photoType}`, 'uploaded');
        });
    });
}

// 4. Recordatorio del ciclo menstrual (solo para usuarias mujeres)
function checkMenstrualCycle() {
    const gender = localStorage.getItem('userGender') || document.querySelector('#gender')?.value;
    
    if (gender === 'female') {
        const lastPeriod = localStorage.getItem('lastPeriodDate');
        const cycleLength = localStorage.getItem('cycleLength') || 28;
        
        if (lastPeriod) {
            const lastDate = new Date(lastPeriod);
            const nextDate = new Date(lastDate);
            nextDate.setDate(nextDate.getDate() + parseInt(cycleLength));
            
            const today = new Date();
            const diffDays = Math.floor((nextDate - today) / (1000 * 60 * 60 * 24));
            
            if (diffDays >= -3 && diffDays <= 3) {
                showCycleNotification(diffDays);
            }
        }
    }
}

function showCycleNotification(days) {
    const notification = document.createElement('div');
    notification.className = 'cycle-notification';
    
    let message = '';
    if (days > 0) {
        message = `Tu período podría comenzar en ${days} días. ¿Quieres ajustar tu rutina?`;
    } else if (days < 0) {
        message = `Tu período comenzó hace ${Math.abs(days)} días. ¿Necesitas modificar tu rutina?`;
    } else {
        message = "Hoy es el día estimado de inicio de tu período. ¿Quieres una rutina especial?";
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <p>${message}</p>
            <div class="notification-buttons">
                <button class="btn btn-small btn-outline">No, gracias</button>
                <button class="btn btn-small btn-primary">Ajustar rutina</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Estilos para la notificación
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        z-index: 1000;
        animation: fadeIn 0.5s;
        max-width: 300px;
    `;
    
    // Manejar botones
    notification.querySelector('.btn-primary').addEventListener('click', () => {
        // Lógica para ajustar rutina
        alert("Generando rutina adaptada para tu ciclo menstrual...");
        notification.remove();
    });
    
    notification.querySelector('.btn-outline').addEventListener('click', () => {
        notification.remove();
    });
}

// Verificar ciclo menstrual al cargar (si es usuaria registrada)
setTimeout(checkMenstrualCycle, 2000);

// 5. Animaciones adicionales
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px) translateX(-50%); }
        to { opacity: 1; transform: translateY(0) translateX(-50%); }
    }
    @keyframes fadeOutDown {
        from { opacity: 1; transform: translateY(0) translateX(-50%); }
        to { opacity: 0; transform: translateY(20px) translateX(-50%); }
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .mood-btn.selected {
        background-color: #6c5ce7 !important;
        color: white !important;
    }
`;
document.head.appendChild(style);
