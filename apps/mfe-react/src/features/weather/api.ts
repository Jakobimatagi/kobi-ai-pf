// Open-Meteo — free, no API key required.
// Geocoding: https://geocoding-api.open-meteo.com
// Forecast:  https://api.open-meteo.com

export interface GeoResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface DailyForecast {
  date: string;
  code: number;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
}

export interface Forecast {
  place: string;
  current: {
    temperature: number;
    apparent: number;
    code: number;
    windSpeed: number;
    humidity: number;
    isDay: boolean;
  };
  units: { temperature: string; wind: string };
  daily: DailyForecast[];
}

export async function geocode(query: string): Promise<GeoResult[]> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', query);
  url.searchParams.set('count', '5');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const data = await res.json();
  return (data.results ?? []) as GeoResult[];
}

export async function getForecast(place: GeoResult): Promise<Forecast> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(place.latitude));
  url.searchParams.set('longitude', String(place.longitude));
  url.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,is_day',
  );
  url.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
  );
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Forecast failed (${res.status})`);
  const data = await res.json();

  const label = [place.name, place.admin1, place.country].filter(Boolean).join(', ');

  return {
    place: label,
    current: {
      temperature: Math.round(data.current.temperature_2m),
      apparent: Math.round(data.current.apparent_temperature),
      code: data.current.weather_code,
      windSpeed: Math.round(data.current.wind_speed_10m),
      humidity: data.current.relative_humidity_2m,
      isDay: data.current.is_day === 1,
    },
    units: {
      temperature: data.current_units.temperature_2m,
      wind: data.current_units.wind_speed_10m,
    },
    daily: data.daily.time.map((date: string, i: number) => ({
      date,
      code: data.daily.weather_code[i],
      tempMax: Math.round(data.daily.temperature_2m_max[i]),
      tempMin: Math.round(data.daily.temperature_2m_min[i]),
      precipitationProbability: data.daily.precipitation_probability_max[i] ?? 0,
    })),
  };
}
