# ELITE-ATTENDENCE-WEB
# Elite Attendance Management System

A cloud-powered Faculty Attendance Management System built using:

- HTML  
- CSS  
- JavaScript (ES Modules)  
- Supabase (Authentication and Database)  
- PostgreSQL  
- Vercel (Deployment)  
- GitHub (Version Control)  

---

## Overview

Elite Attendance is a modern web-based system designed for faculty members to:

- Authenticate securely
- Create and manage university courses
- Enroll students
- Mark daily attendance
- Automatically calculate attendance percentage
- Export attendance reports to Excel
- Store all data securely in the cloud

The system uses Supabase for authentication and database management with Row Level Security enabled.

---

## Architecture

Frontend (Vercel Hosting)  
        ↓  
Supabase Authentication  
        ↓  
Supabase PostgreSQL Database  

All data is stored securely in the cloud and protected using RLS policies.

---

## Features

- Secure email/password authentication
- Faculty-specific course management
- Student enrollment per course
- Daily attendance marking (Present / Absent)
- Attendance percentage calculation
- Excel report export
- Cloud-based persistent storage
- Role-based data access protection
- Responsive modern UI design

---

## Technology Stack

| Technology   | Purpose                     |
|-------------|----------------------------|
| HTML        | Structure                  |
| CSS         | Styling and UI Design      |
| JavaScript  | Application Logic          |
| Supabase    | Authentication & Database  |
| PostgreSQL  | Data Storage               |
| Vercel      | Hosting                    |
| GitHub      | Version Control            |

---

## Database Schema

### profiles
- id (uuid, Primary Key)
- username (text)
- role (text)

### classes
- id (uuid, Primary Key)
- faculty_id (uuid, Foreign Key → profiles.id)
- class_name (text)

### students
- id (uuid, Primary Key)
- class_id (uuid, Foreign Key → classes.id)
- roll (text)
- name (text)

### attendance
- id (uuid, Primary Key)
- student_id (uuid, Foreign Key → students.id)
- date (date)
- status (text)
- remark (text)

---

## Security

- Row Level Security (RLS) enabled on all tables
- Faculty members can only access their own data
- Supabase session-based authentication
- No browser localStorage data persistence
- Fully cloud-managed database

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/elite-attendance-system.git
cd elite-attendance-system
