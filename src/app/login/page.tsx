import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getSetting } from "@/lib/settings";
import { SETTING_KEYS } from "@/lib/constants";
import { LoginForm } from "./login-form";

const FEATURES = [
  "Announcements & meeting minutes",
  "Key documents, house rules & access info",
  "Service-charge budgets & reserve fund",
  "Maintenance projects & decisions",
];

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const heroImage = await getSetting(SETTING_KEYS.HERO_IMAGE);

  return (
    <main className="grid min-h-screen md:grid-cols-2">
      {/* Hero / landing panel */}
      <section
        className="relative flex flex-col justify-between overflow-hidden px-6 py-10 text-white sm:px-10"
        style={
          heroImage
            ? {
                backgroundImage: `linear-gradient(to bottom right, rgba(12,74,110,0.82), rgba(15,23,42,0.82)), url(${heroImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                backgroundImage:
                  "linear-gradient(to bottom right, #0c4a6e, #0f766e, #0f172a)",
              }
        }
      >
        {!heroImage ? <BuildingBackdrop /> : null}

        <div className="relative z-10">
          <p className="text-sm font-medium uppercase tracking-widest text-sky-200">
            Residents&apos; Portal
          </p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Belvedere Court</h1>
          <p className="mt-1 text-lg text-sky-100">Putney, London SW15</p>
        </div>

        <div className="relative z-10 mt-8 max-w-md">
          <p className="text-base leading-relaxed text-sky-50">
            The private portal for everyone at Belvedere Court — a gated
            residential development in the heart of Putney, moments from the
            River Thames, Putney High Street and the green open spaces of Putney
            Heath and Common.
          </p>
          <p className="mt-4 text-base leading-relaxed text-sky-50">
            Residents, leaseholders, the board and the managing team use it to
            stay up to date with everything happening in the building.
          </p>
          <ul className="mt-6 space-y-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sky-50">
                <span aria-hidden className="mt-0.5 text-sky-300">
                  ✓
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 mt-8 text-xs text-sky-200">
          A secure portal for residents of Belvedere Court. Accounts are provided
          by the management company.
        </p>
      </section>

      {/* Sign-in panel */}
      <section className="flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="mb-1 text-2xl font-bold">Sign in</h2>
          <p className="mb-6 text-sm text-gray-600">
            Welcome back. Enter your details to continue.
          </p>
          <LoginForm />
          <p className="mt-6 text-center text-xs text-gray-500">
            No account yet? Ask a director or the secretary to invite you.
          </p>
        </div>
      </section>
    </main>
  );
}

/** Decorative building skyline used when no real photo is set. */
function BuildingBackdrop() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 300"
      className="pointer-events-none absolute bottom-0 right-0 h-2/3 w-auto opacity-20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="#ffffff">
        <rect x="40" y="120" width="70" height="180" />
        <rect x="120" y="70" width="90" height="230" />
        <rect x="220" y="110" width="70" height="190" />
        <rect x="300" y="60" width="70" height="240" />
      </g>
      {/* windows */}
      <g fill="#0c4a6e">
        {[0, 1, 2, 3, 4].map((r) =>
          [0, 1].map((c) => (
            <rect
              key={`a${r}-${c}`}
              x={130 + c * 35}
              y={90 + r * 40}
              width="18"
              height="24"
            />
          )),
        )}
        {[0, 1, 2, 3, 4, 5].map((r) =>
          [0, 1].map((c) => (
            <rect
              key={`b${r}-${c}`}
              x={310 + c * 30}
              y={80 + r * 35}
              width="16"
              height="22"
            />
          )),
        )}
      </g>
    </svg>
  );
}
