import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  reload,
  signOut,
} from "firebase/auth";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../../services/firebase.js";

import { Eye, EyeClosed } from "lucide-react";

export default function Registration() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [checkEmailVerification, setCheckEmailVerification] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const navigate = useNavigate();

  // ----------------------------------------
  // Create Firebase account + send email
  // ----------------------------------------
  async function register() {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    const user = userCredential.user;

    await updateProfile(user, {
      displayName: username,
    });

    await sendEmailVerification(user);

    setVerificationSent(true);
    setIsSubmitted(true);

    console.log("Verification email sent to:", user.email);
  }

  // ----------------------------------------
  // Signup button
  // Check whether email was verified
  // ----------------------------------------
  async function handleSignup() {
    try {
      setError("");
      setCheckEmailVerification("Checking your email verification...");

      const user = auth.currentUser;

      if (!user) {
        throw new Error("Your signup session has expired. Please try again.");
      }

      // Refresh Firebase user information
      await reload(user);

      if (user.emailVerified) {
        setEmailVerified(true);
        setCheckEmailVerification("Email verified successfully! ");

        // Save user information to Firestore
        await setDoc(doc(db, "users", user.uid), {
          username,
          email: user.email,
          createdAt: serverTimestamp(),
        });

        console.log("Signup successful");

        navigate("/home");
      } else {
        // ----------------------------------------
        // Email NOT verified
        // Reset back to default UX
        // ----------------------------------------
        setEmailVerified(false);
        setVerificationSent(false);
        setIsSubmitted(false);
        setCheckEmailVerification("");
        setError("Your email is not verified yet.");

        // Sign out so the user can submit again
        await signOut(auth);
      }
    } catch (err) {
      console.log(err);
      console.log(err.code);
      console.log(err.message);

      setError(err.message);
      setCheckEmailVerification("");
    }
  }

  // ----------------------------------------
  // First Submit button
  // ----------------------------------------
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setCheckEmailVerification("");

    try {
      // Required fields
      if (!username || !email || !password || !confirmPassword) {
        setError("All fields are required.");
        return;
      }

      // Password length
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      // Password confirmation
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      // Create account
      await register();
    } catch (err) {
      console.log(err);
      console.log(err.code);
      console.log(err.message);

      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-purple-400">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-900 text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-medium text-gray-300">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={isSubmitted}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-white transition-all placeholder-gray-400 disabled:opacity-50"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-medium text-gray-300">Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isSubmitted}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-white transition-all placeholder-gray-400 disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-medium text-gray-300">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isSubmitted}
                className="w-full px-4 py-2.5 pr-11 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-white transition-all placeholder-gray-400 disabled:opacity-50"
              />

              <button
                type="button"
                onClick={() => setShowPassword((isVisible) => !isVisible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
              >
                {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-medium text-gray-300">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              disabled={isSubmitted}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-white transition-all placeholder-gray-400 disabled:opacity-50"
            />
          </div>

          {/* ----------------------------------------
              Button section
          ----------------------------------------- */}

          {!isSubmitted ? (
            // DEFAULT UX
            <button
              className="mt-2 w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors cursor-pointer shadow-md"
              type="submit"
            >
              Submit
            </button>
          ) : (
            // AFTER SUBMIT
            <>
              {/* Tell user what to do */}
              <span className="text-sm text-center text-yellow-400">
                Please check your email and click the verification link before
                clicking Signup.
              </span>

              {/* Verification status */}
              {checkEmailVerification && (
                <p
                  className={`text-sm text-center ${
                    emailVerified ? "text-green-400" : "text-blue-400"
                  }`}
                >
                  {checkEmailVerification}
                </p>
              )}

              {/* Signup button */}
              <button
                type="button"
                onClick={handleSignup}
                className="mt-1 w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors cursor-pointer shadow-md"
              >
                Signup
              </button>
            </>
          )}
        </form>

        <p className="text-sm text-gray-400 text-center mt-4">
          Already have an account?{" "}
          <Link
            to="/landingpage/login"
            className="text-purple-400 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
