import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AuthProvider } from "../../context/AuthContext";
import App from "./App";

// Mock react-router-dom so tests run when the package is not installed (e.g. in Docker)
jest.mock("react-router-dom", () => {
  const React = require("react");
  return {
    BrowserRouter: ({ children }) => React.createElement(React.Fragment, null, children),
    Routes: ({ children }) => React.createElement(React.Fragment, null, children),
    Route: ({ element }) => element,
    Navigate: () => React.createElement("div", { "data-testid": "navigate" }),
  };
});

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
    const signIn = screen.queryByText(/sign in/i);
    const signUp = screen.queryByText(/sign up/i);
    expect(signIn || signUp).toBeTruthy();
  });

  test("shows app title or auth-related content", () => {
    renderApp();
    expect(screen.getByText(/Dental Tech Register/i)).toBeInTheDocument();
  });
});
