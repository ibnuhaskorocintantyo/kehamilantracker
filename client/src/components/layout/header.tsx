import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  return (
    <header className="bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 shadow-soft py-4 px-4 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-primary text-2xl mr-2">
            <i className="ri-seedling-line"></i>
          </span>
          <h1 className="font-lora font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Bloom</h1>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/">
            <a className={`font-poppins font-medium ${location === '/' 
              ? 'text-primary bg-primary/10 px-3 py-1 rounded-full' 
              : 'text-neutral-dark hover:text-primary hover:bg-primary/5 px-3 py-1 rounded-full'} transition-all duration-200`}>
              Home
            </a>
          </Link>
          <Link href="/cycle">
            <a className={`font-poppins font-medium ${location === '/cycle' 
              ? 'text-secondary bg-secondary/10 px-3 py-1 rounded-full' 
              : 'text-neutral-dark hover:text-secondary hover:bg-secondary/5 px-3 py-1 rounded-full'} transition-all duration-200`}>
              Cycle
            </a>
          </Link>
          <Link href="/insights">
            <a className={`font-poppins font-medium ${location === '/insights' 
              ? 'text-accent bg-accent/10 px-3 py-1 rounded-full' 
              : 'text-neutral-dark hover:text-accent hover:bg-accent/5 px-3 py-1 rounded-full'} transition-all duration-200`}>
              Insights
            </a>
          </Link>
          <Link href="/journal">
            <a className={`font-poppins font-medium ${location === '/journal' 
              ? 'text-primary bg-primary/10 px-3 py-1 rounded-full' 
              : 'text-neutral-dark hover:text-primary hover:bg-primary/5 px-3 py-1 rounded-full'} transition-all duration-200`}>
              Journal
            </a>
          </Link>
          <Link href="/resources">
            <a className={`font-poppins font-medium ${location === '/resources' 
              ? 'text-secondary bg-secondary/10 px-3 py-1 rounded-full' 
              : 'text-neutral-dark hover:text-secondary hover:bg-secondary/5 px-3 py-1 rounded-full'} transition-all duration-200`}>
              Resources
            </a>
          </Link>
        </div>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-9 h-9 bg-gradient-to-br from-primary via-accent to-secondary rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md transition-all duration-200">
                <User className="h-4 w-4 text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuItem className="font-medium">
                    {user.name || user.username}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="text-red-500 focus:text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/auth">
                    <a className="flex cursor-default items-center">
                      Log in
                    </a>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
