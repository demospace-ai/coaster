import { ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { Button } from "src/components/button/Button";
import { InfoIcon } from "src/components/icons/Icons";
import { InputStyle, ValidatedInput } from "src/components/input/Input";
import { DestinationSelector, NamespaceSelector, TableSelector } from "src/components/selector/Selector";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { ObjectStepProps } from "src/pages/objects/NewObject/state";
import { validateDisplayName, validateDestination, Step, DestinationSetupFormState } from "src/pages/objects/helpers";
import { shouldCreateFields, Destination, ConnectionType, TargetType, FieldType, SyncMode } from "src/rpc/api";
import { mergeClasses } from "src/utils/twmerge";
import { twMerge } from "tailwind-merge";

interface DestinationSetupProps extends ObjectStepProps {
  initialFormState?: {
    displayName?: string;
    destination?: Destination | null;
    targetType?: TargetType | null;
    namespace?: string | null;
    tableName?: string | null;
  };
}

export const DestinationSetup: React.FC<DestinationSetupProps> = (props) => {
  const { state, setState, initialFormState } = props;
  const form = useForm<DestinationSetupFormState>({
    defaultValues: {
      displayName: initialFormState?.displayName ?? "",
      destination: initialFormState?.destination ?? null,
      targetType: initialFormState?.targetType ?? null,
      namespace: initialFormState?.namespace ?? null,
      tableName: initialFormState?.tableName ?? null,
    },
  });

  const advance = () => {
    if (validateDisplayName(state, setState) && validateDestination(state, setState)) {
      if (shouldCreateFields(state.destination!.connection.connection_type, state.targetType!)) {
        setState((state) => {
          return { ...state, step: Step.CreateFields };
        });
      } else {
        setState((state) => {
          return { ...state, step: Step.ExistingFields };
        });
      }
    }
  };

  return (
    <div className="tw-flex tw-flex-col tw-w-100">
      <div className="tw-mb-1 tw-font-bold tw-text-xl tw-text-center">
        {props.isUpdate ? "Update Object" : "New Object"}
      </div>
      <div className="tw-text-center tw-mb-3">
        {props.isUpdate ? "Change your object's configuration." : "Enter your object configuration."}
      </div>
      <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-2 tw-mb-2">
        <span className="tw-font-medium">Display Name</span>
        <Tooltip placement="right" label="Pick a name for this object that your customers will see.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <input
        autoFocus
        className={mergeClasses(InputStyle, "tw-w-100")}
        {...form.register("displayName")}
        placeholder="My Destination"
      ></input>
      <div className="tw-w-full  tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-3">
        <span className="tw-font-medium">Destination</span>
      </div>
      <DestinationSelector
        className="tw-mt-0 tw-w-100"
        validated={true}
        destination={state.destination}
        disabled={props.isUpdate}
        setDestination={(value: Destination) => {
          if (!state.destination || value.id !== state.destination.id) {
            if (value.connection.connection_type === ConnectionType.Webhook) {
              // Just hardcode EndCustomerIDField and TargetType for webhooks— they don"t matter anyway
              setState({
                ...state,
                destination: value,
                namespace: undefined,
                tableName: undefined,
                targetType: TargetType.Webhook,
                endCustomerIdField: { name: "end_customer_id", type: FieldType.Integer },
                objectFields: [],
              });
            } else {
              setState({
                ...state,
                destination: value,
                namespace: undefined,
                tableName: undefined,
                endCustomerIdField: undefined,
                objectFields: [],
              });
            }
          }
        }}
      />
      <DestinationTarget isUpdate={props.isUpdate} state={state} setState={setState} />
      <Button onClick={advance} className="tw-mt-10 tw-w-full tw-h-10">
        Continue
      </Button>
    </div>
  );
};

const DestinationTarget: React.FC<ObjectStepProps> = ({ state, setState, ...props }) => {
  type TargetOption = {
    type: TargetType;
    title: string;
    description: string;
  };
  const targets: TargetOption[] = [
    {
      type: TargetType.SingleExisting,
      title: "Single Existing Table",
      description:
        "Data from all of your customers will be stored in a single existing table, with an extra ID column to distinguish between customers.",
    },
    // TODO
    // {
    //   type: TargetType.SingleNew,
    //   title: "Single New Table",
    //   description: "Data from all of your customers will be stored in a single new table, with an extra ID column to distinguish between customers."
    // },
    // {
    //   type: TargetType.TablePerCustomer,
    //   title: "Table Per Customer",
    //   description: "Data from each of your customers will be stored in a separate table in your destination. The name of the table will include the customer's ID as a suffix."
    // },
  ];

  if (!state.destination || state.destination.connection.connection_type === ConnectionType.Webhook) {
    return <></>;
  }

  return (
    <div className="tw-mt-5">
      <label className="tw-font-medium">Target</label>
      <p className="tw-text-slate-600">Where should Fabra load the data in your destination?</p>
      <fieldset className="tw-mt-4">
        <legend className="tw-sr-only">Target</legend>
        <div className="tw-space-y-4 tw-flex tw-flex-col">
          {targets.map((target) => (
            <div key={String(target.type)} className="tw-flex tw-items-center">
              <input
                id={String(target.type)}
                name="target"
                type="radio"
                checked={state.targetType === target.type}
                value={target.type}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setState({ ...state, targetType: e.target.value as TargetType })
                }
                disabled={props.isUpdate}
                className={mergeClasses(
                  "tw-h-4 tw-w-4 tw-border-slate-300 tw-text-indigo-600 focus:tw-ring-indigo-600 tw-cursor-pointer",
                  props.isUpdate ? "tw-cursor-not-allowed" : "tw-cursor-pointer",
                )}
              />
              <div className="tw-flex tw-flex-row tw-items-center tw-ml-3 tw-leading-6">
                <label htmlFor={String(target.type)} className="tw-text-sm tw-cursor-pointer">
                  {target.title}
                </label>
                <Tooltip label={target.description} placement="top-start">
                  <InfoIcon className="tw-ml-1.5 tw-h-3 tw-fill-slate-400" />
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </fieldset>
      {state.targetType === TargetType.SingleExisting && (
        <>
          <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-5 tw-mb-3">
            <span className="tw-font-medium">Namespace</span>
          </div>
          <NamespaceSelector
            className="tw-mt-0 tw-w-100"
            validated={true}
            connection={state.destination?.connection}
            namespace={state.namespace}
            disabled={props.isUpdate}
            setNamespace={(value: string) => {
              if (value !== state.namespace) {
                setState({
                  ...state,
                  namespace: value,
                  tableName: undefined,
                  endCustomerIdField: undefined,
                  objectFields: [],
                });
              }
            }}
            noOptionsString="No Namespaces Available! (Choose a data source)"
          />
          <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-3">
            <span className="tw-font-medium">Table</span>
          </div>
          <TableSelector
            className="tw-mt-0 tw-w-100"
            connection={state.destination?.connection}
            namespace={state.namespace}
            tableName={state.tableName}
            disabled={props.isUpdate}
            setTableName={(value: string) => {
              if (value !== state.tableName) {
                setState({ ...state, tableName: value, endCustomerIdField: undefined, objectFields: [] });
              }
            }}
            noOptionsString="No Tables Available! (Choose a namespace)"
            validated={true}
          />
        </>
      )}
    </div>
  );
};

export const SyncModeSelector: React.FC<ObjectStepProps> = ({ state, setState, isUpdate }) => {
  type SyncModeOption = {
    mode: SyncMode;
    title: string;
    description: string;
  };
  const syncModes: SyncModeOption[] = [
    {
      mode: SyncMode.FullOverwrite,
      title: "Full Overwrite",
      description: "Fabra will overwrite the entire target table on every sync.",
    },
    {
      mode: SyncMode.IncrementalAppend,
      title: "Incremental Append",
      description: "Fabra will append any new rows since the last sync to the existing target table.",
    },
    // TODO
    // {
    //   mode: SyncMode.IncrementalUpdate,
    //   title: "Incremental Update",
    //   description: "Fabra will add new rows and update any modified rows since the last sync."
    // },
  ];
  return (
    <div className="tw-mt-5">
      <label className="tw-font-medium">Sync Mode</label>
      <p className="tw-text-slate-600">How should Fabra load the data in your destination?</p>
      <fieldset className="tw-mt-4">
        <legend className="tw-sr-only">Sync Mode</legend>
        <div className="tw-space-y-4 tw-flex tw-flex-col">
          {syncModes.map((syncMode) => (
            <div key={String(syncMode.mode)} className="tw-flex tw-items-center">
              <input
                id={String(syncMode.mode)}
                name="syncmode"
                type="radio"
                disabled={isUpdate}
                checked={state.syncMode === syncMode.mode}
                value={syncMode.mode}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setState({ ...state, syncMode: e.target.value as SyncMode })
                }
                className="tw-h-4 tw-w-4 tw-border-slate-300 tw-text-indigo-600 focus:tw-ring-indigo-600 tw-cursor-pointer"
              />
              <div className="tw-flex tw-flex-row tw-items-center tw-ml-3 tw-leading-6">
                <label htmlFor={String(syncMode.mode)} className="tw-text-sm tw-cursor-pointer">
                  {syncMode.title}
                </label>
                <Tooltip label={syncMode.description} placement="top-start">
                  <InfoIcon className="tw-ml-1.5 tw-h-3 tw-fill-slate-400" />
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );
};
