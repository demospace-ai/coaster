import { NavLink, useNavigate } from "react-router-dom";

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="tw-z-10 tw-flex tw-box-border tw-max-h-[40px] tw-min-h-[40px] sm:tw-max-h-[40px] sm:tw-min-h-[40px] tw-w-full tw-px-5 xs:tw-px-8 sm:tw-px-20 tw-py-6 tw-items-center tw-justify-between tw-border-t tw-border-solid tw-border-slate-200 tw-mt-auto tw-bg-white">
      <span className="tw-select-none">© 2023 Coaster, Inc.</span>
      <div className="tw-flex tw-gap-5">
        <NavLink to="/terms">Terms</NavLink>
        <NavLink to="/privacy">Privacy Policy</NavLink>
      </div>
    </div>
  );
};
