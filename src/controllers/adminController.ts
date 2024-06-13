import { auth, db } from "../utils/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  QueryDocumentSnapshot,
  DocumentData,
  addDoc,
  serverTimestamp,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { Product } from "../models/product";
import { User } from "../models/user";
import { createUserWithEmailAndPassword } from "firebase/auth";

export const addProduct = async (product: Product) => {
  try {
    const productsCollectionRef = collection(db, "product");
    const { productId, ...productData } = product;
    await addDoc(productsCollectionRef, {
      ...productData,
      timeStamp: serverTimestamp(),
    });
  } catch (err) {
    throw new Error("Error adding product: " + err.message);
  }
};

export const fetchAllProducts = async (): Promise<Product[]> => {
  const products: Product[] = [];
  try {
    const querySnapshot = await getDocs(collection(db, "product"));
    for (const productDoc of querySnapshot.docs) {
      const data = productDoc.data();
      const product: Product = {
        productId: productDoc.id,
        productName: data.productName,
        productDescription: data.productDescription,
        productCategory: data.productCategory,
        productSubcategory: data.productSubcategory,
        productPrice: data.productPrice,
        productStock: data.productStock,
        productQuality: data.productQuality,
        isOriginal: data.isOriginal,
        productSupplier: data.productSupplier,
      };

      if (product.productSupplier) {
        const supplierDoc = await getDoc(
          doc(db, "user", product.productSupplier)
        );
        if (supplierDoc.exists()) {
          const supplierData = supplierDoc.data() as User;
          product.productSupplier = supplierData.name;
        }
      }

      products.push(product);
    }
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

export const fetchSuppliers = async (): Promise<User[]> => {
  const suppliers: User[] = [];
  try {
    const querySnapshot = await getDocs(collection(db, "user"));
    querySnapshot.forEach((doc) => {
      const data = doc.data() as User;
      if (data.isSupplier) {
        const supplier: User = {
          id: doc.id,
          name: data.name,
          email: data.email,
          password: data.password,
          isSupplier: data.isSupplier,
        };
        suppliers.push(supplier);
      }
    });
  } catch (err) {
    console.error("Error fetching suppliers: ", err);
    throw err;
  }
  return suppliers;
};

export const fetchAllUsers = async (): Promise<User[]> => {
  const users: User[] = [];
  try {
    const querySnapshot = await getDocs(collection(db, "user"));
    querySnapshot.forEach((doc) => {
      const data = doc.data() as User;
      const user: User = {
        id: doc.id,
        name: data.name,
        email: data.email,
        password: data.password,
        isSupplier: data.isSupplier,
      };
      users.push(user);
    });
  } catch (err) {
    console.error("Error fetching users: ", err);
    throw err;
  }
  return users;
};

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
