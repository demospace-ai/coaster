import { PlusCircleIcon } from "@heroicons/react/20/solid";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AddObjectButton } from "src/components/ObjectsListTable/AddObjectsButton";
import { Button } from "src/components/button/Button";

export function ObjectsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="tw-h-full tw-py-5 tw-px-10 tw-overflow-auto">
      <div className="tw-flex tw-w-full tw-mb-5 tw-mt-2 tw-justify-between tw-items-center">
        <div className="tw-font-bold tw-text-lg">Objects</div>
        {location.pathname === "/objects" && <AddObjectButton onClick={() => navigate("/objects/new")} />}
      </div>
      <Outlet />
    </div>
  );
}
