import { useSupabase } from "./hooks/useSupabase";
export function Login () {
  const supabase = useSupabase();
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) console.log('Logout error', error);
  }

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'github' });

    if (error) console.log('Login error', error);
  }
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <button onClick={handleLogout}>Log out</button>
      <button onClick={handleLogin}>Log in</button>
    </div>
  );
}