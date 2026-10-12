const WHATSAPP_GREEN = "border-green-600 bg-green-600 text-white hover:bg-green-700";

export function ChatGroups({
  residentsUrl,
  boardUrl,
  isAdmin,
}: {
  residentsUrl?: string | null;
  boardUrl?: string | null;
  isAdmin: boolean;
}) {
  const showBoard = isAdmin && boardUrl;
  if (!residentsUrl && !showBoard) return null;

  return (
    <section className="card">
      <h2 className="mb-1 text-lg font-semibold">WhatsApp groups</h2>
      <p className="mb-3 text-sm text-gray-600">
        Join the building&apos;s WhatsApp chat to keep in touch day to day.
      </p>
      <div className="flex flex-wrap gap-2">
        {residentsUrl ? (
          <a
            href={residentsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn ${WHATSAPP_GREEN}`}
          >
            Join residents group
          </a>
        ) : null}
        {showBoard ? (
          <a
            href={boardUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn ${WHATSAPP_GREEN}`}
          >
            Join board group
          </a>
        ) : null}
      </div>
    </section>
  );
}
