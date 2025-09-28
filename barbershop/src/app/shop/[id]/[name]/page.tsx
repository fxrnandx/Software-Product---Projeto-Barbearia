import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Item } from "@/components/Item";
import { Avatar, Rating, Typography } from "@mui/material";
import Divider from "@mui/material/Divider";
import BasicTabs from "@/components/PageTabs";
import ServiceTab from "@/components/ServiceTab";
import { ScheduleProvider } from "@/providers/ScheduleProvider";
import WorkersTabs from "@/components/WorkersTabs";
import { daysOfWeek, getFullShopById } from "@/utils/shops";
import { getShopRatings, getShopRatingsCount } from "@/utils/ratings";
import RatingTab from "@/components/RatingTab";

export const limit = 8;

interface PageProps {
  params: {
    id: Promise<string>;
    name: Promise<string>;
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const shop = await getFullShopById(await id);
  const ratings = await getShopRatings(parseInt(await id), 0, limit);
  const ratingsCount = await getShopRatingsCount(parseInt(await id));
  const barberShop = shop;
  const tabs = [
    {
      title: "Serviços",
      Component: <ServiceTab services={barberShop.services} />,
    },
    {
      title: "Avaliações",
      Component: <RatingTab shopId={parseInt(await id)} ratings={ratings} pages={Math.ceil(ratingsCount / limit)} />,
    }
  ];
  return (
    <Box my={2}>
      <Grid container spacing={2} justifyContent="center">
        <ScheduleProvider shopId={parseInt(await id)}>
          <Grid size={12} sx={{ maxWidth: 720 }}>
            <WorkersTabs workers={barberShop.employees} />
            <Divider />
            <BasicTabs marginTop={2} tabs={tabs} />
          </Grid>
        </ScheduleProvider>
        <Grid sx={{ minWidth: 350 }}>
          <Item>
            <Grid container marginBottom={2} spacing={2}>
              <Grid>
                <Avatar
                  variant="circular"
                  src={`${barberShop.shop.logo}`}
                  alt={barberShop.shop.name}
                  sx={{ width: 60, height: 60 }}
                />
              </Grid>
              <Grid>
                <Typography
                  variant="h6"
                  component="div"
                  color="text.primary"
                  fontWeight={600}
                >
                  {barberShop.shop.name}
                </Typography>
                { ratingsCount > 0 ? <Rating
                  name="read-only"
                  value={(barberShop.shop.rating || 0) / 2}
                  precision={0.5}
                  readOnly
                  size="small"
                /> : <Typography variant="body2" color="text.secondary">Sem Avaliações</Typography>}
              </Grid>
            </Grid>
            <Typography
              variant="body1"
              gutterBottom
              component="div"
              color="text.primary"
              fontWeight={600}
            >
              Localização:
            </Typography>
            <Typography variant="body2" gutterBottom padding={1}>
              {barberShop.shop.street}, {barberShop.shop.number}
              <br />
              {barberShop.shop.city} - {barberShop.shop.zipCode}
            </Typography>
            <Divider />
            <Typography
              variant="body1"
              gutterBottom
              component="div"
              color="text.primary"
              fontWeight={600}
              marginTop={2}
            >
              Horário de Funcionamento:
            </Typography>
            {
              daysOfWeek.map((day) => {
                const workingDay = barberShop.shop.workingDays.find(d => d === day.value);
                if (!workingDay) {
                  return;
                };
                return (     
                  <Grid container key={day.value} padding={1} spacing={2}>
                    <Grid size={8}>
                      <Typography variant="body2" color="text.primary">
                        {day.label}:
                      </Typography>
                    </Grid>
                    <Grid size={4}>
                      <Typography variant="body2" color="text.primary">
                        {`${barberShop.shop.openAt}`.substring(0, 5)} - {`${barberShop.shop.closeAt}`.substring(0, 5)}
                      </Typography>
                    </Grid>
                  </Grid>
                );
              })
            }
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
}
