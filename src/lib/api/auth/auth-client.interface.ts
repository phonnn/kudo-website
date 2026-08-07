import type { AuthCommand, AuthView } from "@/features/auth/types";

export interface AuthClient {
  login(command: AuthCommand): Promise<AuthView>;
  register(command: AuthCommand): Promise<AuthView>;
  logout(): void;
}
