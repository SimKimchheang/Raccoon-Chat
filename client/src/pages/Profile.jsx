import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);
    const displayName = user?.username || user?.email?.split('@')[0] || 'User';

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      <aside className="w-72 bg-slate-800 p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-purple-500">My Profile</h2>
        <nav className="space-y-3">
          <h2 className="text-lg font-medium text-slate-300 ">
            Welcome, {displayName}!
            {user?.email === 'admin@gmail.com' && (
            <span className="ml-2">
              <span className="text-blue-600">✓</span>
              <span className="ml-2 text-yellow-400">(Admin)</span>
            </span>
            )}
          </h2>
          <p className="text-slate-400">Email: {user?.email}</p>
        </nav>
      {/* -------------------------- Sign Out ---------------------- */}
      <span
        className='text-red-600 text-lg cursor-pointer hover:text-red-400 transition-colors'
        onClick={async () => {
          try {
            await auth.signOut();
            navigate("/landingpage/login");
          } catch (error) {
            console.error("Error signing out:", error);
          }
        }} 
        >
        Sign Out
      </span>

      </aside>

      <main className="flex-1 bg-slate-950 p-10">
        <h1 className="text-4xl font-bold mb-4 text-purple-500">Profile Page</h1>
        <p className="text-lg text-slate-300">This is the profile page.</p>
      </main>
    </div>
  );
}