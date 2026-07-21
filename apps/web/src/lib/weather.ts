// Live weather for the trip. Fetched server-side from Open-Meteo (a free,
// key-less forecast API) and keyed by ISO date so each itinerary day can look
// up its real forecast. There is no hard-coded fallback: if the fetch fails or
// a date falls outside the forecast horizon, that day carries no weather.

import type { Weather, WeatherByDate } from "./trip";

// Washington, D.C. (National Mall).
const DC = { latitude: 38.8895, longitude: -77.0353 } as const;

/**
 * Map a WMO weather code (Open-Meteo's `weather_code`) to our icon + label.
 * Codes: https://open-meteo.com/en/docs#weathervariables
 */
function fromWmoCode(code: number): Pick<Weather, "sky" | "summary"> {
  if (code === 0) return { sky: "sunny", summary: "Clear" };
  if (code === 1) return { sky: "sunny", summary: "Mostly sunny" };
  if (code === 2) return { sky: "partly", summary: "Partly cloudy" };
  if (code === 3) return { sky: "cloudy", summary: "Overcast" };
  if (code === 45 || code === 48) return { sky: "cloudy", summary: "Fog" };
  if (code >= 51 && code <= 57) return { sky: "rain", summary: "Drizzle" };
  if (code >= 61 && code <= 67) return { sky: "rain", summary: "Rain" };
  if (code >= 71 && code <= 77) return { sky: "cloudy", summary: "Snow" };
  if (code >= 80 && code <= 82) return { sky: "rain", summary: "Showers" };
  if (code === 85 || code === 86) return { sky: "cloudy", summary: "Snow showers" };
  if (code >= 95) return { sky: "storms", summary: "Thunderstorms" };
  return { sky: "cloudy", summary: "—" };
}

type OpenMeteoDaily = {
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    weather_code?: number[];
  };
};

/**
 * Fetch the real forecast for the given ISO dates (YYYY-MM-DD) in D.C.
 * Returns a map keyed by date; dates with no data are simply absent. Never
 * throws — on any failure it returns an empty map so the UI omits weather
 * rather than showing something invented.
 */
export async function fetchTripWeather(isoDates: string[]): Promise<WeatherByDate> {
  const dates = Array.from(new Set(isoDates)).filter(Boolean).sort();
  if (dates.length === 0) return {};

  const params = new URLSearchParams({
    latitude: String(DC.latitude),
    longitude: String(DC.longitude),
    daily: "temperature_2m_max,temperature_2m_min,weather_code",
    temperature_unit: "fahrenheit",
    timezone: "America/New_York",
    start_date: dates[0],
    end_date: dates[dates.length - 1],
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  try {
    // Revalidate hourly: forecasts move, but not by the minute.
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return {};
    const json = (await res.json()) as OpenMeteoDaily;
    const d = json.daily;
    if (!d?.time || !d.temperature_2m_max || !d.temperature_2m_min || !d.weather_code) {
      return {};
    }

    const out: WeatherByDate = {};
    for (let i = 0; i < d.time.length; i++) {
      const hi = d.temperature_2m_max[i];
      const lo = d.temperature_2m_min[i];
      const code = d.weather_code[i];
      if (hi == null || lo == null || code == null) continue;
      out[d.time[i]] = { ...fromWmoCode(code), hi: Math.round(hi), lo: Math.round(lo) };
    }
    return out;
  } catch {
    return {};
  }
}
