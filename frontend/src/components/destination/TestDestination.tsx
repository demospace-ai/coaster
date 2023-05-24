import { InfoIcon } from "src/components/icons/Icons";
import { ValidatedInput } from "src/components/input/Input";
import { Tooltip } from "src/components/tooltip/Tooltip";

const TestDestinationInputs: React.FC = ({ state, setState }) => {
  return (
    <>
      <ValidatedInput
        id="displayName"
        value={state.displayName}
        setValue={(value) => {
          setState({ ...state, displayName: value });
        }}
        placeholder="Display Name"
        className="tw-w-100"
      />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Username</span>
        <Tooltip
          placement="right"
          label="You can choose your personal username or create a dedicated user for syncing."
        >
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
    </>
  );
};
