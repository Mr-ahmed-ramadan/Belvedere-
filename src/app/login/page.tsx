import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { SETTING_KEYS, BUILDING } from "@/lib/constants";
import { HeroCarousel } from "@/components/hero-carousel";
import { LoginForm } from "./login-form";

const FEATURES = [
  "Announcements & meeting minutes",
  "Key documents, house rules & access info",
  "Service-charge budgets & reserve fund",
  "Maintenance projects & decisions",
];

// Google Maps embed pinned to the postcode (no API key needed).
const MAP_SRC = `https://www.google.com/maps?q=${encodeURIComponent(
  `${BUILDING.name}, ${BUILDING.postcode}`,
)}&z=16&output=embed`;

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const s = await getSettings([
    SETTING_KEYS.HERO_IMAGE,
    SETTING_KEYS.CONTACT_EMAIL,
  ]);

  // Carousel images: the board's custom photo first (if set), then the three
  // bundled photos of the building.
  const bundled = [
    "/belvedere-court.jpg",
    "/belvedere-court-2.jpg",
    "/belvedere-court-3.jpg",
  ];
  const custom = s[SETTING_KEYS.HERO_IMAGE];
  const images = custom ? [custom, ...bundled] : bundled;
  const contactEmail = s[SETTING_KEYS.CONTACT_EMAIL] ?? "";

  return (
    <main>
      <div className="grid min-h-screen md:grid-cols-2">
        {/* Hero / landing panel */}
        <section className="relative flex min-h-[60vh] flex-col justify-between overflow-hidden px-6 py-10 text-white sm:px-10 md:min-h-screen">
          <HeroCarousel images={images} />
          {/* Lighter overlay (darker on the left where the text sits) so the
              photos remain clearly visible. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(3,21,41,0.72) 0%, rgba(3,21,41,0.45) 45%, rgba(3,21,41,0.20) 100%)",
            }}
          />

          <div className="hero-text relative z-10">
            <p className="text-sm font-medium uppercase tracking-widest text-sky-200">
              Residents&apos; Portal
            </p>
            <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
              {BUILDING.name}
            </h1>
            <p className="mt-1 text-lg text-sky-100">
              {BUILDING.area} {BUILDING.postcode}
            </p>
          </div>

          <div className="hero-text relative z-10 mt-8 max-w-md">
            <p className="text-base leading-relaxed text-sky-50">
              The private portal for everyone at {BUILDING.name} — a gated
              residential development in the heart of Putney, moments from the
              River Thames, Putney High Street and the green open spaces of
              Putney Heath and Common.
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

          <p className="hero-text relative z-10 mt-8 text-xs text-sky-200">
            A secure portal for residents of {BUILDING.name}. Accounts are
            provided by the management company.
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
      </div>

      {/* Find us + enquiries */}
      <section className="border-t border-gray-200 bg-white px-6 py-12 sm:px-10">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold">Find us</h2>
            <p className="mt-1 text-sm text-gray-600">
              {BUILDING.name}, {BUILDING.area} {BUILDING.postcode}
            </p>
            <div className="mt-4 overflow-hidden rounded border border-gray-200">
              <iframe
                title={`Map of ${BUILDING.name}, ${BUILDING.postcode}`}
                src={MAP_SRC}
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold">Enquiries</h2>
            <p className="mt-1 text-sm text-gray-600">
              Interested in the building, buying or renting here, or need to
              reach the management company? Get in touch.
            </p>
            {contactEmail ? (
              <a
                href={`mailto:${contactEmail}?subject=${encodeURIComponent(
                  `${BUILDING.name} enquiry`,
                )}`}
                className="btn btn-primary mt-4"
              >
                Email the management company
              </a>
            ) : (
              <p className="mt-4 text-sm text-gray-500">
                A contact email has not been set yet. The board can add one in
                Settings.
              </p>
            )}
            {contactEmail ? (
              <p className="mt-2 text-sm text-gray-500">{contactEmail}</p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
