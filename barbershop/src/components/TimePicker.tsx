import { FormControl, FormHelperText, InputLabel} from "@mui/material";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Dayjs } from "dayjs";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function HoursTimePicker({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void | Promise<void>;
  error: string | null;
}) {
  const handleChange = (newValue: Dayjs | null) => {
    onChange(newValue);
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormControl error={!!error} fullWidth>
        <TimePicker
          value={value}
          onChange={handleChange}
          ampm={false}
          label={label}
        />
        <FormHelperText>{error ?? ' '}</FormHelperText>
      </FormControl>
    </LocalizationProvider>
  );
}