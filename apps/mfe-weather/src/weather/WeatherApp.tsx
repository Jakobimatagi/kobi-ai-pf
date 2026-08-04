import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  CssBaseline,
  Stack,
  TextField,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import { geocode, getForecast, type Forecast, type GeoResult } from './api';
import { weatherMeta } from './wmo';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563eb' },
    background: { default: 'transparent' },
  },
  shape: { borderRadius: 16 },
  typography: { fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif' },
});

const QUICK_CITIES = ['London', 'Tokyo', 'New York', 'Cape Town', 'Sydney'];

function dayName(date: string, index: number): string {
  if (index === 0) return 'Today';
  return new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' });
}

export default function WeatherApp() {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<GeoResult[]>([]);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCity = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await geocode(name);
      if (results.length === 0) {
        setError(`No location found for “${name}”.`);
        return;
      }
      const data = await getForecast(results[0]);
      setForecast(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Load a default city on first mount.
  useEffect(() => {
    void loadCity('London');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced geocoding for the autocomplete suggestions.
  useEffect(() => {
    if (query.trim().length < 2) {
      setOptions([]);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        setOptions(await geocode(query));
      } catch {
        /* ignore suggestion errors */
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  const current = forecast?.current;
  const meta = useMemo(
    () => (current ? weatherMeta(current.code) : null),
    [current],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme={false} />
      <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Weather Forecast</h2>
          <p className="text-sm text-slate-500">
            Live data from Open-Meteo · React micro-frontend
          </p>
        </div>

        <Autocomplete<GeoResult, false, false, true>
          freeSolo
          options={options}
          filterOptions={(x) => x}
          getOptionLabel={(o) =>
            typeof o === 'string' ? o : [o.name, o.admin1, o.country].filter(Boolean).join(', ')
          }
          onInputChange={(_, value) => setQuery(value)}
          onChange={(_, value) => {
            if (value && typeof value !== 'string') void getForecast(value).then(setForecast);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search a city"
              placeholder="e.g. Berlin"
              variant="outlined"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) void loadCity(query.trim());
              }}
            />
          )}
        />

        <Stack direction="row" spacing={1} className="mt-3 flex-wrap gap-y-2">
          {QUICK_CITIES.map((city) => (
            <Chip
              key={city}
              label={city}
              onClick={() => void loadCity(city)}
              variant="outlined"
              color="primary"
            />
          ))}
        </Stack>

        {error && (
          <Alert severity="warning" className="mt-4">
            {error}
          </Alert>
        )}

        {loading && (
          <div className="mt-10 flex justify-center">
            <CircularProgress />
          </div>
        )}

        {!loading && forecast && current && meta && (
          <div className="mt-6">
            <Card
              elevation={0}
              className="overflow-hidden border-0 text-white"
              sx={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                color: '#fff',
              }}
            >
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-white">
                      {forecast.place}
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-5xl font-bold">
                        {current.temperature}
                        {forecast.units.temperature}
                      </span>
                    </div>
                    <p className="mt-1 text-white/90">{meta.label}</p>
                  </div>
                  <div className="text-7xl leading-none">{meta.icon}</div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/20 pt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <ThermostatIcon fontSize="small" />
                    <span>Feels {current.apparent}{forecast.units.temperature}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AirIcon fontSize="small" />
                    <span>{current.windSpeed} {forecast.units.wind}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <WaterDropIcon fontSize="small" />
                    <span>{current.humidity}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {forecast.daily.map((day, i) => {
                const dm = weatherMeta(day.code);
                return (
                  <div
                    key={day.date}
                    className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white/70 p-3 text-center shadow-sm"
                  >
                    <span className="text-xs font-medium text-slate-500">
                      {dayName(day.date, i)}
                    </span>
                    <span className="my-1 text-2xl">{dm.icon}</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {day.tempMax}°
                    </span>
                    <span className="text-xs text-slate-400">{day.tempMin}°</span>
                    <span className="mt-1 text-[11px] text-sky-600">
                      💧 {day.precipitationProbability}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
