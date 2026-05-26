import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../../../context/AuthContext";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";

function TestHome() {
  return <div>Protected Home</div>;
}

function renderProtectedRoute() {
  return render(
    <AuthProvider>
      <ProtectedRoute>
        <TestHome />
      </ProtectedRoute>
    </AuthProvider>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("when not authenticated, redirects to login", () => {
    renderProtectedRoute();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Home")).not.toBeInTheDocument();
  });

  test("when authenticated, renders children", () => {
    localStorage.setItem("auth_token", "some-token");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ email: "u@t.com", username: "u1" })
    );
    renderProtectedRoute();
    expect(screen.getByText("Protected Home")).toBeInTheDocument();
  });
});
