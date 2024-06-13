export interface OrderDetail {
  id?: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  supplierId: string;
}
