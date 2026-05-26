import { useState } from "react";
import { API_STATIC_MEDIA } from "../../api/axios";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const ModalPhoto = (props) => {
  const [visible, setVisible] = useState(false);

  const toggle = () => {
    setVisible(!visible);
  };

  return (
    <>
      <img
        onClick={toggle}
        src={API_STATIC_MEDIA + props.record.photo}
        alt="loading"
        style={{ height: 50, cursor: "pointer" }}
      />
      <Dialog open={visible} onClose={toggle} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            color: "white",
            textAlign: "center",
            backgroundColor: "grey.900",
          }}
        >
          Photo
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            backgroundColor: "grey.900",
          }}
        >
          <img src={API_STATIC_MEDIA + props.record.photo} alt="loading" />
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            backgroundColor: "grey.900",
          }}
        >
          <Button variant="contained" onClick={() => toggle()}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ModalPhoto;
