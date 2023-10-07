import {
  Box,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

import { DropdownItem } from '..';
import { ActiveMenuItemColor, Routes, StorageKeys, Title } from '../../consts';
import { get } from '../../modules';
import { getUserToken } from '../../stores';
import { User } from '../../types';

interface SidebarDrawerProps {
  adminOpen: boolean;
  navItems: DropdownItem[];
  adminItems: DropdownItem[];
  onToggleDrawer: () => void;
  onToggleAdminMenu: (event: any) => void;
};

export const SidebarDrawer = (props: SidebarDrawerProps) => {
  const {
    adminOpen, navItems, adminItems,
    onToggleDrawer, onToggleAdminMenu,
  } = props;

  const currentUser = getUserToken() as User;
  const isAuthenticated = Boolean(get(StorageKeys.IsAuthenticated));
  const isAdmin = Boolean(currentUser?.root);

  return (
    <Box onClick={onToggleDrawer} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, justifyContent: 'center' }}>
        <a
          href={Routes.dashboard}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <img
            src="/logo192.png"
            alt="URLminify Logo"
            style={{
              height: 28,
              width: 28,
              marginRight: '10px',
            }}
          />
          {Title}
        </a>
      </Typography>
      <Divider />
      <List>
        {navItems.map((item: DropdownItem, index: number) => item.text === 'divider' ? (
          <Divider key={index} />
        ) : (isAuthenticated && item.requiresAuth && (
          <ListItem key={index} disablePadding button>
            <ListItemButton
              href={item.path}
              style={{
                textDecoration: 'none',
                color: item.path === window.location.pathname ? ActiveMenuItemColor : 'inherit',
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        )))}
        {isAdmin && isAuthenticated && (
          <>
            <ListItem key='admin' disablePadding button onClick={onToggleAdminMenu}>
              <ListItemButton>
                <ListItemIcon>
                  <AdminPanelSettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Admin" />
                {adminOpen
                  ? <ExpandLessIcon />
                  : <ExpandMoreIcon />
                }
              </ListItemButton>
            </ListItem>
            <Collapse in={adminOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {adminItems.map((item: DropdownItem, index: number) => (item.text === 'divider' ? (
                  <Divider key={index} />
                ) : (
                  <ListItem
                    key={index}
                    disablePadding
                    style={{ paddingLeft: 32 }}
                  >
                    <ListItemButton
                      href={item.path}
                      style={{
                        textDecoration: 'none',
                        color: item.path === window.location.pathname ? ActiveMenuItemColor : 'inherit',
                      }}
                    >
                      <ListItemIcon>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  </ListItem>
                )))}
              </List>
            </Collapse>
          </>
        )}
      </List>
    </Box>
  );
};