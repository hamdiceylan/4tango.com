/**
 * Script to set up registration form fields for Sol de Invierno Tango Marathon
 * Run against PRODUCTION database with:
 *   DATABASE_URL="<prod_url>" npx ts-node --compiler-options '{"module":"commonjs","strict":false}' scripts/setup-sol-de-invierno-fields.ts
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const EVENT_ID = "cmna3kdaj000410j7xee3b26d";

// i18n labels for all 7 system languages
const i18n = {
  phone: {
    labels: { en: "Phone Number", es: "Número de teléfono", de: "Telefonnummer", fr: "Numéro de téléphone", it: "Numero di telefono", pl: "Numer telefonu", tr: "Telefon Numarası" },
    placeholders: { en: "+90 555 123 4567", es: "+90 555 123 4567", de: "+90 555 123 4567", fr: "+90 555 123 4567", it: "+90 555 123 4567", pl: "+90 555 123 4567", tr: "+90 555 123 4567" },
  },
  early_late_checkin: {
    labels: { en: "I want early check-in / late checkout", es: "Quiero entrada anticipada / salida tardía", de: "Ich möchte früh einchecken / spät auschecken", fr: "Je souhaite un enregistrement anticipé / départ tardif", it: "Desidero check-in anticipato / check-out posticipato", pl: "Chcę wcześniejsze zameldowanie / późniejsze wymeldowanie", tr: "Erken giriş / geç çıkış istiyorum" },
  },
  roommate_name: {
    labels: { en: "Roommate Name", es: "Nombre del compañero de habitación", de: "Name des Mitbewohners", fr: "Nom du colocataire", it: "Nome del compagno di stanza", pl: "Imię współlokatora", tr: "Oda Arkadaşı İsmi" },
    helpTexts: {
      en: "If you have a roommate, they must also register separately. If not, the organization can arrange a roommate for you.",
      es: "Si tiene un compañero de habitación, también debe registrarse por separado. Si no, la organización puede asignarle uno.",
      de: "Wenn Sie einen Mitbewohner haben, muss dieser sich ebenfalls separat anmelden. Andernfalls kann die Organisation einen für Sie arrangieren.",
      fr: "Si vous avez un colocataire, il doit également s'inscrire séparément. Sinon, l'organisation peut vous en attribuer un.",
      it: "Se hai un compagno di stanza, deve registrarsi separatamente. In caso contrario, l'organizzazione può assegnartene uno.",
      pl: "Jeśli masz współlokatora, musi się również zarejestrować osobno. Jeśli nie, organizacja może przydzielić ci współlokatora.",
      tr: "Oda arkadaşınız varsa, onun da ayrıca kayıt yaptırması gerekmektedir. Yoksa organizasyon size bir oda arkadaşı ayarlayabilir.",
    },
  },
  snoring: {
    labels: { en: "Do you have a snoring problem?", es: "¿Tiene problema de ronquidos?", de: "Haben Sie ein Schnarchproblem?", fr: "Avez-vous un problème de ronflement ?", it: "Hai un problema di russamento?", pl: "Czy masz problem z chrapaniem?", tr: "Horlama probleminiz var mı?" },
  },
  partner_name: {
    labels: { en: "Partner Name", es: "Nombre de la pareja", de: "Name des Partners", fr: "Nom du partenaire", it: "Nome del partner", pl: "Imię partnera", tr: "Partner İsmi" },
  },
  marathon_history: {
    labels: { en: "Last 3 marathons you participated in", es: "Últimos 3 maratones en los que participó", de: "Letzte 3 Marathons, an denen Sie teilgenommen haben", fr: "Les 3 derniers marathons auxquels vous avez participé", it: "Ultimi 3 maratoni a cui hai partecipato", pl: "Ostatnie 3 maratony, w których uczestniczyłeś", tr: "Katıldığınız son 3 maraton" },
  },
  facebook_profile: {
    labels: { en: "Facebook or Instagram Link", es: "Enlace de Facebook o Instagram", de: "Facebook- oder Instagram-Link", fr: "Lien Facebook ou Instagram", it: "Link Facebook o Instagram", pl: "Link do Facebooka lub Instagrama", tr: "Facebook veya Instagram Linki" },
  },
  photo_consent: {
    labels: {
      en: "I allow the photos and videos taken at the event to be used on the event page and social media.",
      es: "Permito que las fotos y videos tomados en el evento se utilicen en la página del evento y redes sociales.",
      de: "Ich erlaube, dass die beim Event aufgenommenen Fotos und Videos auf der Veranstaltungsseite und in sozialen Medien verwendet werden.",
      fr: "J'autorise l'utilisation des photos et vidéos prises lors de l'événement sur la page de l'événement et les réseaux sociaux.",
      it: "Autorizzo l'uso delle foto e dei video scattati durante l'evento sulla pagina dell'evento e sui social media.",
      pl: "Wyrażam zgodę na wykorzystanie zdjęć i filmów z wydarzenia na stronie wydarzenia i w mediach społecznościowych.",
      tr: "Etkinlikte çekilen fotoğraf ve videoların etkinlik sayfasında ve sosyal medyada kullanılmasına izin veriyorum.",
    },
  },
  airport_transfer: {
    labels: {
      en: "I need a transfer from Antalya Airport to the hotel and back",
      es: "Necesito traslado del aeropuerto de Antalya al hotel y regreso",
      de: "Ich benötige einen Transfer vom Flughafen Antalya zum Hotel und zurück",
      fr: "J'ai besoin d'un transfert de l'aéroport d'Antalya à l'hôtel et retour",
      it: "Ho bisogno di un trasferimento dall'aeroporto di Antalya all'hotel e ritorno",
      pl: "Potrzebuję transferu z lotniska w Antalyi do hotelu i z powrotem",
      tr: "Antalya Havalimanı'ndan otele ve geri dönüş transferine ihtiyacım var",
    },
  },
  arrival_airline: {
    labels: { en: "Arrival Airline", es: "Aerolínea de llegada", de: "Ankunftsfluggesellschaft", fr: "Compagnie aérienne d'arrivée", it: "Compagnia aerea di arrivo", pl: "Linia lotnicza przylotu", tr: "Geliş Havayolu" },
  },
  arrival_date: {
    labels: { en: "Arrival Date", es: "Fecha de llegada", de: "Ankunftsdatum", fr: "Date d'arrivée", it: "Data di arrivo", pl: "Data przylotu", tr: "Geliş Tarihi" },
  },
  arrival_time: {
    labels: { en: "Arrival Landing Time", es: "Hora de aterrizaje", de: "Ankunftszeit", fr: "Heure d'atterrissage", it: "Orario di atterraggio", pl: "Godzina lądowania", tr: "Geliş İniş Saati" },
    placeholders: { en: "HH:MM", es: "HH:MM", de: "HH:MM", fr: "HH:MM", it: "HH:MM", pl: "HH:MM", tr: "SS:DD" },
  },
  arrival_flight_code: {
    labels: { en: "Arrival Flight Code", es: "Código de vuelo de llegada", de: "Ankunftsflugcode", fr: "Code de vol d'arrivée", it: "Codice volo di arrivo", pl: "Kod lotu przylotowego", tr: "Geliş Uçuş Kodu" },
    placeholders: { en: "e.g. TK1234", es: "ej. TK1234", de: "z.B. TK1234", fr: "ex. TK1234", it: "es. TK1234", pl: "np. TK1234", tr: "örn. TK1234" },
  },
  departure_airline: {
    labels: { en: "Departure Airline", es: "Aerolínea de salida", de: "Abfluggesellschaft", fr: "Compagnie aérienne de départ", it: "Compagnia aerea di partenza", pl: "Linia lotnicza odlotu", tr: "Gidiş Havayolu" },
  },
  departure_date: {
    labels: { en: "Departure Date", es: "Fecha de salida", de: "Abreisedatum", fr: "Date de départ", it: "Data di partenza", pl: "Data odlotu", tr: "Gidiş Tarihi" },
  },
  departure_time: {
    labels: { en: "Departure Time", es: "Hora de salida", de: "Abflugzeit", fr: "Heure de départ", it: "Orario di partenza", pl: "Godzina odlotu", tr: "Gidiş Kalkış Saati" },
    placeholders: { en: "HH:MM", es: "HH:MM", de: "HH:MM", fr: "HH:MM", it: "HH:MM", pl: "HH:MM", tr: "SS:DD" },
  },
  departure_flight_code: {
    labels: { en: "Departure Flight Code", es: "Código de vuelo de salida", de: "Abflugcode", fr: "Code de vol de départ", it: "Codice volo di partenza", pl: "Kod lotu odlotowego", tr: "Gidiş Uçuş Kodu" },
    placeholders: { en: "e.g. TK1234", es: "ej. TK1234", de: "z.B. TK1234", fr: "ex. TK1234", it: "es. TK1234", pl: "np. TK1234", tr: "örn. TK1234" },
  },
};

async function main() {
  // Verify we're on the right database
  const event = await prisma.event.findUnique({ where: { id: EVENT_ID } });
  if (!event) {
    console.error("Event not found! Are you connected to the right database?");
    process.exit(1);
  }
  console.log(`✓ Found event: ${event.title} (${event.slug})`);

  // Check database host
  const dbUrl = process.env.DATABASE_URL || "";
  if (dbUrl.includes("tango-dev")) {
    console.error("⚠️  WARNING: Connected to DEV database, not PROD!");
    console.error("   Set DATABASE_URL to production before running this script.");
    process.exit(1);
  }
  console.log(`✓ Database: ${dbUrl.includes("tango-prod") ? "PRODUCTION" : "UNKNOWN"}`);

  // --- Update existing fields ---

  // Update facebook_profile label + i18n
  console.log("\nUpdating facebook_profile...");
  await prisma.eventFormField.update({
    where: { id: "cmna4ceo6000twc0x7cc8bim1" },
    data: {
      label: i18n.facebook_profile.labels.en,
      labels: i18n.facebook_profile.labels,
    },
  });
  console.log("  ✓ facebook_profile updated");

  // Update photo_consent label + i18n + make required
  console.log("Updating photo_consent...");
  await prisma.eventFormField.update({
    where: { id: "cmna4cepi000vwc0xgc2nw2ma" },
    data: {
      label: i18n.photo_consent.labels.en,
      labels: i18n.photo_consent.labels,
      isRequired: true,
    },
  });
  console.log("  ✓ photo_consent updated (now required)");

  // Update marathon_history i18n
  console.log("Updating marathon_history...");
  await prisma.eventFormField.update({
    where: { id: "cmna4cemu000rwc0xpkou8oa9" },
    data: {
      label: i18n.marathon_history.labels.en,
      labels: i18n.marathon_history.labels,
    },
  });
  console.log("  ✓ marathon_history updated");

  // Update airport_transfer i18n
  console.log("Updating airport_transfer...");
  await prisma.eventFormField.update({
    where: { id: "cmna4celh000pwc0xq8f8o77d" },
    data: {
      label: i18n.airport_transfer.labels.en,
      labels: i18n.airport_transfer.labels,
    },
  });
  console.log("  ✓ airport_transfer updated");

  // --- Create new fields ---

  const newFields = [
    {
      name: "phone",
      fieldType: "TEL",
      label: i18n.phone.labels.en,
      labels: i18n.phone.labels,
      placeholders: i18n.phone.placeholders,
      isRequired: true,
    },
    {
      name: "early_late_checkin",
      fieldType: "CHECKBOX",
      label: i18n.early_late_checkin.labels.en,
      labels: i18n.early_late_checkin.labels,
      isRequired: false,
    },
    {
      name: "roommate_name",
      fieldType: "TEXT",
      label: i18n.roommate_name.labels.en,
      labels: i18n.roommate_name.labels,
      helpTexts: i18n.roommate_name.helpTexts,
      helpText: i18n.roommate_name.helpTexts.en,
      isRequired: false,
    },
    {
      name: "snoring",
      fieldType: "RADIO",
      label: i18n.snoring.labels.en,
      labels: i18n.snoring.labels,
      isRequired: false,
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
    },
    {
      name: "partner_name",
      fieldType: "TEXT",
      label: i18n.partner_name.labels.en,
      labels: i18n.partner_name.labels,
      isRequired: false,
    },
    {
      name: "arrival_airline",
      fieldType: "TEXT",
      label: i18n.arrival_airline.labels.en,
      labels: i18n.arrival_airline.labels,
      isRequired: false,
    },
    {
      name: "arrival_date",
      fieldType: "DATE",
      label: i18n.arrival_date.labels.en,
      labels: i18n.arrival_date.labels,
      isRequired: false,
    },
    {
      name: "arrival_time",
      fieldType: "TEXT",
      label: i18n.arrival_time.labels.en,
      labels: i18n.arrival_time.labels,
      placeholders: i18n.arrival_time.placeholders,
      placeholder: i18n.arrival_time.placeholders.en,
      isRequired: false,
    },
    {
      name: "arrival_flight_code",
      fieldType: "TEXT",
      label: i18n.arrival_flight_code.labels.en,
      labels: i18n.arrival_flight_code.labels,
      placeholders: i18n.arrival_flight_code.placeholders,
      placeholder: i18n.arrival_flight_code.placeholders.en,
      isRequired: false,
    },
    {
      name: "departure_airline",
      fieldType: "TEXT",
      label: i18n.departure_airline.labels.en,
      labels: i18n.departure_airline.labels,
      isRequired: false,
    },
    {
      name: "departure_date",
      fieldType: "DATE",
      label: i18n.departure_date.labels.en,
      labels: i18n.departure_date.labels,
      isRequired: false,
    },
    {
      name: "departure_time",
      fieldType: "TEXT",
      label: i18n.departure_time.labels.en,
      labels: i18n.departure_time.labels,
      placeholders: i18n.departure_time.placeholders,
      placeholder: i18n.departure_time.placeholders.en,
      isRequired: false,
    },
    {
      name: "departure_flight_code",
      fieldType: "TEXT",
      label: i18n.departure_flight_code.labels.en,
      labels: i18n.departure_flight_code.labels,
      placeholders: i18n.departure_flight_code.placeholders,
      placeholder: i18n.departure_flight_code.placeholders.en,
      isRequired: false,
    },
  ];

  console.log("\nCreating new fields...");
  for (const field of newFields) {
    // Check if field already exists
    const existing = await prisma.eventFormField.findFirst({
      where: { eventId: EVENT_ID, name: field.name },
    });
    if (existing) {
      console.log(`  ⚠ ${field.name} already exists, skipping`);
      continue;
    }

    await prisma.eventFormField.create({
      data: {
        eventId: EVENT_ID,
        ...field,
        order: 0, // Will be reordered below
      },
    });
    console.log(`  ✓ ${field.name} created`);
  }

  // --- Reorder all fields ---
  console.log("\nReordering fields...");

  // Desired order: phone, early_late_checkin, roommate_name, snoring, partner_name,
  //   marathon_history, facebook_profile, photo_consent, airport_transfer,
  //   arrival_airline, arrival_date, arrival_time, arrival_flight_code,
  //   departure_airline, departure_date, departure_time, departure_flight_code
  const desiredOrder = [
    "phone",
    "early_late_checkin",
    "roommate_name",
    "snoring",
    "partner_name",
    "marathon_history",
    "facebook_profile",
    "photo_consent",
    "airport_transfer",
    "arrival_airline",
    "arrival_date",
    "arrival_time",
    "arrival_flight_code",
    "departure_airline",
    "departure_date",
    "departure_time",
    "departure_flight_code",
  ];

  const allFields = await prisma.eventFormField.findMany({
    where: { eventId: EVENT_ID },
  });

  for (let i = 0; i < desiredOrder.length; i++) {
    const field = allFields.find((f: { name: string }) => f.name === desiredOrder[i]);
    if (field) {
      await prisma.eventFormField.update({
        where: { id: field.id },
        data: { order: i + 1 },
      });
      console.log(`  ${i + 1}. ${field.name}`);
    } else {
      console.log(`  ⚠ ${desiredOrder[i]} not found, skipping`);
    }
  }

  // --- Final summary ---
  console.log("\n=== FINAL FIELD LIST ===");
  const finalFields = await prisma.eventFormField.findMany({
    where: { eventId: EVENT_ID },
    orderBy: { order: "asc" },
  });
  for (const f of finalFields) {
    console.log(`  ${f.order}. ${f.name} (${f.fieldType}, ${f.isRequired ? "REQUIRED" : "optional"}) - ${f.label}`);
  }
  console.log(`\nTotal: ${finalFields.length} custom fields`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
