import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: auth.currentUser?.displayName || '',
    email: auth.currentUser?.email || '',
    photoURL: auth.currentUser?.photoURL || ''
  });

  const displayName = user.username || user.email?.split('@')[0] || 'User';
  console.log('user:', user);
  async function handleAvatarClick(e) {
    const file = e.target.files[0];
    console.log("Selected file:", file);
    if (!file) return;
    const currentUser = auth.currentUser;
    console.log("Current user:", currentUser);
    if (!currentUser) return;
    try {
      const storageRef = ref(
        storage,
        `avatars/${currentUser.uid}/${file.name}`
      );
      console.log("Uploading...");
      await uploadBytes(storageRef, file);
      console.log("Upload successful!");
      const photoURL = await getDownloadURL(storageRef);
      console.log("Photo URL:", photoURL);

      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          photoURL: photoURL
        },
        { merge: true }
      );

      await updateProfile(currentUser, {
        photoURL: photoURL
      });

      console.log("Firestore updated!");

      setUser(prev => ({
        ...prev,
        photoURL: photoURL
      }));

      console.log("User state updated!");

    } catch (error) {
      console.error("Avatar upload failed:", error);
    }
  }
  const [isOpen, setIsOpen] = useState(false);
  const openSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser) {
        console.log("Not logged in");
        navigate("/login");
        return;
      }

      console.log("Logged in:", currentUser.uid);

      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      const docData = docSnap.exists() ? docSnap.data() : {};

      setUser({
        username: docData.username || currentUser.displayName || '',
        email: docData.email || currentUser.email || '',
        photoURL: docData.photoURL || currentUser.photoURL || ''
      });
    });

    return () => unsubscribe();
  }, [navigate]);

 return (
  <div className="h-screen w-full bg-gray-900 text-white flex overflow-hidden">

    {/* Left Sidebar */}
    <section className="w-80 min-w-[20rem] flex flex-col bg-gray-800 p-6 overflow-hidden">

      {/* Search Section*/}
      <div className="flex gap-2 pb-2 sticky top-0 left-0 right-0 bg-gray-800 z-10">
        <button 
          className="cursor-pointer mr-2"
          onClick={openSidebar}
          >
          ☰
        </button>
        <input
          placeholder="Search..."
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Group Chat Section */}
      <div 
        className="mt-4 flex-1 overflow-y-auto thin-scrollbar" >
        {Array.from({ length: 90 }).map((_, i) => (
          <p key={i}>{i}</p>
        ))}
      </div>
    </section>

    {/* Right Sidebar */}
    <section className="flex-1 flex flex-col overflow-hidden p-6">
      <h1 className="text-3xl mb-4">Hello</h1>
      <div className="flex-1 overflow-y-auto thin-scrollbar">
        {Array.from({ length: 100 }).map((_, i) => (
          <p key={i}>Message {i + 1}</p>
        ))}
      </div>
    </section>

    {/* Left Sidebar Nav */}
    <section
      className={`absolute top-0 left-0 h-screen w-80
      bg-gray-800 shadow-xl z-50
      transition-transform duration-300
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div
        className='p-6'
      > 
        <button
        className='cursor-pointer'
        onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>

        {/* Is Opened */}
        <section className="grid gap-4 place-items-center">

          <div className="relative">

            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border border-gray-700"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-4xl font-bold text-white">
                {(displayName || "Me")[0].toUpperCase()}
              </div>
            )}

            <label
              htmlFor="avatar-upload"
              className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4
                        rounded-full bg-indigo-600 px-3 py-1 text-xs text-white
                        cursor-pointer hover:bg-indigo-500"
            >
              Upload
            </label>

          </div>

          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarClick}
            className="hidden"
          />

          <h2 className="text-center text-lg font-semibold">
            {displayName}
          </h2>

        </section>

      </div>
    </section>

  </div>
 )
}