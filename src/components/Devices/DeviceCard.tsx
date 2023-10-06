import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import {
  ArrowForwardIos as ArrowForwardIosIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

import { Config, Device } from '../../types';

interface DeviceCardProps {
  device: Device;
  configs: Config[]; // Add this to provide a list of configs for the assign action
  onAssign: (uuid: string, config: string | null) => void;
  onEdit: (device: Device) => void;
  onDelete: (uuid: string) => void;
};

export const DeviceCard = (props: DeviceCardProps) => {
  const {
    device, configs,
    onAssign, onEdit, onDelete,
  } = props;
  const imageUrl = 'https://raw.githubusercontent.com/versx/DeviceConfigManager/master/static/img/device.png';

  return (
    <Card
      onClick={() => console.log('clicked')} // TODO: Open device manager page
      style={{borderRadius: 16}}
    >
      <CardHeader
        avatar={
          // eslint-disable-next-line jsx-a11y/img-redundant-alt
          <img
            src={imageUrl}
            alt="device image"
            style={{
              width: 48,
              height: 84,
              backgroundColor: device.lastSeen ? 'green' : 'red',
              //borderRadius: '50%',
            }}
          />
        }
        title={device.uuid}
        subheader={device.model}
        action={
          <DropdownMenu
            configs={configs}
            device={device}
            onAssign={onAssign}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        }
      />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          Config: {device.config ?? 'Not Assigned'}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          IP Address: {device.ipAddr}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          iOS Version: {device.iosVersion}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          IPA Version: {device.ipaVersion}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          Last Seen: {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'N/A'}
        </Typography>
        {device.notes && (
          <Typography variant="body2" color="textSecondary" component="p">
            Notes: {device.notes}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

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
    <div>
      <IconButton
        aria-label="settings"
        onClick={handleMenuOpen}
      >
        <MoreVertIcon />
      </IconButton>

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
        <MenuItem key="none" onClick={() => handleAssign(device.uuid, null)}>None</MenuItem>
        
        <MenuItem divider disabled sx={{p: 0}} />
        {configs.map((config: Config, index: number) => (
          <MenuItem key={index} onClick={() => handleAssign(device.uuid, config.name)}>
            {config.name}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};