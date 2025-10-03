import { useState, useEffect } from 'react';
import { Calendar, CreditCard, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, type Trip } from '../lib/supabase';

type BookingPageProps = {
  tripId: string;
  onNavigate: (page: string) => void;
};

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  passportNumber: string;
  travelInsurance: boolean;
  mealPreference: string;
  specialRequests: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
};

export default function BookingPage({ tripId, onNavigate }: BookingPageProps) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingReference, setBookingReference] = useState('');

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    passportNumber: '',
    travelInsurance: false,
    mealPreference: 'halal',
    specialRequests: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
  });

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        alert('Voyage introuvable');
        onNavigate('offres');
        return;
      }
      setTrip(data);
    } catch (error) {
      console.error('Error loading trip:', error);
      alert('Erreur lors du chargement du voyage');
      onNavigate('offres');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const calculateTotal = () => {
    if (!trip) return 0;
    let total = trip.price;
    if (formData.travelInsurance) total += 150;
    return total;
  };

  const generateBookingReference = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'BK-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;

    setIsSubmitting(true);

    try {
      const customerData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        passport_number: formData.passportNumber,
      };

      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', formData.email)
        .maybeSingle();

      let customerId: string;

      if (existingCustomer) {
        customerId = existingCustomer.id;
        await supabase
          .from('customers')
          .update(customerData)
          .eq('id', customerId);
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert([customerData])
          .select('id')
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      const reference = generateBookingReference();
      const totalPrice = calculateTotal();

      const bookingData = {
        booking_reference: reference,
        customer_id: customerId,
        trip_id: trip.id,
        travel_insurance: formData.travelInsurance,
        meal_preference: formData.mealPreference,
        special_requests: formData.specialRequests || null,
        total_price: totalPrice,
        payment_status: 'pending',
        payment_id: `PAY-${Date.now()}`,
      };

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (bookingError) throw bookingError;

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-booking-confirmation`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          bookingReference: reference,
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          tripName: trip.name,
          departureDate: trip.departure_date,
          returnDate: trip.return_date,
          totalPrice,
          travelInsurance: formData.travelInsurance,
          mealPreference: formData.mealPreference,
        }),
      });

      await supabase
        .from('bookings')
        .update({ payment_status: 'completed' })
        .eq('booking_reference', reference);

      setBookingReference(reference);
      setBookingComplete(true);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Erreur lors de la réservation. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.firstName &&
          formData.lastName &&
          formData.email &&
          formData.phone &&
          formData.address &&
          formData.passportNumber
        );
      case 2:
        return formData.mealPreference;
      case 3:
        return true;
      case 4:
        return (
          formData.cardNumber.length === 16 &&
          formData.cardExpiry &&
          formData.cardCvc.length === 3 &&
          formData.cardName
        );
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="h-20 w-20 text-emerald-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Réservation confirmée !
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Votre réservation a été effectuée avec succès.
            </p>
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Votre référence de réservation :</p>
              <p className="text-2xl font-bold text-emerald-600">{bookingReference}</p>
            </div>
            <p className="text-gray-600 mb-8">
              Un email de confirmation avec tous les détails de votre réservation et un fichier
              PDF vous a été envoyé à l'adresse <strong>{formData.email}</strong>.
            </p>
            <button
              onClick={() => onNavigate('accueil')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Informations personnelles', icon: User },
    { number: 2, title: 'Options de voyage', icon: FileText },
    { number: 3, title: 'Récapitulatif', icon: Calendar },
    { number: 4, title: 'Paiement', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Réservation</h1>
          <p className="text-gray-600">{trip.name}</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step.number
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium hidden md:inline ${
                    currentStep >= step.number ? 'text-emerald-600' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-1 mx-4 ${
                      currentStep > step.number ? 'bg-emerald-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Informations personnelles
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de famille *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse complète *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de passeport *
                </label>
                <input
                  type="text"
                  required
                  value={formData.passportNumber}
                  onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Options de voyage</h2>

              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.travelInsurance}
                    onChange={(e) =>
                      setFormData({ ...formData, travelInsurance: e.target.checked })
                    }
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-gray-700">
                    Assurance voyage complémentaire (+150 €)
                  </span>
                </label>
                <p className="text-sm text-gray-500 ml-8 mt-1">
                  Couverture complète incluant annulation, rapatriement et frais médicaux
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Préférence de repas *
                </label>
                <select
                  value={formData.mealPreference}
                  onChange={(e) => setFormData({ ...formData, mealPreference: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="halal">Halal standard</option>
                  <option value="vegetarian">Végétarien</option>
                  <option value="no-pork">Sans porc</option>
                  <option value="special">Régime spécial (à préciser)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Demandes spéciales
                </label>
                <textarea
                  rows={4}
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  placeholder="Indiquez ici toute demande particulière (accessibilité, allergies, etc.)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Récapitulatif</h2>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Voyage sélectionné</h3>
                  <p className="text-gray-700">{trip.name}</p>
                  <p className="text-sm text-gray-600">
                    Du {formatDate(trip.departure_date)} au {formatDate(trip.return_date)}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Voyageur</h3>
                  <p className="text-gray-700">
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{formData.email}</p>
                  <p className="text-sm text-gray-600">{formData.phone}</p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Options</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Repas : {formData.mealPreference}</li>
                    <li>
                      Assurance voyage :{' '}
                      {formData.travelInsurance ? 'Oui (+150 €)' : 'Non'}
                    </li>
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Prix du voyage</span>
                    <span className="text-gray-700">{formatPrice(trip.price)}</span>
                  </div>
                  {formData.travelInsurance && (
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-gray-600">Assurance voyage</span>
                      <span className="text-gray-600">{formatPrice(150)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {formatPrice(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Veuillez vérifier attentivement toutes les informations avant de procéder au
                  paiement. Une confirmation vous sera envoyée par email.
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Paiement sécurisé</h2>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3 mb-6">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">
                  Paiement sécurisé. Vos informations bancaires sont protégées.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de carte *
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, cardNumber: e.target.value.replace(/\D/g, '') })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'expiration *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/AA"
                    maxLength={5}
                    value={formData.cardExpiry}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                      }
                      setFormData({ ...formData, cardExpiry: value });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVC *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    placeholder="123"
                    value={formData.cardCvc}
                    onChange={(e) =>
                      setFormData({ ...formData, cardCvc: e.target.value.replace(/\D/g, '') })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom sur la carte *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nom tel qu'il apparaît sur la carte"
                  value={formData.cardName}
                  onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Montant à payer</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {formatPrice(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={currentStep === 1 ? () => onNavigate('offres') : prevStep}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {currentStep === 1 ? 'Annuler' : 'Retour'}
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid()}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                Continuer
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !isStepValid()}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {isSubmitting ? 'Traitement...' : 'Confirmer et payer'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
