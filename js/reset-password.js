// Reset Password JavaScript

// Get token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// Check if token exists
if (!token) {
    document.getElementById('resetForm').innerHTML = `
        <div style="text-align: center; color: #e74c3c;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
            <h3>Invalid Reset Link</h3>
            <p style="color: #666; margin-top: 1rem;">This password reset link is invalid or has expired.</p>
            <a href="forgot-password.html" class="btn" style="display: inline-block; text-decoration: none; margin-top: 1rem;">Request New Link</a>
        </div>
    `;
}

async function handleResetPassword(event) {
    event.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const alertDiv = document.getElementById('alert');

    // Clear previous alerts
    alertDiv.textContent = '';
    alertDiv.style.display = 'none';

    // Validate passwords match
    if (newPassword !== confirmPassword) {
        alertDiv.textContent = 'Passwords do not match!';
        alertDiv.style.display = 'block';
        alertDiv.className = 'alert error';
        return;
    }

    // Validate password length
    if (newPassword.length < 6) {
        alertDiv.textContent = 'Password must be at least 6 characters long!';
        alertDiv.style.display = 'block';
        alertDiv.className = 'alert error';
        return;
    }

    // Disable submit button
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Resetting...';

    try {
        const response = await fetch('./api/reset-password.php', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                token: token,
                new_password: newPassword 
            })
        });

        const data = await response.json();

        if (data.success) {
            // Show success message
            document.getElementById('resetForm').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
        } else {
            // Show error
            alertDiv.textContent = data.message || 'Failed to reset password. Please try again.';
            alertDiv.style.display = 'block';
            alertDiv.className = 'alert error';
            
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Reset Password';

            // If token is invalid or expired, show option to request new link
            if (data.message && (data.message.includes('invalid') || data.message.includes('expired'))) {
                setTimeout(() => {
                    document.getElementById('resetForm').innerHTML = `
                        <div style="text-align: center; color: #e74c3c;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">⏰</div>
                            <h3>Link Expired</h3>
                            <p style="color: #666; margin-top: 1rem;">This password reset link has expired.</p>
                            <a href="forgot-password.html" class="btn" style="display: inline-block; text-decoration: none; margin-top: 1rem;">Request New Link</a>
                        </div>
                    `;
                }, 2000);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alertDiv.textContent = 'An error occurred. Please try again later.';
        alertDiv.style.display = 'block';
        alertDiv.className = 'alert error';
        
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Reset Password';
    }
}
