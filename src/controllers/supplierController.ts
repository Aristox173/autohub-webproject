import { db } from "../utils/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Product } from "../models/product";

export const addProduct = async (product: Product) => {
  try {
    const productsCollectionRef = collection(db, "product");
    await addDoc(productsCollectionRef, {
      ...product,
      timeStamp: serverTimestamp(),
    });
  } catch (err) {
    throw new Error("Error adding product: " + err.message);
  }
};
