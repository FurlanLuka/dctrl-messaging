/* eslint-disable react-hooks/exhaustive-deps */
import { Alert, Button, Grid, GridCol, Input } from "@mantine/core";
import { useEffect, useState } from "react";
import { useIdentityStore } from "../data/identity";
import { useRecipientStore } from "../data/recipient";
import { Chat } from "../components/chat";
import { ChatList } from "../components/chatList";

export const Messaging = () => {
  const identity = useIdentityStore((state) => state);
  const recipient = useRecipientStore((state) => state);

  const [recipientUrl, setRecipientUrl] = useState("");

  useEffect(() => {
    if (identity.mediatorAgent === null && identity.data !== null) {
      identity.createMediatorAgent();
    }
  }, [identity.mediatorAgent, identity.data]);

  useEffect(() => {
    if (identity.mediatorAgent !== null) {
      // setInterval(() => {
      //   console.log("fetching stream");
      //   identity.mediatorAgent?.fetchStream("chat");
      // }, 500);
    }
  }, [identity.mediatorAgent]);

  useEffect(() => {
    if (
      identity.data !== null &&
      recipient.mediatorAgent === null &&
      recipient.data !== null
    ) {
      console.log("Creating recipient mediator agent");

      recipient.createMediatorAgent(
        identity.data.privateKey,
        identity.data.publicKey
      );
    }
  }, [identity.data, recipient.data, recipient.mediatorAgent]);

  if (identity.data === undefined) {
    return <></>;
  }

  return (
    <>
      <Grid>
        <GridCol>
          {identity.mediatorAgent && recipient.mediatorAgent && (
            <ChatList
              identityMediatorAgent={identity.mediatorAgent}
              recipientMediatorAgent={recipient.mediatorAgent}
            />
          )}
        </GridCol>

        {recipient.mediatorAgent === null && (
          <>
            <GridCol>
              <Input
                placeholder="Recipient dctrl"
                value={recipientUrl}
                onChange={(e) => setRecipientUrl(e.target.value)}
              />
              <Button
                mt={10}
                onClick={() => {
                  recipient.resolveRecipient(recipientUrl);
                }}
              >
                Connect
              </Button>
            </GridCol>
            <GridCol>
              <Alert variant="filled" color="red" title="Not connected" />
            </GridCol>
          </>
        )}

        <GridCol>
          {recipient.mediatorAgent !== null && (
            <>
              <Alert
                variant="filled"
                color="green"
                title={`Connected with ${recipient.data?.alias}`}
              />
            </>
          )}
        </GridCol>
        {recipient.mediatorAgent !== null &&
          identity.mediatorAgent !== null && (
            <>
              <Chat
                identityMediatorAgent={identity.mediatorAgent}
                recipientMediatorAgent={recipient.mediatorAgent}
              />
              <GridCol>
                <Input
                  placeholder="Recipient dctrl"
                  value={recipientUrl}
                  onChange={(e) => setRecipientUrl(e.target.value)}
                />
                <Button
                  mt={10}
                  onClick={() => {
                    recipient.resolveRecipient(recipientUrl);
                  }}
                >
                  Send message
                </Button>
              </GridCol>
            </>
          )}
      </Grid>
    </>
  );
};
