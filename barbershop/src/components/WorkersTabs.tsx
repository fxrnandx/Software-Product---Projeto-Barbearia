"use client";
import { useSchedule } from "@/providers/ScheduleProvider";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { Employee } from "@/utils/employees";

interface WorkersTabsProps {
  workers: Employee[];
}

export default function WorkersTabs(props: WorkersTabsProps) {
  const { workers } = props;
  const { selectedWorker, setSelectedWorker } = useSchedule();
  function handleChange(event: React.SyntheticEvent, newValue: number) {
    const worker = workers.find((w) => w.id === newValue);
    if (worker) {
      setSelectedWorker(worker);
    }
  }
  return (
    <Tabs
      value={selectedWorker?.id || false}
      onChange={handleChange}
      scrollButtons="auto"
      variant="scrollable"
      aria-label="worker tabs"
      sx={{ typography: "body1", fontWeight: 600, marginBottom: 2 }}
    >
      {workers.map((worker) => (
        <Tab
          key={worker.id}
          label={
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              gap={1}
            >
              <Avatar
                variant="circular"
                src={worker.photo || "/vercel.svg"}
              />
              <Typography
                variant="caption"
                color="text.primary"
                fontWeight={600}
              >
                {worker.name}
              </Typography>
            </Box>
          }
          sx={{ typography: "overline" }}
          value={worker.id}
        />
      ))}
    </Tabs>
  );
}
