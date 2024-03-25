import { MediatorAgentEvent } from "../helpers/mediator";

export enum DataStatus {
  Pending = "pending",
  Loading = "loading",
  Success = "success",
  Error = "error",
}

export interface EventStream<T> {
  state: T | null;
  status: DataStatus;
  initializerEvent: MediatorAgentEvent | null;
  mutationEventStream: MediatorAgentEvent[];
  initialized: boolean;
  mutated: boolean;
}

export interface ListState<T> {
  [key: string]: EventStream<T>;
}

export interface List<T> {
  state: ListState<T>;
  status: DataStatus;
}
