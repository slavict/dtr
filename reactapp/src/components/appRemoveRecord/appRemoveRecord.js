import { Fragment, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import axiosInstance, { RECORDS_API } from "../../api/axios";

const AppRemoveRecord = (props) => {
  const [visible, setVisible] = useState(false);

  const toggle = () => {
    setVisible(!visible);
  };

  const deleteStudent = () => {
    axiosInstance.delete(RECORDS_API + "/" + props.pk).then(() => {
      props.resetState();
      toggle();
    });
  };

  return (
    <Fragment>
      <Button variant="contained" color="error" onClick={() => toggle()}>
        Delete
      </Button>
      <Dialog open={visible} onClose={toggle} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: "center" }}>
          Are you sure?
        </DialogTitle>
        <DialogActions sx={{ display: "flex", justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteStudent()}
          >
            Delete
          </Button>
          <Button variant="outlined" onClick={() => toggle()}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default AppRemoveRecord;
