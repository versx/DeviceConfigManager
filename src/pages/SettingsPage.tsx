import {
  Container,
  Paper,
  Typography,
} from '@mui/material';

import {
  ApiKeyTextField,
  BreadcrumbItem,
  Breadcrumbs,
  ChangePassword,
  ThemeSelector,
} from '../components';
import { useColorMode } from '../contexts';
import { getUserToken } from '../stores';

const crumbs: BreadcrumbItem[] = [{
  text: 'Dashboard',
  href: '/',
  selected: false,
},{
  text: 'Settings',
  href: '/settings',
  selected: true,
}];

export const SettingsPage = () => {
  const { mode, setColorMode } = useColorMode();
  const currentUser = getUserToken();

  return (
    <Container style={{ height: '35vh' }}>
      <Breadcrumbs crumbs={crumbs} />

      <Typography variant="h4" gutterBottom style={{textAlign: 'center'}}>
        Settings
      </Typography>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Container component={Paper} elevation={1} style={{ padding: '20px', marginTop: '20px', border: '1px solid grey' }}>
          <Typography variant="h6" align="center" gutterBottom>
            Theme
          </Typography>
          <ThemeSelector
            theme={mode}
            onThemeChange={setColorMode}
          />
        </Container>

        <Container component={Paper} elevation={1} style={{ padding: '20px', marginTop: '20px', border: '1px solid grey' }}>
          <Typography variant="h6" align="center" gutterBottom>
            API Key
          </Typography>
          <ApiKeyTextField initialValue={currentUser?.apiKey} />
        </Container>

        <Container component={Paper} elevation={1} style={{ padding: '20px', marginTop: '20px', border: '1px solid grey' }}>
          <Typography variant="h6" align="center" gutterBottom>
            Change Password
          </Typography>
          <ChangePassword />
        </Container>
      </div>
    </Container>
  );
};