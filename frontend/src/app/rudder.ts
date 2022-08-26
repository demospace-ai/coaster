import * as rudderanalytics from "rudder-sdk-js";
import { isProd } from "src/utils/env";

// only load rudderstack for production
if (isProd()) {
  rudderanalytics.load('2Du3FeHmsuj3dJPnDiPyi40UaN1', 'https://fabranickbele.dataplane.rudderstack.com');
}

export { rudderanalytics };
