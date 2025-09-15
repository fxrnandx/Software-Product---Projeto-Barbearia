"use client";
import * as React from "react";
import { LineChart } from "@mui/x-charts";
import { getScheduleReports, Report } from "@/utils/schedules";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export default function View({ initialData }: { initialData: Report[] }) {

  const [data, setData] = React.useState(initialData);
  const [groupBy, setGroupBy] = React.useState(0);
  const [timeFrame, setTimeFrame] = React.useState(0);
  const [series, setSeries] = React.useState<
    { dataKey: string; label: string }[]
  >([]);
  const [dataSet, setDataSet] = React.useState<
    { [key: string]: number | string }[]
  >([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const res = await getScheduleReports(groupBy, timeFrame);
      setData(res);
    };
    fetchData();
  }, [groupBy, timeFrame]);

  React.useEffect(() => {
    const newSeries = data
      .filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.label === item.label)
      )
      .map((item) => ({
        curve: "linear",
        dataKey: item.label,
        label: item.label,
      }));
    const transformedData = Object.groupBy(data, (item) => item.datetime);
    let set = Object.entries(transformedData).map(([key, value]) => {
      const obj: { [key: string]: number | string } = { datetime: key };
      newSeries.forEach((s) => {
        const found = value?.find((v) => v.label === s.label);
        obj[s.dataKey] = found ? found.quantity : 0;
      });
      return obj;
    });
    setSeries(newSeries);
    setDataSet(set);
  }, [data]);

  return (
    <Box
      width={"100%"}
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      paddingY={4}
      gap={4}
    >
      <LineChart
        sx={{ width: "100%" }}
        height={300}
        dataset={dataSet}
        series={series}
        xAxis={[{ dataKey: "datetime", scaleType: "band" }]}
        yAxis={[{ width: 50, min: 0 }]}
      />
      <FormControl fullWidth sx={{ marginTop: 2, maxWidth: 200 }}>
        <InputLabel id="group-by-label">Group By</InputLabel>
        <Select
          labelId="group-by-label"
          key="group-by-select"
          id="group-by-select"
          label="Group By"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
        >
          <MenuItem value={0}>Shop</MenuItem>
          <MenuItem value={1}>Employees</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ maxWidth: 200 }}>
        <InputLabel id="timeframe-label">Time Frame</InputLabel>
        <Select
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
          key="timeframe-select"
          labelId="timeframe-label"
          id="timeframe-select"
          label="Time Frame"
        >
          <MenuItem value={0}>Last 7 Days</MenuItem>
          <MenuItem value={1}>Last 30 Days</MenuItem>
          <MenuItem value={2}>Last 7 Months</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
