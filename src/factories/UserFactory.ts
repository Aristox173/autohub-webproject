import { User, Mechanic, Supplier } from "../models/user";

class UserFactory {
  static createUser(data: Partial<User>): User {
    return {
      id: data.id || "",
      name: data.name || "",
      email: data.email || "",
      password: data.password || "",
      isSupplier: data.isSupplier || false,
    };
  }

  static createMechanic(data: Partial<Mechanic>): Mechanic {
    const user = this.createUser(data);
    return {
      ...user,
      specialization: data.specialization || "",
    } as Mechanic;
  }

  static createSupplier(data: Partial<Supplier>): Supplier {
    const user = this.createUser(data);
    return {
      ...user,
      companyName: data.companyName || "",
    } as Supplier;
  }
}

export default UserFactory;
