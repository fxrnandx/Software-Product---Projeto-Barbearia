import {
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";
import * as React from "react";
import { IMaskInput } from "react-imask";

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const TextMaskCustom = React.forwardRef<HTMLInputElement, CustomProps>(
  function TextMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="00.000.000/0000-00"
        definitions={{
          "#": /[1-9]/,
        }}
        inputRef={ref}
        onAccept={(value: any) =>
          onChange({ target: { name: props.name, value } })
        }
        overwrite
      />
    );
  }
);

export default function CnpjInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void | Promise<void>;
  error: string | null;
}) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl error={!!error} fullWidth>
      <TextField
        onChange={handleChange}
        label="CNPJ"
        value={value}
        slotProps={{
          input: {
            inputComponent: TextMaskCustom as any,
          },
        }}
      />
      <FormHelperText>{error ?? " "}</FormHelperText>
    </FormControl>
  );
}
