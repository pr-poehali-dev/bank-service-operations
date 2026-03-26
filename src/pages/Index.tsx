/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ───────────────────────────────────────────────────────────────────
type Role = "employee" | "client";
type Section =
  | "dashboard"
  | "cash-out"
  | "cash-in"
  | "history"
  | "analytics"
  | "clients"
  | "credit"
  | "queue"
  | "terminal"
  | "accounts";

interface User {
  name: string;
  role: Role;
  id: string;
  department?: string;
  balance?: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_TRANSACTIONS = [
  { id: "TXN-00421", type: "cash-out", amount: 150000, client: "Иванов А.В.", account: "40817810****1234", date: "26.03.2026 14:32", status: "ok", operator: "Петрова М.С." },
  { id: "TXN-00420", type: "cash-in", amount: 75000, client: "Смирнова Е.К.", account: "40817810****5678", date: "26.03.2026 13:55", status: "ok", operator: "Петрова М.С." },
  { id: "TXN-00419", type: "transfer", amount: 320000, client: "ООО «Техпром»", account: "40702810****9012", date: "26.03.2026 11:20", status: "ok", operator: "Козлов Д.Р." },
  { id: "TXN-00418", type: "cash-out", amount: 50000, client: "Новиков П.И.", account: "40817810****3456", date: "26.03.2026 10:45", status: "ok", operator: "Петрова М.С." },
  { id: "TXN-00417", type: "credit", amount: 500000, client: "Федорова О.Л.", account: "42301810****7890", date: "25.03.2026 16:30", status: "pending", operator: "Захаров В.Н." },
  { id: "TXN-00416", type: "cash-in", amount: 200000, client: "ИП Соколов Б.Р.", account: "40802810****2345", date: "25.03.2026 15:10", status: "ok", operator: "Козлов Д.Р." },
  { id: "TXN-00415", type: "cash-out", amount: 30000, client: "Морозов С.Т.", account: "40817810****6789", date: "25.03.2026 12:05", status: "error", operator: "Петрова М.С." },
];

const MOCK_CLIENTS = [
  { id: "CLT-001", name: "Иванов Алексей Викторович", phone: "+7 900 123-45-67", account: "40817810****1234", balance: 1250000, status: "vip", credit: true },
  { id: "CLT-002", name: "Смирнова Екатерина Константиновна", phone: "+7 911 234-56-78", account: "40817810****5678", balance: 87500, status: "active", credit: false },
  { id: "CLT-003", name: "ООО «Техпром»", phone: "+7 495 987-65-43", account: "40702810****9012", balance: 5620000, status: "corporate", credit: false },
  { id: "CLT-004", name: "Новиков Пётр Иванович", phone: "+7 922 345-67-89", account: "40817810****3456", balance: 325000, status: "active", credit: true },
  { id: "CLT-005", name: "Федорова Ольга Леонидовна", phone: "+7 903 456-78-90", account: "42301810****7890", balance: 12000, status: "active", credit: true },
];

const MOCK_QUEUE = [
  { ticket: "А-001", name: "Петров Михаил", service: "Выдача наличных", wait: "3 мин", status: "current" },
  { ticket: "А-002", name: "Кузнецова Анна", service: "Взнос наличных", wait: "8 мин", status: "waiting" },
  { ticket: "А-003", name: "Орлов Денис", service: "Открытие счёта", wait: "14 мин", status: "waiting" },
  { ticket: "Б-001", name: "ООО «Альфа»", service: "Корпоративный счёт", wait: "20 мин", status: "waiting" },
  { ticket: "А-004", name: "Соловьёва Ирина", service: "Кредит", wait: "25 мин", status: "waiting" },
];

const MOCK_ACCOUNTS = [
  { id: "40817810****1234", owner: "Иванов А.В.", type: "Текущий", currency: "RUB", balance: 1250000, opened: "12.01.2021", status: "active" },
  { id: "40817810****5678", owner: "Смирнова Е.К.", type: "Сберегательный", currency: "RUB", balance: 87500, opened: "08.06.2022", status: "active" },
  { id: "40702810****9012", owner: "ООО «Техпром»", type: "Расчётный", currency: "RUB", balance: 5620000, opened: "03.03.2019", status: "active" },
  { id: "40817810****3456", owner: "Новиков П.И.", type: "Текущий", currency: "RUB", balance: 325000, opened: "22.11.2023", status: "active" },
  { id: "42301810****7890", owner: "Федорова О.Л.", type: "Кредитный", currency: "RUB", balance: -120000, opened: "15.07.2024", status: "credit" },
];

// ─── Helper Components ────────────────────────────────────────────────────────
const TxTypeBadge = ({ type }: { type: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    "cash-out": { label: "Выдача", cls: "badge-amber" },
    "cash-in": { label: "Взнос", cls: "badge-green" },
    "transfer": { label: "Перевод", cls: "badge-cyan" },
    "credit": { label: "Кредит", cls: "badge-red" },
  };
  const cfg = map[type] || { label: type, cls: "badge-cyan" };
  return <span className={cfg.cls}>{cfg.label}</span>;
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    ok: { label: "Выполнено", cls: "badge-green" },
    pending: { label: "Ожидание", cls: "badge-amber" },
    error: { label: "Ошибка", cls: "badge-red" },
    active: { label: "Активен", cls: "badge-green" },
    vip: { label: "VIP", cls: "badge-cyan" },
    corporate: { label: "Корпорат.", cls: "badge-amber" },
    credit: { label: "Кредитный", cls: "badge-red" },
  };
  const cfg = map[status] || { label: status, cls: "badge-cyan" };
  return <span className={cfg.cls}>{cfg.label}</span>;
};

const formatMoney = (v: number) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(v);

// ─── Auth Screen ──────────────────────────────────────────────────────────────
const AuthScreen = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [step, setStep] = useState<"login" | "2fa">("login");
  const [role, setRole] = useState<Role>("employee");
  const [login, setLogin] = useState("");
  const [pass, setPass] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const EMPLOYEES: Record<string, { password: string; user: User }> = {
    "EMP-0042": { password: "petrov2024", user: { name: "Петрова Мария Сергеевна", role: "employee", id: "EMP-0042", department: "Кассовые операции" } },
    "TIMA34":   { password: "2014",       user: { name: "Тимофеев Артём", role: "employee", id: "TIMA34", department: "Старший операционист" } },
  };

  const [loginError, setLoginError] = useState("");

  const handleLogin = () => {
    if (role === "employee") {
      const found = EMPLOYEES[login.trim()];
      if (!found || found.password !== pass) {
        setLoginError("Неверный логин или пароль");
        return;
      }
    }
    setLoginError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("2fa"); }, 1200);
  };

  const handle2FA = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (role === "employee") {
        onLogin(EMPLOYEES[login.trim()].user);
      } else {
        onLogin({ name: "Иванов Алексей Викторович", role: "client", id: "CLT-001", balance: 1250000 });
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative grid-pattern">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5" style={{ background: "radial-gradient(circle, hsl(185 100% 50%), transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-5" style={{ background: "radial-gradient(circle, hsl(200 100% 50%), transparent 70%)" }} />
      </div>

      <div className="w-full max-w-md mx-4 animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 relative" style={{ background: "linear-gradient(135deg, hsl(185 100% 50% / 0.15), hsl(185 100% 50% / 0.05))", border: "1px solid hsl(185 100% 50% / 0.3)" }}>
            <Icon name="Landmark" size={28} className="text-cyan-400" />
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: "0 0 6px hsl(142 70% 45%)" }} />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">АБС Банк</h1>
          <p className="text-xs mt-1" style={{ color: "hsl(215 20% 50%)" }}>Автоматизированная банковская система</p>
        </div>

        <div className="bank-card glow-cyan">
          {step === "login" ? (
            <>
              <div className="section-title mb-5">Вход в систему</div>

              <div className="flex rounded-lg p-1 mb-5" style={{ background: "hsl(220 20% 6%)" }}>
                {(["employee", "client"] as Role[]).map((r) => (
                  <button key={r} onClick={() => setRole(r)}
                    className="flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200"
                    style={role === r
                      ? { background: "hsl(185 100% 50%)", color: "hsl(220 20% 6%)" }
                      : { color: "hsl(215 20% 50%)" }}>
                    {r === "employee" ? "Сотрудник" : "Клиент"}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: "hsl(215 20% 55%)" }}>
                    {role === "employee" ? "Табельный номер / Логин" : "Номер счёта / ИНН"}
                  </label>
                  <input className="input-bank" placeholder={role === "employee" ? "EMP-0042" : "40817810****1234"}
                    value={login} onChange={e => setLogin(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: "hsl(215 20% 55%)" }}>Пароль</label>
                  <input type="password" className="input-bank" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} />
                </div>
                {loginError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: "hsl(0 84% 60% / 0.1)", border: "1px solid hsl(0 84% 60% / 0.3)" }}>
                    <Icon name="AlertCircle" size={14} className="text-red-400 shrink-0" />
                    <span className="text-xs" style={{ color: "hsl(0 84% 70%)" }}>{loginError}</span>
                  </div>
                )}
                <button className="btn-primary w-full flex items-center justify-center gap-2 mt-2" onClick={handleLogin} disabled={loading}>
                  {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="LogIn" size={16} />}
                  {loading ? "Проверка..." : "Войти"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="section-title mb-5">Двухфакторная аутентификация</div>
              <div className="flex items-center gap-3 p-3 rounded-lg mb-5" style={{ background: "hsl(185 100% 50% / 0.06)", border: "1px solid hsl(185 100% 50% / 0.15)" }}>
                <Icon name="Shield" size={20} className="text-cyan-400 shrink-0" />
                <p className="text-sm" style={{ color: "hsl(215 20% 65%)" }}>Код отправлен на номер <span className="text-white font-medium">+7 *** ***-**-42</span></p>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "hsl(215 20% 55%)" }}>Код подтверждения</label>
                <input className="input-bank text-center text-2xl tracking-[0.5em] font-mono" placeholder="------"
                  maxLength={6} value={code} onChange={e => setCode(e.target.value)} />
              </div>
              <button className="btn-primary w-full flex items-center justify-center gap-2 mt-4" onClick={handle2FA} disabled={loading}>
                {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="ShieldCheck" size={16} />}
                {loading ? "Верификация..." : "Подтвердить"}
              </button>
              <button className="w-full text-center text-xs mt-3 transition-colors" style={{ color: "hsl(215 20% 45%)" }} onClick={() => setStep("login")}>
                ← Назад
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "hsl(215 20% 35%)" }}>
          АБС v4.2.1 · Защищено по стандарту PCI DSS
        </p>
      </div>
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const EMPLOYEE_NAV = [
  { id: "dashboard", label: "Главная", icon: "LayoutDashboard" },
  { id: "cash-out", label: "Выдача наличных", icon: "ArrowUpFromLine" },
  { id: "cash-in", label: "Взнос наличных", icon: "ArrowDownToLine" },
  { id: "history", label: "История операций", icon: "History" },
  { id: "analytics", label: "Аналитика", icon: "BarChart3" },
  { id: "clients", label: "Клиентская база", icon: "Users" },
  { id: "credit", label: "Кредиты и рассрочка", icon: "CreditCard" },
  { id: "queue", label: "Электронная очередь", icon: "ListOrdered" },
  { id: "terminal", label: "Терминал Сбер", icon: "Wifi" },
  { id: "accounts", label: "Учёт счетов", icon: "BookOpen" },
];

const CLIENT_NAV = [
  { id: "dashboard", label: "Личный кабинет", icon: "LayoutDashboard" },
  { id: "cash-out", label: "Снять наличные", icon: "ArrowUpFromLine" },
  { id: "cash-in", label: "Пополнить счёт", icon: "ArrowDownToLine" },
  { id: "history", label: "История операций", icon: "History" },
  { id: "credit", label: "Мои кредиты", icon: "CreditCard" },
  { id: "accounts", label: "Мои счета", icon: "BookOpen" },
];

const Sidebar = ({ user, active, onNav, onLogout }: { user: User; active: Section; onNav: (s: Section) => void; onLogout: () => void }) => {
  const nav = user.role === "employee" ? EMPLOYEE_NAV : CLIENT_NAV;
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen sticky top-0" style={{ background: "hsl(220 22% 7%)", borderRight: "1px solid hsl(220 15% 12%)" }}>
      <div className="p-5 border-b" style={{ borderColor: "hsl(220 15% 12%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(185 100% 50% / 0.12)", border: "1px solid hsl(185 100% 50% / 0.25)" }}>
            <Icon name="Landmark" size={18} className="text-cyan-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">АБС Банк</div>
            <div className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>v4.2.1</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-b" style={{ borderColor: "hsl(220 15% 12%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "hsl(185 100% 50% / 0.15)", color: "hsl(185 100% 50%)" }}>
            {user.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-white truncate">{user.name.split(" ").slice(0, 2).join(" ")}</div>
            <div className="text-xs truncate" style={{ color: "hsl(215 20% 45%)" }}>
              {user.role === "employee" ? user.department : `ID: ${user.id}`}
            </div>
          </div>
          <div className="pulse-dot shrink-0 ml-auto" />
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
        <div className="section-title px-3 py-2 mb-1">Навигация</div>
        {nav.map(item => (
          <div key={item.id} className={`nav-item ${active === item.id ? "active" : ""}`} onClick={() => onNav(item.id as Section)}>
            <Icon name={item.icon as any} size={16} />
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: "hsl(220 15% 12%)" }}>
        <div className="nav-item" onClick={onLogout}>
          <Icon name="LogOut" size={16} />
          <span>Выйти из системы</span>
        </div>
      </div>
    </aside>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = ({ user }: { user: User }) => {
  const isEmployee = user.role === "employee";
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold text-white">
          {isEmployee ? "Рабочий день · 26 марта 2026" : "Добро пожаловать"}
        </h2>
        <p className="text-sm mt-1" style={{ color: "hsl(215 20% 50%)" }}>
          {isEmployee ? `Оператор: ${user.name}` : user.name}
        </p>
      </div>

      {isEmployee ? (
        <>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Операций сегодня", value: "47", icon: "Activity", delta: "+12%" },
              { label: "Выдано наличных", value: "₽ 2.4M", icon: "ArrowUpFromLine", delta: "+8%" },
              { label: "Принято наличных", value: "₽ 1.8M", icon: "ArrowDownToLine", delta: "+3%" },
              { label: "В очереди", value: "5", icon: "ListOrdered", delta: "сейчас" },
            ].map(s => (
              <div key={s.label} className="bank-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(185 100% 50% / 0.1)" }}>
                    <Icon name={s.icon as any} size={16} className="text-cyan-400" />
                  </div>
                  <span className="badge-green text-xs">{s.delta}</span>
                </div>
                <div className="stat-value text-xl">{s.value}</div>
                <div className="text-xs mt-1" style={{ color: "hsl(215 20% 45%)" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bank-card">
              <div className="section-title mb-4">Последние операции</div>
              <div className="space-y-3">
                {MOCK_TRANSACTIONS.slice(0, 4).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: "hsl(220 15% 13%)" }}>
                    <div className="flex items-center gap-3">
                      <TxTypeBadge type={tx.type} />
                      <div>
                        <div className="text-sm font-medium text-white">{tx.client}</div>
                        <div className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>{tx.id}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-medium text-white">{formatMoney(tx.amount)}</div>
                      <StatusBadge status={tx.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bank-card">
              <div className="section-title mb-4">Статус очереди</div>
              <div className="space-y-2">
                {MOCK_QUEUE.slice(0, 4).map(q => (
                  <div key={q.ticket} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: q.status === "current" ? "hsl(185 100% 50% / 0.08)" : "hsl(220 15% 8%)", border: q.status === "current" ? "1px solid hsl(185 100% 50% / 0.2)" : "1px solid transparent" }}>
                    <div className="font-mono text-xs font-bold w-12" style={{ color: q.status === "current" ? "hsl(185 100% 50%)" : "hsl(215 20% 50%)" }}>{q.ticket}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{q.name}</div>
                      <div className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>{q.service}</div>
                    </div>
                    {q.status === "current" ? <div className="pulse-dot" /> : <span className="text-xs" style={{ color: "hsl(215 20% 40%)" }}>{q.wait}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="bank-card" style={{ background: "linear-gradient(135deg, hsl(185 100% 50% / 0.08) 0%, hsl(220 18% 8%) 100%)" }}>
            <div className="section-title mb-2">Основной счёт</div>
            <div className="text-4xl font-mono font-semibold text-white mt-1">{formatMoney(user.balance || 0)}</div>
            <div className="text-xs mt-2" style={{ color: "hsl(215 20% 50%)" }}>40817810 **** 1234 · Текущий</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Операций за месяц", value: "18", icon: "Activity" },
              { label: "Последний взнос", value: "₽ 75 000", icon: "ArrowDownToLine" },
              { label: "Активных счетов", value: "2", icon: "BookOpen" },
            ].map(s => (
              <div key={s.label} className="bank-card text-center">
                <Icon name={s.icon as any} size={20} className="text-cyan-400 mx-auto mb-2" />
                <div className="stat-value text-lg">{s.value}</div>
                <div className="text-xs mt-1" style={{ color: "hsl(215 20% 45%)" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div className="bank-card">
            <div className="section-title mb-4">Последние операции</div>
            <div className="space-y-3">
              {MOCK_TRANSACTIONS.slice(0, 4).map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: "hsl(220 15% 13%)" }}>
                  <div className="flex items-center gap-3">
                    <TxTypeBadge type={tx.type} />
                    <div className="text-sm text-white">{tx.date}</div>
                  </div>
                  <div className="font-mono text-sm font-medium text-white">{formatMoney(tx.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Cash Operation Form ───────────────────────────────────────────────────────
const CashOperationForm = ({ type, userRole }: { type: "out" | "in"; userRole: Role }) => {
  const [step, setStep] = useState<"search" | "verify" | "amount" | "confirm" | "done">("search");
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const isOut = type === "out";

  const title = isOut ? "Выдача наличных" : "Взнос наличных";
  const icon = isOut ? "ArrowUpFromLine" : "ArrowDownToLine";
  const color = isOut ? "hsl(38 92% 50%)" : "hsl(142 70% 45%)";

  const steps = ["Поиск клиента", "Верификация", "Сумма", "Подтверждение"];

  const handleNext = () => {
    if (step === "search") setStep("verify");
    else if (step === "verify") setStep("amount");
    else if (step === "amount") setStep("confirm");
    else if (step === "confirm") setStep("done");
  };

  if (step === "done") {
    return (
      <div className="animate-scale-in flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "hsl(142 70% 45% / 0.15)", border: "2px solid hsl(142 70% 45% / 0.4)" }}>
          <Icon name="CheckCircle2" size={40} className="text-green-400" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-2">Операция выполнена</h3>
        <p className="text-sm mb-2" style={{ color: "hsl(215 20% 50%)" }}>
          {isOut ? "Выдано" : "Принято"}: <span className="text-white font-mono font-semibold">{formatMoney(Number(amount))}</span>
        </p>
        <p className="font-mono text-xs mb-8" style={{ color: "hsl(215 20% 40%)" }}>TXN-00{Math.floor(Math.random() * 900 + 100)} · {new Date().toLocaleString("ru-RU")}</p>
        <div className="flex gap-3">
          <button className="btn-outline" onClick={() => { setStep("search"); setClientId(""); setAmount(""); setVerifyCode(""); setComment(""); }}>
            Новая операция
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Icon name="Printer" size={14} />
            Печать чека
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
          <Icon name={icon as any} size={20} style={{ color }} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="text-xs" style={{ color: "hsl(215 20% 50%)" }}>{userRole === "employee" ? "Кассовая операция" : "Самообслуживание"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {steps.map((s, i) => {
          const idx = ["search", "verify", "amount", "confirm"].indexOf(step);
          const done = i < idx;
          const curr = i === idx;
          return (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: done ? "hsl(142 70% 45% / 0.2)" : curr ? `${color}20` : "hsl(220 15% 12%)", color: done ? "hsl(142 70% 55%)" : curr ? color : "hsl(215 20% 40%)", border: `1px solid ${done ? "hsl(142 70% 45% / 0.4)" : curr ? `${color}50` : "transparent"}` }}>
                  {done ? "✓" : i + 1}
                </div>
                <span className="text-xs hidden sm:block" style={{ color: curr ? "hsl(215 20% 70%)" : "hsl(215 20% 40%)" }}>{s}</span>
              </div>
              {i < steps.length - 1 && <div className="flex-1 h-px" style={{ background: done ? "hsl(142 70% 45% / 0.3)" : "hsl(220 15% 14%)" }} />}
            </div>
          );
        })}
      </div>

      <div className="bank-card max-w-lg">
        {step === "search" && (
          <div className="space-y-4">
            <div className="section-title mb-4">Поиск клиента</div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "hsl(215 20% 55%)" }}>Номер счёта / ФИО / ИНН</label>
              <input className="input-bank" placeholder="40817810... или Иванов А.В." value={clientId} onChange={e => setClientId(e.target.value)} />
            </div>
            {clientId.length > 2 && (
              <div className="animate-fade-in p-3 rounded-lg cursor-pointer" style={{ background: "hsl(185 100% 50% / 0.06)", border: "1px solid hsl(185 100% 50% / 0.2)" }} onClick={() => setClientId("Иванов Алексей Викторович · 40817810****1234")}>
                <div className="text-sm font-medium text-white">Иванов Алексей Викторович</div>
                <div className="text-xs mt-0.5" style={{ color: "hsl(215 20% 50%)" }}>40817810 **** 1234 · Баланс: {formatMoney(1250000)}</div>
              </div>
            )}
            <button className="btn-primary w-full" onClick={handleNext} disabled={!clientId}>
              Найти клиента
            </button>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <div className="section-title mb-4">Верификация личности</div>
            <div className="p-3 rounded-lg" style={{ background: "hsl(220 15% 8%)" }}>
              <div className="text-sm font-medium text-white">Иванов Алексей Викторович</div>
              <div className="text-xs mt-0.5" style={{ color: "hsl(215 20% 50%)" }}>40817810 **** 1234 · <span className="badge-green">VIP</span></div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "hsl(215 20% 55%)" }}>Документ, удостоверяющий личность</label>
              <input className="input-bank" placeholder="Серия и номер паспорта" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "hsl(215 20% 55%)" }}>SMS-код подтверждения</label>
              <input className="input-bank font-mono tracking-widest text-center text-lg" placeholder="------" maxLength={6}
                value={verifyCode} onChange={e => setVerifyCode(e.target.value)} />
              <p className="text-xs mt-1" style={{ color: "hsl(215 20% 40%)" }}>Код отправлен на +7 *** ***-**-67</p>
            </div>
            <button className="btn-primary w-full" onClick={handleNext} disabled={verifyCode.length < 4}>
              Подтвердить личность
            </button>
          </div>
        )}

        {step === "amount" && (
          <div className="space-y-4">
            <div className="section-title mb-4">{isOut ? "Сумма выдачи" : "Сумма взноса"}</div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "hsl(215 20% 55%)" }}>Сумма (₽)</label>
              <input className="input-bank font-mono text-2xl text-center" placeholder="0" type="number"
                value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[10000, 50000, 100000, 500000].map(v => (
                <button key={v} className="btn-outline text-xs py-1.5" onClick={() => setAmount(String(v))}>{formatMoney(v)}</button>
              ))}
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "hsl(215 20% 55%)" }}>Комментарий (необязательно)</label>
              <input className="input-bank" placeholder="Назначение..." value={comment} onChange={e => setComment(e.target.value)} />
            </div>
            <button className="btn-primary w-full" onClick={handleNext} disabled={!amount || Number(amount) <= 0}>
              Продолжить
            </button>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4">
            <div className="section-title mb-4">Подтверждение операции</div>
            <div className="rounded-lg overflow-hidden" style={{ border: "1px solid hsl(220 15% 16%)" }}>
              {[
                { label: "Тип операции", value: title },
                { label: "Клиент", value: "Иванов Алексей Викторович" },
                { label: "Счёт", value: "40817810 **** 1234" },
                { label: "Сумма", value: formatMoney(Number(amount)) },
                { label: "Комиссия", value: "₽ 0" },
              ].map((row, i) => (
                <div key={row.label} className="flex justify-between px-4 py-3" style={{ background: i % 2 === 0 ? "hsl(220 15% 8%)" : "hsl(220 15% 10%)" }}>
                  <span className="text-xs" style={{ color: "hsl(215 20% 50%)" }}>{row.label}</span>
                  <span className="text-sm font-medium text-white font-mono">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg" style={{ background: "hsl(38 92% 50% / 0.08)", border: "1px solid hsl(38 92% 50% / 0.2)" }}>
              <div className="flex items-center gap-2">
                <Icon name="AlertTriangle" size={14} className="text-amber-400 shrink-0" />
                <p className="text-xs" style={{ color: "hsl(38 92% 65%)" }}>Операция необратима. Проверьте данные перед подтверждением.</p>
              </div>
            </div>
            <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={handleNext}>
              <Icon name="CheckCircle2" size={16} />
              Выполнить операцию
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── History ──────────────────────────────────────────────────────────────────
const History = () => {
  const [filter, setFilter] = useState("all");
  const filters = [
    { id: "all", label: "Все" },
    { id: "cash-out", label: "Выдача" },
    { id: "cash-in", label: "Взнос" },
    { id: "transfer", label: "Переводы" },
    { id: "credit", label: "Кредиты" },
  ];
  const filtered = filter === "all" ? MOCK_TRANSACTIONS : MOCK_TRANSACTIONS.filter(t => t.type === filter);

  return (
    <div className="space-y-5 animate-fade-in">
      <h2 className="text-xl font-semibold text-white">История операций</h2>

      <div className="flex gap-2">
        {filters.map(f => (
          <button key={f.id} className={filter === f.id ? "btn-primary text-xs py-1.5 px-3" : "btn-outline text-xs py-1.5 px-3"} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="bank-card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ background: "hsl(220 15% 8%)", borderBottom: "1px solid hsl(220 15% 14%)" }}>
              {["ID операции", "Тип", "Клиент", "Счёт", "Сумма", "Оператор", "Дата", "Статус"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: "hsl(215 20% 45%)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(tx => (
              <tr key={tx.id} className="table-row-bank">
                <td className="px-4 py-3 font-mono text-xs text-white">{tx.id}</td>
                <td className="px-4 py-3"><TxTypeBadge type={tx.type} /></td>
                <td className="px-4 py-3 text-sm text-white">{tx.client}</td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: "hsl(215 20% 50%)" }}>{tx.account}</td>
                <td className="px-4 py-3 font-mono text-sm font-medium text-white">{formatMoney(tx.amount)}</td>
                <td className="px-4 py-3 text-xs" style={{ color: "hsl(215 20% 55%)" }}>{tx.operator}</td>
                <td className="px-4 py-3 text-xs" style={{ color: "hsl(215 20% 50%)" }}>{tx.date}</td>
                <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Analytics ────────────────────────────────────────────────────────────────
const Analytics = () => {
  const bars = [
    { day: "Пн", out: 180, in: 120 },
    { day: "Вт", out: 240, in: 200 },
    { day: "Ср", out: 160, in: 310 },
    { day: "Чт", out: 290, in: 180 },
    { day: "Пт", out: 350, in: 260 },
    { day: "Сб", out: 120, in: 90 },
    { day: "Вс", out: 80, in: 60 },
  ];
  const maxVal = Math.max(...bars.flatMap(b => [b.out, b.in]));

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-white">Аналитика и отчёты</h2>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Оборот за месяц", value: "₽ 48.2M", delta: "+14.3%", icon: "TrendingUp" },
          { label: "Среднее за операцию", value: "₽ 142K", delta: "+5.1%", icon: "BarChart3" },
          { label: "Всего клиентов", value: "3 842", delta: "+47 за месяц", icon: "Users" },
        ].map(s => (
          <div key={s.label} className="bank-card">
            <div className="flex items-center justify-between mb-3">
              <Icon name={s.icon as any} size={18} className="text-cyan-400" />
              <span className="badge-green">{s.delta}</span>
            </div>
            <div className="stat-value text-2xl">{s.value}</div>
            <div className="text-xs mt-1" style={{ color: "hsl(215 20% 45%)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bank-card">
        <div className="section-title mb-6">Операции за неделю (тыс. ₽)</div>
        <div className="flex items-end gap-3 h-40">
          {bars.map(b => (
            <div key={b.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex items-end gap-1 h-32">
                <div className="w-4 rounded-t-sm transition-all" style={{ height: `${(b.out / maxVal) * 100}%`, background: "hsl(38 92% 50% / 0.7)" }} />
                <div className="w-4 rounded-t-sm transition-all" style={{ height: `${(b.in / maxVal) * 100}%`, background: "hsl(142 70% 45% / 0.7)" }} />
              </div>
              <span className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>{b.day}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(38 92% 50% / 0.7)" }} />
            <span className="text-xs" style={{ color: "hsl(215 20% 50%)" }}>Выдача</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(142 70% 45% / 0.7)" }} />
            <span className="text-xs" style={{ color: "hsl(215 20% 50%)" }}>Взнос</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bank-card">
          <div className="section-title mb-4">Структура операций</div>
          <div className="space-y-3">
            {[
              { label: "Выдача наличных", pct: 38, color: "hsl(38 92% 50%)" },
              { label: "Взнос наличных", pct: 29, color: "hsl(142 70% 45%)" },
              { label: "Переводы", pct: 21, color: "hsl(185 100% 50%)" },
              { label: "Кредиты", pct: 12, color: "hsl(0 84% 60%)" },
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "hsl(215 20% 60%)" }}>{r.label}</span>
                  <span className="font-mono" style={{ color: r.color }}>{r.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "hsl(220 15% 12%)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${r.pct}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bank-card">
          <div className="section-title mb-4">Топ операторов</div>
          <div className="space-y-3">
            {[
              { name: "Петрова М.С.", ops: 47, amount: "₽ 4.2M" },
              { name: "Козлов Д.Р.", ops: 38, amount: "₽ 3.8M" },
              { name: "Захаров В.Н.", ops: 29, amount: "₽ 2.1M" },
              { name: "Орлова Т.А.", ops: 21, amount: "₽ 1.5M" },
            ].map((op, i) => (
              <div key={op.name} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: i === 0 ? "hsl(185 100% 50% / 0.2)" : "hsl(220 15% 12%)", color: i === 0 ? "hsl(185 100% 50%)" : "hsl(215 20% 50%)" }}>{i + 1}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{op.name}</div>
                  <div className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>{op.ops} операций</div>
                </div>
                <div className="font-mono text-sm" style={{ color: "hsl(185 100% 50%)" }}>{op.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Clients ──────────────────────────────────────────────────────────────────
const Clients = () => {
  const [search, setSearch] = useState("");
  const filtered = MOCK_CLIENTS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.account.includes(search));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Клиентская база</h2>
        <button className="btn-primary flex items-center gap-2 text-sm">
          <Icon name="UserPlus" size={14} />
          Новый клиент
        </button>
      </div>
      <input className="input-bank max-w-sm" placeholder="Поиск по ФИО / счёту..." value={search} onChange={e => setSearch(e.target.value)} />
      <div className="bank-card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ background: "hsl(220 15% 8%)", borderBottom: "1px solid hsl(220 15% 14%)" }}>
              {["ID", "Клиент", "Телефон", "Счёт", "Баланс", "Статус", "Кредит"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: "hsl(215 20% 45%)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="table-row-bank cursor-pointer">
                <td className="px-4 py-3 font-mono text-xs" style={{ color: "hsl(215 20% 50%)" }}>{c.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-white">{c.name}</td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: "hsl(215 20% 55%)" }}>{c.phone}</td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: "hsl(215 20% 50%)" }}>{c.account}</td>
                <td className="px-4 py-3 font-mono text-sm font-medium" style={{ color: c.balance > 1000000 ? "hsl(185 100% 50%)" : "hsl(210 40% 85%)" }}>{formatMoney(c.balance)}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3">{c.credit ? <span className="badge-red">Есть</span> : <span className="text-xs" style={{ color: "hsl(215 20% 40%)" }}>—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Credit ───────────────────────────────────────────────────────────────────
const Credit = () => {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [months, setMonths] = useState(24);
  const rate = 12.5;
  const monthly = (loanAmount * (rate / 100 / 12)) / (1 - Math.pow(1 + rate / 100 / 12, -months));

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-white">Кредиты и рассрочка</h2>

      <div className="grid grid-cols-2 gap-6">
        <div className="bank-card">
          <div className="section-title mb-5">Калькулятор кредита</div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: "hsl(215 20% 55%)" }}>Сумма кредита</label>
                <span className="font-mono text-sm" style={{ color: "hsl(185 100% 50%)" }}>{formatMoney(loanAmount)}</span>
              </div>
              <input type="range" min={50000} max={5000000} step={50000} value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} className="w-full accent-cyan-400" />
              <div className="flex justify-between text-xs mt-1" style={{ color: "hsl(215 20% 40%)" }}>
                <span>₽50 000</span><span>₽5 000 000</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: "hsl(215 20% 55%)" }}>Срок</label>
                <span className="font-mono text-sm" style={{ color: "hsl(185 100% 50%)" }}>{months} мес.</span>
              </div>
              <input type="range" min={3} max={60} step={3} value={months} onChange={e => setMonths(Number(e.target.value))} className="w-full accent-cyan-400" />
              <div className="flex justify-between text-xs mt-1" style={{ color: "hsl(215 20% 40%)" }}>
                <span>3 мес.</span><span>60 мес.</span>
              </div>
            </div>
            <div className="p-4 rounded-lg space-y-2" style={{ background: "hsl(185 100% 50% / 0.06)", border: "1px solid hsl(185 100% 50% / 0.15)" }}>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: "hsl(215 20% 55%)" }}>Ставка</span>
                <span className="font-mono text-sm text-white">{rate}% годовых</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: "hsl(215 20% 55%)" }}>Ежемесячный платёж</span>
                <span className="font-mono text-lg font-semibold" style={{ color: "hsl(185 100% 50%)" }}>{formatMoney(monthly)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: "hsl(215 20% 55%)" }}>Переплата</span>
                <span className="font-mono text-sm text-white">{formatMoney(monthly * months - loanAmount)}</span>
              </div>
            </div>
            <button className="btn-primary w-full">Оформить заявку</button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bank-card">
            <div className="section-title mb-4">Активные кредиты</div>
            <div className="space-y-3">
              {[
                { client: "Федорова О.Л.", amount: 500000, left: 480000, months: 35, status: "pending" },
                { client: "Новиков П.И.", amount: 200000, left: 120000, months: 14, status: "ok" },
              ].map(c => (
                <div key={c.client} className="p-3 rounded-lg" style={{ background: "hsl(220 15% 8%)", border: "1px solid hsl(220 15% 14%)" }}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-white">{c.client}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="text-xs mb-2" style={{ color: "hsl(215 20% 50%)" }}>
                    Остаток: <span className="font-mono text-white">{formatMoney(c.left)}</span> · {c.months} мес.
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "hsl(220 15% 14%)" }}>
                    <div className="h-full rounded-full" style={{ width: `${(1 - c.left / c.amount) * 100}%`, background: "hsl(185 100% 50%)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bank-card">
            <div className="section-title mb-3">Рассрочка 0%</div>
            <div className="space-y-2 text-sm">
              {["3 месяца · Любые товары", "6 месяцев · До ₽150 000", "12 месяцев · До ₽500 000"].map(p => (
                <div key={p} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: "hsl(220 15% 12%)" }}>
                  <Icon name="CheckCircle2" size={14} className="text-green-400 shrink-0" />
                  <span style={{ color: "hsl(215 20% 65%)" }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Queue ────────────────────────────────────────────────────────────────────
const Queue = () => (
  <div className="space-y-5 animate-fade-in">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold text-white">Электронная очередь</h2>
      <button className="btn-primary flex items-center gap-2 text-sm">
        <Icon name="Plus" size={14} />
        Взять следующего
      </button>
    </div>

    <div className="grid grid-cols-3 gap-4">
      {[
        { label: "В очереди", value: MOCK_QUEUE.length, icon: "Users" },
        { label: "Обслужено сегодня", value: 42, icon: "CheckCircle2" },
        { label: "Среднее ожидание", value: "12 мин", icon: "Clock" },
      ].map(s => (
        <div key={s.label} className="bank-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(185 100% 50% / 0.1)" }}>
            <Icon name={s.icon as any} size={18} className="text-cyan-400" />
          </div>
          <div>
            <div className="stat-value text-xl">{s.value}</div>
            <div className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="bank-card">
        <div className="section-title mb-4">Очередь</div>
        <div className="space-y-2">
          {MOCK_QUEUE.map(q => (
            <div key={q.ticket} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: q.status === "current" ? "hsl(185 100% 50% / 0.08)" : "hsl(220 15% 8%)", border: q.status === "current" ? "1px solid hsl(185 100% 50% / 0.25)" : "1px solid hsl(220 15% 14%)" }}>
              <div className="font-mono text-sm font-bold w-12" style={{ color: q.status === "current" ? "hsl(185 100% 50%)" : "hsl(215 20% 50%)" }}>{q.ticket}</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{q.name}</div>
                <div className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>{q.service}</div>
              </div>
              <div className="flex items-center gap-2">
                {q.status === "current"
                  ? <><div className="pulse-dot" /><span className="text-xs" style={{ color: "hsl(185 100% 50%)" }}>Сейчас</span></>
                  : <span className="text-xs" style={{ color: "hsl(215 20% 40%)" }}>{q.wait}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bank-card">
        <div className="section-title mb-4">Регистрация в очереди</div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: "hsl(215 20% 55%)" }}>Имя клиента</label>
            <input className="input-bank" placeholder="Фамилия Имя Отчество" />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: "hsl(215 20% 55%)" }}>Тип услуги</label>
            <select className="input-bank">
              <option>Выдача наличных</option>
              <option>Взнос наличных</option>
              <option>Открытие счёта</option>
              <option>Кредит / Рассрочка</option>
              <option>Корпоративный счёт</option>
              <option>Консультация</option>
            </select>
          </div>
          <button className="btn-primary w-full flex items-center justify-center gap-2">
            <Icon name="TicketPlus" size={14} />
            Выдать талон
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Terminal ─────────────────────────────────────────────────────────────────
const Terminal = () => {
  const [ip, setIp] = useState("192.168.1.50");
  const [port, setPort] = useState("9090");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setConnected(true); }, 1500);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <h2 className="text-xl font-semibold text-white">Терминал СберБанк</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bank-card">
          <div className="section-title mb-5">Подключение по IP</div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "hsl(215 20% 55%)" }}>IP-адрес терминала</label>
              <input className="input-bank font-mono" placeholder="192.168.1.xxx" value={ip} onChange={e => setIp(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "hsl(215 20% 55%)" }}>Порт</label>
              <input className="input-bank font-mono" placeholder="9090" value={port} onChange={e => setPort(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "hsl(215 20% 55%)" }}>Протокол</label>
              <select className="input-bank">
                <option>TCP/IP</option>
                <option>HTTP</option>
                <option>HTTPS</option>
              </select>
            </div>
            <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={handleConnect} disabled={loading || connected}>
              {loading ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Wifi" size={14} />}
              {connected ? "Подключено" : loading ? "Подключение..." : "Подключить"}
            </button>
          </div>
        </div>

        <div className="bank-card">
          <div className="section-title mb-4">Статус терминала</div>
          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{ background: connected ? "hsl(142 70% 45% / 0.08)" : "hsl(220 15% 8%)", border: `1px solid ${connected ? "hsl(142 70% 45% / 0.3)" : "hsl(220 15% 14%)"}` }}>
              <div className="flex items-center gap-3">
                <div className={connected ? "pulse-dot" : "w-2 h-2 rounded-full bg-gray-600"} />
                <span className="text-sm font-medium" style={{ color: connected ? "hsl(142 70% 55%)" : "hsl(215 20% 45%)" }}>
                  {connected ? "Терминал активен" : "Нет подключения"}
                </span>
              </div>
              {connected && (
                <div className="mt-3 space-y-1.5 text-xs" style={{ color: "hsl(215 20% 55%)" }}>
                  <div>Адрес: <span className="font-mono text-white">{ip}:{port}</span></div>
                  <div>Версия ПО: <span className="font-mono text-white">SberPOS 3.14.2</span></div>
                  <div>Баланс терминала: <span className="font-mono text-white">₽ 2 500 000</span></div>
                </div>
              )}
            </div>

            {connected && (
              <div className="space-y-2 animate-fade-in">
                <div className="section-title">Операции терминала</div>
                {["Оплата картой", "Безналичный перевод", "Проверка баланса", "Печать отчёта"].map(op => (
                  <button key={op} className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors" style={{ background: "hsl(220 15% 8%)", border: "1px solid hsl(220 15% 14%)", color: "hsl(215 20% 70%)" }}>
                    {op}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Accounts ────────────────────────────────────────────────────────────────
const Accounts = () => (
  <div className="space-y-5 animate-fade-in">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold text-white">Учёт счетов</h2>
      <button className="btn-primary flex items-center gap-2 text-sm">
        <Icon name="Plus" size={14} />
        Открыть счёт
      </button>
    </div>

    <div className="grid grid-cols-3 gap-4">
      {[
        { label: "Активных счетов", value: "3 842", icon: "BookOpen" },
        { label: "Общий остаток", value: "₽ 2.1B", icon: "DollarSign" },
        { label: "Новых за месяц", value: "47", icon: "TrendingUp" },
      ].map(s => (
        <div key={s.label} className="bank-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(185 100% 50% / 0.1)" }}>
            <Icon name={s.icon as any} size={18} className="text-cyan-400" />
          </div>
          <div>
            <div className="stat-value text-xl">{s.value}</div>
            <div className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>

    <div className="bank-card p-0 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr style={{ background: "hsl(220 15% 8%)", borderBottom: "1px solid hsl(220 15% 14%)" }}>
            {["Номер счёта", "Владелец", "Тип", "Валюта", "Остаток", "Открыт", "Статус"].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: "hsl(215 20% 45%)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MOCK_ACCOUNTS.map(a => (
            <tr key={a.id} className="table-row-bank cursor-pointer">
              <td className="px-4 py-3 font-mono text-xs text-white">{a.id}</td>
              <td className="px-4 py-3 text-sm font-medium text-white">{a.owner}</td>
              <td className="px-4 py-3 text-xs" style={{ color: "hsl(215 20% 55%)" }}>{a.type}</td>
              <td className="px-4 py-3 font-mono text-xs" style={{ color: "hsl(215 20% 50%)" }}>{a.currency}</td>
              <td className="px-4 py-3 font-mono text-sm font-medium" style={{ color: a.balance < 0 ? "hsl(0 84% 65%)" : "hsl(185 100% 50%)" }}>{formatMoney(a.balance)}</td>
              <td className="px-4 py-3 text-xs" style={{ color: "hsl(215 20% 50%)" }}>{a.opened}</td>
              <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [section, setSection] = useState<Section>("dashboard");

  if (!user) return <AuthScreen onLogin={setUser} />;

  const renderSection = () => {
    switch (section) {
      case "dashboard": return <Dashboard user={user} />;
      case "cash-out": return <CashOperationForm type="out" userRole={user.role} />;
      case "cash-in": return <CashOperationForm type="in" userRole={user.role} />;
      case "history": return <History />;
      case "analytics": return <Analytics />;
      case "clients": return <Clients />;
      case "credit": return <Credit />;
      case "queue": return <Queue />;
      case "terminal": return <Terminal />;
      case "accounts": return <Accounts />;
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} active={section} onNav={setSection} onLogout={() => { setUser(null); setSection("dashboard"); }} />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b" style={{ background: "hsl(220 20% 6% / 0.95)", borderColor: "hsl(220 15% 12%)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: "hsl(215 20% 40%)" }}>
            <Icon name="Landmark" size={12} />
            <span>АБС</span>
            <span>/</span>
            <span style={{ color: "hsl(215 20% 65%)" }}>
              {user.role === "employee" ? "Сотрудник" : "Клиент"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "hsl(215 20% 45%)" }}>
              <div className="pulse-dot" />
              <span>Система активна</span>
            </div>
            <div className="font-mono text-xs" style={{ color: "hsl(215 20% 45%)" }}>
              26.03.2026 · {new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "hsl(220 15% 10%)", border: "1px solid hsl(220 15% 16%)" }}>
              <Icon name="Shield" size={12} className="text-cyan-400" />
              <span className="text-xs" style={{ color: "hsl(185 100% 50%)" }}>PCI DSS</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}