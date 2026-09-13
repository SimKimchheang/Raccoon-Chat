import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, UserCog, SunMoon, Book } from "lucide-react";

export default function Settings() {
  const [user, setUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

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
    {
      id: "manage",
      icon: UserCog,
      label: "Manage My Account",
    },
    {
      id: "language",
      icon: Book,
      label: "Language",
    },
    {
      id: "theme",
      icon: SunMoon,
      label: "Theme",
    },
  ];

  // Are we exactly on /home/settings?
  const isSettingsRoot =
    location.pathname === "/home/settings" ||
    location.pathname === "/home/settings/";

  return (
    <div
      className="
        w-full
        min-h-screen
        overflow-hidden
        flex
        flex-row
        bg-gradient-to-br
        from-slate-950
        via-slate-900
        to-slate-950
      "
    >

      {/* =========================
          SETTINGS SIDEBAR
          ========================= */}

      <aside
        className={`
          h-screen
          bg-black
          border-r
          border-white
          p-6
          shadow-2xl
          w-full
          lg:w-[300px]
          lg:flex-shrink-0
          overflow-y-auto
          thin-scrollbar

          ${isSettingsRoot ? "flex flex-col" : "hidden lg:flex lg:flex-col"}
        `}
      >

        {/* Header */}

        <div className="mb-8 px-3 flex items-center gap-2">
          <Link
            to="/home"
            className="
              text-slate-400
              transition-colors
              hover:text-purple-400
            "
          >
            <ArrowLeft />
          </Link>

          <h2
            className="
              text-2xl
              font-bold
              text-transparent
              bg-clip-text
              bg-gradient-to-r
              from-purple-400
              to-pink-600
            "
          >
            Settings
          </h2>
        </div>

        {/* Navigation */}

        <nav className="grid gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                disabled={item.id !== "manage"}
                key={item.id}
                onClick={() => {
                  navigate(`/home/settings/${item.id}`);
                }}
                className={`" ${item.id !== "manage" ? 'cursor-not-allowed' : 'cursor-pointer'}
                  flex
                  items-center
                  gap-2
                  w-full
                  rounded-lg
                  px-4
                  py-3
                  text-left
                  font-medium
                  text-slate-300
                  hover:bg-slate-700/50
                  hover:text-slate-100
                  transition-all
                "`}
              >
                <Icon />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Card */}

        <div
          className="
            mt-8
            w-full
            max-w-[250px]
            rounded-lg
            border
            border-slate-600
            bg-slate-700/30
            p-4
          "
        >
          <p
            className="
              mb-2
              text-xs
              uppercase
              tracking-wider
              text-slate-400
            "
          >
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


      {/* =========================
          MAIN CONTENT
          ========================= */}

      <main
        className={`
          flex-1
          h-screen
          min-w-0
          overflow-y-auto
          thin-scrollbar
          bg-black
          p-4
          animate-in

          ${isSettingsRoot ? "hidden lg:block" : "block"}
        `}
      >
        <Outlet />
      </main>

    </div>
  );
}