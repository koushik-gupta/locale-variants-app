import { Outlet } from 'react-router-dom';

function App() {
  return (
    // The <Outlet /> component is the placeholder where the router
    // will render the correct page (like your dashboard).
    <Outlet />
  );
}

export default App;