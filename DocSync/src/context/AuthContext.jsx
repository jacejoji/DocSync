import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("http://localhost:8080/auth/me", {
          credentials: "include",
        });

        if (res.ok) {
          const userData = await res.json();
          // STOP THE LOOP: Only update if the user object is actually different
          setUser(prev => {
             if (JSON.stringify(prev) !== JSON.stringify(userData)) {
                 return userData;
             }
             return prev;
          });
        } else {
          // STOP THE LOOP: Only set null if not already null
          setUser(prev => (prev !== null ? null : prev));
        }
      } catch (error) {
        setUser(prev => (prev !== null ? null : prev));
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const logout = async () => {
    try {
      await fetch("http://localhost:8080/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);