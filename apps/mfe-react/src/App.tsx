import type { ReactNode } from 'react';
import {
  MemoryRouter,
  NavLink,
  Route,
  Routes,
} from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Home from './pages/Home';
import { COMPONENTS } from './registry';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563eb' },
    background: { default: 'transparent' },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
});

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-lg px-3 py-1.5 text-sm font-medium transition',
    isActive
      ? 'bg-slate-900 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ');

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full w-full">
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <span className="mr-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
          React MFE
        </span>
        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          {COMPONENTS.map((c) => (
            <NavLink key={c.path} to={c.path} className={linkClass}>
              {c.label}
            </NavLink>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}

// This micro-frontend is a self-contained mini-app: its own router (in-memory,
// so it never fights the shell's URL) and many components under one remote.
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme={false} />
      <MemoryRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            {COMPONENTS.map((c) => (
              <Route key={c.path} path={c.path} element={c.element} />
            ))}
          </Routes>
        </Layout>
      </MemoryRouter>
    </ThemeProvider>
  );
}
