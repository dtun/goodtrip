import { type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconArrowUp } from "@/components/ui/icons";

export function TripPlannerForm({
  handleSubmit,
}: {
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      className="w-full max-w-xl mx-auto"
      id="tripPlannerForm"
      onSubmit={handleSubmit}
      role="form"
    >
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
                <div className="space-y-2 px-2">
                  {[2, 3, 4, 5, 6, 7, 10, 14].map((days) => (
                    <div key={days} className="flex items-center">
                      <input
                        type="radio"
                        id={`duration-${days}`}
                        name="duration"
                        value={days}
                        className="w-4 h-4 rounded-sm border border-input mr-2 accent-foreground"
                      />
                      <label
                        htmlFor={`duration-${days}`}
                        className="text-sm text-foreground cursor-pointer"
                      >
                        {days} days
                      </label>
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
                <div className="space-y-2 px-2">
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
                        className="w-4 h-4 rounded-sm border border-input mr-2 accent-foreground"
                      />
                      <label
                        htmlFor={`budget-${option.value}`}
                        className="text-sm text-foreground cursor-pointer"
                      >
                        {option.label}
                      </label>
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
                <div className="space-y-2 px-2">
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
                        className="w-4 h-4 rounded-sm border border-input mr-2 accent-foreground"
                      />
                      <label
                        htmlFor={`pace-${option.value}`}
                        className="text-sm text-foreground cursor-pointer"
                      >
                        {option.label}
                      </label>
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
                <div className="space-y-2 px-2">
                  {["spring", "summer", "fall", "winter"].map((season) => (
                    <div key={season} className="flex items-center">
                      <input
                        type="radio"
                        id={`season-${season}`}
                        name="season"
                        value={season}
                        className="w-4 h-4 rounded-sm border border-input mr-2 accent-foreground"
                      />
                      <label
                        htmlFor={`season-${season}`}
                        className="text-sm text-foreground cursor-pointer"
                      >
                        {season.charAt(0).toUpperCase() + season.slice(1)}
                      </label>
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
                  className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex">
        <Input
          id="additionalInfo"
          name="additionalInfo"
          type="text"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mr-2"
          placeholder={`Anything else?`}
        />
        <Button type="submit">
          <IconArrowUp />
        </Button>
      </div>
    </form>
  );
}
