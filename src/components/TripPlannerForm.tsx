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

export const TripPlannerForm = ({ formData, setFormData }: FormProps) => {
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
    <div className="w-full">
      <div className="max-w-2xl mx-auto">
        {/* Basic Trip Details */}
        <div className="border-b-4 border-gray-900 p-8">
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
              <select
                id="duration"
                name="duration"
                required
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-900 focus:border-blue-600 focus:ring-0 text-lg"
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
        <div className="border-b-4 border-gray-900 p-8">
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
        <div className="border-b-4 border-gray-900 p-8">
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
              <select
                id="budget"
                name="budget"
                required
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-900 focus:border-blue-600 focus:ring-0 text-lg"
              >
                <option value="">Select budget range</option>
                <option value="budget">Budget ($50-150)</option>
                <option value="moderate">Moderate ($150-300)</option>
                <option value="luxury">Luxury ($300+)</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="pace"
                className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2"
              >
                Pace*
              </label>
              <select
                id="pace"
                name="pace"
                required
                value={formData.pace}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-900 focus:border-blue-600 focus:ring-0 text-lg"
              >
                <option value="">Select pace</option>
                <option value="relaxed">Relaxed - Plenty of downtime</option>
                <option value="moderate">Moderate - Balanced activities</option>
                <option value="active">Active - Packed schedule</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="season"
                className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2"
              >
                Season*
              </label>
              <select
                id="season"
                name="season"
                required
                value={formData.season}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-900 focus:border-blue-600 focus:ring-0 text-lg"
              >
                <option value="">Select season</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="fall">Fall</option>
                <option value="winter">Winter</option>
              </select>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="p-8">
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
};
