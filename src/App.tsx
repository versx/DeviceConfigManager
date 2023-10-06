import {
  BrowserRouter as Router,
  Route,
  Routes as Switch,
} from 'react-router-dom';

import {
  AdminProtectedRoute,
  DrawerAppBar,
  ProtectedRoute,
} from './components';
import { Routes } from './consts';
import {
  AdminDashboardPage,
  AdminSettingsPage,
  AdminUsersPage,
  ConfigsPage,
  DashboardPage,
  DevicesPage,
  LoginPage,
  NotFoundPage,
  RegisterPage,
  SchedulesPage,
  SettingsPage,
} from './pages';

const App = () => {
  return (
    <Router>
      <DrawerAppBar>
        <Switch>
          <Route path="*" element={<NotFoundPage />} />
          <Route path={Routes.login} element={<LoginPage />} />
          <Route path={Routes.register} element={<RegisterPage />} />
          <Route path={Routes.dashboard} element={<ProtectedRoute />}>
            <Route index element={<DashboardPage />} />
            <Route path={Routes.configs} element={<ConfigsPage />} />
            <Route path={Routes.devices} element={<DevicesPage />} />
            <Route path={Routes.schedules} element={<SchedulesPage />} />
            <Route path={Routes.settings} element={<SettingsPage />} />
            <Route path={Routes.admin.dashboard} element={<AdminProtectedRoute />}>
              <Route path={Routes.admin.dashboard} element={<AdminDashboardPage />}/>
              <Route path={Routes.admin.users} element={<AdminUsersPage />}/>
              <Route path={Routes.admin.settings} element={<AdminSettingsPage />}/>
            </Route>
          </Route>
        </Switch>
      </DrawerAppBar>
    </Router>
  );
};

export default App;