'use client';
import IconButton from "@mui/material/IconButton";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import React from "react";

export default function ServicesInfoBtn() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <>
      <IconButton
        aria-label="add service"
        aria-describedby={id}
        onClick={handleClick}
        sx={{ position: "fixed", top: "50vh", right: 10 }}
      >
        <InfoOutlineIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
      >
        <Typography sx={{ p: 2, maxWidth: 300 }}>
          Select a worker to view their available services and schedule an
          appointment.
          <br />
          <br />
          You can change the selected worker at any time before confirming your
          appointment.
          <br />
          <br />
          After selecting a service, you will be guided through the steps to
          choose a date and time for your appointment.
          <br />
          <br />
          Once all steps are completed, you can confirm your appointment.
        </Typography>
        <Button onClick={handleClose} sx={{ m: 1 }}>
          Close
        </Button>
      </Popover>
    </>
  );
}
