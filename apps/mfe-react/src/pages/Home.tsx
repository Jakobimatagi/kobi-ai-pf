import { Link } from 'react-router-dom';
import { COMPONENTS } from '../registry';

export default function Home() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800">React components</h2>
      <p className="mt-1 text-sm text-slate-500">
        Components built in the React micro-frontend. More on the way.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {COMPONENTS.map((c) => (
          <Link
            key={c.path}
            to={c.path}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="text-3xl">{c.emoji}</div>
            <h3 className="mt-3 font-semibold text-slate-800">{c.label}</h3>
            <p className="mt-1 text-sm text-slate-500">{c.description}</p>
            <span className="mt-3 inline-block text-sm font-semibold text-sky-600 group-hover:underline">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
