import z from "zod";
import { MediatorAgentEvent } from "../../helpers/mediator";

export interface Chat {
  id: string;
  recipientPublicKey: string;
  recipientAlias: string;
  title: string;
}

export const createChatEventSchema = z.object({
  id: z.string(),
  type: z.literal("create_chat"),
  recipientAlias: z.string(),
});

export type CreateChatEvent = z.infer<typeof createChatEventSchema>;

export const isCreateChatEvent = (
  event: MediatorAgentEvent
): event is MediatorAgentEvent<CreateChatEvent> => {
  return createChatEventSchema.safeParse(event.event).success;
};

export const updateChatEventSchema = z.object({
  type: z.literal("update_chat"),
  title: z.string(),
});

export type UpdateChatEvent = z.infer<typeof updateChatEventSchema>;

export const isUpdateChatEvent = (
  event: MediatorAgentEvent
): event is MediatorAgentEvent<UpdateChatEvent> => {
  return updateChatEventSchema.safeParse(event.event).success;
};

export type ChatMediatorAgentEvent =
  | MediatorAgentEvent<CreateChatEvent>
  | MediatorAgentEvent<UpdateChatEvent>;

export const isChatMediatorAgentEvent = (
  event: MediatorAgentEvent
): event is ChatMediatorAgentEvent => {
  return isCreateChatEvent(event) || isUpdateChatEvent(event);
};
