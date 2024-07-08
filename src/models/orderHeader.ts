import { OrderComponent } from "./orderComponent";
import { OrderDetail } from "./orderDetail";

export class OrderHeader implements OrderComponent {
  private details: OrderDetail[] = [];

  constructor(
    public id: string,
    public mechanicId: string,
    public timestamp: any,
    public totalAmount: number
  ) {}

  getId(): string {
    return this.id;
  }

  getPrice(): number {
    return this.details.reduce((total, detail) => total + detail.getPrice(), 0);
  }

  addDetail(detail: OrderDetail): void {
    this.details.push(detail);
  }

  removeDetail(detail: OrderDetail): void {
    const index = this.details.indexOf(detail);
    if (index !== -1) {
      this.details.splice(index, 1);
    }
  }

  getDetails(): OrderDetail[] {
    return this.details;
  }
}
