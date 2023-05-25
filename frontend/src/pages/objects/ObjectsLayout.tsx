import { PlusCircleIcon } from "@heroicons/react/20/solid";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "src/components/button/Button";

export function ObjectsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="tw-h-full tw-p-8 tw-overflow-auto">
      <div className="tw-flex tw-w-full tw-mb-5 tw-mt-2">
        <div className="tw-flex tw-flex-col tw-justify-end tw-font-bold tw-text-lg">Objects</div>
        {location.pathname === "/objects" && (
          <Button
            className="tw-ml-auto tw-flex tw-justify-center tw-items-center"
            onClick={() => navigate("/objects/new")}
          >
            <div className="tw-flex tw-flex-col tw-justify-center tw-h-full">
              <PlusCircleIcon className="tw-h-4 tw-inline-block tw-mr-2" />
            </div>
            <div className="tw-flex tw-flex-col tw-justify-center tw-mr-0.5">Add Object</div>
          </Button>
        )}
      </div>
      <Outlet />
    </div>
  );
}
