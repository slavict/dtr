import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

function TestConsumer() {
  const { token, user, login, logout, isAuthenticated } = useAuth();
  return (
    <div>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="email">{user?.email ?? "none"}</span>
      <span data-testid="username">{user?.username ?? "none"}</span>
      <button onClick={() => login("fake-token", { email: "u@t.com", username: "u1" })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("initial state is not authenticated when no token in storage", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
  });

  test("login updates state and storage", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    act(() => {
      screen.getByText("Login").click();
    });
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("email")).toHaveTextContent("u@t.com");
    expect(screen.getByTestId("username")).toHaveTextContent("u1");
    expect(localStorage.getItem("auth_token")).toBe("fake-token");
  });

  test("logout clears state and storage", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    act(() => {
      screen.getByText("Login").click();
    });
    act(() => {
      screen.getByText("Logout").click();
    });
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(localStorage.getItem("auth_token")).toBeNull();
  });
});
