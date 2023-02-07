import React from 'react';

export const Inbox: React.FC = () => {
  const setupStep = "tw-py-3 tw-px-4 tw-text-lg tw-font-medium tw-bg-white tw-border tw-border-gray-300 tw-rounded-lg tw-flex tw-items-center tw-mb-5 tw-cursor-pointer hover:tw-shadow-md";
  return (
    <div className="tw-h-full tw-py-8 tw-px-10">
      <div className='tw-text-2xl tw-font-bold tw-text-gray-700 tw-mb-5'>
        👋 Welcome to Fabra!
      </div>
      <div className="tw-py-8 tw-px-10 tw-bg-gray-50 tw-rounded-lg">
        <div className='tw-text-xl tw-font-bold tw-text-gray-700 tw-mb-5'>
          Setup Checklist
        </div>
        <div className={setupStep}>
          1. Connect your data warehouse as a destination
        </div>
        <div className={setupStep}>
          2. Define models that customers can send to you
        </div>
        <div className={setupStep}>
          3. Add the Fabra Connect frontend component to your application
        </div>
        <div className={setupStep}>
          4. (Optional) Setup Slack or email notifications for any issues
        </div>
      </div>
    </div>
  );
};