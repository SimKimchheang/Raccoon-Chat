import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PersonalInformation from "./PersonalInformation";
import EmailAndPassword from "./EmailAndPassword";
import Social from "./Social";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const displayName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "User";

  const navItems = [
    { id: "personal", label: "Personal Information" },
    { id: "security", label: "Email & Password" },
    { id: "social", label: "Social Accounts" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white lg:flex-row">

      {/* Sidebar */}
      <aside
        className="
          w-full
          border-b border-slate-700
          bg-gradient-to-b from-slate-800 to-slate-900
          p-4 shadow-2xl
          lg:sticky lg:top-0 lg:h-screen
          lg:w-72
          lg:flex-shrink-0
          lg:border-b-0 lg:border-r
          lg:p-6
        "
      >
        {/* Header */}
        <div className="mb-5 lg:mb-8">
          <Link
            to="/home/profile"
            className="
              inline-flex items-center gap-2
              text-sm text-slate-400
              transition-colors
              hover:text-purple-400
            "
          >
            ← Back to Profile
          </Link>

          <h2
            className="
              mt-4
              text-2xl font-bold
              text-transparent
              bg-clip-text
              bg-gradient-to-r from-purple-400 to-pink-600
            "
          >
            Settings
          </h2>
        </div>

        {/* Navigation */}
        <nav
          className="
            flex gap-2 overflow-x-auto
            pb-2
            lg:block lg:space-y-2
            lg:overflow-visible
            lg:pb-0 thin-scrollbar
          "
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                flex-shrink-0
                whitespace-nowrap
                rounded-lg
                px-4 py-3
                text-left
                font-medium
                transition-all duration-300

                lg:w-full

                ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-slate-100"
                }
              `}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Card */}
        <div
          className="
            mt-5 
            rounded-lg
            border border-slate-600
            bg-slate-700/30
            p-4
            backdrop-blur
            lg:mt-8
          "
        >
          <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">
            Currently Logged In
          </p>

          <p className="font-semibold text-slate-100">
            {displayName}
          </p>

          <p className="truncate text-sm text-slate-400">
            {user?.email}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="
          min-w-0
          flex-1 
          overflow-y-auto
          p-4
          sm:p-6
          lg:p-10
        "
      >
        {activeTab === "personal" && <PersonalInformation />}

        {activeTab === "security" && <EmailAndPassword />}

        {activeTab === "social" && <Social />}
      </main>
    </div>
  );
}

