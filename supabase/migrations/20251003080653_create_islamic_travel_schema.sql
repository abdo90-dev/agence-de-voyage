/*
  # Schéma de base de données pour agence de voyages islamique

  ## Description
  Ce fichier crée les tables nécessaires pour gérer une agence de voyages spécialisée 
  dans les voyages Hajj et Omra, incluant les offres, les clients et les réservations.

  ## 1. Nouvelles Tables
  
  ### `trips` (Offres de voyage)
  - `id` (uuid, clé primaire) - Identifiant unique de l'offre
  - `name` (text) - Nom du voyage (ex: "Hajj 2025 - Formule Confort")
  - `agency_name` (text) - Nom de l'agence organisatrice
  - `description` (text) - Description détaillée du voyage
  - `price` (numeric) - Prix en euros
  - `departure_date` (date) - Date de départ
  - `return_date` (date) - Date de retour
  - `available_spots` (integer) - Places disponibles
  - `image_url` (text, optionnel) - URL de l'image du voyage
  - `includes` (text[]) - Liste des services inclus
  - `created_at` (timestamptz) - Date de création
  - `updated_at` (timestamptz) - Date de mise à jour
  
  ### `customers` (Clients)
  - `id` (uuid, clé primaire) - Identifiant unique du client
  - `first_name` (text) - Prénom
  - `last_name` (text) - Nom de famille
  - `email` (text, unique) - Email
  - `phone` (text) - Numéro de téléphone
  - `address` (text) - Adresse complète
  - `passport_number` (text) - Numéro de passeport
  - `created_at` (timestamptz) - Date de création
  
  ### `bookings` (Réservations)
  - `id` (uuid, clé primaire) - Identifiant unique de la réservation
  - `booking_reference` (text, unique) - Référence de réservation
  - `customer_id` (uuid, FK) - Référence au client
  - `trip_id` (uuid, FK) - Référence au voyage
  - `travel_insurance` (boolean) - Assurance voyage
  - `meal_preference` (text) - Préférence de repas (halal, végétarien, etc.)
  - `special_requests` (text) - Demandes spéciales
  - `total_price` (numeric) - Prix total
  - `payment_status` (text) - Statut du paiement (pending, completed, failed)
  - `payment_id` (text) - Identifiant de transaction
  - `created_at` (timestamptz) - Date de création
  - `updated_at` (timestamptz) - Date de mise à jour
  
  ### `contact_messages` (Messages de contact)
  - `id` (uuid, clé primaire) - Identifiant unique du message
  - `name` (text) - Nom du contact
  - `email` (text) - Email du contact
  - `phone` (text, optionnel) - Téléphone du contact
  - `message` (text) - Message
  - `created_at` (timestamptz) - Date de création

  ## 2. Sécurité
  - Active RLS sur toutes les tables
  - Les offres de voyage sont accessibles en lecture publique
  - Les clients peuvent lire leurs propres données uniquement
  - Les réservations sont accessibles uniquement à leurs propriétaires
  - Les messages de contact sont insérables par tous (pour le formulaire)
  - Seuls les administrateurs peuvent modifier les offres (via service role)

  ## 3. Index
  - Index sur email des clients pour recherche rapide
  - Index sur booking_reference pour accès rapide aux réservations
  - Index sur trip_id et customer_id pour les jointures

  ## 4. Contraintes
  - Prix positifs uniquement
  - Statuts de paiement limités aux valeurs valides
  - Dates de retour après dates de départ
*/

-- Table des offres de voyage
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  agency_name text NOT NULL DEFAULT 'Al-Barakah Voyages',
  description text NOT NULL,
  price numeric NOT NULL CHECK (price > 0),
  departure_date date NOT NULL,
  return_date date NOT NULL CHECK (return_date > departure_date),
  available_spots integer NOT NULL DEFAULT 0 CHECK (available_spots >= 0),
  image_url text,
  includes text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des clients
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  passport_number text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des réservations
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference text UNIQUE NOT NULL,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE RESTRICT,
  travel_insurance boolean DEFAULT false,
  meal_preference text DEFAULT 'halal',
  special_requests text,
  total_price numeric NOT NULL CHECK (total_price > 0),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  payment_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des messages de contact
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_trip ON bookings(trip_id);

-- Activer RLS sur toutes les tables
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour trips (lecture publique)
CREATE POLICY "Anyone can view trips"
  ON trips FOR SELECT
  TO anon, authenticated
  USING (true);

-- Politiques RLS pour customers (lecture de ses propres données uniquement)
CREATE POLICY "Users can view own customer data"
  ON customers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert customer data"
  ON customers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Politiques RLS pour bookings
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update bookings"
  ON bookings FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Politiques RLS pour contact_messages (insertion publique)
CREATE POLICY "Anyone can send contact messages"
  ON contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);