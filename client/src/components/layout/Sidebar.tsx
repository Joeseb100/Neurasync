import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";

type NavItem = {
  label: string;
  icon: string;
  url: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", icon: "fas fa-chart-line", url: "/" },
  { label: "Analysis", icon: "fas fa-brain", url: "/analysis" },
  { label: "AI Therapy", icon: "fas fa-comments", url: "/therapy" },
  { label: "Music", icon: "fas fa-music", url: "/music" },
  { label: "Settings", icon: "fas fa-cog", url: "/settings" },
];

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: user, isLoading } = useQuery<User>({ 
    queryKey: ['/api/user/profile'],
  });

  return (
    <aside className="fixed inset-y-0 left-0 bg-white shadow-lg w-20 md:w-64 flex flex-col z-10">
      <div className="p-4 flex items-center justify-center md:justify-start">
        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-[#4ECDC4] flex items-center justify-center">
          <span className="text-white text-xl font-bold">N</span>
        </div>
        <h1 className="hidden md:block text-2xl font-bold ml-3 text-gray-800">Neurasync</h1>
      </div>
      
      <nav className="flex-1 pt-8">
        <ul>
          {navItems.map((item) => {
            const isActive = location === item.url;
            return (
              <li className="mb-2" key={item.url}>
                <Link href={item.url}>
                  <a className={`flex items-center py-3 px-4 relative ${
                    isActive ? "text-primary" : "text-gray-500 hover:text-primary"
                  } transition-colors`}>
                    <i className={`${item.icon} text-xl md:text-lg`}></i>
                    <span className="hidden md:block ml-4">{item.label}</span>
                    {isActive && (
                      <div className="h-full absolute left-0 w-1 bg-primary rounded-r-md"></div>
                    )}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4">
        <div className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImage} alt={user?.name || 'User'} />
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="hidden md:block ml-3">
            <p className="text-sm font-medium text-gray-800">{isLoading ? 'Loading...' : user?.name}</p>
            <p className="text-xs text-gray-500">{isLoading ? '' : user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
