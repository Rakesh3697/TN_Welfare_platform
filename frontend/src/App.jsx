import { useState, useEffect, createContext, useContext, useCallback } from "react";

// ─── API Layer ───────────────────────────────────────────────────────────────
const API = "http://localhost:5000/api";

const api = {
  get: (path) => fetch(`${API}${path}`).then((r) => r.json()),
  post: (path, body) =>
    fetch(`${API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  put: (path, body) =>
    fetch(`${API}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
};

// ─── Context ─────────────────────────────────────────────────────────────────
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

// ─── Notification System ─────────────────────────────────────────────────────
function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const addNotification = useCallback((message, type = "success") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 3500);
  }, []);
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);
  return { notifications, addNotification, removeNotification };
}

function NotificationArea({ notifications, onRemove }) {
  const icons = { success: "✓", error: "✕", info: "ℹ" };
  const colors = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`${colors[n.type]} text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium animate-slide-in pointer-events-auto group`}
          style={{ animation: "slideIn 0.3s ease-out" }}
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {icons[n.type]}
          </span>
          <span className="flex-1">{n.message}</span>
          <button
            onClick={() => onRemove(n.id)}
            className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0 text-lg leading-none"
            title="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (n) => new Intl.NumberFormat("en-IN").format(n);

const categoryColors = {
  education: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
  health: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" },
  agriculture: { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500" },
  women: { bg: "bg-pink-100", text: "text-pink-800", dot: "bg-pink-500" },
};

const serviceIcons = {
  "fa-tint": "🩸",
  "fa-box-open": "📦",
  "fa-utensils": "🍽️",
  "fa-eye": "👁️",
  "fa-book": "📚",
  "fa-hands-helping": "🤝",
};

const urgencyConfig = {
  Critical: { badge: "bg-red-100 text-red-700 border border-red-200", label: "🔴 Critical" },
  High: { badge: "bg-orange-100 text-orange-700 border border-orange-200", label: "🟠 High Priority" },
  Normal: { badge: "bg-gray-100 text-gray-600 border border-gray-200", label: "🟢 Normal" },
};

// ─── Modals ───────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, icon }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>{icon}</span> {title}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors text-lg">
            ×
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function Navigation({ role, currentTab, setTab, onLogout }) {
  const baseLinks = ["dashboard", "services", "schemes", "impact"];
  const userLinks = ["donate", "volunteer", "request", "complaints"];
  const adminLinks = ["dashboard", "services", "schemes", "impact", "complaints"];
  const links = role === "user" ? [...baseLinks.slice(0, 3), ...userLinks, ...baseLinks.slice(3)] : adminLinks;

  const labels = {
    dashboard: "Dashboard", services: "Local Services", schemes: "Schemes",
    impact: "Impact Track", donate: "Donate", volunteer: "Volunteer", request: "Request Help",
    complaints: "Complaints",
  };

  return (
    <nav className="bg-slate-900 text-white shadow-xl border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-xl">🤝</div>
            <div>
              <span className="font-black text-lg tracking-tight">TN Welfare Connect</span>
              <div className={`text-xs font-bold uppercase tracking-widest ${role === "admin" ? "text-red-400" : "text-blue-400"}`}>
                {role === "admin" ? "Administrator" : "Citizen Portal"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
            {links.map((link) => (
              <button
                key={link}
                onClick={() => setTab(link)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  currentTab === link
                    ? "bg-white text-slate-900 shadow-md"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                {labels[link]}
              </button>
            ))}
          </div>

          <button
            onClick={onLogout}
            className="ml-4 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-red-100 rounded-lg text-sm font-medium transition-all border border-red-500/20 whitespace-nowrap"
          >
            Exit →
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-2xl shadow-amber-500/30">
            🤝
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">TN Welfare Connect</h1>
          <p className="text-blue-300 mt-2 text-sm">Tamil Nadu Charity & Welfare Platform</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <p className="text-white/70 text-center text-sm mb-6">Select your access role to continue</p>
          <div className="space-y-4">
            <button
              onClick={() => onLogin("user")}
              className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg flex items-center gap-3 px-6 group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl group-hover:bg-blue-200 transition-colors">👤</div>
              <div className="text-left">
                <div>Enter as Citizen</div>
                <div className="text-xs text-gray-500 font-normal">Donate, apply, request help</div>
              </div>
            </button>
            <button
              onClick={() => onLogin("admin")}
              className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold text-lg hover:bg-slate-700 transition-all shadow-lg flex items-center gap-3 px-6 border border-slate-600 group"
            >
              <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-xl group-hover:bg-slate-600 transition-colors">🛡️</div>
              <div className="text-left">
                <div>Enter as Administrator</div>
                <div className="text-xs text-slate-400 font-normal">Manage schemes & services</div>
              </div>
            </button>
          </div>
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-white/50 text-center space-y-1">
            <p>🔒 Secure access | Government of Tamil Nadu</p>
            <p>Data protected under IT Act 2000</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ role, setTab, openModal }) {
  const [stats, setStats] = useState({ schemes: 0, services: 0, funds: 0, volunteers: 0 });
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    api.get("/stats").then(setStats).catch(() => {});
    api.get("/updates").then(setUpdates).catch(() => {});
  }, []);

  const statCards = [
    { label: "Active Schemes", value: stats.schemes, icon: "📋", color: "from-blue-500 to-blue-600" },
    { label: "Local Services", value: stats.services, icon: "📍", color: "from-emerald-500 to-emerald-600" },
    { label: "Funds Raised (₹)", value: formatCurrency(stats.funds), icon: "💰", color: "from-amber-500 to-amber-600" },
    { label: "Volunteers", value: stats.volunteers?.toLocaleString?.() || stats.volunteers, icon: "🙌", color: "from-purple-500 to-purple-600" },
  ];

  const adminActions = [
    { icon: "➕", label: "Create Service Drive", sub: "Publish new service event", action: () => { setTab("services"); openModal("service"); } },
    { icon: "📋", label: "Add Government Scheme", sub: "Register welfare scheme", action: () => { setTab("schemes"); openModal("scheme"); } },
    { icon: "📊", label: "View Impact Reports", sub: "Transparency ledger", action: () => setTab("impact") },
  ];

  const userActions = [
    { icon: "📍", label: "Find Services Near Me", sub: "Blood, food, medical camps", action: () => setTab("services") },
    { icon: "🆘", label: "Request Assistance", sub: "Emergency help needed?", action: () => setTab("request") },
    { icon: "❤️", label: "Make a Donation", sub: "Support a cause today", action: () => setTab("donate") },
    { icon: "🙋", label: "Volunteer with Us", sub: "Join the helping force", action: () => setTab("volunteer") },
  ];

  const actions = role === "admin" ? adminActions : userActions;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">
          {role === "admin" ? "Admin Control Center" : "Welcome, Citizen 🙏"}
        </h1>
        <p className="text-gray-500 mt-1">Overview of welfare activities across Tamil Nadu</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 overflow-hidden relative">
            <div className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br ${s.color} rounded-full opacity-10`} />
            <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${s.color} text-white text-xl mb-3 shadow-lg`}>
              {s.icon}
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
            Recent Platform Updates
          </h2>
          <div className="space-y-3">
            {updates.map((u, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
                <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${u.type === "success" ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"}`}>
                  {u.type === "success" ? "✓" : "ℹ"}
                </div>
                <div>
                  <p className="text-gray-800 text-sm font-medium">{u.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{u.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Quick Actions</h2>
          <div className="space-y-2">
            {actions.map((a, i) => (
              <button
                key={i}
                onClick={a.action}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{a.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{a.label}</div>
                    <div className="text-xs text-gray-400">{a.sub}</div>
                  </div>
                </div>
                <span className="text-gray-300 group-hover:text-blue-400 transition-colors">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Local Services ───────────────────────────────────────────────────────────
function LocalServices({ role }) {
  const { addNotification } = useApp();
  const [services, setServices] = useState([]);
  const [district, setDistrict] = useState("All");
  const [category, setCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Blood Donation", district: "Chennai", location: "", date: "", urgency: "Normal" });

  const load = useCallback(() => {
    api.get(`/services?district=${district}&category=${encodeURIComponent(category)}`).then(setServices).catch(() => {});
  }, [district, category]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post("/services", form);
    if (res.success) {
      addNotification("Service published successfully! 🎉");
      setShowModal(false);
      setForm({ title: "", category: "Blood Donation", district: "Chennai", location: "", date: "", urgency: "Normal" });
      load();
    }
  };

  const categories = ["All", "Blood Donation", "Medical Camp", "Food Donation", "Disaster Relief"];
  const districts = ["All", "Chennai", "Coimbatore", "Madurai", "Trichy", "Salem"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Services Near Me</h1>
          <p className="text-gray-500 mt-1">Find blood drives, medical camps & charity events in your district</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          >
            {districts.map((d) => <option key={d}>{d}</option>)}
          </select>
          {role === "admin" && (
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-md flex items-center gap-2"
            >
              <span>+</span> Create Service
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              category === c ? "bg-slate-900 text-white shadow-md" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {c === "All" ? "All Services" : c}
          </button>
        ))}
      </div>

      {services.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium">No services found for this criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc) => (
            <ServiceCard key={svc.id} service={svc} role={role} />
          ))}
        </div>
      )}

      {/* Admin Create Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New Local Service" icon="📍">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Service Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                {["Blood Donation", "Medical Camp", "Food Donation", "Disaster Relief", "Educational Assistance"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">District</label>
              <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                {["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem"].map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
              <input required placeholder="e.g., GH Hospital, Ward 4" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date & Time</label>
              <input required placeholder="e.g., Tomorrow, 10 AM - 2 PM" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Urgency</label>
              <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                {["Normal", "High", "Critical"].map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-black font-bold">Publish Service</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ServiceCard({ service, role }) {
  const { addNotification } = useApp();
  const u = urgencyConfig[service.urgency] || urgencyConfig.Normal;
  const emoji = serviceIcons[service.icon] || "🤝";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{service.category}</span>
        </div>
        {service.urgency !== "Normal" && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.badge}`}>{u.label}</span>
        )}
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-3">{service.title}</h3>
      <div className="space-y-1.5 flex-1 text-sm text-gray-500">
        <p>📅 {service.date}</p>
        <p>📌 {service.location}, <span className="font-medium text-gray-700">{service.district}</span></p>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100">
        {role === "admin" ? (
          <button onClick={() => addNotification("Management panel coming soon")} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors">
            Manage
          </button>
        ) : (
          <button onClick={() => addNotification("Connecting you to coordinator... 📞")} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm">
            Avail / Help
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Schemes ──────────────────────────────────────────────────────────────────
function Schemes({ role }) {
  const { addNotification } = useApp();
  const [schemes, setSchemes] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editScheme, setEditScheme] = useState(null);
  const [applyScheme, setApplyScheme] = useState(null);
  const [form, setForm] = useState({ title: "", category: "education", status: "Active", desc: "", eligibility: "" });
  const [editForm, setEditForm] = useState({ title: "", category: "education", status: "Active", desc: "", eligibility: "" });
  const [appForm, setAppForm] = useState({ name: "", aadhaar: "", district: "" });

  const load = useCallback(() => {
    api.get(`/schemes?category=${filter}&search=${encodeURIComponent(search)}`).then(setSchemes).catch(() => {});
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post("/schemes", form);
    if (res.success) {
      addNotification("Scheme published successfully! 📋");
      setShowAdminModal(false);
      setForm({ title: "", category: "education", status: "Active", desc: "", eligibility: "" });
      load();
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/schemes/${editScheme.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    }).then((r) => r.json());
    if (res.success) {
      addNotification("Scheme updated successfully! ✏️");
      setEditScheme(null);
      load();
    } else {
      addNotification("Failed to update scheme", "error");
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    const res = await api.post("/applications", { schemeId: applyScheme.id, ...appForm });
    if (res.success) {
      addNotification("Application submitted! ✅");
      setApplyScheme(null);
      setAppForm({ name: "", aadhaar: "", district: "" });
    }
  };

  const filterBtns = [
    { key: "all", label: "All" },
    { key: "education", label: "Education" },
    { key: "health", label: "Healthcare" },
    { key: "agriculture", label: "Agriculture" },
    { key: "women", label: "Women Empowerment" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Government Schemes</h1>
          <p className="text-gray-500 mt-1">Browse and apply for welfare schemes in Tamil Nadu</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search schemes..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
          {role === "admin" && (
            <button onClick={() => setShowAdminModal(true)} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black shadow-md flex items-center gap-2">
              + Create
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {filterBtns.map((b) => (
          <button key={b.key} onClick={() => setFilter(b.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              filter === b.key ? "bg-slate-900 text-white shadow-md" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {schemes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-medium">No schemes found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schemes.map((s) => {
            const cc = categoryColors[s.category] || categoryColors.education;
            return (
              <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${cc.bg} ${cc.text}`}>
                    {s.category}
                  </span>
                  <span className={`text-xs font-semibold ${s.status === "Active" ? "text-emerald-600" : "text-gray-400"}`}>
                    {s.status === "Active" ? "● Active" : s.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 flex-1 mb-4">{s.desc}</p>
                <div className="mt-auto pt-3 border-t border-gray-100">
                  {role === "admin" ? (
                    <button onClick={() => { setEditScheme(s); setEditForm({ title: s.title, category: s.category, status: s.status, desc: s.desc, eligibility: s.eligibility }); }} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors">
                      Edit
                    </button>
                  ) : s.status === "Active" ? (
                    <button onClick={() => setApplyScheme(s)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors">
                      Apply Now →
                    </button>
                  ) : (
                    <span className="text-sm text-gray-400">Closed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Modal */}
      <Modal open={showAdminModal} onClose={() => setShowAdminModal(false)} title="Create New Scheme" icon="📋">
        <form onSubmit={handleAdminSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Scheme Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                {["education", "health", "agriculture", "women"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                {["Active", "Upcoming", "Closed"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea required rows={2} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })}
              className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Eligibility Criteria</label>
            <textarea required rows={2} value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
              className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAdminModal(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-black font-bold">Publish</button>
          </div>
        </form>
      </Modal>

      {/* Apply Modal */}
      <Modal open={!!applyScheme} onClose={() => setApplyScheme(null)} title={applyScheme ? `Apply: ${applyScheme.title}` : ""} icon="📝">
        {applyScheme && (
          <form onSubmit={handleApply} className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800">
              <strong>Eligibility:</strong> {applyScheme.eligibility}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input required value={appForm.name} onChange={(e) => setAppForm({ ...appForm, name: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Aadhaar Number</label>
                <input required pattern="[0-9]{12}" title="12 digit Aadhaar" value={appForm.aadhaar}
                  onChange={(e) => setAppForm({ ...appForm, aadhaar: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">District</label>
              <select required value={appForm.district} onChange={(e) => setAppForm({ ...appForm, district: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Select District</option>
                {["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem"].map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setApplyScheme(null)} className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-sm">Submit Application</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editScheme} onClose={() => setEditScheme(null)} title={editScheme ? `Edit: ${editScheme.title}` : ""} icon="✏️">
        {editScheme && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Scheme Title</label>
              <input required value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                  {["education", "health", "agriculture", "women"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                  {["Active", "Upcoming", "Closed"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea required rows={2} value={editForm.desc} onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Eligibility Criteria</label>
              <textarea required rows={2} value={editForm.eligibility} onChange={(e) => setEditForm({ ...editForm, eligibility: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditScheme(null)} className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

// ─── Donate ───────────────────────────────────────────────────────────────────
function Donate() {
  const { addNotification } = useApp();
  const [causes, setCauses] = useState([]);
  const [causeId, setCauseId] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    api.get("/causes").then((data) => {
      setCauses(data);
      if (data.length) setCauseId(data[0].id);
    }).catch(() => {});
  }, []);

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!amount || amount < 1) return;
    const res = await api.post("/donate", { causeId, amount: parseInt(amount) });
    if (res.success) {
      addNotification("Donation successful! Receipt will be emailed. 🙏");
      setAmount("");
      api.get("/causes").then(setCauses);
    }
  };

  const causeColors = { blue: "from-blue-500 to-blue-600", green: "from-emerald-500 to-emerald-600", purple: "from-purple-500 to-purple-600" };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900">Support a Cause ❤️</h1>
        <p className="text-gray-500 mt-2">Your contribution helps vulnerable communities. Tax-exempt under Section 80G.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
        <div className="lg:col-span-3 space-y-4">
          {causes.map((c) => {
            const pct = Math.min(100, Math.round((c.raised / c.goal) * 100));
            const grad = causeColors[c.color] || causeColors.blue;
            return (
              <div key={c.id} onClick={() => setCauseId(c.id)}
                className={`bg-white rounded-2xl p-5 border-2 cursor-pointer transition-all ${causeId === c.id ? "border-blue-400 shadow-md" : "border-transparent shadow-sm hover:border-gray-200"}`}
              >
                <div className={`w-full h-1.5 rounded-full bg-gradient-to-r ${grad} mb-4 opacity-20`} />
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{c.title}</h3>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{pct}% funded</span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{c.desc}</p>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${grad} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>Raised: ₹{formatCurrency(c.raised)}</span>
                  <span>Goal: ₹{formatCurrency(c.goal)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Make a Donation</h2>
            <form onSubmit={handleDonate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Cause</label>
                <select value={causeId} onChange={(e) => setCauseId(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none text-sm">
                  {causes.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[500, 1000, 5000].map((v) => (
                    <button key={v} type="button" onClick={() => setAmount(String(v))}
                      className={`py-2 border rounded-xl text-sm font-semibold transition-all ${amount === String(v) ? "border-amber-400 bg-amber-50 text-amber-700" : "border-gray-200 hover:border-amber-300"}`}>
                      ₹{v.toLocaleString()}
                    </button>
                  ))}
                </div>
                <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="Custom amount" required
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none" />
              </div>
              <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg transition-colors">
                Proceed to Pay →
              </button>
              <p className="text-center text-xs text-gray-400">🔒 Secured by RazorPay | 80G Receipt</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Request Help ─────────────────────────────────────────────────────────────
function RequestHelp() {
  const { addNotification } = useApp();
  const [form, setForm] = useState({ name: "", phone: "", type: "", district: "", urgency: "Normal" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post("/help-requests", form);
    if (res.success) {
      addNotification("Request sent to coordinators! Help is on the way 🚨");
      setForm({ name: "", phone: "", type: "", district: "", urgency: "Normal" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900">Request Assistance 🆘</h1>
        <p className="text-gray-500 mt-2">Submit a request for critical services. Our network will assist you as soon as possible.</p>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
              <input required pattern="[0-9]{10}" title="10 digit number" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Type of Assistance</label>
              <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Select Category...</option>
                <option value="Blood Needed">Blood Needed</option>
                <option value="Medical Emergency">Medical Emergency</option>
                <option value="Disaster Relief">Disaster Relief</option>
                <option value="Food Support">Food Support</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">District</label>
              <input required placeholder="e.g., Chennai" value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency Level</label>
            <div className="flex gap-6">
              {["Normal", "Critical"].map((u) => (
                <label key={u} className={`flex items-center gap-2 cursor-pointer font-semibold ${u === "Critical" ? "text-red-600" : "text-gray-700"}`}>
                  <input type="radio" name="urgency" value={u} checked={form.urgency === u}
                    onChange={(e) => setForm({ ...form, urgency: e.target.value })} className="w-4 h-4" />
                  {u === "Critical" ? "🔴 Critical" : "🟢 Normal"}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
            <span>Submit Request</span> →
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Volunteer ────────────────────────────────────────────────────────────────
function Volunteer() {
  const { addNotification } = useApp();
  const [form, setForm] = useState({ name: "", phone: "", district: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post("/volunteers", form);
    if (res.success) {
      addNotification("Volunteer registration confirmed! Welcome to the team 🙌");
      setForm({ name: "", phone: "", district: "" });
    }
  };

  const drives = [
    { title: "Weekend Blood Donation Camp", district: "Chennai", date: "Every Saturday, 9 AM - 1 PM", icon: "🩸" },
    { title: "Annadhanam at Old Age Homes", district: "Madurai", date: "Every Sunday, 11:30 AM", icon: "🍱" },
    { title: "School Book Drive", district: "Coimbatore", date: "1st & 3rd Saturday monthly", icon: "📚" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Join the Volunteer Force 🙋</h1>
        <p className="text-gray-500 mt-1">Register to help implement schemes and assist communities on the ground.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">Registration Form</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name" className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
              <input required pattern="[0-9]{10}" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="10-digit mobile number" className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">District</label>
              <select required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none">
                <option value="">Select District</option>
                {["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem"].map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md transition-colors">
              Register as Volunteer ✓
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Volunteer Drives</h2>
          <div className="space-y-3">
            {drives.map((d, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="text-3xl">{d.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{d.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">📍 {d.district}</p>
                  <p className="text-xs text-blue-600 font-medium mt-0.5">📅 {d.date}</p>
                </div>
              </div>
            ))}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
              <strong>Note:</strong> After registering, our coordinator will contact you 24 hours before each drive.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Complaints (Citizen Submission) ───────────────────────────────────────────
function Complaints({ role }) {
  const { addNotification } = useApp();
  const [form, setForm] = useState({ name: "", phone: "", email: "", district: "", category: "", subject: "", description: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post("/complaints", form);
    if (res.success) {
      addNotification(res.message + " 📝");
      setForm({ name: "", phone: "", email: "", district: "", category: "", subject: "", description: "" });
    }
  };

  return (
    <div className="space-y-6">
      {role === "admin" ? (
        // Admin View - List all complaints
        <ViewComplaints />
      ) : (
        // Citizen View - Submit complaint
        <>
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-black text-gray-900">Report a Complaint 📋</h1>
            <p className="text-gray-500 mt-2">Help us improve our services by reporting issues and concerns. Your feedback matters!</p>
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name" className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input required pattern="[0-9]{10}" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="10-digit mobile number" className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your.email@example.com" className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">District</label>
                  <select required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Select District</option>
                    {["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem"].map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Complaint Category</label>
                <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Select Category</option>
                  <option value="Service Quality">Service Quality</option>
                  <option value="Staff Behavior">Staff Behavior</option>
                  <option value="Scheme Issues">Scheme Issues</option>
                  <option value="Application Problems">Application Problems</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Brief subject of complaint" className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Detailed Description</label>
                <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Please describe the issue in detail..." className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
                <span>Submit Complaint</span> →
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

// ─── View Complaints (Admin Only) ───────────────────────────────────────────
function ViewComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const { addNotification } = useApp();

  useEffect(() => {
    api.get("/complaints").then(setComplaints).catch(() => {});
  }, []);

  const filteredComplaints = filter === "all" ? complaints : complaints.filter((c) => c.status === filter);

  const handleStatusChange = async (complaintId, newStatus) => {
    setUpdatingId(complaintId);
    try {
      const result = await api.put(`/complaints/${complaintId}`, { status: newStatus });
      if (result.success) {
        setComplaints(complaints.map(c => c.id === complaintId ? { ...c, status: newStatus } : c));
        addNotification(`Status updated to ${newStatus}`, "success");
      } else {
        addNotification(result.message || "Failed to update status", "error");
      }
    } catch (err) {
      addNotification("Error updating status", "error");
    }
    setUpdatingId(null);
  };

  const categoryEmoji = {
    "Service Quality": "⭐",
    "Staff Behavior": "👤",
    "Scheme Issues": "📋",
    "Application Problems": "🔧",
    "Other": "❓",
  };

  const statusColors = {
    "Pending": "bg-yellow-100 text-yellow-700",
    "In Progress": "bg-blue-100 text-blue-700",
    "Resolved": "bg-green-100 text-green-700",
  };

  const statusOptions = ["Pending", "In Progress", "Resolved"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Complaints Dashboard 📋</h1>
        <p className="text-gray-500 mt-1">Manage and track all citizen complaints and feedback</p>
      </div>

      <div className="flex gap-3">
        {["all", "Pending", "In Progress", "Resolved"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              filter === s
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {s === "all" ? "All Complaints" : s}
          </button>
        ))}
      </div>

      {filteredComplaints.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-medium">No complaints in this category</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["ID", "Name", "Category", "Subject", "District", "Date", "Status", "Action"].map((h) => (
                    <th key={h} className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-bold text-gray-900">#{complaint.id}</td>
                    <td className="p-4 text-sm text-gray-600">{complaint.name}</td>
                    <td className="p-4 text-sm">
                      <span className="mr-1">{categoryEmoji[complaint.category] || "❓"}</span>{complaint.category}
                    </td>
                    <td className="p-4 text-sm text-gray-700 font-medium">{complaint.subject}</td>
                    <td className="p-4 text-sm text-gray-600">{complaint.district}</td>
                    <td className="p-4 text-sm text-gray-500">{new Date(complaint.submitted_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[complaint.status] || "bg-gray-100 text-gray-700"}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={complaint.status}
                        onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                        disabled={updatingId === complaint.id}
                        className="px-2 py-1 text-xs border border-gray-300 rounded-md font-medium text-gray-700 cursor-pointer hover:border-gray-400 disabled:opacity-50"
                      >
                        {statusOptions.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Impact Track ─────────────────────────────────────────────────────────────
function ImpactTrack() {
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    api.get("/impact").then(setLedger).catch(() => {});
  }, []);

  const catEmoji = {
    "Food Donation": "🍱", "Blood Donation": "🩸", "Medical Camp": "🏥",
    "Disaster Relief": "🆘", "Educational Assistance": "📚",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Transparency Ledger 📊</h1>
        <p className="text-gray-500 mt-1">Real-time distribution of funds and services across Tamil Nadu.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-gray-600">Live Verified Data</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Date", "Category", "Location", "Impact Details", "Status"].map((h) => (
                  <th key={h} className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ledger.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm text-gray-500">{row.date}</td>
                  <td className="p-4 text-sm font-semibold text-gray-800">
                    <span className="mr-1">{catEmoji[row.category] || "📌"}</span>{row.category}
                  </td>
                  <td className="p-4 text-sm text-gray-600">{row.location}</td>
                  <td className="p-4 text-sm text-gray-700">{row.impact}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                      ✓ {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [pendingModal, setPendingModal] = useState(null);
  const { notifications, addNotification, removeNotification } = useNotifications();

  const handleLogin = (r) => {
    setRole(r);
    setTab("dashboard");
    addNotification(`Logged in as ${r === "admin" ? "Administrator" : "Citizen"} ✓`);
  };

  const handleLogout = () => {
    setRole(null);
    setTab("dashboard");
    addNotification("Logged out successfully", "info");
  };

  const openModal = (type) => setPendingModal(type);

  if (!role) return (
    <>
      <LoginPage onLogin={handleLogin} />
      <NotificationArea notifications={notifications} onRemove={removeNotification} />
    </>
  );

  const pages = {
    dashboard: <Dashboard role={role} setTab={setTab} openModal={openModal} />,
    services: <LocalServices role={role} pendingModal={pendingModal === "service"} clearModal={() => setPendingModal(null)} />,
    schemes: <Schemes role={role} pendingModal={pendingModal === "scheme"} clearModal={() => setPendingModal(null)} />,
    donate: <Donate />,
    request: <RequestHelp />,
    volunteer: <Volunteer />,
    complaints: <Complaints role={role} />,
    impact: <ImpactTrack />,
  };

  return (
    <AppContext.Provider value={{ addNotification }}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation role={role} currentTab={tab} setTab={setTab} onLogout={handleLogout} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {pages[tab] || pages.dashboard}
          </div>
        </main>
        <NotificationArea notifications={notifications} onRemove={removeNotification} />
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </AppContext.Provider>
  );
}
