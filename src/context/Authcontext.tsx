import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/types/profile";

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  session: null,
  user: null,
  profile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Load session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        let {
          data: { session },
          error,
        } = await supabase.auth.getSession();
       

        // Retry in case hydration delay occurs
        if (!session) {
          await new Promise((r) => setTimeout(r, 100));
          const retry = await supabase.auth.getSession();
          session = retry.data.session;
        }

        if (error) console.error("Session fetch error:", error);

        setSession(session);
        setUser(session?.user ?? null);
      
      } catch (err) {
        console.error("Session load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    // 2. Subscribe to session changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === "SIGNED_OUT"  ) {
        localStorage.clear();
      }
     
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 3. Load profile if user is present
 useEffect(() => {
  const loadProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    try{
      const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .maybeSingle(); // 👈 use maybeSingle() instead of single()

if (error && error.code !== "PGRST116") {
  console.error("Profile load error:", error);
}

// only log when we *have* data
if (data) {
  
  setProfile(data);
} else {
 
  // Build fallback + upsert 
  const meta = user.user_metadata;
  const email = user.email || "";
  const fullName = meta.full_name || user.email?.split("@")[0] || "Guest User";

  const fallbackProfile: Profile = {
    id: user.id,
    full_name: fullName,
    email,
    username:
      meta.username ||
      fullName.toLowerCase().replace(/\s+/g, "_") + "_" + Math.floor(Math.random() * 1000),
    avatar_url: meta.avatar_url || "",
    bio: "",
    updated_at: new Date().toISOString(),
  };

  const { data: newProfile, error: upsertError } = await supabase
    .from("profiles")
    .upsert(fallbackProfile, { onConflict: "id" })
    .select("*")
    .maybeSingle();

  if (upsertError) {
    
    setProfile(fallbackProfile); // in-memory fallback
  } else {
    setProfile(newProfile);
    
  }
}
    } catch (err) {
      console.error("Unexpected profile fetch error:", err);
    }
  };

  loadProfile();
}, [user]);


  return (
    <AuthContext.Provider value={{ session, user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

