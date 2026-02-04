# School Info System

A comprehensive web-based platform designed to centralize and digitize essential school information and processes for students, teachers, registrars, and administrators.

## 🎯 Features

### Core Features
- ✅ **User Authentication & Role-Based Access** (Student, Teacher, Registrar, Admin)
- 🗺️ **Interactive Campus Maps** with searchable rooms and buildings
- 👥 **Faculty Directory** with office locations and hours
- 📚 **Study Load Viewer** for students with clickable room links
- 📊 **Grade Viewing** (midterm and final grades)
- 📢 **Announcements System** with targeted posting
- 💬 **Feedback & Inquiry System**
- 🤖 **AI Chatbot** for instant campus assistance
- 🏛️ **Building & Room Management** with accessibility info
- 🏢 **Department Directory**
- 📋 **Audit Logs** for system tracking
- 📱 **Mobile-Friendly** responsive design

### User Roles

#### Students Can:
- View class schedules with room locations
- Check grades (midterm & final)
- Navigate campus using interactive maps
- Find faculty offices and contact info
- View announcements
- Submit feedback/inquiries
- Use AI chatbot for assistance

#### Teachers Can:
- View assigned classes and schedules
- Access student rosters
- Update office hours
- View department information

#### Registrars Can:
- Manage student enrollments
- Update grades
- Manage room assignments
- Process student records
- Respond to feedback

#### Administrators Can:
- Full system management
- User account creation/management
- Building and room management
- Department management
- Post announcements
- View audit logs
- System configuration

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: PHP 7.4+
- **Database**: MySQL (via XAMPP)
- **Server**: Apache (via XAMPP)

## 📋 Prerequisites

- XAMPP (or any Apache + MySQL + PHP environment)
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Modern web browser (Chrome, Firefox, Edge, Safari)

## 🚀 Installation Guide

### Step 1: Install XAMPP

1. Download XAMPP from [https://www.apachefriends.org](https://www.apachefriends.org)
2. Install XAMPP on your system
3. Start Apache and MySQL from XAMPP Control Panel

### Step 2: Setup Database

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Click "New" to create a new database
3. Name it: `school_info_db`
4. Click "Import" tab
5. Choose the file: `database/schema.sql`
6. Click "Go" to execute

**OR** Run the SQL script directly:
- Open the SQL tab in phpMyAdmin
- Copy and paste the contents of `database/schema.sql`
- Click "Go"

### Step 3: Configure the System

1. Copy all project files to XAMPP's `htdocs` folder:
   ```
   C:\xampp\htdocs\school_info\
   ```

2. Verify database connection settings in `config/database.php`:
   ```php
   private $host = "localhost";
   private $db_name = "school_info_db";
   private $username = "root";
   private $password = "";
   ```

### Step 4: Access the System

Open your web browser and navigate to:
```
http://localhost/school_info/
```

## 🔐 Default Login Credentials

### Administrator
- **Username**: `admin`
- **Password**: `admin123`

> **Important**: Change the default admin password immediately after first login!

## 📁 Project Structure

```
school_info/
├── config/
│   └── database.php          # Database configuration
├── classes/
│   └── Auth.php              # Authentication class
├── api/
│   └── login.php             # Login API endpoint
├── database/
│   └── schema.sql            # Database schema
├── index.html                # Login page
├── dashboard-student.html    # Student dashboard
├── dashboard-admin.html      # Admin dashboard
├── dashboard-teacher.html    # Teacher dashboard (to be created)
└── dashboard-registrar.html  # Registrar dashboard (to be created)
```

## 🎨 Design Features

- **Modern UI**: Clean, professional interface with gradient accents
- **Color Scheme**: Green primary (educational), orange accent
- **Typography**: Plus Jakarta Sans (body), Crimson Pro (headings)
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Animations**: Smooth transitions and hover effects
- **Accessibility**: High contrast, keyboard navigation, screen reader support

## 💡 Key Functionalities

### Interactive Campus Map
- Visual building cards with floor information
- Search functionality for rooms and buildings
- Accessibility indicators (elevator, ramp)
- Clickable room links from schedules

### AI Chatbot
- Context-aware responses
- Campus navigation assistance
- Quick answers to common questions
- 24/7 availability

### Study Load Management
- Visual schedule display
- Direct links to room locations
- Teacher contact information
- Time conflict detection

### Grade Viewing
- Midterm and final grades
- Semester-wise organization
- GPA calculation
- Performance tracking

## 🔧 Configuration Options

### Database Connection
Edit `config/database.php` to match your MySQL setup.

### Adding Buildings
Use the Admin panel to add new buildings with:
- Building name and code
- Number of floors
- Accessibility features (elevator, ramp)

### Adding Rooms
Through Admin panel:
- Assign to building
- Set room number and floor
- Define room type (classroom, lab, office)
- Set capacity and facilities

### Managing Users
Admin can create accounts for:
- Students (with student numbers)
- Teachers (with employee numbers)
- Registrars
- Other administrators

## 🐛 Troubleshooting

### Database Connection Error
- Verify MySQL is running in XAMPP
- Check database credentials in `config/database.php`
- Ensure `school_info_db` database exists

### Login Not Working
- Clear browser cache
- Check if session is enabled in PHP
- Verify user exists in database

### Pages Not Loading
- Ensure Apache is running
- Check file permissions
- Verify correct file paths

### API Errors
- Check PHP error logs in XAMPP
- Enable error reporting in `php.ini`
- Verify API endpoints are accessible

## 🔒 Security Recommendations

1. **Change Default Credentials**: Immediately after installation
2. **Use Strong Passwords**: Implement password policies
3. **Enable HTTPS**: For production deployment
4. **Regular Backups**: Backup database regularly
5. **Update Dependencies**: Keep PHP and MySQL updated
6. **Input Validation**: Already implemented in forms
7. **SQL Injection Protection**: Using prepared statements
8. **Session Security**: Implement session timeout

## 🚦 Development Roadmap

### Phase 1 (Current)
- ✅ Core authentication system
- ✅ Student dashboard
- ✅ Admin dashboard
- ✅ Campus map interface
- ✅ AI chatbot integration

### Phase 2 (Planned)
- ⏳ Teacher dashboard
- ⏳ Registrar dashboard
- ⏳ Advanced search filters
- ⏳ Email notifications
- ⏳ Mobile app version

### Phase 3 (Future)
- 📅 Calendar integration
- 📊 Analytics dashboard
- 🔔 Push notifications
- 📱 QR code check-in
- 🌐 Multi-language support

## 📞 Support

For issues, questions, or contributions:
1. Check the troubleshooting section
2. Review existing documentation
3. Contact system administrator

## 📄 License

This project is created for educational purposes. Modify and adapt as needed for your institution.

## 🙏 Acknowledgments

- Built for Philippine educational institutions
- Designed to solve real campus navigation challenges
- Inspired by feedback from students and administrators

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Status**: Active Development
