import {
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Rating,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React from "react";
import { rating } from "@/utils/ratings";
import RatingForm from "./RatingForm";
import RatingsList from "./RatingsList";

export default function RatingTab({
  shopId,
  ratings,
  pages = 1
}: {
  shopId: number;
  ratings: rating[];
  pages?: number;
}) {
  return (
    <React.Fragment>
      <RatingForm shopId={shopId} />
      <Divider sx={{ marginY: 2 }} />
      <RatingsList initialRatings={ratings} shopId={shopId} pages={pages} />
    </React.Fragment>
  );
}
