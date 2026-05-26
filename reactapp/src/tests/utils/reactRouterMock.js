import React from "react";

export const mockNavigate = jest.fn();

export const MemoryRouter = ({ children }) =>
  React.createElement(React.Fragment, null, children);

export const BrowserRouter = ({ children }) =>
  React.createElement(React.Fragment, null, children);

export const Routes = ({ children }) =>
  React.createElement(React.Fragment, null, children);

export const Route = ({ element }) => element;

export const Navigate = ({ to }) =>
  React.createElement("div", null, to === "/login" ? "Login Page" : `Navigate to ${to}`);

export const Link = ({ to, children, style }) =>
  React.createElement("a", { href: to, style }, children);

export const useNavigate = () => mockNavigate;

export const useLocation = () => ({ pathname: "/", state: null });
