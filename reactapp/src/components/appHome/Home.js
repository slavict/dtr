import { Container, Grid } from "@mui/material";
import ListRecords from "../appListRecords/ListRecords";
import axiosInstance, { RECORDS_API } from "../../api/axios";
import { useCallback, useEffect, useState } from "react";
import ModalRecords from "../appModalRecord/ModalRecord";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const [records, setRecords] = useState([]);
  const { token, logout } = useAuth();

  const getRecords = useCallback(() => {
    if (!token) {
      return;
    }

    axiosInstance
      .get(RECORDS_API + "/")
      .then((res) => setRecords(res.data))
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
        }
      });
  }, [token, logout]);

  useEffect(() => {
    getRecords();
  }, [getRecords]);

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
