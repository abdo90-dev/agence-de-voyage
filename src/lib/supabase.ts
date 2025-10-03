import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Trip = {
  id: string;
  name: string;
  agency_name: string;
  description: string;
  price: number;
  departure_date: string;
  return_date: string;
  available_spots: number;
  image_url?: string;
  includes: string[];
  created_at: string;
  updated_at: string;
};

export type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  passport_number: string;
  created_at: string;
};

export type Booking = {
  id: string;
  booking_reference: string;
  customer_id: string;
  trip_id: string;
  travel_insurance: boolean;
  meal_preference: string;
  special_requests?: string;
  total_price: number;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_id?: string;
  created_at: string;
  updated_at: string;
};

export type ContactMessage = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};
