import { MediatorAgentEvent } from "../../helpers/mediator";
import {
  CreateChatEvent,
  UpdateChatEvent,
  Chat,
  isUpdateChatEvent,
  isCreateChatEvent,
} from "./schemas";

export const processCreateChatEvent = (
  data: MediatorAgentEvent<CreateChatEvent>
): Chat => {
  return {
    id: data.event.id,
    recipientPublicKey: data.sender,
    recipientAlias: data.event.recipientAlias,
    title: `Chat with ${data.event.recipientAlias}`,
  };
};

export const processUpdateChatEvent = (
  chat: Chat,
  data: MediatorAgentEvent<UpdateChatEvent>
): Chat => {
  return {
    ...chat,
    title: data.event.title,
  };
};

export const processChatListEventStream = (
  eventStream: MediatorAgentEvent[]
): Chat[] => {
  return eventStream.flatMap((event) => {
    if (isCreateChatEvent(event)) {
      return [processCreateChatEvent(event)];
    }

    return [];
  });
};

export const processChatEventStream = (
  eventStream: MediatorAgentEvent[],
  streamId: string
): Chat => {
  let chat: Chat | null = null;

  for (const [index, mediatorAgentEvent] of eventStream.entries()) {
    const createChatEvent = isCreateChatEvent(mediatorAgentEvent);
    const updateChatEvent = isUpdateChatEvent(mediatorAgentEvent);

    const chatMediatorEvent = createChatEvent || updateChatEvent;

    if (
      !chatMediatorEvent ||
      (index === 0 && !createChatEvent) ||
      (index !== 0 && chat === null)
    ) {
      throw new Error(`unprocessable_event_stream_${streamId}`);
    }

    if (createChatEvent) {
      chat = processCreateChatEvent(mediatorAgentEvent);
    }

    if (updateChatEvent) {
      chat = processUpdateChatEvent(chat!, mediatorAgentEvent);
    }
  }

  if (chat === null) {
    throw new Error(`unprocessable_event_stream_${streamId}`);
  }

  return chat;
};
