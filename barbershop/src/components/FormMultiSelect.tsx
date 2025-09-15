import { daysOfWeek } from "@/utils/shops";
import { Box, Chip, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";

export default function WorkingDaysSelect({
  value,
  onChange,
  error,
}: {
  value: string[];
  onChange: (value: string[]) => void | Promise<void>;
  error: string | null;
}) {
  const labelId = 'working-days-label';
  const label = 'Working Days';


  const handleChange = (event: SelectChangeEvent<string | string[]>) => {
    const updatedTags = event.target.value;
    onChange(
      (typeof updatedTags === 'string' ? [updatedTags] : updatedTags) as string[],
    );
  };

  return (
    <FormControl error={!!error} fullWidth>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        multiple
        value={value ?? []}
        onChange={handleChange}
        labelId={labelId}
        name="WorkingDaysSelect"
        label={label}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((selectedValue) => (
              <Chip key={selectedValue} label={selectedValue} />
            ))}
          </Box>
        )}
        fullWidth
      >
        {daysOfWeek.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{error ?? ' '}</FormHelperText>
    </FormControl>
  );
}