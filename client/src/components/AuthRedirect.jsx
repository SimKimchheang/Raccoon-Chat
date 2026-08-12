import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function AuthRedirect() {
    const [user, setUser] = useState(undefined);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    }, []);

    if (user === undefined) {
      return <div>Loading...</div>
    }

    return <Navigate to='/landingpage' replace />;
}