import {
  Badge,
  NavLink,
  NavLinkProps,
  PolymorphicComponentProps,
  Title,
} from "@mantine/core";
import { useChatStore } from "../data/chat-list/store";
import { useEffect } from "react";
import { MediatorAgent } from "../helpers/mediator";
import { DataStatus } from "../data/interfaces";
import { useNavigate } from "react-router-dom";
import { IconChevronRight } from "@tabler/icons-react";

const ChatLink = (
  props: Partial<PolymorphicComponentProps<"a", NavLinkProps>> & {
    path: string;
  }
) => {
  const navigate = useNavigate();

  return <NavLink {...props} onClick={() => navigate(props.path)} />;
};

interface ChatListProps {
  identityMediatorAgent: MediatorAgent | null;
}

export const ChatList: React.FC<ChatListProps> = ({
  identityMediatorAgent,
}: ChatListProps) => {
  const fetchChatList = useChatStore((state) => state.fetchChatList);
  const chatList = useChatStore((state) => state.chats);

  useEffect(() => {
    if (identityMediatorAgent === null) {
      return;
    }

    if (chatList.status !== DataStatus.Pending) {
      return;
    }

    fetchChatList(identityMediatorAgent);
  }, [chatList.status, identityMediatorAgent]);

  if (chatList === null || chatList.state === null) {
    return (
      <>
        <Title order={4}>Your chatlist is empty</Title>
      </>
    );
  }

  return (
    <>
      {Object.keys(chatList.state).map((chatId) => {
        const chat = chatList.state[chatId];

        if (chat === undefined) {
          return null;
        }

        return (
          //   <List.Item key={chatId} p={2}>
          //     {chat!.state?.recipientAlias} - {chat!.state?.title}{" "}
          //   </List.Item>
          <ChatLink
            key={chatId}
            path={`/chat/${chatId}`}
            label={`${chat!.state?.title}`}
            description={chat!.state?.recipientAlias}
            leftSection={
              <Badge size="xs" color="blue" circle>
                !
              </Badge>
            }
            rightSection={
              <IconChevronRight
                size="0.8rem"
                stroke={1.5}
                className="mantine-rotate-rtl"
              />
            }
            bg={"#F2F2F2"}
            mb={3}
          />
        );
      })}
    </>
  );
};
