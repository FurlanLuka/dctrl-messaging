/* eslint-disable @typescript-eslint/no-explicit-any */
import { authenticate } from "./auth";
import { decrypt, encrypt } from "./crypto";

export interface MediatorAgentEvent<T = Record<string, any>> {
  created_at: number;
  event: T;
  recipient: string;
  sender: string;
  stream_id: string;
}

export type MediatorEventListener = (
  type: "mediatorEvent",
  event: MediatorAgentEvent
) => void;

export type MediatorEventStreamListener = (
  streamId: string,
  eventStream: MediatorAgentEvent[],
  identityMediatorAgent: MediatorAgent
) => void;

export class MediatorAgent {
  private mediatorConnections: Map<string, WebSocket> = new Map();
  private eventStreamListener: Set<MediatorEventStreamListener> = new Set();
  private streamCache: Map<string, number> = new Map();

  private closing: boolean = false;

  constructor(
    public alias: string,
    public publicKey: string,
    public recipientPublicKey: string,
    private privateKey: string,
    public mediators: string[],
    public isRecipient: boolean = false,
    private streamCacheTime: number = 60
  ) {}

  shouldRefetchStream(streamId: string) {
    const lastFetch = this.streamCache.get(streamId);

    if (lastFetch === undefined) {
      return true;
    }

    return new Date().getTime() / 1000 - lastFetch > this.streamCacheTime;
  }

  addEventStreamListener(listener: MediatorEventStreamListener) {
    this.eventStreamListener.add(listener);

    return this;
  }

  async establishMediatorConnections() {
    const notConnectedMediators = this.mediators.filter(
      (mediator) => this.mediatorConnections.has(mediator) === false
    );

    await Promise.all(
      notConnectedMediators.map((mediator) => this.connectToMediator(mediator))
    );
  }

  closeMediatorConnections() {
    this.closing = true;

    for (const connection of this.mediatorConnections.values()) {
      connection.close();
    }
  }

  async connectToMediator(mediatorUrl: string) {
    const authenticationData = await authenticate(
      this.publicKey,
      this.privateKey,
      mediatorUrl
    );

    const mediatorWsUrl = mediatorUrl
      .replace("https://", "wss://")
      .replace("http://", "ws://");

    const connection = new WebSocket(
      `${mediatorWsUrl}/?dctrl=${this.publicKey}&identity_signature=${authenticationData.identity_signature}&registry_signature=${authenticationData.registry_signature}&handshake_key=${authenticationData.handshake_key}`
    );

    connection.onopen = () => {
      if (!this.closing) {
        this.mediatorConnections.set(mediatorUrl, connection);
      }
    };

    connection.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      console.log("MESSAGE NEW", message);

      if (message.type === "queue_fetched") {
        for (const event of message.data) {
          const decryptedMessageData = await decrypt(
            event.sender,
            this.privateKey,
            event.event
          );
          const messageData = JSON.parse(decryptedMessageData);

          console.log("Queue fetched", {
            ...event,
            messageData,
          });

          this.ackEvent(event.id);
          console.log("Event acknowledged");
          this.sendSaveEvent(
            event.id,
            event.recipient,
            event.sender,
            messageData,
            event.stream_id,
            event.created_at
          );
          console.log("Event saved");
          this.fetchStream(event.stream_id);
          console.log("Stream fetched");
        }
      } else {
        console.log("Received message", message);
      }

      if (message.type === "stream_fetched") {
        this.eventStreamListener.forEach(async (listener) => {
          const events: MediatorAgentEvent<string>[] = message.data;
          const decryptedEvents: MediatorAgentEvent[] = await Promise.all(
            events.map(async (event) => {
              const decryptedMessageData = await decrypt(
                event.sender,
                this.privateKey,
                event.event
              );

              return {
                ...event,
                event: JSON.parse(decryptedMessageData),
              };
            })
          );

          console.log("decrypted", decryptedEvents);

          listener(message.stream_id, decryptedEvents, this);
        });
      }
    };

    connection.onclose = () => {
      console.log("Disconnected from mediator", mediatorUrl);
      this.mediatorConnections.delete(mediatorUrl);
    };
  }

  sendEvent<T extends Record<string, any> = Record<string, any>>(
    recipientMediatorAgent: MediatorAgent,
    streamId: string,
    senderEvent: T,
    recipientEventModifier: Partial<T> = {}
  ) {
    recipientMediatorAgent.sendEnqueueEvent(
      {
        ...senderEvent,
        ...recipientEventModifier,
      },
      streamId
    );

    this.sendSaveEvent(
      crypto.randomUUID(),
      recipientMediatorAgent.publicKey,
      this.publicKey,
      senderEvent,
      streamId,
      new Date().getTime() / 1000
    );
  }

  // This should be only called from recipient agent
  async sendEnqueueEvent(event: Record<string, any>, streamId: string) {
    const encryptedEventPayload = await encrypt(
      this.recipientPublicKey,
      this.privateKey,
      JSON.stringify(event)
    );

    for (const connection of this.mediatorConnections.values()) {
      connection.send(
        JSON.stringify({
          cmd: "enqueue",
          data: {
            stream_id: streamId,
            recipient: this.recipientPublicKey,
            event: encryptedEventPayload,
            created_at: new Date().getTime() / 1000,
          },
        })
      );
    }
  }

  async ackEvent(id: string) {
    for (const connection of this.mediatorConnections.values()) {
      connection.send(
        JSON.stringify({
          cmd: "ack",
          data: {
            id,
          },
        })
      );
    }
  }

  async sendSaveEvent(
    id: string,
    recipient: string,
    sender: string,
    event: Record<string, any>,
    streamId: string,
    createdAt: number
  ) {
    const encryptedEventPayload = await encrypt(
      this.recipientPublicKey,
      this.privateKey,
      JSON.stringify(event)
    );

    for (const connection of this.mediatorConnections.values()) {
      connection.send(
        JSON.stringify({
          cmd: "save",
          data: {
            id,
            recipient,
            sender,
            event: encryptedEventPayload,
            stream_id: streamId,
            created_at: createdAt,
          },
        })
      );
    }
  }

  async fetchQueue() {
    for (const connection of this.mediatorConnections.values()) {
      connection.send(
        JSON.stringify({
          cmd: "fetch_queue",
        })
      );
    }
  }

  async fetchStream(streamId: string) {
    for (const connection of this.mediatorConnections.values()) {
      connection.send(
        JSON.stringify({
          cmd: "fetch_stream",
          data: {
            stream_id: streamId,
          },
        })
      );
    }

    this.streamCache.set(
      streamId,
      new Date().getTime() / 1000 + this.streamCacheTime
    );
  }
}
