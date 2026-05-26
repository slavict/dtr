import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
} from "@mui/material";
import ModalRecord from "../appModalRecord/ModalRecord";
import AppRemoveRecord from "../appRemoveRecord/appRemoveRecord";

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
};

const ListRecords = (props) => {
  const { records } = props;
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow sx={{ "& .MuiTableCell-head": { backgroundColor: "grey.900", color: "white" } }}>
            <TableCell>Technician name</TableCell>
            <TableCell>Finished</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Work started</TableCell>
            <TableCell>Work finished</TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!records || records.length <= 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <strong>No records at the moment</strong>
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => (
              <TableRow key={record.pk} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell>{record.technician_name}</TableCell>
                <TableCell>{record.work_order_finished ? "Yes" : "No"}</TableCell>
                <TableCell>{record.description}</TableCell>
                <TableCell>{formatDate(record.work_started_at)}</TableCell>
                <TableCell>{formatDate(record.work_finished_at)}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {!record.work_order_finished && (
                      <ModalRecord
                        create={false}
                        record={record}
                        resetState={props.resetState}
                        newRecord={props.newRecord}
                      />
                    )}
                    <AppRemoveRecord pk={record.pk} resetState={props.resetState} />
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ListRecords;
