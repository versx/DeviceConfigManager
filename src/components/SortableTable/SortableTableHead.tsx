import {
  Box,
  Checkbox,
  TableHead,
  TableSortLabel,
} from '@mui/material';
import {
  ArrowDownward as ArrowDownwardIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import moment from 'moment';

import {
  HeadCell,
  StyledTableCell,
  StyledTableRow,
  TableProps,
} from '..';
import { DeviceOnlineIcon, DeviceOfflineIcon, Never } from '../../consts';
import { getDeviceRestartCount, isDeviceOnline } from '../../modules';
import { Config, Device, User } from '../../types';

export const ConfigTableHeadCells: readonly HeadCell<Config>[] = [
  {
    id: 'name',
    disablePadding: true,
    align: 'left',
    label: 'Slug',
  },
  {
    id: 'backendUrl',
    disablePadding: false,
    align: 'left',
    label: 'Backend Url',
    style: { display: { xs: 'none', sm: 'table-cell' } },
  },
  {
    id: 'bearerToken',
    disablePadding: false,
    align: 'right',
    label: 'Bearer Token',
  },
  {
    id: 'enabled',
    disablePadding: false,
    align: 'right',
    label: 'Enabled',
    style: { display: { xs: 'none', sm: 'none', md: 'table-cell' } },
  },
  {
    id: 'createdAt',
    disablePadding: false,
    align: 'right',
    label: 'Created',
    style: { display: { xs: 'none', sm: 'none', md: 'none', lg: 'table-cell' } },
  },
];

export const DeviceTableHeadCells: readonly HeadCell<Device>[] = [
  {
    id: 'status' as 'uuid',
    disablePadding: true,
    align: 'left',
    label: 'Status',
    style: { display: { xs: 'table-cell' } },
    format: (row: Device, value: any) => {
      const isOnline = isDeviceOnline(row.lastSeen);
      return (
        /* eslint-disable-next-line jsx-a11y/img-redundant-alt */
        <img
          src={isOnline ? DeviceOnlineIcon : DeviceOfflineIcon}
          alt="device status image"
          style={{
            width: 64,
            height: 64,
          }}
        />
      );
    },
  },
  {
    id: 'uuid',
    disablePadding: false,
    align: 'left',
    label: 'UUID',
    style: { display: { xs: 'table-cell' } },
  },
  {
    id: 'config',
    disablePadding: false,
    align: 'left',
    label: 'Config',
    style: { display: { xs: 'table-cell' } },
    format: (row: Device, value: any) => value ?? '--',
  },
  {
    id: 'model',
    disablePadding: false,
    align: 'left',
    label: 'Model',
    style: { display: { xs: 'none', sm: 'table-cell' } },
    format: (row: Device, value: any) => value ?? '--',
  },
  {
    id: 'iosVersion',
    disablePadding: false,
    align: 'left',
    label: 'iOS Version',
    style: { display: { xs: 'none', sm: 'none' } }, //, md: 'table-cell' } },
    hidden: true,
    format: (row: Device, value: any) => value ?? '--',
  },
  {
    id: 'ipaVersion',
    disablePadding: false,
    align: 'left',
    label: 'IPA Version',
    style: { display: { xs: 'none', sm: 'none' } }, //, md: 'table-cell' } },
    hidden: true,
    format: (row: Device, value: any) => value ?? '--',
  },
  {
    id: 'ipAddr',
    disablePadding: false,
    align: 'left',
    label: 'IP Address',
    style: { display: { xs: 'none', sm: 'none', md: 'table-cell' } },
    format: (row: Device, value: any) => value ?? '--',
  },
  {
    id: 'restarts' as 'uuid',
    disablePadding: false,
    align: 'left',
    label: 'Restarts',
    style: { display: { xs: 'none', sm: 'none', md: 'table-cell' } },
    format: (row: Device, value: any) => getDeviceRestartCount(row).toLocaleString(),
  },
  {
    id: 'lastSeen',
    disablePadding: false,
    align: 'left',
    label: 'Last Seen',
    style: { display: { xs: 'none', sm: 'none', md: 'none', lg: 'table-cell' } },
    format: (row: Device, value: any) => value ? moment(value).calendar() : Never,
  },
  {
    id: 'enabled',
    disablePadding: false,
    align: 'left',
    label: 'Enabled',
    style: { display: { xs: 'none', sm: 'table-cell' } },
    maxWidth: 75,
    //format: (row: Device, value: any) => value ? 'Yes' : 'No',
    format: (row: Device, value: any) => value ? <CheckIcon color="success" /> : <CloseIcon color="error" />,
  },
  {
    id: 'createdAt',
    disablePadding: false,
    align: 'left',
    label: 'Created',
    style: { display: { xs: 'none', sm: 'none', md: 'none', lg: 'table-cell' } },
    format: (row: Device, value: any) => moment(value).calendar() ?? '--',
  },
];

export const OfflineDeviceTableHeadCells: readonly HeadCell<Device>[] = [
  {
    id: 'status' as 'uuid',
    disablePadding: true,
    align: 'right',
    label: 'Status',
    minWidth: 80,
    maxWidth: 80,
    style: { display: { xs: 'table-cell' } },
    format: (row: Device, value: any) => {
      const isOnline = isDeviceOnline(row.lastSeen);
      return (
        /* eslint-disable-next-line jsx-a11y/img-redundant-alt */
        <img
          src={isOnline ? DeviceOnlineIcon : DeviceOfflineIcon}
          alt="device status image"
          style={{
            width: 64,
            height: 64,
          }}
        />
      );
    },
  },
  {
    id: 'uuid',
    disablePadding: false,
    align: 'left',
    label: 'UUID',
    minWidth: 200,
    maxWidth: 200,
    style: { display: { xs: 'table-cell' } },
  },
  {
    id: 'config',
    disablePadding: false,
    align: 'left',
    label: 'Config',
    //minWidth: 150,
    //maxWidth: 150,
    style: { display: { xs: 'table-cell' } },
    format: (row: Device, value: any) => value ?? '--',
  },
  {
    id: 'lastSeen',
    disablePadding: false,
    align: 'left',
    label: 'Last Seen',
    //minWidth: 100,
    //maxWidth: 100,
    style: { display: { xs: 'none', sm: 'none', md: 'none', lg: 'table-cell' } },
    format: (row: Device, value: any) => value ? moment(value).calendar() : Never,
  },
];

export const UserTableHeadCells: readonly HeadCell<User>[] = [
  {
    id: 'id',
    disablePadding: true,
    align: 'left',
    label: 'ID',
  },
  {
    id: 'username',
    disablePadding: false,
    align: 'left',
    label: 'Username',
  },
  {
    id: 'enabled',
    disablePadding: false,
    align: 'right',
    label: 'Enabled',
    style: { display: { xs: 'none', sm: 'table-cell' } },
  },
  {
    id: 'root',
    disablePadding: false,
    align: 'right',
    label: 'Is Root',
    style: { display: { xs: 'none', sm: 'none', md: 'table-cell' } },
  },
  {
    id: 'createdAt',
    disablePadding: false,
    align: 'right',
    label: 'Created',
    style: { display: { xs: 'none', sm: 'none', md: 'table-cell' } },
  },
];

export const SortableTableHead = <T extends unknown>(props: TableProps<T>) => {
  const {
    headCells, isAdmin, disableCheckbox,
    order, orderBy, numSelected, rowCount,
    onRequestSort, onSelectAllClick,
  } = props;

  return (
    <TableHead>
      <StyledTableRow>
        {!disableCheckbox && (
          <StyledTableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                'aria-label': 'select all',
              }}
              style={{color: 'white'}}
            />
          </StyledTableCell>
        )}
        {headCells.map((headCell: HeadCell<T>, index: number) => ((isAdmin && (headCell.isAdmin || !headCell.isAdmin)) || (!isAdmin && !headCell.isAdmin)) && (
          <StyledTableCell
            key={index}
            align={headCell.align ?? 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              minWidth: headCell.minWidth,
              maxWidth: headCell.maxWidth,
              width: headCell.minWidth,
              color: 'white',
              whiteSpace: 'nowrap',
              display: headCell.hidden ? 'none' : 'table-cell',
              ...headCell.style,
            }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              style={{color: 'white'}}
              IconComponent={ArrowDownwardIcon}
              onClick={onRequestSort(headCell.id as keyof T)}
            >
              <strong>{headCell.label}</strong>
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </StyledTableCell>
        ))}
        <StyledTableCell
          align="left"
          sx={{
            display: { xs: 'table-cell' },
            minWidth: 50,
            maxWidth: 50,
            width: 50,
          }}
        >
          <strong>Actions</strong>
        </StyledTableCell>
      </StyledTableRow>
    </TableHead>
  );
};