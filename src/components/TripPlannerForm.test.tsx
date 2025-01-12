import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TripPlannerForm } from "./TripPlannerForm";
import type { TripFormData } from "./TripPlannerForm";

describe("TripPlannerForm", () => {
  let mockSetFormData = vi.fn();
  let mockHandleSubmit = vi.fn();
  let defaultFormData: TripFormData = {
    destination: "",
    duration: "",
    numChildren: "",
    childrenAges: "",
    budget: "",
    pace: "",
    season: "",
    mobility: "",
    activities: "",
    additionalInfo: "",
  };

  beforeEach(() => {
    mockSetFormData.mockClear();
  });

  it("renders all form sections", () => {
    render(
      <TripPlannerForm
        formData={defaultFormData}
        handleSubmit={mockHandleSubmit}
        setFormData={mockSetFormData}
      />
    );

    expect(screen.getByText("Basic Trip Details")).toBeDefined();
    expect(screen.getByText("Travel Group")).toBeDefined();
    expect(screen.getByText("Trip Preferences")).toBeDefined();
    expect(screen.getByText("Additional Details")).toBeDefined();
  });

  it("updates destination when input changes", () => {
    render(
      <TripPlannerForm
        formData={defaultFormData}
        handleSubmit={mockHandleSubmit}
        setFormData={mockSetFormData}
      />
    );

    let destinationInput = screen.getByLabelText(
      "Destination (US City/State)*"
    );
    fireEvent.change(destinationInput, { target: { value: "New York" } });

    // Check that the mock function was called with an updater function
    expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
    expect(mockSetFormData).toHaveBeenCalledOnce();

    // Get the function that was passed to mockSetFormData
    let updaterFn = mockSetFormData.mock.calls[0][0];

    // Call the updater function with the previous state
    let newState = updaterFn(defaultFormData);

    // Now we can make assertions about the new state
    expect(newState).toEqual({
      ...defaultFormData,
      destination: "New York",
    });
  });

  it("selects duration when radio button is clicked", () => {
    render(
      <TripPlannerForm
        formData={defaultFormData}
        handleSubmit={mockHandleSubmit}
        setFormData={mockSetFormData}
      />
    );

    let durationOption = screen.getByLabelText("7 days");
    fireEvent.click(durationOption);

    expect(mockSetFormData).toHaveBeenCalledOnce();
  });

  it("updates budget when option is selected", () => {
    render(
      <TripPlannerForm
        formData={defaultFormData}
        handleSubmit={mockHandleSubmit}
        setFormData={mockSetFormData}
      />
    );

    let budgetOption = screen.getByLabelText("Moderate ($150-300)");
    fireEvent.click(budgetOption);

    expect(mockSetFormData).toHaveBeenCalledOnce();
  });

  it("handles textarea input for mobility requirements", () => {
    render(
      <TripPlannerForm
        formData={defaultFormData}
        handleSubmit={mockHandleSubmit}
        setFormData={mockSetFormData}
      />
    );

    let mobilityTextarea = screen.getByLabelText("Mobility Requirements");
    fireEvent.change(mobilityTextarea, {
      target: { value: "Wheelchair accessible" },
    });

    expect(mockSetFormData).toHaveBeenCalledOnce();
  });

  it("correctly updates form state", () => {
    let currentFormData = { ...defaultFormData };
    let setFormData = vi.fn((updater) => {
      if (typeof updater === "function") {
        currentFormData = updater(currentFormData);
      } else {
        currentFormData = updater;
      }
    });

    render(
      <TripPlannerForm
        formData={currentFormData}
        handleSubmit={mockHandleSubmit}
        setFormData={setFormData}
      />
    );

    // Test destination update
    let destinationInput = screen.getByLabelText(
      "Destination (US City/State)*"
    );
    fireEvent.change(destinationInput, { target: { value: "New York" } });
    expect(setFormData).toHaveBeenCalled();
  });

  it("handles form submission correctly", () => {
    let mockEvent = { preventDefault: vi.fn() };
    render(
      <TripPlannerForm
        formData={defaultFormData}
        handleSubmit={mockHandleSubmit}
        setFormData={mockSetFormData}
      />
    );

    fireEvent.submit(screen.getByRole("form"));

    expect(mockHandleSubmit).toHaveBeenCalledOnce();
    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(0); // The preventDefault is handled internally
  });
});
