import { generateKeyPair, sign } from "../helpers/crypto";
import { Buffer } from "buffer";
import axios from "axios";
import { NavigateFunction } from "react-router-dom";
import { authenticate } from "../helpers/auth";
import { create } from "zustand";
import { DataStatus } from "./interfaces";
import { persist } from "zustand/middleware";
import { MediatorAgent } from "../helpers/mediator";
import { useChatStore } from "./chat-list/store";

export interface Identity {
  privateKey: string;
  publicKey: string;
  alias: string;
  mediators: string[];
}

export interface GenerateIdentityData {
  alias: string;
}

export interface ImportIdentityData {
  recoveryKey: string;
}

export interface RegisterMediatorData {
  mediatorUrl: string;
}

interface UseIdentityStore {
  data: Identity | null;
  dataStatus: DataStatus;
  mediatorAgent: MediatorAgent | null;
  generateIdentity: (data: GenerateIdentityData) => void;
  registerMediator: (
    registerData: RegisterMediatorData,
    navigate?: NavigateFunction
  ) => Promise<void>;
  createMediatorAgent: () => Promise<void>;
  disconnectAgent: () => void;
}

export const useIdentityStore = create(
  persist<UseIdentityStore>(
    (set, get) => ({
      data: null,
      dataStatus: DataStatus.Pending,
      mediatorAgent: null,
      generateIdentity: (data: GenerateIdentityData) => {
        const keyPair = generateKeyPair();

        set(() => ({
          data: {
            privateKey: keyPair.privateKey,
            publicKey: keyPair.publicKey,
            alias: data.alias,
            mediators: [],
          },
          dataStatus: DataStatus.Success,
        }));
      },
      registerMediator: async (
        registerData: RegisterMediatorData,
        navigate?: NavigateFunction
      ) => {
        const identity = get().data;

        if (
          identity === null ||
          identity.mediators.includes(registerData.mediatorUrl)
        ) {
          navigate?.("/settings");

          return;
        }

        const authenticationData = await authenticate(
          identity.publicKey,
          identity.privateKey,
          registerData.mediatorUrl
        );

        const data = {
          alias: identity.alias,
          mediator_addr: [...identity.mediators, registerData.mediatorUrl],
        };

        const dataSignature = Buffer.from(
          sign(identity.privateKey, JSON.stringify(data))
        ).toString("hex");

        await axios.post(`${registerData.mediatorUrl}/${identity.publicKey}`, {
          ...authenticationData,
          data,
          data_signature: dataSignature,
        });

        set((current) => ({
          ...current,
          data: {
            ...identity,
            mediators: [...identity.mediators, registerData.mediatorUrl],
          },
          dataStatus: DataStatus.Success,
        }));

        navigate?.("/settings");
      },
      createMediatorAgent: async () => {
        const identity = get().data;

        if (identity === null) {
          return;
        }

        const mediatorAgent = new MediatorAgent(
          identity.alias,
          identity.publicKey,
          // identity is its own recipiant
          identity.publicKey,
          identity.privateKey,
          identity.mediators
        );

        mediatorAgent
          .addEventStreamListener(
            useChatStore.getState().processChatEventStream
          )
          .addEventStreamListener(
            useChatStore.getState().processChatListEventStream
          );

        await mediatorAgent.establishMediatorConnections();

        if (get().mediatorAgent) {
          mediatorAgent.closeMediatorConnections();
          return;
        }

        set(() => ({ mediatorAgent }));
      },
      disconnectAgent: () => {
        get().mediatorAgent?.closeMediatorConnections();
        set({ mediatorAgent: null });
      },
    }),
    {
      name: "identity",
      partialize: (state) => {
        state.mediatorAgent = null;
        return state;
      },
    }
  )
);
