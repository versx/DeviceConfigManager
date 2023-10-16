import { ChangeEvent } from 'react';
import {
  Container,
  FormControlLabel,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import { Theme, useTheme } from '@mui/material/styles';

import { AgentUrlsTextField, BreadcrumbItem, Breadcrumbs, IOSSwitch } from '../../components';
import { DefaultEnableRegistration, SettingKeys } from '../../consts';
import { useServerSettings } from '../../hooks';

const crumbs: BreadcrumbItem[] = [{
  text: 'Dashboard',
  href: '/',
  selected: false,
},{
  text: 'Admin',
  href: '/admin',
  selected: false,
},{
  text: 'Settings',
  href: '/admin/settings',
  selected: true,
}];

const useStyles = (theme: Theme) => ({
  element: {
    marginBottom: 15,
  },
  root: {
    height: '35vh',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    
    border: '1px solid grey',
  },
  inputContainer: {
    padding: '20px',
    justifyContent: 'center',
  },
});

export const AdminSettingsPage = () => {
  const { settings, setSetting } = useServerSettings();
  const theme = useTheme();
  const classes = useStyles(theme);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { target: { name, type, checked, value } } = event;
    const newValue = type === 'checkbox' ? checked : value;
    setSetting(name, newValue);
  };

  const handleSave = (urls: string[]) => {
    setSetting(SettingKeys.AgentUrls, urls.join(','));
  };

  return (
    <Container style={classes.root}>
      <Breadcrumbs crumbs={crumbs} />
      <Typography variant="h4" gutterBottom align="center">
        Admin - Settings
      </Typography>

      <Container component={Paper} elevation={0} sx={classes.container}>
        <div style={classes.inputContainer}>
          <Tooltip
            arrow
            title="Allow users to register new accounts."
          >
            <FormControlLabel
              control={
                <IOSSwitch
                  sx={{ m: 1 }}
                  name={SettingKeys.EnableRegistration}
                  checked={settings
                    ? parseInt(settings[SettingKeys.EnableRegistration] ?? DefaultEnableRegistration) !== 0
                    : DefaultEnableRegistration
                  }
                  onChange={handleChange}
                />
              }
              label="Enable User Registration"
              style={classes.element}
            />
          </Tooltip>

          <br />

          <AgentUrlsTextField
            initialUrls={settings ? (settings[SettingKeys.AgentUrls] ?? '')?.split(',') ?? [] : []}
            onSave={handleSave}
          />
        </div>
      </Container>
    </Container>
  );
};