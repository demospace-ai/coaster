import { isProd } from "@coaster/utils/common";
import Analytics from "@rudderstack/rudder-sdk-node";

const client = new Analytics("2Va8vvJ85DejVV7jncdVenC6smB", {
  dataPlaneUrl: "https://trycoasterlyoh.dataplane.rudderstack.com",
});

export function trackEventServer(anonymousID: string, eventName: string, eventProperties?: any) {
  if (isProd()) {
    client.track({
      anonymousId: anonymousID,
      event: eventName,
      properties: eventProperties,
      integrations: {
        "Facebook Pixel": {
          contentType: "destination",
        },
      },
    });
  }
}
