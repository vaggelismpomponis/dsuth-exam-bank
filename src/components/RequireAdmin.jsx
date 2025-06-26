import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import { supabase } from '../supabaseClient';
import { Navigate, useLocation } from 'react-router-dom';
=======
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
>>>>>>> 0e5f73e (fix: σωστό .gitignore, προστασία admin routes, cleanup node_modules από git, πλήρες setup για prod)

const ADMIN_UID = 'ae26da15-7102-4647-8cbb-8f045491433c';

const RequireAdmin = ({ children }) => {
<<<<<<< HEAD
  const [user, setUser] = useState(undefined); // undefined: loading, null: not logged in, object: logged in
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (user === undefined) {
    // Still loading
    return null;
  }

  if (!user || user.id !== ADMIN_UID) {
    // Not logged in or not admin
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // User is admin
=======
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let unsub = null;
    supabase.auth.getSession().then(({ data }) => {
      const user = data?.session?.user;
      if (user && user.id === ADMIN_UID) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        navigate('/');
      }
      setLoading(false);
    });
    unsub = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (user && user.id === ADMIN_UID) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        navigate('/');
      }
      setLoading(false);
    });
    return () => {
      unsub?.data?.subscription?.unsubscribe();
    };
  }, [navigate]);

  if (loading) return null;
  if (!isAdmin) return null;
>>>>>>> 0e5f73e (fix: σωστό .gitignore, προστασία admin routes, cleanup node_modules από git, πλήρες setup για prod)
  return children;
};

export default RequireAdmin; 