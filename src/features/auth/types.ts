import type { UserView } from "@/features/user/types";

export type AuthCommand = {
  email: string;
  password: string;
  name?: string;
};

export type AuthView = {
  user: UserView;
  accessToken: string;
  refreshToken: string;
};
