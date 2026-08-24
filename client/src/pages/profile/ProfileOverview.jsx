import { useState, useEffect } from "react";
import { onAuthStateChanged, reload} from "firebase/auth";
import { auth } from "../../services/firebase";

export default function ProfileOverview() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await reload(currentUser);
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <div>
      {/* Header Section */}
      <div className="mb-10">
        <div className="grid">
          <h1 className="text-5xl p-2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-3">
            Welcome Back, {displayName}! 👋
          </h1>
          <p className="text-slate-400 text-lg">Manage your account and privacy settings</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Account Status Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm uppercase tracking-wider text-purple-400 font-semibold">Account Status</h3>
            <span className="text-2xl">📊</span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <p className="text-lg font-semibold text-green-400">Active</p>
          </div>
          <p className="text-xs text-slate-400 mt-3">Last login: Just now</p>
        </div>

        {/* Email Status Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm uppercase tracking-wider text-purple-400 font-semibold">Email Status</h3>
            <span className="text-2xl">✉️</span>
          </div>
          <p className="text-sm text-slate-300 break-all">{user?.email}</p>
          <div className="mt-3">
            {user?.emailVerified ? (
              <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">✓ Verified</span>
            ) : (
              <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium">⚠ Unverified</span>
            )}
          </div>
        </div>

        {/* Account Type Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm uppercase tracking-wider text-purple-400 font-semibold">Account Type</h3>
            <span className="text-2xl">👤</span>
          </div>
          <p className="text-lg font-semibold mt-3">
            {user?.email === 'chheang097kim@gmail.com' ? (
              <span className="text-yellow-400">👑 Administrator</span>
            ) : (
              <span className="text-slate-300">Standard User</span>
            )}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-lg">
        <h3 className="text-lg font-semibold text-purple-400 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded font-medium transition-all hover:shadow-lg hover:shadow-purple-500/30">
            Edit Settings
          </button>
          <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-medium transition-all">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}
