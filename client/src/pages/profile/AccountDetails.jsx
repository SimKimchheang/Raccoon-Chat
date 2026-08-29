import { useState, useEffect} from "react";
import { onAuthStateChanged, reload} from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { Pencil } from "lucide-react";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  query,
  where,
  runTransaction
} from "firebase/firestore";

export default function AccountDetails() {
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState('none');
  const [socialLinks, setSocialLinks] = useState([]);
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  const [handle, setHandle] = useState("");
  const [newHandle, setNewHandle] = useState("");
  const [openHandleModal, setOpenHandleModal] = useState(false);
  const [message, setMessage] = useState('');
 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setBio('');
        setSocialLinks([]);
        setHandle('');
        setNewHandle('');
        return;
      }

      await reload(currentUser);
      setUser(currentUser);

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          setBio(userData.bio || '');
          setStatus(userData.status || 'none');
          setSocialLinks(userData.socialLinks || []);
        
          if (userData.handle) {
            setHandle(userData.handle);
          } else {

            const randomName = `${currentUser.displayName ||
              currentUser.email?.split('@')[0] ||
              'User'}_${Math.floor(1000 + Math.random() * 9000)}`
              .replace(/\s+/g, "_")
              .toLowerCase();

            const userRef = doc(db, "users", currentUser.uid);
            const handleRef = doc(db, "handles", randomName);

            await runTransaction(db, async (transaction) => {
              const handleDoc = await transaction.get(handleRef);

              if (handleDoc.exists()) {
                throw new Error("HANDLE_EXISTS");
              }

              transaction.set(
                userRef,
                {
                  handle: randomName,
                },
                { merge: true }
              );

              transaction.set(handleRef, {
                uid: currentUser.uid,
              });
            });

            setHandle(randomName);
            setNewHandle(randomName);

          }
        }  
      } catch (err) {
        console.error("Error fetching birthday:", err);
      }
    });
    return () => unsubscribe();
  }, []);

  const statusOptions = [
    { id: "none", label: "None", emoji: "⚪" },
    { id: "happy", label: "Happy", emoji: "😊" },
    { id: "sad", label: "Sad", emoji: "😢" },
    { id: "angry", label: "Angry", emoji: "😡" },
    { id: "focus", label: "Focus", emoji: "🎯" },
    { id: "busy", label: "Busy", emoji: "⛔" },
    { id: "sleeping", label: "Sleeping", emoji: "😴" },
    { id: "excited", label: "Excited", emoji: "🤩" },
    { id: "chill", label: "Chilling", emoji: "😎" },
    { id: "working", label: "Working", emoji: "💻" },
  ];

  const handleStatusChange = async (newStatus) => {
    if (!user) return;

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          status: newStatus,
        },
        { merge: true }
      );

      setStatus(newStatus);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleUpdateHandle = async () => {
    if (!user) return;

    const formattedHandle = newHandle
      .trim()
      .replace(/\s+/g, "_")
      .toLowerCase();

    if (formattedHandle.length < 3) {
      setMessage("At least 3 characters");
      return;
    }

    if (!/^[a-z0-9_]+$/.test(formattedHandle)) {
      setMessage("Only letters, numbers, and underscores are allowed");
      return;
    }

    // Nothing changed
    if (formattedHandle === handle.toLowerCase()) {
      setMessage("");
      setOpenHandleModal(false);
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", user.uid);

        // New handle document
        const newHandleRef = doc(db, "handles", formattedHandle);

        // Check if new handle already exists
        const newHandleDoc = await transaction.get(newHandleRef);

        if (
          newHandleDoc.exists() &&
          newHandleDoc.data().uid !== user.uid
        ) {
          throw new Error("HANDLE_TAKEN");
        }

        // Delete old handle
        if (handle) {
          const oldHandleRef = doc(
            db,
            "handles",
            handle.toLowerCase()
          );

          const oldHandleDoc = await transaction.get(oldHandleRef);

          if (
            oldHandleDoc.exists() &&
            oldHandleDoc.data().uid === user.uid
          ) {
            transaction.delete(oldHandleRef);
          }
        }

        // Create new handle reservation
        transaction.set(newHandleRef, {
          uid: user.uid,
        });

        // Update user's profile
        transaction.set(
          userRef,
          {
            handle: formattedHandle,
          },
          { merge: true }
        );
      });

      setHandle(formattedHandle);
      setNewHandle(formattedHandle);
      setMessage("");
      setOpenHandleModal(false);

    } catch (err) {
      console.error("Error updating handle:", err);

      if (err.message === "HANDLE_TAKEN") {
        setMessage("This handle is already taken");
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    }
  };  

  return (
    <div>
      {/* Account Details Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-purple-500 transition-all mb-8">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
          Account Details
        </h2>

        <div className="grid grid-col-1  gap-6 mb-5">
          <div className="p-4 bg-slate-700/30 rounded border border-slate-600">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Display Name
            </label>
            <p className="text-3xl font-bold text-white my-2">{displayName}</p>

            <div className="flex gap-3 ralative">
              {handle && (<>
                <p className="text-slate-500">@{handle}</p>
                <Pencil 
                  onClick={() => {
                    setOpenHandleModal(true);
                    setNewHandle(handle);
                    setMessage('');
                  }}
                  className="text-slate-500 mt-1 cursor-pointer" 
                  size={16}
                />
              </>)}
            </div>

            {openHandleModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div className="w-[300px] h-[250px] bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8">
                  <h2 className="text-center text-white font-semibold text-xl py-2">Edit Handle</h2>
                  {message && (
                    <p className="text-red-500 font-semibold text-center pb-2">{message}</p>
                  )}
                  <input 
                    value={newHandle}
                    type="text"
                    minLength={3}
                    maxLength={25}
                    placeholder={handle}
                    onChange={(e) => setNewHandle(e.target.value)}
                    className={`w-full p-2 text-white ${
                        newHandle.length >= 15 ? "text-sm" : "text-base"
                      } border font-semibold rounded-2xl hover:bg-gray-700`}                    
                  />

                  <div className="justify-between flex">
                   <button
                      type="button"
                      onClick={() => {
                        setOpenHandleModal(false)
                      }}
                      className="mt-6 px-4 py-2 border hover:bg-gray-700 text-white rounded-lg"
                    >
                      Close
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateHandle();
                      }}
                      className="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
                    >
                      Save & Change
                    </button>
                  </div>
                </div>
              </div>
            )}

            {bio ? (
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Bio
                </label>
                <p className="text-xs text-white mt-2">{bio}</p>
              </div>
            ) : (
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Bio
                </label>
                <p className="text-xs text-white mt-2">This user hasn't created a bio yet.</p>
              </div>
            )}

            <div className="mt-2 grid grid-cols-1 gap-3">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Status
              </label>

              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-[250px] px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.emoji} {option.label}
                  </option>
                ))}
              </select>

            </div>

          </div>
        </div>

      </div>

      {socialLinks.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-purple-500 transition-all mb-8">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6"
            >Social Account
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 my-4">
              {socialLinks.map((social, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-800 border border-slate-700 rounded-xl"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-purple-400">
                        {social.title}
                      </h3>

                      <a
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-purple-300 break-all"
                      >
                        {social.link}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
