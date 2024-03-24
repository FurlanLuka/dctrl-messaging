import {
  Alert,
  Button,
  Code,
  Grid,
  GridCol,
  Input,
  Table,
  Title,
} from "@mantine/core";
import { useIdentityStore } from "../data/identity";
import { IconInfoCircle } from "@tabler/icons-react";
import { CopyButton } from "../components/copyButton";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const RegisterMediator = () => {
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediatorUrl, setMediatorUrl] = useState("");

  const navigate = useNavigate();

  const identity = useIdentityStore((state) => state);

  if (identity.data === null) {
    return <></>;
  }

  return (
    <>
      <Title order={2}>Register Mediator</Title>{" "}
      <Grid mt={10}>
        <GridCol>
          <Alert
            variant="light"
            color="blue"
            title="Mediator registration"
            icon={<IconInfoCircle />}
          >
            By registering a mediator you expand your network. A mediator is a
            node that can relay messages and save your state. The more mediators
            you have the more robust your network becomes. Decentrl allows you
            to build your own trusted network of mediators.
          </Alert>
        </GridCol>
        {error && (
          <GridCol>
            <Alert variant="filled" color="red" title="Error">
              Something went wrong while trying to register the mediator.
            </Alert>
          </GridCol>
        )}
        <GridCol>
          <Input
            placeholder="Mediator URL"
            onChange={(e) => setMediatorUrl(e.target.value)}
          />
        </GridCol>
        <GridCol>
          <Button
            variant="light"
            disabled={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              try {
                await identity.registerMediator(
                  {
                    mediatorUrl,
                  },
                  navigate
                );
              } catch (e) {
                setError(true);
              }
              setIsSubmitting(false);
            }}
          >
            Register
          </Button>
        </GridCol>
        <GridCol mt={10}>
          <Title order={4}>Official Decentrl mediators</Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>URL</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>
                  <Code>https://decentrl.network</Code>
                  <CopyButton value={"https://decentrl.network"} />
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>
                  <Code>https://dctrl.io</Code>
                  <CopyButton value={"https://dctrl.io"} />
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>
                  <Code>http://localhost:8080</Code>
                  <CopyButton value={"http://localhost:8080"} />
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </GridCol>
      </Grid>
    </>
  );
};
