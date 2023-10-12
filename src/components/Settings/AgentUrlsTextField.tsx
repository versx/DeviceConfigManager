import React, { useState } from 'react';
import {
  Button,
  IconButton,
  Paper,
  TextField,
} from '@mui/material';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
} from '@mui/icons-material';

interface AgentUrlsTextFieldProps {
  initialUrls?: string[];
  onSave: (url: string[]) => void;
};

export const AgentUrlsTextField = (props: AgentUrlsTextFieldProps) => {
  const { initialUrls = [], onSave } = props;
  const [urls, setUrls] = useState(initialUrls);

  const handleSave = () => onSave(urls);

  const addUrlField = () => setUrls([...urls, '']);

  const removeUrlField = (index: number) => {
    const newUrls = [...urls];
    newUrls.splice(index, 1);
    setUrls(newUrls);
  };

  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      {urls.map((url, index) => (
        <div key={index} style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
          <TextField 
            fullWidth
            label={`URL ${index + 1}`}
            value={url}
            onChange={(e) => {
              const newUrls = [...urls];
              newUrls[index] = e.target.value;
              setUrls(newUrls);
            }}
          />
          <IconButton
            size="small"
            onClick={() => removeUrlField(index)}
          >
            <RemoveCircleOutlineIcon />
          </IconButton>
        </div>
      ))}
      <Button
        size="small"
        startIcon={<AddCircleOutlineIcon />}
        onClick={addUrlField}
      >
        Add URL
      </Button>
      <div style={{ marginTop: '20px' }}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </Paper>
  );
};