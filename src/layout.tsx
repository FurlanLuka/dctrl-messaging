import {
  AppShell,
  Burger,
  Group,
  NavLink,
  NavLinkProps,
  PolymorphicComponentProps,
  ScrollArea,
  Skeleton,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { RegisterModal } from "./components/registerModal";
import { useIdentityStore } from "./data/identity";
import { IconChevronRight } from "@tabler/icons-react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Messaging } from "./pages/messaging";
import { Settings } from "./pages/settings";
import { RegisterMediator } from "./pages/settingsRegisterMediator";

const Link = (
  props: Partial<PolymorphicComponentProps<"a", NavLinkProps>> & {
    path: string;
  }
) => {
  const navigate = useNavigate();

  return <NavLink {...props} onClick={() => navigate(props.path)} />;
};

export function App() {
  const [opened, { toggle }] = useDisclosure();
  const identity = useIdentityStore((state) => state);

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 250,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md">
            <Text size="xl" fw={700}>
              Decentrl messaging
            </Text>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
          </Group>
        </AppShell.Header>
        <BrowserRouter>
          <AppShell.Navbar p={10}>
            <AppShell.Section>
              <Title order={2}>Chats</Title>
            </AppShell.Section>
            <AppShell.Section grow my="md" component={ScrollArea}>
              {identity.data === undefined &&
                Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <Skeleton key={index} h={28} mt="sm" animate={false} />
                  ))}
              {identity.data && (
                <>
                  <Link
                    label="Home"
                    path="/"
                    rightSection={
                      <IconChevronRight
                        size="0.8rem"
                        stroke={1.5}
                        className="mantine-rotate-rtl"
                      />
                    }
                  />
                  <Link
                    path="/messaging"
                    label="Messaging"
                    rightSection={
                      <IconChevronRight
                        size="0.8rem"
                        stroke={1.5}
                        className="mantine-rotate-rtl"
                      />
                    }
                  />
                </>
              )}
            </AppShell.Section>
            <AppShell.Section>
              <Link
                path="/settings"
                label="Settings"
                rightSection={
                  <IconChevronRight
                    size="0.8rem"
                    stroke={1.5}
                    className="mantine-rotate-rtl"
                  />
                }
              />
            </AppShell.Section>
          </AppShell.Navbar>
          <AppShell.Main>
            {identity.data !== null && (
              <>
                <Text c="dimmed">Welcome back {identity.data.alias}</Text>
                <Routes>
                  <Route path="/" element={<Messaging />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route
                    path="/settings/register-mediator"
                    element={<RegisterMediator />}
                  />
                </Routes>
              </>
            )}
            <br />
          </AppShell.Main>
        </BrowserRouter>
      </AppShell>
      {identity.data === null && <RegisterModal />}
    </>
  );
}
