import axios from "axios";
import { Buffer } from "buffer";
import { sign } from "./crypto";

export const authenticate = async (
  publicKey: string,
  privateKey: string,
  mediatorUrl: string
) => {
  const getHandshakeResponse = await axios.get(
    `${mediatorUrl}/${publicKey}/handshake`
  );

  const identitySignature = Buffer.from(
    sign(privateKey, getHandshakeResponse.data.registry_signature)
  ).toString("hex");

  return {
    identity_signature: identitySignature,
    registry_signature: getHandshakeResponse.data.registry_signature,
    handshake_key: getHandshakeResponse.data.handshake_key,
  };
};
