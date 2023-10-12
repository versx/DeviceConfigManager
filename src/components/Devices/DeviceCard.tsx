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
import { DeviceOnlineIcon, DeviceOfflineIcon } from '../../consts';
import { isDeviceOnline } from '../../modules';
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

  const handleViewDevice = () => {
    // Open device manager page
    window.location.href = `/devices/${device.uuid}`;
  };

  return (
    <Tooltip
      title={`Click or tap to view device ${device.uuid}`}
      placement="left-start"
      arrow
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
          subheader={device.model ?? 'Unknown Model'}
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
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
            <Typography variant="body2" color="textSecondary" component="p">
              Config: {device.config ?? 'Not Assigned'}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              IP Address: {device.ipAddr ?? '--'}
            </Typography>
          </div>
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
            <Typography variant="body2" color="textSecondary" component="p">
              iOS Version: {device.iosVersion ?? '--'}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              IPA Version: {device.ipaVersion ?? '--'}
            </Typography>
          </div>
          <Typography variant="body2" color="textSecondary" component="p" style={{marginBottom: 8}}>
            Last Seen: {device.lastSeen ? moment(device.lastSeen).calendar() : 'Never'}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p" style={{marginBottom: 8}}>
            Enabled: <span style={{color: device.enabled ? 'green' : 'red'}}>{device.enabled ? 'Yes' : 'No'}</span>
          </Typography>
          {device.notes && (
            <Typography variant="body2" color="textSecondary" component="p">
              Notes: {device.notes}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Tooltip>
  );
};