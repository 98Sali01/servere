import { useState } from "react";

const NAV_LINKS = [
  { label: "Услуги", href: "#services" },
  { label: "Как работаем", href: "#process" },
  { label: "Отзывы", href: "#reviews" },
  { label: "Контакты", href: "#contacts" },
];

const PROBLEMS = [
  { icon: "🐢", title: "Компьютер тормозит", desc: "Открытие браузера занимает минуты. Работать невозможно." },
  { icon: "💀", title: "Вирусы и баннеры", desc: "Всплывающая реклама, странные программы, пропажа файлов." },
  { icon: "🔌", title: "Не включается", desc: "Нажимаете кнопку — тишина. Или синий экран смерти." },
  { icon: "🔥", title: "Перегревается", desc: "Ноутбук горячий, вентилятор ревёт, система зависает." },
  { icon: "💾", title: "Сломался жёсткий диск", desc: "Файлы исчезли, Windows не загружается, щелчки из корпуса." },
  { icon: "🌐", title: "Не работает интернет", desc: "Wi-Fi видит сети но не подключается, или пропала сетевая карта." },
];

const SERVICES = [
  { code: "01", name: "Диагностика", price: "Бесплатно", desc: "Полная проверка железа и ПО, выявление причины неисправности." },
  { code: "02", name: "Удаление вирусов", price: "от 800 ₽", desc: "Чистка от вредоносного ПО, настройка антивируса, защита данных." },
  { code: "03", name: "Переустановка ОС", price: "от 1 200 ₽", desc: "Windows 10/11 с нуля, все драйверы, базовые программы." },
  { code: "04", name: "Чистка и смазка", price: "от 600 ₽", desc: "Продувка от пыли, замена термопасты, снижение температуры." },
  { code: "05", name: "Ремонт железа", price: "от 500 ₽", desc: "Замена HDD/SSD, ОЗУ, блока питания, материнской платы." },
  { code: "06", name: "Апгрейд", price: "от 300 ₽", desc: "Подбор и установка нового железа — ускорим ваш ПК или ноутбук." },
  { code: "07", name: "Настройка сети", price: "от 700 ₽", desc: "Wi-Fi, роутер, VPN, сетевые диски, удалённый доступ." },
  { code: "08", name: "Выезд на дом", price: "от 200 ₽", desc: "Приедем в удобное время, отремонтируем без очереди и спешки." },
];

const STEPS = [
  { num: "01", title: "Оставьте заявку", desc: "Заполните форму или позвоните. Отвечаем в течение 15 минут." },
  { num: "02", title: "Диагностика", desc: "Бесплатно определяем причину поломки и называем точную цену." },
  { num: "03", title: "Ремонт", desc: "Большинство работ выполняем в день обращения прямо при вас." },
  { num: "04", title: "Оплата и гарантия", desc: "Платите только за результат. Гарантия на все виды работ — 90 дней." },
];

const ADVANTAGES = [
  { label: "Опыт", value: "8 лет", sub: "в ремонте техники" },
  { label: "Выполнено", value: "2 400+", sub: "ремонтов" },
  { label: "Гарантия", value: "90 дней", sub: "на все работы" },
  { label: "Выезд", value: "за 1 час", sub: "по городу" },
];

const REVIEWS = [
  {
    name: "Алексей К.",
    date: "12 авг 2026",
    text: "Ноутбук не включался — отдал вечером, на следующий день забрал готовый. Заменили разъём питания, всё работает. Цена адекватная, мастер объяснил что и почему.",
    rating: 5,
  },
  {
    name: "Марина Д.",
    date: "3 июл 2026",
    text: "Словила вирус-вымогатель. Приехал мастер, за 2 часа всё почистил, поставил нормальный антивирус и объяснил как не попасться снова. Спасибо!",
    rating: 5,
  },
  {
    name: "Сергей В.",
    date: "19 июн 2026",
    text: "Делали апгрейд старого системника: поставили SSD и добавили ОЗУ. Комп летает теперь. Работы выполнили быстро, стоимость соответствует заявленной.",
    rating: 5,
  },
  {
    name: "Ольга П.",
    date: "2 мая 2026",
    text: "Переустановили Windows, настроили всё с нуля. Теперь система работает без тормозов. Выезд на дом очень удобно — не пришлось никуда тащить компьютер.",
    rating: 5,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ color: "#f5e000" }} className="text-sm">★</span>
      ))}
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSending(true);
    setSendError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Ошибка отправки");
      setSubmitted(true);
    } catch {
      setSendError("Не удалось отправить. Позвоните нам напрямую.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-full bg-[#0a0a0a] text-[#f0ede8]">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2a2a2a] bg-[#0a0a0a]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <a href="#" className="mono text-[#f5e000] font-bold text-sm tracking-widest uppercase">
            FixPC
          </a>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="mono text-xs tracking-widest uppercase text-[#888] hover:text-[#f0ede8] transition-colors"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#form"
              className="mono text-xs tracking-widest uppercase bg-[#f5e000] text-[#0a0a0a] px-4 py-2 font-bold hover:bg-white transition-colors"
            >
              Заявка
            </a>
          </div>
          <button
            className="md:hidden mono text-xs text-[#888] hover:text-[#f0ede8]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕ ЗАКРЫТЬ" : "☰ МЕНЮ"}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-[#2a2a2a] bg-[#0a0a0a] px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="mono text-sm tracking-widest uppercase text-[#888] hover:text-[#f0ede8]"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#form"
              onClick={() => setMenuOpen(false)}
              className="mono text-sm tracking-widest uppercase bg-[#f5e000] text-[#0a0a0a] px-4 py-3 font-bold text-center"
            >
              Оставить заявку
            </a>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative pt-14 min-h-screen flex flex-col">
        <div className="absolute inset-0 pt-14">
          <img
            src="https://images.unsplash.com/photo-1721333089073-215a56fd710c?w=1600&h=900&fit=crop&auto=format"
            alt="Ремонт ноутбука"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
        </div>
        <div className="relative flex-1 max-w-7xl mx-auto px-6 flex flex-col justify-center py-24 lg:py-32">
          <div className="max-w-2xl">
            <div className="mono text-xs tracking-[0.3em] uppercase text-[#f5e000] mb-6">
              — Ремонт компьютеров и ноутбуков
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.0] mb-6 tracking-tight">
              Починим
              <br />
              <span style={{ color: "#f5e000" }}>быстро</span>
              <br />
              и честно
            </h1>
            <p className="text-lg text-[#999] max-w-md leading-relaxed mb-10">
              Диагностика бесплатно. Большинство ремонтов — в день обращения.
              Гарантия 90 дней на все виды работ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#form"
                className="mono text-sm tracking-widest uppercase bg-[#f5e000] text-[#0a0a0a] px-8 py-4 font-bold hover:bg-white transition-colors text-center"
              >
                Оставить заявку
              </a>
              <a
                href="tel:+79001234567"
                className="mono text-sm tracking-widest uppercase border border-[#2a2a2a] text-[#f0ede8] px-8 py-4 hover:border-[#f5e000] hover:text-[#f5e000] transition-colors text-center"
              >
                +7 (900) 123-45-67
              </a>
            </div>
          </div>
        </div>
        {/* stats bar */}
        <div className="relative border-t border-[#2a2a2a] bg-[#111]">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4">
            {ADVANTAGES.map((a, i) => (
              <div
                key={i}
                className="py-6 px-4 border-r border-[#2a2a2a] last:border-r-0"
              >
                <div className="text-2xl font-bold" style={{ color: "#f5e000" }}>{a.value}</div>
                <div className="mono text-xs text-[#666] tracking-wide mt-1">{a.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEMS */}
      <section className="py-24 border-t border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mono text-xs tracking-[0.3em] uppercase text-[#f5e000] mb-4">02 — Узнаёте себя?</div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-16 max-w-xl">
            С этим к нам<br />приходят чаще всего
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#2a2a2a]">
            {PROBLEMS.map((p, i) => (
              <div
                key={i}
                className="bg-[#0a0a0a] p-8 hover:bg-[#111] transition-colors group"
              >
                <div className="text-3xl mb-4">{p.icon}</div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-[#f5e000] transition-colors">{p.title}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 border-t border-[#2a2a2a] bg-[#060606]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mono text-xs tracking-[0.3em] uppercase text-[#f5e000] mb-4">03 — Услуги</div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold">Что мы делаем</h2>
            <p className="text-[#666] max-w-xs text-sm leading-relaxed">
              Все работы с гарантией. Цена фиксируется до начала ремонта.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#2a2a2a]">
            {SERVICES.map((s) => (
              <div
                key={s.code}
                className="bg-[#060606] p-8 hover:bg-[#0e0e0e] transition-colors group flex gap-6"
              >
                <div className="mono text-xs text-[#333] pt-1 w-8 shrink-0">{s.code}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-bold text-lg group-hover:text-[#f5e000] transition-colors">{s.name}</h3>
                    <span className="mono text-sm font-bold text-[#f5e000] whitespace-nowrap">{s.price}</span>
                  </div>
                  <p className="text-[#666] text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="process" className="py-24 border-t border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mono text-xs tracking-[0.3em] uppercase text-[#f5e000] mb-4">04 — Процесс</div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-16">Как это работает</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#2a2a2a]">
            {STEPS.map((s, i) => (
              <div key={i} className="bg-[#0a0a0a] p-8 relative">
                <div
                  className="mono text-5xl font-bold mb-6 leading-none"
                  style={{ color: "#1a1a1a" }}
                >
                  {s.num}
                </div>
                <h3 className="font-bold text-lg mb-3">{s.title}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 mono text-[#333] text-lg">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-24 border-t border-[#2a2a2a] bg-[#060606]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="mono text-xs tracking-[0.3em] uppercase text-[#f5e000] mb-4">05 — Почему мы</div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-8">Без лишних слов</h2>
              <div className="space-y-6">
                {[
                  { t: "Бесплатная диагностика", d: "Никаких скрытых «платы за осмотр». Говорим цену — вы решаете." },
                  { t: "Честная цена", d: "Стоимость фиксируется до начала работ. Не повысим в процессе." },
                  { t: "Ремонт при вас", d: "Можете наблюдать за процессом. Ничего не делаем без вашего согласия." },
                  { t: "Гарантия 90 дней", d: "Если поломка повторится — устраним бесплатно." },
                  { t: "Выезд на дом", d: "Приедем в удобное вам время. Доплата за выезд — от 200 ₽." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-5 h-5 bg-[#f5e000] shrink-0 mt-1 flex items-center justify-center">
                      <span className="text-[#0a0a0a] text-xs font-bold">✓</span>
                    </div>
                    <div>
                      <div className="font-bold mb-1">{item.t}</div>
                      <div className="text-[#666] text-sm leading-relaxed">{item.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&h=800&fit=crop&auto=format"
                alt="Плата компьютера крупным планом"
                className="w-full object-cover"
                style={{ filter: "grayscale(30%) contrast(1.1)" }}
              />
              <div className="absolute inset-0 border border-[#2a2a2a]" />
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="py-24 border-t border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mono text-xs tracking-[0.3em] uppercase text-[#f5e000] mb-4">06 — Отзывы</div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-16">Что говорят клиенты</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#2a2a2a]">
            {REVIEWS.map((r, i) => (
              <div key={i} className="bg-[#0a0a0a] p-8">
                <StarRating count={r.rating} />
                <blockquote className="text-[#ccc] leading-relaxed my-4 text-sm">
                  "{r.text}"
                </blockquote>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{r.name}</span>
                  <span className="mono text-xs text-[#555]">{r.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section id="form" className="py-24 border-t border-[#2a2a2a] bg-[#060606]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <div className="mono text-xs tracking-[0.3em] uppercase text-[#f5e000] mb-4">07 — Заявка</div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Опишите<br />проблему
              </h2>
              <p className="text-[#666] leading-relaxed mb-8">
                Заполните форму — свяжемся в течение 15 минут, ответим на вопросы
                и назначим удобное время.
              </p>
              <div className="space-y-4 text-sm text-[#555]">
                <div className="flex items-center gap-3">
                  <span style={{ color: "#f5e000" }}>→</span>
                  <span>Бесплатная диагностика</span>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ color: "#f5e000" }}>→</span>
                  <span>Ответ за 15 минут</span>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ color: "#f5e000" }}>→</span>
                  <span>Работаем без выходных</span>
                </div>
              </div>
            </div>
            <div>
              {submitted ? (
                <div className="border border-[#f5e000] p-12 flex flex-col items-center justify-center text-center min-h-[320px]">
                  <div className="text-4xl mb-4">✓</div>
                  <h3 className="font-bold text-xl mb-2">Заявка принята!</h3>
                  <p className="text-[#666] text-sm">Свяжемся с вами в течение 15 минут.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mono text-xs tracking-widest uppercase text-[#555] block mb-2">
                      Ваше имя *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Иван Иванов"
                      className="w-full bg-[#111] border border-[#2a2a2a] text-[#f0ede8] px-4 py-3 text-sm focus:outline-none focus:border-[#f5e000] transition-colors placeholder:text-[#333]"
                    />
                  </div>
                  <div>
                    <label className="mono text-xs tracking-widest uppercase text-[#555] block mb-2">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+7 (900) 000-00-00"
                      className="w-full bg-[#111] border border-[#2a2a2a] text-[#f0ede8] px-4 py-3 text-sm focus:outline-none focus:border-[#f5e000] transition-colors placeholder:text-[#333]"
                    />
                  </div>
                  <div>
                    <label className="mono text-xs tracking-widest uppercase text-[#555] block mb-2">
                      Опишите проблему
                    </label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Ноутбук не включается, при нажатии кнопки питания ничего не происходит..."
                      className="w-full bg-[#111] border border-[#2a2a2a] text-[#f0ede8] px-4 py-3 text-sm focus:outline-none focus:border-[#f5e000] transition-colors placeholder:text-[#333] resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full mono text-sm tracking-widest uppercase bg-[#f5e000] text-[#0a0a0a] py-4 font-bold hover:bg-white transition-colors disabled:opacity-50"
                  >
                    {sending ? "Отправка..." : "Отправить заявку"}
                  </button>
                  {sendError && (
                    <p className="text-red-400 text-xs text-center">{sendError}</p>
                  )}
                  <p className="mono text-xs text-[#444] text-center">
                    Нажимая кнопку, вы соглашаетесь на обработку персональных данных
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER / CONTACTS */}
      <footer id="contacts" className="border-t border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="mono text-[#f5e000] font-bold tracking-widest mb-4">FixPC</div>
              <p className="text-[#555] text-sm leading-relaxed">
                Ремонт компьютеров и ноутбуков в вашем городе.
                Работаем без выходных с 9:00 до 21:00.
              </p>
            </div>
            <div>
              <div className="mono text-xs tracking-widest uppercase text-[#444] mb-4">Контакты</div>
              <div className="space-y-3 text-sm">
                <a href="tel:+79001234567" className="flex items-center gap-2 text-[#f0ede8] hover:text-[#f5e000] transition-colors">
                  <span className="text-[#f5e000]">📞</span> +7 (900) 123-45-67
                </a>
                <a href="https://t.me/kompmasterbot" className="flex items-center gap-2 text-[#f0ede8] hover:text-[#f5e000] transition-colors">
                  <span className="text-[#f5e000]">✈</span> Telegram: @kompmaster
                </a>
                <a href="https://wa.me/79001234567" className="flex items-center gap-2 text-[#f0ede8] hover:text-[#f5e000] transition-colors">
                  <span className="text-[#f5e000]">💬</span> WhatsApp
                </a>
                <div className="flex items-center gap-2 text-[#555]">
                  <span>📍</span> г. Москва, выезд по всему городу
                </div>
              </div>
            </div>
            <div>
              <div className="mono text-xs tracking-widest uppercase text-[#444] mb-4">Режим работы</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#555]">Пн–Пт</span>
                  <span>09:00 – 21:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555]">Сб–Вс</span>
                  <span>10:00 – 20:00</span>
                </div>
                <div className="flex justify-between mt-4">
                  <span className="text-[#555]">Срочный выезд</span>
                  <span style={{ color: "#f5e000" }}>24/7</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#1a1a1a] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="mono text-xs text-[#333]">© 2026 FixPC. Все права защищены.</div>
            <div className="mono text-xs text-[#333]">Гарантия качества на все виды работ</div>
          </div>
        </div>
      </footer>
    </div>
  );
}