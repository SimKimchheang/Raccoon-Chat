import { useEffect, useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
} from 'firebase/firestore';
import { onAuthStateChanged, reload, updateProfile } from 'firebase/auth';
import raccoon1Img from '../assets/raccoon1.png'
import raccoon2Img from '../assets/raccoon2.png'
import raccoon3Img from '../assets/raccoon3.png'
import raccoon4Img from '../assets/raccoon4.png'
import raccoon5Img from '../assets/raccoon5.png'
import raccoon6Img from '../assets/raccoon6.png'
import raccoon7Img from '../assets/raccoon7.png'
import raccoon8Img from '../assets/raccoon8.png'
import raccoon9Img from '../assets/raccoon9.png'
import raccoon10Img from '../assets/raccoon10.png'
import raccoonIconImg from '../assets/raccoonIcon.png'
import { Search } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({
    username: auth.currentUser?.displayName || '',
    email: auth.currentUser?.email || '',
  });
  
  const profileItems = [
    {id: 'home', label: 'Home'},
    {id: 'profile', label: 'Profile'}
  ]
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const setRightMenu = () => {
    setOpenProfileMenu(!openProfileMenu);
  }

  const displayName = user.username || user.email?.split('@')[0] || 'User';
  console.log('user:', user);
  
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

  const [openLeftModal, setOpenLeftModal] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

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
        avatar: docData.avatar ?? null,
      });
    });

    return () => unsubscribe();
  }, [navigate]);
  
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);

    const searchValue = value
      .trim()
      .replace(/^@/, '')
      .toLowerCase();

    if (!searchValue) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);

      const handlesRef = collection(db, "handles");

      const q = query(
        handlesRef,
        where("__name__", ">=", searchValue),
        where("__name__", "<=", searchValue + "\uf8ff")
      );

      const snapshot = await getDocs(q);

      console.log("========== SEARCH DEBUG ==========");
      console.log("Searching for:", searchValue);
      console.log("Number of handles:", snapshot.size);

      snapshot.docs.forEach((handleDoc) => {
        console.log(
          "HANDLE FOUND:",
          handleDoc.id,
          handleDoc.data()
        );
      });

      const results = [];

      for (const handleDoc of snapshot.docs) {
        const handleData = handleDoc.data();

        console.log("UID:", handleData.uid);

        if (handleData.uid === auth.currentUser?.uid) {
          console.log("Skipping myself");
          continue;
        }

        const userRef = doc(db, "users", handleData.uid);
        const userSnap = await getDoc(userRef);

        console.log(
          "USER DOCUMENT:",
          handleData.uid,
          userSnap.exists() ? userSnap.data() : "DOES NOT EXIST"
        );

        if (userSnap.exists()) {
          results.push({
            id: userSnap.id,
            handle: handleDoc.id,
            ...userSnap.data(),
          });
        }
      }

      console.log("FINAL RESULTS:", results);
      console.log("================================");

      setSearchResults(results);

    } catch (err) {
      console.error("SEARCH ERROR:", err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };



  // ----------------------------------------------------------------


 return (
  <div className="h-screen w-full text-white flex overflow-hidden">
    {/* ------------------------- Left Sidebar ------------------------- */}
    {!openLeftModal ? (
      <aside className="w-15 flex items-center p-2 flex-col border border-slate-700 overflow-hidden bg-gray-900 duration-300">
        <img 
          src={raccoonIconImg} 
          alt="Icon" 
          onClick={() => {
            setOpenLeftModal(true);
            console.log('Opening left modal [home.jsx]');
          }}
          className="w-10 h-10 my-2 rounded-full object-cover border border-gray-700 cursor-pointer"
        />

        <div className='grid justify-center pt-5'>
          <Search
            size={19}
            strokeWidth={2}
            onClick={() => setOpenLeftModal(true)}
            className="text-slate-400 transition-colors duration-200 group-focus-within:text-purple-400"
          />

        </div>
        {/* --------------------- Chat Cards Section ------------------*/}
        <div className="mt-4 flex-1 overflow-y-auto thin-scrollbar"> 
          
        </div>
      </aside>

    ) : (
      <aside className="w-70 p-2 items-center flex flex-col bg-gray-900 border border-slate-700 overflow-hidden duration-300">
        <img 
          src={raccoonIconImg} 
          alt="Icon" 
          onClick={() => {
            setOpenLeftModal(false);
            console.log('Closing left modal [home.jsx]')
          }}
          className="w-10 h-10 my-2 rounded-full object-cover border border-gray-700 cursor-pointer"
        />
        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl">

            <Search
              size={18}
              className="text-slate-500"
            />

            <input
              value={search}
              onChange={handleSearch}
              placeholder="Search users..."
              className="w-full bg-transparent text-white placeholder:text-slate-500 outline-none focus:outline-none"
            />

          </div>
        </div>
        
        {search && (
          <div className="mt-2 space-y-2">

            {searching && (
              <p className="px-3 py-2 text-sm text-slate-500">
                Searching...
              </p>
            )}

            {!searching && searchResults.length === 0 && (
              <p className="px-3 py-2 text-sm text-slate-500">
                No users found.
              </p>
            )}

            {searchResults.map((person) => (
              <button
                key={person.id}
                type="button"
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-slate-800 transition-all duration-200"
              >

                {/* Avatar */}
                {person.avatar !== null && person.avatar !== undefined ? (
                  <img
                    src={raccoonAvatars[person.avatar]}
                    alt={person.username || 'User'}
                    className="w-11 h-11 rounded-full object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-lg font-bold">
                    {(person.username || 'U').charAt(0).toUpperCase()}
                  </div>
                )}

                {/* User information */}
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">
                    {person.username || 'User'}
                  </p>

                  <p className="text-sm text-slate-500 truncate">
                    @{person.handle}
                  </p>
                </div>

              </button>
            ))}

          </div>
        )}

      </aside>
    )}

    {/* ----------------------- Right Sidebar ----------------------- */}
    <main  className="flex-1 min-w-0 w-full h-screen thin-scrollbar flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* ----------------------- Top Right Navigate --------------------- */}
      <div className="h-[76px] flex items-center justify-end gap-4 px-5 border-b border-slate-700 bg-gradient-to-b from-slate-900 to-slate-900/50 flex-shrink-0 sticky top-0 z-10"
        >

        <div className="flex items-center gap-4 cursor-pointer"
          onClick={() => setRightMenu()}
        >
          <div className="relative">
            {user?.avatar !== null && user?.avatar !== undefined ? (
              <img
                src={raccoonAvatars[user.avatar]}
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

      {/* ----------------------- Right Profile Menu --------------------- */}
      {openProfileMenu && (
        <div className="absolute top-16 right-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-2 z-50 font-semibold">
          <div className='px-4'>
            <h2 className='border-b pb-1 mb-3 border-slate-400'>{displayName}</h2>
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
                      ? "text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-700/50 hover:text-slate-100"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}


      {/* --------------------------- Content ---------------------------- */}
      <div>
        {/* Replace Profile to display only page */}
        <Outlet />
      </div>
    </main>

  </div>
 )
}