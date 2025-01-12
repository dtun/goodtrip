"use client";

import React from "react";

export interface TripFormData {
  destination: string;
  duration: string;
  numChildren: string;
  childrenAges: string;
  budget: string;
  pace: string;
  season: string;
  mobility: string;
  activities: string;
}

interface FormProps {
  formData: TripFormData;
  setFormData: React.Dispatch<React.SetStateAction<TripFormData>>;
}

export function TripPlannerForm({ formData, setFormData }: FormProps) {
  let handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    let { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="w-full">
      <div className="max-w-2xl mx-auto">
        {/* Basic Trip Details */}
        <div className="py-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Basic Trip Details
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="destination"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Destination (US City/State)*
              </label>
              <input
                type="text"
                id="destination"
                name="destination"
                required
                value={formData.destination}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Trip Duration*
              </label>
              <div className="space-y-2">
                {[2, 3, 4, 5, 6, 7, 10, 14].map((days) => (
                  <div key={days} className="flex items-center">
                    <input
                      type="radio"
                      id={`duration-${days}`}
                      name="duration"
                      value={days}
                      checked={formData.duration === days.toString()}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="relative flex items-center">
                      <div
                        className={`
                        w-5 h-5 rounded-sm border border-input mr-2
                        ${
                          formData.duration === days.toString()
                            ? "bg-primary border-primary"
                            : "bg-background"
                        }
                        flex items-center justify-center
                      `}
                      >
                        {formData.duration === days.toString() && (
                          <svg
                            className="w-3 h-3 text-primary-foreground"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <label
                        htmlFor={`duration-${days}`}
                        className="text-sm text-foreground cursor-pointer"
                      >
                        {days} days
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Travel Group */}
        <div className="py-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Travel Group
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="numChildren"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Number of Children
              </label>
              <input
                type="number"
                id="numChildren"
                name="numChildren"
                min="0"
                max="10"
                value={formData.numChildren}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div>
              <label
                htmlFor="childrenAges"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                {`Children's Ages`}
              </label>
              <input
                type="text"
                id="childrenAges"
                name="childrenAges"
                placeholder="e.g., 5, 8, 12"
                value={formData.childrenAges}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="py-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Trip Preferences
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="budget"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Budget*
              </label>
              <div className="space-y-2">
                {[
                  { value: "budget", label: "Budget ($50-150)" },
                  { value: "moderate", label: "Moderate ($150-300)" },
                  { value: "luxury", label: "Luxury ($300+)" },
                ].map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      id={`budget-${option.value}`}
                      name="budget"
                      value={option.value}
                      checked={formData.budget === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="relative flex items-center">
                      <div
                        className={`
                        w-5 h-5 rounded-sm border border-input mr-2
                        ${
                          formData.budget === option.value
                            ? "bg-primary border-primary"
                            : "bg-background"
                        }
                        flex items-center justify-center
                      `}
                      >
                        {formData.budget === option.value && (
                          <svg
                            className="w-3 h-3 text-primary-foreground"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <label
                        htmlFor={`budget-${option.value}`}
                        className="text-sm text-foreground cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label
                htmlFor="pace"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Pace*
              </label>
              <div className="space-y-2">
                {[
                  { value: "relaxed", label: "Relaxed - Plenty of downtime" },
                  {
                    value: "moderate",
                    label: "Moderate - Balanced activities",
                  },
                  { value: "active", label: "Active - Packed schedule" },
                ].map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      id={`pace-${option.value}`}
                      name="pace"
                      value={option.value}
                      checked={formData.pace === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="relative flex items-center">
                      <div
                        className={`
                        w-5 h-5 rounded-sm border border-input mr-2
                        ${
                          formData.pace === option.value
                            ? "bg-primary border-primary"
                            : "bg-background"
                        }
                        flex items-center justify-center
                      `}
                      >
                        {formData.pace === option.value && (
                          <svg
                            className="w-3 h-3 text-primary-foreground"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <label
                        htmlFor={`pace-${option.value}`}
                        className="text-sm text-foreground cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label
                htmlFor="season"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Season*
              </label>
              <div className="space-y-2">
                {["spring", "summer", "fall", "winter"].map((season) => (
                  <div key={season} className="flex items-center">
                    <input
                      type="radio"
                      id={`season-${season}`}
                      name="season"
                      value={season}
                      checked={formData.season === season}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="relative flex items-center">
                      <div
                        className={`
                        w-5 h-5 rounded-sm border border-input mr-2
                        ${
                          formData.season === season
                            ? "bg-primary border-primary"
                            : "bg-background"
                        }
                        flex items-center justify-center
                      `}
                      >
                        {formData.season === season && (
                          <svg
                            className="w-3 h-3 text-primary-foreground"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <label
                        htmlFor={`season-${season}`}
                        className="text-sm text-foreground cursor-pointer"
                      >
                        {season.charAt(0).toUpperCase() + season.slice(1)}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="py-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Additional Details
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="mobility"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Mobility Requirements
              </label>
              <textarea
                id="mobility"
                name="mobility"
                placeholder="Any mobility considerations?"
                value={formData.mobility}
                onChange={handleChange}
                className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div>
              <label
                htmlFor="activities"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Must-Have Activities
              </label>
              <textarea
                id="activities"
                name="activities"
                placeholder="What activities would you like?"
                value={formData.activities}
                onChange={handleChange}
                className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
