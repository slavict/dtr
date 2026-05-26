import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import ListRecords from "../../../components/appListRecords/ListRecords";

const theme = createTheme();

function renderListRecords(props) {
  return render(
    <ThemeProvider theme={theme}>
      <ListRecords resetState={jest.fn()} newRecord={false} {...props} />
    </ThemeProvider>
  );
}

describe("ListRecords", () => {
  test("renders table headers", () => {
    renderListRecords({ records: [] });
    expect(screen.getByText("Technician name")).toBeInTheDocument();
    expect(screen.getByText("Finished")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Work started")).toBeInTheDocument();
    expect(screen.getByText("Work finished")).toBeInTheDocument();
  });

  test("shows empty message when no records", () => {
    renderListRecords({ records: [] });
    expect(screen.getByText(/No records at the moment/i)).toBeInTheDocument();
  });

  test("renders record rows when records provided", () => {
    const records = [
      {
        pk: 1,
        technician_name: "tech1",
        work_order_finished: false,
        description: "First job",
        work_started_at: "2025-01-01",
        work_finished_at: null,
      },
    ];
    renderListRecords({ records });
    expect(screen.getByText("tech1")).toBeInTheDocument();
    expect(screen.getByText("First job")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });
});
