import { Button, List, Title } from "@mantine/core";
import { MediatorAgent } from "../helpers/mediator";
import { useChatStore } from "../data/chat-list/store";
import { useEffect } from "react";

interface ChatListProps {
  identityMediatorAgent: MediatorAgent;
  recipientMediatorAgent: MediatorAgent;
}

export const ChatList: React.FC<ChatListProps> = ({
  identityMediatorAgent,
  recipientMediatorAgent,
}: ChatListProps) => {
  const fetchChatList = useChatStore((state) => state.fetchChatList);
  const updateChat = useChatStore((state) => state.updateChat);
  const chatList = useChatStore((state) => state.chats);

  useEffect(() => {
    console.log(chatList.status);
    if (chatList.status === "pending") {
      fetchChatList(identityMediatorAgent);
    }
  }, [chatList.status]);

  if (chatList === null || chatList.state === null) {
    return (
      <>
        <Title order={4}>Your chatlist is empty</Title>
      </>
    );
  }

  return (
    <>
      <Title order={3}>Chat List</Title>
      <List>
        {Object.keys(chatList.state).map((chatId) => {
          const chat = chatList.state![chatId];

          return (
            <List.Item key={chatId} p={2}>
              {chat!.state?.recipientAlias} - {chat!.state?.title}{" "}
              <Button
                size=""
                onClick={() => {
                  updateChat(
                    identityMediatorAgent,
                    recipientMediatorAgent,
                    chatId,
                    "New Title"
                  );
                }}
              >
                Rename
              </Button>
            </List.Item>
          );
        })}
      </List>
    </>
  );
};
