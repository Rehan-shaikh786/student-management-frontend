# 🎓 Student Management System – Frontend

A web-based Student Management System built with **React, Vite, JavaScript, Axios, and React Router**. This frontend connects to a Spring Boot REST API to manage students, courses, and enrollments with JWT-based authentication.

![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?logo=vite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)
![Axios](https://img.shields.io/badge/Axios-HTTP%20Client-5A29E4?logo=axios)
![React Router](https://img.shields.io/badge/React%20Router-Routing-CA4245?logo=reactrouter)

---

## 📌 About the Project

The Student Management System frontend provides an interface for managing student records, courses, and student enrollments.

It communicates with a Java Spring Boot backend through REST APIs. JWT authentication is used to access protected resources, while React Router handles application navigation.

## ✨ Features

### 👨‍🎓 Student Management

* Add new students
* View student records
* Update student information
* Delete student records
* Search and filter students
* Form validation

### 📚 Course Management

* Add new courses
* View available courses
* Update course information
* Delete courses
* Search courses
* Display course details

### 📝 Enrollment Management

* Enroll students in courses
* View enrollment records
* Delete enrollments
* View associated student and course information

### 🔐 Authentication

* User registration and login
* JWT-based authentication
* Store authentication details in local storage
* Attach Bearer tokens to protected API requests
* Protected application routes
* Handle unauthorized API responses

### 🔔 Notifications

* Centered success and error popups
* Automatic popup dismissal
* Manual close button

### 🧭 Navigation

* React Router navigation
* Shared application layout
* Protected pages
* Role-aware access to management actions

---

## 🧰 Tech Stack

| Technology    | Purpose                           |
| ------------- | --------------------------------- |
| React         | User interface                    |
| Vite          | Development server and build tool |
| JavaScript    | Frontend programming              |
| Axios         | REST API communication            |
| React Router  | Client-side routing               |
| Lucide React  | Icons                             |
| CSS           | Styling                           |
| Local Storage | Authentication persistence        |

---

## 🏗️ Application Architecture

```text
               React Application
                       |
                       v
                React Router
                       |
                       v
               Protected Routes
                       |
                       v
                    Layout
                       |
          +------------+------------+
          |            |            |
          v            v            v
       Students      Courses    Enrollments
          |            |            |
          +------------+------------+
                       |
                       v
                  Axios Service
                       |
                       v
                JWT Bearer Token
                       |
                       v
              Spring Boot REST API
```

---

## 📂 Project Structure

```text
student-management-frontend/
│
├── public/
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── ...
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

*This is a high-level structure; the exact files and folders may vary.*

---

## ⚙️ Prerequisites

Before running the application, install:

* Node.js
* npm
* Git
* A code editor such as VS Code or IntelliJ IDEA
* The Student Management System backend

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Rehan-shaikh786/student-management-frontend.git
```

### 2. Navigate to the Project

```bash
cd student-management-frontend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure the Backend URL

Open:

```text
src/services/api.js
```

The development API base URL is:

```text
http://localhost:8080/api
```

Ensure that the Spring Boot backend is running at this address.

### 5. Start the Frontend

```bash
npm run dev
```

Open the local URL displayed in the terminal. The default Vite development URL is:

```text
http://localhost:5173
```

---

## 🔗 Backend Integration

This frontend works with the Spring Boot backend:

**[Student Management System – Backend](https://github.com/Rehan-shaikh786/student-management-system)**

The backend provides REST APIs for:

* User authentication
* Student management
* Course management
* Enrollment management

Axios is used to send requests to these APIs and attach the JWT token to protected requests when available.

---

## 🔐 Authentication Flow

1. The user registers or logs in through the frontend.
2. The backend validates the credentials.
3. The backend returns a JWT token.
4. The frontend stores authentication details in local storage.
5. Axios attaches the token to protected API requests.
6. The backend validates the token and applies authorization rules.

---

## 🧪 Build and Testing

### Create a Production Build

```bash
npm run build
```

### Run the Development Server

```bash
npm run dev
```

### Preview the Production Build

```bash
npm run preview
```

The production build is generated in the `dist` directory.

---

## 🖥️ Application Modules

| Module         | Description                                      |
| -------------- | ------------------------------------------------ |
| Authentication | User registration and login                      |
| Students       | Create, view, update, and delete student records |
| Courses        | Manage course information                        |
| Enrollments    | Manage student-course enrollments                |

---

## 👨‍💻 Author

**Rehan Iqbal Shaikh**

BCA Graduate | Java Backend Developer

* GitHub: [Rehan-shaikh786](https://github.com/Rehan-shaikh786)
* Frontend Repository: [Student Management Frontend](https://github.com/Rehan-shaikh786/student-management-frontend)
* Backend Repository: [Student Management System](https://github.com/Rehan-shaikh786/student-management-system)
