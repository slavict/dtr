import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AuthProvider } from "../../../context/AuthContext";
import { mockNavigate } from "../../utils/reactRouterMock";
import Login from "../../../components/auth/Login";
import axiosInstance from "../../../api/axios";

jest.mock("../../../api/axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
  setAuthToken: jest.fn(),
  TOKEN_KEY: "auth_token",
}));

const theme = createTheme();

function renderLogin() {
  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

describe("Login", () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    axiosInstance.post.mockReset();
  });

  test("renders sign in form and link to register", () => {
    renderLogin();
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute("href", "/register");
  });

  test("shows validation when submitting empty form", async () => {
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  test("successful login stores token and navigates home", async () => {
    axiosInstance.post.mockResolvedValueOnce({
      data: {
        user: { token: "jwt-1", email: "user@test.com", username: "user1" },
      },
    });

    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith("/users/login/", {
        user: { email: "user@test.com", password: "password123" },
      });
    });
    expect(localStorage.getItem("auth_token")).toBe("jwt-1");
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  test("failed login shows generic error message", async () => {
    axiosInstance.post.mockRejectedValueOnce({
      response: {
        data: {
          errors: { error: ["Login failed. Please check your email and password."] },
        },
      },
    });

    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText(/login failed\. please check your email and password/i)
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("locked account shows warning alert", async () => {
    const lockedMessage =
      "Too many failed login attempts. Your account is temporarily locked for 3 minutes. Please try again later.";
    axiosInstance.post.mockRejectedValueOnce({
      response: { data: { errors: { error: [lockedMessage] } } },
    });

    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/temporarily locked/i);
    expect(alert).toHaveClass("MuiAlert-standardWarning");
  });
});
