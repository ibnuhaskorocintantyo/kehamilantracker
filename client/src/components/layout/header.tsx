import { Link, useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();
  
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
          <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer">
            <i className="ri-user-line text-white"></i>
          </span>
        </div>
      </div>
    </header>
  );
}
