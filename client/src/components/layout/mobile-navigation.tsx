import { Link, useLocation } from "wouter";

export default function MobileNavigation() {
  const [location] = useLocation();
  
  return (
    <nav className="md:hidden bg-white border-t fixed bottom-0 left-0 right-0 z-10">
      <div className="flex justify-around items-center py-3">
        <Link href="/">
          <a className={`flex flex-col items-center ${location === '/' ? 'text-primary-dark' : 'text-neutral-medium'}`}>
            <i className="ri-home-5-line text-xl"></i>
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        <Link href="/cycle">
          <a className={`flex flex-col items-center ${location === '/cycle' ? 'text-primary-dark' : 'text-neutral-medium'}`}>
            <i className="ri-calendar-line text-xl"></i>
            <span className="text-xs mt-1">Cycle</span>
          </a>
        </Link>
        <Link href="/insights">
          <a className={`flex flex-col items-center ${location === '/insights' ? 'text-primary-dark' : 'text-neutral-medium'}`}>
            <i className="ri-line-chart-line text-xl"></i>
            <span className="text-xs mt-1">Insights</span>
          </a>
        </Link>
        <Link href="/journal">
          <a className={`flex flex-col items-center ${location === '/journal' ? 'text-primary-dark' : 'text-neutral-medium'}`}>
            <i className="ri-book-2-line text-xl"></i>
            <span className="text-xs mt-1">Journal</span>
          </a>
        </Link>
        <Link href="/resources">
          <a className={`flex flex-col items-center ${location === '/resources' ? 'text-primary-dark' : 'text-neutral-medium'}`}>
            <i className="ri-more-line text-xl"></i>
            <span className="text-xs mt-1">More</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
