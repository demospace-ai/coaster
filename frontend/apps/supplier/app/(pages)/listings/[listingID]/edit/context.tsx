"use client";

import { useListing } from "@coaster/rpc/client";
import { Listing } from "@coaster/types";
import { createContext, useContext } from "react";

const ListingContext = createContext<Listing | undefined>(undefined);
export const useListingContext = () => {
  return useContext(ListingContext);
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
