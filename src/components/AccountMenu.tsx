import React, { MouseEvent, useState } from 'react';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  ArrowDropDown as ArrowDropDownIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import { ActiveMenuItemColor, Routes } from '../consts';
import { useColorMode } from '../contexts';
import { AuthService } from '../services';
import { getUserToken } from '../stores';

export const AccountMenu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { enqueueSnackbar } = useSnackbar();
  const open = Boolean(anchorEl);
  const currentUser = getUserToken();
  const { mode } = useColorMode();

  const handleClick = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleMyAccount = () => {
    handleClose();
    window.location.href = Routes.settings;
  };

  const handleLogout = () => {
    enqueueSnackbar('Successfully logged out!', { variant: 'success' });
    handleClose();
    AuthService.logout();
  };

  return (
    <>
      <Tooltip title="Account Settings" arrow>
        <IconButton
          size="small"
          sx={{ ml: 1, color: 'inherit' }}
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: mode === 'light' ? '#303030' : ActiveMenuItemColor, //'#909090',
                width: 32,
                height: 32,
              }}
            >
              {/*currentUser?.username[0]*/}
            </Avatar>
            <ArrowDropDownIcon sx={{ fontSize: '1rem', ml: 0.5 }} />
          </Box>
        </IconButton>
      </Tooltip>
      &nbsp;{currentUser?.username}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Tooltip title="User Account Settings" placement="left-start" arrow>
          <MenuItem
            onClick={handleMyAccount}
            style={{
              textDecoration: 'none',
              color: Routes.settings === window.location.pathname ? ActiveMenuItemColor : 'inherit',
            }}
          >
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
        </Tooltip>
        <Divider />
        <Tooltip title="Logout of current user account" placement="left-start" arrow>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Tooltip>
      </Menu>
    </>
  );
};