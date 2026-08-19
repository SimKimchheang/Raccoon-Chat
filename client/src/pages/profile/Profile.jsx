import { onAuthStateChanged, reload } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileOverview from "./ProfileOverview";
import AccountDetails from "./AccountDetails";
import { Settings, Crown, LogOut } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [openProfileMenu, setOpenProfileMenu] = useState(false);

  const setRightMenu = () => {
    setOpenProfileMenu(!openProfileMenu);
  }

  const profileItems = [
    {id: 'home', label: 'Home'},
    {id: 'profile', label: 'Profile'}
  ]

  const profileTabs = [
    {id: 'overview', label: 'Overview'},
    {id: 'details', label: 'Account Details'}
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      <aside className="w-72 bg-gradient-to-b from-slate-800 to-slate-900 p-6 shadow-2xl border-r border-slate-700 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">Raccoon</h2>
          <p className="text-xs text-slate-400 uppercase tracking-wider">My Profile</p>
        </div>
        
        {/* User Avatar Section */}
        <div className="mb-8 p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg backdrop-blur overflow-y-auto">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <p className="text-center font-semibold text-slate-100">{displayName}</p>
          <p className="text-center text-sm text-slate-400 break-all">{user?.email}</p>
        </div>

        {/* Account Status */}
        <div className="space-y-3 mb-6">
          {user?.emailVerified ? (
            <div className="flex pl-5 items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Email Verified
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-sm">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              Pending Verification
            </div>
          )}
          
          {user?.email === 'chheang097kim@gmail.com' && (
            <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-sm">
              <span className="text-lg pl-1">
                <Crown size={18}/>
              </span>
              Admin Account
            </div>
          )}
        </div>

        <div className='py-3 border-t border-slate-700 space-y-2'>
          <button 
            onClick={() => navigate('/home/profile/settings')}
            className='flex items-center gap-2 w-full text-left px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded text-slate-300 hover:text-purple-400 transition-colors font-medium'
          >
            <Settings size={18}/> Settings
          </button>
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
          className='flex items-center gap-2 w-full mt-4 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded text-red-400 hover:text-red-300 transition-all font-medium'
        >
          <LogOut size={18}/> Sign Out
        </button>
      </aside>

      <main className="flex-1 flex flex-col h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex gap-4 px-10 pt-10 pb-4 border-b border-slate-700 bg-gradient-to-b from-slate-900 to-slate-900/50 flex-shrink-0 sticky top-0 z-10">
          {profileTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition-all rounded-t-lg ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Profile Icon and Menu */}
          <div className="ml-auto flex items-center gap-4 cursor-pointer"
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
            <div className="absolute top-24 right-10 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-2 z-50">
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

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-10">
          {activeTab === 'overview' && <ProfileOverview />}
          {activeTab === 'details' && <AccountDetails />}
        </div>
      </main>
    </div>
  );
}