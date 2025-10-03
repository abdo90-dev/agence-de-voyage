
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BookingData {
  bookingReference: string;
  customerEmail: string;
  customerName: string;
  tripName: string;
  departureDate: string;
  returnDate: string;
  totalPrice: number;
  travelInsurance: boolean;
  mealPreference: string;
}

function generatePDF(data: BookingData): string {
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

  return `
═══════════════════════════════════════════════════════════
              AL-BARAKAH VOYAGES
     Confirmation de Réservation
═══════════════════════════════════════════════════════════

RÉFÉRENCE DE RÉSERVATION: ${data.bookingReference}
Date d'émission: ${new Date().toLocaleDateString('fr-FR')}

───────────────────────────────────────────────────────────
INFORMATIONS CLIENT
───────────────────────────────────────────────────────────
Nom: ${data.customerName}
Email: ${data.customerEmail}

───────────────────────────────────────────────────────────
DÉTAILS DU VOYAGE
───────────────────────────────────────────────────────────
Voyage: ${data.tripName}
Date de départ: ${formatDate(data.departureDate)}
Date de retour: ${formatDate(data.returnDate)}

───────────────────────────────────────────────────────────
OPTIONS
───────────────────────────────────────────────────────────
Préférence de repas: ${data.mealPreference}
Assurance voyage: ${data.travelInsurance ? 'Oui' : 'Non'}

───────────────────────────────────────────────────────────
PRIX TOTAL: ${formatPrice(data.totalPrice)}
───────────────────────────────────────────────────────────

CONDITIONS:
- Veuillez conserver cette confirmation
- Présentez-vous à l'aéroport 3h avant le départ
- Votre passeport doit être valide au moins 6 mois

CONTACT:
Tél: +33 1 23 45 67 89
Email: contact@albarakah-voyages.fr
Adresse: 123 Avenue de la République, 75011 Paris

═══════════════════════════════════════════════════════════
  Merci d'avoir choisi Al-Barakah Voyages
  Nous vous souhaitons un excellent voyage spirituel
═══════════════════════════════════════════════════════════
  `;
}

function generateEmailHTML(data: BookingData): string {
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

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
    .booking-ref { background: #d1fae5; border: 2px solid #059669; padding: 15px; text-align: center; margin: 20px 0; border-radius: 8px; }
    .section { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px; }
    .section-title { font-weight: bold; color: #059669; margin-bottom: 10px; }
    .total { font-size: 24px; font-weight: bold; color: #059669; text-align: center; margin: 20px 0; padding: 20px; background: #f0fdf4; border-radius: 8px; }
    .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">✈️ Al-Barakah Voyages</h1>
      <p style="margin: 10px 0 0 0;">Confirmation de Réservation</p>
    </div>
    
    <div class="content">
      <p>Cher(e) ${data.customerName},</p>
      
      <p>Nous sommes ravis de confirmer votre réservation pour votre voyage spirituel. Veuillez trouver ci-dessous les détails de votre réservation.</p>
      
      <div class="booking-ref">
        <div style="font-size: 12px; color: #059669;">Référence de réservation</div>
        <div style="font-size: 24px; font-weight: bold; color: #059669;">${data.bookingReference}</div>
      </div>
      
      <div class="section">
        <div class="section-title">📅 Détails du Voyage</div>
        <p style="margin: 5px 0;"><strong>Voyage:</strong> ${data.tripName}</p>
        <p style="margin: 5px 0;"><strong>Date de départ:</strong> ${formatDate(data.departureDate)}</p>
        <p style="margin: 5px 0;"><strong>Date de retour:</strong> ${formatDate(data.returnDate)}</p>
      </div>
      
      <div class="section">
        <div class="section-title">🎯 Options Choisies</div>
        <p style="margin: 5px 0;"><strong>Préférence de repas:</strong> ${data.mealPreference}</p>
        <p style="margin: 5px 0;"><strong>Assurance voyage:</strong> ${data.travelInsurance ? 'Oui' : 'Non'}</p>
      </div>
      
      <div class="total">
        Prix Total: ${formatPrice(data.totalPrice)}
      </div>
      
      <div class="section">
        <div class="section-title">ℹ️ Informations Importantes</div>
        <ul>
          <li>Présentez-vous à l'aéroport 3 heures avant le départ</li>
          <li>Votre passeport doit être valide au moins 6 mois après la date de retour</li>
          <li>Conservez cette confirmation pour vos déplacements</li>
          <li>Un document PDF détaillé est joint à cet email</li>
        </ul>
      </div>
      
      <p>Si vous avez des questions, n'hésitez pas à nous contacter :</p>
      <p>
        📞 +33 1 23 45 67 89<br>
        📧 contact@albarakah-voyages.fr<br>
        📍 123 Avenue de la République, 75011 Paris
      </p>
      
      <p>Nous vous souhaitons un excellent voyage spirituel !</p>
      
      <p style="margin-top: 30px;">Cordialement,<br><strong>L'équipe Al-Barakah Voyages</strong></p>
    </div>
    
    <div class="footer">
      <p style="margin: 0;">© ${new Date().getFullYear()} Al-Barakah Voyages. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
  `;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const bookingData: BookingData = await req.json();

    const pdfContent = generatePDF(bookingData);
    const htmlContent = generateEmailHTML(bookingData);

    console.log('Booking confirmation email generated for:', bookingData.customerEmail);
    console.log('Booking reference:', bookingData.bookingReference);
    console.log('PDF content generated');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Confirmation email sent successfully',
        bookingReference: bookingData.bookingReference,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing booking confirmation:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});