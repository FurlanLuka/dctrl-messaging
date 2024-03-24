/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataStatus, ListState } from "../data/interfaces";
import { MediatorAgent, MediatorAgentEvent } from "./mediator";

export const chatListStreamId = ["chat"];
export const chatListItemStreamId = ["chat", "item"];

export const getChatListStreamId = () => ["chat"];
export const getChatListItemStreamId = (id: string) => ["chat", id];

interface ProcessListInitializerEventStreamParams<
  T extends Record<string, unknown>
> {
  streamId: string;
  eventStream: MediatorAgentEvent[];
  identityMediatorAgent: MediatorAgent;
  oldList: ListState<T>;
  initializerEventGuard: (
    event: MediatorAgentEvent
  ) => event is MediatorAgentEvent;
  initializerEventProcessor: (event: MediatorAgentEvent<any>) => T;
  initializerStreamId: string;
}

export const processListInitializerEventStream = <
  T extends Record<string, any>
>({
  streamId,
  eventStream,
  identityMediatorAgent,
  oldList,
  initializerEventGuard,
  initializerEventProcessor,
  initializerStreamId,
}: ProcessListInitializerEventStreamParams<T>): ListState<T> | null => {
  if (streamId !== initializerStreamId) {
    return null;
  }

  const newList: ListState<T> = eventStream.reduce((acc, data) => {
    if (!initializerEventGuard(data)) {
      return acc;
    }

    return {
      ...acc,
      [data.event.id]: {
        state: initializerEventProcessor(data),
        status: DataStatus.Success,
        initializerEvent: data,
        mutationEventStream: [],
      },
    };
  }, {} satisfies ListState<T>);

  const deduplicatedList = {
    ...newList,
    ...oldList,
  };

  Object.keys(deduplicatedList).forEach((key) => {
    identityMediatorAgent.fetchStream(`${initializerStreamId}/${key}`);
  });

  return deduplicatedList;
};

interface ProcessListItemModifierEventStreamParams<
  T extends Record<string, unknown>
> {
  streamId: string;
  eventStream: MediatorAgentEvent[];
  oldList: ListState<T>;
  eventStreamProcessor: (
    event: MediatorAgentEvent<any>[],
    streamId: string
  ) => T;
  initializerStreamId: string;
}

export const processListItemModifierEventStream = <
  T extends Record<string, any>
>({
  streamId,
  eventStream,
  oldList: list,
  eventStreamProcessor,
  initializerStreamId,
}: ProcessListItemModifierEventStreamParams<T>): ListState<T> | null => {
  if (!streamId.startsWith(`${initializerStreamId}/`)) {
    return null;
  }

  const id = streamId.split("/")[1];
  const listItem = list[id];

  if (
    !listItem ||
    listItem.initializerEvent === null ||
    listItem.state === null
  ) {
    return null;
  }

  const updatedListItem = eventStreamProcessor(
    [listItem.initializerEvent, ...eventStream],
    streamId
  );

  list[id] = {
    state: updatedListItem,
    status: DataStatus.Success,
    initializerEvent: listItem.initializerEvent,
    mutationEventStream: eventStream,
  };

  return list;
};
