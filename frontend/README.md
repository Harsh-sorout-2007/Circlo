# Circlo - Frontend

This is the frontend repository for **Circlo**, a Reddit-inspired full-stack web application. It is built using modern web technologies to provide a fast, responsive, and intuitive user interface.

## 🚀 Tech Stack

- **React 19**: A robust JavaScript library for building user interfaces.
- **Vite**: Next-generation, lightning-fast frontend tooling and build process.
- **React Router DOM**: Declarative routing for React web applications.
- **Axios**: Promise-based HTTP client for interacting with the backend API.
- **Lucide React**: Beautiful and consistent iconography.

## 📁 Project Structure

```text
frontend/
├── public/          # Static assets that don't need processing
├── src/             # Main source code
│   ├── assets/      # Local assets (images, stylesheets, etc.)
│   ├── components/  # Reusable React components
│   ├── pages/       # Application views/pages for routing
│   ├── App.jsx      # Main application component layout
│   └── main.jsx     # Entry point to the React application
├── package.json     # Project metadata and dependencies
└── vite.config.js   # Vite bundler configuration
```

## 🛠️ Getting Started

Follow these steps to set up the frontend locally for development.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

### Installation

1. Make sure you are in the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

To start the Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173` by default.

### Building for Production

To create an optimized, production-ready build:

```bash
npm run build
```

The compiled assets will be generated in the `dist` folder, which can then be deployed to any static hosting platform like Vercel, Netlify, or AWS S3.

To preview the production build locally:

```bash
npm run preview
```

## 🧑‍💻 Available Scripts

- `npm run dev`: Starts the local development server.
- `npm run build`: Compiles the application for production.
- `npm run lint`: Runs ESLint to analyze the code for potential errors and styling consistency.
- `npm run preview`: Previews the built production app locally.

## 🔗 Backend Integration

This frontend is designed to work seamlessly with the Circlo backend (built with Express.js and MongoDB). Ensure that the backend server is running locally or deployed, and that any required environment variables (like API base URLs) are configured correctly so the frontend can interact with the API.
