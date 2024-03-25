import { useChatStore } from "../data/chat-list/store";
import { useRecipientStore } from "../data/recipient";
import { useEffect, useState } from "react";
import { useIdentityStore } from "../data/identity";
import { GridCol, Input, Button, Grid, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export const NewChat: React.FC = () => {
  const identity = useIdentityStore((state) => state);
  const recipient = useRecipientStore((state) => state);

  const navigate = useNavigate();

  const chat = useChatStore((state) => state);

  const [recipientUrl, setRecipientUrl] = useState("");

  useEffect(() => {
    if (recipient.mediatorAgent !== null) {
      console.log("disconnecting agent");
      recipient.disconnectAgent();
      return;
    }

    return () => {
      console.log("disconnecting agent1");
      recipient.disconnectAgent();
    };
  }, []);

  useEffect(() => {
    if (identity.mediatorAgent !== null && recipient.mediatorAgent !== null) {
      console.log("creating chat");
      chat
        .createChat(identity.mediatorAgent, recipient.mediatorAgent)
        .then((id: string) => navigate(`/chat/${id}`));
    }
  });

  if (identity.data === null) {
    return <></>;
  }

  return (
    <Grid>
      <GridCol>
        <Title order={2}>Start new chat</Title>
      </GridCol>
      <GridCol>
        <Input
          placeholder="Recipient dctrl"
          value={recipientUrl}
          onChange={(e) => setRecipientUrl(e.target.value)}
        />
        <Button
          mt={10}
          onClick={async () => {
            await recipient.resolveRecipient(recipientUrl);
            await recipient.createMediatorAgent(
              identity.data!.privateKey,
              identity.data!.publicKey
            );
          }}
        >
          Start
        </Button>
      </GridCol>
    </Grid>
  );
};
