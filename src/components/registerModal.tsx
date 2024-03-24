import { Modal, Button, Input } from "@mantine/core";
import { useIdentityStore } from "../data/identity";
import { useState } from "react";

export const RegisterModal = () => {
  const generateIdentity = useIdentityStore((state) => state.generateIdentity);

  const [state, setState] = useState<"Select" | "Generate" | "Import">(
    "Select"
  );

  const [inputValue, setInputValue] = useState("");

  return (
    <>
      <Modal
        opened={true}
        onClose={() => {}}
        title={
          (state === "Select" && "Register") ||
          (state === "Generate" && "Generate") ||
          (state === "Import" && "Import") ||
          ""
        }
        centered
      >
        {state === "Select" && (
          <>
            <Button onClick={() => setState("Generate")}>
              Generate identity
            </Button>
            &nbsp;
            <Button onClick={() => setState("Import")}>Import identity</Button>
          </>
        )}
        {(state === "Generate" || state === "Import") && (
          <>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                (state === "Generate" && "Alias") ||
                (state === "Import" && "Recovery key") ||
                ""
              }
            />
            <br />
            <Button
              onClick={() => {
                if (state === "Generate") {
                  generateIdentity({ alias: inputValue });
                }
              }}
            >
              Generate
            </Button>
          </>
        )}
      </Modal>
    </>
  );
};
