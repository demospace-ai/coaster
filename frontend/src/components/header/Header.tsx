import { Menu, Transition } from "@headlessui/react";
import { ArrowRightOnRectangleIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import React, { Fragment } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Loading } from "src/components/loading/Loading";
import { useLogout } from "src/pages/login/actions";
import { useSelector } from "src/root/model";
import { useDestination, useSync } from "src/rpc/data";
import { toTitleCase } from "src/utils/string";

export const Header: React.FC = () => {
  const location = useLocation();
  const isAuthenticated = useSelector(state => state.login.authenticated);
  const organization = useSelector(state => state.login.organization);

  // No header whatsoever for login and home page
  if (!isAuthenticated || !organization) {
    return <></>;
  };

  return (
    <>
      <div className="tw-flex tw-box-border tw-min-h-[64px] tw-h-16 tw-px-10 tw-py-3 tw-items-center tw-border-b tw-border-solid tw-border-slate-200 tw-bg-white">
        <Breadcrumbs pathname={location.pathname} />
        <ProfileDropdown />
      </div>
    </>
  );
};

type Breadcrumb = {
  path: string;
  title: string | undefined;
};

// Gluten free
const Breadcrumbs: React.FC<{ pathname: string; }> = props => {
  const pathTokens = props.pathname.split("/");
  switch (pathTokens[1]) {
    case "apikey":
      return <PageBreadcrumbs title={"API Keys"} pathname={props.pathname} />;
    case "sync":
      return <SyncBreadcrumbs id={pathTokens[2]} pathname={props.pathname} />;
    case "destination":
      return <DestinationBreadcrumbs id={pathTokens[2]} pathname={props.pathname} />;
    default:
      return <PageBreadcrumbs title={toTitleCase(pathTokens[1])} pathname={props.pathname} />;
  }
};

const SyncBreadcrumbs: React.FC<{ id: string, pathname: string; }> = props => {
  const { sync } = useSync(Number(props.id)); // This is deduped by SWR so don"t worry about the extra fetch
  const title = sync?.sync.display_name;
  const crumbs: Breadcrumb[] = [{ title: "Syncs", path: "/syncs" }, { title, path: props.pathname }];
  document.title = title + " | Fabra";

  return <BreadcrumbsLayout crumbs={crumbs} />;
};

const DestinationBreadcrumbs: React.FC<{ id: string, pathname: string; }> = props => {
  const { destination } = useDestination(Number(props.id)); // This is deduped by SWR so don"t worry about the extra fetch
  const title = destination?.display_name;
  const crumbs: Breadcrumb[] = [{ title: "Destinations", path: "/destinations" }, { title, path: props.pathname }];
  document.title = title + " | Fabra";

  return <BreadcrumbsLayout crumbs={crumbs} />;
};


const PageBreadcrumbs: React.FC<{ title?: string, pathname: string; }> = props => {
  let crumbs: Breadcrumb[] = [];
  if (props.title) {
    crumbs.push({ title: props.title, path: props.pathname });
    document.title = props.title + " | Fabra";
  } else {
    document.title = "Fabra";
  }

  return <BreadcrumbsLayout crumbs={crumbs} />;
};
const BreadcrumbsLayout: React.FC<{ crumbs: Breadcrumb[]; }> = props => {
  return (
    <div className="tw-flex tw-flex-row tw-items-center">
      <NavLink className="tw-text-sm tw-font-medium tw-select-none tw-text-slate-900 hover:tw-text-slate-600" to="/">Home</NavLink>
      {props.crumbs.map((crumb, index) => (
        <div key={index} className="tw-flex tw-flex-row tw-items-center">
          <ChevronRightIcon className="tw-h-3 tw-mx-3" />
          <NavLink className="tw-text-sm tw-font-medium tw-select-none tw-text-slate-900 tw-truncate hover:tw-text-slate-600" to={crumb.path}>{crumb.title ? crumb.title : <Loading className="tw-h-4 tw-w-4" />}</NavLink>
        </div>
      ))}
    </div>
  );
};

const ProfileDropdown: React.FC = () => {
  const user = useSelector(state => state.login.user);
  const logout = useLogout();
  const menuItem = "tw-flex tw-items-center tw-py-2 tw-pl-2 tw-text-sm tw-cursor-pointer tw-select-none tw-rounded";

  return (
    <div className="tw-flex tw-flex-col tw-justify-center tw-ml-auto">
      <Menu as="div">
        <Menu.Button className="tw-bg-orange-400 tw-text-white tw-rounded-full tw-w-7 tw-h-7 tw-cursor-pointer tw-select-none">
          {user!.first_name.charAt(0)}
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="tw-transition tw-ease-out tw-duration-100"
          enterFrom="tw-transform tw-opacity-0 tw-scale-95"
          enterTo="tw-transform tw-opacity-100 tw-scale-100"
          leave="tw-transition tw-ease-in tw-duration-75"
          leaveFrom="tw-transform tw-opacity-100 tw-scale-97"
          leaveTo="tw-transform tw-opacity-0 tw-scale-95"
        >
          <Menu.Items className="tw-absolute tw-origin-top-right tw-z-10 tw-divide-y tw-right-5 tw-mt-2 tw-mr-2 tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-slate-900 tw-ring-opacity-5 focus:tw-outline-none tw-w-56">
            <div className="tw-m-2">
              <p className="tw-px-1 tw-pt-2 tw-pb-1 tw-text-xs tw-uppercase">Signed in as</p>
              <Menu.Item>
                {({ active }) => (
                  <div
                    className={classNames(
                      active ? "tw-bg-slate-200 tw-text-slate-900" : "tw-text-slate-700",
                      menuItem,
                      "tw-pl-2"
                    )}
                  >
                    <div className="tw-bg-slate-400 tw-text-white tw-rounded-full tw-w-7 tw-h-7 tw-select-none tw-flex tw-items-center tw-justify-center tw-mr-3">
                      {user!.first_name.charAt(0)}
                    </div>
                    <div className="tw-flex tw-flex-col">
                      <p className="tw-truncate tw-text-sm tw-font-semibold tw-text-slate-900">{user?.first_name} {user?.last_name}</p>
                      <p className="tw-truncate tw-text-sm tw-font-medium tw-text-slate-900">{user?.email}</p>
                    </div>
                  </div>
                )}
              </Menu.Item>
            </div>
            <div className="tw-m-2 tw-pt-2">
              <Menu.Item>
                {({ active }) => (
                  <div
                    className={classNames(
                      active ? "tw-bg-slate-200 tw-text-slate-900" : "tw-text-slate-700",
                      menuItem
                    )}
                    onClick={logout}
                  >
                    <ArrowRightOnRectangleIcon className="tw-h-4 tw-inline tw-mr-2 tw-stroke-2" />
                    Logout
                  </div>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};
