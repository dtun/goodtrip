import { Sun, CloudSun, Cloud, CloudRain, CloudLightning } from "lucide-react";
import type { Weather } from "@/lib/trip";

const SKY_ICON = {
  sunny: Sun,
  partly: CloudSun,
  cloudy: Cloud,
  rain: CloudRain,
  storms: CloudLightning,
} as const;

/** Icon for a day's forecast; inherits color and size from the caller. */
export function WeatherIcon({ sky, className }: { sky: Weather["sky"]; className?: string }) {
  const Icon = SKY_ICON[sky];
  return <Icon className={className} aria-hidden="true" />;
}

/** One-line label: "88° / 72° · PM storms" for screen readers and text rows. */
export function weatherLabel(w: Weather) {
  return `${w.hi}° / ${w.lo}° · ${w.summary}`;
}
