import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LocaleManager from './pages/LocaleManager.jsx';
import SidebarExtension from './components/SidebarExtension.jsx';
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
        // This path now correctly matches the links from the dashboard
        path: "manage/:groupId", 
        element: <LocaleManager />,
      },
    ]
  },
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