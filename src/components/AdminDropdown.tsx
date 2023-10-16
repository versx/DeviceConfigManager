import React, { ReactNode } from 'react';
import {
  Divider,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';

import { ActiveMenuItemColor } from '../consts';

export interface AdminDropdownProps {
  open: boolean;
  isAdmin: boolean;
  items: DropdownItem[];
  onClose: () => void;
};

export type DropdownItem = {
  text: string;
  path: string;
  requiresAuth?: boolean;
  icon?: ReactNode;
  tooltip?: string;
};

export const AdminDropdown = (props: any) => {
  const { open, isAdmin, items, onClose } = props;

  if (!isAdmin) {
    return null;
  }

  return (
    <Menu
      id="admin-menu"
      anchorEl={open}
      open={Boolean(open)}
      onClose={onClose}
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
      {items.map((item: DropdownItem, index: number) => item.text === 'divider' ? (
        <Divider key={index} />
      ) : (
        <Tooltip
          arrow
          key={index}
          placement="left-start"
          title={item.tooltip ?? item.text}
        >
          <MenuItem
            key={index}
            component="a"
            href={item.path}
            onClick={onClose}
            style={{
              textDecoration: 'none',
              color: item.path === window.location.pathname ? ActiveMenuItemColor : 'inherit',
            }}
          >
            {item.icon}&nbsp;{item.text}
          </MenuItem>
        </Tooltip>
      ))}
    </Menu>
  );
};