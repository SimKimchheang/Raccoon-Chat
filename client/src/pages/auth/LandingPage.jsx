import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebase';
import raccoonImg from '../../assets/raccoon.png';

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        navigate('/home', { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <>
      <div className="min-h-screen w-full bg-gray-900 text-white p-6 text-xl">
        <section className="flex justify-end gap-12 pb-12">
          <Link to="/landingpage/login" className="text-blue-500 cursor-pointer hover:scale-105 transition-all duration-300 hover:text-cyan-300 hover:drop-shadow-[0_0_15px_rgba(244,144,182,0.8)]">
            Login
          </Link>
          <Link to="/landingpage/signup" className="cursor-pointer hover:scale-105 transition-all duration-300 hover:text-pink-300 hover:drop-shadow-[0_0_15px_rgba(244,114,182,0.8)]">
            Signup
          </Link>
        </section>

        <section className="justify-center grid text-3xl">
          <h1>Hello! Welcome to 
            <strong className="text-purple-600"> Raccoon</strong>
          </h1>
          <img src={raccoonImg} alt="Raccoon Mascot" className='w-64 h-auto mx-auto mt-4'/>
        </section>

        <section className='justify-center flex py-4'>
            <small>Enjoy your time with people here around the world with Raccoon</small>
        </section>
      </div>
    </>
  );
}