export type UserView = {
  id: string;
  name: string;
  initials: string;
};

export type FeedPostView = {
  id: string;
  sender: UserView;
  recipient: UserView;
  message: string;
  points: number;
  coreValue: string;
  createdAt: string;
};

export type BudgetView = {
  spent: number;
  remaining: number;
  total: number;
};

export type SendKudoCommand = {
  recipientId: string;
  message: string;
  points: number;
  coreValue: string;
};

export type Page<T> = { items: T[]; nextCursor?: string };
