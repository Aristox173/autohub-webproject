import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { Product } from "../models/product";
import { SelectedItem } from "../models/SelectedItem";
import { AnalysisResult } from "../models/analysisResult";
import { OrderDetail } from "../models/orderDetail.ts";
import { OrderHeader } from "../models/orderHeader.ts";

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "product"));
    return querySnapshot.docs.map((doc) => ({
      productId: doc.id,
      ...doc.data(),
    })) as Product[];
  } catch (err) {
    console.error("Error fetching products: ", err);
    throw new Error("Failed to fetch products. Please try again.");
  }
};

export const findCheapestOption = (
  selectedItems: SelectedItem[],
  products: Product[]
): AnalysisResult => {
  let totalCost = 0;
  const details: Array<{ product: Product; quantity: number; cost: number }> =
    [];

  selectedItems.forEach((item) => {
    let remainingQuantity = item.quantity;
    const matchingProducts = products
      .filter(
        (product) =>
          product.productCategory === item.category &&
          product.productSubcategory === item.subcategory
      )
      .sort((a, b) => {
        if (a.productPrice !== b.productPrice) {
          return a.productPrice - b.productPrice;
        }
        if (b.productQuality !== a.productQuality) {
          return b.productQuality - a.productQuality;
        }
        return (
          (b.isOriginal === true ? 1 : 0) - (a.isOriginal === true ? 1 : 0)
        );
      });

    if (matchingProducts.length > 0) {
      matchingProducts.forEach((product) => {
        if (remainingQuantity <= 0) return;

        const availableQuantity = Math.min(
          remainingQuantity,
          product.productStock
        );
        const cost = availableQuantity * product.productPrice;
        totalCost += cost;
        remainingQuantity -= availableQuantity;

        details.push({
          product,
          quantity: availableQuantity,
          cost,
        });
      });

      if (remainingQuantity > 0) {
        const totalStock = matchingProducts.reduce(
          (sum, product) => sum + product.productStock,
          0
        );
        if (totalStock < item.quantity) {
          console.log(
            `The required quantity of ${item.subcategory} exceeds the available stock in the entire database.`
          );
        }
      }
    } else {
      console.log(
        `No products found for ${item.subcategory} in ${item.category}.`
      );
    }
  });

  return { details, totalCost };
};

export const findQualityOption = (
  selectedItems: SelectedItem[],
  products: Product[]
): AnalysisResult => {
  let totalCost = 0;
  const details: Array<{ product: Product; quantity: number; cost: number }> =
    [];

  selectedItems.forEach((item) => {
    let remainingQuantity = item.quantity;
    const matchingProducts = products
      .filter(
        (product) =>
          product.productCategory === item.category &&
          product.productSubcategory === item.subcategory
      )
      .sort((a, b) => {
        if (b.productQuality !== a.productQuality) {
          return b.productQuality - a.productQuality;
        }
        if (a.productPrice !== b.productPrice) {
          return a.productPrice - b.productPrice;
        }
        return (
          (b.isOriginal === true ? 1 : 0) - (a.isOriginal === true ? 1 : 0)
        );
      });

    if (matchingProducts.length > 0) {
      matchingProducts.forEach((product) => {
        if (remainingQuantity <= 0) return;

        const availableQuantity = Math.min(
          remainingQuantity,
          product.productStock
        );
        const cost = availableQuantity * product.productPrice;
        totalCost += cost;
        remainingQuantity -= availableQuantity;

        details.push({
          product,
          quantity: availableQuantity,
          cost,
        });
      });

      if (remainingQuantity > 0) {
        const totalStock = matchingProducts.reduce(
          (sum, product) => sum + product.productStock,
          0
        );
        if (totalStock < item.quantity) {
          console.log(
            `The required quantity of ${item.subcategory} exceeds the available stock in the entire database.`
          );
        }
      }
    } else {
      console.log(
        `No products found for ${item.subcategory} in ${item.category}.`
      );
    }
  });

  return { details, totalCost };
};

export const findBalancedOption = (
  selectedItems: SelectedItem[],
  products: Product[]
): AnalysisResult => {
  const maxQuality = 5;
  const minPrice = Math.min(...products.map((product) => product.productPrice));

  let totalCost = 0;
  const details: Array<{ product: Product; quantity: number; cost: number }> =
    [];

  selectedItems.forEach((item) => {
    let remainingQuantity = item.quantity;
    const matchingProducts = products
      .filter(
        (product) =>
          product.productCategory === item.category &&
          product.productSubcategory === item.subcategory
      )
      .map((product) => {
        const normalizedQuality = product.productQuality / maxQuality;
        const normalizedPrice = minPrice / product.productPrice;
        const balancedScore = normalizedQuality * 0.5 + normalizedPrice * 0.5;
        return { ...product, balancedScore };
      })
      .sort((a, b) => b.balancedScore - a.balancedScore);

    if (matchingProducts.length > 0) {
      matchingProducts.forEach((product) => {
        if (remainingQuantity <= 0) return;

        const availableQuantity = Math.min(
          remainingQuantity,
          product.productStock
        );
        const cost = availableQuantity * product.productPrice;
        totalCost += cost;
        remainingQuantity -= availableQuantity;

        details.push({
          product,
          quantity: availableQuantity,
          cost,
        });
      });

      if (remainingQuantity > 0) {
        const totalStock = matchingProducts.reduce(
          (sum, product) => sum + product.productStock,
          0
        );
        if (totalStock < item.quantity) {
          console.log(
            `The required quantity of ${item.subcategory} exceeds the available stock in the entire database.`
          );
        }
      }
    } else {
      console.log(
        `No products found for ${item.subcategory} in ${item.category}.`
      );
    }
  });

  return { details, totalCost };
};

export const createOrder = async (
  mechanicId: string,
  orderDetails: OrderDetail[]
) => {
  try {
    // Primero, crea el objeto de encabezado de pedido
    const orderHeader = new OrderHeader("", mechanicId, serverTimestamp(), 0);

    // Crea el documento de encabezado de pedido en Firestore
    const orderHeaderRef = await addDoc(collection(db, "orderHeader"), {
      mechanicId: orderHeader.mechanicId,
      timestamp: orderHeader.timestamp,
      totalAmount: orderHeader.getPrice(),
    });

    // Obtén el orderId generado automáticamente
    orderHeader.id = orderHeaderRef.id;

    // Actualiza el documento de encabezado de pedido con el orderId
    await updateDoc(orderHeaderRef, { id: orderHeader.id });

    // Crea un lote para escribir los detalles del pedido
    const batch = writeBatch(db);
    orderDetails.forEach((detail) => {
      detail.orderId = orderHeader.id; // Asegura que cada detalle tenga el orderId correcto
      const orderDetailRef = doc(collection(db, "orderDetail"));
      batch.set(orderDetailRef, {
        orderId: detail.orderId,
        productName: detail.productName,
        productPrice: detail.productPrice,
        productSupplier: detail.productSupplier,
        quantity: detail.quantity,
      });
    });

    // Confirma el lote
    await batch.commit();

    // Calcula el monto total y actualiza el encabezado del pedido
    const totalAmount = orderDetails.reduce(
      (sum, detail) => sum + detail.getPrice(),
      0
    );
    await updateDoc(orderHeaderRef, { totalAmount });
  } catch (error) {
    console.error("Error creating order: ", error);
    throw new Error("Failed to create order. Please try again.");
  }
};
