import { Checkbox } from "@radix-ui/react-checkbox";
import { z } from "zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Button } from "src/components/button/Button";
import { Input } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { ObjectStepProps } from "src/pages/objects/NewObject/state";
import { validateFields, Step } from "src/pages/objects/helpers";
import { ObjectField, ObjectFieldInput, ObjectFieldSchema } from "src/rpc/api";
import { mergeClasses } from "src/utils/twmerge";
import { zodResolver } from "@hookform/resolvers/zod";

const FormSchema = z.object({
  objectFields: z.array(ObjectFieldSchema),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface ExistingObjectFieldsProps {
  isUpdate?: boolean;
  onComplete: (values: FormSchemaType) => void;
}

export const ExistingObjectFields: React.FC<ExistingObjectFieldsProps> = ({ isUpdate, onComplete }) => {
  // const { state, setState } = props;
  const { control, handleSubmit } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      objectFields: [
        { name: "", description: "", omit: false, optional: false },
        { name: "", description: "", omit: false, optional: false },
        { name: "", description: "", omit: false, optional: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "objectFields",
    control,
  });

  const onSubmit = handleSubmit((values) => {
    onComplete(values);
  });
  // const updateObjectField = (newObject: ObjectFieldInput, index: number) => {
  //   if (!state.objectFields) {
  //     // TODO: should not happen
  //     return;
  //   }

  //   setState({
  //     ...state,
  //     objectFields: state.objectFields.map((original, i) => {
  //       if (i === index) {
  //         return newObject;
  //       } else {
  //         return original;
  //       }
  //     }),
  //   });
  // };

  // const advance = () => {
  //   if (validateFields(state, setState)) {
  //     setState((state) => {
  //       return { ...state, step: Step.Finalize };
  //     });
  //   }
  // };

  return (
    <form className="tw-h-full tw-w-full tw-text-center" onSubmit={onSubmit}>
      <div className="tw-w-full tw-text-center tw-mb-2 tw-font-bold tw-text-lg">
        {isUpdate ? "Update Object Fields" : "Object Fields"}
      </div>
      <div className="tw-text-center tw-mb-3">Provide customer-facing names and descriptions for each field.</div>
      <ul className="tw-w-full tw-px-24">
        {fields.map((objectField, i) => {
          return (
            <li key={objectField.id}>
              <div className={mergeClasses("tw-mt-5 tw-mb-7 tw-text-left")}>
                <span className="tw-text-base tw-font-semibold">{objectField.name}</span>
                <div className="tw-flex tw-items-center tw-mt-2 tw-pb-1.5">
                  <span className="">Omit?</span>
                  <Controller
                    name={`objectFields.${i}.omit`}
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        className="tw-ml-2 tw-h-4 tw-w-4 tw-"
                        checked={Boolean(objectField.omit)}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          // updateObjectField({ ...objectField, omit: value }, i);
                        }}
                        disabled={isUpdate}
                      />
                    )}
                  />
                  <span className="tw-ml-4">Optional?</span>
                  <Controller
                    name={`objectFields.${i}.optional`}
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        className="tw-ml-2 tw-h-4 tw-w-4"
                        checked={Boolean(objectField.optional)}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          // updateObjectField({ ...objectField, optional: value }, i);
                        }}
                        disabled={isUpdate}
                      />
                    )}
                  />
                </div>
                <div className="tw-mt-2">
                  <Controller
                    name={`objectFields.${i}.name`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input type="text" {...field} placeholder="Name" className="tw-w-full tw-py-2 tw-px-3" />
                    )}
                  />
                </div>
                <div className="tw-mt-2">
                  <Controller
                    name={`objectFields.${i}.description`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        placeholder="Description"
                        className="tw-w-full tw-py-2 tw-px-3 tw-h-20 tw-resize-none"
                      />
                    )}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <Button type="submit" className="tw-mt-6 tw-w-100 tw-h-10">
        Continue
      </Button>
    </form>
  );
};
