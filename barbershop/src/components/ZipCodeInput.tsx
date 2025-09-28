import {
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import * as React from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useLocation } from "@/providers/Locationprovider";
import { getLocationByCoordinates } from "@/utils/location";

export default function ZipCodeInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void | Promise<void>;
  error: string | null;
}) {
  const [loading, setLoading] = React.useState(false);
  const { setLatitude, setLongitude, setZipCode } = useLocation();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(event.target.value);
    onChange(event.target.value);
  };

  const handleLocateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if ("geolocation" in navigator) {
      setLoading(true);
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (position.coords.latitude && position.coords.longitude) {
              setLatitude(position.coords.latitude);
              setLongitude(position.coords.longitude);
              getLocationByCoordinates(position.coords.latitude, position.coords.longitude).then((data) => {
                const results = data.results;
                if (results && results.length > 0) {
                  const addressComponents = results[0].address_components;
                  const zipCodeComponent = addressComponents.find((component: any) =>
                    component.types.includes("postal_code")
                  );
                  setZipCode(zipCodeComponent ? zipCodeComponent.long_name.replace(/\D/g, "") : undefined);
                  onChange(zipCodeComponent ? zipCodeComponent.long_name.replace(/\D/g, "") : "");
                }
              });
            }
          },
          (err) => {
            console.error(err.message);
          }
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <FormControl error={!!error} fullWidth>
      <TextField
        label="ZIP Code"
        onChange={handleChange}
        value={value || ""}
        slotProps={{
          input: {
            id: "zip-code-input",
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleLocateClick} edge="end" loading={loading}>
                  <LocationOnIcon />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <FormHelperText>{error ?? " "}</FormHelperText>
    </FormControl>
  );
}
