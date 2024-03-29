import React, { ChangeEvent, MouseEvent, useMemo, useState } from 'react';
import {
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import {
  DeviceActionsButtonGroup,
  DeviceTableHeadCells,
  HeadCell,
  Order, 
  SortableTableHead,
  SortableTableToolbar,
  StyledTableCell,
  StyledTableRow,
} from '..';
import { getComparator, stableSort } from '../../modules';
import { DeviceService } from '../../services';
import { getUserToken } from '../../stores';
import { Device } from '../../types';

interface DeviceTableProps {
  devices: Device[];
  onEdit: (device: Device) => void;
  onDelete: (uuid: string) => void;
  onViewLogs: (uuid: string) => void;
  onReload: () => void;
};

export const DeviceTable = (props: DeviceTableProps) => {
  const {
    devices,
    onEdit, onDelete,
    onViewLogs, onReload,
  } = props;
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Device>('uuid');
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const currentUser = getUserToken();
  const { enqueueSnackbar } = useSnackbar();

  const handleDeleteDevices = async () => {
    if (selected.length === 0) {
      return;
    }

    const result = window.confirm(`Are you sure you want to delete ${selected.length.toLocaleString()} devices?`);
    if (!result) {
      return;
    }

    let error = false;
    for (const uuid of selected) {
      const response = await DeviceService.deleteDevice(uuid);
      if (response?.status !== 'ok') {
        enqueueSnackbar(`Error occurred deleting device with error ${response.error}`, { variant: 'error' });
        error = true;
      }
    }

    setSelected([]);
    onReload();

    if (!error) {
      enqueueSnackbar(`Device(s) deleted successfully!`, { variant: 'success' });
    }
  };

  const handleRequestSort = (property: keyof Device) => (event: MouseEvent<unknown>) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (checked) {
      const newSelected = devices.map(d => d.uuid);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleRowClick = (event: MouseEvent<unknown>, uuid: string) => {
    const selectedIndex = selected.indexOf(uuid);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, uuid);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (uuid: string) => selected.indexOf(uuid) !== -1;

  // Avoid a layout jump when reaching the last page with empty devices.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - devices.length) : 0;

  const visibleRows = useMemo(() =>
    stableSort(devices, getComparator<Device, keyof Device>(order, orderBy)).slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    ),
  [order, orderBy, page, devices, rowsPerPage]);

  return (
    <>
      <SortableTableToolbar
        numSelected={selected.length}
        search={search}
        onDelete={handleDeleteDevices}
        onSearch={setSearch}
      />
      <Paper sx={{ width: '100%', mb: 2, border: '1px solid grey', borderRadius: '8px' }}>
        <TableContainer>
          <Table
            stickyHeader
            //sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
          >
            <SortableTableHead
              headCells={DeviceTableHeadCells}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={devices.length}
              isAdmin={currentUser?.isRoot}
            />
            <TableBody>
              {visibleRows.map((row: Device, index: number) => {
                const isItemSelected = isSelected(row.uuid);
                const labelId = `enhanced-table-checkbox-${index}`;
                const keyword = search.toLowerCase();
                if (keyword !== '' && !(
                  row.uuid.toLowerCase().includes(keyword) ||
                  row.config?.toLowerCase().includes(keyword) ||
                  row.model?.toLowerCase().includes(keyword) ||
                  row.ipAddr?.toLowerCase().includes(keyword) ||
                  row.iosVersion?.toLowerCase().includes(keyword) ||
                  row.ipaVersion?.toLowerCase().includes(keyword) ||
                  row.notes?.toLowerCase().includes(keyword))
                ) {
                  return '';
                }

                return (
                  <StyledTableRow
                    hover
                    key={row.uuid}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                    onClick={(event: any) => handleRowClick(event, row.uuid)}
                  >
                    <StyledTableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          'aria-labelledby': labelId,
                        }}
                      />
                    </StyledTableCell>
                    {DeviceTableHeadCells.map((headCell: HeadCell<Device>, index: number) => (headCell.isAdmin || !headCell.isAdmin) && (
                      <StyledTableCell
                        key={index}
                        component={index === 0 ? 'th' : undefined}
                        scope={index === 0 ? 'row' : undefined}
                        align={headCell.align ?? 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sx={{
                          display: index > 0 && headCell.hidden ? 'none' : 'table-cell',
                          ...headCell.style,
                        }}
                      >
                        {headCell.format
                          ? headCell.format(row, row[headCell.id])
                          : String(row[headCell.id])
                        }
                      </StyledTableCell>
                    ))}
                    <StyledTableCell align="left" sx={{ display: { xs: 'table-cell' } }}>
                      <DeviceActionsButtonGroup
                        model={row}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onViewLogs={(e) => {
                          e.stopPropagation();
                          onViewLogs(row.uuid);
                        }}
                      />
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })}
              {emptyRows > 0 && (
                <StyledTableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <StyledTableCell colSpan={6} />
                </StyledTableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100, { value: -1, label: 'All' }]}
          component="div"
          count={devices.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  );
};