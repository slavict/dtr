import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

function TestHome() {
  return <div>Protected Home</div>;
}

function renderWithRouter(initialEntries = ["/"]) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <TestHome />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("when not authenticated, redirects to login", () => {
    renderWithRouter(["/"]);
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Home")).not.toBeInTheDocument();
  });

  test("when authenticated, renders children", () => {
    localStorage.setItem("auth_token", "some-token");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ email: "u@t.com", username: "u1" })
    );
    renderWithRouter(["/"]);
    expect(screen.getByText("Protected Home")).toBeInTheDocument();
  });
});
