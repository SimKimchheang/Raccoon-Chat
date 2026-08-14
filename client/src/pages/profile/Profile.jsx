import { onAuthStateChanged, reload } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if(currentUser) {
        await reload(currentUser);
        setUser(auth.currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();

  }, []);
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      <aside className="w-72 bg-slate-800 p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-purple-500">My Profile</h2>
        <nav className="space-y-3">
          <h2 className="text-lg font-medium text-slate-300 ">
            Welcome, {displayName}!
            {user?.email === 'admin@raccoon.com' && (
            <span className="ml-2">
              <span className="text-blue-600">✓</span>
              <span className="ml-2 text-yellow-400">(Admin)</span>
            </span>
            )}
          </h2>
          {user?.emailVerified ? (
            <p className="text-green-500">✓ Email Verified</p>
          ) : (
            <p className="text-red-500">Email Not Verified</p>
          )}
          <p className="text-slate-400">User ID: {user?.uid}</p>
          <p className="text-slate-400">Email: {user?.email}</p>
        </nav>

        <div className='py-2 border-t border-slate-700 mt-4 mb-2'>
          <Link to="/home/profile/settings" className='text-slate-400 cursor-pointer hover:text-slate-300'>Settings</Link>
        </div>

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