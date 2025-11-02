
export type AccessMethod = "DIRECT_DOWNLOAD" | "API" | "WEB_CRAWL" | "LOCAL_FILE";

export interface PlanSection {
  title: string;
  content: string;
}

export interface DiscoveredLink {
    url: string;
    accessMethod: AccessMethod;
    justification: string;
    strategy: string;
}
