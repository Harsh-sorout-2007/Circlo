# 🌐 Circlo Backend API

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT" />
</div>

<br />

A robust, production-ready RESTful API for **Circlo**, a full-stack social discussion platform inspired by Reddit. This backend is engineered with a heavy focus on **security, data integrity, transactional consistency, and server-side authorization**.

---

## 🚀 Project Overview

Circlo allows users to create and manage communities, publish multi-format content, engage in nested discussions, and vote on posts/comments. The backend serves as the secure foundation, ensuring that all actions—from media uploads to community moderation—are strictly validated and authorized.

## ✨ Core Features

### 🔐 Authentication & Security

- **JWT Authentication**: Secure access and refresh token rotation mechanism.
- **HTTP-Only Cookies**: Tokens are securely stored in environment-configured cookies.
- **Rate Limiting**: Global API limits alongside strict authentication-specific throttling.
- **Data Validation**: Comprehensive request validation using `express-validator` and custom strict MongoDB ObjectId checks.
- **Anti-Enumeration**: Generic authentication error messages to protect user privacy.

### 👥 Users & Communities

- **User Profiles**: Manage profiles including usernames, display names, bios, and avatars.
- **Community Management**: Create, join, leave, or delete communities.
- **Role-Based Access Control**: Granular permissions for Community Owners, Moderators, and Members.
- **Moderation Tools**: Server-side enforced banning/unbanning of members and review/dismissal of reported content.

### 📝 Posts & Media

- **Versatile Content**: Support for `TEXT`, `IMAGE`, `VIDEO`, and `LINK` posts.
- **Cloudinary Integration**: Seamless media uploads with automatic cleanup when posts/communities are deleted or media is replaced.
- **Community Feeds**: Dedicated feeds for personal homepages and specific communities.
- **Pagination & Search**: Efficient page/limit-based pagination and robust post search functionality.

### 💬 Engagement & Interactions

- **Nested Comments**: Reddit-style comment threads with support for nested replies and tracking.
- **Voting System**: Upvote/downvote posts and comments with strict database constraints to prevent duplicate votes.
- **Saved Posts**: Personalized saved post collections.
- **Data Consistency**: MongoDB transactions ensure reliable score updates during voting.

---

## 🛠️ Tech Stack & Architecture

- **Runtime Environment**: Node.js
- **Web Framework**: Express.js
- **Database & ODM**: MongoDB with Mongoose
- **Security & Auth**: bcrypt, jsonwebtoken, CORS
- **Media Management**: Cloudinary, Multer
- **Architecture Pattern**: MVC-inspired REST API

### 📁 Directory Structure

```text
src/
├── config/          # Database and Cloudinary configuration
├── controllers/     # Request handling and business logic
├── middlewares/     # Authentication, validation, uploads, etc.
├── models/          # Mongoose schemas
├── routes/          # API route definitions
├── utils/           # Shared utilities and helpers
└── validators/      # Request validation rules
```

---

## 🏁 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas)
- Cloudinary account

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd Circlo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory based on the following requirements:

   ```env
   # Server
   PORT=8000
   CORS_ORIGIN=*

   # Database
   MONGODB_URI=your_mongodb_connection_string

   # Authentication
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d

   # Cloudinary Media Storage
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

   _(Note: Never commit your `.env` file to version control.)_

4. **Run the Application**
   - **Development mode (with nodemon):**
     ```bash
     npm run dev
     ```
   - **Production mode:**
     ```bash
     npm start
     ```

---

## 🛡️ API Design Philosophy

This API is built on the principle of **Zero Trust** for client-side applications.

- Every critical action requires server-side authorization.
- Deletions and updates strictly verify resource ownership or moderator privileges.
- Multi-document modifications (like voting) use MongoDB transactions to prevent race conditions and ensure data integrity.
