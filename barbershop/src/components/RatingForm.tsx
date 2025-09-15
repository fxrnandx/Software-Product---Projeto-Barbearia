"use client";
import {
  Avatar,
  Backdrop,
  FormControl,
  IconButton,
  InputAdornment,
  Rating,
  Stack,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { SendRating } from "./actions";
import { useActionState } from "react";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import React from "react";
import imageCompression from "browser-image-compression";
import Image from "next/image";

const initialState = {};

export const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

export default function RatingForm({ shopId }: { shopId: number }) {
  const [images, setImages] = React.useState<string[]>([]);
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [state, formAction, pending] = useActionState(
    SendRating.bind(null, shopId, images),
    initialState
  );

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    value: any
  ) => {
    setSelectedImageIndex(value);
    setBackdropOpen(true);
  };

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files) {
      const newImages = await Promise.all(
        Array.from(files).map(
          async (file) =>
            await imageCompression(file, {
              maxSizeMB: 0.5,
              maxWidthOrHeight: 1280,
            })
        )
      );
      setImages(await Promise.all(newImages.map((file) => toBase64(file))));
    }
  }
  return (
    <React.Fragment>
      {images.length > 0 && (
        <>
          <Backdrop
            sx={{ zIndex: 9999 }}
            open={backdropOpen}
            onClick={() => setBackdropOpen(false)}
          >
            <Image src={images[selectedImageIndex] || ""} alt="Uploaded" width={500} height={500}  />
          </Backdrop>
          <Tabs
            onChange={handleChange}
            value={false}
            scrollButtons="auto"
            variant="scrollable"
          >
            {images.map((image, index) => (
              <Tab
                key={index}
                icon={
                  <Avatar
                    sx={{ width: 80, height: 80 }}
                    variant="square"
                    alt="Uploaded"
                    src={image}
                  />
                }
              />
            ))}
          </Tabs>
        </>
      )}
      <form action={formAction}>
        <FormControl fullWidth>
          <TextField
            size="small"
            minRows={2}
            name="comment"
            placeholder="Escreva sua avaliação aqui..."
            multiline
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton loading={pending} type="submit" color="primary">
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Stack direction="row" spacing="auto">
            <Rating size="medium" name="value" max={5} precision={0.5} />
            <IconButton
              component="label"
              role={undefined}
              tabIndex={-1}
              aria-label="Logo"
              sx={{
                borderRadius: "40px",
                "&:has(:focus-visible)": {
                  outline: "2px solid",
                  outlineOffset: "2px",
                },
              }}
            >
              <AddPhotoAlternateIcon />
              <input
                onChange={handleImageChange}
                type="file"
                multiple
                accept="image/*"
                style={{
                  border: 0,
                  clip: "rect(0 0 0 0)",
                  height: "1px",
                  margin: "-1px",
                  overflow: "hidden",
                  padding: 0,
                  position: "absolute",
                  whiteSpace: "nowrap",
                  width: "1px",
                }}
              />
            </IconButton>
          </Stack>
        </FormControl>
      </form>
    </React.Fragment>
  );
}
