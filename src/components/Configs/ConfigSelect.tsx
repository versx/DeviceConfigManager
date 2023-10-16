import {
  Autocomplete,
  TextField,
} from '@mui/material';

import { Config } from '../../types';

interface ConfigSelectProps {
  configs: Config[];
  selectedConfig: string | null;
  placeholder?: string;
  onConfigChange: (configName: string | null) => void;
};

export const ConfigSelect = (props: ConfigSelectProps) => {
  const {
    configs, selectedConfig, placeholder = 'Select Config',
    onConfigChange,
  } = props;

  return (
    <Autocomplete
      value={selectedConfig}
      fullWidth
      onChange={(event: any, newValue: string | null) => onConfigChange(newValue)}
      options={configs.map((config: Config) => config.name)}
      renderInput={(params: any) => (
        <TextField
          {...params}
          label={placeholder}
          variant="outlined"
          fullWidth
        />
      )}
      style={{
        marginBottom: 8,
      }}
    />
  );
};