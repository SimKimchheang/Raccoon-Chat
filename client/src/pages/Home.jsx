import { useEffect, useState, useRef } from 'react';
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
import { Search, HomeIcon, User2, Settings, 
  Menu, LogOut, Megaphone, MessageCircle,
  MailCheck, Route, LockKeyhole, Palette,
  UserRound, UserPlus, Rocket, Smile,
} from 'lucide-react';

 
 
 
 
 
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
  const [openAnn, setOpenAnn] = useState(true);
  const searchInputRef = useRef(null);

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

         <div className="grid gap-5 justify-center pt-5">
           <Search
             size={19}
             strokeWidth={2}
             onClick={() => {
              setOpenLeftModal(true);
              setTimeout(() => {
                searchInputRef.current?.focus();
              }, 0);
             }}
             className="
                text-slate-400
                cursor-pointer
                transition-colors
                duration-200
              "
           />

           <Megaphone
              size={19}
              strokeWidth={2}
              onClick={() => {
                if (!openAnn) {
                  setOpenAnn(true);
                  navigate('/home');
                } else {
                  setOpenAnn(false);
                }
              }}
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
               ref={searchInputRef}
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
               <p className="px-3 py-2 text-sm text-slate-500">Searching...</p>
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
                 {person.avatar !== null && person.avatar !== undefined ? (
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
                     {(person.username || "U").charAt(0).toUpperCase()}
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

         {isLoading && (
           <div className="text-center my-4 text-slate">Loading...</div>
         )}

         {/* Search History */}
         {searchHistory.length > 0 && (
           <div className="mt-2 space-y-2 overflow-y-auto">
             <h3 className="px-3 py-2 text-sm text-slate-500">
               Recent Searches
             </h3>
             {searchHistory.map((person) => (
               <button
                 key={person.id}
                 type="button"
                 onClick={() => {
                   const isLargeScreen = window.innerWidth >= 1024;

                   if (isLargeScreen) {
                     navigate(`/home/profile/${person.id}/chatMessage`);
                   } else {
                     navigate(`/home/profile/${person.id}`, { replace: true });
                   }
                   setOpenLeftModal(false);
                   setOpenAnn(false);
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
                 {person.avatar !== null && person.avatar !== undefined ? (
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
                     {(person.username || "U").charAt(0).toUpperCase()}
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
         {!openLeftModal && (
           <Menu
             className="mt-2 lg:hidden"
             onClick={() => setOpenLeftModal(true)}
           />
         )}

         <div
           className="flex items-center gap-4 cursor-pointer relative"

         >
            <Megaphone
              size={19}
              strokeWidth={2}
              onClick={() => {
                if (!openAnn) {
                  setOpenAnn(true);
                  navigate('/home');
                } else {
                  setOpenAnn(false);
                }
              }}
              className=" lg:hidden
                    text-slate-400
                    cursor-pointer
                    transition-colors
                    duration-200
                  "
            />

            {user?.avatar !== null && user?.avatar !== undefined ? (
              <img
                src={raccoonAvatars[user.avatar]}
                alt="Profile"
                onClick={() => setRightMenu()}
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
               Are you sure you want to log out? You'll need to sign in again to
               continue using Raccoon.
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

       {openAnn && (
         <div className="h-screen overflow-y-auto thin-scrollbar bg-[#08080b] text-white p-4 sm:p-6">
           <div className="max-w-3xl mx-auto">
             {/* Header */}
             <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                 <Megaphone size={23} />
               </div>

               <div>
                 <h1 className="text-2xl font-bold tracking-tight">
                   Raccoon Updates
                 </h1>

                 <p className="text-sm text-slate-400">
                   Latest improvements, features and changes
                 </p>
               </div>
             </div>

             {/* Announcement Card */}
             <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
               {/* Gradient glow */}
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
               <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

               <div className="relative p-6 sm:p-8">
                 {/* Version */}
                 <div className="flex items-center justify-between gap-4 mb-6">
                   <div>
                     <div className="flex items-center gap-2 mb-2">
                       <span
                         className="px-2.5 py-1 rounded-lg text-xs font-semibold
                        bg-gradient-to-r from-purple-500/20 to-pink-500/20
                        text-purple-300 border border-purple-500/20"
                       >
                         MAJOR UPDATE
                       </span>

                       <span className="text-xs text-slate-500">v1.0</span>
                     </div>

                     <h2 className="text-xl sm:text-2xl font-bold">
                       Raccoon goes social 🦝
                     </h2>
                   </div>

                   <div className="hidden sm:block text-right">
                     <p className="text-xs text-slate-500">September 2026</p>
                     <p className="text-sm text-slate-400">Latest release</p>
                   </div>
                 </div>

                 {/* Description */}
                 <p className="text-sm sm:text-base leading-relaxed text-slate-400 mb-7 max-w-2xl">
                   A major update focused on bringing Raccoon's messaging,
                   social features, profiles and overall user experience
                   together.
                 </p>

                 {/* Features */}
                 <div className="space-y-2">
                   {/* Feature */}
                   <div
                     className="group flex items-center gap-4 p-3.5 rounded-2xl
                    bg-slate-800/30 border border-transparent
                    hover:border-purple-500/20 hover:bg-slate-800/50
                    transition-all duration-200"
                   >
                     <div
                       className="shrink-0 w-9 h-9 rounded-xl
                      bg-purple-500/10 text-purple-400
                      flex items-center justify-center"
                     >
                       <MessageCircle size={18} />
                     </div>

                     <div>
                       <p className="font-medium text-sm">Real-time chat</p>
                       <p className="text-xs text-slate-500">
                         Send and receive messages in real time.
                       </p>
                     </div>
                   </div>

                   <div
                     className="group flex items-center gap-4 p-3.5 rounded-2xl
                    bg-slate-800/30 border border-transparent
                    hover:border-pink-500/20 hover:bg-slate-800/50
                    transition-all duration-200"
                   >
                     <div
                       className="shrink-0 w-9 h-9 rounded-xl
                      bg-pink-500/10 text-pink-400
                      flex items-center justify-center"
                     >
                       <MailCheck size={18} />
                     </div>

                     <div>
                       <p className="font-medium text-sm">
                         Improved email verification
                       </p>
                       <p className="text-xs text-slate-500">
                         Fixed registration and verification issues.
                       </p>
                     </div>
                   </div>

                   <div
                     className="group flex items-center gap-4 p-3.5 rounded-2xl
                    bg-slate-800/30 border border-transparent
                    hover:border-blue-500/20 hover:bg-slate-800/50
                    transition-all duration-200"
                   >
                     <div
                       className="shrink-0 w-9 h-9 rounded-xl
                      bg-blue-500/10 text-blue-400
                      flex items-center justify-center"
                     >
                       <Route size={18} />
                     </div>

                     <div>
                       <p className="font-medium text-sm">Better navigation</p>
                       <p className="text-xs text-slate-500">
                         Updated application routes and navigation flow.
                       </p>
                     </div>
                   </div>

                   <div
                     className="group flex items-center gap-4 p-3.5 rounded-2xl
                    bg-slate-800/30 border border-transparent
                    hover:border-yellow-500/20 hover:bg-slate-800/50
                    transition-all duration-200"
                   >
                     <div
                       className="shrink-0 w-9 h-9 rounded-xl
                      bg-yellow-500/10 text-yellow-400
                      flex items-center justify-center"
                     >
                       <Settings size={18} />
                     </div>

                     <div>
                       <p className="font-medium text-sm">Expanded Settings</p>
                       <p className="text-xs text-slate-500">
                         New settings and improvements across the app.
                       </p>
                     </div>
                   </div>

                   <div
                     className="group flex items-center gap-4 p-3.5 rounded-2xl
                    bg-slate-800/30 border border-transparent
                    hover:border-cyan-500/20 hover:bg-slate-800/50
                    transition-all duration-200"
                   >
                     <div
                       className="shrink-0 w-9 h-9 rounded-xl
                      bg-cyan-500/10 text-cyan-400
                      flex items-center justify-center"
                     >
                       <Search size={18} />
                     </div>

                     <div>
                       <p className="font-medium text-sm">User search</p>
                       <p className="text-xs text-slate-500">
                         Find other Raccoon users more easily.
                       </p>
                     </div>
                   </div>

                   <div
                     className="group flex items-center gap-4 p-3.5 rounded-2xl
                    bg-slate-800/30 border border-transparent
                    hover:border-green-500/20 hover:bg-slate-800/50
                    transition-all duration-200"
                   >
                     <div
                       className="shrink-0 w-9 h-9 rounded-xl
                      bg-green-500/10 text-green-400
                      flex items-center justify-center"
                     >
                       <UserRound size={18} />
                     </div>

                     <div>
                       <p className="font-medium text-sm">Public profiles</p>
                       <p className="text-xs text-slate-500">
                         View other users and their profiles.
                       </p>
                     </div>
                   </div>

                   <div
                     className="group flex items-center gap-4 p-3.5 rounded-2xl
                    bg-slate-800/30 border border-transparent
                    hover:border-orange-500/20 hover:bg-slate-800/50
                    transition-all duration-200"
                   >
                     <div
                       className="shrink-0 w-9 h-9 rounded-xl
                      bg-orange-500/10 text-orange-400
                      flex items-center justify-center"
                     >
                       <UserPlus size={18} />
                     </div>

                     <div>
                       <p className="font-medium text-sm">
                         Following & friends
                       </p>
                       <p className="text-xs text-slate-500">
                         Follow users and connect through mutual follows.
                       </p>
                     </div>
                   </div>
                 </div>

                 {/* Footer */}
                 <div className="mt-7 pt-5 border-t border-slate-800 flex items-center justify-between">
                   <p className="text-xs text-slate-600">
                     Built with ❤️ for Raccoon
                   </p>

                   <span className="text-xs text-slate-600">🦝 Raccoon</span>
                 </div>
               </div>
             </div>

            {/* What's Coming Next */}
            <div className="mt-8">

              {/* Section Header */}
              <div className="flex items-center gap-3 mb-4 px-1">
                <div
                  className="
                    w-9 h-9
                    rounded-xl
                    bg-purple-500/10
                    text-purple-400
                    flex items-center justify-center
                  "
                >
                  <Rocket size={18} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white">
                    What's coming next
                  </h2>

                  <p className="text-xs text-slate-500">
                    A glimpse at what's ahead for Raccoon
                  </p>
                </div>
              </div>


              {/* Upcoming Updates */}
              <div
                className="
                  overflow-hidden
                  rounded-3xl
                  border border-slate-800/80
                  bg-slate-900/50
                  backdrop-blur-xl
                  divide-y divide-slate-800/70
                "
              >

                {/* Privacy */}
                <div
                  className="
                    group
                    flex items-center gap-4
                    p-5
                    transition-all duration-200
                    hover:bg-slate-800/40
                  "
                >
                  <div
                    className="
                      shrink-0
                      w-11 h-11
                      rounded-2xl
                      bg-purple-500/10
                      text-purple-400
                      flex items-center justify-center
                      group-hover:bg-purple-500/15
                      transition
                    "
                  >
                    <LockKeyhole size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">
                        Privacy & Security
                      </h3>

                      <span
                        className="
                          px-2 py-0.5
                          rounded-md
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wide
                          bg-purple-500/10
                          text-purple-400
                          border border-purple-500/10
                        "
                      >
                        Soon
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      More control over your profile and personal information.
                    </p>
                  </div>
                </div>


                {/* Themes */}
                <div
                  className="
                    group
                    flex items-center gap-4
                    p-5
                    transition-all duration-200
                    hover:bg-slate-800/40
                  "
                >
                  <div
                    className="
                      shrink-0
                      w-11 h-11
                      rounded-2xl
                      bg-pink-500/10
                      text-pink-400
                      flex items-center justify-center
                      group-hover:bg-pink-500/15
                      transition
                    "
                  >
                    <Palette size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">
                        Themes & Appearance
                      </h3>

                      <span
                        className="
                          px-2 py-0.5
                          rounded-md
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wide
                          bg-pink-500/10
                          text-pink-400
                          border border-pink-500/10
                        "
                      >
                        Next
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      More ways to customize the look and feel of Raccoon.
                    </p>
                  </div>
                </div>


                {/* Emoji */}
                <div
                  className="
                    group
                    flex items-center gap-4
                    p-5
                    transition-all duration-200
                    hover:bg-slate-800/40
                  "
                >
                  <div
                    className="
                      shrink-0
                      w-11 h-11
                      rounded-2xl
                      bg-yellow-500/10
                      text-yellow-400
                      flex items-center justify-center
                      group-hover:bg-yellow-500/15
                      transition
                    "
                  >
                    <Smile size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">
                        Emoji & Reactions
                      </h3>

                      <span
                        className="
                          px-2 py-0.5
                          rounded-md
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wide
                          bg-yellow-500/10
                          text-yellow-400
                          border border-yellow-500/10
                        "
                      >
                        Next
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Express yourself with emojis and message reactions.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}
     </main>
   </div>
 );
}