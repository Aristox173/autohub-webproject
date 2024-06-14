import { Product } from "../models/product";

export interface AnalysisResult {
  details: Array<{ product: Product; quantity: number; cost: number }>;
  totalCost: number;
}
