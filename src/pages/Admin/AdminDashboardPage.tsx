import React, { useCallback, useEffect, useState } from 'react';
import {
  Container,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import { Routes } from '../../consts';
import { BreadcrumbItem, Breadcrumbs, CardDisplay, StatTile } from '../../components';
import { UserService } from '../../services';
import { User } from '../../types';

const crumbs: BreadcrumbItem[] = [{
  text: 'Dashboard',
  href: '/',
  selected: false,
},{
  text: 'Admin',
  href: '/admin',
  selected: true,
}];

export const AdminDashboardPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<any>({
    total: 0,
    admins: 0,
    users: 0,
    enabled: 0,
    disabled: 0,
  });
  const { enqueueSnackbar } = useSnackbar();

  const handleSettings = () => window.location.href = Routes.admin.settings;

  const handleReloadStats = useCallback(() => {
    UserService.getUsers().then((response: any) => {
      if (response.status !== 'ok') {
        enqueueSnackbar(`Failed to retrieve users with error: ${response.error}`, { variant: 'error' });
        return;
      }
      const users = response.users;
      setUsers(users);
      setUserStats({
        total: users.length,
        admins: users.filter((user: any) => user.admin).length,
        users: users.filter((user: any) => !user.admin).length,
        enabled: users.filter((user: any) => user.enabled).length,
        disabled: users.filter((user: any) => !user.enabled).length,
      });
    })
  }, [enqueueSnackbar]);

  useEffect(() => handleReloadStats(), [handleReloadStats]);

  return (
    <Container>
      <Tooltip title="Admin Settings" arrow>
        <IconButton
          size="large"
          onClick={handleSettings}
          style={{
            display: 'flex',
            float: 'right',
          }}
        >
          <SettingsIcon sx={{fontSize: 36}} />
        </IconButton>
      </Tooltip>

      <Breadcrumbs crumbs={crumbs} />
      <Typography variant="h4" gutterBottom style={{textAlign: 'center'}}>
        Admin - Dashboard
      </Typography>

      <Container component={Paper} elevation={6} style={{ padding: '16px', marginTop: '24px', marginBottom: '24px', border: '1px solid grey', borderRadius: '8px' }}>
        <Typography variant="h5" gutterBottom style={{textAlign: 'center'}}>
          Overall Statistics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <CardDisplay
              text="Users"
              icon={<PersonIcon sx={{fontSize: 48}} />}
              value={users.length.toLocaleString()}
              elevation={0}
              href={Routes.admin.users}
              width="100%"
              height="130px"
            />
          </Grid>
        </Grid>
      </Container>
      <Container component={Paper} elevation={6} style={{ padding: '16px', marginTop: '24px', marginBottom: '24px', border: '1px solid grey', borderRadius: '8px' }}>
        <Typography variant="h5" gutterBottom style={{textAlign: 'center'}}>
          User Statistics
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12}>
            <StatTile title="Total" value={userStats.total} color="primary.main" elevation={0}/>
          </Grid>
          <Grid item xs={6}>
            <StatTile title="Admins" value={userStats.admins} color="primary.main" elevation={0} />
          </Grid>
          <Grid item xs={6}>
            <StatTile title="Users" value={userStats.users} color="primary.main" elevation={0} />
          </Grid>
          <Grid item xs={6}>
            <StatTile title="Enabled" value={userStats.enabled} color="primary.main" elevation={0} />
          </Grid>
          <Grid item xs={6}>
            <StatTile title="Disabled" value={userStats.disabled} color="error.main" elevation={0} />
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
};