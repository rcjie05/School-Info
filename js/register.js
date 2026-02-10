/* ============================================================
   js/register.js — Registration page logic
   ============================================================ */

// Toggle role-specific fields based on selected role
function toggleRoleFields() {
    const role = document.getElementById('role').value;
    
    // Hide all role-specific sections
    document.querySelectorAll('.role-specific').forEach(section => {
        section.style.display = 'none';
        // Remove required attributes
        section.querySelectorAll('input, select').forEach(input => {
            input.removeAttribute('required');
        });
    });
    
    // Show and set required for selected role
    if (role === 'student') {
        const section = document.getElementById('studentFields');
        section.style.display = 'block';
        document.getElementById('studentNumber').setAttribute('required', 'required');
        document.getElementById('program').setAttribute('required', 'required');
        document.getElementById('yearLevel').setAttribute('required', 'required');
        document.getElementById('section').setAttribute('required', 'required');
    } else if (role === 'teacher') {
        const section = document.getElementById('teacherFields');
        section.style.display = 'block';
        document.getElementById('teacherEmployeeNumber').setAttribute('required', 'required');
        document.getElementById('teacherDepartment').setAttribute('required', 'required');
    } else if (role === 'registrar') {
        const section = document.getElementById('registrarFields');
        section.style.display = 'block';
        document.getElementById('registrarEmployeeNumber').setAttribute('required', 'required');
    } else if (role === 'hr') {
        const section = document.getElementById('hrFields');
        section.style.display = 'block';
        document.getElementById('hrEmployeeNumber').setAttribute('required', 'required');
        document.getElementById('hrPosition').setAttribute('required', 'required');
    }
}

// Handle registration form submission
async function handleRegister(event) {
    event.preventDefault();
    
    // Get basic fields
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('role').value;
    
    // Validation
    if (!role) {
        showAlert('Please select an account type', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'error');
        return;
    }
    
    // Build registration data
    const registrationData = {
        full_name: fullName,
        email: email,
        username: username,
        password: password,
        role: role
    };
    
    // Add role-specific data
    if (role === 'student') {
        registrationData.student_number = document.getElementById('studentNumber').value.trim();
        registrationData.program = document.getElementById('program').value;
        registrationData.year_level = document.getElementById('yearLevel').value;
        registrationData.section = document.getElementById('section').value.trim();
        
        if (!registrationData.student_number || !registrationData.program || 
            !registrationData.year_level || !registrationData.section) {
            showAlert('Please fill in all student information fields', 'error');
            return;
        }
    } else if (role === 'teacher') {
        registrationData.employee_number = document.getElementById('teacherEmployeeNumber').value.trim();
        registrationData.department = document.getElementById('teacherDepartment').value;
        registrationData.office_building = document.getElementById('teacherBuilding').value;
        registrationData.office_room = document.getElementById('teacherRoom').value.trim();
        
        if (!registrationData.employee_number || !registrationData.department) {
            showAlert('Please fill in all required teacher information fields', 'error');
            return;
        }
    } else if (role === 'registrar') {
        registrationData.employee_number = document.getElementById('registrarEmployeeNumber').value.trim();
        registrationData.office_building = document.getElementById('registrarBuilding').value;
        registrationData.office_room = document.getElementById('registrarRoom').value.trim();
        
        if (!registrationData.employee_number) {
            showAlert('Please fill in employee number', 'error');
            return;
        }
    } else if (role === 'hr') {
        registrationData.employee_number = document.getElementById('hrEmployeeNumber').value.trim();
        registrationData.position = document.getElementById('hrPosition').value.trim();
        registrationData.office_building = document.getElementById('hrBuilding').value;
        registrationData.office_room = document.getElementById('hrRoom').value.trim();
        
        if (!registrationData.employee_number || !registrationData.position) {
            showAlert('Please fill in all required HR information fields', 'error');
            return;
        }
    }
    
    // Submit registration
    try {
        showAlert('Creating your account...', 'success');
        
        const response = await fetch('api/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Account created successfully! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            showAlert(result.message || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAlert(
            'Connection error! Please ensure:\n' +
            '1. XAMPP/WAMP/MAMP is running\n' +
            '2. MySQL server is active\n' +
            '3. Database is properly configured',
            'error'
        );
    }
}

// Alert helper function
function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = `alert alert-${type}`;
    alert.style.display = 'block';
    
    if (type === 'error') {
        setTimeout(() => {
            alert.style.display = 'none';
        }, 6000);
    }
}
