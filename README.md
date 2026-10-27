# Circlo

**Circlo** is a full-stack, Reddit-inspired web application. It allows users to create communities, share posts, and engage in discussions, providing a familiar and intuitive interface reminiscent of popular discussion platforms.

## 🌟 Features

- **User Authentication**: Secure sign-up and login functionality using JWT and bcrypt.
- **Post & Media Sharing**: Users can create posts with text or images (powered by Cloudinary).
- **Responsive Design**: A sleek, modern UI that works seamlessly across desktop and mobile devices.
- **API Security**: Rate limiting and payload validation built into the backend.

*(Note: Features are illustrative based on the tech stack. Update this section as the project evolves!)*

## 🛠️ Tech Stack

This project is built using the MERN stack (MongoDB, Express, React, Node.js) with modern enhancements.

### Frontend
- **React 19**: UI library for building component-driven interfaces.
- **Vite**: Fast frontend build tool and dev server.
- **React Router**: For client-side routing and navigation.
- **Axios**: HTTP client for API requests.
- **Lucide React**: Consistent iconography.
- _More details in the [`frontend/README.md`](./frontend/README.md)_

### Backend
- **Node.js & Express.js**: Fast, unopinionated server and API framework.
- **MongoDB & Mongoose**: NoSQL database and object modeling.
- **JSON Web Tokens (JWT) & Bcrypt**: For secure, stateless authentication and password hashing.
- **Cloudinary & Multer**: For media uploads and image storage.
- _Code located in the [`backend`](./backend/) directory._

## 📁 Project Structure

This repository is organized into a structure containing both the client and server code:

```text
Circlo/
├── backend/    # Node.js + Express backend API
└── frontend/   # React + Vite frontend application
```

## 🚀 Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- MongoDB (local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) URI)
- [Cloudinary](https://cloudinary.com/) Account (for image uploads)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Circlo.git
cd Circlo
```

*(Be sure to replace `your-username` with your actual GitHub username)*

### 2. Setup the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add your required environment variables. Typical variables might include:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Setup the Frontend

1. Open a new terminal window/tab and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### 4. Open the Application

Navigate to `http://localhost:5173` (or the port specified by Vite in your terminal) in your browser to view the app!

###5. Demo Video Link
Link: `https://drive.google.com/file/d/1m14HtEPo_eB3hjKq0QPC4c5TczsNtnIm/view?usp=sharing`

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License

This project is licensed under the ISC License.
