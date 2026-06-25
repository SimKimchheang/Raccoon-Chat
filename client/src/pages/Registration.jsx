import { Link } from "react-router-dom";

export default function Registration() {
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      {/* Form Container */}
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-purple-400">
          Create an Account
        </h2>

        <form className="flex flex-col gap-4">
          {/* Username Field */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-medium text-gray-300">Username</label>
            <input 
              type="text" 
              placeholder="Enter your username" 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-white transition-all placeholder-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <input 
              type="password" 
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-white transition-all placeholder-gray-400"
              />
          </div>

          {/* Submit Button */}
          <button className="mt-2 w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors cursor-pointer shadow-md">
            Sign Up
          </button>
        </form>

        <p className="text-sm text-gray-400 text-center mt-4">
          Already have an account?{" "}
          <Link to="login" className="text-purple-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}