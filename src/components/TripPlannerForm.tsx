"use client";
// Form.tsx
import React, { FormEvent } from "react";

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
  handleSubmit?: (e: FormEvent) => void;
}

export const TripPlannerForm = ({
  formData,
  setFormData,
  handleSubmit = () => {},
}: FormProps) => {
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex items-center justify-center bg-gray-50">
      <div className="aspect-square">
        <form
          onSubmit={handleSubmit}
          className="h-full grid grid-cols-2 grid-rows-2 gap-4"
        >
          {/* Basic Trip Details */}
          <div className="bg-white rounded-lg shadow-md p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Basic Trip Details
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="destination"
                  className="block text-sm font-medium text-gray-700"
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
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700"
                >
                  Trip Duration*
                </label>
                <select
                  id="duration"
                  name="duration"
                  required
                  value={formData.duration}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select duration</option>
                  {[2, 3, 4, 5, 6, 7, 10, 14].map((days) => (
                    <option key={days} value={days}>
                      {days} days
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Travel Group */}
          <div className="bg-white rounded-lg shadow-md p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Travel Group
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="numChildren"
                  className="block text-sm font-medium text-gray-700"
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
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="childrenAges"
                  className="block text-sm font-medium text-gray-700"
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
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-lg shadow-md p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Trip Preferences
            </h2>
            <div className="space-y-4">
              {/* Budget, Pace, and Season selects remain the same but with adjusted spacing */}
              <div>
                <label
                  htmlFor="budget"
                  className="block text-sm font-medium text-gray-700"
                >
                  Budget*
                </label>
                <select
                  id="budget"
                  name="budget"
                  required
                  value={formData.budget}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select budget range</option>
                  <option value="budget">Budget ($50-150)</option>
                  <option value="moderate">Moderate ($150-300)</option>
                  <option value="luxury">Luxury ($300+)</option>
                </select>
              </div>
              {/* Add other preference fields with similar styling */}
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow-md p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Additional Details
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="mobility"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mobility Requirements
                </label>
                <textarea
                  id="mobility"
                  name="mobility"
                  placeholder="Any mobility considerations?"
                  value={formData.mobility}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20"
                />
              </div>
              <div>
                <label
                  htmlFor="activities"
                  className="block text-sm font-medium text-gray-700"
                >
                  Must-Have Activities
                </label>
                <textarea
                  id="activities"
                  name="activities"
                  placeholder="What activities would you like?"
                  value={formData.activities}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
