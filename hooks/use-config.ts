import typedFetch from "@/lib/typed-fetch";
import { EnvConfig } from "@/types";
import useSWR from "swr";

async function fetchConfig(): Promise<EnvConfig> {
  return typedFetch<EnvConfig>("/api/config");
}

export default function useConfig() {
  const { data: config } = useSWR<EnvConfig>("env-config", fetchConfig);

  return config;
}
