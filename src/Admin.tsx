import { useEffect, useState } from "react";

type Lead = {
  id: string;
  name: string;
  phone: string;
  message: string;
  createdAt: string;
  status: "new" | "done";
};
type Review = {
  id: string;
  name: string;
  text: string;
  rating: number;
  createdAt: string;
  status: "pending" | "published";
};

export default function Admin() {
  const [login, setLogin] = useState(() => localStorage.getItem("admin_login") || "");
  const [password, setPassword] = useState(() => localStorage.getItem("admin_pwd") || "");
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"leads" | "reviews">("leads");
  const [reviews, setReviews] = useState<any[]>([]);

    async function fetchAll(l: string, p: string) {
    setLoading(true);
    setError("");
    try {
      const [leadsRes, reviewsRes] = await Promise.all([
        fetch("/api/leads", { headers: { "x-admin-login": l, "x-admin-password": p } }),
        fetch("/api/reviews/all", { headers: { "x-admin-login": l, "x-admin-password": p } }),
      ]);
      if (leadsRes.status === 401 || reviewsRes.status === 401) {
        setError("Неверный логин или пароль");
        setAuthed(false);
        localStorage.removeItem("admin_login");
        localStorage.removeItem("admin_pwd");
        return;
      }
      setLeads(await leadsRes.json());
      setReviews(await reviewsRes.json());
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
    if (login && password) fetchAll(login, password);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // WebSocket — live-обновления
  useEffect(() => {
  if (!authed) return;

  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let isCleaningUp = false;

  const connect = () => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    ws = new WebSocket(`${protocol}://${window.location.host}/ws`);

    ws.onopen = () => {
      console.log("[WS] Подключён");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_lead") {
          setLeads((prev) => [data.lead, ...prev]);
          console.log("[WS] Новая заявка:", data.lead.name);
        }
        if (data.type === "new_review") {
          setReviews((prev) => [data.review, ...prev]);
          console.log("[WS] Новый отзыв:", data.review.name);
        }
      } catch (e) {
        console.warn("[WS] Ошибка парсинга:", e);
      }
    };

    ws.onerror = (e) => {
      console.warn("[WS] Ошибка:", e);
    };

    ws.onclose = () => {
      console.log("[WS] Соединение закрыто");
      if (!isCleaningUp) {
        console.log("[WS] Переподключение через 3с...");
        reconnectTimer = setTimeout(connect, 3000);
      }
    };
  };

  connect();

  return () => {
    isCleaningUp = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    ws?.close();
  };
}, [authed]);

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
  
  async function toggleReviewStatus(review: Review) {
    const newStatus = review.status === "pending" ? "published" : "pending";
    await fetch(`/api/reviews/${review.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-login": login,
        "x-admin-password": password,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, status: newStatus } : r))
    );
  }

  async function deleteReview(id: string) {
    if (!confirm("Удалить отзыв навсегда?")) return;
    await fetch(`/api/reviews/${id}`, {
      method: "DELETE",
      headers: {
        "x-admin-login": login,
        "x-admin-password": password,
      },
    });
    setReviews((prev) => prev.filter((r) => r.id !== id));
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
            fetchAll(login, password);
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
              onClick={() => fetchAll(login, password)}
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
        {/* Вкладки */}
        <div className="flex gap-px bg-[#2a2a2a] mb-8 w-fit">
          <button
            onClick={() => setTab("leads")}
            className={`mono text-xs uppercase tracking-widest px-6 py-3 transition-colors ${
              tab === "leads"
                ? "bg-[#f5e000] text-[#0a0a0a] font-bold"
                : "bg-[#0a0a0a] text-[#888] hover:text-[#f0ede8]"
            }`}
          >
            Заявки ({leads.filter((l) => l.status === "new").length})
          </button>
          <button
            onClick={() => setTab("reviews")}
            className={`mono text-xs uppercase tracking-widest px-6 py-3 transition-colors ${
              tab === "reviews"
                ? "bg-[#f5e000] text-[#0a0a0a] font-bold"
                : "bg-[#0a0a0a] text-[#888] hover:text-[#f0ede8]"
            }`}
          >
            Отзывы ({reviews.filter((r) => r.status === "pending").length})
          </button>
        </div>

        {/* ЗАЯВКИ */}
        {tab === "leads" && (
          <>
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
          </>
        )}

        {/* ОТЗЫВЫ */}
        {tab === "reviews" && (
          <>
            {reviews.length === 0 ? (
              <div className="text-center py-20 text-[#555]">
                <div className="text-4xl mb-4">💬</div>
                <div className="mono text-sm">Отзывов пока нет</div>
              </div>
            ) : (
              <div className="grid gap-px bg-[#2a2a2a]">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className={`bg-[#0a0a0a] p-6 ${
                      review.status === "published" ? "" : "opacity-60"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="font-bold text-lg">{review.name}</div>
                        <div className="flex gap-0.5 mt-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <span key={i} className="text-[#f5e000] text-sm">★</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`mono text-xs px-2 py-1 border ${
                            review.status === "published"
                              ? "border-[#f5e000] text-[#f5e000]"
                              : "border-[#666] text-[#666]"
                          }`}
                        >
                          {review.status === "published" ? "ОПУБЛИКОВАН" : "НА МОДЕРАЦИИ"}
                        </span>
                        <span className="mono text-xs text-[#555]">
                          {new Date(review.createdAt).toLocaleString("ru-RU")}
                        </span>
                      </div>
                    </div>
                    <p className="text-[#999] text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                      {review.text}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => toggleReviewStatus(review)}
                        className="mono text-xs uppercase tracking-widest border border-[#2a2a2a] px-3 py-2 hover:border-[#f5e000] hover:text-[#f5e000] transition-colors"
                      >
                        {review.status === "pending" ? "✓ Опубликовать" : "↺ Снять"}
                      </button>
                      <button
                        onClick={() => deleteReview(review.id)}
                        className="mono text-xs uppercase tracking-widest border border-[#2a2a2a] px-3 py-2 hover:border-red-500 hover:text-red-400 transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}