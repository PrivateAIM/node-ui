import type { EventLogResponse } from "~/services/Api";

export const fakeEventResponse: EventLogResponse = {
  data: [
    {
      image: "node-ui",
      component: "node",
      event_name: "node.settings.get.success",
      service: "Hub Adapter",
      level: "Info",
      timestamp: "2026-02-19T07:50:14Z",
      message: "A user fetched the node's configurations settings",
      user: "someuser",
    },
  ],
  meta: { count: 1, total: 1, limit: 50, offset: 0 },
};
