import { onAuthStateChanged, reload } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useLocation, useViewTransitionState } from "react-router-dom";
import ProfileOverview from "./ProfileOverview";
import AccountDetails from "./AccountDetails";
import { Settings, Crown, LogOut, User2, Cake, Pencil, Merge } from "lucide-react";
import raccoon1Img from '../../assets/raccoon1.png'
import raccoon2Img from '../../assets/raccoon2.png'
import raccoon3Img from '../../assets/raccoon3.png'
import raccoon4Img from '../../assets/raccoon4.png'
import raccoon5Img from '../../assets/raccoon5.png'
import raccoon6Img from '../../assets/raccoon6.png'
import raccoon7Img from '../../assets/raccoon7.png'
import raccoon8Img from '../../assets/raccoon8.png'
import raccoon9Img from '../../assets/raccoon9.png'
import raccoon10Img from '../../assets/raccoon10.png'


export default function Profile() {
  const [avatar, setAvatar] = useState(null);
  const [user, setUser] = useState(null);
  const [birthday, setBirthday] = useState('');
  const [country, setCountry] = useState('');
  const [sex, setSex] = useState('');
  const [relationship, setRelationship] = useState('');
  const [employment, setEmployment] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const [openAvatar, setOpenAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const raccoonAvatars = [
  raccoon1Img,
  raccoon2Img,
  raccoon3Img,
  raccoon4Img,
  raccoon5Img,
  raccoon6Img,
  raccoon7Img,
  raccoon8Img,
  raccoon9Img,
  raccoon10Img,
];

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
      if (!currentUser) {
        setAvatar(null);
        setSex('');
        setRelationship('');
        setEmployment('');
        setBirthday('');
        setCountry('');
        return;
      }

      await reload(currentUser);
      setUser(currentUser);

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setAvatar(userData.avatar ?? null);
          setSex(userData.sex || '');
          setRelationship(userData.relationship || '');
          setEmployment(userData.employment || '');
          setBirthday(userData.birthday || '');
          setCountry(userData.country || '');
        
        }  
      } catch (err) {
        console.error("Error fetching:", err);
      }
    });
    return () => unsubscribe();
  }, []);

  // Avatar Handling
  const handleAvatar = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log("You must be logged in");
      return;
    }

    try {
      if (selectedAvatar === null) return;

      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          avatar: selectedAvatar,
        },
        { merge: true }
      );

      setAvatar(selectedAvatar);
      setOpenAvatar(false);

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      <aside className="w-72 h-screen bg-gradient-to-b thin-scrollbar from-slate-800 to-slate-900 p-6 shadow-2xl border-r border-slate-700 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">Raccoon</h2>
          <p className="text-xs text-slate-400 uppercase tracking-wider">My Profile</p>
        </div>
        
        {/* User Avatar Section */}
        <div className="mb-8 relative p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg backdrop-blur">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg">
            
            {avatar !== null ? (
              <img 
                src={raccoonAvatars[avatar]}
                alt="Avatar"
                className='h-20 w-20 rounded-full object-cover'
               />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}

            <Pencil 
              size={18} 
              onClick={() => setOpenAvatar(true)}
              className="absolute right-20 bottom-20 cursor-pointer"
            ></Pencil>
          </div>
          <p className="text-center font-semibold text-slate-100">{displayName}</p>
          <p className="text-center text-sm text-slate-400 break-all">{user?.email}</p>
          <p className="text-center text-sm text-blue-700 break-all">Joined {user?.metadata?.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString()
                : 'N/A'}
          </p>
        </div>

        {/* Open Avatar-Box Modal */}
        {openAvatar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-[500px] rounded-2xl bg-gray-800 p-6 shadow-2xl">

              <h2 className="mb-6 text-xl font-semibold text-white">
                Choose your avatar
              </h2>

              {/* Avatar Cards */}
              <div className="grid grid-cols-5 gap-4">
                {raccoonAvatars.map((avatar, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedAvatar(index)}
                    className={`rounded-xl border-2 p-1 transition
                      ${
                        selectedAvatar === index
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-transparent hover:border-purple-500 hover:bg-gray-700"
                      }
                    `}
                  >
                    <img
                      src={avatar}
                      alt={`Raccoon avatar ${index + 1}`}
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                  </button>

                ))}
              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(avatar)
                    setOpenAvatar(false);
                  }}
                  className="rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleAvatar}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-500"
                >
                  Save
                </button>

                
              </div>

            </div>
          </div>
        )}

        {/* Personal Card */}
        <div className="mb-8 rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-black/80 p-5 shadow-xl backdrop-blur-md">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Personal Info
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                A little about you
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-700/50 text-slate-300">
              <User2></User2>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-3">

            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 transition hover:bg-slate-700/40">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Sex
              </p>
              <p className="break-words text-sm font-semibold text-slate-200">
                {sex || "Not set"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 transition hover:bg-slate-700/40">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Relationship Status
              </p>
              <p className="break-words text-sm font-semibold text-slate-200">
                {relationship || "Not Set"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 transition hover:bg-slate-700/40">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Employment Status
              </p>
              <p className="break-words text-sm font-semibold text-slate-200">
                {employment || "Not Set"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 transition hover:bg-slate-700/40">
              <p className="mb-1 flex text-xs font-medium uppercase tracking-wider text-slate-500">
                Birthday
              </p>
              <p className="break-words text-sm font-semibold text-slate-200">
                {birthday || "Not set"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 transition hover:bg-slate-700/40">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Country
              </p>
              <p className="break-words text-sm font-semibold text-slate-200">
                {country || "Not set"}
              </p>
            </div>


          </div>
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

      <main className="flex-1 min-w-0 h-screen thin-scrollbar flex flex-col h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex gap-4 px-5 pt-5 pb-4 border-b border-slate-700 bg-gradient-to-b from-slate-900 to-slate-900/50 flex-shrink-0 sticky top-0 z-10">
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
            <div className="absolute top-15 right-5 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-2 z-50">
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