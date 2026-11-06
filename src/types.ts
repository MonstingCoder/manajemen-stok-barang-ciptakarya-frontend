export type Role = string;

export interface ItemTag {
  ID: number;
  Name: string;
}

export interface InventoryItem {
  ID: number;
  Name: string;
  Price: number;
  Quantity: number;
  Description: string;
  Tags: ItemTag[] | null;
}

export interface InventoryTag {
  ID: number;
  Name: string;
}

export interface UserRole {
  ID: number;
  Name: string;
}

export interface InventoryUser {
  ID: number;
  name: string;
  email: string;
  role_id: number;
  role?: UserRole;
}

export interface ItemInput {
  name: string;
  price: number;
  quantity: number;
  description: string;
  tags: Array<{ id: number; name: string }>;
}

export interface UserInput {
  name?: string;
  email?: string;
  password?: string;
}

export interface AuthSession {
  token: string;
  userId: number;
  role: Role | null;
}
