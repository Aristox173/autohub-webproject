import { db } from "../utils/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
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

export const fetchProductsBySupplier = async (
  supplierId: string
): Promise<Product[]> => {
  const products: Product[] = [];
  try {
    const querySnapshot = await getDocs(collection(db, "product"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.productSupplier === supplierId) {
        products.push({ productId: doc.id, ...data } as Product);
      }
    });
  } catch (err) {
    console.error("Error fetching products: ", err);
    throw err;
  }
  return products;
};

export const deleteProductById = async (productId: string) => {
  try {
    await deleteDoc(doc(db, "product", productId));
  } catch (err) {
    console.error("Error deleting product: ", err);
    throw err;
  }
};

export const getProductById = async (
  productId: string
): Promise<Product | null> => {
  try {
    const productDoc = await getDoc(doc(db, "product", productId));
    if (productDoc.exists()) {
      return { productId: productDoc.id, ...productDoc.data() } as Product;
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error fetching product: ", err);
    throw err;
  }
};

export const updateProductById = async (
  productId: string,
  updatedData: Partial<Product>
) => {
  try {
    const productRef = doc(db, "product", productId);
    await updateDoc(productRef, updatedData);
  } catch (err) {
    console.error("Error updating product: ", err);
    throw err;
  }
};
