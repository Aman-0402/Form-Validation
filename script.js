// Form Validation Multi-Step Form
class FormValidator {
    constructor() {
        this.form = document.getElementById('multiStepForm');
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProgressBar();
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('prevBtn').addEventListener('click', () => this.previousStep());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('submitBtn').addEventListener('click', (e) => this.submitForm(e));

        // Real-time validation
        this.form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.validateField(input));
        });

        // Password field
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                this.checkPasswordStrength(passwordInput.value);
                this.checkPasswordRequirements(passwordInput.value);
                this.validateField(passwordInput);
            });
        }

        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('blur', () => this.validateField(confirmPassword));
            confirmPassword.addEventListener('input', () => this.validateField(confirmPassword));
        }

        // Toggle password visibility
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', (e) => this.togglePasswordVisibility(e));
        });

        // Form submission
        this.form.addEventListener('submit', (e) => this.submitForm(e));
    }

    // ========== FIELD VALIDATION ==========
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        switch (field.type) {
            case 'email':
                isValid = this.validateEmail(value);
                errorMessage = isValid ? '' : 'Please enter a valid email address';
                break;
            case 'tel':
                isValid = this.validatePhone(value);
                errorMessage = isValid ? '' : 'Please enter a valid phone number';
                break;
            case 'password':
                isValid = this.validatePassword(value);
                if (value.length === 0) {
                    errorMessage = 'Password is required';
                } else if (!isValid) {
                    errorMessage = 'Password does not meet requirements';
                }
                break;
            case 'text':
                if (fieldName === 'confirmPassword') {
                    const password = document.getElementById('password').value;
                    isValid = value === password;
                    errorMessage = isValid ? '' : 'Passwords do not match';
                } else {
                    isValid = value.length > 0;
                    errorMessage = isValid ? '' : 'This field is required';
                }
                break;
            default:
                isValid = value.length > 0;
                errorMessage = isValid ? '' : 'This field is required';
        }

        this.updateFieldUI(field, isValid, errorMessage);
        return isValid;
    }

    // Handle confirm password which is a password type
    validateConfirmPassword(field) {
        const value = field.value.trim();
        const password = document.getElementById('password').value;
        const isValid = value === password && value.length > 0;
        const errorMessage = isValid ? '' : 'Passwords do not match';
        this.updateFieldUI(field, isValid, errorMessage);
        return isValid;
    }

    updateFieldUI(field, isValid, errorMessage) {
        const inputWrapper = field.parentElement;
        const errorMsg = inputWrapper.querySelector('.error-message');

        if (isValid) {
            field.classList.remove('invalid');
            field.classList.add('valid');
            if (errorMsg) errorMsg.textContent = '';
        } else {
            field.classList.remove('valid');
            field.classList.add('invalid');
            if (errorMsg) errorMsg.textContent = errorMessage;
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^[\d\s\-\(\)\+]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }

    validatePassword(password) {
        return (
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /\d/.test(password) &&
            /[!@#$%^&*]/.test(password)
        );
    }

    // ========== PASSWORD STRENGTH ==========
    checkPasswordStrength(password) {
        const strengthText = document.querySelector('.strength-text span');
        let strength = 0;
        let strengthLabel = 'Weak';
        let strengthColor = 'var(--error-color)';

        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*]/.test(password)) strength++;

        if (strength <= 1) {
            strengthLabel = 'Weak';
            strengthColor = 'var(--error-color)';
        } else if (strength <= 3) {
            strengthLabel = 'Fair';
            strengthColor = 'var(--warning-color)';
        } else if (strength <= 4) {
            strengthLabel = 'Good';
            strengthColor = '#3b82f6';
        } else {
            strengthLabel = 'Strong';
            strengthColor = 'var(--success-color)';
        }

        const percentage = (strength / 5) * 100;
        const barElement = document.querySelector('.strength-bar');
        barElement.style.setProperty('--width', percentage + '%');

        if (strengthText) {
            strengthText.textContent = strengthLabel;
            strengthText.style.color = strengthColor;
        }

        // Update strength bar style dynamically
        const style = document.createElement('style');
        style.innerHTML = `.strength-bar::after { width: ${percentage}% !important; }`;
        document.head.appendChild(style);
    }

    // ========== PASSWORD REQUIREMENTS ==========
    checkPasswordRequirements(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*]/.test(password)
        };

        Object.keys(requirements).forEach(req => {
            const item = document.querySelector(`[data-requirement="${req}"]`);
            if (item) {
                if (requirements[req]) {
                    item.classList.add('met');
                } else {
                    item.classList.remove('met');
                }
            }
        });
    }

    // ========== PASSWORD VISIBILITY TOGGLE ==========
    togglePasswordVisibility(e) {
        e.preventDefault();
        const input = e.target.previousElementSibling;
        if (input && input.type === 'password') {
            input.type = 'text';
            e.target.textContent = '🙈';
        } else if (input && input.type === 'text') {
            input.type = 'password';
            e.target.textContent = '👁️';
        }
    }

    // ========== STEP VALIDATION ==========
    isStepValid() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        const inputs = currentStepElement.querySelectorAll('input[required]');
        let isValid = true;

        inputs.forEach(input => {
            // Special handling for confirm password
            if (input.name === 'confirmPassword') {
                if (!this.validateConfirmPassword(input)) {
                    isValid = false;
                }
            } else if (!this.validateField(input)) {
                isValid = false;
            }
        });

        // Special validation for step 4 (agreement)
        if (this.currentStep === 4) {
            const agreeTerms = document.getElementById('agreeTerms');
            if (agreeTerms && !agreeTerms.checked) {
                isValid = false;
                alert('Please agree to the Terms & Conditions');
            }
        }

        return isValid;
    }

    // ========== STEP NAVIGATION ==========
    nextStep() {
        if (this.isStepValid()) {
            this.saveStepData();
            if (this.currentStep < this.totalSteps) {
                this.goToStep(this.currentStep + 1);
            }
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.saveStepData();
            this.goToStep(this.currentStep - 1);
        }
    }

    goToStep(stepNumber) {
        // Hide current step with animation
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.remove('active');
            if (stepNumber > this.currentStep) {
                currentStepElement.classList.add('exit-left');
            } else {
                currentStepElement.classList.add('exit-right');
            }
        }

        // Update current step
        this.currentStep = stepNumber;

        // Show new step with animation
        const newStepElement = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        if (newStepElement) {
            newStepElement.classList.remove('exit-left', 'exit-right');
            newStepElement.classList.add('active');
        }

        // Update progress bar and indicators
        this.updateProgressBar();
        this.updateStepIndicators();
        this.updateNavigationButtons();

        // Populate review step
        if (stepNumber === 4) {
            this.populateReview();
        }

        // Scroll to top
        document.querySelector('.form-wrapper').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ========== PROGRESS BAR ==========
    updateProgressBar() {
        const progressFill = document.querySelector('.progress-fill');
        const percentage = (this.currentStep / this.totalSteps) * 100;
        progressFill.style.width = percentage + '%';
    }

    updateStepIndicators() {
        document.querySelectorAll('.step-circle').forEach(circle => {
            const stepNumber = parseInt(circle.dataset.step);
            circle.classList.remove('active', 'completed');

            if (stepNumber === this.currentStep) {
                circle.classList.add('active');
            } else if (stepNumber < this.currentStep) {
                circle.classList.add('completed');
            }
        });
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        // Disable previous button on first step
        prevBtn.disabled = this.currentStep === 1;

        // Show/hide buttons based on step
        if (this.currentStep === this.totalSteps) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        }
    }

    // ========== FORM DATA ==========
    saveStepData() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        const inputs = currentStepElement.querySelectorAll('input[required]');

        inputs.forEach(input => {
            if (input.type !== 'checkbox') {
                this.formData[input.name] = input.value;
            }
        });
    }

    populateReview() {
        document.getElementById('reviewName').textContent =
            `${this.formData.firstName || '-'} ${this.formData.lastName || '-'}`;
        document.getElementById('reviewEmail').textContent = this.formData.email || '-';
        document.getElementById('reviewPhone').textContent = this.formData.phone || '-';
        document.getElementById('reviewStreet').textContent = this.formData.street || '-';
        document.getElementById('reviewCityState').textContent =
            `${this.formData.city || '-'}, ${this.formData.state || '-'} ${this.formData.zipCode || '-'}`;
    }

    // ========== FORM SUBMISSION ==========
    submitForm(e) {
        e.preventDefault();

        if (this.isStepValid()) {
            this.saveStepData();
            console.log('Form submitted with data:', this.formData);

            // Hide form and show success message with animation
            this.form.style.display = 'none';
            const successBox = document.getElementById('successBox');
            successBox.classList.add('show');

            // Optional: log the form data
            this.logFormData();
        }
    }

    logFormData() {
        console.log('=== FORM SUBMISSION DATA ===');
        console.log('Personal Information:');
        console.log(`  Name: ${this.formData.firstName} ${this.formData.lastName}`);
        console.log(`  Email: ${this.formData.email}`);
        console.log(`  Phone: ${this.formData.phone}`);
        console.log('Address Information:');
        console.log(`  Street: ${this.formData.street}`);
        console.log(`  City: ${this.formData.city}`);
        console.log(`  State: ${this.formData.state}`);
        console.log(`  ZIP: ${this.formData.zipCode}`);
        console.log('Password: ••••••••');
        console.log('=============================');
    }
}

// Initialize form validator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FormValidator();
});
