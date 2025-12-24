import { createContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export const ThemeContext = createContext({
  themeVars: {},
  theme: "light",
  setTheme: (theme: string) => {},
});

// Define the User type
interface User {
  id: string;
  [key: string]: any; // Add other properties as needed
}

// Define the UserContextType
interface UserContextType {
  user: User | null;
}

// Update the UserContext definition
export const UserContext = createContext<UserContextType>({
  user: null,
});

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("Fetched user:", user); // Log the fetched user
      setUser(user);
    };

    fetchUser();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Auth state changed. Current user:", session?.user); // Log auth state changes
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, []);

  return { user };
};
