import { create } from "zustand";
import {
  MediatorAgent,
  MediatorAgentEvent,
  MediatorEventStreamListener,
} from "../../helpers/mediator";
import { DataStatus, List } from "../interfaces";
import { Chat, isCreateChatEvent } from "./schemas";
import { processChatEventStream, processCreateChatEvent } from "./processors";
import {
  processListInitializerEventStream,
  processListItemModifierEventStream,
} from "../../helpers/data";

interface UseChatStore {
  chats: List<Chat>;
  createChat: (
    identityMediatorAgent: MediatorAgent,
    recipientMediatorAgent: MediatorAgent
  ) => Promise<void>;
  fetchChatList: (identityMediatorAgent: MediatorAgent) => Promise<void>;
  updateChat: (
    identityMediatorAgent: MediatorAgent,
    recipientMediatorAgent: MediatorAgent,
    chatId: string,
    title: string
  ) => Promise<void>;
  processChatListEventStream: MediatorEventStreamListener;
  processChatEventStream: MediatorEventStreamListener;
}

const initializerEventStreamId = "chat";

export const useChatStore = create<UseChatStore>((set, get) => ({
  chats: {
    state: {},
    status: DataStatus.Pending,
  },
  createChat: async (
    identityMediatorAgent: MediatorAgent,
    recipientMediatorAgent: MediatorAgent
  ) => {
    identityMediatorAgent.sendEvent(
      recipientMediatorAgent,
      initializerEventStreamId,
      {
        id: crypto.randomUUID(),
        type: "create_chat",
        recipientAlias: recipientMediatorAgent.alias,
      },
      {
        recipientAlias: identityMediatorAgent.alias,
      }
    );
  },
  updateChat: async (
    identityMediatorAgent: MediatorAgent,
    recipientMediatorAgent: MediatorAgent,
    chatId: string,
    title: string
  ) => {
    identityMediatorAgent.sendEvent(
      recipientMediatorAgent,
      `${initializerEventStreamId}/${chatId}`,
      {
        type: "update_chat",
        title: title,
      }
    );
  },
  fetchChatList: async (identityMediatorAgent: MediatorAgent) => {
    identityMediatorAgent.fetchStream(initializerEventStreamId);
  },
  processChatListEventStream: (
    streamId: string,
    eventStream: MediatorAgentEvent[],
    identityMediatorAgent: MediatorAgent
  ) => {
    const chatListState = processListInitializerEventStream<Chat>({
      streamId,
      eventStream,
      identityMediatorAgent,
      oldList: get().chats.state,
      initializerEventGuard: isCreateChatEvent,
      initializerEventProcessor: processCreateChatEvent,
      initializerStreamId: initializerEventStreamId,
    });

    if (!chatListState) {
      return;
    }

    set(() => ({
      chats: {
        state: chatListState,
        status: DataStatus.Success,
      },
    }));
  },
  processChatEventStream: (
    streamId: string,
    eventStream: MediatorAgentEvent[]
  ) => {
    const modifiedChatList = processListItemModifierEventStream<Chat>({
      streamId,
      eventStream,
      oldList: get().chats.state,
      eventStreamProcessor: processChatEventStream,
      initializerStreamId: initializerEventStreamId,
    });

    if (!modifiedChatList) {
      return;
    }

    set(() => ({
      chats: {
        state: modifiedChatList,
        status: DataStatus.Success,
      },
    }));
  },
}));
