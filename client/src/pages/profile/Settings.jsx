import { onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider, updateEmail } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { verifyBeforeUpdateEmail } from "firebase/auth";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [showEmailForm, setShowEmailForm] =useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();


  }, []);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  const navItems = [
    { id: "personal", label: "Personal Information"},
    { id: "security", label: "Email & Password"},
  ];

  // Change Email
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
      setUser({ ...user, email: email });
      setMessage(
        "Verification email sent! Please verify your new email address."
      );

      setShowEmailForm(false);

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
  }


  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-slate-800 to-slate-900 p-6 shadow-2xl border-r border-slate-700">
        <div className="mb-8">
          <Link 
            to="/home/profile" 
            className='inline-flex items-center text-slate-400 hover:text-purple-400 transition-colors mb-6'
          >
            ← Back to Profile
          </Link>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Settings
          </h2>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-slate-100"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Card */}
        <div className="mt-8 p-4 bg-slate-700/30 rounded-lg border border-slate-600 backdrop-blur">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Currently Logged In</p>
          <p className="font-semibold text-slate-100">{displayName}</p>
          <p className="text-sm text-slate-400 truncate">{user?.email}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-auto">
        {/* Personal Information Tab */}
        {activeTab === "personal" && (
          <div className="max-w-2xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                My Personal Information
              </h1>
              <p className="text-slate-400">Manage your profile details and personal information</p>
            </div>

            {/* Info Cards */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
                <label className="text-sm uppercase tracking-wider text-purple-400 font-semibold">Username</label>
                <p className="text-2xl font-bold text-white mt-2">{displayName}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
                <label className="text-sm uppercase tracking-wider text-purple-400 font-semibold">Email Address</label>
                <p className="text-2xl font-bold text-white mt-2 break-all">{user?.email}</p>
                <p className="text-xs text-slate-400 mt-2">
                  {user?.emailVerified ? "Verified ✓" : "Not verified"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
                <label className="text-sm uppercase tracking-wider text-purple-400 font-semibold">Account Status</label>
                <div className="mt-2 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  <p className="text-lg font-semibold text-green-400">Active</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email & Password Tab */}
        {activeTab === "security" && (
          <div className="max-w-2xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                Security Settings
              </h1>
              <p className="text-slate-400">Manage your email and password</p>
            </div>

            {/* Email Section */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6 hover:border-purple-500 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <label className="text-sm uppercase tracking-wider text-purple-400 font-semibold">Email Address</label>
                  <p className="text-xl font-bold text-white mt-2">{user?.email}</p>
                </div>
                <button 
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors"
                  onClick={() => setShowEmailForm(!showEmailForm)}
                >
                  Change
                </button>
              </div>
              <p className="text-xs text-slate-400">Last updated: Recently</p>

              {/* Email Form */}
              {showEmailForm && (
                <div className='mt-6 pt-6 border-t border-slate-600 space-y-4'>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="New Email Address" 
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your Current Password" 
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={HandleEmailChange}
                      type='submit'
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded font-medium transition-colors">
                      Update Email
                    </button>
                    <button 
                      onClick={() => setShowEmailForm(false)}
                      className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm mt-2">
                      {error}
                    </p>
                  )}
                  {message && (
                    <p className="text-green-500 text-sm mt-2">
                      {message}
                    </p>
                  )}
                </div>
                )}
            </div>

            {/* Password Section */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <label className="text-sm uppercase tracking-wider text-purple-400 font-semibold">Password</label>
                  <p className="text-lg font-bold text-white mt-2">••••••••</p>
                  <p className="text-xs text-slate-400 mt-1">Strong password</p>
                </div>
                <button 
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded text-sm font-medium transition-colors"
                >
                  Change Password
                </button>
              </div>

              {/* Password Form */}
              {showPasswordForm && (
                <div className="mt-6 pt-6 border-t border-slate-600 space-y-4">
                  <input 
                    type="password" 
                    placeholder="Current Password" 
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                  <input 
                    type="password" 
                    placeholder="New Password" 
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                  <input 
                    type="password" 
                    placeholder="Confirm New Password" 
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                  <div className="flex gap-3 pt-2">
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded font-medium transition-colors">
                      Update Password
                    </button>
                    <button 
                      onClick={() => setShowPasswordForm(false)}
                      className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
