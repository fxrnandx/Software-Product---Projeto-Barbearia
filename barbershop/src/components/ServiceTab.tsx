import { Box, Typography, BoxProps, Avatar, Grid } from "@mui/material";
import { AddService } from "./AddServiceBtn";
import { Service } from "@/utils/services";
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface ServiceTabProps extends BoxProps {
  services: Service[];
}

export default async function ServiceTab(props: ServiceTabProps) {
  const { services, ...other } = props;

  return (
    <Box {...other}>
      {services.map((service, index) => (
        <Grid container key={index} alignItems="center" marginBottom={2}>
          <Grid minWidth={50} marginRight={2}>
            <Avatar
              variant="circular"
              src={
                service.image
                  ? service.image
                  : "https://picsum.photos/400/300"
              }
              alt={service.name}
              sx={{ width: 50, height: 50 }}
            />
          </Grid>
          <Grid>
            <Typography
              variant="body2"
              component="div"
              color="text.primary"
              fontWeight={600}
            >
              {service.name}
            </Typography>
            <Typography variant="body2" color="success" fontWeight={600}>
              R$ {service.price.toFixed(2)}
            </Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              {service.description}
            </Typography>
          </Grid>
          <Grid textAlign={"right"} marginLeft="auto">
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              <AccessTimeIcon fontSize="small" /> {service.duration} min
            </Typography>
            <AddService {...service} />
          </Grid>
        </Grid>
      ))}
    </Box>
  );
}
