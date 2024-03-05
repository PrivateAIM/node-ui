import { useState } from "react";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import MuiTable from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";

import TableHead from "./TableHead";
import TableToolbar from "./TableToolbar";
import TablePaginationActions from "./TablePaginationActions";
import { stableSort, getComparator } from "../../utils";

export default function Table({
  rows,
  columns,
  orderAsc = true,
  orderByKey,
  renderTableRows,
  loading,
  emptyRowLabel,
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState(orderByKey);
  const [order, setOrder] = useState(orderAsc ? "asc" : "desc");

  const handleRequestSort = (_, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderSkeletonRows = Array(rowsPerPage)
    .fill("")
    .map((_, ridx) => (
      <TableRow hover key={`skeleton-row-${ridx}`}>
        {/* Should be equal to no. of columns */}
        {Array(columns.length)
          .fill("")
          .map((__, cidx) => (
            <TableCell key={`skeleton-col-${cidx}-${ridx}`}>
              <Skeleton variant="text" height={30} />
            </TableCell>
          ))}
      </TableRow>
    ));

  const renderEmptyRow = (
    <TableRow>
      <TableCell colSpan={columns.length} align="center">
        {emptyRowLabel}
      </TableCell>
    </TableRow>
  );

  const tableRows = loading
    ? renderSkeletonRows
    : rows.length === 0
    ? renderEmptyRow
    : stableSort(rows, getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map(renderTableRows);

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableToolbar />
      <TableContainer sx={{ maxHeight: 700 }}>
        <MuiTable stickyHeader>
          <TableHead
            order={order}
            orderBy={orderBy}
            columns={columns}
            onRequestSort={handleRequestSort}
          />
          <TableBody>{tableRows}</TableBody>
        </MuiTable>
      </TableContainer>
      <TablePagination
        component="div"
        rowsPerPageOptions={[10, 25, 50, { label: "All", value: -1 }]}
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        sx={{ "& .MuiToolbar-root": { pr: 2 } }}
        SelectProps={{
          inputProps: {
            "aria-label": "rows per page",
          },
          native: true,
        }}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        ActionsComponent={TablePaginationActions}
      />
    </Paper>
  );
}
