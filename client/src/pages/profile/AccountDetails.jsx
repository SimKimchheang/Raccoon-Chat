import { useState, useEffect, use } from "react";
import { onAuthStateChanged, reload, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Merge } from "lucide-react";

export default function AccountDetails() {
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState('none');
  const [birthday, setBirthday] = useState('');
  const [country, setCountry] = useState('');
  const [verificationSent, setVerification] = useState(false);
  const [socialLinks, setSocialLinks] = useState([]);
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setBio('');
        setBirthday('');
        setCountry('');
        setSocialLinks([]);
        return;
      }

      await reload(currentUser);
      setUser(currentUser);

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setBio(userData.bio || '');
          setStatus(userData.status || 'none');
          setBirthday(userData.birthday || "");
          setCountry(userData.country || "");
          setSocialLinks(userData.socialLinks || []);
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
            <p className="text-xl font-bold text-white mt-2">{displayName}</p>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="p-4 bg-slate-700/30 rounded border border-slate-600">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Email Address
            </label>
            <p className="text-lg font-semibold text-white mt-2 break-all">{user?.email}</p>
          </div>

          <div className="p-4 bg-slate-700/30 rounded border border-slate-600">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              User ID
            </label>
            <p className="text-sm text-slate-300 mt-2 break-all font-mono">{user?.uid}</p>
          </div>

          {country && (
            <div className="p-4 bg-slate-700/30 rounded border border-slate-600">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Country
              </label>
              <p className="text-lg mt-2 break-all font-semibold mt-2 text-white">{country}</p>
            </div>
          )}

          <div className="p-4 bg-slate-700/30 rounded border border-slate-600">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Account Created
            </label>
            <p className="text-lg font-semibold text-white mt-2">
              {user?.metadata?.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>

          <div className="p-4 bg-slate-700/30 rounded border border-slate-600">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Birthday
            </label>
            <p className="text-lg font-semibold text-white mt-2">{birthday || 'Not set'}</p>
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
