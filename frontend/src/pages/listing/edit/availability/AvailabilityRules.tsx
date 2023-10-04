import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { FieldArrayWithId } from "react-hook-form";
import { Button } from "src/components/button/Button";
import { DropdownInput, TimeInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { Modal } from "src/components/modal/Modal";
import { useListingContext } from "src/pages/listing/edit";
import { NewRuleForm } from "src/pages/listing/edit/availability/NewAvailabilityRule";
import { ExistingRuleForm } from "src/pages/listing/edit/availability/UpdateAvailabilityRules";
import { SingleDayTimeSlotSchemaType, TimeSlotSchemaType } from "src/pages/listing/schema";
import { sendRequest } from "src/rpc/ajax";
import { DeleteAvailabilityRule, GetAvailabilityRules } from "src/rpc/api";
import { updateListing, useAvailabilityRules } from "src/rpc/data";
import {
  AvailabilityRule,
  AvailabilityRuleType,
  AvailabilityRuleTypeType,
  AvailabilityType,
  AvailabilityTypeType,
  Listing,
} from "src/rpc/types";
import { mutate } from "swr";

export const Availability: React.FC = () => {
  const { listing } = useListingContext();
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
        placeholder={"Availability Type"}
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
};

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
    return;
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
      <div className="tw-w-[320px] sm:tw-w-[420px] tw-px-8 sm:tw-px-12 tw-pb-10">
        <div className="tw-text-center tw-w-full tw-text-xl tw-font-medium tw-mb-5">
          Permanently delete the availability rule <span className="tw-font-bold">{existingRule.name}</span>?
        </div>
        <Button
          className="tw-flex tw-h-[52px] tw-items-center tw-justify-center tw-whitespace-nowrap tw-w-full"
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
    return;
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

type TimeSlotFieldsProps<T extends TimeSlotSchemaType | SingleDayTimeSlotSchemaType> = {
  fields: FieldArrayWithId<{ time_slots: T[] }>[];
  update: (index: number, timeSlot: T) => void;
  append: (timeSlot: T) => void;
  remove: (index: number) => void;
};

export const WeekDayTimeSlotFields: React.FC<TimeSlotFieldsProps<TimeSlotSchemaType>> = ({
  fields,
  append,
  update,
  remove,
}) => {
  const timeSlotMap: Map<number, { timeSlot: TimeSlotSchemaType; index: number; id: string }[]> = new Map();
  fields.map((field, idx) => {
    const existing = timeSlotMap.get(field.dayOfWeek) ?? [];
    existing.push({ timeSlot: field, index: idx, id: field.id });
    timeSlotMap.set(field.dayOfWeek, existing);
  });
  const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <>
      {[1, 2, 3, 4, 5, 6, 0].map((i) => {
        const timeSlotFields = timeSlotMap.get(i) ?? [];
        return (
          <div key={i} className="tw-flex-col sm:tw-flex-row tw-flex tw-items-start tw-py-4">
            <div className="tw-flex tw-shrink-0 tw-font-semibold tw-w-24 tw-mb-2 sm:tw-mb-0">{dayOfWeek[i]}</div>
            <div className="tw-flex tw-flex-wrap tw-gap-x-2 tw-gap-y-4">
              {timeSlotFields.map((field) => (
                <div key={field.id} className="tw-flex tw-items-center">
                  <TimeInput
                    date={field.timeSlot.startTime}
                    onDateChange={(date) => {
                      update(field.index, { ...field.timeSlot, startTime: date });
                    }}
                  />
                  <XMarkIcon
                    className="tw-ml-2 tw-h-5 tw-stroke-red-600 tw-cursor-pointer"
                    onClick={() => {
                      remove(field.index);
                    }}
                  />
                </div>
              ))}
              <div
                className="tw-flex tw-items-center tw-font-medium tw-text-blue-600 tw-cursor-pointer"
                onClick={() => {
                  append({ type: "time_slots", dayOfWeek: i, startTime: new Date("1970-01-01T10:00") });
                }}
              >
                Add start time
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export const SingleDayTimeSlotFields: React.FC<TimeSlotFieldsProps<SingleDayTimeSlotSchemaType>> = ({
  fields,
  append,
  update,
  remove,
}) => {
  return (
    <div className="tw-flex tw-flex-wrap tw-gap-x-2 tw-gap-y-4">
      {fields.map((field, idx) => (
        <div key={field.id} className="tw-flex tw-items-center">
          <TimeInput
            date={field.startTime}
            onDateChange={(date) => {
              update(idx, { ...field, startTime: date });
            }}
          />
          <XMarkIcon
            className="tw-ml-2 tw-h-5 tw-stroke-red-600 tw-cursor-pointer"
            onClick={() => {
              remove(idx);
            }}
          />
        </div>
      ))}
      <div
        className="tw-flex tw-items-center tw-font-medium tw-text-blue-600 tw-cursor-pointer"
        onClick={() => {
          append({ type: "single_day_time_slots", startTime: new Date("1970-01-01T10:00") });
        }}
      >
        Add start time
      </div>
    </div>
  );
};

export function getAvailabilityTypeDisplay(value: AvailabilityTypeType) {
  switch (value) {
    case AvailabilityType.Enum.date:
      return "Full day (customer just chooses a date)";
    case AvailabilityType.Enum.datetime:
      return "Date and time (customer chooses a date and time slot)";
  }
}

export function getAvailabilityRuleTypeDisplay(value: AvailabilityRuleTypeType) {
  switch (value) {
    case AvailabilityRuleType.Enum.fixed_date:
      return "Single Date";
    case AvailabilityRuleType.Enum.fixed_range:
      return "Fixed Range";
    case AvailabilityRuleType.Enum.recurring:
      return "Recurring";
  }
}
