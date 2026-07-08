import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../services/firebase.js';
import { useState } from "react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            if (!email || !password) {
                setError("All fields are required");
                return;
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            if (userCredential.user) {
                navigate("/home");
            }
        } catch (err) {
            if (err.code === "auth/user-not-found") {
                setError("User not found");
            } else if (err.code === "auth/wrong-password") {
                setError("Invalid password");
            } else {
                setError(err.message || "Failed to log in");
            }
        }
    };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      {/* Form Container */}
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-purple-400">
          Welcome Back!
        </h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {error && <div className="p-3 bg-red-900 text-red-200 rounded-lg text-sm">{error}</div>}

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-white transition-all placeholder-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-white transition-all placeholder-gray-400"
              />
          </div>

          {/* Submit Button */}
          <button type="submit" className="mt-2 w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors cursor-pointer shadow-md">
            Sign In
          </button>
        </form>

        <p className="text-sm text-gray-400 text-center mt-4">
          Don't have one?{" "}
          <Link to="/landingpage/signup" className="text-purple-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}