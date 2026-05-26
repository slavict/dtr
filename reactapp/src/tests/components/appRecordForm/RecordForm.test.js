import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AuthProvider } from "../../../context/AuthContext";
import RecordForm from "../../../components/appRecordForm/RecordForm";

jest.mock("../../../api/axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(() => Promise.resolve()),
    put: jest.fn(() => Promise.resolve()),
  },
  RECORDS_API: "/api/records",
  setAuthToken: jest.fn(),
  TOKEN_KEY: "auth_token",
}));

const theme = createTheme();

function renderRecordForm(props = {}) {
  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <RecordForm
          newRecord={true}
          record={{}}
          resetState={jest.fn()}
          toggle={jest.fn()}
          {...props}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

describe("RecordForm", () => {
  beforeEach(() => {
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ email: "u@t.com", username: "loggedin_user" })
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("renders technician name field as read-only", () => {
    renderRecordForm();
    const technicianInput = screen.getByLabelText(/Technician name/i);
    expect(technicianInput.readOnly).toBe(true);
  });

  test("renders description, work started, work finished, and work order finished", () => {
    renderRecordForm();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Work started at/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Work finished at/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Work order finished/i)).toBeInTheDocument();
  });

  test("renders Send and Cancel buttons", () => {
    renderRecordForm();
    expect(screen.getByRole("button", { name: /Send/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });
});
