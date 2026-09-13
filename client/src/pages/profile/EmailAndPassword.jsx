import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  verifyBeforeUpdateEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../../services/firebase";
import { useEffect, useState } from "react";

export default function EmailAndPassword() {
  const [user, setUser] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async(currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const HandleEmailChange = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');

    try {
      if(!email || !password) {
        setError('All fields are required');
        return;
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError("You are not logged in");
        return;
      }

      // Re-authenticate the user with their current credentials
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        password
      );

      await reauthenticateWithCredential(currentUser, credential);

      // Update the email
      await verifyBeforeUpdateEmail(currentUser, email);
      setMessage(
        "Verification email sent! Please verify your new email address."
      );

      setShowEmailForm(false);
      setEmail('');
      setPassword('');

      // Optionally show success message
    } catch (err) {
      if (err.code === "auth/wrong-password") {
        setError("Incorrect password");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Email is already in use");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (err.code === "auth/requires-recent-login") {
        setError("Please log out and log back in, then try again.");
      } else {
        setError(err.message || "Failed to update email");
      }
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="text-slate-400">Manage your email and password settings</p>
      </div>

      {/* Info Cards */}
      <div className="space-y-4">
        {/* Change Email Card */}
        <div className="relative bg-gray-900/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
          <label className="pr-6 text-sm uppercase tracking-wider text-purple-400 font-semibold">Change Email Address</label>
          
          {!showEmailForm ? (
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="absolute right-5 top-0 mt-4 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium transition-colors"
            >
              Change Email
            </button>
          ) : (
            <form onSubmit={HandleEmailChange} className="mt-4 space-y-3">
              <p className="w-full rounded-xl border border-gray-600 bg-gray-800/50 px-4 py-3 text-white outline-none transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 hover:border-gray-500"
                >{user?.email}
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="New email address"
                className="w-full rounded-xl border border-gray-600 bg-gray-800/50 px-4 py-3 text-white outline-none transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 hover:border-gray-500"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Current password"
                className="w-full rounded-xl border border-gray-600 bg-gray-800/50 px-4 py-3 text-white outline-none transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 hover:border-gray-500"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium transition-colors"
                >
                  Update Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailForm(false);
                    setEmail('');
                    setPassword('');
                    setError('');
                  }}
                  className="px-4 py-3 bg-slate-700/50 hover:bg-slate-600 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {error && (
            <p className="text-red-500 text-sm mt-3">{error}</p>
          )}
          {message && (
            <p className="text-green-500 text-sm mt-3">{message}</p>
          )}
        </div>

        {/* Change Password Card */}
        <div className="relative bg-gray-900/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
          <label className="pr-6 text-sm uppercase tracking-wider text-purple-400 font-semibold">Change Password</label>
          
          {!showPasswordForm ? (
            <button
              type="button"
              onClick={() => setShowPasswordForm(true)}
              className="absolute right-5 top-0 mt-4 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium transition-colors"
            >
              Change Password
            </button>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-slate-300 text-sm">
                To change your password, please use the "Forgot Password" option on the login page.
              </p>
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="px-4 py-3 bg-slate-700/50 hover:bg-slate-600 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
