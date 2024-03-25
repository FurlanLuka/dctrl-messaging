import axios from "axios";
import { create } from "zustand";
import { DataStatus } from "./interfaces";
import { MediatorAgent } from "../helpers/mediator";

export interface Recipient {
  publicKey: string;
  alias: string;
  mediators: string[];
}

interface UseRecipientStore {
  data: Recipient | null;
  dataStatus: DataStatus;
  mediatorAgent: MediatorAgent | null;
  resolveRecipient: (recipientUrl: string) => Promise<void>;
  createMediatorAgent: (privateKey: string, publicKey: string) => Promise<void>;
  disconnectAgent: () => void;
}

export const useRecipientStore = create<UseRecipientStore>((set, get) => ({
  data: null,
  dataStatus: DataStatus.Pending,
  mediatorAgent: null,
  resolveRecipient: async (recipientUrl: string) => {
    const mediatorAgent: MediatorAgent | null = get().mediatorAgent;

    const recipient = await axios.get(recipientUrl);

    if (mediatorAgent !== null) {
      mediatorAgent.closeMediatorConnections();
    }

    set(() => ({
      data: {
        publicKey: recipient.data.dctrl,
        alias: recipient.data.data.alias,
        mediators: recipient.data.data.mediator_addr,
      },
      mediatorAgent: null,
      dataStatus: DataStatus.Success,
    }));
  },
  createMediatorAgent: async (privateKey: string, publicKey: string) => {
    const recipient = get().data;

    if (recipient === null) {
      return;
    }

    const mediatorAgent = new MediatorAgent(
      recipient.alias,
      publicKey,
      recipient.publicKey,
      privateKey,
      recipient.mediators,
      true
    );

    await mediatorAgent.establishMediatorConnections();

    set(() => ({ mediatorAgent }));
  },
  disconnectAgent: () => {
    get().mediatorAgent?.closeMediatorConnections();
    set({ mediatorAgent: null });
  },
}));
