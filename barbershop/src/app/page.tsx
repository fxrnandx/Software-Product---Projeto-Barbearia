"use server";
import { getShops } from "@/utils/shops";
import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export default async function HomePage() {
  const shops = await getShops();
  return (
    <Grid container spacing={2} columns={2} padding={2} justifyContent="stretch" alignContent="stretch">
      {shops.map((shop) => (
        <Grid key={shop.id} size="auto" flex={"auto"} >
          <Card sx={{minWidth: 200}} >
            <CardActionArea sx={{ display: "flex", padding: 1, gap: 2, alignItems: "start" }} LinkComponent={Link} href={`/shop/${shop.id}/${shop.name}`}>
            <CardMedia
              title={shop.name}
              sx={{ width: 80, height: 80, position: "relative" }}
            >
              <Image
                fill
                src={shop.logo || "/vercel.svg"}
                alt={shop.name}
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </CardMedia>
            <CardContent sx={{ flex: "1 0 auto", padding: 0 }}>
              <Typography variant="body1" maxWidth={200} noWrap >{shop.name}</Typography>
            </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
