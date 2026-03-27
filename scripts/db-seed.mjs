#!/usr/bin/env node
/**
 * Database Seed Script
 * Creates comprehensive test data for local development
 *
 * Usage:
 *   npm run db:seed          # Seed database
 *   npm run db:seed:clean    # Remove seed data
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Seed data identifiers (used for cleanup)
const SEED_ORG_EMAIL = 'test@4tango.com';
const SEED_EVENT_SLUG = 'summer-tango-festival-2024';

const DANCER_EMAILS = [
  'maria.garcia@example.com',
  'carlos.rodriguez@example.com',
  'anna.mueller@example.com',
  'jean.dupont@example.com',
  'sofia.rossi@example.com',
  'david.smith@example.com',
  'elena.petrov@example.com',
  'lucas.silva@example.com',
  'yuki.tanaka@example.com',
  'ahmed.hassan@example.com',
];

async function seed() {
  console.log('\n🌱 Seeding database...\n');

  // 1. Create Organizer
  console.log('Creating organizer...');
  const passwordHash = await bcrypt.hash('TestPass123', 10);

  const organizer = await prisma.organizer.create({
    data: {
      name: 'Tango Buenos Aires',
      email: SEED_ORG_EMAIL,
      defaultCurrency: 'EUR',
      onboardingCompletedAt: new Date(),
    },
  });

  // 2. Create Organizer User (Owner)
  console.log('Creating organizer user...');
  const organizerUser = await prisma.organizerUser.create({
    data: {
      organizerId: organizer.id,
      email: SEED_ORG_EMAIL,
      fullName: 'Test Organizer',
      role: 'OWNER',
      passwordHash,
    },
  });

  // 3. Create Event
  console.log('Creating event...');
  const eventStartDate = new Date();
  eventStartDate.setMonth(eventStartDate.getMonth() + 2); // 2 months from now

  const eventEndDate = new Date(eventStartDate);
  eventEndDate.setDate(eventEndDate.getDate() + 3); // 3-day event

  const regOpens = new Date();
  regOpens.setMonth(regOpens.getMonth() - 1); // Opened 1 month ago

  const regCloses = new Date(eventStartDate);
  regCloses.setDate(regCloses.getDate() - 7); // Closes 1 week before event

  const event = await prisma.event.create({
    data: {
      organizerId: organizer.id,
      title: 'Summer Tango Festival 2024',
      slug: SEED_EVENT_SLUG,
      shortDescription: 'Three days of pure tango magic in the heart of Europe',
      description: `Join us for the most anticipated tango event of the summer!

Three days of workshops, milongas, and unforgettable moments with world-renowned maestros.

**What to expect:**
- 12 workshops with international teachers
- 3 milongas with live orchestras
- Beautiful venue in the city center
- Tango community from 30+ countries`,
      coverImageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1200',
      city: 'Vienna',
      country: 'Austria',
      venueName: 'Grand Ballroom Vienna',
      address: 'Ringstraße 1, 1010 Wien',
      startAt: eventStartDate,
      endAt: eventEndDate,
      currency: 'EUR',
      priceAmount: 15000, // €150.00
      capacityLimit: 200,
      registrationOpensAt: regOpens,
      registrationClosesAt: regCloses,
      status: 'PUBLISHED',
      djs: ['DJ Tango Master', 'El Pulpo', 'La Milonguera'],
      primaryColor: '#dc2626',
      defaultLanguage: 'en',
      availableLanguages: ['en', 'es', 'de'],
    },
  });

  // 4. Create Page Sections
  console.log('Creating page sections...');
  await prisma.eventPageSection.createMany({
    data: [
      {
        eventId: event.id,
        type: 'HERO',
        order: 1,
        title: 'Summer Tango Festival 2024',
        content: {
          subtitle: 'Vienna, Austria • May 15-18, 2024',
          buttonText: 'Register Now',
          backgroundImage: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1920',
        },
        isVisible: true,
      },
      {
        eventId: event.id,
        type: 'ABOUT',
        order: 2,
        title: 'About the Festival',
        content: {
          text: 'Join us for three days of pure tango magic in the heart of Europe. Experience workshops with world-renowned maestros, unforgettable milongas, and connections that last a lifetime.',
        },
        isVisible: true,
      },
      {
        eventId: event.id,
        type: 'SCHEDULE',
        order: 3,
        title: 'Schedule',
        content: {
          days: [
            {
              date: 'Friday, May 15',
              items: [
                { time: '18:00', title: 'Registration Opens', location: 'Lobby' },
                { time: '19:00', title: 'Welcome Milonga', location: 'Grand Ballroom' },
              ],
            },
            {
              date: 'Saturday, May 16',
              items: [
                { time: '10:00', title: 'Workshop: Musicality', teacher: 'Carlos & Maria' },
                { time: '14:00', title: 'Workshop: Vals', teacher: 'Jean & Sofia' },
                { time: '21:00', title: 'Grand Milonga', location: 'Grand Ballroom' },
              ],
            },
            {
              date: 'Sunday, May 17',
              items: [
                { time: '11:00', title: 'Workshop: Milonga Rhythm', teacher: 'Carlos & Maria' },
                { time: '15:00', title: 'Workshop: Stage Tango', teacher: 'Special Guests' },
                { time: '21:00', title: 'Farewell Milonga', location: 'Grand Ballroom' },
              ],
            },
          ],
        },
        isVisible: true,
      },
      {
        eventId: event.id,
        type: 'DJ_TEAM',
        order: 4,
        title: 'Our DJs',
        content: {
          djs: [
            { name: 'DJ Tango Master', bio: '20 years of experience', imageUrl: null },
            { name: 'El Pulpo', bio: 'Traditional and nuevo', imageUrl: null },
            { name: 'La Milonguera', bio: 'Golden age specialist', imageUrl: null },
          ],
        },
        isVisible: true,
      },
      {
        eventId: event.id,
        type: 'PRICING',
        order: 5,
        title: 'Packages',
        content: {
          description: 'Choose the package that suits you best',
        },
        isVisible: true,
      },
      {
        eventId: event.id,
        type: 'CONTACT',
        order: 6,
        title: 'Contact Us',
        content: {
          email: 'info@summertango.com',
          phone: '+43 1 234 5678',
          instagram: '@summertangofestival',
        },
        isVisible: true,
      },
    ],
  });

  // 5. Create Packages
  console.log('Creating packages...');
  await prisma.eventPackage.createMany({
    data: [
      {
        eventId: event.id,
        name: 'Full Pass',
        description: 'All workshops + all milongas + welcome dinner',
        price: 15000,
        currency: 'EUR',
        capacity: 150,
        order: 1,
        isActive: true,
      },
      {
        eventId: event.id,
        name: 'Milonga Only',
        description: 'All milongas only (no workshops)',
        price: 8000,
        currency: 'EUR',
        capacity: 50,
        order: 2,
        isActive: true,
      },
      {
        eventId: event.id,
        name: 'Saturday Day Pass',
        description: 'All Saturday workshops + Saturday milonga',
        price: 6000,
        currency: 'EUR',
        capacity: null,
        order: 3,
        isActive: true,
      },
    ],
  });

  // 6. Create Custom Form Fields
  console.log('Creating form fields...');
  await prisma.eventFormField.createMany({
    data: [
      {
        eventId: event.id,
        fieldType: 'SELECT',
        name: 'experience_level',
        label: 'Experience Level',
        placeholder: 'Select your level',
        isRequired: true,
        order: 1,
        options: [
          { value: 'beginner', label: 'Beginner (< 1 year)' },
          { value: 'intermediate', label: 'Intermediate (1-3 years)' },
          { value: 'advanced', label: 'Advanced (3-5 years)' },
          { value: 'professional', label: 'Professional (5+ years)' },
        ],
      },
      {
        eventId: event.id,
        fieldType: 'TEXT',
        name: 'partner_name',
        label: 'Partner Name (if any)',
        placeholder: 'Enter your partner\'s name',
        helpText: 'Leave empty if you are registering alone',
        isRequired: false,
        order: 2,
      },
      {
        eventId: event.id,
        fieldType: 'SELECT',
        name: 'tshirt_size',
        label: 'T-Shirt Size',
        placeholder: 'Select size',
        helpText: 'All participants receive a festival t-shirt',
        isRequired: true,
        order: 3,
        options: [
          { value: 'xs', label: 'XS' },
          { value: 's', label: 'S' },
          { value: 'm', label: 'M' },
          { value: 'l', label: 'L' },
          { value: 'xl', label: 'XL' },
          { value: 'xxl', label: 'XXL' },
        ],
      },
      {
        eventId: event.id,
        fieldType: 'CHECKBOX',
        name: 'dietary_restrictions',
        label: 'Dietary Restrictions',
        isRequired: false,
        order: 4,
        options: [
          { value: 'vegetarian', label: 'Vegetarian' },
          { value: 'vegan', label: 'Vegan' },
          { value: 'gluten_free', label: 'Gluten-free' },
          { value: 'halal', label: 'Halal' },
        ],
      },
      {
        eventId: event.id,
        fieldType: 'TEXTAREA',
        name: 'special_requests',
        label: 'Special Requests or Notes',
        placeholder: 'Any special requirements or notes for the organizers',
        isRequired: false,
        order: 5,
      },
    ],
  });

  // 7. Create Dancers and Registrations
  console.log('Creating dancers and registrations...');
  const statuses = [
    'REGISTERED',
    'APPROVED',
    'CONFIRMED',
    'CONFIRMED',
    'CONFIRMED',
    'WAITLIST',
    'PENDING_REVIEW',
    'REJECTED',
    'CANCELLED',
    'CHECKED_IN',
  ];

  const paymentStatuses = [
    'UNPAID',
    'PENDING',
    'PAID',
    'PAID',
    'PAID',
    'UNPAID',
    'UNPAID',
    'UNPAID',
    'REFUNDED',
    'PAID',
  ];

  const roles = ['LEADER', 'FOLLOWER', 'SWITCH', 'FOLLOWER', 'LEADER', 'SWITCH', 'FOLLOWER', 'LEADER', 'FOLLOWER', 'LEADER'];

  const countries = ['Spain', 'Mexico', 'Germany', 'France', 'Italy', 'UK', 'Russia', 'Brazil', 'Japan', 'Egypt'];
  const cities = ['Madrid', 'Mexico City', 'Berlin', 'Paris', 'Rome', 'London', 'Moscow', 'São Paulo', 'Tokyo', 'Cairo'];

  for (let i = 0; i < DANCER_EMAILS.length; i++) {
    const email = DANCER_EMAILS[i];
    const nameParts = email.split('@')[0].replace('.', ' ').split(' ');
    const fullName = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

    const dancer = await prisma.dancer.create({
      data: {
        email,
        passwordHash: await bcrypt.hash('TestPass123', 10),
        fullName,
        role: roles[i],
        city: cities[i],
        country: countries[i],
        emailVerified: true,
      },
    });

    await prisma.registration.create({
      data: {
        eventId: event.id,
        dancerId: dancer.id,
        fullNameSnapshot: fullName,
        emailSnapshot: email,
        roleSnapshot: roles[i],
        citySnapshot: cities[i],
        countrySnapshot: countries[i],
        experience: ['beginner', 'intermediate', 'advanced', 'professional'][i % 4],
        registrationStatus: statuses[i],
        paymentStatus: paymentStatuses[i],
        paymentAmount: paymentStatuses[i] === 'PAID' ? 15000 : null,
      },
    });
  }

  // 8. Create Email Template
  console.log('Creating email templates...');
  await prisma.emailTemplate.create({
    data: {
      organizerId: organizer.id,
      name: 'Registration Confirmation',
      subject: 'Welcome to {eventName}!',
      htmlContent: `
<h1>Welcome to {eventName}!</h1>
<p>Dear {dancerName},</p>
<p>Thank you for registering for our event. We are excited to have you!</p>
<p>Event Details:</p>
<ul>
  <li><strong>Event:</strong> {eventName}</li>
  <li><strong>Date:</strong> {eventDate}</li>
</ul>
<p>See you on the dance floor!</p>
<p>Best regards,<br>{organizerName}</p>
      `.trim(),
      variables: [
        { name: 'dancerName', description: 'Full name of the dancer' },
        { name: 'eventName', description: 'Name of the event' },
        { name: 'eventDate', description: 'Event start date' },
        { name: 'organizerName', description: 'Organization name' },
      ],
      language: 'en',
      isActive: true,
    },
  });

  // 9. Create Dancer Tags
  console.log('Creating dancer tags...');
  const vipTag = await prisma.dancerTag.create({
    data: {
      organizerId: organizer.id,
      name: 'VIP',
      color: '#EAB308',
    },
  });

  const returningTag = await prisma.dancerTag.create({
    data: {
      organizerId: organizer.id,
      name: 'Returning Guest',
      color: '#22C55E',
    },
  });

  // Assign tags to some dancers
  const dancers = await prisma.dancer.findMany({ where: { email: { in: DANCER_EMAILS.slice(0, 3) } } });
  for (const dancer of dancers) {
    await prisma.dancerTagAssignment.create({
      data: {
        dancerId: dancer.id,
        tagId: dancer.email === DANCER_EMAILS[0] ? vipTag.id : returningTag.id,
      },
    });
  }

  // Summary
  console.log('\n✅ Database seeded successfully!\n');
  console.log('📊 Created:');
  console.log('   • 1 Organizer (test@4tango.com / Test1234!)');
  console.log('   • 1 Event (summer-tango-festival-2024)');
  console.log('   • 6 Page sections');
  console.log('   • 3 Packages');
  console.log('   • 5 Custom form fields');
  console.log('   • 10 Dancers with registrations');
  console.log('   • 1 Email template');
  console.log('   • 2 Dancer tags with assignments');
  console.log('\n🔑 Login credentials:');
  console.log('   Email: test@4tango.com');
  console.log('   Password: TestPass123');
  console.log('\n🌐 Event URL: /en/summer-tango-festival-2024');
  console.log('');
}

async function clean() {
  console.log('\n🧹 Cleaning seed data...\n');

  // Delete in reverse order of dependencies
  console.log('Removing dancers and registrations...');
  await prisma.dancer.deleteMany({
    where: { email: { in: DANCER_EMAILS } },
  });

  console.log('Removing organizer and related data...');
  await prisma.organizer.deleteMany({
    where: { email: SEED_ORG_EMAIL },
  });

  console.log('\n✅ Seed data cleaned!\n');
}

// Main
const command = process.argv[2];

try {
  if (command === 'clean') {
    await clean();
  } else {
    // Check if seed data already exists
    const existingOrg = await prisma.organizer.findUnique({
      where: { email: SEED_ORG_EMAIL },
    });

    if (existingOrg) {
      console.log('\n⚠️  Seed data already exists. Run "npm run db:seed:clean" first to remove it.\n');
      process.exit(1);
    }

    await seed();
  }
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error(error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
