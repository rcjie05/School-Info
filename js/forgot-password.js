// Forgot Password JavaScript
async function handleForgotPassword(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const alertDiv = document.getElementById('alert');
    const submitBtn = event.target.querySelector('button[type="submit"]');

    // Clear previous alerts
    alertDiv.textContent = '';
    alertDiv.style.display = 'none';

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
        const response = await fetch('./api/forgot-password.php', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        // Try to parse JSON response
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('JSON parse error:', jsonError);
            throw new Error('Server returned invalid response. Please check server logs.');
        }

        // Log the response for debugging
        console.log('API Response:', data);

        if (data.success) {
            // Show success message
            document.getElementById('requestForm').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
            
            // Log debug info if available
            if (data.debug_info) {
                console.log('Debug Info:', data.debug_info);
                console.log('Reset URL:', data.debug_info.reset_url);
            }
        } else {
            // Show error
            alertDiv.textContent = data.message || 'An error occurred. Please try again.';
            if (data.error) {
                alertDiv.textContent += ' (Error: ' + data.error + ')';
            }
            alertDiv.style.display = 'block';
            alertDiv.className = 'alert error';
            
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Reset Link';
        }
    } catch (error) {
        console.error('Error:', error);
        alertDiv.textContent = 'Network error: ' + error.message + '. Please check your connection and try again.';
        alertDiv.style.display = 'block';
        alertDiv.className = 'alert error';
        
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Reset Link';
    }
}
