import { useState, useEffect } from "react";
import { onAuthStateChanged, reload, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function AccountDetails() {
  const [user, setUser] = useState(null);
  const [birthday, setBirthday] = useState('');
  const [country, setCountry] = useState('');
  const [verificationSent, setVerification] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await reload(currentUser);
        setUser(currentUser);

        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.birthday) {
              setBirthday(userData.birthday);
            }
            if (userData.country) {
                setCountry(userData.country);
            }
          }
        } catch (err) {
          console.error("Error fetching birthday:", err);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <div>
      {/* Account Details Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-purple-500 transition-all mb-8">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
          Account Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-700/30 rounded border border-slate-600">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Display Name
            </label>
            <p className="text-xl font-bold text-white mt-2">{displayName}</p>
          </div>

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

          <div className="p-4 bg-slate-700/30 rounded border border-slate-600">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Email Verification
            </label>
            <div className="mt-3 space-y-2">
              {user?.emailVerified ? (
                <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                  ✓ Verified
                </span>
              ) : (
                <>
                  <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium">
                    ⚠ Unverified
                  </span>
                  <button
                    className="block w-full mt-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 rounded text-sm font-medium transition-all"
                    onClick={async () => {
                      try {
                        await sendEmailVerification(user);
                        setVerification(true);
                      } catch (error) {
                        console.error('Error sending verification email:', error);
                      }
                    }}
                  >
                    Verify Email
                  </button>
                  {verificationSent && (
                    <p className="text-green-400 text-xs text-center animate-pulse">
                      ✓ Verification email sent!
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
