import { Fragment, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import RecordForm from "../appRecordForm/RecordForm";

const ModalRecord = (props) => {
  const [visible, setVisible] = useState(false);

  const toggle = () => {
    setVisible(!visible);
  };

  const button = (
    <Button variant="outlined" onClick={() => toggle()}>
      Edit
    </Button>
  );

  if (props.create) {
    return (
      <Fragment>
        <Button
          variant="contained"
          onClick={() => toggle()}
          sx={{ minWidth: "200px" }}
        >
          Add new record
        </Button>
        <Dialog open={visible} onClose={toggle} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ textAlign: "center" }}>
            {props.create ? "Add Record" : "Edit Record"}
          </DialogTitle>
          <DialogContent>
            <RecordForm
              record={props.record ? props.record : []}
              resetState={props.resetState}
              toggle={toggle}
              newRecord={props.newRecord}
            />
          </DialogContent>
        </Dialog>
      </Fragment>
    );
  }

  return (
    <Fragment>
      {button}
      <Dialog open={visible} onClose={toggle} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: "center" }}>
          {props.create ? "Add Record" : "Edit Record"}
        </DialogTitle>
        <DialogContent>
          <RecordForm
            record={props.record ? props.record : []}
            resetState={props.resetState}
            toggle={toggle}
            newRecord={props.newRecord}
          />
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export default ModalRecord;
