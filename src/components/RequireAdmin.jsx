import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Navigate, useLocation } from 'react-router-dom';
import { isUserAdmin } from '../utils/adminUtils';

const RequireAdmin = ({ children }) => {
  const [user, setUser] = useState(undefined); // undefined: loading, null: not logged in, object: logged in
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAdminStatus = async (user) => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      const adminStatus = await isUserAdmin(user.id);
      setIsAdmin(adminStatus);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data?.session?.user || null;
      setUser(currentUser);
      checkAdminStatus(currentUser);
    });
    
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      checkAdminStatus(currentUser);
    });
    
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    // Still loading
    return null;
  }

  if (!user || !isAdmin) {
    // Not logged in or not admin
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // User is admin
  return children;
};

export default RequireAdmin; 