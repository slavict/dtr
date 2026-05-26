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

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required").trim(),
  username: Yup.string().required("Username is required").trim(),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .required("Password is required"),
  passwordConfirm: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
});

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (values, { setStatus }) => {
    setStatus(null);
    try {
      const { data } = await axiosInstance.post(
        "/users/",
        {
          user: {
            email: values.email.trim(),
            username: values.username.trim(),
            password: values.password,
          },
        },
        { headers: { "Content-Type": "application/json" } }
      );
      const { token, email, username } = data.user;
      login(token, { email, username });
      navigate("/", { replace: true });
    } catch (err) {
      setStatus(formatApiErrors(err.response?.data, "Registration failed."));
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
          Sign up
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Dental Tech Register
        </Typography>
        <Formik
          initialValues={{
            email: "",
            username: "",
            password: "",
            passwordConfirm: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, status }) => (
            <Form>
              <Stack spacing={2}>
                {status && (
                  <Alert severity="error" onClose={() => {}}>
                    {status}
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
                <Field name="username">
                  {({ field }) => (
                    <TextField
                      {...field}
                      label="Username"
                      fullWidth
                      autoComplete="username"
                      error={touched.username && Boolean(errors.username)}
                      helperText={touched.username && errors.username}
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
                      autoComplete="new-password"
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                    />
                  )}
                </Field>
                <Field name="passwordConfirm">
                  {({ field }) => (
                    <TextField
                      {...field}
                      label="Confirm password"
                      type="password"
                      fullWidth
                      autoComplete="new-password"
                      error={touched.passwordConfirm && Boolean(errors.passwordConfirm)}
                      helperText={touched.passwordConfirm && errors.passwordConfirm}
                    />
                  )}
                </Field>
                <Button type="submit" variant="contained" size="large" fullWidth>
                  Sign up
                </Button>
                <Typography variant="body2" align="center" color="text.secondary">
                  Already have an account?{" "}
                  <Link to="/login" style={{ color: "inherit", fontWeight: 600 }}>
                    Sign in
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
