import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import { onAuthStateChanged, reload } from 'firebase/auth';
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
import raccoonForAdminImg1 from '../assets/raccoonForAdmin1.png'
import raccoonForAdminImg2 from '../assets/raccoonForAdmin2.png'
import raccoonForAdminImg3 from '../assets/raccoonForAdmin3.png'
import { Search, HomeIcon, User2, Settings, Menu, LogOut } from 'lucide-react';

 
export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({
    username: auth.currentUser?.displayName || '',
    email: auth.currentUser?.email || '',
  });
  
  const profileItems = [
    {id: 'home', icon: HomeIcon, label: 'Home'},
    {id: 'profile', icon: User2, label: 'Profile'},
    {id: 'settings', icon: Settings, label: 'Settings'}
  ]
  

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
  raccoonForAdminImg1,
  raccoonForAdminImg2,
  raccoonForAdminImg3
  ];

  const [openLeftModal, setOpenLeftModal] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [searchHistory, setSearchHistory] = useState([]);

  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const setRightMenu = () => {
    setOpenProfileMenu(!openProfileMenu);
  }

  const [isLoading, setIsLoading] = useState(true);

  const [isOpenedLogout, setIsOpenedLogout] = useState(false);

  // ----------------------------------------------------------------

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        console.log("Not logged in");
        setIsLoading(false);
        navigate("/login");
        return;
      }

      setIsLoading(true);

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

      const historyIds = Array.isArray(docData.searchHistory)
        ? docData.searchHistory.filter((personId) => typeof personId === 'string')
        : [];
      const historyPeople = await Promise.all(
        historyIds.map(async (personId) => {
          const historyPersonSnap = await getDoc(doc(db, "users", personId));
          return historyPersonSnap.exists()
            ? { id: historyPersonSnap.id, ...historyPersonSnap.data() }
            : null;
        }),
      );

      setSearchHistory(historyPeople.filter(Boolean));
      setIsLoading(false);
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

  const handleSearchHistory = async (person) => {
    const personId = person.id;
    const currentUser = auth.currentUser;
    if(!currentUser) {
      console.log('You must be logged in!');
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      const existUserSearch = userSnap.exists()
          ? userSnap.data().searchHistory || [] : []
      ;
      
      console.log('EXISTING SEARCH HISTORY:', existUserSearch);

      // Person that was clicked
      const personRef = doc(db, 'users', personId);
      const personSnap = await getDoc(personRef);
      console.log('PERSON DOCUMENT:', 
        personId, personSnap.exists() ? personSnap.data() : "DOES NOT EXIST"
      );

      if (!personSnap.exists()) {
        console.log('Person does not exist!');
        return;
      }

      // Create new history
      const updatedHistory = [
        personId, 
        ...existUserSearch.filter((id) => id !== personId),
      ].slice(0, 10);

      console.log('UPDATED SEARCH HISTORY:', updatedHistory);

      // Save to firestore
      await updateDoc(userRef, {
        searchHistory: updatedHistory,
      });

      setSearchHistory([
        person,
        ...searchHistory.filter((historyPerson) => historyPerson.id !== personId),
      ].slice(0, 10));
    } catch (err) {
      console.log("SEARCH HISTORY ERROR:",err);
    }
  }

  // ----------------------------------------------------------------


 return (
   <div className="h-screen w-full text-white flex overflow-hidden">
      {/* ------------------------- Left Sidebar ------------------------- */}
      {!openLeftModal ? (
        <aside
          className="
            w-15
            hidden lg:flex
            bg-black
            items-center
            p-2 pt-4
            flex-col
            border-r border-slate-900
            overflow-hidden
            duration-300
          "
        >
          <Menu
            className="mt-4 cursor-pointer"
            onClick={() => setOpenLeftModal(true)}
          />

          <div className="grid justify-center pt-5">
            <Search
              size={19}
              strokeWidth={2}
              onClick={() => setOpenLeftModal(true)}
              className="
                text-slate-400
                cursor-pointer
                transition-colors
                duration-200
              "
            />
          </div>

          <div className="mt-4 flex-1 overflow-y-auto thin-scrollbar" />
        </aside>
      ) : (
        <aside
          className="
            fixed lg:static
            inset-y-0 left-0
            z-40
            w-80
            p-2
            bg-black
            flex flex-col
            border border-slate-700
            overflow-hidden
            duration-300
          "
        >
          <div className="w-full flex justify-between px-5 my-4">
            <h2
              className="
                text-2xl font-bold text-transparent
                bg-clip-text
                bg-gradient-to-r
                from-purple-400
                to-pink-600
              "
            >
              Raccoon
            </h2>

            <Menu
              className="mt-2 cursor-pointer"
              onClick={() => setOpenLeftModal(false)}
            />
          </div>

          {/* Search */}
          <div className="relative w-full">
            <div
              className="
                flex items-center gap-2
                px-3 py-2
                bg-gray-900/50
                border border-slate-700
                rounded-xl
              "
            >
              <Search size={18} className="text-slate-500 shrink-0" />

              <input
                value={search}
                onChange={handleSearch}
                placeholder="Search users..."
                className="
                  w-full
                  min-w-0
                  bg-transparent
                  text-white
                  placeholder:text-slate-500
                  outline-none
                "
              />
            </div>
          </div>

          {/* Search results */}
          {search && (
            <div className="mt-2 space-y-2 overflow-y-auto">
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
                  onClick={() => {
                    navigate(`/home/profile/${person.id}`);
                    setSearch("");
                    handleSearchHistory(person);
                    setSearchResults([]);
                    setOpenLeftModal(false);
                  }}
                  className="
                    w-full 
                    flex items-center gap-3
                    p-3
                    rounded-xl
                    text-left
                    hover:bg-slate-800
                    transition-all duration-200
                  "
                >
                  {person.avatar !== null &&
                  person.avatar !== undefined ? (
                    <img
                      src={raccoonAvatars[person.avatar]}
                      alt={person.username || "User"}
                      className="
                        w-11 h-11
                        shrink-0
                        rounded-full
                        object-cover
                        border border-slate-700
                      "
                    />
                  ) : (
                    <div
                      className="
                        w-11 h-11
                        shrink-0
                        rounded-full
                        bg-gradient-to-br
                        from-purple-400
                        to-pink-600
                        flex items-center justify-center
                        text-lg font-bold
                      "
                    >
                      {(person.username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">
                      {person.username || "User"}
                    </p>

                    <p className="text-sm text-slate-500 truncate">
                      @{person.handle}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {isLoading &&
            <div className='text-center my-4 text-slate'>
              Loading...
            </div>
          }

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className='mt-2 space-y-2 overflow-y-auto'>
              <h3 className='px-3 py-2 text-sm text-slate-500'>Recent Searches</h3>
              {searchHistory.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => {
                    const isLargeScreen = window.innerWidth >= 1024;
                    
                    if (isLargeScreen) {
                      navigate(`/home/profile/${person.id}/chatMessage`);
                    } else {
                      navigate(`/home/profile/${person.id}`, {replace: true});
                    }
                    setOpenLeftModal(false);
                  }}
                  className="
                    flex items-center gap-3
                    p-3
                    rounded-xl
                    text-left
                    hover:bg-slate-800
                    transition-all duration-200
                  "
                >
                  {person.avatar !== null &&
                  person.avatar !== undefined ? (
                    <img
                      src={raccoonAvatars[person.avatar]}
                      alt={person.username || "User"}
                      className="
                        w-11 h-11
                        shrink-0
                        rounded-full
                        object-cover
                        border border-slate-700
                      "
                    />
                  ) : (
                    <div
                      className="
                        w-11 h-11
                        shrink-0
                        rounded-full
                        bg-gradient-to-br
                        from-purple-400
                        to-pink-600
                        flex items-center justify-center
                        text-lg font-bold
                      "
                    >
                      {(person.username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">
                      {person.username || "User"}
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



     {/* ----------------------- Right Content ----------------------- */}
     <main className="flex-1 min-w-0 w-full bg-black h-screen flex flex-col overflow-hidden">

        {/* ----------------------- Top Right Navigate --------------------- */}
      <div
        className="
          h-[60px]
          flex items-center
          justify-between
          lg:justify-end
          gap-4
          px-5
          border-b border-slate-700
          bg-black
          flex-shrink-0
          sticky top-0 z-10
        "
       >

        { !openLeftModal && (   
          <Menu 
            className='mt-2 lg:hidden'
              onClick={() => setOpenLeftModal(true)}
          />
        )}

        <div
          className="flex items-center gap-4 cursor-pointer relative"
          onClick={() => setRightMenu()}
        >
          {user?.avatar !== null && user?.avatar !== undefined ? (
            <img
              src={raccoonAvatars[user.avatar]}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-gray-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-2xl font-bold text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
         </div>
       </div>


       {/* --- Right Profile Menu --- */}
       {openProfileMenu && (
         <div className="px-4 absolute top-16 right-2 bg-black border border-slate-700 rounded-lg shadow-lg p-2 z-50 font-semibold">
           <h2 className="text-center border-b pb-1 mb-3 border-slate-400">
             {displayName}
           </h2>
           {profileItems.map((item) => {
             const Icon = item.icon;
             const isActive =
               (item.id === "home" && location.pathname === "/home") ||
               (item.id === "profile" &&
                 location.pathname === "/home/profile") ||
               (item.id === "settings" &&
                 location.pathname === "/home/settings");
             return (
               <button
                 key={item.id}
                 onClick={() => {
                   navigate(
                     item.id === "home"
                       ? "/home"
                       : item.id === "profile"
                         ? "/home/profile"
                         : item.id === "settings"
                           ? "/home/settings"
                           : "/home",
                   );
                   setOpenProfileMenu(false);
                 }}
                 className={`
                  block w-full text-left flex gap-2
                  px-4 py-2 rounded transition-all 
                  duration-300 font-medium ${
                    isActive
                      ? "text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-700/50 hover:text-slate-100"
                  }`}
               >
                 <Icon />
                 {item.label}
               </button>
             );
           })}
           {/* Sign Out Button */}
           <button
            onClick={() => {
              setIsOpenedLogout(true);
            }}
             className="block flex gap-2 w-full
                          text-left px-4 py-2 rounded 
                          transition-all duration-300 
                          font-medium
                          text-red-400 hover:text-red-300"
           >
             <LogOut size={18} /> Sign Out
           </button>
         </div>
       )}

       {/* --- Content ---*/}
      <Outlet />

      {isOpenedLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">

          {/* Modal */}
          <div className="w-[90%] max-w-md rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl">

            {/* Icon */}
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <LogOut size={24} />
            </div>

            {/* Text */}
            <h2 className="text-xl font-semibold text-white">
              Log out of Raccoon?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Are you sure you want to log out? You'll need to sign in again
              to continue using Raccoon.
            </p>

            {/* Buttons */}
            <div className="mt-7 flex justify-end gap-3">

              <button
                onClick={() => setIsOpenedLogout(false)}
                className="
                  rounded-xl px-5 py-2.5
                  text-sm font-medium text-slate-300
                  transition
                  hover:bg-slate-800 hover:text-white
                  cursor-pointer
                "
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  try {
                    await auth.signOut();
                    navigate("/landingpage/login");
                  } catch (error) {
                    console.error("Error signing out:", error);
                  }
                }}
                className="
                  rounded-xl bg-red-500 px-5 py-2.5
                  text-sm font-semibold text-white
                  shadow-lg shadow-red-500/20
                  transition
                  hover:bg-red-600
                  active:scale-95
                  cursor-pointer
                "
              >
                Logout
              </button>

            </div>
          </div>
        </div>
      )}

     </main>
   </div>
 );
}