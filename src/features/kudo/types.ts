export type Tag = "teamwork" | "ownership" | "innovation" | "customer_focus";

export type MediaView = {
  objectKey: string;
  domain: string;
  previewUrl?: string;
};

export type BudgetView = {
  spent: number;
  remaining: number;
  total: number;
};

export type PresignedUploadView = {
  url: string;
  fields: Record<string, string>;
  objectKey: string;
  domain: string;
};

export type SendKudoCommand = {
  recipientId: string;
  message: string;
  points: number;
  tag: Tag;
  media?: MediaView;
};
