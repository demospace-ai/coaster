import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BackButton } from "src/components/button/Button";
import { DestinationSetup } from "src/pages/objects/NewObject/DestinationSetupStep";
import { ExistingObjectFields } from "src/pages/objects/NewObject/ExistingObjectFieldsStep";
import { Finalize } from "src/pages/objects/NewObject/FinalizeStep";
import { NewObjectFields } from "src/pages/objects/NewObject/NewObjectFieldsStep";
import { useForm } from "react-hook-form";
import {
  INITIAL_OBJECT_STATE,
  NewObjectState,
  Step,
  initalizeFromExisting,
  initializeFromDestination,
} from "src/pages/objects/helpers";
import { Destination, FabraObject, Field, FieldType, TargetType, shouldCreateFields } from "src/rpc/api";
import { useSchema } from "src/rpc/data";

export type NewObjectProps = {
  existingObject?: FabraObject;
  existingDestination?: Destination;
  onComplete?: () => void;
};

export const NewObject: React.FC<NewObjectProps> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const maybeDestination = location.state?.destination as Destination | undefined;
  const [state, setState] = useState<NewObjectState>(
    props.existingObject && props.existingDestination
      ? initalizeFromExisting(props.existingObject, props.existingDestination)
      : maybeDestination
      ? initializeFromDestination(maybeDestination)
      : INITIAL_OBJECT_STATE,
  );

  const { schema } = useSchema(
    state.destinationSetupData.destination?.connection.id,
    state.destinationSetupData.namespace,
    state.destinationSetupData.tableName,
  );
  const onComplete = props.onComplete
    ? props.onComplete
    : () => {
        navigate("/objects");
      };

  useEffect(() => {
    // No need to initialize object fields from the schema if we're updating an existing object
    if (props.existingObject) {
      return;
    }

    if (schema) {
      const objectFields = schema.map((field) => {
        // automatically omit end customer ID field
        return {
          name: field.name,
          type: field.type,
          omit: false,
          optional: false,
        };
      });
      setState((state) => {
        return {
          ...state,
          objectFields: objectFields,
        };
      });
    }
  }, [schema, props.existingObject]);

  let content: React.ReactElement;
  let back: () => void;
  switch (state.step) {
    case Step.Initial:
      content = (
        <DestinationSetup
          isUpdate={!!props.existingObject}
          initialFormState={state.destinationSetupData}
          handleNextStep={(values) => {
            let maybeEndCustomerIdDummy: { endCustomerIdField?: Field } = {};
            if (values.targetType === TargetType.Webhook) {
              maybeEndCustomerIdDummy = {
                endCustomerIdField: { name: "dummy-end-customer-id", type: FieldType.Integer },
              };
            }
            if (shouldCreateFields(values.destination.connection.connection_type, values.targetType!)) {
              setState({
                ...state,
                ...maybeEndCustomerIdDummy,
                destinationSetupData: {
                  ...state.destinationSetupData,
                  ...values,
                },
                step: Step.CreateFields,
              });
            } else {
              setState({
                ...state,
                ...maybeEndCustomerIdDummy,
                destinationSetupData: {
                  ...state.destinationSetupData,
                  ...values,
                },
                step: Step.ExistingFields,
              });
            }
          }}
        />
      );
      // TODO: prompt if they want to exit here
      back = onComplete;
      break;
    case Step.ExistingFields:
      content = <ExistingObjectFields isUpdate={!!props.existingObject} state={state} setState={setState} />;
      back = () =>
        setState({
          ...state,
          step: Step.Initial,
          fieldsError: undefined,
          cursorFieldError: undefined,
        });
      break;
    case Step.CreateFields:
      content = <NewObjectFields isUpdate={!!props.existingObject} state={state} setState={setState} />;
      back = () =>
        setState({
          ...state,
          step: Step.Initial,
          fieldsError: undefined,
          cursorFieldError: undefined,
        });
      break;
    case Step.Finalize:
      content = (
        <Finalize
          isUpdate={!!props.existingObject}
          existingObject={props.existingObject}
          state={state}
          setState={setState}
          onComplete={() => {
            props.onComplete ? props.onComplete() : onComplete();
          }}
        />
      );
      let prevStep: Step;
      if (
        shouldCreateFields(
          state.destinationSetupData.destination!.connection.connection_type,
          state.destinationSetupData.targetType!,
        )
      ) {
        prevStep = Step.CreateFields;
      } else {
        prevStep = Step.ExistingFields;
      }

      back = () =>
        setState({
          ...state,
          step: prevStep,
          fieldsError: undefined,
          cursorFieldError: undefined,
        });
      break;
  }

  return (
    <div className="tw-flex tw-flex-col tw-mb-10">
      <BackButton onClick={back} />
      <div className="tw-flex tw-flex-col tw-w-[900px] tw-mt-8 tw-mb-24 tw-py-12 tw-px-10 tw-mx-auto tw-bg-white tw-rounded-lg tw-shadow-md tw-items-center">
        {content}
        {state.fieldsError && (
          <div className="tw-mt-4 tw-text-red-700 tw-py-2 tw-px-10 tw-bg-red-50 tw-border tw-border-red-600 tw-rounded">
            {state.fieldsError}
          </div>
        )}
        {state.cursorFieldError && (
          <div className="tw-mt-4 tw-text-red-700 tw-py-2 tw-px-10 tw-bg-red-50 tw-border tw-border-red-600 tw-rounded">
            {state.cursorFieldError}
          </div>
        )}
        {state.frequencyError && (
          <div className="tw-mt-4 tw-text-red-700 tw-py-2 tw-px-10 tw-bg-red-50 tw-border tw-border-red-600 tw-rounded">
            {state.frequencyError}
          </div>
        )}
        {state.createError && (
          <div className="tw-mt-4 tw-text-red-700 tw-py-2 tw-px-10 tw-bg-red-50 tw-border tw-border-red-600 tw-rounded">
            {state.createError}
          </div>
        )}
      </div>
    </div>
  );
};
