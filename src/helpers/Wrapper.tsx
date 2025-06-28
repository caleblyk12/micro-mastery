import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from './supabaseClient';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

interface WrapperProps {
  children: ReactNode;
}

function Wrapper({ children }: WrapperProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      setAuthenticated(session !== null);
      setLoading(false);

      if (session?.user) {
        await handleUsernameCheck(session.user.id, session.user.email ?? '');
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthenticated(session !== null);

        if (event === "SIGNED_IN" && session?.user) {
          await handleUsernameCheck(session.user.id, session.user.email ?? '');
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleUsernameCheck = async (userId: string, email: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking username:', error.message);
      return;
    }

    if (!data?.username) {
      const emailPrefix = email.split('@')[0];

      // Set username if null
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: emailPrefix })
        .eq('id', userId)
        .is('username', null); // only set if still null

      if (updateError) {
        console.error('Error auto-setting username:', updateError.message);
        return;
      }

      // Redirect to settings page to let user change it
      if (location.pathname !== '/nav/settings') {
        navigate('/nav/settings');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return authenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default Wrapper;
