import { useCallback, useEffect, useState } from "react";
import { Button } from "src/components/button/Button";
import { ColorPicker, Input } from "src/components/input/Input";
import { initialize, updateTheme } from "src/initialize";
import { sendRequest } from "src/rpc/ajax";
import { CreateLinkToken, CreateLinkTokenRequest } from "src/rpc/api";
import { CustomTheme } from "src/utils/theme";

export const Preview: React.FC = () => {
  const [endCustomerID, setEndCustomerID] = useState<string | undefined>(undefined);
  const [baseColor, setBaseColor] = useState<string | undefined>(undefined);
  const [hoverColor, setHoverColor] = useState<string | undefined>(undefined);
  const [textColor, setTextColor] = useState<string | undefined>(undefined);

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

  const { open } = useFabraConnect({
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
      <Input className="tw-mb-5 tw-w-72 tw-h-10" value={endCustomerID} setValue={setEndCustomerID} placeholder="Test End Customer ID" />
      <ColorPicker className="tw-w-72 tw-h-10" wrapperClass="tw-mb-5" value={baseColor} setValue={setBaseColor} placeholder="Base Color (optional)" />
      <ColorPicker className="tw-w-72 tw-h-10" wrapperClass="tw-mb-5" value={hoverColor} setValue={setHoverColor} placeholder="Hover Color (optional)" />
      <ColorPicker className="tw-w-72 tw-h-10" wrapperClass="tw-mb-5" value={textColor} setValue={setTextColor} placeholder="Text Color (optional)" />
      <Button className="tw-px-4 tw-h-10" onClick={() => endCustomerID && openPreview(endCustomerID)}>Open Fabra Connect</Button>
    </div>
  );
};

// Slightly customized version of ReactFabraConnect to use local Connect code in development
const useFabraConnect = (options?: { customTheme?: CustomTheme; containerID?: string; }): {
  open: (linkToken: string) => void;
  close: () => void;
} => {
  useEffect(() => {
    initialize(options);
  }, []);


  const open = useCallback((linkToken: string) => {
    if (window.fabra) {
      window.fabra.open(linkToken);
    }
  }, []);

  const close = useCallback(() => {
    if (window.fabra) {
      window.fabra.close();
    }
  }, []);

  return {
    open,
    close,
  };
};
