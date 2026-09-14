# 🦝 Raccoon Chat

A real-time social chat application built with **React and Firebase**.

Raccoon Chat is a personal project created to explore and practice building a modern real-time web application. It combines authentication, user profiles, social connections, user search, real-time messaging, settings, and responsive UI into one application.

---

### Registration Flow

1. Create an account using your username, email, and password.
2. Click **Submit**.
3. Raccoon sends a verification link to the email address you registered with.
4. Check your email inbox in (Spam) and click the **verification link**.
5. Return to Raccoon and click **Signup**.
6. If your email is verified successfully, you will be redirected to the Home page.

> 📩 **Important:** After clicking Submit, check the inbox of the email address you used to register. You must verify your email before completing signup.

---

 ## 📸 Screenshots 

 ### 🌐 Landing Page

![Raccoon Landing Page](./screenshots/landingpage.jpg)

---

### 🔐 Login

![Raccoon Login](./screenshots/loginpage.jpg)

---

### 📝 Registration

![Raccoon Registration](./screenshots/signup-page.jpg)

After submitting the registration form, users receive a verification email.
They must verify their email before completing signup.

---

### 🏠 Home

![Raccoon Home](./screenshots/homepage.jpg)

---

### 💬 Chat

![Raccoon Chat](./screenshots/chat-page.jpg)

---

### 👤 My Profile

![Raccoon Profile](./screenshots/myprofilepage.jpg)

---

### 👥 Social Profile

![Raccoon Social Profile](./screenshots/social-profile-page.jpg)

---

### ⚙️ Settings

![Raccoon Settings](./screenshots/settingspage.jpg)

---

### 🧑‍💻 Personal Information

![Raccoon Personal Information](./screenshots/personalinfo-page.jpg)

---

### 🚪 Logout

![Raccoon Logout](./screenshots/logout.jpg)

---

## ✨ Features

### 🔐 Authentication

* User registration and login
* Firebase Authentication
* Email verification
* Protected application routes
* Account management

### 👤 User Profiles

* Custom Raccoon avatars
* Public usernames and unique handles
* User bios and profile information
* User status
* Profile statistics
* View other users' profiles

### 🔎 User Search

* Search users by handle
* Search history
* Recently searched users
* Quick access to user profiles

### 💬 Real-Time Chat

* Real-time messaging with Firebase
* Send text messages
* Edit messages
* Delete messages
* Reply to messages
* Message interaction UI

### 👥 Social Features

* Follow users
* Unfollow users
* Followers
* Following
* Friends through mutual following
* Follower and following counts

### ⚙️ Settings

* Profile management
* Personal information
* Social profile settings

### 📱 Responsive Design

* Desktop layout
* Mobile-friendly interface
* Adaptive navigation
* Responsive profile, settings, and chat interfaces

---

## 🛠️ Tech Stack

### Frontend

* **React**
* **JavaScript**
* **Tailwind CSS**
* **Vite**
* **Lucide React**

### Backend & Services

* **Firebase Authentication**
* **Cloud Firestore**

### Development

* **Git**
* **GitHub**
* **Visual Studio Code**

---

## 🏗️ Project Structure

The project is organized around React components, application pages, Firebase services, and reusable UI elements.

```text
src/
├── components/
├── pages/
├── services/
│   └── firebase.js
├── assets/
├── App.jsx
└── main.jsx
```

### Main Areas

| Directory / File | Purpose                                |
| ---------------- | -------------------------------------- |
| `components/`    | Reusable UI components                 |
| `pages/`         | Main application pages and views       |
| `services/`      | Firebase configuration and services    |
| `assets/`        | Images and static assets               |
| `App.jsx`        | Application routing and main structure |
| `main.jsx`       | React application entry point          |

> The exact structure may evolve as the project continues to develop.

---

## 🔥 Firebase

Raccoon uses Firebase for authentication and application data.

### Firebase Authentication

Firebase Authentication is used for:

* User registration
* User login
* Email verification
* Authenticated user sessions

### Cloud Firestore

Firestore stores application data such as:

* User profiles
* Unique user handles
* Followers and following relationships
* Search history
* Chat and message data

Firestore Security Rules are used to control access to protected data and operations.

---

## 🚀 Getting Started

### Prerequisites

Before running Raccoon locally, make sure you have:

* [Node.js](https://nodejs.org/) installed
* npm installed
* A Firebase project
* Git installed

### 1. Clone the repository

```bash
git clone https://github.com/SimKimchheang/Raccoon-Chat.git
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Create a `.env` file in the project root and add your Firebase configuration.

Example:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> Do not commit your `.env` file to GitHub.

### 4. Start the development server

```bash
npm run dev
```

Vite will provide a local development URL in the terminal.

---

## 🔑 Environment Variables

Raccoon uses environment variables for Firebase configuration.

A `.env.example` file can be provided so other developers know which variables are required without exposing your actual configuration.

Recommended `.gitignore` entries:

```gitignore
.env
.env.local
.env.*.local
```

---

## 🔐 Security

Raccoon uses Firebase Authentication and Firestore Security Rules to protect application data.

Authenticated users are required for protected functionality, while Firestore rules restrict access to data based on authentication and ownership.

> Security rules should always be reviewed and tested before deploying the application to production.

---

## 🧠 What I Learned

Building Raccoon Chat gave me practical experience with:

* Building a React application from scratch
* Designing a real-time chat application
* Working with Firebase Authentication
* Working with Cloud Firestore
* Designing Firestore data structures
* Writing and debugging Firestore Security Rules
* Implementing protected routes
* Managing authentication state
* Handling asynchronous operations
* Building user-to-user relationships
* Implementing search functionality
* Creating responsive interfaces
* Managing complex UI state
* Debugging real-world application issues
* Using Git and GitHub for version control

This project also helped me better understand how different parts of a modern web application work together rather than treating each feature as an isolated component.

---

## 🗺️ Future Improvements

Some features and improvements that may be added in the future include:

* 😀 Message emojis and reactions
* 🔔 Notifications
* 🖼️ Improved media sharing
* 🎨 More profile customization
* 🎵 Profile music and animations
* ⚡ Performance improvements
* ♿ Additional accessibility improvements
* 🔒 Additional privacy controls

---

## 📚 Project Status

Raccoon Chat is an actively developed personal project.

The application is primarily intended as a learning and portfolio project while continuing to experiment with real-time communication, social features, Firebase, and modern React development.

---

## 👨‍💻 Author

**Sim Kimchheang**

Information Technology Engineering Student

Interested in building web applications and learning through real-world projects.

* GitHub: `https://github.com/SimKimchheang`
* LinkedIn: `YOUR_LINKEDIN_URL`

---

## 📄 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for more information.
