import { Link, useRouter } from '@tanstack/react-router';

import { Separator } from '@/shared/ui/Separator';
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/ui/Sidebar';

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', isSub: false },
  { label: 'Matters', path: '/matters', isSub: false },
  { label: 'Risks', path: '/risks', isSub: true },
  { label: 'Actions', path: '/actions', isSub: true },
  { label: 'Types', path: '/types', isSub: false },
  { label: 'Contracts', path: '/contracts', isSub: true },
  { label: 'Dispute Resolution', path: '/disputes', isSub: true },
  { label: 'Settings', path: '/settings', isSub: false },
];

const AppSidebar = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  return (
    <div className="flex w-full h-screen">
      <Sidebar
        className={`text-sidebar-light transition-all duration-300 ease-in-out w-[240px]`}
        collapsible="icon"
      >
        <div className="flex flex-col size-full max-w-[240px] bg-teal-900 text-white">
          <div className="flex items-center p-4">
            <h1 className="text-xl font-bold tracking-tight">
              COUNSEL<span className="font-normal">FLOW</span>
            </h1>
          </div>
          <Separator orientation="horizontal" />
          <SidebarMenu className="mt-4 gap-[14px] max-w-[240px]">
            {menuItems.map((item) => {
              const linkPath = `${item.path}`;
              return (
                <SidebarMenuItem key={item.label}>
                  <Link
                    to={linkPath}
                    className="flex items-center justify-center"
                  >
                    <SidebarMenuButton
                      tooltip={item.label}
                      className={`flex items-center gap-4 px-4 py-4 hover:bg-teal-900 ${item.isSub && 'pl-10'}`}
                    >
                      {item.label}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </div>
      </Sidebar>
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-end">
          <h1 className="text-xl font-bold py-4 pr-10 uppercase">
            {
              menuItems.find(
                (item) => item.path === router.state.location.pathname
              )?.label
            }
          </h1>
        </div>
        <Separator orientation="horizontal" />
        {children}
      </div>
    </div>
  );
};

export default AppSidebar;
