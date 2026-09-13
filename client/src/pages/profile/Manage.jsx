import { ArrowLeft } from "lucide-react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";

export default function Manage() {
  const location = useLocation();
  const navigate = useNavigate();

  const manageItems = [
    {
      id: "personal",
      label: "Personal Information",
    },
    {
      id: "security",
      label: "Email & Password",
    },
    {
      id: "social",
      label: "Social Accounts",
    },
  ];

  const managePath = "/home/settings/manage/";
  const routeTab = location.pathname.startsWith(managePath)
    ? location.pathname.slice(managePath.length).split("/")[0]
    : "";
  const selectedTab = manageItems.some((item) => item.id === routeTab)
    ? routeTab
    : "";

  return (
    <div className="text-white overflow-hidden">
      {!selectedTab && (
        <>
          <header className="flex gap-2 items-center mb-4">
            <Link to='/home/settings'>
              <ArrowLeft className="lg:hidden"></ArrowLeft>
            </Link>
            <h1 className=" text-2xl font-bold flex items-center gap-2">
              Manage My Account
            </h1>
          </header>

          <div className="grid w-full gap-3">
            {manageItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  navigate(`/home/settings/manage/${item.id}`);
                }}
                className="
                  w-[400px]
                  rounded-lg
                  border
                  border-slate-700
                  bg-slate-900
                  p-4
                  text-left
                  hover:bg-slate-800
                  transition
                "
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}

      {selectedTab && (
        <>
          <div 
            className="
              mb-6 flex items-center gap-2 
              text-white text-2xl font-semibold">
            <ArrowLeft
              className={`cursor-pointer`}
              onClick={() => navigate("/home/settings/manage")}
              size={20}
            />
            <p className="">
              {manageItems.find((item) => item.id === selectedTab)?.label}
            </p>
          </div>
          <Outlet />
        </>
      )}
    </div>
  );
}