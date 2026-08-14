import { onAuthStateChanged, reload, sendEmailVerification } from "firebase/auth";
import { auth } from "../../services/firebase";
import { use, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationSent, setVerification] = useState(false);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const setRightMenu = () => {
    setOpenProfileMenu(!openProfileMenu);
  }

  const profileItems = [
    {id: 'home', label: 'Home'},
    {id: 'profile', label: 'Profile'}
  ]

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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <aside className="w-72 bg-gradient-to-b from-slate-800 to-slate-900 p-6 shadow-2xl border-r border-slate-700">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">Raccoon</h2>
          <p className="text-xs text-slate-400 uppercase tracking-wider">My Profile</p>
        </div>
        
        {/* User Avatar Section */}
        <div className="mb-8 p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg backdrop-blur">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <p className="text-center font-semibold text-slate-100">{displayName}</p>
          <p className="text-center text-sm text-slate-400 break-all">{user?.email}</p>
        </div>

        {/* Account Status */}
        <div className="space-y-3 mb-6">
          {user?.emailVerified ? (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Email Verified
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-sm">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                Pending Verification
              </div>
              <button
                className="w-full px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 rounded text-sm font-medium transition-all"
                onClick={async () => {
                  try {
                    await sendEmailVerification(user);
                    setVerificationSent(true);
                  } catch (error) {
                    console.error('Error sending verification email:', error);
                  }
                }}
              >
                Verify Email
              </button>
              {verificationSent && (
                <p className="text-green-400 text-xs text-center animate-pulse">✓ Verification email sent!</p>
              )}
            </div>
          )}
          
          {user?.email === 'chheang097kim@gmail.com' && (
            <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-sm">
              <span className="text-lg">👑</span>
              Admin Account
            </div>
          )}
        </div>

        <div className='py-3 border-t border-slate-700 space-y-2'>
          <Link to="/home/profile/settings" className='block px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded text-slate-300 hover:text-purple-400 transition-colors font-medium'>
            ⚙️ Settings
          </Link>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={async () => {
            try {
              await auth.signOut();
              navigate("/landingpage/login");
            } catch (error) {
              console.error("Error signing out:", error);
            }
          }} 
          className='w-full mt-4 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded text-red-400 hover:text-red-300 transition-all font-medium'
        >
          Sign Out
        </button>
      </aside>

      <main className="flex-1 p-10 overflow-auto">
        {/* Header Section */}
        <div className="mb-10 flex">
          <div className="grid">
            <h1 className="text-5xl p-2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-3">
              Welcome Back, {displayName}! 👋
            </h1>
            <p className="text-slate-400 text-lg">Manage your account and privacy settings</p>
          </div>

          {/* Profile Icon */}
          <div className="flex absolute right-10 items-center gap-4 cursor-pointer"
            onClick={() => setRightMenu()}
          >
            <div className="relative">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border border-gray-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-2xl font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {openProfileMenu && (
            <div className="absolute top-12 right-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-2 z-50">
              {profileItems.map((item) => {
                const isActive = (item.id === 'home' && location.pathname === '/home') || 
                                (item.id === 'profile' && location.pathname === '/home/profile');
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.id === 'home' ? '/home' : '/home/profile');
                      setOpenProfileMenu(false);
                    }}
                    className={`block w-full text-left px-4 py-2 rounded transition-all duration-300 font-medium ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}


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

        {/* Account Details Section */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-purple-500 transition-all">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">Account Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-700/30 rounded border border-slate-600">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Display Name</label>
              <p className="text-xl font-bold text-white mt-2">{displayName}</p>
            </div>
            
            <div className="p-4 bg-slate-700/30 rounded border border-slate-600">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Email Address</label>
              <p className="text-lg font-semibold text-white mt-2 break-all">{user?.email}</p>
            </div>
            
            <div className="p-4 bg-slate-700/30 rounded border border-slate-600">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">User ID</label>
              <p className="text-sm text-slate-300 mt-2 break-all font-mono">{user?.uid}</p>
            </div>
            
            <div className="p-4 bg-slate-700/30 rounded border border-slate-600">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Account Created</label>
              <p className="text-lg font-semibold text-white mt-2">{user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-400 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link to="/home/profile/settings" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded font-medium transition-all hover:shadow-lg hover:shadow-purple-500/30">
              Edit Settings
            </Link>
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-medium transition-all">
              Change Password
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}