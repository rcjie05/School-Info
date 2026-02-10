# User Registration System Guide

## 🎉 New Feature: Self-Registration

Users can now create their own accounts without admin intervention!

## 📝 How to Register

### Step 1: Access Registration Page

From the login page, click **"Create New Account →"** or go directly to:
```
http://localhost/school_info/register.html
```

### Step 2: Fill in Basic Information

**Required fields:**
- **Full Name** - Your complete name
- **Email Address** - Valid email (e.g., john@school.edu)
- **Username** - At least 4 characters
- **Password** - At least 6 characters
- **Confirm Password** - Must match password

### Step 3: Select Account Type

Choose your role from the dropdown:
- **Student** - For enrolled students
- **Teacher** - For teaching staff
- **Registrar** - For registrar office staff
- **HR Staff** - For human resources personnel

### Step 4: Fill Role-Specific Information

The form will show different fields based on your selected role:

#### For Students:
- Student Number (e.g., 2024001)
- Program (Computer Science, Business, etc.)
- Year Level (1st - 5th year)
- Section (A, B, C, etc.)

#### For Teachers:
- Employee Number (e.g., T2024001)
- Department (Computer Science, Math, etc.)
- Office Building (optional)
- Office Room (optional)

#### For Registrar:
- Employee Number (e.g., R2024001)
- Office Building (optional)
- Office Room (optional)

#### For HR Staff:
- Employee Number (e.g., HR2024001)
- Position (HR Manager, Recruitment Officer, etc.)
- Office Building (optional)
- Office Room (optional)

### Step 5: Submit Registration

Click **"Create Account"** button.

If successful:
- ✅ Account created message
- Automatic redirect to login page
- Login with your new credentials

## 🔐 Account Status

New accounts are created with:
- **Status:** Active (can login immediately)
- **Password:** Encrypted using bcrypt
- **Access:** Role-based permissions applied automatically

## 🎯 What You Can Do After Registration

### Students Can:
- View class schedules
- Check grades
- View enrollment status
- Access floor plan navigator
- View public routes

### Teachers Can:
- View teaching schedule
- Manage classes
- Input grades
- Access floor plan navigator
- View public routes

### Registrar Can:
- Manage student records
- Process enrollments
- Manage grades
- Access floor plan navigator
- View public routes

### HR Staff Can:
- Manage employee records
- View applications
- Access floor plan navigator
- View public routes

## ⚠️ Important Notes

1. **Unique Username**: Each username must be unique
2. **Unique Email**: Each email can only be used once
3. **Student/Employee Numbers**: Must be unique for each role
4. **Password Security**: Passwords are hashed and cannot be recovered (only reset)

## 🐛 Troubleshooting Registration

### "Username already exists"
- Choose a different username
- Check if you already have an account

### "Email already registered"
- Use a different email address
- Try logging in instead (you may already have an account)

### "Student/Employee number already exists"
- This number is already in use
- Contact admin if this is an error

### "Please fill in all required fields"
- Check all fields marked with *
- Make sure role-specific fields are filled

### "Passwords do not match"
- Re-enter both passwords
- Make sure they are identical

### "Connection error"
- Check if XAMPP is running
- Verify MySQL is active
- Ensure database is imported

## 🔧 For Administrators

### Approving Registrations (Future Enhancement)

Currently, all registrations are auto-approved. To add manual approval:

1. Modify `api/register.php` to set status as 'pending'
2. Create admin approval interface
3. Update status to 'active' after approval

### Viewing Registered Users

Access the user checker tool:
```
http://localhost/school_info/check_users.php
```

This shows:
- All registered users
- Their roles and status
- When they registered

### Default Test Accounts

If you need quick test accounts, use the SQL provided in `check_users.php` to create:
- **student1** / student123
- **teacher1** / teacher123
- **hr1** / hr123

## 📊 Database Impact

When a user registers, the system:

1. Creates entry in `users` table
2. Creates entry in role-specific table:
   - `students` for students
   - `teachers` for teachers
   - `hr_staff` for HR
   - No extra table for registrar

3. Hashes password using PHP's `password_hash()`
4. Sets status to 'active'
5. Records creation timestamp

## 🚀 Next Steps After Registration

1. **Login** at http://localhost/school_info/
2. **Update Profile** (future feature)
3. **Access Dashboard** based on your role
4. **Explore Floor Plans** and navigation
5. **Use role-specific features**

## 💡 Tips for New Users

- **Remember your credentials** - No password recovery yet
- **Use school email** - Makes account verification easier
- **Fill all fields accurately** - Information shows on your profile
- **Contact admin** if you need role change

---

**Enjoy your new account! 🎓**
