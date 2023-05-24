import { FormEvent, useEffect, useState } from "react";
import { Button } from "src/components/button/Button";
import { InfoIcon } from "src/components/icons/Icons";
import { ColorPicker, Input } from "src/components/input/Input";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { FabraConnectOptions, initialize, open, updateTheme } from "src/initialize-internal";
import { sendRequest } from "src/rpc/ajax";
import { CreateLinkToken, CreateLinkTokenRequest } from "src/rpc/api";
import { consumeError } from "../../utils/errors";
import { useMutation } from "../../utils/queryHelpers";
import { ErrorDisplay } from "../../components/error/Error";

export const Preview: React.FC = () => {
  const [endCustomerID, setEndCustomerID] = useState<string>("");
  const [baseColor, setBaseColor] = useState<string>("#475569");
  const [hoverColor, setHoverColor] = useState<string>("#1e293b");
  const [textColor, setTextColor] = useState<string>("#ffffff");
  const [validationErrors, setValidationErrors] = useState<{
    endCustomerID?: string;
    baseColor?: string;
    hoverColor?: string;
    textColor?: string;
  }>({});

  // Hack to update the colors of the active iFrame
  useEffect(() => {
    updateTheme({
      colors: {
        primary: {
          base: baseColor,
          hover: hoverColor,
          text: textColor,
        },
      },
    });
  }, [baseColor, hoverColor, textColor]);

  useFabraConnect({
    containerID: "fabra-container",
    customTheme: {
      colors: {
        primary: {
          base: baseColor,
          hover: hoverColor,
          text: textColor,
        },
      },
    },
  });

  const openPreviewMutation = useMutation(
    async () => {
      const payload: CreateLinkTokenRequest = {
        end_customer_id: endCustomerID,
      };
      // throw new Error("Failed to open preview.");
      const response = await sendRequest(CreateLinkToken, payload);
      return response.link_token;
    },
    {
      onSuccess: (link_token) => {
        open(link_token);
      },
    },
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!endCustomerID) {
      setValidationErrors({
        ...validationErrors,
        endCustomerID: "End Customer ID is required",
      });
      return;
    }

    const hasValidationErrors = Object.values(validationErrors).filter((v) => v).length > 0;
    if (hasValidationErrors) {
      return;
    }

    setValidationErrors({
      ...validationErrors,
      endCustomerID: undefined,
    });

    openPreviewMutation.mutate();
  };

  return (
    <div className="tw-py-5 tw-px-10 tw-flex tw-w-full tw-h-full">
      <div className="tw-w-1/4">
        <div className="tw-flex tw-w-full tw-mt-2 tw-mb-3">
          <div className="tw-flex tw-flex-col tw-justify-end tw-font-bold tw-text-lg">Preview Fabra Connect</div>
        </div>
        <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1 tw-font-medium">
          <span>Test End Customer ID</span>
          <Tooltip
            placement="right"
            label="This can be any string. If you use an actual ID for one of your users, you can see what that user will see."
          >
            <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
          </Tooltip>
        </div>
        <form onSubmit={handleSubmit}>
          <Input
            className="tw-h-10"
            wrapperClass="tw-mr-6"
            value={endCustomerID}
            setValue={setEndCustomerID}
            placeholder="Test End Customer ID"
          />
          {validationErrors.endCustomerID && <div className="tw-text-red-500">{validationErrors.endCustomerID}</div>}
          <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1 tw-font-medium">
            <span>Base Color</span>
          </div>
          <ColorPicker
            className="tw-h-10"
            value={baseColor}
            setValue={setBaseColor}
            placeholder="Base Color (optional)"
          />
          <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1 tw-font-medium">
            <span>Hover Color</span>
          </div>
          <ColorPicker
            className="tw-h-10"
            value={hoverColor}
            setValue={setHoverColor}
            placeholder="Hover Color (optional)"
          />
          <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1 tw-font-medium">
            <span>Text Color</span>
          </div>
          <ColorPicker
            className="tw-h-10"
            value={textColor}
            setValue={setTextColor}
            placeholder="Text Color (optional)"
          />
          <div>
            <Button className="tw-px-4 tw-h-10 tw-mt-6" type="submit">
              Open Fabra Connect
            </Button>
            <ErrorDisplay error={openPreviewMutation.error} className="tw-text-red-500" />
          </div>
        </form>
      </div>
      <div
        id="fabra-container"
        className="tw-w-full tw-h-full tw-border tw-border-slate-200 tw-rounded-md tw-overflow-clip"
      />
    </div>
  );
};

// Slightly customized version of ReactFabraConnect to use local Connect code in development
const useFabraConnect = (options?: FabraConnectOptions) => {
  useEffect(() => {
    initialize(options);
  }, []);
};
