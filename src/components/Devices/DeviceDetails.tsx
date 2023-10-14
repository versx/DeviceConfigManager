import {
  Card,
  CardContent,
  Divider,
  Typography,
} from '@mui/material';
import moment from 'moment';

import {
  DeviceOnlineIcon, DeviceOfflineIcon,
  Never, NotAssigned, UnknownModel,
} from '../../consts';
import { isDeviceOnline } from '../../modules';
import { Device } from '../../types';

interface DeviceDetailsProps {
  device: Device | null;
};

export const DeviceDetails = (props: DeviceDetailsProps) => {
  const { device } = props;
  if (!device) return null;

  const isOnline = isDeviceOnline(device.lastSeen);

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <img
            src={isOnline ? DeviceOnlineIcon : DeviceOfflineIcon}
            alt=""
            style={{
              width: 64,
              height: 64,
              //marginRight: 8,
            }}
          />
          &nbsp;Device Details
        </Typography>
        <Divider />
        <Typography variant="body1">
          <strong>UUID:</strong> {device.uuid}
        </Typography>
        <Typography variant="body1">
          <strong>Config:</strong> {device.config || NotAssigned}
        </Typography>
        <Typography variant="body1">
          <strong>Model:</strong> {device.model || UnknownModel}
        </Typography>
        <Typography variant="body1">
          <strong>iOS Version:</strong> {device.iosVersion || '--'}
        </Typography>
        <Typography variant="body1">
          <strong>IPA Version:</strong> {device.ipaVersion || '--'}
        </Typography>
        <Typography variant="body1">
          <strong>Last Seen:</strong> {device.lastSeen ? moment(device.lastSeen).calendar() : Never}
        </Typography>
        <Typography variant="body1">
          <strong>Enabled:</strong> {device.enabled ? 'Yes' : 'No'}
        </Typography>
        <Typography variant="body1">
          <strong>Notes:</strong> {device.notes || '--'}
        </Typography>
      </CardContent>
    </Card>
  );
};