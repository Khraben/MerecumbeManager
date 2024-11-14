import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isOwnerUser, setIsOwnerUser] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const ownerQuery = query(
          collection(db, "owners"),
          where("email", "==", currentUser.email)
        );
        const ownerSnapshot = await getDocs(ownerQuery);
        setIsOwnerUser(!ownerSnapshot.empty);
      } else {
        setIsOwnerUser(false);
      }
    });
    return () => unsubscribe();
  }, [db]);

  const logout = () => {
    signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isOwnerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};