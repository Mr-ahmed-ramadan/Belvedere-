export function SearchBox({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form method="get" action="/search" className="flex gap-2">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search announcements, meetings, decisions, documents, projects…"
        className="input"
      />
      <button type="submit" className="btn btn-primary">
        Search
      </button>
    </form>
  );
}
