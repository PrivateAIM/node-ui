import type { EventLogResponse } from "~/services/Api";

export const fakeEventResponse: EventLogResponse = {
  data: [
    {
      id: 683,
      event_name: "node.settings.get.success",
      service_name: "hub_adapter",
      timestamp: "2026-02-19T07:50:14Z",
      body: "A user fetched the node's configurations settings",
      attributes: {
        url: "http://localhost:5000/node/settings",
        path: "/node/settings",
        tags: ["Hub Adapter", "Node", "Info"],
        user: {
          email: "foo@bar.baz",
          user_id: "f464efc6-0b39-484c-8c24-248fc628dcaf",
          username: "someuser",
          client_id: "node-ui",
        },
        client: ["127.0.0.1", 55580],
        method: "GET",
        service: "node",
        status_code: 200,
      },
    },
  ],
  meta: { count: 1, total: 1, limit: 1, offset: 0 },
};
