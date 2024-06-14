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

// Fetch orders within a date range
/*export const fetchOrdersByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<{ header: OrderHeader; details: OrderDetail[] }[]> => {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    //Obtener las ordenes
    const ordersQuery = query(
      collection(db, "orderHeader"),
      where("timestamp", ">=", startTimestamp),
      where("timestamp", "<=", endTimestamp),
      orderBy("timestamp")
    );

    //Documentos que Coinciden
    const orderHeadersSnapshot = await getDocs(ordersQuery);

    // Mapea los documentos
    const orders = await Promise.all(
      orderHeadersSnapshot.docs.map(async (orderHeaderDoc) => {
        // Datos encabezado
        const orderHeaderData = orderHeaderDoc.data() as OrderHeader;

        //Detalles del pedido que coinciden con el orderId del encabezado
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
        }));

        return {
          header: {
            ...orderHeaderData,
            id: orderHeaderDoc.id, // Incluimos el id autogenerado
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
};*/

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

// Calculate profit for each order and return the one with the highest profit
/*export const calculateHighestProfit = (
  orders: { header: OrderHeader; details: OrderDetail[] }[]
): { orderId: string; profit: number; details: OrderDetail[] } => {
  // Reduce la lista para encontrar el pedido con el mayor beneficio
  const highestProfitOrder = orders.reduce<{
    orderId: string;
    profit: number;
    details: OrderDetail[];
  } | null>((maxOrder, currentOrder) => {
    // Calcula el costo total del pedido actual sumando el precio del producto multiplicado por la cantidad
    const totalCost = currentOrder.details.reduce(
      (sum, detail) => sum + detail.productPrice * detail.quantity,
      0
    );
    const profit = totalCost; // Usamos el total cost como profit directamente para calcular el total correctamente

    if (!maxOrder || profit > maxOrder.profit) {
      return {
        orderId: currentOrder.header.id,
        profit: profit,
        details: currentOrder.details, // Incluimos los detalles del pedido
      };
    }

    return maxOrder;
  }, null);

  if (!highestProfitOrder) {
    throw new Error("No orders found.");
  }

  return highestProfitOrder;
};*/

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
