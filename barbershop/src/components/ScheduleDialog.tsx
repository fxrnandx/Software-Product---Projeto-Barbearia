import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import dayjs from "dayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { FormHelperText, IconButton } from "@mui/material";
import { SendSchedule } from "./actions";
import { useSchedule } from "@/providers/ScheduleProvider";
import { TimeView } from "@mui/x-date-pickers/models";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import CloseIcon from '@mui/icons-material/Close';

interface FormDialogProps {
  open?: boolean;
  onClose?: () => void;
}

const initialState = {
  errors: {
    date: undefined,
  },
};

const daysAsNumbers = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export default function ScheduleDialog(props: FormDialogProps) {
  const [state, formAction, pending] = React.useActionState(
    SendSchedule,
    initialState
  );
  const [duration, setDuration] = React.useState(0);
  const { open = false } = props;
  const { selectedWorker, selectedServices } = useSchedule();
  const startHour = dayjs(`2022-01-01T${selectedWorker?.startHour}`);
  const stopHour = dayjs(`2022-01-01T${selectedWorker?.stopHour}`);
  const startInterval = selectedWorker?.startInterval
    ? dayjs(`2022-01-01T${selectedWorker.startInterval}`)
    : null;
  const intervalEnd =
    startInterval && selectedWorker?.intervalDuration
      ? startInterval.add(selectedWorker.intervalDuration, "minute")
      : null;
  const workingDays = selectedWorker?.workingDays;

  function isWorkingDay(date: dayjs.Dayjs) {
    if (!workingDays) return false;
    const workingDaysNumbers = workingDays.map(
      (day) => daysAsNumbers[day as keyof typeof daysAsNumbers]
    );
    return !workingDaysNumbers.includes(date.day());
  }

  function notWorkingHour(date: dayjs.Dayjs, view: TimeView) {
    if (!selectedWorker) return false;
    const hour = date.hour();
    const minute = date.minute();
    const isWithinSchedule = selectedWorker.schedules?.some((schedule) => {
      const scheduleStart = dayjs(schedule.date).locale("en");
      const scheduleEnd = scheduleStart.add(schedule.duration, "minute");
      if (!date.isSame(scheduleStart, "day")) return false;
      if (view === "hours") {
        if (date.hour() === scheduleStart.hour()) {
          return (
            scheduleEnd.hour() > scheduleStart.hour() &&
            scheduleStart.minute() === 0
          );
        }
        return hour > scheduleStart.hour() && hour < scheduleEnd.hour();
      }
      return (
        (date.isAfter(scheduleStart) && date.isBefore(scheduleEnd)) ||
        date.isSame(scheduleStart)
      );
    });
    if (isWithinSchedule) return true;
    if (view === "hours") {
      const notWorking =
        hour < startHour.hour() ||
        (hour === stopHour.hour() && stopHour.minute() === 0) ||
        hour > stopHour.hour();
      const inInterval =
        startInterval &&
        intervalEnd &&
        ((hour === startInterval.hour() &&
          startInterval.minute() === 0 &&
          intervalEnd.hour() > startInterval.hour()) ||
          (hour > startInterval.hour() && hour < intervalEnd.hour()));
      return notWorking || (inInterval as boolean);
    }
    return (
      (hour <= startHour.hour() && minute < startHour.minute()) ||
      (hour >= stopHour.hour() && minute >= stopHour.minute()) ||
      ((startInterval &&
        intervalEnd &&
        ((hour === startInterval.hour() &&
          minute >= startInterval.minute() &&
          intervalEnd.hour() > startInterval.hour()) ||
          (hour > startInterval.hour() && hour < intervalEnd.hour()) ||
          (hour === intervalEnd.hour() &&
            minute < intervalEnd.minute()))) as boolean)
    );
  }

  React.useEffect(() => {
    setDuration(
      selectedServices.reduce((total, service) => total + service.duration, 0)
    );
  }, [selectedServices]);

  React.useEffect(() => {
    if(state.success) {
      enqueueSnackbar('Agendamento realizado com sucesso!', { variant: 'success', action: (key) => (
        <IconButton onClick={() => { closeSnackbar(key); }}><CloseIcon /></IconButton>
      )});
      props.onClose?.();
    }
  }, [state]);

  const handleClose = () => {
    props.onClose?.();
  };

  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Schedule</DialogTitle>
        <DialogContent>
          <form action={formAction} id="scheduling-form">
            <DateTimePicker
              skipDisabled
              minutesStep={15}
              shouldDisableTime={notWorkingHour}
              shouldDisableDate={isWorkingDay}
              sx={{ mt: 2 }}
              name="date"
              label="Appointment Date"
              key={"date"}
              disablePast
              ampm={false}
            />
            <FormHelperText>
              {state?.errors?.date ||
                "Select date and time for your appointment"}
            </FormHelperText>
            <input
              type="hidden"
              name="employeeId"
              value={selectedWorker?.id}
            ></input>
            <input type="hidden" name="duration" value={duration}></input>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button loading={pending} type="submit" form="scheduling-form">
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
