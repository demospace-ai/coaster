"use client";

import { Button, DropdownInput, Loading, Modal } from "@coaster/components/client";
import { updateListing, useAvailabilityRules } from "@coaster/rpc/client";
import {
  AvailabilityRule,
  AvailabilityType,
  AvailabilityTypeType,
  DeleteAvailabilityRule,
  GetAvailabilityRules,
  Listing,
  sendRequest,
} from "@coaster/rpc/server";
import { TrashIcon } from "@heroicons/react/24/outline";
import { ReactNode, useState } from "react";
import { NewRuleForm } from "supplier/app/(pages)/listings/[listingID]/edit/availability/NewAvailabilityRule";
import { ExistingRuleForm } from "supplier/app/(pages)/listings/[listingID]/edit/availability/UpdateAvailabilityRules";
import {
  getAvailabilityRuleTypeDisplay,
  getAvailabilityTypeDisplay,
} from "supplier/app/(pages)/listings/[listingID]/edit/availability/utils";
import { useListingContext } from "supplier/app/(pages)/listings/[listingID]/edit/context";
import { mutate } from "swr";

export default function Availability(): ReactNode {
  const listing = useListingContext();
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [existingRule, setExistingRule] = useState<AvailabilityRule | undefined>(undefined);
  const [newAvailabilityType, setNewAvailabilityType] = useState<AvailabilityTypeType | undefined>(undefined);
  const [showAvailabilityTypeConfirmation, setShowAvailabilityTypeConfirmation] = useState(false);
  const { availabilityRules } = useAvailabilityRules(listing?.id);
  if (!availabilityRules) {
    return <Loading />;
  }

  const updateAvailabilityType = (value: AvailabilityTypeType) => {
    return updateListing(listing.id, { availability_type: value });
  };

  const onChangeAvailabilityType = (value: AvailabilityTypeType) => {
    if (availabilityRules.length > 0) {
      setNewAvailabilityType(value);
      setShowAvailabilityTypeConfirmation(true);
    } else {
      updateAvailabilityType(value);
    }
  };

  const tableHeaderCell = "tw-w-1/6 tw-p-4";
  const tableRowCell = "tw-p-4";

  return (
    <div className="tw-flex tw-flex-col tw-w-full">
      <AvailabilityRuleModal
        listing={listing}
        show={showRuleModal}
        closeModal={() => setShowRuleModal(false)}
        existingRule={existingRule}
      />
      <DeleteRuleModal
        listing={listing}
        show={showDeleteConfirmation}
        closeModal={() => setShowDeleteConfirmation(false)}
        existingRule={existingRule}
      />
      <UpdateAvailabilityTypeModal
        listing={listing}
        show={showAvailabilityTypeConfirmation}
        closeModal={() => setShowAvailabilityTypeConfirmation(false)}
        newAvailabilityType={newAvailabilityType}
      />
      <div className="tw-text-2xl tw-font-semibold tw-mb-2">Availability</div>
      <DropdownInput
        className="tw-w-full tw-flex tw-mt-3"
        label="Availability Type"
        value={listing.availability_type}
        options={AvailabilityType.options}
        onChange={onChangeAvailabilityType}
        getElementForDisplay={getAvailabilityTypeDisplay}
      />
      <div className="tw-text-xl tw-font-medium tw-mt-8 tw-mb-4">Availability Rules</div>
      <div className="tw-rounded-lg tw-border tw-border-solid tw-border-slate-200 tw-overflow-x-auto">
        <table className="tw-w-full tw-text-left">
          <thead>
            <tr className="tw-w-full tw-border-b tw-border-solid tw-border-slate-200">
              <th className={tableHeaderCell}>Rule Name</th>
              <th className={tableHeaderCell}>Status</th>
              <th className={tableHeaderCell}>Type</th>
              <th className={tableHeaderCell}></th>
            </tr>
          </thead>
          <tbody>
            {availabilityRules.map((rule) => (
              <tr key={rule.id} className="tw-py-4 tw-border-b tw-border-solid tw-border-slate-100">
                <td className={tableRowCell}>{rule.name}</td>
                <td className={tableRowCell}>
                  <div className="tw-bg-green-100 tw-text-green-900 tw-rounded-lg tw-px-6 tw-py-0.5 tw-w-fit">
                    Active
                  </div>
                </td>
                <td className={tableRowCell}>{getAvailabilityRuleTypeDisplay(rule.type)}</td>
                <td className="tw-flex tw-items-center tw-justify-end tw-gap-8 tw-p-4 tw-ml-auto tw-pr-8">
                  <button
                    className="tw-font-medium tw-text-blue-600 hover:tw-text-blue-800"
                    onClick={() => {
                      setExistingRule(rule);
                      setShowRuleModal(true);
                    }}
                  >
                    Edit
                  </button>
                  <TrashIcon
                    className="tw-h-4 tw-cursor-pointer tw-stroke-red-500 hover:tw-stroke-red-800"
                    onClick={() => {
                      setExistingRule(rule);
                      setShowDeleteConfirmation(true);
                    }}
                  />
                </td>
              </tr>
            ))}
            <tr key="new-rule" className="tw-py-4">
              <td className="tw-p-4 tw-text-left">
                <button
                  className="tw-text-blue-600 tw-font-medium hover:tw-text-blue-800 tw-whitespace-nowrap"
                  onClick={() => {
                    setExistingRule(undefined);
                    setShowRuleModal(true);
                  }}
                >
                  + Add rule
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface AvailabilityRuleModalProps {
  listing: Listing;
  existingRule?: AvailabilityRule;
  show: boolean;
  closeModal: () => void;
}

const AvailabilityRuleModal: React.FC<AvailabilityRuleModalProps> = ({ listing, existingRule, show, closeModal }) => {
  return (
    <Modal show={show} close={closeModal}>
      {existingRule ? (
        <ExistingRuleForm key={existingRule.id} listing={listing} existingRule={existingRule} closeModal={closeModal} />
      ) : (
        <NewRuleForm listing={listing} closeModal={closeModal} />
      )}
    </Modal>
  );
};

const DeleteRuleModal: React.FC<AvailabilityRuleModalProps> = ({ listing, existingRule, show, closeModal }) => {
  const [deleting, setDeleting] = useState(false);
  if (!existingRule) {
    return <></>;
  }

  const deleteImage = async () => {
    setDeleting(true);
    try {
      await sendRequest(DeleteAvailabilityRule, {
        pathParams: { listingID: listing.id, availabilityRuleID: existingRule.id },
      });

      mutate({ GetAvailabilityRules, listingID: listing.id }, (availabilityRules) =>
        availabilityRules.filter((existingRule: AvailabilityRule) => {
          return existingRule.id !== existingRule.id;
        }),
      );
      closeModal();
    } catch (e) {}
    setDeleting(false);
  };

  return (
    <Modal show={show} close={closeModal}>
      <div className="tw-flex tw-flex-col tw-items-center tw-w-[320px] sm:tw-w-[420px] tw-px-8 sm:tw-px-12 tw-pb-10">
        <div className="tw-text-center tw-w-full tw-text-xl tw-font-medium tw-mb-6">
          Permanently delete the availability rule <span className="tw-font-bold">{existingRule.name}</span>?
        </div>
        <Button
          className="tw-flex tw-h-10 tw-w-48 tw-items-center tw-justify-center tw-whitespace-nowrap"
          onClick={deleteImage}
        >
          {deleting ? <Loading /> : "Delete"}
        </Button>
      </div>
    </Modal>
  );
};

const UpdateAvailabilityTypeModal: React.FC<{
  listing: Listing;
  show: boolean;
  closeModal: () => void;
  newAvailabilityType: AvailabilityTypeType | undefined;
}> = ({ listing, show, closeModal, newAvailabilityType }) => {
  const [updating, setUpdating] = useState(false);
  if (!newAvailabilityType) {
    return <></>;
  }

  const updateAvailabilityType = async () => {
    setUpdating(true);
    try {
      await updateListing(listing.id, { availability_type: newAvailabilityType });

      mutate({ GetAvailabilityRules, listingID: listing.id }, []);
      closeModal();
    } catch (e) {}
    setUpdating(false);
  };

  return (
    <Modal show={show} close={closeModal}>
      <div className="tw-w-[80vw] sm:tw-w-[600px] tw-px-8 sm:tw-px-12 tw-pb-10">
        <div className="tw-text-center tw-w-full tw-text-base sm:tw-text-lg tw-mb-8">
          Changing the availability type of this listing will <span className="tw-font-semibold">permanently</span>{" "}
          delete all existing availability rules. Are you sure you want to continue?
        </div>
        <Button
          className="tw-flex tw-h-[52px] tw-items-center tw-justify-center tw-whitespace-nowrap tw-w-full"
          onClick={updateAvailabilityType}
        >
          {updating ? <Loading /> : "Continue"}
        </Button>
      </div>
    </Modal>
  );
};
