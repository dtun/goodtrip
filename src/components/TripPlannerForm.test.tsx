import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TripPlannerForm } from "./TripPlannerForm";

describe("TripPlannerForm", () => {
  let mockHandleSubmit: any;

  beforeEach(() => {
    mockHandleSubmit = vi.fn();
  });

  it("renders all form sections", () => {
    render(<TripPlannerForm handleSubmit={mockHandleSubmit} />);

    expect(screen.getByText("Basic Trip Details")).toBeDefined();
    expect(screen.getByText("Travel Group")).toBeDefined();
    expect(screen.getByText("Trip Preferences")).toBeDefined();
    expect(screen.getByText("Additional Details")).toBeDefined();
  });

  it("updates destination when input changes", () => {
    render(<TripPlannerForm handleSubmit={mockHandleSubmit} />);

    const destinationInput = screen.getByRole("textbox", {
      name: "Destination (US City/State)*",
    });
    fireEvent.change(destinationInput, { target: { value: "New York" } });

    expect(destinationInput).toHaveValue("New York");
  });

  it("selects duration when radio button is clicked", () => {
    render(<TripPlannerForm handleSubmit={mockHandleSubmit} />);

    let durationOption = screen.getByLabelText("7 days");
    fireEvent.click(durationOption);

    expect(durationOption).toBeChecked();
  });

  it("updates budget when option is selected", () => {
    render(<TripPlannerForm handleSubmit={mockHandleSubmit} />);

    let budgetOption = screen.getByLabelText("Moderate ($150-300)");
    fireEvent.click(budgetOption);

    expect(budgetOption).toBeChecked();
  });

  it("handles textarea input for mobility requirements", () => {
    render(<TripPlannerForm handleSubmit={mockHandleSubmit} />);

    let mobilityTextarea = screen.getByLabelText("Mobility Requirements");
    fireEvent.change(mobilityTextarea, {
      target: { value: "Wheelchair accessible" },
    });

    expect(mobilityTextarea).toHaveValue("Wheelchair accessible");
  });

  it("handles form submission correctly", () => {
    let mockEvent = { preventDefault: vi.fn() };
    render(<TripPlannerForm handleSubmit={mockHandleSubmit} />);

    fireEvent.submit(screen.getByRole("form"));

    expect(mockHandleSubmit).toHaveBeenCalledOnce();
    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(0); // The preventDefault is handled internally
  });

  it("can be reset", () => {
    render(
      <>
        <TripPlannerForm handleSubmit={mockHandleSubmit} />
        <button
          onClick={() =>
            (
              document.getElementById("tripPlannerForm") as HTMLFormElement
            ).reset()
          }
        >
          reset
        </button>
      </>
    );

    let mobilityTextarea = screen.getByLabelText("Mobility Requirements");
    fireEvent.change(mobilityTextarea, {
      target: { value: "Wheelchair accessible" },
    });

    expect(mobilityTextarea).toHaveValue("Wheelchair accessible");

    // Find and click the reset button
    const resetButton = screen.getByRole("button", { name: /reset/i });
    fireEvent.click(resetButton);

    expect(mobilityTextarea).toHaveValue("");
  });
});
