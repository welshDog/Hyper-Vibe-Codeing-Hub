import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "./App";

describe("App", () => {
  it("renders and can validate example JSON", () => {
    render(<App />);

    expect(screen.getByText("Schema Explorer")).toBeInTheDocument();

    const validateButton = screen.getByRole("button", { name: "Validate JSON" });
    fireEvent.click(validateButton);
    expect(screen.getByText("Valid")).toBeInTheDocument();

    const textarea = screen.getByLabelText("Example JSON");
    fireEvent.change(textarea, { target: { value: "{ broken" } });
    fireEvent.click(validateButton);
    expect(screen.getByText("Invalid JSON")).toBeInTheDocument();
  });

  it("supports search and entity selection", () => {
    render(<App />);

    const search = screen.getByLabelText("Search");
    fireEvent.change(search, { target: { value: "ADR" } });
    expect(screen.getByText("ADR")).toBeInTheDocument();
    expect(screen.getByText(/1\s*entities/i)).toBeInTheDocument();

    fireEvent.change(search, { target: { value: "" } });
    fireEvent.click(screen.getByText("StackConfig"));
    expect(screen.getByLabelText("Selected Entity")).toHaveTextContent("StackConfig");
  });

  it("shows schema validation errors for structurally valid JSON", () => {
    render(<App />);

    const validateButton = screen.getByRole("button", { name: "Validate JSON" });
    const textarea = screen.getByLabelText("Example JSON");
    fireEvent.change(textarea, { target: { value: "{}" } });
    fireEvent.click(validateButton);

    expect(screen.queryByText("Valid")).not.toBeInTheDocument();
    expect(screen.getByText(/Required|invalid/i)).toBeInTheDocument();
  });
});
