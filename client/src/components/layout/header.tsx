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
    <header className="bg-white shadow-soft py-4 px-4 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-primary-dark text-2xl mr-2">
            <i className="ri-seedling-line"></i>
          </span>
          <h1 className="font-lora font-bold text-xl text-neutral-dark">Bloom</h1>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/">
            <a className={`font-poppins ${location === '/' ? 'text-primary-dark' : 'text-neutral-dark'} hover:text-primary-dark transition`}>
              Home
            </a>
          </Link>
          <Link href="/cycle">
            <a className={`font-poppins ${location === '/cycle' ? 'text-primary-dark' : 'text-neutral-dark'} hover:text-primary-dark transition`}>
              Cycle
            </a>
          </Link>
          <Link href="/insights">
            <a className={`font-poppins ${location === '/insights' ? 'text-primary-dark' : 'text-neutral-dark'} hover:text-primary-dark transition`}>
              Insights
            </a>
          </Link>
          <Link href="/journal">
            <a className={`font-poppins ${location === '/journal' ? 'text-primary-dark' : 'text-neutral-dark'} hover:text-primary-dark transition`}>
              Journal
            </a>
          </Link>
          <Link href="/resources">
            <a className={`font-poppins ${location === '/resources' ? 'text-primary-dark' : 'text-neutral-dark'} hover:text-primary-dark transition`}>
              Resources
            </a>
          </Link>
        </div>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer">
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
