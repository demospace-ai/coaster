import { NavButton } from "src/components/button/Button";

export const Settings: React.FC = () => {
  return (
    <div className='tw-flex tw-flex-row tw-h-full'>
      <div className='tw-m-[160px_auto_auto] tw-shadow-centered tw-bg-white tw-w-[400px] tw-pt-8 tw-pb-10 tw-px-8 tw-rounded-lg'>
        <div className="tw-w-full tw-text-center tw-mb-5 tw-font-bold tw-text-lg">Settings</div>
        <NavButton className='tw-mb-5' to='/newconnection'>
          New Data Warehouse
        </NavButton>
        <NavButton to='/neweventdataset'>
          New Event Dataset
        </NavButton>
      </div>
    </div >
  );
};
