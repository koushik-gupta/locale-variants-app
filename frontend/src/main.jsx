import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LocaleManager from './pages/LocaleManager.jsx';
import SidebarExtension from './components/SidebarExtension.jsx'; // <-- IMPORT THIS
import './index.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "group/:groupId",
        element: <LocaleManager />,
      },
    ]
  },
  // ADD THIS NEW ROUTE FOR THE SIDEBAR
  {
    path: "/sidebar",
    element: <SidebarExtension />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);