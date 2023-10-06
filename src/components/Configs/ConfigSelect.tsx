import {
  Autocomplete,
  TextField,
} from '@mui/material';

import { Config } from '../../types';

interface ConfigSelectProps {
  configs: Config[];
  selectedConfig: string | null;
  onConfigChange: (configName: string | null) => void;
};

export const ConfigSelect = (props: ConfigSelectProps) => {
  const { configs, selectedConfig, onConfigChange } = props;

  return (
    <Autocomplete
      value={selectedConfig}
      fullWidth
      onChange={(event: any, newValue: string | null) => onConfigChange(newValue)}
      options={configs.map((config) => config.name)}
      renderInput={(params: any) => (
        <TextField {...params} label="Select Config" variant="outlined" fullWidth />
      )}
      style={{ marginBottom: 16 }}
    />
  );
};