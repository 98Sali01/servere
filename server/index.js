import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";

// --- Конфигурация ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "data", "leads.json");
const REVIEWS_FILE = path.join(__dirname, "data", "reviews.json");

const ADMIN_LOGIN = process.env.ADMIN_LOGIN || "fixpc_admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Fx!PC_2026#Adm1n";
const PORT = process.env.PORT || 3001;

// --- Хранилище заявок (JSON-файл) ---
function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf-8");
}

function readLeads() {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Ошибка чтения leads.json:", err.message);
    return [];
  }
}

function writeLeads(leads) {
  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2), "utf-8");
  } catch (err) {
    console.error("Ошибка записи leads.json:", err.message);
  }
}

function ensureReviewsFile() {
  const dir = path.dirname(REVIEWS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(REVIEWS_FILE)) fs.writeFileSync(REVIEWS_FILE, "[]", "utf-8");
}

function readReviews() {
  try {
    ensureReviewsFile();
    const raw = fs.readFileSync(REVIEWS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Ошибка чтения reviews.json:", err.message);
    return [];
  }
}

function writeReviews(reviews) {
  try {
    ensureReviewsFile();
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf-8");
  } catch (err) {
    console.error("Ошибка записи reviews.json:", err.message);
  }
}

// --- Приложение ---
const app = express();
app.use(cors());
app.use(express.json({ limit: "100kb" }));

// Простой rate limit — не больше 10 заявок с одного IP в минуту
const rateLimitMap = new Map();
function rateLimit(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const windowMs = 60_000;
  const max = 10;

  const entry = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > windowMs) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  rateLimitMap.set(ip, entry);

  if (entry.count > max) {
    return res.status(429).json({ error: "Слишком много заявок. Попробуйте позже." });
  }
  next();
}

// Проверка логина и пароля для админских эндпоинтов
function checkAuth(req, res, next) {
  const login = req.headers["x-admin-login"];
  const pwd = req.headers["x-admin-password"];
  if (login !== ADMIN_LOGIN || pwd !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Неверный логин или пароль" });
  }
  next();
}

// --- API ---

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "fixpc", time: new Date().toISOString() });
});

// Приём заявки с формы сайта
app.post("/api/leads", rateLimit, (req, res) => {
  const { name, phone, message } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({ error: "Имя и телефон обязательны" });
  }

  const lead = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: String(name).trim().slice(0, 100),
    phone: String(phone).trim().slice(0, 30),
    message: String(message || "").trim().slice(0, 2000),
    createdAt: new Date().toISOString(),
    status: "new",
  };

  const leads = readLeads();
  leads.unshift(lead);
  writeLeads(leads);

  console.log(`[LEAD] ${lead.createdAt} — ${lead.name} (${lead.phone})`);
  broadcastLead(lead);      
  res.json({ ok: true, id: lead.id });
});

// Список заявок для админки
app.get("/api/leads", checkAuth, (_req, res) => {
  res.json(readLeads());
});

// Изменить статус заявки: new ↔ done
app.patch("/api/leads/:id", checkAuth, (req, res) => {
  const { status } = req.body || {};
  if (!["new", "done"].includes(status)) {
    return res.status(400).json({ error: "status должен быть 'new' или 'done'" });
  }

  const leads = readLeads();
  const lead = leads.find((l) => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: "Заявка не найдена" });

  lead.status = status;
  writeLeads(leads);
  res.json(lead);
});

// Удалить заявку
app.delete("/api/leads/:id", checkAuth, (req, res) => {
  const leads = readLeads();
  const filtered = leads.filter((l) => l.id !== req.params.id);
  if (filtered.length === leads.length) {
    return res.status(404).json({ error: "Заявка не найдена" });
  }
  writeLeads(filtered);
  res.json({ ok: true });
});

// === ОТЗЫВЫ ===

// Публичный список — только опубликованные отзывы
app.get("/api/reviews", (_req, res) => {
  const reviews = readReviews().filter((r) => r.status === "published");
  res.json(reviews);
});

// Все отзывы — только для админки
app.get("/api/reviews/all", checkAuth, (_req, res) => {
  res.json(readReviews());
});

// Создать новый отзыв (публично, с модерацией)
app.post("/api/reviews", rateLimit, (req, res) => {
  const { name, text, rating } = req.body || {};

  if (!name || !text) {
    return res.status(400).json({ error: "Имя и текст обязательны" });
  }

  const numRating = Math.min(5, Math.max(1, Number(rating) || 5));

  const review = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: String(name).trim().slice(0, 100),
    text: String(text).trim().slice(0, 2000),
    rating: numRating,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  const reviews = readReviews();
  reviews.unshift(review);
  writeReviews(reviews);

  console.log(`[REVIEW] ${review.createdAt} — ${review.name} (${review.rating}★)`);
  broadcastReview(review);
  res.json({ ok: true, id: review.id });
});

// Изменить статус отзыва (опубликовать / снять)
app.patch("/api/reviews/:id", checkAuth, (req, res) => {
  const { status } = req.body || {};
  if (!["pending", "published"].includes(status)) {
    return res.status(400).json({ error: "status должен быть 'pending' или 'published'" });
  }

  const reviews = readReviews();
  const review = reviews.find((r) => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: "Отзыв не найден" });

  review.status = status;
  writeReviews(reviews);
  res.json(review);
});

// Удалить отзыв
app.delete("/api/reviews/:id", checkAuth, (req, res) => {
  const reviews = readReviews();
  const filtered = reviews.filter((r) => r.id !== req.params.id);
  if (filtered.length === reviews.length) {
    return res.status(404).json({ error: "Отзыв не найден" });
  }
  writeReviews(filtered);
  res.json({ ok: true });
});

// --- Раздача статики фронта (собранный Vite) ---
const DIST_DIR = path.join(__dirname, "..", "dist");
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  // SPA fallback: все прочие пути отдают index.html
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
} else {
  console.warn("⚠ Папка dist/ не найдена — фронт не будет раздаваться");
}

// ─── WebSocket сервер ───
const wss = new WebSocketServer({ noServer: true });

function broadcastLead(lead) {
  const message = JSON.stringify({ type: "new_lead", lead });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
  console.log(`[WS] Разослано ${wss.clients.size} клиентам`);
}

function broadcastReview(review) {
  const message = JSON.stringify({ type: "new_review", review });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
  console.log(`[WS] Отзыв разослан ${wss.clients.size} клиентам`);
}

// --- Запуск ---
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("─────────────────────────────────────");
  console.log(`✅ FixPC server работает на http://0.0.0.0:${PORT}`);
  console.log(`   WebSocket:      ws://0.0.0.0:${PORT}/ws`);
  console.log(`   Логин админки:  ${ADMIN_LOGIN}`);
  console.log(`   Пароль админки: ${ADMIN_PASSWORD}`);
  console.log(`   Файл заявок:    ${DATA_FILE}`);
  console.log("─────────────────────────────────────");
});

// Подключаем WebSocket к тому же HTTP-серверу
server.on("upgrade", (req, socket, head) => {
  if (req.url === "/ws") {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
      console.log(`[WS] Новый клиент подключён (всего: ${wss.clients.size})`);
      ws.on("close", () => {
        console.log(`[WS] Клиент отключён (всего: ${wss.clients.size})`);
      });
    });
  } else {
    socket.destroy();
  }
});