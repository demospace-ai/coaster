import { useEffect, useState } from "react";
import { Button } from "src/components/button/Button";
import { InfoIcon } from "src/components/icons/Icons";
import { ColorPicker, Input } from "src/components/input/Input";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { initialize, open, updateTheme } from "src/initialize-internal";
import { sendRequest } from "src/rpc/ajax";
import { CreateLinkToken, CreateLinkTokenRequest } from "src/rpc/api";
import { CustomTheme } from "src/utils/theme";

export const Preview: React.FC = () => {
  const [endCustomerID, setEndCustomerID] = useState<string>("");
  const [baseColor, setBaseColor] = useState<string>("#475569");
  const [hoverColor, setHoverColor] = useState<string>("#1e293b");
  const [textColor, setTextColor] = useState<string>("#ffffff");

  // Hack to update the colors of the active iFrame
  useEffect(() => {
    updateTheme({
      colors: {
        primary: {
          base: baseColor,
          hover: hoverColor,
          text: textColor,
        }
      }
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
        }
      }
    }
  });

  const openPreview = async (endCustomerID: string) => {
    const payload: CreateLinkTokenRequest = {
      end_customer_id: endCustomerID,
    };

    try {
      const response = await sendRequest(CreateLinkToken, payload);
      open(response.link_token);
    } catch (e) {
      // TODO
    }
  };

  return (
    <div className="tw-py-5 tw-px-10">
      <div className="tw-flex tw-w-full tw-mt-2 tw-mb-3">
        <div className="tw-flex tw-flex-col tw-justify-end tw-font-bold tw-text-lg">Preview Fabra Connect</div>
      </div>
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1 tw-font-medium">
        <span>Test End Customer ID</span>
        <Tooltip placement="right" label="This can be any string. If you use an actual ID for one of your users, you can see what that user will see.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <Input className="tw-w-72 tw-h-10" value={endCustomerID} setValue={setEndCustomerID} placeholder="Test End Customer ID" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1 tw-font-medium">
        <span>Base Color</span>
      </div>
      <ColorPicker className="tw-w-72 tw-h-10" value={baseColor} setValue={setBaseColor} placeholder="Base Color (optional)" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1 tw-font-medium">
        <span>Hover Color</span>
      </div>
      <ColorPicker className="tw-w-72 tw-h-10" value={hoverColor} setValue={setHoverColor} placeholder="Hover Color (optional)" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1 tw-font-medium">
        <span>Text Color</span>
      </div>
      <ColorPicker className="tw-w-72 tw-h-10" value={textColor} setValue={setTextColor} placeholder="Text Color (optional)" />
      <Button className="tw-px-4 tw-h-10 tw-mt-6" onClick={() => endCustomerID && openPreview(endCustomerID)}>Open Fabra Connect</Button>
    </div>
  );
};

// Slightly customized version of ReactFabraConnect to use local Connect code in development
const useFabraConnect = (options?: { customTheme?: CustomTheme; containerID?: string; }) => {
  useEffect(() => {
    initialize(options);
  }, []);
};
