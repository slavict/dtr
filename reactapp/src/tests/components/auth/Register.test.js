import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AuthProvider } from "../../../context/AuthContext";
import { mockNavigate } from "../../utils/reactRouterMock";
import Register from "../../../components/auth/Register";
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

function renderRegister() {
  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

describe("Register", () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    axiosInstance.post.mockReset();
  });

  test("renders sign up form and link to login", () => {
    renderRegister();
    expect(screen.getByRole("heading", { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
  });

  test("shows validation for short password", async () => {
    renderRegister();
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "new@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "newuser" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "short" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(
      await screen.findByText(/password must be at least 8 characters/i)
    ).toBeInTheDocument();
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  test("successful registration stores token and navigates home", async () => {
    axiosInstance.post.mockResolvedValueOnce({
      data: {
        user: { token: "jwt-new", email: "new@test.com", username: "newuser" },
      },
    });

    renderRegister();
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "new@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "newuser" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "securepass123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "securepass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/users/",
        {
          user: {
            email: "new@test.com",
            username: "newuser",
            password: "securepass123",
          },
        },
        { headers: { "Content-Type": "application/json" } }
      );
    });
    expect(localStorage.getItem("auth_token")).toBe("jwt-new");
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  test("API error shows formatted message", async () => {
    axiosInstance.post.mockRejectedValueOnce({
      response: {
        data: { errors: { user: { email: ["A user with this email already exists."] } } },
      },
    });

    renderRegister();
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "exists@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "exists" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "securepass123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "securepass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(
      await screen.findByText(/a user with this email already exists/i)
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
