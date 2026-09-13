import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, reload } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../services/firebase.js';
import { User, Mail, Lock, EyeClosed } from "lucide-react";

export default function Registration() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [checkEmailVerification, setCheckEmailVerification] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();

  async function register(username, email, password) {
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      email, 
      password
    );

    const user = userCredential.user;

    await updateProfile(user, {
      displayName: username
    });

    await sendEmailVerification(user);
    setVerificationSent(true);
    console.log('Email verification sent to:', user.email);

  }

  async function handleVerifyEmail() {
    const user = auth.currentUser;

    if (!user) {
      setError("Please sign up first.");
      return;
    }

    try {
      setError("");
      setCheckEmailVerification("Checking verification status...");

      await reload(user);

      if (user.emailVerified) {
        setEmailVerified(true);
        setCheckEmailVerification("Email verified successfully! 🎉");

        await setDoc(doc(db, 'users', user.uid), {
          username,
          email,
          createdAt: serverTimestamp()
        });

        console.log("Signup successful");

        navigate("/home");

      } else {
        setEmailVerified(false);
        setCheckEmailVerification("");
        setError("Your email is not verified yet.");
      }

    } catch (err) {
      console.log(err);
      setError(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    
    try {
      if (!username || !email || !password) {
        setError("All fields are required");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      await register(username, email, password);

      if (emailVerified) {
        navigate('/home')
      }

    } catch (err) {
        console.log(err);
        console.log(err.code);
        console.log(err.message);
        setError(err.message);

    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      {/* Form Container */}
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-purple-400">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <div className="p-3 bg-red-900 text-red-200 rounded-lg text-sm">{error}</div>}

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-medium text-gray-300">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username" 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-white transition-all placeholder-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-white transition-all placeholder-gray-400"
            />

            {checkEmailVerification && (
              <p className="text-sm text-blue-400">{checkEmailVerification}</p>
            )}

            {verificationSent && !emailVerified && (
              <p className="text-sm text-yellow-400">
                Please check your email for a verification link.
              </p>
            )}

            {emailVerified ? (
              <span className="text-green-200">Email Verified</span>
            ) : (
              <button 
                className="mt-2 w-[40%] py-2.5 bg-purple-600 hover:bg-purple-700 text-sm px-1 text-white font-medium rounded-lg transition-colors cursor-pointer shadow-md"
                type="button"
                onClick={() => {
                  handleVerifyEmail();
                }}
              >
                Check Verification             
              </button>
            )}
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

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-medium text-gray-300">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-white transition-all placeholder-gray-400"
              />
          </div>

          {/* Submit Button */}
          <button 
              className="mt-2 w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors cursor-pointer shadow-md"
              type="submit"
            >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-gray-400 text-center mt-4">
          Already have an account?{" "}
          <Link to="/landingpage/login" className="text-purple-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

// Todo: When I spam signup without verifying email, firebase gives me 2 different errors.
// 1. "Your email is not verified yet." - This is from my own code, so the codes are working.
// 2. "auth/email-already-in-use" - I need to figure it out why, or because the value is already passed to the database?.
// Finally, the logic doesn't bring user to /home eventhough the user verifies their email, 
// this means the user has to go to login page. 
