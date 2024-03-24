import React from "react";
import ReactDOM from "react-dom/client";

import { createTheme, MantineProvider } from "@mantine/core";

import "@mantine/core/styles.css";

import { App } from "./layout.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      gcTime: Infinity,
    },
    queries: {
      gcTime: Infinity,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnReconnect: false,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

const theme = createTheme({
  /** Put your mantine theme override here */
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme}>
          <App />
        </MantineProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </PersistQueryClientProvider>
  </React.StrictMode>
);
