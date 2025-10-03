import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Niya first</h3>
            <p className="text-sm">
              Votre partenaire de confiance pour les voyages sacrés. Nous organisons des voyages
              pour le Hajj et l'Omra depuis plus de 15 ans.
            </p>
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contact@Niya-first.fr</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>123 Avenue de la République, 75011 Paris</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Horaires d'ouverture</h3>
            <div className="text-sm space-y-1">
              <p>Lundi - Vendredi: 9h00 - 18h00</p>
              <p>Samedi: 10h00 - 16h00</p>
              <p>Dimanche: Fermé</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Niya first. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
