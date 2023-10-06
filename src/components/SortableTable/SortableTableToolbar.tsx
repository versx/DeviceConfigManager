import {
  IconButton,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Delete as DeleteIcon } from '@mui/icons-material';

import { TableToolbarProps } from '..';

export const SortableTableToolbar = (props: TableToolbarProps) => {
  const { numSelected, search, onDelete, onSearch } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 && (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip
          arrow
          title={`Delete ${numSelected.toLocaleString()} selected`}
        >
          <IconButton onClick={onDelete}>
            <DeleteIcon color="error" />
          </IconButton>
        </Tooltip>
      ) : (
        <TextField
          color="primary"
          variant="outlined"
          placeholder="Search..."
          value={search}
          size="small"
          type="search"
          style={{
            position: 'absolute',
            right: 0,
            //marginBottom: '30px',
          }}
          onChange={(e) => onSearch(e.target.value)}
        />
      )}
    </Toolbar>
  );
};