import React, { ChangeEvent, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Checkbox,
  Fab,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import moment from 'moment';
import { useSnackbar } from 'notistack';

import {
  Order, 
  SortableTableHead,
  SortableTableToolbar,
  StyledTableCell,
  StyledTableRow,
  UserActionsButtonGroup,
  UserTableHeadCells,
} from '.';
import { CreateUserDialog } from '../dialogs';
import { getComparator, stableSort } from '../modules';
import { UserService } from '../services';
import { getUserToken } from '../stores';
import { User } from '../types';

interface UserTableState {
  open: boolean;
  editMode: boolean;
  editModel: User | undefined;
};

export const UserTable = () => {
  const [rows, setRows] = useState<User[]>([]);
  const [state, setState] = useState<UserTableState>({
    open: false,
    editMode: false,
    editModel: undefined,
  });
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof User>('id');
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const { enqueueSnackbar } = useSnackbar();
  const currentUser = getUserToken();

  const handleReloadUsers = useCallback(() => {
    if (!currentUser?.root) {
      return;
    }
    UserService.getUsers().then((response: any) => {
      if (response.status !== 'ok') {
        enqueueSnackbar('Error occurred reloading user account.', { variant: 'error' });
        return;
      }
      setRows(response.users);
    });
  }, [currentUser?.root, enqueueSnackbar]);

  const handleOpen = () => setState({...state, open: true, editMode: false, editModel: undefined});
  const handleClose = () => setState({...state, open: false, editMode: false, editModel: undefined});

  const handleSubmit = () => {
    enqueueSnackbar(`User account ${state.editMode ? 'updated' : 'created'} successfully!`, { variant: 'success' });

    setState({
      ...state,
      open: false,
      editMode: false,
      editModel: undefined,
    });
    handleReloadUsers();
  };

  const handleEditUser = (user: User) => {
    setState({
      ...state,
      open: true,
      editMode: true,
      editModel: user,
    });
  };

  const handleDeleteUsers = async () => {
    if (selected.length === 0) {
      return;
    }

    const result = window.confirm(`Are you sure you want to delete ${selected.length.toLocaleString()} user accounts?`);
    if (!result) {
      return;
    }

    let error = false;
    for (const userId of selected) {
      const response = await UserService.deleteAccount(userId);
      if (response.status !== 'ok') {
        enqueueSnackbar('Error occurred deleting user account.', { variant: 'error' });
        error = true;
      }
    }

    setSelected([]);
    handleReloadUsers();

    if (!error) {
      enqueueSnackbar('User account deleted successfully!', { variant: 'success' });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const result = window.confirm(`Are you sure you want to delete user ${userId}?`);
    if (!result) {
      return;
    }

    const response = await UserService.deleteAccount(userId);
    if (response.status !== 'ok') {
      enqueueSnackbar('Error occurred deleting user.', { variant: 'error' });
      return;
    }

    enqueueSnackbar('User account deleted successfully!', { variant: 'success' });

    setSelected([]);
    handleReloadUsers();
  };

  const handleRequestSort = (property: keyof User) => (event: MouseEvent<unknown>) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map(u => u.id!);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleRowClick = (event: MouseEvent<unknown>, userId: number) => {
    const selectedIndex = selected.indexOf(userId);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, userId);
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

  const isSelected = (userId: number) => selected.indexOf(userId) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = useMemo(() =>
    stableSort(rows, getComparator<User, keyof User>(order, orderBy)).slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    ),
  [order, orderBy, page, rows, rowsPerPage]);

  useEffect(() => {
    if (!currentUser?.root) {
      return;
    }
    handleReloadUsers();
  }, [currentUser?.root, handleReloadUsers]);

  return (
    <>
      <SortableTableToolbar
        numSelected={selected.length}
        search={search}
        onDelete={handleDeleteUsers}
        onSearch={setSearch}
      />
      <Paper sx={{ width: '100%', mb: 2, border: '1px solid grey', borderRadius: '8px' }}>
        <Tooltip
          title="Create user account"
        >
          <Fab
            color="primary"
            aria-label="add"
            onClick={handleOpen}
            style={{
              margin: '0px',
              top: 'auto',
              right: '32px',
              bottom: '32px',
              left: 'auto',
              position: 'fixed',
            }}
          >
            <AddIcon />
          </Fab>
        </Tooltip>

        <TableContainer>
          <Table
            stickyHeader
            //sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
          >
            <SortableTableHead
              headCells={UserTableHeadCells}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
              isAdmin={true}
            />
            <TableBody>
              {visibleRows.map((row: User, index: number) => {
                const isItemSelected = isSelected(row.id!);
                const labelId = `enhanced-table-checkbox-${index}`;
                const keyword = search.toLowerCase();
                if (keyword !== '' && !(
                  row.id!.toString().toLowerCase().includes(keyword) ||
                  row.username?.toLowerCase().includes(keyword))
                ) {
                  return '';
                }

                return (
                  <StyledTableRow
                    hover
                    key={row.id}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                    onClick={(event: any) => handleRowClick(event, row.id!)}
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
                    <StyledTableCell
                      id={labelId}
                      component="th"
                      scope="row"
                      padding="none"
                    >
                      <strong>{row.id}</strong>
                    </StyledTableCell>
                    <StyledTableCell align="left">
                      {row.username}
                    </StyledTableCell>
                    <StyledTableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {row.enabled ? 'Yes' : 'No'}
                    </StyledTableCell>
                    <StyledTableCell align="right" sx={{ display: { xs: 'none', sm: 'none', md: 'table-cell' } }}>
                      {row.root ? 'Yes' : 'No'}
                    </StyledTableCell>
                    <StyledTableCell
                      align="right"
                      title={moment(row.createdAt).format('MMMM Do YYYY, h:mm:ss a')}
                      sx={{ display: { xs: 'none', sm: 'none', md: 'table-cell' } }}
                    >
                      {moment(row.createdAt).calendar()}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <UserActionsButtonGroup
                        model={row}
                        onEdit={handleEditUser}
                        onDelete={handleDeleteUser}
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
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <CreateUserDialog
        open={state.open}
        editMode={state.editMode}
        model={state.editModel}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </>
  );
};