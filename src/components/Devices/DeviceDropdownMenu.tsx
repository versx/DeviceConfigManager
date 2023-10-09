import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  ArrowForwardIos as ArrowForwardIosIcon,
  Article as ViewLogsIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

import { Config, Device } from '../../types';

interface DeviceDropdownMenuProps {
  configs: Config[];
  device: Device;
  onAssign: (uuid: string, config: string | null) => void;
  onEdit: (device: Device) => void;
  onDelete: (uuid: string) => void;
  onViewLogs: (uuid: string) => void;
};

export const DeviceDropdownMenu = (props: DeviceDropdownMenuProps) => {
  const {
    configs, device,
    onAssign, onEdit, onDelete, onViewLogs,
  } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [subMenuAnchorEl, setSubMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: any) => {
    event.stopPropagation();

    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event: any) => {
    event.stopPropagation();

    setAnchorEl(null);
    // Close the sub-menu as well
    setSubMenuAnchorEl(null);
  };

  const handleSubMenuOpen = (event: any) => {
    // Prevent main menu from closing
    event.stopPropagation();

    // Anchor to the same element as main menu
    setSubMenuAnchorEl(anchorEl);
  };

  const handleSubMenuClose = (event: React.MouseEvent) => {
    // Prevent main menu from closing
    event.stopPropagation();

    setSubMenuAnchorEl(null);
  };

  const handleAssign = (event: any, uuid: string, config: string | null) => {
    event.stopPropagation();

    handleMenuClose(event);
    onAssign(uuid, config);
  };

  const handleEdit = (event: any, device: Device) => {
    event.stopPropagation();

    handleMenuClose(event);
    onEdit(device);
  };

  const handleDelete = (event: any, uuid: string) => {
    event.stopPropagation();

    handleMenuClose(event);
    onDelete(uuid);
  };

  const handleViewLogs = (event: any, uuid: string) => {
    event.stopPropagation();

    handleMenuClose(event);
    onViewLogs(uuid);;
  };

  return (
    <>
      <Tooltip title="Edit device" arrow>
        <IconButton
          aria-label="Edit device"
          //color="primary"
          size="small"
          onClick={(e) => handleEdit(e, device)}
          style={{
            color: 'dodgerblue',
          }}
        >
          <EditIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Delete device" arrow>
        <IconButton
          aria-label="Delete device"
          size="small"
          onClick={(e) => handleDelete(e, device.uuid)}
        >
          <DeleteIcon color="error" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Device settings" arrow>
        <IconButton
          aria-label="settings"
          onClick={handleMenuOpen}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem 
          onClick={handleSubMenuOpen} 
          // open sub-menu on hover for better UX
          //onMouseOver={handleSubMenuOpen}
          //onMouseOut={handleSubMenuClose}
        >
          <SettingsIcon />&nbsp;
          Assign Config&nbsp;
          <ArrowForwardIosIcon fontSize="small" />
        </MenuItem>
        <MenuItem key="logs" onClick={(e) => handleViewLogs(e, device.uuid)}>
          <ViewLogsIcon />&nbsp;
          View Logs
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={subMenuAnchorEl}
        open={Boolean(subMenuAnchorEl)}
        onClose={handleSubMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        // adjust this value based on the width of the main menu
        style={{ marginLeft: '200px' }}
      >
        <MenuItem key="none" onClick={(e) => handleAssign(e, device.uuid, null)}>
          None
        </MenuItem>
        
        <MenuItem divider disabled sx={{p: 0}} />
        {configs.map((config: Config, index: number) => (
          <MenuItem key={index} onClick={(e) => handleAssign(e, device.uuid, config.name)}>
            {config.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};