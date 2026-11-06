import { createContext } from "react";
import type { AuthSession } from "./types";

export interface AuthContextValue {
  session: AuthSession | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
