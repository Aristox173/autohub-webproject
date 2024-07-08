export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  isSupplier: boolean;
}

export interface Mechanic extends User {
  // Propiedades específicas de Mechanic
  specialization: string;
}

export interface Supplier extends User {
  // Propiedades específicas de Supplier
  companyName: string;
}
