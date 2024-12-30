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
        <div className="py-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase">
            Basic Trip Details
          </h2>
          <div className="space-y-6">
            <div>
              <label
                htmlFor="destination"
                className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2"
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
                className="w-full px-4 py-3 border-2 border-gray-900 focus:border-blue-600 focus:ring-0 text-lg"
              />
            </div>
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2"
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
                        w-5 h-5 border-2 border-gray-900 mr-2
                        ${
                          formData.duration === days.toString()
                            ? "bg-gray-900"
                            : "bg-white"
                        }
                        flex items-center justify-center
                      `}
                      >
                        {formData.duration === days.toString() && (
                          <svg
                            className="w-3 h-3 text-white"
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
                        className="cursor-pointer"
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
        <div className="py-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase">
            Travel Group
          </h2>
          <div className="space-y-6">
            <div>
              <label
                htmlFor="numChildren"
                className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2"
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
                className="w-full px-4 py-3 border-2 border-gray-900 focus:border-blue-600 focus:ring-0 text-lg"
              />
            </div>
            <div>
              <label
                htmlFor="childrenAges"
                className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2"
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
                className="w-full px-4 py-3 border-2 border-gray-900 focus:border-blue-600 focus:ring-0 text-lg"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="py-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase">
            Trip Preferences
          </h2>
          <div className="space-y-6">
            <div>
              <label
                htmlFor="budget"
                className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2"
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
                        w-5 h-5 border-2 border-gray-900 mr-2
                        ${
                          formData.budget === option.value
                            ? "bg-gray-900"
                            : "bg-white"
                        }
                        flex items-center justify-center
                      `}
                      >
                        {formData.budget === option.value && (
                          <svg
                            className="w-3 h-3 text-white"
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
                        className="cursor-pointer"
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
                className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2"
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
                        w-5 h-5 border-2 border-gray-900 mr-2
                        ${
                          formData.pace === option.value
                            ? "bg-gray-900"
                            : "bg-white"
                        }
                        flex items-center justify-center
                      `}
                      >
                        {formData.pace === option.value && (
                          <svg
                            className="w-3 h-3 text-white"
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
                        className="cursor-pointer"
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
                className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2"
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
                        w-5 h-5 border-2 border-gray-900 mr-2
                        ${
                          formData.season === season
                            ? "bg-gray-900"
                            : "bg-white"
                        }
                        flex items-center justify-center
                      `}
                      >
                        {formData.season === season && (
                          <svg
                            className="w-3 h-3 text-white"
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
                        className="cursor-pointer"
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
        <div className="py-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase">
            Additional Details
          </h2>
          <div className="space-y-6">
            <div>
              <label
                htmlFor="mobility"
                className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2"
              >
                Mobility Requirements
              </label>
              <textarea
                id="mobility"
                name="mobility"
                placeholder="Any mobility considerations?"
                value={formData.mobility}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-900 focus:border-blue-600 focus:ring-0 text-lg h-24"
              />
            </div>
            <div>
              <label
                htmlFor="activities"
                className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2"
              >
                Must-Have Activities
              </label>
              <textarea
                id="activities"
                name="activities"
                placeholder="What activities would you like?"
                value={formData.activities}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-900 focus:border-blue-600 focus:ring-0 text-lg h-24"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
