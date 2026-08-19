import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PersonalInformation from "./PersonalInformation";
import EmailAndPassword from "./EmailAndPassword";
import Social from "./Social";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  const navItems = [
    { id: "personal", label: "Personal Information" },
    { id: "security", label: "Email & Password" },
    { id: "social", label: "Social Accounts"}
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-slate-800 to-slate-900 p-6 shadow-2xl border-r border-slate-700 sticky top-0 h-screen">
        <div className="mb-8">
          <Link 
            to="/home/profile" 
            className='inline-flex items-center text-slate-400 hover:text-purple-400 transition-colors mb-6'
          >
            ← Back to Profile
          </Link>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Settings
          </h2>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Card */}
        <div className="mt-8 p-4 bg-slate-700/30 rounded-lg border border-slate-600 backdrop-blur">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Currently Logged In</p>
          <p className="font-semibold text-slate-100">{displayName}</p>
          <p className="text-sm text-slate-400 truncate">{user?.email}</p>
        </div>
      </aside>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto p-10">
        {activeTab === "personal" && <PersonalInformation />}
        {activeTab === "security" && <EmailAndPassword />}
        {activeTab === "social" && <Social/>}
      </main>
    </div>
  );
}
