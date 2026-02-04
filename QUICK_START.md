# QUICK START GUIDE - School Info System

## 🚀 Installation in 5 Easy Steps

### Step 1: Install XAMPP
1. Download XAMPP from https://www.apachefriends.org
2. Install it on your computer
3. Open XAMPP Control Panel
4. Click "Start" for both Apache and MySQL

### Step 2: Copy Files
1. Copy the entire `school_info` folder to:
   - **Windows**: `C:\xampp\htdocs\school_info\`
   - **Mac**: `/Applications/XAMPP/htdocs/school_info/`
   - **Linux**: `/opt/lampp/htdocs/school_info/`

### Step 3: Create Database
1. Open your browser and go to: `http://localhost/phpmyadmin`
2. Click "New" on the left sidebar
3. Database name: `school_info_db`
4. Click "Create"

### Step 4: Import Database Schema
1. In phpMyAdmin, click on `school_info_db` database
2. Click the "Import" tab at the top
3. Click "Choose File" and select: `school_info/database/schema.sql`
4. Scroll down and click "Go"
5. Wait for "Import has been successfully finished" message

### Step 5: Access the System
1. Open your browser
2. Go to: `http://localhost/school_info/`
3. Login with:
   - **Username**: admin
   - **Password**: admin123

## ✅ That's it! You're ready to use the system!

---

## 📱 System Features Overview

### For Students:
- ✅ View class schedules
- ✅ Check grades
- ✅ Find classrooms with interactive map
- ✅ Locate faculty offices
- ✅ Submit feedback
- ✅ AI chatbot assistance

### For Teachers:
- ✅ View assigned classes
- ✅ Check student rosters
- ✅ Manage office hours
- ✅ View announcements

### For Registrars:
- ✅ Verify enrollments
- ✅ Enter grades
- ✅ Manage schedules
- ✅ Update room assignments
- ✅ Respond to inquiries

### For Administrators:
- ✅ Manage all users
- ✅ Add buildings and rooms
- ✅ Manage departments
- ✅ Post announcements
- ✅ View system logs

---

## 🐛 Troubleshooting

**Problem: Can't access http://localhost/school_info/**
- Solution: Make sure Apache is running in XAMPP Control Panel

**Problem: Database connection error**
- Solution: Make sure MySQL is running in XAMPP Control Panel
- Check that database name is exactly: `school_info_db`

**Problem: Login not working**
- Solution: Make sure you imported the schema.sql file
- Default credentials are: admin / admin123

**Problem: Pages look broken**
- Solution: Clear your browser cache (Ctrl+Shift+Delete)
- Try a different browser

---

## 📞 Default Login Accounts

After importing the database, you have:

**Administrator Account:**
- Username: `admin`
- Password: `admin123`
- Role: Full system access

**To create more accounts:**
1. Login as admin
2. Go to Admin Dashboard
3. Click "User Management"
4. Click "Add New User"
5. Fill in the form and submit

---

## 💡 Tips for Best Experience

1. **Use Chrome or Firefox** for best compatibility
2. **Create test accounts** for each role to explore features
3. **Add sample buildings** through admin panel
4. **Post announcements** to see how they appear to students
5. **Try the AI chatbot** for campus navigation help

---

## 🔒 Important Security Notes

1. **Change admin password immediately** after first login
2. Don't use this on a public server without proper security
3. For production use, enable HTTPS
4. Regularly backup your database

---

## 📂 File Structure

```
school_info/
├── index.html              (Login page)
├── dashboard-student.html  (Student dashboard)
├── dashboard-teacher.html  (Teacher dashboard)
├── dashboard-registrar.html (Registrar dashboard)
├── dashboard-admin.html    (Admin dashboard)
├── config/
│   └── database.php        (Database settings)
├── classes/
│   └── Auth.php            (Authentication)
├── api/
│   └── login.php           (Login API)
└── database/
    └── schema.sql          (Database structure)
```

---

## 🎯 Next Steps

1. ✅ Install and test the system
2. Create sample users for testing
3. Add your school's buildings and rooms
4. Upload faculty information
5. Test with real student data

---

## ❓ Need Help?

- Check the main README.md for detailed documentation
- Review the troubleshooting section above
- Contact your system administrator

**Happy Learning! 📚**
