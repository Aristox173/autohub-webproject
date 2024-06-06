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

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    const userDocRef = doc(db, "user", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const isSupplier = userData.isSupplier;

      return { user, isSupplier };
    } else {
      throw new Error("No such user document!");
    }
  } catch (error) {
    throw error;
  }
};
