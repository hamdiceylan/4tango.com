/**
 * Sol de Invierno Tango Marathon - Migration Script
 *
 * Populates an existing event with:
 * - Event details
 * - 4 pricing packages
 * - Page sections (Schedule, Accommodation, DJ Team, Pricing)
 * - Custom form fields with multi-language support
 *
 * Usage:
 *   npx ts-node scripts/migration/migrate-sol-de-invierno.ts
 *
 * Or via tsx:
 *   npx tsx scripts/migration/migrate-sol-de-invierno.ts
 */

import { PrismaClient, SectionType, FieldType } from '@prisma/client';

const prisma = new PrismaClient();

// Event ID to update (from production: https://4tango.com/events/cmna3kdaj000410j7xee3b26d)
const EVENT_ID = 'cmna3kdaj000410j7xee3b26d';
const EVENT_SLUG = 'sol-de-invierno';

// ============================================
// PACKAGES DATA
// ============================================
const packages = [
  {
    name: '3 Days Double Room',
    description: 'Double room for 3 nights / 4 days. Ultra All-Inclusive package including 24/7 alcoholic and non-alcoholic drinks, all meals, and marathon access.',
    price: 36000, // €360 in cents
    order: 1,
  },
  {
    name: '4 Days Double Room',
    description: 'Double room for 4 nights / 5 days. Ultra All-Inclusive package including 24/7 alcoholic and non-alcoholic drinks, all meals, and marathon access.',
    price: 42000, // €420 in cents
    order: 2,
  },
  {
    name: '3 Days Single Room',
    description: 'Single room for 3 nights / 4 days. Ultra All-Inclusive package including 24/7 alcoholic and non-alcoholic drinks, all meals, and marathon access.',
    price: 57000, // €570 in cents
    order: 3,
  },
  {
    name: '4 Days Single Room',
    description: 'Single room for 4 nights / 5 days. Ultra All-Inclusive package including 24/7 alcoholic and non-alcoholic drinks, all meals, and marathon access.',
    price: 67500, // €675 in cents
    order: 4,
  },
];

// ============================================
// PAGE SECTIONS DATA (Multi-language)
// ============================================
const pageSections = [
  {
    type: SectionType.HERO,
    order: 1,
    content: {
      title: {
        en: 'Sol de Invierno Tango Marathon',
        tr: 'Sol de Invierno Tango Maratonu',
        fr: 'Sol de Invierno Tango Marathon',
      },
      subtitle: {
        en: 'November 6-9, 2025 • Antalya, Turkey',
        tr: '6-9 Kasım 2025 • Antalya, Türkiye',
        fr: '6-9 Novembre 2025 • Antalya, Turquie',
      },
      description: {
        en: '5 Stars Ultra All-Inclusive Tango Marathon by the Mediterranean Sea',
        tr: '5 Yıldızlı Ultra Herşey Dahil Akdeniz Kıyısında Tango Maratonu',
        fr: '5 Étoiles Ultra Tout Compris Marathon de Tango au bord de la Méditerranée',
      },
    },
  },
  {
    type: SectionType.SCHEDULE,
    order: 2,
    title: 'Program',
    content: {
      title: {
        en: 'PROGRAM',
        tr: 'PROGRAM',
        fr: 'PROGRAMME',
      },
      days: [
        {
          label: { en: 'FIRST DAY', tr: 'BİRİNCİ GÜN', fr: 'PREMIER JOUR' },
          date: { en: 'NOV 6, Thursday', tr: '6 Kasım Perşembe', fr: 'Nov 6, Jeudi' },
          sessions: [
            {
              name: { en: 'Opening Milonga', tr: 'Açılış Milongası', fr: "Milonga d'ouverture" },
              time: '22:00-04:00',
            },
          ],
        },
        {
          label: { en: 'SECOND DAY', tr: 'İKİNCİ GÜN', fr: 'DEUXIÈME JOUR' },
          date: { en: 'NOV 7, Friday', tr: '7 Kasım Cuma', fr: 'Nov 7, Vendredi' },
          sessions: [
            {
              name: { en: 'Day Milonga', tr: 'Gündüz Milongası', fr: 'Milonga de jour' },
              time: '15:00-18:30',
            },
            {
              name: { en: 'Night Milonga', tr: 'Gece Milongası', fr: 'Milonga de la nuit' },
              time: '22:00-04:00',
            },
          ],
        },
        {
          label: { en: 'THIRD DAY', tr: 'ÜÇÜNCÜ GÜN', fr: 'TROISIÈME JOUR' },
          date: { en: 'NOV 8, Saturday', tr: '8 Kasım Cumartesi', fr: 'Nov 8, Samedi' },
          sessions: [
            {
              name: { en: 'Day Milonga', tr: 'Gündüz Milongası', fr: 'Milonga de jour' },
              time: '15:00-18:30',
            },
            {
              name: { en: 'Night Milonga', tr: 'Gece Milongası', fr: 'Milonga de la nuit' },
              time: '22:00-04:00',
            },
          ],
        },
        {
          label: { en: 'LAST DAY', tr: 'DÖRDÜNCÜ GÜN', fr: 'QUATRIÈME JOUR' },
          date: { en: 'NOV 9, Sunday', tr: '9 Kasım Pazar', fr: 'Nov 9, Dimanche' },
          sessions: [
            {
              name: { en: 'Day Milonga', tr: 'Gündüz Milongası', fr: 'Milonga de jour' },
              time: '15:00-18:30',
            },
            {
              name: { en: 'Night Milonga', tr: 'Gece Milongası', fr: 'Milonga de la nuit' },
              time: '22:00-04:00',
            },
          ],
        },
      ],
    },
  },
  {
    type: SectionType.ACCOMMODATION,
    order: 3,
    title: 'Accommodation',
    content: {
      title: {
        en: 'ACCOMMODATION',
        tr: 'KONAKLAMA',
        fr: 'LOGEMENT',
      },
      venueName: 'MUKARNAS RESORT & SPA',
      venueUrl: 'https://mukarnashotel.com/',
      rating: {
        en: '5 STARS ULTRA ALL-INCLUSIVE',
        tr: '5 YILDIZLI ULTRA HERŞEY DAHİL',
        fr: '5 ÉTOILES ULTRA TOUT COMPRIS',
      },
      features: [
        {
          en: 'ULTRA ALL-INCLUSIVE (7/24 alcoholic and non-alcoholic drinks, open buffet breakfast, open buffet lunch and dinner, cakes and deserts. Free sandwiches, fruits and refreshments after Midnight at the milonga salon. ALL INCLUDED IN THE PRICE!)',
          tr: 'ULTRA HERŞEY DAHİL (7/24 alkollü ve alkolsüz içecekler, açık büfe kahvaltı, açık büfe öğle ve akşam yemeği, pasta ve tatlılar. Gece yarısından sonra milonga salonunda ücretsiz sandviç, meyve ve içecekler. HER ŞEY FİYATA DAHİL!)',
          fr: 'ULTRA TOUT COMPRIS (boissons alcoolisées et non alcoolisées 24h/24, buffet petit-déjeuner, déjeuner et dîner, gâteaux et desserts. Sandwichs, fruits et rafraîchissements gratuits après minuit au salon de milonga. TOUT COMPRIS DANS LE PRIX!)',
        },
        {
          en: 'There will be transfer from the airport to the hotel and back with very affordable prices.',
          tr: 'Havalimanından otele ve geri dönüş için çok uygun fiyatlarla transfer imkanı olacaktır.',
          fr: "Un transfert aller-retour de l'aéroport à l'hôtel est disponible à des prix très abordables.",
        },
        {
          en: 'It is by the wonderful Mediterranean Sea and has many pools, a sport center and offers various activities.',
          tr: 'Muhteşem Akdeniz kıyısındadır ve birçok havuzu, spor merkezi ve çeşitli aktiviteler sunmaktadır.',
          fr: "Situé au bord de la magnifique mer Méditerranée, l'hôtel dispose de nombreuses piscines, d'un centre sportif et propose diverses activités.",
        },
        {
          en: 'The salon where we will hold our evening milongas is 700 square meter with high ceiling!',
          tr: 'Akşam milongalarımızı düzenleyeceğimiz salon 700 metrekare ve yüksek tavanlı!',
          fr: 'Le salon où se dérouleront nos milongas du soir mesure 700 m² avec un haut plafond!',
        },
      ],
      checkin: {
        en: 'Check-in time is 14:00',
        tr: "Giriş saati 14:00'tür",
        fr: "L'heure d'arrivée (check-in) est à 14:00",
      },
      checkout: {
        en: 'Check-out time is 12:00',
        tr: "Çıkış saati 12:00'dir",
        fr: "L'heure de départ (check-out) est à 12:00",
      },
      images: [
        '/assets/hotel/1.jpg',
        '/assets/hotel/2.jpg',
        '/assets/hotel/3.jpg',
        '/assets/hotel/4.jpg',
        '/assets/hotel/5.jpg',
        '/assets/hotel/6.jpg',
        '/assets/hotel/7.jpg',
        '/assets/hotel/8.jpg',
      ],
    },
  },
  {
    type: SectionType.DJ_TEAM,
    order: 4,
    title: 'DJ Team',
    content: {
      title: {
        en: 'DJ TEAM',
        tr: "DJ'LER",
        fr: 'DJ TEAM',
      },
      djs: [
        { name: 'IRENE MAHNO', country: 'POLAND', photo: '/assets/djs/irene-mahno.png' },
        { name: 'DAVID MANCINI', country: 'ITALY', photo: '/assets/djs/david-mancini.png' },
        { name: 'UGUR AKAR', country: 'TURKEY', photo: '/assets/djs/ugur-akar.png' },
        { name: 'RICARDO FERREIRA', country: 'PORTUGAL', photo: '/assets/djs/ricardo-ferreira.png' },
        { name: 'AGI PORVAI', country: 'HUNGARY', photo: '/assets/djs/agi-porvai.png' },
        { name: 'ORKUN BORAGAN', country: 'TURKEY', photo: '/assets/djs/orkun-boragan.png' },
        { name: 'DJ EFE', country: 'NETHERLANDS', photo: '/assets/djs/dj-efe.png' },
      ],
    },
  },
  {
    type: SectionType.PHOTOGRAPHERS,
    order: 5,
    title: 'Photographers',
    content: {
      title: {
        en: 'PHOTOGRAPHERS',
        tr: 'FOTOĞRAFÇILAR',
        fr: 'PHOTOGRAPHES',
      },
      photographers: [
        { name: 'ÖYKÜM ÇAYIR', photo: '/assets/photographers/oykum-cayir.png' },
        { name: 'ÖZCAN ÖZKAN', photo: '/assets/photographers/ozcan-ozkan.png' },
        { name: 'MARIA TRASKOVSKAYA', photo: '/assets/photographers/maria-traskovskaya.png' },
        { name: 'VERONIKA KORCHAK', photo: '/assets/photographers/veronika-korchak.jpeg' },
      ],
    },
  },
  {
    type: SectionType.PRICING,
    order: 6,
    title: 'Prices',
    content: {
      title: {
        en: 'PRICES',
        tr: 'FİYATLAR',
        fr: 'PRIX',
      },
      notes: [
        {
          en: 'Transfer fee: price will be announced later.',
          tr: 'Transfer ücreti: fiyat daha sonra açıklanacaktır.',
          fr: 'Frais de transfert : le prix sera annoncé ultérieurement.',
        },
        {
          en: 'We will arrange shuttles 24/7. Shuttles every 1.5 or 2 hours apart.',
          tr: '7/24 servis düzenliyoruz. Varışınız için endişelenmeyin.',
          fr: 'Nous organisons des navettes 7/24. Ne vous souciez donc pas de votre arrivée.',
        },
        {
          en: 'Prices include everything: marathon and hotel with all beverages and meals.',
          tr: 'Fiyatlara her şey dahildir: maraton ve otel. (7/24 alkollü ve alkolsüz içecekler...)',
          fr: 'Les prix incluent tout : le marathon et l\'hôtel (boissons alcoolisées et non alcoolisées 7/24...)',
        },
        {
          en: '100 euros deposit required; pay remaining balance at hotel.',
          tr: 'Sizden sadece kredi kartınızla 100 avro depozito ödemenizi istiyoruz.',
          fr: 'Un acompte de 100 euros vous sera demandé par carte bancaire.',
        },
        {
          en: 'No single or two-night bookings accepted.',
          tr: 'Tek gecelik veya iki gecelik kabul yoktur.',
          fr: "Pas d'acceptation pour une ou deux nuits.",
        },
        {
          en: 'Daily milonga access from outside not possible.',
          tr: 'Otel yönetmelikleri nedeniyle milongalara dışarıdan günlük kabul maalesef mümkün değildir.',
          fr: "En raison du règlement de l'hôtel, l'admission quotidienne aux milongas est malheureusement impossible.",
        },
        {
          en: '1st child under 11: free; 2nd child under 11: 50% off',
          tr: '11 yaşından küçük 1. çocuk ücretsizdir. 2. çocuk %50 indirimlidir.',
          fr: 'Le 1er enfant de moins de 11 ans est gratuit. Le 2e enfant bénéficie d\'une réduction de 50 %.',
        },
      ],
      cancellationPolicy: [
        {
          en: 'Full refund before July 1st 2025.',
          tr: "1 Temmuz 2025'ten önce tam iade.",
          fr: 'Remboursement intégral avant le 1er juillet 2025.',
        },
        {
          en: 'For cancellations between August 1 and September 30, 50 euro of your deposit is refunded to you.',
          tr: '1 Ağustos - 30 Eylül arasındaki iptallerde depozitonuzun 50 avrosu size iade edilir.',
          fr: 'Pour toute annulation entre le 1er août et le 30 septembre, 50 euros de votre acompte vous seront remboursés.',
        },
        {
          en: 'After October 1st, no refund.',
          tr: "1 Ekim'den sonra iade yapılmaz.",
          fr: 'Après le 1er octobre, aucun remboursement.',
        },
      ],
    },
  },
  {
    type: SectionType.CONTACT,
    order: 7,
    title: 'Contact',
    content: {
      title: {
        en: 'CONTACT',
        tr: 'İLETİŞİM',
        fr: 'CONTACT',
      },
      social: {
        facebook: 'https://facebook.com/soldeinviernotangomarathon',
        facebookGroup: 'https://facebook.com/groups/569221851539579',
        instagram: '@soldeinviernotangomarathon',
      },
      footer: {
        en: 'ALL RIGHT RESERVED © SOL DE INVIERNO TANGO MARATHON',
        tr: 'TÜM HAKLARI SAKLIDIR © SOL DE INVIERNO TANGO MARATHON',
        fr: 'TOUS LES DROITS SONT RÉSERVÉS © SOL DE INVIERNO TANGO MARATHON',
      },
    },
  },
];

// ============================================
// FORM FIELDS DATA (Multi-language)
// ============================================
const formFields = [
  {
    name: 'dance_experience',
    fieldType: FieldType.SELECT,
    label: "I've been dancing tango for:",
    isRequired: true,
    order: 1,
    labels: {
      en: "I've been dancing tango for:",
      tr: 'Tango dansını ne kadar süredir yapıyorsunuz:',
      fr: "J'ai dansé le tango pour:",
    },
    options: [
      {
        value: 'less_than_1',
        label: { en: 'Less than a year', tr: '1 yıldan az süredir', fr: "Moins d'un an" },
      },
      {
        value: '1_to_3',
        label: { en: '1-3 years', tr: '1-3 yıldır', fr: '1 - 3 ans' },
      },
      {
        value: '3_to_5',
        label: { en: '3-5 years', tr: '3-5 yıldır', fr: '3 - 5 ans' },
      },
      {
        value: '5_plus',
        label: { en: 'More than 5 years', tr: '5 yıldan uzun süredir', fr: 'Plus de 5 ans' },
      },
    ],
  },
  {
    name: 'airport_transfer',
    fieldType: FieldType.CHECKBOX,
    label: 'I need a transfer from ANTALYA AIRPORT to the hotel and back',
    isRequired: false,
    order: 2,
    labels: {
      en: 'I need a transfer from ANTALYA AIRPORT to the hotel and back',
      tr: 'ANTALYA HAVAALANI Otel arası gidiş dönüş transfer istiyorum.',
      fr: "J'ai besoin d'un transfert de l'AÉROPORT D'ANTALYA à l'hôtel et retour",
    },
  },
  {
    name: 'marathon_history',
    fieldType: FieldType.TEXTAREA,
    label: 'Last 3 marathons you participated in',
    isRequired: false,
    order: 3,
    labels: {
      en: 'Last 3 marathons you participated in',
      tr: 'Katıldığınız son 3 marathon',
      fr: 'Les 3 derniers marathons auxquels vous avez participé',
    },
    placeholders: {
      en: 'List the marathons you have attended recently...',
      tr: 'Son katıldığınız maratonları listeleyin...',
      fr: 'Listez les marathons auxquels vous avez récemment participé...',
    },
  },
  {
    name: 'facebook_profile',
    fieldType: FieldType.URL,
    label: 'Your Facebook page link',
    isRequired: false,
    order: 4,
    labels: {
      en: 'Your Facebook page link',
      tr: 'Facebook sayfanızın linki',
      fr: 'Lien vers votre page Facebook',
    },
    placeholders: {
      en: 'https://facebook.com/yourprofile',
      tr: 'https://facebook.com/profiliniz',
      fr: 'https://facebook.com/votreprofil',
    },
  },
  {
    name: 'photo_consent',
    fieldType: FieldType.CHECKBOX,
    label: 'I allow the photos taken at the event to be used on the page.',
    isRequired: false,
    order: 5,
    labels: {
      en: 'I allow the photos taken at the event to be used on the page.',
      tr: 'Etkinlikte çekilen fotoğrafların sayfada kullanılmasına izin veriyorum.',
      fr: "J'autorise l'utilisation des photos prises lors de l'événement sur la page.",
    },
  },
];

// ============================================
// MIGRATION FUNCTION
// ============================================
async function migrate() {
  console.log('🚀 Starting Sol de Invierno migration...\n');

  // 1. Find the event by ID
  const event = await prisma.event.findUnique({
    where: { id: EVENT_ID },
  });

  if (!event) {
    console.error(`❌ Event with ID "${EVENT_ID}" not found!`);
    console.error('Make sure you are connected to the correct database (production).');
    process.exit(1);
  }

  console.log(`✅ Found event: ${event.title} (ID: ${event.id})\n`);

  // 2. Update event details
  console.log('📝 Updating event details...');
  await prisma.event.update({
    where: { id: event.id },
    data: {
      title: 'Sol de Invierno Tango Marathon',
      shortDescription: 'Ultra All-Inclusive Tango Marathon by the Mediterranean Sea',
      description: `ULTRA ALL-INCLUSIVE (7/24 alcoholic and non-alcoholic drinks, open buffet breakfast, open buffet lunch and dinner, cakes and deserts. Free sandwiches, fruits and refreshments after Midnight at the milonga salon. ALL INCLUDED IN THE PRICE!)

There will be transfer from the airport to the hotel and back with very affordable prices.

It is by the wonderful Mediterranean Sea and has many pools, a sport center and offers various activities.

The salon where we will hold our evening milongas is 700 square meter with high ceiling!`,
      city: 'Antalya',
      country: 'Turkey',
      venueName: 'MUKARNAS RESORT & SPA',
      startAt: new Date('2025-11-06'),
      endAt: new Date('2025-11-09'),
      currency: 'EUR',
      djs: [
        'Irene Mahno',
        'David Mancini',
        'Ugur Akar',
        'Ricardo Ferreira',
        'Agi Porvai',
        'Orkun Boragan',
        'DJ Efe',
      ],
      defaultLanguage: 'en',
      availableLanguages: ['en', 'tr', 'fr'],
    },
  });
  console.log('   ✅ Event details updated\n');

  // 3. Delete existing packages, sections, and form fields (clean slate)
  console.log('🗑️  Clearing existing data...');
  await prisma.eventPackage.deleteMany({ where: { eventId: event.id } });
  await prisma.eventPageSection.deleteMany({ where: { eventId: event.id } });
  await prisma.eventFormField.deleteMany({ where: { eventId: event.id } });
  console.log('   ✅ Existing data cleared\n');

  // 4. Create packages
  console.log('📦 Creating packages...');
  for (const pkg of packages) {
    await prisma.eventPackage.create({
      data: {
        eventId: event.id,
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        currency: 'EUR',
        order: pkg.order,
        isActive: true,
      },
    });
    console.log(`   ✅ Package: ${pkg.name} (€${pkg.price / 100})`);
  }
  console.log('');

  // 5. Create page sections
  console.log('🎨 Creating page sections...');
  for (const section of pageSections) {
    await prisma.eventPageSection.create({
      data: {
        eventId: event.id,
        type: section.type,
        order: section.order,
        title: section.title || null,
        content: section.content,
        isVisible: true,
      },
    });
    console.log(`   ✅ Section: ${section.type}`);
  }
  console.log('');

  // 6. Create form fields
  console.log('📝 Creating form fields...');
  for (const field of formFields) {
    await prisma.eventFormField.create({
      data: {
        eventId: event.id,
        fieldType: field.fieldType,
        name: field.name,
        label: field.label,
        isRequired: field.isRequired,
        order: field.order,
        labels: field.labels,
        placeholders: field.placeholders || undefined,
        options: field.options || undefined,
      },
    });
    console.log(`   ✅ Field: ${field.name} (${field.fieldType})`);
  }
  console.log('');

  // 7. Summary
  console.log('═══════════════════════════════════════════');
  console.log('✅ MIGRATION COMPLETE');
  console.log('═══════════════════════════════════════════');
  console.log(`Event: ${event.title}`);
  console.log(`Packages: ${packages.length}`);
  console.log(`Sections: ${pageSections.length}`);
  console.log(`Form Fields: ${formFields.length}`);
  console.log(`Languages: en, tr, fr`);
  console.log('═══════════════════════════════════════════\n');

  console.log('📋 Next Steps:');
  console.log('1. Upload images from sol-de-invierno-assets/ to S3');
  console.log('2. Update image URLs in page sections');
  console.log('3. Set event logo and banner');
  console.log('4. Review and publish the event');
}

// Run migration
migrate()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
