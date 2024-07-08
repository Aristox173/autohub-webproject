import { OrderComponent } from "./orderComponent";

export class OrderDetail implements OrderComponent {
  constructor(
    public orderId: string,
    public productName: string,
    public productPrice: number,
    public productSupplier: string,
    public quantity: number
  ) {}

  getId(): string {
    return this.orderId;
  }

  getPrice(): number {
    return this.productPrice * this.quantity;
  }

}
