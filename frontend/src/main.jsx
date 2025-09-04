import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LocaleManager from './pages/LocaleManager.jsx'; // Import our new page
import './index.css';

// Here we define all the possible routes (pages) for our application
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    // These are "child" routes that will render inside the App component
    children: [
      {
        index: true, // This makes the Dashboard the default page for "/"
        element: <Dashboard />,
      },
      {
        path: "group/:groupId", // This is the new page for a specific group
        element: <LocaleManager />,
      },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);