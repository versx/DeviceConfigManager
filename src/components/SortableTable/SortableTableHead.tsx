import {
  Box,
  Checkbox,
  TableHead,
  TableSortLabel,
} from '@mui/material';
import { ArrowDownward as ArrowDownwardIcon } from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';

import {
  HeadCell,
  StyledTableCell,
  StyledTableRow,
  TableProps,
} from '..';
import { Config, User } from '../../types';

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
    headCells, isAdmin,
    order, orderBy, numSelected, rowCount,
    onRequestSort, onSelectAllClick,
  } = props;

  return (
    <TableHead>
      <StyledTableRow>
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
        {headCells.map((headCell: HeadCell<T>, index: number) => ((isAdmin && (headCell.isAdmin || !headCell.isAdmin)) || (!isAdmin && !headCell.isAdmin)) && (
          <StyledTableCell
            key={index}
            align={headCell.align ?? 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ minWidth: headCell.minWidth, color: 'white', ...headCell.style, whiteSpace: 'nowrap' }}
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
        <StyledTableCell align="right">
          <strong>Actions</strong>
        </StyledTableCell>
      </StyledTableRow>
    </TableHead>
  );
};