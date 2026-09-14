import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { MessageCircle, Users, ShieldCheck } from "lucide-react";

import { auth } from "../../services/firebase";
import raccoonImg from "../../assets/raccoon.png";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        navigate("/home", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen w-full bg-gray-950 text-white flex flex-col overflow-hidden">

      {/* --------------------------------
          Navbar
      --------------------------------- */}
      <header className="w-full px-6 sm:px-10 py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/landingpage"
            className="text-2xl font-bold tracking-wide"
          >
            <span className="text-purple-400">R</span>
            <span className="text-white">accoon</span>
          </Link>

          {/* Auth buttons */}
          <div className="flex items-center gap-3 sm:gap-6 text-sm sm:text-base">

            <Link
              to="/landingpage/login"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Login
            </Link>

            <Link
              to="/landingpage/signup"
              className="
                px-4 py-2
                rounded-lg
                bg-purple-600
                hover:bg-purple-700
                transition-all
                shadow-lg shadow-purple-900/30
              "
            >
              Signup
            </Link>

          </div>
        </nav>
      </header>


      {/* --------------------------------
          Hero
      --------------------------------- */}
      <main className="flex-1 flex items-center justify-center px-6 py-10">

        <section className="w-full max-w-6xl mx-auto grid md:grid-cols-2 items-center gap-12">

          {/* Left side */}
          <div className="text-center md:text-left">

            <div className="
              inline-flex items-center gap-2
              px-3 py-1.5
              rounded-full
              bg-purple-500/10
              border border-purple-500/20
              text-purple-300
              text-sm
              mb-6
            ">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Welcome to Raccoon
            </div>

            <h1 className="
              text-4xl
              sm:text-5xl
              lg:text-6xl
              font-bold
              leading-tight
            ">
              Connect.
              <br />

              <span className="
                bg-gradient-to-r
                from-purple-400
                via-pink-500
                to-purple-400
                bg-clip-text
                text-transparent
              ">
                Chat.
              </span>

              <br />

              Make friends.
            </h1>

            <p className="
              mt-6
              text-gray-400
              text-base
              sm:text-lg
              max-w-xl
              mx-auto
              md:mx-0
              leading-relaxed
            ">
              Enjoy your time with people around the world.
              Discover new people, chat with friends, and build
              your own space with Raccoon.
            </p>


            {/* CTA */}
            <div className="
              flex
              flex-col
              sm:flex-row
              items-center
              md:justify-start
              justify-center
              gap-4
              mt-8
            ">

              <Link
                to="/landingpage/signup"
                className="
                  w-full
                  sm:w-auto
                  px-7
                  py-3
                  rounded-xl
                  bg-purple-600
                  hover:bg-purple-700
                  font-semibold
                  text-center
                  transition-all
                  hover:scale-105
                  shadow-lg
                  shadow-purple-900/30
                "
              >
                Get Started
              </Link>

              <Link
                to="/landingpage/login"
                className="
                  w-full
                  sm:w-auto
                  px-7
                  py-3
                  rounded-xl
                  border
                  border-gray-700
                  hover:border-purple-500
                  hover:bg-purple-500/10
                  text-gray-300
                  hover:text-white
                  font-semibold
                  text-center
                  transition-all
                "
              >
                I already have an account
              </Link>

            </div>


            {/* Small feature highlights */}
            <div className="
              grid
              grid-cols-1
              sm:grid-cols-3
              gap-4
              mt-10
              text-sm
            ">

              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400">
                <MessageCircle size={17} className="text-purple-400" />
                Real-time Chat
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400">
                <Users size={17} className="text-pink-400" />
                Meet People
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400">
                <ShieldCheck size={17} className="text-cyan-400" />
                Secure Auth
              </div>

            </div>

          </div>


          {/* --------------------------------
              Raccoon mascot
          --------------------------------- */}
          <div className="
            flex
            justify-center
            items-center
            relative
          ">

            {/* Glow */}
            <div className="
              absolute
              w-64
              h-64
              sm:w-80
              sm:h-80
              bg-purple-600/20
              rounded-full
              blur-3xl
            " />

            <img
              src={raccoonImg}
              alt="Raccoon Mascot"
              className="
                relative
                w-64
                sm:w-80
                lg:w-96
                h-auto
                drop-shadow-[0_0_35px_rgba(168,85,247,0.35)]
                animate-[float_4s_ease-in-out_infinite]
              "
            />

          </div>

        </section>

      </main>


      {/* --------------------------------
          Footer
      --------------------------------- */}
      <footer className="
        text-center
        text-xs
        text-gray-600
        py-5
        px-6
      ">
        Raccoon — Connect with people around the world 🦝
      </footer>

    </div>
  );
}

