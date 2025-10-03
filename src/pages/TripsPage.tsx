import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, CheckCircle } from 'lucide-react';
import { supabase, type Trip } from '../lib/supabase';

type TripsPageProps = {
  onNavigate: (page: string, tripId?: string) => void;
};

export default function TripsPage({ onNavigate }: TripsPageProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('departure_date', { ascending: true });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Chargement des offres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nos Offres de Voyage</h1>
          <p className="text-xl text-gray-600">
            Découvrez nos formules pour le Hajj et l'Omra adaptées à vos besoins
          </p>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              Aucune offre disponible pour le moment. Revenez bientôt !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div
                  className="h-48 bg-cover bg-center"
                  style={{
                    backgroundImage: trip.image_url
                      ? `url(${trip.image_url})`
                      : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  }}
                />

                <div className="p-6">
                  <div className="mb-2">
                    <span className="text-sm text-emerald-600 font-semibold">
                      {trip.agency_name}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">{trip.name}</h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{trip.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                      <span>
                        Du {formatDate(trip.departure_date)} au {formatDate(trip.return_date)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-emerald-600" />
                      <span>{trip.available_spots} places disponibles</span>
                    </div>
                  </div>

                  {trip.includes && trip.includes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Inclus :</p>
                      <div className="space-y-1">
                        {trip.includes.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-start text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 mr-2 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                        {trip.includes.length > 3 && (
                          <p className="text-xs text-gray-500 ml-6">
                            + {trip.includes.length - 3} autres services...
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">À partir de</span>
                      <span className="text-2xl font-bold text-emerald-600">
                        {formatPrice(trip.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => onNavigate('reservation', trip.id)}
                      disabled={trip.available_spots === 0}
                      className={`w-full font-semibold px-6 py-3 rounded-lg transition-colors ${
                        trip.available_spots === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {trip.available_spots === 0 ? 'Complet' : 'Réserver'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
