// ========== NETWORK MESH ANIMATION ==========
class NetworkMesh {
    constructor() {
        this.canvas = document.getElementById('networkCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.connectionDistance = 150;
        this.particleCount = 60;

        this.setupCanvas();
        this.createParticles();
        this.animate();

        window.addEventListener('resize', () => this.setupCanvas());
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.fillStyle = '#0a1628';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 3 + 2,
                color: this.getRandomColor()
            });
        }
    }

    getRandomColor() {
        const colors = ['#9c27b0', '#7c4dff', '#651fff', '#2196f3', '#1976d2', '#ffffff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    distance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    animate() {
        this.ctx.fillStyle = 'rgba(10, 22, 40, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;

            // Bounce off walls
            if (p.x - p.radius < 0 || p.x + p.radius > this.canvas.width) p.vx *= -1;
            if (p.y - p.radius < 0 || p.y + p.radius > this.canvas.height) p.vy *= -1;

            // Keep in bounds
            p.x = Math.max(p.radius, Math.min(this.canvas.width - p.radius, p.x));
            p.y = Math.max(p.radius, Math.min(this.canvas.height - p.radius, p.y));

            // Draw particle
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 10;
        }

        // Draw connections
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dist = this.distance(this.particles[i], this.particles[j]);

                if (dist < this.connectionDistance) {
                    const opacity = 1 - (dist / this.connectionDistance);
                    const p1 = this.particles[i];
                    const p2 = this.particles[j];

                    // Create gradient between two colors
                    const gradient = this.ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                    gradient.addColorStop(0, p1.color);
                    gradient.addColorStop(1, p2.color);

                    this.ctx.strokeStyle = gradient;
                    this.ctx.globalAlpha = opacity * 0.6;
                    this.ctx.lineWidth = 1.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                    this.ctx.globalAlpha = 1;
                }
            }
        }

        this.ctx.shadowColor = 'transparent';
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize network mesh when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    new NetworkMesh();
}, { once: true });

// Configure Toastr
toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: false,
    progressBar: true,
    positionClass: "toast-top-right",
    preventDuplicates: false,
    onclick: null,
    showDuration: 300,
    hideDuration: 1000,
    timeOut: 5000,
    extendedTimeOut: 1000,
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut"
};

class FormValidator {
    constructor() {
        this.form = document.getElementById('validationForm');
        this.currentStep = 1;
        this.totalSteps = 3;
        this.data = {};
        this.init();
    }

    init() {
        this.attachListeners();
        this.updateProgress();
        this.updateButtons();
        this.showWelcome();
    }

    showWelcome() {
        setTimeout(() => {
            Swal.fire({
                title: '👋 Welcome!',
                html: 'Let\'s create your account in just 3 steps.',
                icon: 'info',
                confirmButtonText: 'Get Started',
                allowOutsideClick: false,
                customClass: {
                    popup: 'swal-custom'
                }
            });
        }, 500);
    }

    attachListeners() {
        // Navigation
        document.getElementById('prevBtn').addEventListener('click', () => this.prevStep());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('submitBtn').addEventListener('click', (e) => this.submit(e));

        // Real-time validation
        const inputs = this.form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="password"]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateInput(input));
            input.addEventListener('input', () => {
                if (input.type === 'password') {
                    this.checkStrength(input.value);
                }
                this.validateInput(input);
            });
        });

        // Password toggle
        document.querySelector('.toggle-pwd')?.addEventListener('click', (e) => this.togglePassword(e));
    }

    validateInput(input) {
        const value = input.value.trim();
        let isValid = false;
        let error = '';

        if (input.type === 'email') {
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            error = '❌ Invalid email address';
        } else if (input.type === 'tel') {
            isValid = /^[\d\s\-\(\)\+]{10,}$/.test(value.replace(/\D/g, ''));
            error = '❌ Invalid phone number (min 10 digits)';
        } else if (input.id === 'password') {
            isValid = this.isPasswordValid(value);
            error = '❌ Password must be 8+ chars with uppercase, lowercase, number & special char';
        } else if (input.id === 'confirm') {
            const pwd = document.getElementById('password').value;
            isValid = value === pwd && value.length > 0;
            error = '❌ Passwords do not match';
        } else {
            isValid = value.length > 0;
            error = '❌ This field is required';
        }

        this.updateFieldUI(input, isValid, error);
        return isValid;
    }

    isPasswordValid(pwd) {
        return pwd.length >= 8 &&
            /[A-Z]/.test(pwd) &&
            /[a-z]/.test(pwd) &&
            /\d/.test(pwd) &&
            /[!@#$%^&*]/.test(pwd);
    }

    updateFieldUI(input, isValid, error) {
        const errorSpan = input.parentElement.querySelector('.error-msg') ||
                         input.nextElementSibling;

        if (isValid) {
            input.classList.remove('invalid');
            input.classList.add('valid');
            if (errorSpan?.classList.contains('error-msg')) {
                errorSpan.textContent = '';
            }
        } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
            if (errorSpan?.classList.contains('error-msg')) {
                errorSpan.textContent = error;
            }
        }
    }

    checkStrength(pwd) {
        const text = document.querySelector('.strength-text span');
        let strength = 0;
        let label = 'Weak';
        let color = '#ef4444';

        if (pwd.length >= 8) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[a-z]/.test(pwd)) strength++;
        if (/\d/.test(pwd)) strength++;
        if (/[!@#$%^&*]/.test(pwd)) strength++;

        if (strength <= 1) {
            label = 'Weak';
            color = '#ef4444';
        } else if (strength <= 3) {
            label = 'Fair';
            color = '#f59e0b';
        } else if (strength === 4) {
            label = 'Good';
            color = '#3b82f6';
        } else {
            label = 'Strong';
            color = '#10b981';
        }

        const width = (strength / 5) * 100;

        const style = document.createElement('style');
        style.innerHTML = `.strength-bar::after { width: ${width}% !important; background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981) !important; }`;
        document.head.appendChild(style);

        if (text) {
            text.textContent = label;
            text.style.color = color;
        }
    }

    togglePassword(e) {
        e.preventDefault();
        const input = document.getElementById('password');
        input.type = input.type === 'password' ? 'text' : 'password';
        e.target.textContent = input.type === 'password' ? '👁' : '🙈';
    }

    isStepValid() {
        const step = this.form.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        const inputs = step.querySelectorAll('input[required]');
        let valid = true;

        inputs.forEach(input => {
            if (input.type !== 'checkbox') {
                if (!this.validateInput(input)) {
                    valid = false;
                }
            }
        });

        if (this.currentStep === 3) {
            const agree = document.getElementById('agree');
            if (!agree.checked) {
                toastr.error('Please agree to Terms & Conditions', 'Required Field Missing');
                valid = false;
            }
        }

        return valid;
    }

    saveStep() {
        const step = this.form.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        const inputs = step.querySelectorAll('input[required]');
        inputs.forEach(input => {
            this.data[input.id] = input.value;
        });
    }

    goToStep(n) {
        const current = this.form.querySelector(`.form-step.active`);
        const next = this.form.querySelector(`.form-step[data-step="${n}"]`);

        if (current) current.classList.remove('active');
        if (next) next.classList.add('active');

        this.currentStep = n;
        this.updateProgress();
        this.updateButtons();

        if (n === 3) this.populateReview();

        // Show toast notification
        const stepNames = ['Account Setup', 'Personal Details', 'Review & Confirm'];
        toastr.info(`📝 ${stepNames[n - 1]}`, 'Step ' + n);
    }

    nextStep() {
        if (this.isStepValid()) {
            this.saveStep();
            if (this.currentStep < this.totalSteps) {
                this.goToStep(this.currentStep + 1);
            }
        } else {
            toastr.warning('Please fill all required fields correctly', 'Validation Error');
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.saveStep();
            this.goToStep(this.currentStep - 1);
        }
    }

    populateReview() {
        document.getElementById('reviewEmail').textContent = this.data.email || '-';
        document.getElementById('reviewName').textContent =
            `${this.data.firstName || ''} ${this.data.lastName || ''}`.trim() || '-';
        document.getElementById('reviewPhone').textContent = this.data.phone || '-';
    }

    updateProgress() {
        const percent = (this.currentStep / this.totalSteps) * 100;
        document.querySelector('.progress-fill').style.width = percent + '%';

        document.querySelectorAll('.step-dot').forEach((dot, idx) => {
            const step = idx + 1;
            dot.classList.remove('active', 'completed');
            if (step === this.currentStep) {
                dot.classList.add('active');
            } else if (step < this.currentStep) {
                dot.classList.add('completed');
            }
        });
    }

    updateButtons() {
        const prev = document.getElementById('prevBtn');
        const next = document.getElementById('nextBtn');
        const submit = document.getElementById('submitBtn');

        // Hide back button on first step
        if (this.currentStep === 1) {
            prev.style.display = 'none';
        } else {
            prev.style.display = 'block';
        }

        // Show submit on last step
        if (this.currentStep === this.totalSteps) {
            next.style.display = 'none';
            submit.style.display = 'block';
        } else {
            next.style.display = 'block';
            submit.style.display = 'none';
        }
    }

    submit(e) {
        e.preventDefault();
        if (this.isStepValid()) {
            this.saveStep();

            // Show success SweetAlert
            Swal.fire({
                title: '🎉 Success!',
                html: `
                    <div style="text-align: left;">
                        <p><strong>✓ Account Created Successfully!</strong></p>
                        <p style="margin-top: 15px;">
                            <strong>Email:</strong> ${this.data.email}<br>
                            <strong>Name:</strong> ${this.data.firstName} ${this.data.lastName}<br>
                            <strong>Phone:</strong> ${this.data.phone}
                        </p>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'Create Another Account',
                allowOutsideClick: false,
                customClass: {
                    popup: 'swal-custom'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    location.reload();
                }
            });

            // Log data
            console.log('Form submitted:', this.data);

            // Hide form
            this.form.style.display = 'none';

            // Show success toast
            toastr.success('Your account has been registered successfully!', '✓ Registration Complete');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FormValidator();
});
