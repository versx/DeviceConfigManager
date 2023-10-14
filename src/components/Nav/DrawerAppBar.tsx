import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  AppSettingsAlt as IPhoneConfigIcon,
  ArrowDropDown as ArrowDropDownIcon,
  CalendarMonth as SchedulesIcon,
  Dashboard as DashboardIcon,
  //FormatListBulleted as LogsIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  PhoneIphone as IPhoneIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

import { AccountMenu, AdminDropdown, DropdownItem, SidebarDrawer } from '..';
import { ActiveMenuItemColor, DrawerWidth, Routes, StorageKeys, Title } from '../../consts';
import { useColorMode } from '../../contexts';
import { get, set } from '../../modules';
import { getUserToken } from '../../stores';
import { User } from '../../types';

const NavItems: DropdownItem[] = [
  { text: 'Dashboard', path: Routes.dashboard, requiresAuth: true, icon: <DashboardIcon />, tooltip: 'Dashboard' },
  { text: 'Configs', path: Routes.configs, requiresAuth: true, icon: <IPhoneConfigIcon />, tooltip: 'Device configs' },
  { text: 'Devices', path: Routes.devices, requiresAuth: true, icon: <IPhoneIcon />, tooltip: 'Devices' },
  { text: 'Schedules', path: Routes.schedules, requiresAuth: true, icon: <SchedulesIcon />, tooltip: 'Device schedules' },
  //{ text: 'Logs', path: Routes.logs, requiresAuth: true, icon: <LogsIcon />, tooltip: 'Device activity logs' },
  { text: 'Login', path: Routes.login, requiresAuth: false, icon: <PersonIcon />, tooltip: 'Login' },
  { text: 'Register', path: Routes.register, requiresAuth: false, icon: <PersonIcon />, tooltip: 'Register' },
];

const AdminItems: DropdownItem[] = [
  { text: 'Dashboard', path: Routes.admin.dashboard, icon: <AdminPanelSettingsIcon />, tooltip: 'Admin Dashboard' },
  { text: 'Users', path: Routes.admin.users, icon: <PersonIcon />, tooltip: 'Admin User Accounts Dashboard' },
  { text: 'divider', path: 'divider' },
  { text: 'Settings', path: Routes.admin.settings, icon: <SettingsIcon />, tooltip: 'Admin Settings' },
];

// #303030
// #121212

export const DrawerAppBar = (props: any) => {
  const { children } = props;
  const cachedAdminOpen = get(StorageKeys.AdminOpen, false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(cachedAdminOpen);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { mode, prefersDarkMode } = useColorMode();
  const colorMode = mode === 'system'
    ? prefersDarkMode ? 'default' : 'primary'
    : mode === 'dark' ? 'default' : 'primary';
  const currentUser = getUserToken() as User;
  const isAuthenticated = Boolean(get(StorageKeys.IsAuthenticated));
  const isAdmin = Boolean(currentUser?.root);

  const handleOpenAdminMenu = (event: any) => {
    event.stopPropagation(); // Stop the event propagation
    setAnchorEl(event.currentTarget);
  };
  const handleCloseAdminMenu = () => setAnchorEl(null);

  const handleToggleAdminMenu = (event: any) => {
    event.stopPropagation();
    set(StorageKeys.AdminOpen, !adminOpen);
    setAdminOpen((prev: boolean) => !prev);
  };

  const handleDrawerToggle = () => setMobileOpen((prevState) => !prevState);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <AppBar
        enableColorOnDark
        component="nav"
        color={colorMode}
      >
        <Toolbar>
          <Tooltip title="Toggle navigation drawer" arrow>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>

          <img
            src="/logo192.png"
            alt="logo"
            style={{
              height: 28,
              width: 28,
              marginRight: '10px',
            }}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'block' } }}
          >
            <a href={Routes.dashboard} style={{textDecoration: 'none', color: 'inherit'}}>
              {Title}
            </a>
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <>
              {NavItems.map((item: DropdownItem, index: number) =>
                (((isAuthenticated && item.requiresAuth) || (!isAuthenticated && !item.requiresAuth)) && (
                <a key={index} href={item.path} style={{textDecoration: 'none', color: 'inherit'}}>
                  <Tooltip
                    title={item.tooltip ?? item.text}
                    arrow
                  >
                    <Button
                      style={{
                        textDecoration: 'none',
                        color: item.path === window.location.pathname
                          // Active nav items
                          ? mode === 'system'
                            ? prefersDarkMode ? ActiveMenuItemColor : 'white'
                            : mode === 'dark' ? ActiveMenuItemColor : 'black'
                          // Not active nav items
                          : 'white',
                          //: mode === 'system'
                          //  ? prefersDarkMode ? 'white' : 'white'
                          //  : mode === 'dark' ? 'white' : 'white',
                      }}
                    >
                      {item.text}
                    </Button>
                  </Tooltip>
                </a>
              )))}
              {isAdmin && (
                <Tooltip title="Admin Dashboard" arrow>
                  <IconButton
                    aria-controls="admin-menu"
                    aria-haspopup="true"
                    onClick={handleOpenAdminMenu}
                    style={{color: 'inherit'}}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AdminPanelSettingsIcon />
                      <ArrowDropDownIcon sx={{ fontSize: '1rem', ml: 0.5 }} />
                    </Box>
                  </IconButton>
                </Tooltip>
              )}
            </>
          </Box>
          {isAuthenticated && (<AccountMenu />)}
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { sm: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DrawerWidth },
          }}
        >
          <SidebarDrawer
            adminOpen={adminOpen}
            navItems={NavItems}
            adminItems={AdminItems}
            onToggleAdminMenu={handleToggleAdminMenu}
            onToggleDrawer={handleDrawerToggle}
          />
        </Drawer>
      </nav>
      <Box component="main" sx={{ p: 3, w: '100vw' }}>
        <Toolbar />
        {children}
      </Box>
      {isAdmin && (
        <AdminDropdown
          isAdmin={isAdmin}
          open={anchorEl}
          items={AdminItems}
          onClose={handleCloseAdminMenu}
        />
      )}
    </Box>
  );
};