"use client";

import { isProd } from "@coaster/utils/common";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { Suspense, useEffect } from "react";

export const RudderInit = () => {
  if (!isProd()) return null;

  return (
    <>
      <Script id="rudder-script">
        {`!function(){"use strict";var sdkBaseUrl="https://cdn.rudderlabs.com/v3";var sdkName="rsa.min.js";var asyncScript=true
        ;window.rudderAnalyticsBuildType="legacy",window.rudderanalytics=[]
        ;var e=["setDefaultInstanceKey","load","ready","page","track","identify","alias","group","reset","setAnonymousId","startSession","endSession"]
        ;for(var t=0;t<e.length;t++){var n=e[t];window.rudderanalytics[n]=function(e){return function(){
        window.rudderanalytics.push([e].concat(Array.prototype.slice.call(arguments)))}}(n)}try{
        new Function('return import("")'),window.rudderAnalyticsBuildType="modern"}catch(a){}
        if(window.rudderAnalyticsMount=function(){
        "undefined"==typeof globalThis&&(Object.defineProperty(Object.prototype,"__globalThis_magic__",{get:function get(){
        return this},configurable:true}),__globalThis_magic__.globalThis=__globalThis_magic__,
        delete Object.prototype.__globalThis_magic__);var e=document.createElement("script")
        ;e.src="".concat(sdkBaseUrl,"/").concat(window.rudderAnalyticsBuildType,"/").concat(sdkName),e.async=asyncScript,
        document.head?document.head.appendChild(e):document.body.appendChild(e)
        },"undefined"==typeof Promise||"undefined"==typeof globalThis){var d=document.createElement("script")
        ;d.src="https://polyfill.io/v3/polyfill.min.js?features=Symbol%2CPromise&callback=rudderAnalyticsMount",
        d.async=asyncScript,document.head?document.head.appendChild(d):document.body.appendChild(d)}else{
        window.rudderAnalyticsMount()}window.rudderanalytics.load("2Va8vvJ85DejVV7jncdVenC6smB","https://trycoasterlyoh.dataplane.rudderstack.com",{plugins:["BeaconQueue", "DeviceModeDestinations", "NativeDestinationQueue", "StorageEncryption", "XhrQueue"]})}();`}
      </Script>
      <Suspense>
        <RudderInitInner />
      </Suspense>
    </>
  );
};

const RudderInitInner = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if ((window as any).rudderanalytics) {
      (window as any).rudderanalytics.page();
    }
  }, [pathname, searchParams]);

  return null;
};
