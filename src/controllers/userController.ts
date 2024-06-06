import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../utils/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { User } from "../models/user";

export const registerUser = async (userData: User) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    await setDoc(doc(db, "user", userCredential.user.uid), {
      ...userData,
      timestamp: serverTimestamp(),
    });

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};
