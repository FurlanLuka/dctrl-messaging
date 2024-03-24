import { Tooltip, ActionIcon, rem, CopyButton as Button } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";

export const CopyButton = (props: { value: string }) => {
  return (
    <Button value={props.value} timeout={2000}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? "Copied" : "Copy"} withArrow position="right">
          <ActionIcon
            color={copied ? "teal" : "gray"}
            variant="subtle"
            onClick={copy}
            size="sm"
            top={5}
          >
            {copied ? (
              <IconCheck style={{ width: rem(16) }} />
            ) : (
              <IconCopy style={{ width: rem(16) }} />
            )}
          </ActionIcon>
        </Tooltip>
      )}
    </Button>
  );
};
