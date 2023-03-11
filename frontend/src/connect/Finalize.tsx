import React from "react";
import { InfoIcon, LongRightArrow } from "src/components/icons/Icons";
import rocket from "src/components/images/rocket.svg";
import {
	ValidatedDropdownInput,
	ValidatedInput,
} from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { LinkColumnSelector } from "src/components/selector/Selector";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { FieldMappingState, SetupSyncProps } from "src/connect/state";
import { ColumnSchema, FrequencyUnits, ObjectField } from "src/rpc/api";
import { useObject } from "src/rpc/data";

export const FinalizeSync: React.FC<SetupSyncProps> = (props) => {
	// const { object } = useObject(props.state.object?.id, props.linkToken);
	const object = {
		id: 12345,
		display_name: "An object",
		destination_id: 12345,
		namespace: "namespace",
		table_name: "table",
		custom_join: "custom join",
		object_fields: [
			{
				id: 1,
				name: "object field 1",
				type: "field",
				omit: false,
				optional: false,
				display_name: "field 1",
				description: "this is field 1",
			},
			{
				id: 2,
				name: "object field 2",
				type: "field",
				omit: false,
				optional: true,
				display_name: "field 2",
				description: "this is field 2",
			},
			{
				id: 3,
				name: "object field 3",
				type: "field",
				omit: true,
				optional: true,
				display_name: "field 3",
				description: "this is field 3",
			},
		],
	};

	// if (!object || !props.state.fieldMappings) {
	// 	return <Loading />;
	// }

	const updateFieldMapping = (
		newFieldMapping: FieldMappingState,
		index: number
	) => {
		if (!props.state.fieldMappings) {
			// TODO: should not happen
			return;
		}

		props.setState({
			...props.state,
			fieldMappings: props.state.fieldMappings.map((original, i) => {
				if (i === index) {
					return newFieldMapping;
				} else {
					return original;
				}
			}),
		});
	};

	if (props.state.syncCreated) {
		return (
			<div className="tw-flex tw-flex-col tw-items-center tw-mt-6">
				<span className=" tw-text-2xl tw-font-semibold tw-text-slate-800">
					Sync Created!
				</span>
				<span className="tw-mb-6 tw-mt-2 tw-text-base tw-text-slate-500">
					Your data should start syncing over shortly.
				</span>
				<img className="tw-h-56" src={rocket} alt="rocket success" />
			</div>
		);
	}

	return (
		<div className="tw-w-full tw-px-28 tw-flex tw-flex-col">
			<div className="tw-text-left tw-mb-5 tw-text-2xl tw-font-bold tw-text-slate-900">
				Finalize your sync configuration
			</div>
			<div className="tw-w-[100%] tw-min-w-[400px] tw-h-full">
				<div className="tw-text-base tw-font-medium tw-mb-1 tw-text-slate-800">
					Display Name
				</div>
				<div className="tw-text-slate-600 tw-mb-4">
					Choose a name to help you identify this sync in the future.
				</div>
				<ValidatedInput
					id="display_name"
					className="tw-w-96"
					value={props.state.displayName}
					setValue={(value) =>
						props.setState({ ...props.state, displayName: value })
					}
					placeholder="Display Name"
				/>
				<div className="tw-text-base tw-font-medium tw-mt-9 tw-mb-1 tw-text-slate-800">
					Columns Mapping
				</div>
				<div className="tw-text-slate-600">
					This is how your data will be populated to the fields in the
					application.
				</div>
				<div className="tw-flex tw-flex-row tw-items-center tw-mt-6 tw-mb-3 tw-font-medium tw-text-sm">
					<div className="tw-w-[300px] tw-text-center">Your data</div>
					<div className="tw-w-80 tw-ml-auto tw-text-center tw-text-slate-600">
						Application Data
					</div>
				</div>
				{object.object_fields.map((objectField) => {
					let fieldMappingIdx = props.state.fieldMappings?.findIndex(
						(fieldMapping) =>
							fieldMapping.destination_field_id === objectField.id
					);
					const fieldMapping = props.state.fieldMappings![fieldMappingIdx!];
					return (
						!objectField.omit && (
							<div
								key={objectField.name}
								className="tw-flex tw-flex-row tw-items-center tw-mb-5"
							>
								<div>
									<LinkColumnSelector
										className="tw-mt-0 tw-w-80"
										column={fieldMapping?.source_column}
										setColumn={(value: ColumnSchema) => {
											updateFieldMapping(
												{ ...fieldMapping, source_column: value },
												fieldMappingIdx!
											);
										}}
										placeholder="Choose a column"
										noOptionsString="No Columns Available!"
										validated={true}
										source={props.state.source}
										namespace={props.state.namespace}
										tableName={props.state.tableName}
										linkToken={props.linkToken}
									/>
								</div>
								<LongRightArrow className="tw-fill-slate-600 tw-h-3 tw-ml-auto" />
								<MappedField objectField={objectField} />
							</div>
						)
					);
				})}
				<div className="tw-text-base tw-font-medium tw-mt-12 tw-mb-1 tw-text-slate-800">
					Additional Configuration
				</div>
				<div className="tw-text-slate-600">
					Configure additional settings for the sync.
				</div>
				<ValidatedInput
					id="frequency"
					className="tw-w-96"
					min={props.state.frequencyUnits === FrequencyUnits.Minutes ? 30 : 1}
					type="number"
					value={props.state.frequency}
					setValue={(value) =>
						props.setState({ ...props.state, frequency: value })
					}
					placeholder="Sync Frequency"
					label="Sync Frequency"
				/>
				<ValidatedDropdownInput
					className="tw-w-96"
					options={Object.values(FrequencyUnits)}
					selected={props.state.frequencyUnits}
					setSelected={(value) =>
						props.setState({ ...props.state, frequencyUnits: value })
					}
					loading={false}
					placeholder="Frequency Units"
					noOptionsString="nil"
					label="Frequency Unit"
					getElementForDisplay={(value) =>
						value.charAt(0).toUpperCase() + value.slice(1)
					}
				/>
				<div className="tw-pb-52"></div>
			</div>
		</div>
	);
};

const MappedField: React.FC<{ objectField: ObjectField }> = ({
	objectField,
}) => {
	return (
		<div className="tw-border tw-border-solid tw-border-slate-300 tw-rounded-md tw-py-2.5 tw-px-3 tw-fle tw-w-80 tw-box-border tw-bg-slate-100 tw-outline-none tw-ml-auto tw-flex tw-flex-row tw-items-center tw-text-slate-500 tw-select-none">
			<div>{objectField.display_name}</div>
			{objectField.description && (
				<Tooltip placement="top-end" label={objectField.description}>
					<InfoIcon className="tw-ml-auto tw-h-4 tw-fill-slate-400" />
				</Tooltip>
			)}
		</div>
	);
};
