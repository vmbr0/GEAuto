import { UserRole, RequestStatus, FuelType, Transmission } from "@prisma/client";

export type { UserRole, RequestStatus, FuelType, Transmission };

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
