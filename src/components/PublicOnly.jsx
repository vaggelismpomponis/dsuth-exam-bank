import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Navigate } from 'react-router-dom';

/**
 * PublicOnly prevents authenticated users from accessing certain pages
 * (like Login and Register) and redirects them to the Home page.
 */
const PublicOnly = ({ children }) => {
  const [user, setUser] = useState(undefined); // undefined: loading, null: not logged in, object: logged in
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
      setLoading(false);
    });
    
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });
    
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return null;
  }

  if (user) {
    // Already logged in - redirect to home
    return <Navigate to="/" replace />;
  }

  // Not logged in - show the page
  return children;
};

export default PublicOnly;
