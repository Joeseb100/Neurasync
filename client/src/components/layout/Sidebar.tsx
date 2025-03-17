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
    <aside className="fixed inset-y-0 left-0 glass glass-highlight shadow-xl w-20 md:w-64 flex flex-col z-10 bg-opacity-80"> {/* Added flex flex-col for better layout */}
      <div className="p-4 flex items-center justify-center md:justify-start">
        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
          <span className="text-white text-xl font-bold">N</span>
        </div>
        <h1 className="hidden md:block text-2xl font-bold ml-3 text-foreground">Neurasync</h1>
      </div>

      <nav className="flex-1 pt-8">
        <ul>
          {navItems.map((item) => {
            const isActive = location === item.url;
            return (
              <li className="mb-2" key={item.url}>
                {/* Fix for nested a tags - use div instead */}
                <Link href={item.url}>
                  <div className={`flex items-center py-3 px-4 relative cursor-pointer ${
                    isActive 
                      ? "text-primary bg-primary bg-opacity-10" 
                      : "text-foreground hover:text-primary hover:bg-primary hover:bg-opacity-5"
                  } transition-all duration-300`}>
                    <i className={`${item.icon} text-xl md:text-lg`}></i>
                    <span className="hidden md:block ml-4">{item.label}</span>
                    {isActive && (
                      <div className="h-full absolute left-0 w-1 bg-primary rounded-r-md"></div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border border-opacity-40">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 ring-2 ring-primary ring-opacity-30">
            <AvatarImage src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/220px-Albert_Einstein_Head.jpg" alt="Jophit" /> {/* Einstein's image */}
            <AvatarFallback className="bg-secondary text-secondary-foreground">J</AvatarFallback> {/* J for Jophit */}
          </Avatar>
          <div className="hidden md:block ml-3">
            <p className="text-sm font-medium text-foreground">{isLoading ? 'Loading...' : 'Jophit'}</p> {/* Changed name to Jophit */}
            <p className="text-xs text-muted-foreground">{isLoading ? '' : "jophits@gmail.com"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}