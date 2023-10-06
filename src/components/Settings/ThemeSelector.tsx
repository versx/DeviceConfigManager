import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';

export const ThemeSelector = (props: any) => {
  const { theme, onThemeChange } = props;

  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel htmlFor="theme-selector">Select Theme</InputLabel>
      <Select
        labelId="theme-selector-label"
        id="theme-selector"
        value={theme}
        onChange={(e) => onThemeChange(e.target.value)}
        label="Select Theme"
      >
        <MenuItem value="system">System (default)</MenuItem>
        <MenuItem value="light">Light</MenuItem>
        <MenuItem value="dark">Dark</MenuItem>
      </Select>
    </FormControl>
  );
};