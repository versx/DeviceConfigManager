import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

import { formatFileSize } from '../../modules';
import { LogArchive } from '../../types';

interface LogArchiveListProps {
  archives: LogArchive[];
  onDelete: (archive: LogArchive) => void;
};

export const LogArchiveList = (props: LogArchiveListProps) => {
  const { archives, onDelete } = props;
  return (
    <Container
      component={Paper}
      elevation={3}
      style={{paddingLeft: 0, paddingRight: 0}}
    >
      <Accordion>
        <AccordionSummary
          id="archives-list-header"
          expandIcon={<ExpandMoreIcon />}
          aria-controls="archives-list-content"
          style={{marginRight: 8, marginBottom: 0}}
        >
          <Typography variant="h6" style={{marginLeft: 16}}>Log Archives</Typography>
        </AccordionSummary>
        <hr style={{padding: 0, margin: 0 }} />
        <AccordionDetails style={{padding: 8}}>
          <List dense disablePadding>
            {archives?.length > 0 ? archives?.map((archive, index) => (
              <ListItem key={index} dense>
                <ListItemText
                  primary={archive.fileName}
                  secondary={
                    <Typography variant="body2" color="textSecondary">
                      Date: {new Date(archive.date)?.toLocaleDateString() ?? '--'}
                      &nbsp;
                      Size: {formatFileSize(archive.size, true, 2)}
                      &nbsp;
                      Compressed: {archive.compressed ? 'Yes' : 'No'}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onDelete(archive)}
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            )) : (
              <Typography align="center" variant="body2" color="textSecondary" style={{marginLeft: 16}}>
                No log archives available.
              </Typography>
            )}
          </List>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
};