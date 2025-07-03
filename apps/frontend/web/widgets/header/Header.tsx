import { Link, useRouter } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/shared/ui';
import { Input } from '@/shared/ui/Input';

const noHeaderPaths = ['/login'];

const Header = () => {
  const [search, setSearch] = useState('');
  const [showHeader, setShowHeader] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const updateHeaderVisibility = () => {
      const currentPath = router.state.location.pathname;
      setShowHeader(!noHeaderPaths.includes(currentPath));
    };

    updateHeaderVisibility();

    const unsubscribe = router.subscribe('onBeforeNavigate', () =>
      updateHeaderVisibility()
    );

    return () => unsubscribe();
  }, [router]);

  if (!showHeader) {
    return null;
  }

  return (
    <header className="flex w-full items-center justify-between p-[10px] bg-white shadow-sm">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => router.navigate({ to: '/dashboard' })}
      >
        <img src="/1PD_Logo.png" alt="Logo" width={52} height={52} />
        <h1 className="text-xl font-bold text-gray-700">1PD</h1>
      </div>

      <div className="flex items-center flex-1 mx-8 max-w-lg">
        <div className="relative w-full">
          <Input
            type="text"
            startIcon={
              <Search className="text-gray-400" width={16} height={16} />
            }
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-[30px]">
        <div className="flex items-center gap-[10px]">
          <div className="rounded-full flex items-center justify-center w-[40px] h-[40px] bg-header-light-grey">
            <img
              src="/icons/x-ring.png"
              alt="User Profile"
              width={24}
              height={24}
            />
          </div>
          <div className="rounded-full flex items-center justify-center w-[40px] h-[40px] bg-header-light-grey relative">
            <img
              src="/icons/notifications.png"
              alt="User Chat"
              width={24}
              height={24}
            />
            <span className="absolute top-0 right-0 h-4 w-4 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
              1
            </span>
          </div>
          <div className="rounded-full flex items-center justify-center w-[40px] h-[40px] bg-header-light-grey relative">
            <img
              src="/icons/bell.png"
              alt="User Notifications"
              width={24}
              height={24}
            />
            <span className="absolute top-0 right-0 h-2 w-2 bg-pink-500 rounded-full"></span>
          </div>
        </div>
        <div className="flex items-center gap-[10px]">
          <div className="flex items-center gap-2">
            <img
              src="./logo.svg"
              /*src={user?.picture}*/
              alt="User Profile"
              className="h-8 w-8 rounded-full object-cover"
            />
            <Button
              menuItemsClassName="-left-[45px]"
              menuItems={
                <div className="flex flex-col items-start rounded">
                  <div className="flex items-center w-full gap-1 p-[10px] hover:bg-header-light-blue">
                    <Link
                      to="/account"
                      className="flex items-center w-full gap-1"
                    >
                      <img
                        src="/icons/user-cog.png"
                        alt="Account"
                        className="h-4 w-4"
                      />
                      My Account
                    </Link>
                  </div>
                  <div className="flex items-center w-full gap-1 p-[10px] hover:bg-header-light-blue">
                    <Link
                      to="/secutiry"
                      className="flex items-center w-full gap-1"
                    >
                      <img
                        src="/icons/key-black.png"
                        alt="Key Icon"
                        className="h-4 w-4"
                      />
                      Security
                    </Link>
                  </div>
                  <div className="flex items-center w-full gap-1 p-[10px] hover:bg-header-light-blue">
                    <Link
                      to="/login"
                      className="flex items-center w-full gap-1"
                    >
                      <img
                        src="/icons/sign-out-alt.png"
                        alt="My Account"
                        className="h-4 w-4"
                      />
                      Logout
                    </Link>
                  </div>
                </div>
              }
              endIcon={
                <img
                  src="/icons/caret-down.png"
                  alt="Caret down"
                  width={16}
                  height={16}
                />
              }
            >
              Saul Pardi
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
