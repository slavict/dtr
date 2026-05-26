import { Container, Grid } from "@mui/material";
import ListRecords from "../appListRecords/ListRecords";
import axiosInstance, { RECORDS_API } from "../../api/axios";
import { useEffect, useState } from "react";
import ModalRecords from "../appModalRecord/ModalRecord";

const Home = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    getRecords();
  }, []);

  const getRecords = () => {
    axiosInstance.get(RECORDS_API + "/").then((res) => setRecords(res.data));
  };

  const resetState = () => {
    getRecords();
  };

  return (
    <Container sx={{ marginTop: "20px" }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <ListRecords
            records={records}
            resetState={resetState}
            newStudent={false}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <ModalRecords
            create={true}
            resetState={resetState}
            newRecord={true}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
