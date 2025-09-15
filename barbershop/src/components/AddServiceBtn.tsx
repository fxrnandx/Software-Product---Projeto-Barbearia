"use client";
import { useSchedule } from "@/providers/ScheduleProvider";
import { Badge, IconButton } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import React from "react";
import { Service } from "@/utils/services";
export function AddService(service: Service) {
  const { selectedServices, setSelectedServices } = useSchedule();
  const [quantity, setQuantity] = React.useState(0);

  const handleScheduleClick = (service: Service) => {
    let isSelected = false;
    const updatedServices = selectedServices.map((s) => {
      if (s.id === service.id) {
        isSelected = true;
        setQuantity((s.quantity || 1) + 1);
        return { ...s, quantity: (s.quantity || 1) + 1, duration: service.duration + (s.duration || 0) };
      }
      return s;
    });
    if (!isSelected) {
      setSelectedServices([...selectedServices, { ...service, quantity: 1 }]);
      setQuantity(1);
      return;
    }
    setSelectedServices(updatedServices);
  };

  const handleRemoveClick = (service: Service) => {
    const updatedServices = selectedServices
      .map((s) => {
        if (s.id === service.id) {
          setQuantity((s.quantity || 1) - 1);
          return { ...s, quantity: (s.quantity || 1) - 1, duration: (s.duration || 0) - service.duration};
        }
        return s;
      })
      .filter((s) => s.quantity ? s.quantity > 0 : false);
    setSelectedServices(updatedServices);
  };

  return (
    <Badge badgeContent={quantity} color="primary">
      <IconButton
        aria-label="remover"
        color="primary"
        onClick={() => handleRemoveClick(service)}
      >
        <RemoveIcon />
      </IconButton>
      <IconButton
        aria-label="agendar"
        color="primary"
        onClick={() => handleScheduleClick(service)}
      >
        <AddIcon />
      </IconButton>
    </Badge>
  );
}
