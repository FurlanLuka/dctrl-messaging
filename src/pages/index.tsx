import { Title } from "@mantine/core";
import { useIdentityStore } from "../data/identity";

export const Index = () => {
  const identity = useIdentityStore((state) => state);

  if (identity.data === null) {
    return <></>;
  }

  return (
    <>
      <Title order={1}>Index</Title>
    </>
  );
};
