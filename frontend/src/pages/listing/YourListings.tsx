import { autoUpdate, offset, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { Fragment, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "src/components/button/Button";
import { Loading } from "src/components/loading/Loading";
import { Modal } from "src/components/modal/Modal";
import { sendRequest } from "src/rpc/ajax";
import { DeleteListing, GetHostedListings } from "src/rpc/api";
import { useHostedListings } from "src/rpc/data";
import { Listing } from "src/rpc/types";
import { mergeClasses } from "src/utils/twmerge";
import { mutate } from "swr";

export const YourListings: React.FC = () => {
  const { hosted, error } = useHostedListings();
  const navigate = useNavigate();
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  if (!hosted) {
    if (!error) {
      return <Loading />;
    } else {
      return <div>Something unexpected happened.</div>;
    }
  }

  return (
    <div className="tw-flex tw-justify-center tw-pt-2 sm:tw-pt-6 tw-pb-24 tw-px-8 tw-overflow-auto">
      <DeleteModal
        selected={listingToDelete}
        show={showDeleteConfirmation}
        closeModal={() => setShowDeleteConfirmation(false)}
      />
      <div className="tw-flex tw-flex-col sm:tw-max-w-6xl tw-w-full">
        <div className="tw-flex tw-flex-row tw-justify-between tw-items-center tw-w-full tw-mt-6 tw-mb-5">
          <div className="tw-font-bold tw-text-2xl sm:tw-text-3xl">Your listings</div>
          <NavLink
            className="tw-border tw-border-solid tw-border-gray-600 tw-px-3 tw-py-2 tw-rounded-lg tw-ml-8 hover:tw-bg-gray-200 tw-whitespace-nowrap tw-h-fit"
            to={"/listings/new"}
          >
            New Listing
          </NavLink>
        </div>
        <div className="tw-flow-root">
          <div className="tw-inline-block tw-w-full tw-py-2 tw-align-middle">
            <div className="tw-overflow-auto tw-shadow tw-ring-1 tw-ring-black tw-ring-opacity-5 tw-rounded-lg">
              <table className="tw-w-full tw-divide-y tw-divide-gray-300">
                <thead className="tw-bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="tw-py-3.5 tw-pl-4 tw-pr-3 tw-text-left tw-text-sm tw-font-semibold tw-text-gray-900 sm:tw-pl-6"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="tw-px-3 tw-py-3.5 tw-text-left tw-text-sm tw-font-semibold tw-text-gray-900"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="tw-px-3 tw-py-3.5 tw-text-left tw-text-sm tw-font-semibold tw-text-gray-900 tw-max-w-md"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="tw-px-3 tw-py-3.5 tw-text-left tw-text-sm tw-font-semibold tw-text-gray-900"
                    >
                      Price
                    </th>
                    <th scope="col" className="tw-relative tw-py-3.5 tw-pl-3 tw-pr-4 sm:tw-pr-6">
                      <span className="tw-sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="tw-divide-y tw-divide-gray-200 tw-bg-white">
                  {hosted.map((listing: Listing) => (
                    <tr key={listing.id}>
                      <td
                        className="tw-whitespace-nowrap tw-py-4 tw-pl-4 tw-pr-3 tw-text-sm tw-font-medium tw-text-gray-900 sm:tw-pl-6 tw-cursor-pointer"
                        onClick={() => navigate(`/listings/${listing.id}/edit`)}
                      >
                        {listing.name}
                      </td>
                      <td className="tw-whitespace-nowrap tw-px-3 tw-py-4 tw-text-sm tw-text-gray-500">
                        {listing.category}
                      </td>
                      <td className="tw-whitespace-nowrap tw-text-ellipsis tw-px-3 tw-py-4 tw-text-sm tw-text-gray-500 tw-max-w-[120px] tw-overflow-hidden">
                        {listing.location}
                      </td>
                      <td className="tw-whitespace-nowrap tw-px-3 tw-py-4 tw-text-sm tw-text-gray-500">
                        ${listing.price}
                      </td>
                      <td className="tw-flex tw-justify-end tw-items-center tw-whitespace-nowrap tw-py-4 tw-text-sm tw-font-medium tw-pr-6">
                        <div
                          onClick={() => navigate(`/listings/${listing.id}/edit`)}
                          className="tw-w-fit tw-cursor-pointer tw-text-indigo-600 hover:tw-text-indigo-900"
                        >
                          Edit
                        </div>
                        <ListingMenu
                          deleteListing={() => {
                            setListingToDelete(listing);
                            setShowDeleteConfirmation(true);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ListingMenu: React.FC<{ deleteListing: () => void }> = ({ deleteListing }) => {
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
                    onClick={deleteListing}
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
