import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Navigate, useLocation } from 'react-router-dom';

const ADMIN_UID = 'ae26da15-7102-4647-8cbb-8f045491433c';

const RequireAdmin = ({ children }) => {
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
  return children;
};

export default RequireAdmin; 