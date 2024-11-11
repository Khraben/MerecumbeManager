import { auth } from "./firebaseConfig";
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

export const createSecretaryUser = async (email) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, "tempPass1_");
    const user = userCredential.user;
    console.log("User created:", user);
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent");
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log("Email already in use, sending password reset email");
      await sendPasswordResetEmail(auth, email);
    } else {
      console.error("Error creating user:", error);
      throw error;
    }
  }
};

export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

export const logout = () => {
  return signOut(auth);
};

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};