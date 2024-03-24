import { Button, GridCol, Title } from "@mantine/core";
import { MediatorAgent } from "../helpers/mediator";
import { useChatStore } from "../data/chat-list/store";

interface ChatProps {
  recipientMediatorAgent: MediatorAgent;
  identityMediatorAgent: MediatorAgent;
}

export const Chat: React.FC<ChatProps> = ({
  recipientMediatorAgent,
  identityMediatorAgent,
}: ChatProps) => {
  const createChat = useChatStore((state) => state.createChat);
  const selectedChat = useChatStore(
    (state) => state.chats.state?.[recipientMediatorAgent.publicKey]
  );

  return (
    <>
      {selectedChat === undefined && (
        <GridCol>
          <Title order={4}>
            <Button
              onClick={() => {
                createChat(identityMediatorAgent, recipientMediatorAgent);
              }}
            >
              Create Chat
            </Button>
          </Title>
        </GridCol>
      )}
      {selectedChat && (
        <GridCol>
          <Title order={4}>Chat with {selectedChat.state?.title}</Title>
          {JSON.stringify(selectedChat)}
        </GridCol>
      )}
    </>
  );
};
