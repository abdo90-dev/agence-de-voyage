import { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import TripsPage from './pages/TripsPage';
import BookingPage from './pages/BookingPage';

function App() {
  const [currentPage, setCurrentPage] = useState('accueil');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const handleNavigate = (page: string, tripId?: string) => {
    setCurrentPage(page);
    if (tripId) {
      setSelectedTripId(tripId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="flex-grow">
        {currentPage === 'accueil' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'offres' && <TripsPage onNavigate={handleNavigate} />}
        {currentPage === 'reservation' && selectedTripId && (
          <BookingPage tripId={selectedTripId} onNavigate={handleNavigate} />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
