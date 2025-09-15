'use client';
import {
  Avatar,
  Backdrop,
  Box,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Pagination,
  Rating,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React from "react";
import { getShopRatings, rating } from "@/utils/ratings";
import { limit } from "@/app/shop/[id]/[name]/page";
import Image from "next/image";

export default function RatingsList({
  initialRatings,
  shopId,
  pages = 1
}: {
  initialRatings: rating[];
  shopId: number;
  pages?: number;
}) {
  const [ratings, setRatings] = React.useState<rating[]>(initialRatings);
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [image, setImage] = React.useState<string | null>(null);
  const handleImageClick = (
      event: React.SyntheticEvent<Element, Event>,
      value: any) => {
    const [index, id] = (value as string).split('|').map(v => parseInt(v));
    const rating = ratings.find(r => r.id === id);
    if (!rating || !rating.images) return;
    const img = rating.images[index];
    if (!img) return;
    setImage(img);
    setBackdropOpen(true);
  }
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  React.useEffect(() => {
    const fetchRatings = async () => {
      const res = await getShopRatings(shopId, (page - 1) * limit, limit);
      setRatings(res);
    };
    fetchRatings();
  }, [page]);
  return (
    <Box mb={4} display="flex" flexDirection="column" alignItems="center">
      <Backdrop
        sx={{ zIndex: 9999 }}
        open={backdropOpen}
        onClick={() => setBackdropOpen(false)}
      >
        { image && <Image src={image || ""} alt="Uploaded" width={500} height={500} />}
      </Backdrop>
      <List sx={{ width: "100%", bgcolor: "background.paper" }}>
        {ratings.map((rating) => (
          <React.Fragment key={rating.id}>
            <ListItem sx={{ justifyContent: "space-between", width: "100%" }}>
              <ListItemAvatar>
                <Avatar alt={rating.userName || "User"} src={rating.image} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between" gap={1}>
                    <Typography variant="body1">
                      {rating.userName || "User"}
                    </Typography>
                    <Rating size="small" value={rating.value / 2} readOnly />
                  </Box>
                }
                secondary={
                  <>
                    {rating.images && (
                      <Tabs
                        onChange={handleImageClick}
                        value={false}
                        variant="scrollable"
                        scrollButtons="auto"
                      >
                        {(rating.images || []).map((img, index) => (
                          <Tab
                            key={index}
                            value={`${index}|${rating.id}`}
                            icon={
                              <Avatar
                                variant="rounded"
                                alt={`Rating image ${index + 1}`}
                                src={img}
                              />
                            }
                          />
                        ))}
                      </Tabs>
                    )}
                    <Typography variant="body2">{rating.comment}</Typography>
                  </>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
      <Pagination count={pages} color="primary" onChange={handleChange} page={page} />
    </Box>
  );
}
