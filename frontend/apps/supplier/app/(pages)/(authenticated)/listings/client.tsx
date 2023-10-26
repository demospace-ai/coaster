"use client";

import { Button, Loading, Modal } from "@coaster/components/client";
import { DeleteListing, GetHostedListings, sendRequest } from "@coaster/rpc/common";
import { Listing } from "@coaster/types";
import { mergeClasses } from "@coaster/utils";
import { autoUpdate, offset, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { Fragment, useState } from "react";
import { mutate } from "swr";

export const ListingMenu: React.FC<{ listing: Listing }> = ({ listing }) => {
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating<HTMLDivElement>({
    open,
    onOpenChange: setOpen,
    middleware: [offset(4)],
    placement: "bottom-end",
    whileElementsMounted: autoUpdate,
  });
  const click = useClick(context, {
    keyboardHandlers: false,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  return (
    <>
      <DeleteModal
        selected={listingToDelete}
        show={showDeleteConfirmation}
        closeModal={() => setShowDeleteConfirmation(false)}
      />
      <Menu as="div" className="tw-inline-block tw-text-left tw-ml-5">
        <div>
          <Menu.Button
            className="tw-flex tw-items-center tw-rounded-full tw-text-gray-600 hover:tw-text-gray-900 focus:tw-outline-none"
            ref={refs.setReference}
            {...getReferenceProps()}
          >
            <span className="tw-sr-only">Open options</span>
            <EllipsisVerticalIcon className="tw-h-5 tw-w-5" aria-hidden="true" />
          </Menu.Button>
        </div>
        <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
          <Transition
            as={Fragment}
            enter="tw-transition tw-ease-out tw-duration-100"
            enterFrom="tw-transform tw-opacity-0 tw-scale-95"
            enterTo="tw-transform tw-opacity-100 tw-scale-100"
            leave="tw-transition tw-ease-in tw-duration-75"
            leaveFrom="tw-transform tw-opacity-100 tw-scale-100"
            leaveTo="tw-transform tw-opacity-0 tw-scale-95"
          >
            <Menu.Items className="tw-z-10 tw-w-32 tw-origin-top-right tw-rounded-md tw-bg-white tw-shadow-lg tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none">
              <div className="tw-py-1">
                <Menu.Item>
                  {({ active }) => (
                    <div
                      className={mergeClasses(
                        active ? "tw-bg-gray-100 tw-text-gray-900" : "tw-text-gray-700",
                        "tw-block tw-px-4 tw-py-2 tw-text-sm tw-cursor-pointer",
                      )}
                      onClick={() => {
                        setListingToDelete(listing);
                        setShowDeleteConfirmation(true);
                      }}
                    >
                      Delete Listing
                    </div>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </div>
      </Menu>
    </>
  );
};

interface DeleteModalProps {
  selected: Listing | null;
  show: boolean;
  closeModal: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ selected, show, closeModal }) => {
  const [deleting, setDeleting] = useState(false);

  if (!selected) {
    // TODO: should not happen
    return <></>;
  }

  const deleteListing = async () => {
    setDeleting(true);
    try {
      await sendRequest(DeleteListing, {
        pathParams: { listingID: selected.id },
      });

      mutate({ GetHostedListings }, (listings: Listing[] | undefined) => {
        if (!listings) {
          return;
        }
        return listings.filter((listing) => listing.id !== selected.id);
      });
      closeModal();
    } catch (e) {}
    setDeleting(false);
  };

  return (
    <Modal show={show} close={closeModal}>
      <div className="tw-flex tw-flex-col tw-items-center tw-max-w-xl tw-px-8 sm:tw-px-12 tw-pb-10 tw-mt-2">
        <div className="tw-text-center tw-w-full tw-text-xl tw-font-medium tw-mb-6 tw-whitespace-nowrap">
          Permanently delete "{selected.name}"?
        </div>
        <Button className="tw-flex tw-h-10 tw-w-48 tw-items-center tw-justify-center" onClick={deleteListing}>
          {deleting ? <Loading /> : "Delete"}
        </Button>
      </div>
    </Modal>
  );
};
