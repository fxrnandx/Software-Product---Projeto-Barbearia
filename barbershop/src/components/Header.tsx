"use client";
import React from "react";
import { Account, DashboardLayout, PageContainer } from "@toolpad/core";
import Stack from "@mui/material/Stack";
import ColorModeSelect from "@/theme/ColorModeSelect";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

function CustomToolbarActions() {
  return (
    <Stack direction="row" alignItems="center">
      <ColorModeSelect />
      <Account />
    </Stack>
  );
}

export default function Header({
  children,
  hideNavigation,
}: Readonly<{
  children: React.ReactNode;
  hideNavigation?: boolean;
}>) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DashboardLayout
      defaultSidebarCollapsed
      slots={{
        toolbarActions: CustomToolbarActions,
      }}
    >
      {children}
    </DashboardLayout>
    </LocalizationProvider>
  );
}
