import { Plane } from 'lucide-react';

type NavbarProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
};

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const navItems = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'offres', label: 'Nos Offres' },
  ];

  return (
    <nav className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onNavigate('accueil')}
          >
            <Plane className="h-8 w-8" />
            <span className="text-xl font-bold">Niya first</span>
          </div>

          <div className="flex space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'bg-white text-emerald-700'
                    : 'text-white hover:bg-emerald-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
