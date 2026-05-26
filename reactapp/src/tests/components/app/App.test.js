import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AuthProvider } from "../../../context/AuthContext";
import App from "../../../components/app/App";

const theme = createTheme();

function renderApp() {
  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  );
}

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("when not authenticated, shows login or register options", () => {
    renderApp();
    expect(screen.getAllByText(/sign in/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/sign up/i).length).toBeGreaterThan(0);
  });

  test("shows app title or auth-related content", () => {
    renderApp();
    expect(screen.getAllByText(/Dental Tech Register/i).length).toBeGreaterThan(0);
  });
});
