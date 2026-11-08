import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

// Reusable style strings, so the JSX below stays readable
const field =
  "w-full bg-white border-2 border-ink rounded-md p-3 outline-none focus:shadow-hard transition-shadow";
const btnPrimary =
  "bg-highlight text-ink font-bold border-2 border-ink rounded-md px-5 py-2.5 shadow-hard active:translate-x-0.5 active:translate-y-0.5 active:shadow-none";
const btnGhost =
  "bg-white text-ink font-semibold border-2 border-ink rounded-md px-5 py-2.5 hover:bg-paper";

// Wraps the part of the text that matches the search in a yellow highlight
function Highlight({ text, term }) {
  if (!term) return text;
  const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${safe})`, "gi"));
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="bg-highlight text-ink rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      const data = await api("/notes");
      setNotes(data);
    } catch (err) {
      if (
        err.message === "Not logged in" ||
        err.message === "Invalid or expired token"
      ) {
        navigate("/login");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api(`/notes/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({ title, content }),
        });
      } else {
        await api("/notes", {
          method: "POST",
          body: JSON.stringify({ title, content }),
        });
      }
      resetForm();
      loadNotes();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this note?")) return;
    try {
      await api(`/notes/${id}`, { method: "DELETE" });
      loadNotes();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(note) {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setContent("");
  }

  async function handleLogout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // Login already expired, nothing to clear
    } finally {
      navigate("/login");
    }
  }

  const term = search.trim();

  const visibleNotes = useMemo(() => {
    const lower = term.toLowerCase();

    const filtered = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(lower) ||
        (n.content || "").toLowerCase().includes(lower)
    );

    return [...filtered].sort((a, b) => {
      if (sortBy === "oldest")
        return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === "az") return a.title.localeCompare(b.title);
      if (sortBy === "za") return b.title.localeCompare(a.title);
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [notes, term, sortBy]);

  return (
    <div className="min-h-screen font-sans">
      <header className="bg-white border-b-2 border-ink">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Private notes
            </h1>
            <p className="text-sm text-ink/70">Only you can read these.</p>
          </div>
          <button onClick={handleLogout} className={btnGhost}>
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white border-2 border-ink rounded-md shadow-hard p-6 space-y-4"
        >
          <h2 className="text-xl font-bold">
            {editingId ? "Edit note" : "New note"}
          </h2>

          {error && (
            <p className="bg-white text-danger font-semibold text-sm p-3 rounded-md border-2 border-danger">
              {error}
            </p>
          )}

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={field}
          />

          <textarea
            placeholder="Write your note"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className={`${field} font-serif`}
          />

          <div className="flex gap-3">
            <button type="submit" className={btnPrimary}>
              {editingId ? "Save changes" : "Add note"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className={btnGhost}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search titles and text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${field} flex-1`}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border-2 border-ink rounded-md p-3 font-semibold outline-none focus:shadow-hard"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="az">Title A to Z</option>
            <option value="za">Title Z to A</option>
          </select>
        </div>

        {!loading && notes.length > 0 && (
          <p className="text-sm font-semibold text-ink/70">
            {visibleNotes.length} of {notes.length}{" "}
            {notes.length === 1 ? "note" : "notes"}
          </p>
        )}

        <section className="grid gap-6 sm:grid-cols-2">
          {loading && <p className="text-ink/70">Loading your notes...</p>}

          {!loading && notes.length === 0 && (
            <p className="sm:col-span-2 text-center py-12 bg-white border-2 border-dashed border-ink rounded-md">
              Nothing here yet. Write your first note above.
            </p>
          )}

          {!loading && notes.length > 0 && visibleNotes.length === 0 && (
            <p className="sm:col-span-2 text-center py-12 bg-white border-2 border-dashed border-ink rounded-md">
              No notes match that search. Try a different word.
            </p>
          )}

          {visibleNotes.map((note) => (
            <article
              key={note.id}
              className="bg-white border-2 border-ink rounded-md shadow-hard p-5 flex flex-col"
            >
              <h3 className="text-xl font-bold leading-snug">
                <Highlight text={note.title} term={term} />
              </h3>
              {note.content && (
                <p className="font-serif text-[17px] leading-relaxed mt-2 whitespace-pre-wrap line-clamp-5">
                  <Highlight text={note.content} term={term} />
                </p>
              )}
              <p className="text-xs font-semibold text-ink/60 mt-auto pt-4">
                {new Date(note.created_at).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <div className="flex gap-3 mt-3 pt-3 border-t-2 border-ink/10 text-sm font-bold">
                <button
                  onClick={() => startEdit(note)}
                  className="underline underline-offset-4 decoration-2 hover:bg-highlight"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-danger underline underline-offset-4 decoration-2 hover:bg-danger hover:text-white"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}