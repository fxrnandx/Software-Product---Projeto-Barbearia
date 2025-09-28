"use client";
import { getNearbyShops, getShops, Shop } from "@/utils/shops";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Skeleton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function HomePage() {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [shops, setShops] = React.useState<Shop[]>([]);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (selectedTab === 1) {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
              const { latitude, longitude } = position.coords;
              // Fetch nearby shops using the coordinates
              const nearbyShops = await getNearbyShops(latitude, longitude);
              setShops(nearbyShops);
            });
          }
        } else {
          const allShops = await getShops();
          setShops(allShops);
        }
      } catch (error) {
        console.error("Error fetching shops:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedTab]);
  return (
    <>
      <Tabs
        value={selectedTab}
        onChange={handleChange}
        aria-label="basic tabs example"
        centered
      >
        <Tab label="Lojas Populares" value={0} />
        <Tab label="Lojas Próximas" value={1} />
      </Tabs>
      <Grid
        container
        spacing={2}
        columns={2}
        padding={2}
        justifyContent="stretch"
        alignContent="stretch"
      >
        {(loading ? Array.from(new Array(3)) : shops).map((shop, index) => (
          <Grid key={index} size="auto" flex={"auto"}>
            <Card sx={{ minWidth: 200 }}>
              <CardActionArea
                sx={{
                  display: "flex",
                  padding: 1,
                  gap: 2,
                  alignItems: "start",
                }}
                LinkComponent={Link}
                href={loading ? "#" : `/shop/${shop.id}/${shop.name}`}
              >
                <CardMedia
                  title={loading ? "Loading..." : shop.name}
                  sx={{ width: 80, height: 80, position: "relative" }}
                >
                  {loading ? (
                    <Skeleton variant="rectangular" width={80} height={80} />
                  ) : (
                    <Image
                      fill
                      src={shop.logo || "/vercel.svg"}
                      alt={shop.name}
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />)}
                </CardMedia>
                <CardContent sx={{ flex: "1 0 auto", padding: 0 }}>
                  <Typography variant="body1" maxWidth={200} noWrap>
                    {loading ? <Skeleton /> : shop.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {loading ? <Skeleton /> : shop.distance && (
                      <>
                        <LocationOnIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        {shop.distance.toFixed(1)} km
                      </>
                    )}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
