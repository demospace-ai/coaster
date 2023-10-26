"use client";

import { useListing } from "@coaster/rpc/client";
import { Listing } from "@coaster/rpc/common";
import { createContext, useContext } from "react";

const ListingContext = createContext<Listing | null>(null);
export const useListingContext = () => {
  const context = useContext(ListingContext);
  if (context == null) {
    throw new Error("Tooltip components must be wrapped in <Tooltip />");
  }

  return context;
};

export const ListingContextProvider: React.FC<{
  initialData: Listing;
  children: React.ReactNode;
}> = ({ initialData, children }) => {
  const { listing, error } = useListing(initialData.id, initialData);
  if (error) {
    return <div>Something unexpected happened.</div>;
  }
  return <ListingContext.Provider value={listing ? listing : null}>{children}</ListingContext.Provider>;
};
