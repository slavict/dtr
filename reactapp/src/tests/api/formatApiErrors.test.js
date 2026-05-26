import { formatApiErrors } from "../../api/formatApiErrors";

describe("formatApiErrors", () => {
  test("returns fallback when data is null or undefined", () => {
    expect(formatApiErrors(null, "Failed.")).toBe("Failed.");
    expect(formatApiErrors(undefined, "Failed.")).toBe("Failed.");
  });

  test("returns string data as-is", () => {
    expect(formatApiErrors("Email already exists.", "Failed.")).toBe(
      "Email already exists."
    );
  });

  test("extracts detail string", () => {
    expect(formatApiErrors({ detail: "Not found." }, "Failed.")).toBe("Not found.");
  });

  test("extracts messages from errors object", () => {
    expect(
      formatApiErrors(
        { errors: { error: ["Login failed. Please check your email and password."] } },
        "Failed."
      )
    ).toBe("Login failed. Please check your email and password.");
  });

  test("collects nested field errors from user payload", () => {
    expect(
      formatApiErrors(
        { user: { email: ["Enter a valid email."], password: ["Too short."] } },
        "Failed."
      )
    ).toBe("Enter a valid email. Too short.");
  });

  test("returns fallback when payload has no messages", () => {
    expect(formatApiErrors({ errors: {} }, "Registration failed.")).toBe(
      "Registration failed."
    );
  });
});
