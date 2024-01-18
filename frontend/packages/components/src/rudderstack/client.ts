"use client";

import { isProd } from "@coaster/utils/common";
import { RudderAnalytics } from "@rudderstack/analytics-js";
import { useEffect, useState } from "react";

export const useRudderAnalytics = () => {
  const [analytics, setAnalytics] = useState<RudderAnalytics>(new NoopAnalytics());

  useEffect(() => {
    if (!isProd()) return;

    if (!analytics) {
      const initialize = async () => {
        const { RudderAnalytics } = await import("@rudderstack/analytics-js");
        const analyticsInstance = new RudderAnalytics();

        analyticsInstance.load("2Va8vvJ85DejVV7jncdVenC6smB", "https://trycoasterlyoh.dataplane.rudderstack.com", {
          plugins: ["BeaconQueue", "DeviceModeDestinations", "NativeDestinationQueue", "StorageEncryption", "XhrQueue"],
        });

        window.rudderanalytics = analyticsInstance;
        setAnalytics(analyticsInstance);
      };

      initialize().catch((e) => console.log(e));
    }
  }, [analytics]);

  return analytics;
};

class NoopAnalytics implements RudderAnalytics {
  static globalSingleton: any;
  analyticsInstances: Record<string, any>;
  defaultAnalyticsKey: string;
  logger: any;
  preloadBuffer: any;
  initialized: boolean;
  httpClient: any;
  errorHandler: any;
  externalSrcLoader: any;
  capabilitiesManager: any;
  storeManager?: any;
  configManager?: any;
  eventManager?: any;
  userSessionManager?: any;
  pluginsManager?: any;
  clientDataStore?: any;

  constructor() {
    this.initialized = true;
    this.analyticsInstances = {};
    this.defaultAnalyticsKey = "default";
  }

  setDefaultInstanceKey(writeKey: string) {
    return;
  }
  getAnalyticsInstance(writeKey?: string | undefined) {
    return this;
  }
  load(writeKey: string, dataPlaneUrl: string, loadOptions?: any) {
    return;
  }
  triggerBufferedLoadEvent() {
    return;
  }
  ready(callback: any) {
    return;
  }
  page(category?: any, name?: any, properties?: any, options?: any, callback?: any) {
    return;
  }
  track(event: any, properties?: any, options?: any, callback?: any) {
    return;
  }
  identify(userId?: any, traits?: any, options?: any, callback?: any) {
    return;
  }
  alias(to?: any, from?: any, options?: any, callback?: any) {
    return;
  }
  group(groupId: any, traits?: any, options?: any, callback?: any) {
    return;
  }
  reset(resetAnonymousId?: boolean) {
    return;
  }
  getAnonymousId(options?: any) {
    return undefined;
  }
  setAnonymousId(anonymousId?: string, rudderAmpLinkerParam?: string) {
    return;
  }
  getUserId() {
    return undefined;
  }
  getUserTraits() {
    return undefined;
  }
  getGroupId() {
    return undefined;
  }
  getGroupTraits() {
    return undefined;
  }
  startSession(sessionId?: number) {
    return;
  }
  endSession() {
    return;
  }
  getSessionId() {
    return null;
  }
  setAuthToken(token: string) {
    return;
  }
  consent(options?: any) {
    return;
  }
  startLifecycle() {
    return;
  }
  onMounted() {
    return;
  }
  onBrowserCapabilitiesReady() {
    return;
  }
  enqueuePreloadBufferEvents(bufferedEvents: any[]) {
    return;
  }
  processDataInPreloadBuffer() {
    return;
  }
  prepareInternalServices() {
    return;
  }
  loadConfig() {
    return;
  }
  onPluginsReady() {
    return;
  }
  onConfigured() {
    return;
  }
  onInitialized() {
    return;
  }
  onReady() {
    return;
  }
  processBufferedEvents() {
    return;
  }
  loadDestinations() {
    return;
  }
  onDestinationsReady() {
    return;
  }
}

export function useTrackEvent() {
  const rudderstack = useRudderAnalytics();

  return (eventName: string, eventProperties?: any) => {
    rudderstack.track(eventName, eventProperties);
  };
}

export function getAnonymousID() {
  if (isProd() && (window as any).rudderanalytics) {
    return (window as any).rudderanalytics.getAnonymousId();
  }

  return null;
}
