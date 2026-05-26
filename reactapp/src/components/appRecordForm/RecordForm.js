import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Button, TextField, Stack, FormControlLabel, Checkbox } from "@mui/material";
import axiosInstance, { RECORDS_API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const validationSchema = Yup.object({
  work_order_finished: Yup.boolean(),
  description: Yup.string().trim(),
  work_started_at: Yup.date().nullable(),
  work_finished_at: Yup.date().nullable(),
});

const formatDateForInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return d.toISOString().slice(0, 10);
};

const RecordForm = (props) => {
  const { user: authUser } = useAuth();
  const isNewRecord = props.newRecord;
  const initialRecord = props.record && !isNewRecord ? props.record : {};

  const initialValues = {
    technician_name: initialRecord.technician_name ?? authUser?.username ?? "",
    work_order_finished: initialRecord.work_order_finished ?? false,
    description: initialRecord.description ?? "",
    work_started_at: formatDateForInput(initialRecord.work_started_at) ?? "",
    work_finished_at: formatDateForInput(initialRecord.work_finished_at) ?? "",
    pk: initialRecord.pk,
  };

  const handleSubmit = async (values) => {
    const payload = {
      work_order_finished: !!values.work_order_finished,
      description: values.description,
      work_started_at: values.work_started_at || null,
      work_finished_at: values.work_finished_at || null,
    };
    if (isNewRecord) {
      await axiosInstance.post(RECORDS_API + "/", payload, {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      await axiosInstance.put(RECORDS_API + "/" + values.pk, payload, {
        headers: { "Content-Type": "application/json" },
      });
    }
    props.resetState();
    props.toggle();
  };

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleBlur, isSubmitting }) => (
        <Form>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Field name="technician_name">
              {({ field }) => (
                <TextField
                  {...field}
                  label="Technician name"
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ "& .MuiInputBase-input": { cursor: "default" } }}
                />
              )}
            </Field>
            <Field name="work_order_finished">
              {({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={!!field.value}
                      onChange={(e) => field.onChange({ target: { name: field.name, value: e.target.checked } })}
                    />
                  }
                  label="Work order finished"
                />
              )}
            </Field>
            <Field name="description">
              {({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  minRows={2}
                  error={touched.description && Boolean(errors.description)}
                  helperText={touched.description && errors.description}
                  onBlur={handleBlur}
                />
              )}
            </Field>
            <Field name="work_started_at">
              {({ field }) => (
                <TextField
                  {...field}
                  label="Work started at"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={touched.work_started_at && Boolean(errors.work_started_at)}
                  helperText={touched.work_started_at && errors.work_started_at}
                  onBlur={handleBlur}
                />
              )}
            </Field>
            <Field name="work_finished_at">
              {({ field }) => (
                <TextField
                  {...field}
                  label="Work finished at"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={touched.work_finished_at && Boolean(errors.work_finished_at)}
                  helperText={touched.work_finished_at && errors.work_finished_at}
                  onBlur={handleBlur}
                />
              )}
            </Field>
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                Send
              </Button>
              <Button type="button" onClick={props.toggle} variant="outlined">
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};

export default RecordForm;
