import { auth, db } from "../utils/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  updateDoc,
  setDoc,
  query,
  where,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { Product } from "../models/product";
import { User } from "../models/user";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { OrderHeader } from "../models/orderHeader";
import { OrderDetail } from "../models/orderDetail";
import UserFactory from "../factories/UserFactory.ts";

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
      const user = UserFactory.createUser({
        ...data,
        id: doc.id, // Agregamos 'id' solo una vez
      });
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

    const newUser = UserFactory.createUser({
      ...userData,
      id: userCredential.user.uid, // Agregamos 'id' solo una vez
    });

    await setDoc(doc(db, "user", newUser.id), {
      ...newUser,
      timestamp: serverTimestamp(),
    });

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const fetchOrdersByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<{ header: OrderHeader; details: OrderDetail[] }[]> => {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const ordersQuery = query(
      collection(db, "orderHeader"),
      where("timestamp", ">=", startTimestamp),
      where("timestamp", "<=", endTimestamp),
      orderBy("timestamp")
    );

    const orderHeadersSnapshot = await getDocs(ordersQuery);

    const orders = await Promise.all(
      orderHeadersSnapshot.docs.map(async (orderHeaderDoc) => {
        const orderHeaderData = orderHeaderDoc.data() as OrderHeader;
        const orderDetailsSnapshot = await getDocs(
          query(
            collection(db, "orderDetail"),
            where("orderId", "==", orderHeaderDoc.id)
          )
        );
        const orderDetails = orderDetailsSnapshot.docs.map((doc) => ({
          ...(doc.data() as OrderDetail),
          id: doc.id,
          productPrice: parseFloat(doc.data().productPrice), // Asegúrate de convertir productPrice a número
          productCost: parseFloat(doc.data().productCost), // Asegúrate de convertir productCost a número
        }));

        return {
          header: {
            ...orderHeaderData,
            id: orderHeaderDoc.id, // Incluimos el id autogenerado
            totalAmount: orderHeaderData.totalAmount, // Asumimos que totalAmount ya es un número
          },
          details: orderDetails,
        };
      })
    );

    return orders;
  } catch (error) {
    console.error("Error fetching orders by date range: ", error);
    throw new Error("Failed to fetch orders. Please try again.");
  }
};

export const calculateHighestProfit = (
  orders: { header: OrderHeader; details: OrderDetail[] }[]
): {
  orderId: string;
  profit: number;
  details: OrderDetail[];
  totalItems: number;
  totalAmount: number;
}[] => {
  // Calcular el profit para cada orden y devolver una lista ordenada por profit descendente
  const ordersWithProfit = orders.map((order) => {
    // Encontrar el producto con el mayor precio en los detalles de la orden
    const mostExpensiveProduct = order.details.reduce((maxProduct, product) => {
      return product.productPrice > maxProduct.productPrice
        ? product
        : maxProduct;
    }, order.details[0]);

    // Calcular el profit usando el producto más caro y el total de items
    const totalItems = order.details.reduce(
      (sum, product) => sum + product.quantity,
      0
    );
    const revenue = mostExpensiveProduct.productPrice * totalItems;
    const profit = revenue - order.header.totalAmount;

    return {
      orderId: order.header.id,
      profit: profit,
      details: order.details,
      totalItems: totalItems,
      totalAmount: order.header.totalAmount,
    };
  });

  // Ordenar las órdenes por profit en orden descendente
  ordersWithProfit.sort((a, b) => b.profit - a.profit);

  return ordersWithProfit;
};
