import { Outlet } from 'react-router-dom';

import { NotFoundPage } from '../../pages';
import { getUserToken } from '../../stores';

export const AdminProtectedRoute = () => {
  const currentUser = getUserToken();
  if (!currentUser?.root) {
    // This will cause the router to navigate to the /login page
    // and skip rendering the children of this route.
    //return <LoginPage />;
    return <NotFoundPage />;
  }
  
  return <Outlet />;
};