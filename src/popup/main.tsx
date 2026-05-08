import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/api/queryClient";
import AuthGate from "@/popup/AuthGate";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthGate>
      <App />
    </AuthGate>
  </QueryClientProvider>,
);
