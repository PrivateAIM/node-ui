import { useState } from "react";
import { useSelector } from "react-redux";
import Papa from "papaparse";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TableContainer from "@mui/material/TableContainer";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import TableViewIcon from "@mui/icons-material/TableView";
import BarChartIcon from "@mui/icons-material/BarChart";
import { Scatter, Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

import { fileView, plotTypes } from "../../constants";
import { HtmlTooltip } from "../Tooltip";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ChartTooltip,
  Legend
);

const createColumns = (parsed) => {
  return parsed.map((col) => ({
    id: col,
    label: col.toUpperCase(),
  }));
};

const getMenuItems = (columns) => {
  return [...columns, { id: "Sequence 1...N", label: "Sequence 1...N" }];
};

const CsvFile = ({ slice }) => {
  const { resultItem } = useSelector((state) => state[slice]);

  const [view, setView] = useState(fileView.TABLE);
  const [plotData, setPlotData] = useState({ datasets: [] });
  const [plotOptions, setPlotOptions] = useState({});
  const [plot, setPlot] = useState({
    xAxis: "",
    yAxis: "",
    type: plotTypes.SCATTER,
  });

  const parsedCsv = Papa.parse(resultItem.content, {
    header: true,
    skipEmptyLines: true,
  });
  const columns = createColumns(parsedCsv.meta.fields);
  const menuItems = getMenuItems(columns);

  const handleToggleView = (_, newView) => {
    if (newView !== null) setView(newView);
  };

  const handleChangePlot = (event) => {
    const { name, value } = event.target;
    setPlot({ ...plot, [name]: value });
  };

  const handleBuildPlot = () => {
    const [dataX, dataY] = parsedCsv.data.reduce(
      ([xVal, yVal], content, idx) => {
        xVal.push(plot.xAxis in content ? content[plot.xAxis] : idx);
        yVal.push(plot.yAxis in content ? content[plot.yAxis] : idx);
        return [xVal, yVal];
      },
      [[], []]
    );

    setPlotOptions({
      scales: {
        x: {
          title: {
            display: true,
            text: plot.xAxis,
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: plot.yAxis,
          },
        },
      },
    });

    setPlotData({
      labels: dataX,
      datasets: [
        {
          label: `${plot.xAxis} vs ${plot.yAxis}`,
          data: dataY,
          backgroundColor: "rgb(255, 99, 132, 0.2)",
          borderColor: "rgb(255, 99, 132)",
          borderWidth: 1,
        },
      ],
    });
  };

  return (
    <Box>
      <Stack
        p={2}
        direction="row"
        justifyContent={view === fileView.CHART ? "space-between" : "flex-end"}
      >
        {view === fileView.CHART && (
          <Stack direction="row" spacing={2}>
            <FormControl sx={{ minWidth: 130 }} size="small">
              <InputLabel id="select-xaxis">x-axis</InputLabel>
              <Select
                labelId="select-xaxis"
                id="select-xaxis"
                label="x-axis"
                name="xAxis"
                value={plot.xAxis}
                onChange={handleChangePlot}
              >
                {menuItems.map((col) => (
                  <MenuItem key={`xaxis_${col.id}`} value={col.id}>
                    {col.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 130 }} size="small">
              <InputLabel id="select-yaxis">y-axis</InputLabel>
              <Select
                labelId="select-yaxis"
                id="select-yaxis"
                label="y-axis"
                name="yAxis"
                value={plot.yAxis}
                onChange={handleChangePlot}
              >
                {menuItems.map((col) => (
                  <MenuItem key={`yaxis_${col.id}`} value={col.id}>
                    {col.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 130 }} size="small">
              <InputLabel id="select-plot-type">Plot type</InputLabel>
              <Select
                labelId="select-plot-type"
                id="select-plot-type"
                label="Plot type"
                name="type"
                value={plot.type}
                onChange={handleChangePlot}
              >
                {Object.values(plotTypes).map((pType) => (
                  <MenuItem key={pType} value={pType}>
                    {pType}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              sx={{ py: "7px", fontWeight: "bold" }}
              disabled={!Boolean(plot.xAxis && plot.yAxis)}
              onClick={handleBuildPlot}
            >
              Build Plot
            </Button>
          </Stack>
        )}
        <Stack direction="row" alignItems="center">
          <Typography component="span" mr={2} variant="body1" fontWeight="bold">
            Visualize as :
          </Typography>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleToggleView}
            aria-label="toggle file view"
            size="small"
          >
            <ToggleButton value={fileView.TABLE} aria-label="table view">
              <HtmlTooltip title="Table View">
                <TableViewIcon />
              </HtmlTooltip>
            </ToggleButton>
            <ToggleButton value={fileView.CHART} aria-label="chart view">
              <HtmlTooltip title="Chart View">
                <BarChartIcon />
              </HtmlTooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>
      {view === fileView.TABLE ? (
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id} align="center">
                    <b>{column.label}</b>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {parsedCsv.data.map((row, idx) => (
                <TableRow hover key={idx}>
                  {columns.map((col) => (
                    <TableCell key={col.id} align="center">
                      {row[col.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box p={1}>
          {plot.type === plotTypes.SCATTER ? (
            <Scatter options={plotOptions} data={plotData} />
          ) : plot.type === plotTypes.BAR ? (
            <Bar options={plotOptions} data={plotData} />
          ) : (
            <Line options={plotOptions} data={plotData} />
          )}
        </Box>
      )}
    </Box>
  );
};

export default CsvFile;
