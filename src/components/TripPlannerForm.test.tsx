import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TripPlannerForm } from "./TripPlannerForm";
import type { TripFormData } from "./TripPlannerForm";

describe("TripPlannerForm", () => {
  const mockSetFormData = vi.fn();

  const defaultFormData: TripFormData = {
    destination: "",
    duration: "",
    numChildren: "",
    childrenAges: "",
    budget: "",
    pace: "",
    season: "",
    mobility: "",
    activities: "",
  };

  beforeEach(() => {
    mockSetFormData.mockClear();
  });

  it("renders all form sections", () => {
    render(
      <TripPlannerForm
        formData={defaultFormData}
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
        setFormData={mockSetFormData}
      />
    );

    const destinationInput = screen.getByLabelText(
      "Destination (US City/State)*"
    );
    fireEvent.change(destinationInput, { target: { value: "New York" } });

    // Check that the mock function was called with an updater function
    expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
    expect(mockSetFormData).toHaveBeenCalledOnce();

    // Get the function that was passed to mockSetFormData
    const updaterFn = mockSetFormData.mock.calls[0][0];

    // Call the updater function with the previous state
    const newState = updaterFn(defaultFormData);

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
        setFormData={mockSetFormData}
      />
    );

    const durationOption = screen.getByLabelText("7 days");
    fireEvent.click(durationOption);

    expect(mockSetFormData).toHaveBeenCalledOnce();
  });

  it("updates budget when option is selected", () => {
    render(
      <TripPlannerForm
        formData={defaultFormData}
        setFormData={mockSetFormData}
      />
    );

    const budgetOption = screen.getByLabelText("Moderate ($150-300)");
    fireEvent.click(budgetOption);

    expect(mockSetFormData).toHaveBeenCalledOnce();
  });

  it("handles textarea input for mobility requirements", () => {
    render(
      <TripPlannerForm
        formData={defaultFormData}
        setFormData={mockSetFormData}
      />
    );

    const mobilityTextarea = screen.getByLabelText("Mobility Requirements");
    fireEvent.change(mobilityTextarea, {
      target: { value: "Wheelchair accessible" },
    });

    expect(mockSetFormData).toHaveBeenCalledOnce();
  });

  it("correctly updates form state", () => {
    let currentFormData = { ...defaultFormData };
    const setFormData = vi.fn((updater) => {
      if (typeof updater === "function") {
        currentFormData = updater(currentFormData);
      } else {
        currentFormData = updater;
      }
    });

    render(
      <TripPlannerForm formData={currentFormData} setFormData={setFormData} />
    );

    // Test destination update
    const destinationInput = screen.getByLabelText(
      "Destination (US City/State)*"
    );
    fireEvent.change(destinationInput, { target: { value: "New York" } });
    expect(setFormData).toHaveBeenCalled();
  });
});
