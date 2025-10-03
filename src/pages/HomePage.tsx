import { useState } from 'react';
import { Star, Shield, Users, CheckCircle, Phone, Mail, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

type HomePageProps = {
  onNavigate: (page: string) => void;
};

export default function HomePage({ onNavigate }: HomePageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase.from('contact_messages').insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message,
        },
      ]);

      if (error) throw error;

      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: Star,
      title: 'Excellence du service',
      description: 'Plus de 15 ans d\'expérience dans l\'organisation de voyages spirituels',
    },
    {
      icon: Shield,
      title: 'Sécurité garantie',
      description: 'Accompagnement complet et assistance 24h/24 durant votre séjour',
    },
    {
      icon: Users,
      title: 'Guides expérimentés',
      description: 'Des guides francophones qualifiés pour vous accompagner',
    },
  ];

  const services = [
    'Billets d\'avion aller-retour',
    'Hébergement en hôtels 4 ou 5 étoiles',
    'Transport climatisé sur place',
    'Pension complète (repas halal)',
    'Accompagnement spirituel',
    'Assurance voyage incluse',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="relative bg-cover bg-center h-96"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.pexels.com/photos/4403922/pexels-photo-4403922.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="text-white px-4">
            <h1 className="text-5xl font-bold mb-4">Bienvenue chez Niya first</h1>
            <p className="text-xl mb-8">
              Votre voyage spirituel commence ici - Hajj et Omra en toute sérénité
            </p>
            <button
              onClick={() => onNavigate('offres')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg"
            >
              Découvrir nos offres
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Pourquoi choisir Niya first ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
              >
                <benefit.icon className="h-12 w-12 text-emerald-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Nos services inclus</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{service}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg shadow-xl p-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-6">Contactez-nous</h2>
              <p className="mb-6">
                Notre équipe est à votre disposition pour répondre à toutes vos questions et vous
                accompagner dans la préparation de votre voyage.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5" />
                  <span>+33 1 23 45 67 89</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5" />
                  <span>contact@albarakah-voyages.fr</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5" />
                  <span>123 Avenue de la République, 75011 Paris</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Envoyez-nous un message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
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
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>
                {submitStatus === 'success' && (
                  <p className="text-emerald-600 text-sm text-center">
                    Message envoyé avec succès !
                  </p>
                )}
                {submitStatus === 'error' && (
                  <p className="text-red-600 text-sm text-center">
                    Erreur lors de l'envoi. Veuillez réessayer.
                  </p>
                )}
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
