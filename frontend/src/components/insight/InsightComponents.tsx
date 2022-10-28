import { CheckIcon, LinkIcon } from "@heroicons/react/24/outline";
import { Button, MoreOptionsButton } from "src/components/button/Button";
import { SaveIcon } from "src/components/icons/Icons";
import { Loading } from "src/components/loading/Loading";
import { Tooltip } from "src/components/tooltip/Tooltip";

type HeaderProps = {
  copied: boolean;
  saving: boolean;
  showModal: () => void;
  save: () => void;
  copyLink: () => void;
};

export const ReportHeader: React.FC<HeaderProps> = props => {
  const { copied, saving, showModal, save, copyLink } = props;
  return (
    <div className="">
      <div className="tw-mb-3 tw-flex tw-flex-row">
        <div className='tw-font-semibold tw-text-2xl'>
          Report
        </div>
        <div className='tw-flex tw-ml-auto'>
          <MoreOptionsButton className='tw-flex tw-justify-center tw-align-middle tw-ml-3' showModal={showModal} />
          <div className="tw-inline-block tw-mx-4 tw-my-2 tw-w-[1px] tw-bg-gray-400"></div>
          <Button className="tw-border-gray-400 tw-flex tw-justify-center tw-items-center tw-mr-2 tw-w-[34px] tw-h-8 tw-px-0 tw-py-0 tw-bg-white tw-text-gray-800 hover:tw-bg-gray-200" onClick={copyLink}>
            {copied ? <CheckIcon className='tw-h-5 tw-inline tw-mx-auto tw-stroke-2' /> : <LinkIcon className='tw-h-5 tw-inline tw-mx-auto tw-stroke-2' />}
          </Button>
          <Tooltip label="⌘ + S">
            <Button className="tw-flex tw-justify-center tw-align-middle tw-ml-1 tw-w-24 tw-h-8 tw-bg-white tw-border-gray-400 tw-text-gray-800 hover:tw-bg-gray-200" onClick={save}>
              {saving ? <Loading /> : <><SaveIcon className='tw-h-5 tw-inline tw-mr-1' />Save</>}
            </Button>
          </Tooltip>
        </div>
      </div>
      <div>
        Description
      </div>
    </div>
  );
};