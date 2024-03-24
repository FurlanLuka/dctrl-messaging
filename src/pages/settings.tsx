import {
  Alert,
  Button,
  Code,
  Grid,
  GridCol,
  Table,
  Title,
} from "@mantine/core";
import { useIdentityStore } from "../data/identity";
import { IconInfoCircle, IconTrash } from "@tabler/icons-react";
import { CopyButton } from "../components/copyButton";
import { useNavigate } from "react-router-dom";

export const Settings = () => {
  const identity = useIdentityStore((state) => state);
  const navigate = useNavigate();

  if (identity.data === null) {
    return <></>;
  }

  return (
    <>
      <Title order={2}>Settings</Title>{" "}
      <Grid mt={10}>
        <GridCol>
          <Alert
            variant="light"
            color="blue"
            title="Key pair"
            icon={<IconInfoCircle />}
          >
            Your key pair is your identity. It is used to sign and encrypt
            messages. It is important that you keep your private key secret.
            Your public key can be shared with anyone.
          </Alert>
          <Table mt={10}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={"20%"}>Key variant</Table.Th>
                <Table.Th>Value</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Private Key</Table.Td>
                <Table.Td>
                  <Code>{identity.data.privateKey}</Code>
                  <CopyButton value={identity.data.privateKey} />
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Public Key</Table.Td>
                <Table.Td>
                  <Code>{identity.data.publicKey}</Code>
                  <CopyButton value={identity.data.publicKey} />
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Recovery Key</Table.Td>
                <Table.Td>
                  <Code
                    style={{
                      wordBreak: "break-all",
                    }}
                  >
                    {identity.data.publicKey +
                      identity.data.publicKey +
                      identity.data.publicKey +
                      identity.data.publicKey}
                  </Code>
                  <CopyButton value={identity.data.publicKey} />
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </GridCol>
        <GridCol>
          <Alert
            variant="light"
            color="blue"
            title="Mediator"
            icon={<IconInfoCircle />}
          >
            Mediators are nodes that help you and others communicate with each
            other. They are essential for the network to function. You can add
            or remove mediators at any time. In order for you to be connected to
            the Decentrl network you need to have at least one mediator.
          </Alert>
        </GridCol>
        <GridCol>
          <Title order={4}>Mediators</Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={"90%"}>Url</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {identity.data.mediators.map((mediator) => (
                <Table.Tr key={mediator}>
                  <Table.Td>
                    <Code>{mediator}</Code>
                  </Table.Td>
                  <Table.Td>
                    <Button variant={"transparent"}>
                      <IconTrash size={20} color={"red"} />
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </GridCol>
        <GridCol>
          <Button
            variant={"light"}
            onClick={() => navigate("/settings/register-mediator")}
          >
            Add mediator
          </Button>
        </GridCol>
      </Grid>
    </>
  );
};
