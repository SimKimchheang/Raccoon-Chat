import { useState, useEffect } from "react";
import { onAuthStateChanged, reload, sendEmailVerification} from "firebase/auth";
import { auth } from "../../services/firebase";
import { Crown, Mail, ChartColumn, User   } from "lucide-react";

export default function ProfileOverview() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

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
          <div className="
              text-xl
              sm:text-4xl
              lg:text-5xl
              p-2
              font-bold
              text-transparent
              bg-clip-text
              bg-gradient-to-r from-purple-400 to-pink-600
              mb-3 flex gap-3
            ">
              <p className="text-slate-500">
                Welcome Back,
              </p>
              {displayName} !
          </div>
          <p className="text-slate-400 text-lg">Manage your account and privacy settings</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Account Status Card */}
        <div className="bg-gray-900/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm uppercase tracking-wider text-purple-400 font-semibold">Account Status</h3>
            <span className="text-2xl"><ChartColumn /></span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <p className="text-lg font-semibold text-green-400">Active</p>
          </div>
          <p className="text-xs text-slate-400 mt-3">Last login: Just now</p>
        </div>

        {/* Email Status Card */}
        <div className="bg-gray-900/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm uppercase tracking-wider text-purple-400 font-semibold">Email Status</h3>
            <span className="text-2xl"><Mail /></span>
          </div>
          <p className="text-sm text-slate-300 break-all">{user?.email}</p>
          <div className="mt-3">
            {user?.emailVerified ? (
              <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">✓ Verified</span>
            ) : (<>
              <span 
                title="Click to resend verification email"
                className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium cursor-pointer" 
                onClick={() => {
                  sendEmailVerification(user);
                  setMessage("Verification email sent! Please check your inbox.");
                }}>
                ⚠ Unverified 
              </span>
              <span className="text-xs text-slate-400"> {message}</span>
              </>
            )}
          </div>
        </div>

        {/* Account Type Card */}
        <div className="bg-gray-900/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm uppercase tracking-wider text-purple-400 font-semibold">Account Type</h3>
            <span className="text-2xl"><User /></span>
          </div>
          <p className="text-lg font-semibold mt-3">
            {user?.email === 'chheang097kim@gmail.com' ? (
              <span className="text-yellow-400 flex gap-2">Administrator <Crown /> </span>
            ) : (
              <span className="text-slate-300">Standard User</span>
            )}
          </p>
        </div>
      </div>

    </div>
  );
}
