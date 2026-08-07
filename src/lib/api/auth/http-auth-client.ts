import type { AuthCommand, AuthView } from "@/features/auth/types";
import type { UserView } from "@/features/user/types";
import type { AuthClient } from "./auth-client.interface";
import type { HttpTransport } from "../http/http-transport";

type AuthResponse = {
  userId: string;
  email: string;
  name: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

export class HttpAuthClient implements AuthClient {
  constructor(private readonly transport: HttpTransport) {}

  async login(command: AuthCommand) {
    const result = await this.transport.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: command.email, password: command.password }),
    });

    return this.acceptAuth(result);
  }

  async register(command: AuthCommand) {
    const result = await this.transport.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(command),
    });

    return this.acceptAuth(result);
  }

  logout() {
    this.transport.clearAccessToken();
    localStorage.removeItem("goodjob.accessToken");
    localStorage.removeItem("goodjob.refreshToken");
    localStorage.removeItem("goodjob.user");
  }

  private acceptAuth(result: AuthResponse): AuthView {
    const user: UserView = {
      id: result.userId,
      email: result.email,
      name: result.name,
      initials: result.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    };

    this.transport.setAccessToken(result.tokens.accessToken);
    localStorage.setItem("goodjob.accessToken", result.tokens.accessToken);
    localStorage.setItem("goodjob.refreshToken", result.tokens.refreshToken);
    localStorage.setItem("goodjob.user", JSON.stringify(user));

    return { user, ...result.tokens };
  }
}
