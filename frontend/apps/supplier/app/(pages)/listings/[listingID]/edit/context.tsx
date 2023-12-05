"use client";

import { useListing } from "@coaster/rpc/client";
import { Listing } from "@coaster/types";
import { consumeError } from "@coaster/utils/client";
import { createContext, useContext } from "react";

const ListingContext = createContext<Listing | undefined>(undefined);
export const useListingContext = () => {
  const context = useContext(ListingContext);
  if (context === undefined) {
    consumeError("Missing listing context.");
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
  return <ListingContext.Provider value={listing}>{children}</ListingContext.Provider>;
};
