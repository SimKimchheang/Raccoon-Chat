import { useState, useEffect} from "react";
import { onAuthStateChanged, reload} from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Pencil } from "lucide-react";

export default function AccountDetails() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState('none');
  const [socialLinks, setSocialLinks] = useState([]);
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  const [openUsernameModal, setOpenUsernameModal] = useState(false);
  const [message, setMessage] = useState('');
 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setBio('');
        setSocialLinks([]);
        setUsername('');
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
            setUsername(userData.handle);
          } else {
            const randomName = `@ ${currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}_${Math.floor(1000 + Math.random() * 9000)}`;
            await setDoc(
              userRef,
              {
                handle: randomName,
              },
              { merge: true }
            );
            setUsername(randomName);
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

  const handleUpdateUsername = async () => {
    if (!user) return;
    const formattedUsername = newUsername.replace(/\s+/g, '_');
    if (formattedUsername.length < 3) {
      setMessage('At least 3 character');
      return;
    }
    setNewUsername(formattedUsername);

    try {
      await setDoc(doc(db, 'users', user.uid),
        {
          handle: newUsername,
        },
        { merge: true }
      );
      setMessage('');
      setUsername(formattedUsername);
      setNewUsername(formattedUsername);
      setOpenUsernameModal(false);
    } catch (err) {
      console.log(err)
    }

  }

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
              {username && (<>
                <p className="text-slate-500">@{username}</p>
                <Pencil 
                  onClick={() => {
                    setOpenUsernameModal(true);
                  }}
                  className="text-slate-500 mt-1 cursor-pointer" 
                  size={16}
                />
              </>)}
            </div>

            {openUsernameModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div className="w-[300px] h-[250px] bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8">
                  <h2 className="text-center text-white font-semibold text-xl py-2">Edit Username</h2>
                  {message && (
                    <p className="text-red-500 font-semibold text-center pb-2">{message}</p>
                  )}
                  <input 
                    value={newUsername}
                    type="text"
                    minLength={3}
                    maxLength={25}
                    placeholder={username}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className={`w-full p-2 text-white ${
                        newUsername.length >= 15 ? "text-sm" : "text-base"
                      } border font-semibold rounded-2xl hover:bg-gray-700`}                    
                  />

                  <div className="justify-between flex">
                   <button
                      type="button"
                      onClick={() => {
                        setOpenUsernameModal(false)
                      }}
                      className="mt-6 px-4 py-2 border hover:bg-gray-700 text-white rounded-lg"
                    >
                      Close
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateUsername();
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
                className="w-[300px] px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
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
