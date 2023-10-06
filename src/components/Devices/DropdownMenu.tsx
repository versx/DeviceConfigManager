import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  ArrowForwardIos as ArrowForwardIosIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

import { Config, Device } from '../../types';

interface DropdownMenuProps {
  configs: Config[];
  device: Device;
  onAssign: (uuid: string, config: string | null) => void;
  onEdit: (device: Device) => void;
  onDelete: (uuid: string) => void;
};

export const DropdownMenu = (props: DropdownMenuProps) => {
  const { configs, device, onAssign, onEdit, onDelete } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [subMenuAnchorEl, setSubMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: any) => setAnchorEl(event.currentTarget);

  const handleMenuClose = () => {
    setAnchorEl(null);
    // close the sub-menu as well
    setSubMenuAnchorEl(null);
  };

  const handleSubMenuOpen = (event: any) => {
    // prevent main menu from closing
    event.stopPropagation();
    // anchor to the same element as main menu
    setSubMenuAnchorEl(anchorEl);
  };

  const handleSubMenuClose = (event: React.MouseEvent) => {
    // prevent main menu from closing
    event.stopPropagation();
    setSubMenuAnchorEl(null);
  };

  const handleAssign = (uuid: string, config: string | null) => {
    handleMenuClose();
    onAssign(uuid, config);
  };

  const handleEdit = (device: Device) => {
    handleMenuClose();
    onEdit(device);
  };

  const handleDelete = (uuid: string) => {
    handleMenuClose();
    onDelete(uuid);
  };

  return (
    <>
      <Tooltip title="Edit device" arrow>
        <IconButton
          aria-label="Edit device"
          color="primary"
          size="small"
          onClick={() => handleEdit(device)}
        >
          <EditIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Delete device" arrow>
        <IconButton
          aria-label="Delete device"
          color="error"
          size="small"
          onClick={() => handleDelete(device.uuid)}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Edit device" arrow>
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
          Assign Config&nbsp;
          <ArrowForwardIosIcon fontSize="small" />
        </MenuItem>
        <MenuItem key="edit" onClick={() => handleEdit(device)}>Edit</MenuItem>
        <MenuItem key="delete" onClick={() => handleDelete(device.uuid)}>Delete</MenuItem>
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
        <MenuItem key="none" onClick={() => handleAssign(device.uuid, null)}>
          None
        </MenuItem>
        
        <MenuItem divider disabled sx={{p: 0}} />
        {configs.map((config: Config, index: number) => (
          <MenuItem key={index} onClick={() => handleAssign(device.uuid, config.name)}>
            {config.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};