import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Tooltip,
  Typography,
} from '@mui/material';
import moment from 'moment';

import { DeviceDropdownMenu } from '..';
import {
  DeviceOnlineIcon, DeviceOfflineIcon,
  Never, NotAssigned, UnknownModel,
} from '../../consts';
import { getDeviceRestartCount, isDeviceOnline } from '../../modules';
import { Config, Device } from '../../types';

interface DeviceCardProps {
  device: Device;
  configs: Config[];
  onAssign: (uuid: string, config: string | null) => void;
  onEdit: (device: Device) => void;
  onDelete: (uuid: string) => void;
  onViewLogs: (uuid: string) => void;
};

export const DeviceCard = (props: DeviceCardProps) => {
  const {
    device, configs,
    onAssign, onEdit, onDelete, onViewLogs,
  } = props;
  const isOnline = isDeviceOnline(device?.lastSeen);
  const restarts = getDeviceRestartCount(device);

  const handleViewDevice = () => {
    // Open device manager page
    window.location.href = `/devices/${device.uuid}`;
  };

  return (
    <Tooltip
      title={`Click or tap to view device ${device.uuid}`}
      placement="left-start"
      arrow
      followCursor
    >
      <Card
        variant="elevation"
        elevation={3}
        onMouseOver={(event: any) => event.currentTarget.style.cursor = 'pointer'}
        onClick={handleViewDevice}
        style={{border: '1px solid grey', borderRadius: 16}}
      >
        <CardHeader
          avatar={
            // eslint-disable-next-line jsx-a11y/img-redundant-alt
            <img
              src={isOnline ? DeviceOnlineIcon : DeviceOfflineIcon}
              alt="device image"
              style={{
                width: 64,
                height: 64,
              }}
            />
          }
          title={device.uuid}
          subheader={device.model ?? UnknownModel}
          action={
            <DeviceDropdownMenu
              configs={configs}
              device={device}
              onAssign={onAssign}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewLogs={onViewLogs}
            />
          }
          style={{paddingBottom: 3}}
        />
        <Divider variant="middle" />
        <CardContent style={{paddingTop: 8, marginTop: 0}}>
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <Typography variant="body2" color="textSecondary" component="p">
              Config: {device.config ?? NotAssigned}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              IP Address: {device.ipAddr ?? '--'}
            </Typography>
          </div>
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <Typography variant="body2" color="textSecondary" component="p">
              <small>iOS Version: {device.iosVersion ?? '--'}</small>
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              <small>IPA Version: {device.ipaVersion ?? '--'}</small>
            </Typography>
          </div>
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <Typography variant="body2" color="textSecondary" component="p">
              <small>Restarts: {restarts.toLocaleString()}</small>
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              <small>Enabled: <span style={{color: device.enabled ? 'green' : 'red'}}>{device.enabled ? 'Yes' : 'No'}</span></small>
            </Typography>
          </div>
          <Typography variant="body2" color="textSecondary" component="p">
            <small>Last Seen: {device.lastSeen ? moment(device.lastSeen).calendar() : Never}</small>
          </Typography>
          {device.notes && (
            <Typography variant="body2" color="textSecondary" component="p">
              <small>Notes: {device.notes}</small>
            </Typography>
          )}
        </CardContent>
      </Card>
    </Tooltip>
  );
};