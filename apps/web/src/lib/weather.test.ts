import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchTripWeather } from "./weather";

// Deliberately not the example trip's city: the client should ask wherever
// the caller points it, with no destination of its own.
let LISBON = { latitude: 38.7223, longitude: -9.1393 };

/* The forecast is best-effort: a day with no live data carries no weather
   rather than an invented one, and no failure mode is allowed to take the
   landing page down with it. These pin both halves — the request we send and
   the shapes we survive. */

let fetchMock = vi.fn();

/** An Open-Meteo daily payload for the given (date, hi, lo, code) rows. */
function daily(rows: [string, number, number, number][]) {
  return {
    ok: true,
    json: async () => ({
      daily: {
        time: rows.map((r) => r[0]),
        temperature_2m_max: rows.map((r) => r[1]),
        temperature_2m_min: rows.map((r) => r[2]),
        weather_code: rows.map((r) => r[3]),
      },
    }),
  };
}

function requestedUrl(): URL {
  return new URL(fetchMock.mock.calls[0][0]);
}

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchTripWeather", () => {
  it("asks for nothing when there are no dates", async () => {
    expect(await fetchTripWeather([], LISBON)).toEqual({});
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("asks Open-Meteo for the range the trip spans, in Fahrenheit", async () => {
    fetchMock.mockResolvedValue(daily([]));
    await fetchTripWeather(["2027-04-11", "2027-04-09", "2027-04-13"], LISBON);

    let url = requestedUrl();
    expect(url.origin + url.pathname).toBe("https://api.open-meteo.com/v1/forecast");
    expect(url.searchParams.get("start_date")).toBe("2027-04-09");
    expect(url.searchParams.get("end_date")).toBe("2027-04-13");
    expect(url.searchParams.get("temperature_unit")).toBe("fahrenheit");
    expect(url.searchParams.get("daily")).toBe(
      "temperature_2m_max,temperature_2m_min,weather_code",
    );
  });

  it("asks at the coordinates it is given, not a built-in city", async () => {
    fetchMock.mockResolvedValue(daily([]));
    await fetchTripWeather(["2027-04-09"], LISBON);

    let url = requestedUrl();
    expect(url.searchParams.get("latitude")).toBe("38.7223");
    expect(url.searchParams.get("longitude")).toBe("-9.1393");
  });

  it("collapses duplicate and empty dates before asking", async () => {
    fetchMock.mockResolvedValue(daily([]));
    await fetchTripWeather(["2027-04-10", "2027-04-10", "", "2027-04-09"], LISBON);

    expect(requestedUrl().searchParams.get("start_date")).toBe("2027-04-09");
    expect(requestedUrl().searchParams.get("end_date")).toBe("2027-04-10");
  });

  it("revalidates hourly rather than on every render", async () => {
    fetchMock.mockResolvedValue(daily([]));
    await fetchTripWeather(["2027-04-09"], LISBON);
    expect(fetchMock.mock.calls[0][1]).toEqual({ next: { revalidate: 3600 } });
  });

  it("keys each day's forecast by its iso date and rounds the temperatures", async () => {
    fetchMock.mockResolvedValue(
      daily([
        ["2027-04-09", 61.4, 47.6, 2],
        ["2027-04-10", 58.5, 44.2, 61],
      ]),
    );

    expect(await fetchTripWeather(["2027-04-09", "2027-04-10"], LISBON)).toEqual({
      "2027-04-09": { sky: "partly", summary: "Partly cloudy", hi: 61, lo: 48 },
      "2027-04-10": { sky: "rain", summary: "Rain", hi: 59, lo: 44 },
    });
  });

  it("maps every WMO code band to an icon and a label", async () => {
    let bands: [number, string, string][] = [
      [0, "sunny", "Clear"],
      [1, "sunny", "Mostly sunny"],
      [2, "partly", "Partly cloudy"],
      [3, "cloudy", "Overcast"],
      [45, "cloudy", "Fog"],
      [48, "cloudy", "Fog"],
      [53, "rain", "Drizzle"],
      [63, "rain", "Rain"],
      [73, "cloudy", "Snow"],
      [81, "rain", "Showers"],
      [86, "cloudy", "Snow showers"],
      [95, "storms", "Thunderstorms"],
      [99, "storms", "Thunderstorms"],
      [4, "cloudy", "—"], // unmapped codes degrade rather than throw
    ];
    let dates = bands.map((_, i) => `2027-04-${String(i + 1).padStart(2, "0")}`);
    fetchMock.mockResolvedValue(
      daily(bands.map(([code], i) => [dates[i], 60, 40, code] as [string, number, number, number])),
    );

    let out = await fetchTripWeather(dates, LISBON);
    for (let [i, [, sky, summary]] of bands.entries()) {
      expect(out[dates[i]], `code ${bands[i][0]}`).toMatchObject({ sky, summary });
    }
  });

  it("drops days the forecast has no numbers for", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        daily: {
          time: ["2027-04-09", "2027-04-10"],
          temperature_2m_max: [61, null],
          temperature_2m_min: [47, 44],
          weather_code: [2, 3],
        },
      }),
    });

    let out = await fetchTripWeather(["2027-04-09", "2027-04-10"], LISBON);
    expect(Object.keys(out)).toEqual(["2027-04-09"]);
  });

  it("returns nothing when the service refuses", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 429, json: async () => ({}) });
    expect(await fetchTripWeather(["2027-04-09"], LISBON)).toEqual({});
  });

  it("returns nothing when the payload is missing its daily block", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ error: true }) });
    expect(await fetchTripWeather(["2027-04-09"], LISBON)).toEqual({});
  });

  it("returns nothing when the network is down", async () => {
    fetchMock.mockRejectedValue(new Error("ENOTFOUND"));
    expect(await fetchTripWeather(["2027-04-09"], LISBON)).toEqual({});
  });
});
