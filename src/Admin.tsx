import { useEffect, useState } from "react";

type Lead = {
  id: string;
  name: string;
  phone: string;
  message: string;
  createdAt: string;
  status: "new" | "done";
};

export default function Admin() {
  const [login, setLogin] = useState(() => localStorage.getItem("admin_login") || "");
  const [password, setPassword] = useState(() => localStorage.getItem("admin_pwd") || "");
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchLeads(l: string, p: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        headers: {
          "x-admin-login": l,
          "x-admin-password": p,
        },
      });
      if (res.status === 401) {
        setError("Неверный логин или пароль");
        setAuthed(false);
        localStorage.removeItem("admin_login");
        localStorage.removeItem("admin_pwd");
        return;
      }
      const data = await res.json();
      setLeads(data);
      setAuthed(true);
      localStorage.setItem("admin_login", l);
      localStorage.setItem("admin_pwd", p);
    } catch {
      setError("Сервер недоступен");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (login && password) fetchLeads(login, password);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleStatus(lead: Lead) {
    const newStatus = lead.status === "new" ? "done" : "new";
    await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-login": login,
        "x-admin-password": password,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l))
    );
  }

  async function deleteLead(id: string) {
    if (!confirm("Удалить заявку?")) return;
    await fetch(`/api/leads/${id}`, {
      method: "DELETE",
      headers: {
        "x-admin-login": login,
        "x-admin-password": password,
      },
    });
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }

  function logout() {
    localStorage.removeItem("admin_login");
    localStorage.removeItem("admin_pwd");
    setLogin("");
    setPassword("");
    setAuthed(false);
    setLeads([]);
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede8] flex items-center justify-center p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchLeads(login, password);
          }}
          className="w-full max-w-sm border border-[#2a2a2a] p-8"
        >
          <div className="mono text-[#f5e000] font-bold tracking-widest mb-6">
            FIXPC / ВХОД
          </div>

          <label className="mono text-xs tracking-widest uppercase text-[#555] block mb-2">
            Логин
          </label>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="w-full bg-[#111] border border-[#2a2a2a] text-[#f0ede8] px-4 py-3 text-sm focus:outline-none focus:border-[#f5e000] mb-4"
            placeholder="fixpc_admin"
            autoFocus
            autoComplete="username"
          />

          <label className="mono text-xs tracking-widest uppercase text-[#555] block mb-2">
            Пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#111] border border-[#2a2a2a] text-[#f0ede8] px-4 py-3 text-sm focus:outline-none focus:border-[#f5e000] mb-4"
            placeholder="••••••••"
            autoComplete="current-password"
          />

          {error && <div className="text-red-400 text-xs mb-4">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full mono text-sm tracking-widest uppercase bg-[#f5e000] text-[#0a0a0a] py-3 font-bold hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? "Проверка..." : "Войти"}
          </button>
        </form>
      </div>
    );
  }

  const newCount = leads.filter((l) => l.status === "new").length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede8]">
      <header className="border-b border-[#2a2a2a] sticky top-0 bg-[#0a0a0a] z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="mono text-[#f5e000] font-bold tracking-widest text-sm">
            FIXPC / АДМИН
          </div>
          <div className="flex items-center gap-4">
            <span className="mono text-xs text-[#888]">
              Новых: <span style={{ color: "#f5e000" }}>{newCount}</span> / {leads.length}
            </span>
            <button
              onClick={() => fetchLeads(login, password)}
              className="mono text-xs text-[#888] hover:text-[#f0ede8]"
            >
              ⟳ Обновить
            </button>
            <button
              onClick={logout}
              className="mono text-xs text-[#888] hover:text-[#f0ede8]"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {leads.length === 0 ? (
          <div className="text-center py-20 text-[#555]">
            <div className="text-4xl mb-4">📭</div>
            <div className="mono text-sm">Заявок пока нет</div>
          </div>
        ) : (
          <div className="grid gap-px bg-[#2a2a2a]">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className={`bg-[#0a0a0a] p-6 ${
                  lead.status === "done" ? "opacity-50" : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="font-bold text-lg">{lead.name}</div>
                    <a
                      href={`tel:${lead.phone}`}
                      className="mono text-sm text-[#f5e000] hover:underline"
                    >
                      {lead.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`mono text-xs px-2 py-1 border ${
                        lead.status === "new"
                          ? "border-[#f5e000] text-[#f5e000]"
                          : "border-[#2a2a2a] text-[#666]"
                      }`}
                    >
                      {lead.status === "new" ? "НОВАЯ" : "ВЫПОЛНЕНА"}
                    </span>
                    <span className="mono text-xs text-[#555]">
                      {new Date(lead.createdAt).toLocaleString("ru-RU")}
                    </span>
                  </div>
                </div>
                {lead.message && (
                  <p className="text-[#999] text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                    {lead.message}
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => toggleStatus(lead)}
                    className="mono text-xs uppercase tracking-widest border border-[#2a2a2a] px-3 py-2 hover:border-[#f5e000] hover:text-[#f5e000] transition-colors"
                  >
                    {lead.status === "new" ? "✓ Выполнено" : "↺ Вернуть"}
                  </button>
                  <button
                    onClick={() => deleteLead(lead.id)}
                    className="mono text-xs uppercase tracking-widest border border-[#2a2a2a] px-3 py-2 hover:border-red-500 hover:text-red-400 transition-colors"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}