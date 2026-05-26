import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Button,
  TextField,
  Box,
  Stack,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";
import { formatApiErrors } from "../../api/formatApiErrors";
import { useAuth } from "../../context/AuthContext";

const LOGIN_FAILED_MESSAGE =
  "Login failed. Please check your email and password.";
const LOGIN_LOCKED_MESSAGE =
  "Too many failed login attempts. Your account is temporarily locked for 3 minutes. Please try again later.";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required").trim(),
  password: Yup.string().required("Password is required"),
});

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (values, { setStatus }) => {
    setStatus(null);
    try {
      const { data } = await axiosInstance.post("/users/login/", {
        user: { email: values.email, password: values.password },
      });
      const { token, email, username } = data.user;
      login(token, { email, username });
      navigate("/", { replace: true });
    } catch (err) {
      const message = formatApiErrors(err.response?.data, LOGIN_FAILED_MESSAGE);
      setStatus({
        text: message,
        locked: message === LOGIN_LOCKED_MESSAGE,
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
        py: 4,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Sign in
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Dental Tech Register
        </Typography>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, status }) => (
            <Form>
              <Stack spacing={2}>
                {status && (
                  <Alert severity={status.locked ? "warning" : "error"}>
                    {status.text}
                  </Alert>
                )}
                <Field name="email">
                  {({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      fullWidth
                      autoComplete="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  )}
                </Field>
                <Field name="password">
                  {({ field }) => (
                    <TextField
                      {...field}
                      label="Password"
                      type="password"
                      fullWidth
                      autoComplete="current-password"
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                    />
                  )}
                </Field>
                <Button type="submit" variant="contained" size="large" fullWidth>
                  Sign in
                </Button>
                <Typography variant="body2" align="center" color="text.secondary">
                  Don&apos;t have an account?{" "}
                  <Link to="/register" style={{ color: "inherit", fontWeight: 600 }}>
                    Sign up
                  </Link>
                </Typography>
              </Stack>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
}
