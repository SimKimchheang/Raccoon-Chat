import { useEffect, useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, reload, updateProfile } from 'firebase/auth';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({
    username: auth.currentUser?.displayName || '',
    email: auth.currentUser?.email || '',
  });

  const displayName = user.username || user.email?.split('@')[0] || 'User';
  console.log('user:', user);

  // ----------------------------------------------------------------

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser) {
        console.log("Not logged in");
        navigate("/login");
        return;
      }

      await reload(currentUser);
      console.log('AUTH EMAIL:', currentUser.email);
      console.log("Logged in:", currentUser.uid);

      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      const docData = docSnap.exists() ? docSnap.data() : {};

      console.log('FIRESTORE EMAIL:', docData.email);

      setUser({
        username: docData.username || currentUser.displayName || '',
        email: currentUser.email || '',
      });
    });

    return () => unsubscribe();
  }, [navigate]);

  // ----------------------------------------------------------------
  const [isOpen, setIsOpen] = useState(false);
  const openSidebar = () => {
    setIsOpen(!isOpen);
  };

  const profileItems = [
    {id: 'home', label: 'Home'},
    {id: 'profile', label: 'Profile'}
  ]
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const setRightMenu = () => {
    setOpenProfileMenu(!openProfileMenu);
  }

 return (
  <div className="h-screen w-full bg-gray-900 text-white flex overflow-hidden">

    {/* ------------------------- Left Sidebar ------------------------- */}
    <section className="w-80 min-w-[20rem] flex flex-col bg-gray-800 p-6 overflow-hidden">

      {/* Search Section*/}
      <div className="flex gap-2 pb-2 sticky top-0 left-0 right-0 bg-gray-800 z-10">
        <input
          placeholder="Search..."
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* --------------------- Group Chat Section ------------------*/}
      <div className="mt-4 flex-1 overflow-y-auto thin-scrollbar"> 
        
      </div>
    </section>

    {/* ----------------------- Right Sidebar ----------------------- */}
    <section className="flex-1 flex flex-col overflow-hidden p-2">

      {/* ----------------------- Top Right Navigate --------------------- */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-purple-500">Raccoon</h1>

        <div className="flex items-center gap-4 cursor-pointer"
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
      </div>

      {/* ----------------------- Right Sidebar Menu --------------------- */}
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


      {/* --------------------------- Content ---------------------------- */}
      <div>
        {/* Replace Profile to display only page */}
        <Outlet />
      </div>
    </section>

    {/* ----------------------- Left Sidebar Nav ------------------------- */}
    


  </div>
 )
}