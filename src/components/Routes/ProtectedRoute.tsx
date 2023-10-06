import { Outlet } from 'react-router-dom';

import { LoginPage } from '../../pages';

export const ProtectedRoute = () => {
  const isAuthenticated = Boolean(localStorage.getItem('isAuthenticated'));
  if (!isAuthenticated) {
    // This will cause the router to navigate to the /login page
    // and skip rendering the children of this route.
    return <LoginPage />;
  }
  
  return <Outlet />;
};

