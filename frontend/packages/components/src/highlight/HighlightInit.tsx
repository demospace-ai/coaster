import { isProd } from "@coaster/utils/common";
import { HighlightInit as HInit } from "@highlight-run/next/client";

export const HighlightInit: React.FC = () => {
  if (!isProd()) {
    return null;
  }

  return (
    <HInit
      projectId="6glrn57g"
      serviceName="frontend-app"
      tracingOrigins={["api.trycoaster.com"]}
      networkRecording={{
        enabled: true,
        recordHeadersAndBody: true,
      }}
    />
  );
};
