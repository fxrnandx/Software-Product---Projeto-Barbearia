"use client";
import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box, { BoxProps } from "@mui/material/Box";
import { Button, IconButton } from "@mui/material";
import { useSchedule } from "@/providers/ScheduleProvider";
import ScheduleDialog from "./ScheduleDialog";
import { SnackbarProvider, closeSnackbar, enqueueSnackbar } from 'notistack';
import { useSession } from "@toolpad/core";
import CloseIcon from '@mui/icons-material/Close';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

interface BasicTabsProps extends BoxProps {
  tabs: TabData[];
}

interface TabData {
  title: string;
  Component: React.ReactNode;
}

export default function BasicTabs(props: BasicTabsProps) {
  const session = useSession();
  const [value, setValue] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [showSchedule, setShowSchedule] = React.useState(false);
  const {selectedServices, selectedWorker} = useSchedule();
  React.useEffect(() => {
      setShowSchedule(selectedServices.length > 0 && selectedWorker !== null);
  }, [selectedServices, selectedWorker]);

  const { tabs, ...other } = props;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleOpen = () => {
    if (!session) {
      enqueueSnackbar('Você precisa estar logado para agendar um serviço.', { variant: 'default', action: (key) => (
        <IconButton onClick={() => { closeSnackbar(key); }}><CloseIcon /></IconButton>
      )});
      return;
    }
    setOpen(true);
  };

  return (
    <SnackbarProvider preventDuplicate maxSnack={3}>
    <Box sx={{ width: "100%" }} {...other}>
      <ScheduleDialog open={open} onClose={() => setOpen(false)} />
      <Box sx={{ borderBottom: 1, borderColor: "divider", display: 'flex', justifyContent: 'space-between'  }}>
        <Tabs
          scrollButtons
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          sx={{ typography: "body1", fontWeight: 600 }}
        >
          {tabs.map((tab, index) => (
            <Tab
              label={tab.title}
              key={index}
              {...a11yProps(index)}
              sx={{ typography: "overline", padding: 0 }}
              value={index}
            />
          ))}
        </Tabs>
        { showSchedule && <IconButton
            aria-label="agendar"
            color="primary"
            onClick={handleOpen}
            sx={{ mx: 2 }}
          >
            <EventAvailableIcon />
          </IconButton>}
      </Box>
      {tabs.map((tab, index) => (
          tab.Component && (
            <CustomTabPanel value={value} index={index} key={index}>
              {tab.Component}
            </CustomTabPanel>
          )
      ))}
    </Box>
    </SnackbarProvider>
  );
}
