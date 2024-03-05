import { visuallyHidden } from "@mui/utils";
import Box from "@mui/material/Box";
import MuiTableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";

export default function TableHead(props) {
  const { order, orderBy, columns, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <MuiTableHead>
      <TableRow>
        {columns.map((col) => (
          <TableCell
            key={col.id}
            align={col.align}
            sx={{ fontWeight: "bold", background: "white" }}
            sortDirection={orderBy === col.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === col.id}
              direction={orderBy === col.id ? order : "asc"}
              onClick={createSortHandler(col.id)}
            >
              {col.label}
              {orderBy === col.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </MuiTableHead>
  );
}
