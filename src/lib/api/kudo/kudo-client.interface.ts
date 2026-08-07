import type { FeedPostView } from "@/features/feed/types";
import type { BudgetView, PresignedUploadView, SendKudoCommand } from "@/features/kudo/types";

export interface KudoClient {
  getBudget(): Promise<BudgetView>;
  sendKudo(command: SendKudoCommand, idempotencyKey: string): Promise<FeedPostView>;
  presignMedia(contentType: string): Promise<PresignedUploadView>;
  uploadMedia(upload: PresignedUploadView, file: File): Promise<void>;
}
