import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "src/components/button/Button";
import { InfoIcon } from "src/components/icons/Icons";
import { InputStyle } from "src/components/input/Input";
import { DestinationSelector, NamespaceSelector, TableSelector } from "src/components/selector/Selector";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { ObjectStepProps } from "src/pages/objects/NewObject/state";
import { Step, validateDestination, validateDisplayName } from "src/pages/objects/helpers";
import {
  ConnectionType,
  Destination,
  DestinationSchema,
  Field,
  FieldSchema,
  FieldType,
  TargetType,
  shouldCreateFields,
} from "src/rpc/api";
import { mergeClasses } from "src/utils/twmerge";

interface DestinationSetupProps extends ObjectStepProps {
  initialFormState?: {
    displayName?: string;
    destination?: Destination | undefined;
    targetType?: TargetType | undefined;
    namespace?: string | undefined;
    tableName?: string | undefined;
    endCustomerIdField?: Field | undefined;
  };
}

const FormSchema = z
  .object({
    displayName: z.string().min(1, { message: "Required" }),
    destination: DestinationSchema,
    targetType: z.nativeEnum(TargetType),
    tableName: z.string().optional(),
    namespace: z.string().optional(),
    endCustomerIdField: FieldSchema.optional(),
    // Used to display form-level errors.
    formLevel: z.never().optional(),
  })
  .superRefine((data, ctx) => {
    const { targetType, namespace, tableName, endCustomerIdField } = data;
    if (targetType === TargetType.SingleExisting) {
      if (!tableName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a table",
          path: ["tableName"],
        });
      }
      if (!namespace) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a namespace",
          path: ["namespace"],
        });
      }
    } else if (targetType === TargetType.Webhook) {
      if (!endCustomerIdField) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter an end customer ID",
          path: ["formLevel"],
        });
      }
    }
  });

type UseFormReturn = ReturnType<typeof useForm<z.infer<typeof FormSchema>>>;
type Control = UseFormReturn["control"];
type Errors = UseFormReturn["formState"]["errors"];

export const DestinationSetup: React.FC<DestinationSetupProps> = (props) => {
  const { state, setState } = props;
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: async (data, context, options) => {
      // you can debug your validation schema here
      console.log("formData", data);
      console.log("validation result", await zodResolver(FormSchema)(data, context, options));
      return zodResolver(FormSchema)(data, context, options);
    },
    defaultValues: props.initialFormState,
  });
  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
    control,
    watch,
  } = form;

  console.log("isvalid", isValid);
  console.log("errors", errors);

  const onSubmit = handleSubmit((values) => {
    if (shouldCreateFields(values.destination.connection.connection_type, values.targetType!)) {
      setState((state) => {
        return {
          ...state,
          step: Step.CreateFields,
          ...values,
        };
      });
    } else {
      setState((state) => {
        return {
          ...state,
          ...values,
          step: Step.ExistingFields,
        };
      });
    }
  });

  const watchTargetType = watch("targetType");
  const watchDestination = watch("destination");
  const watchNamespace = watch("namespace");

  return (
    <div>
      <h2 className="tw-mb-1 tw-font-bold tw-text-xl tw-text-center">
        {props.isUpdate ? "Update Object" : "New Object"}
      </h2>
      <p className="tw-text-center tw-mb-3">
        {props.isUpdate ? "Change your object's configuration." : "Enter your object configuration."}
      </p>
      <form onSubmit={onSubmit} className="tw-space-y-4">
        <div>
          <label className="tw-flex tw-items-center">
            <span className="tw-font-medium">Display Name</span>
            <Tooltip placement="right" label="Pick a name for this object that your customers will see.">
              <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
            </Tooltip>
          </label>
          <input autoFocus className={InputStyle} {...register("displayName")} placeholder="My Destination"></input>
          {errors.displayName && <div className="tw-text-red-500 tw-mt-1">{errors.displayName.message}</div>}
        </div>

        <div>
          <label className="tw-font-medium">Destination</label>
          <Controller
            name="destination"
            control={control}
            render={({ field }) => {
              return (
                <DestinationSelector
                  className="tw-mt-0"
                  destination={field.value}
                  setDestination={(d) => {
                    console.log("Setting destination");
                    field.onChange(d);
                    if (d.connection.connection_type === ConnectionType.Webhook) {
                      form.setValue("targetType", TargetType.Webhook);
                      form.setValue("endCustomerIdField", { name: "end_customer_id", type: FieldType.Integer });
                    } else {
                      form.setValue("targetType", TargetType.SingleExisting);
                    }
                  }}
                />
              );
            }}
          />
        </div>
        {watchTargetType && watchTargetType !== TargetType.Webhook && (
          <DestinationTarget
            errors={errors}
            isUpdate={props.isUpdate}
            state={state}
            setState={setState}
            control={control}
            destination={watchDestination}
            namespace={watchNamespace}
            targetType={watchTargetType}
          />
        )}
        <Button type="submit" className="tw-w-full tw-py-2">
          Continue
        </Button>
        {errors.formLevel && <div className="tw-text-red-500 tw-mt-1">{errors.formLevel.message}</div>}
      </form>
    </div>
  );
};

interface DestinationTargetProps extends ObjectStepProps {
  control: Control;
  targetType: TargetType | null;
  namespace: string | undefined;
  destination: Destination | null;
  errors: Errors;
}

const DestinationTarget: React.FC<DestinationTargetProps> = ({
  namespace,
  control,
  targetType,
  destination,
  errors,
  ...props
}) => {
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

  return (
    <>
      <fieldset className="tw-my-4">
        <label className="tw-font-medium">Target</label>
        <p className="tw-text-slate-600">Where should Fabra load the data in your destination?</p>
        <legend className="tw-sr-only">Target</legend>
        <div className="tw-space-y-4 tw-mt-2">
          {targets.map((target) => (
            <Controller
              key={target.type}
              name="targetType"
              control={control}
              render={({ field }) => {
                return (
                  <div key={String(target.type)} className="tw-flex tw-items-center">
                    <input
                      id={String(target.type)}
                      name="target"
                      type="radio"
                      value={target.type}
                      checked={field.value === target.type}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        field.onChange(target.type);
                      }}
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
                );
              }}
            />
          ))}
        </div>
        {errors.targetType && <div className="tw-text-red-500 tw-mt-1">{errors.targetType.message}</div>}
      </fieldset>
      {targetType === TargetType.SingleExisting && (
        <div className="tw-space-y-4">
          <div>
            <label className="tw-font-medium">Namespace</label>
            <Controller
              name="namespace"
              control={control}
              render={({ field }) => {
                return (
                  <NamespaceSelector
                    className="tw-mt-0"
                    validated={true}
                    connection={destination?.connection}
                    namespace={field.value}
                    disabled={props.isUpdate}
                    setNamespace={field.onChange}
                    noOptionsString="No Namespaces Available! (Choose a data source)"
                  />
                );
              }}
            />
            {errors.namespace && <div className="tw-text-red-500 tw-mt-1">{errors.namespace.message}</div>}
          </div>

          <div>
            <label className="tw-font-medium">Table</label>
            <Controller
              name="tableName"
              control={control}
              render={({ field }) => {
                return (
                  <TableSelector
                    className="tw-mt-0"
                    connection={destination?.connection}
                    namespace={namespace}
                    tableName={field.value}
                    disabled={props.isUpdate}
                    setTableName={field.onChange}
                    noOptionsString="No Tables Available! (Choose a namespace)"
                    validated={true}
                  />
                );
              }}
            />
            {errors.tableName && <div className="tw-text-red-500 tw-mt-1">{errors.tableName.message}</div>}
          </div>
        </div>
      )}
    </>
  );
};
