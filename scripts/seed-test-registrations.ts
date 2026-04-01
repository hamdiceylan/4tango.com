import { PrismaClient, RegistrationStatus, PaymentStatus, DancerRole } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const FIRST_NAMES = [
  "Sofia", "Valentina", "Camila", "Lucia", "Maria", "Isabella", "Emma", "Olivia", "Mia", "Luna",
  "Martina", "Victoria", "Catalina", "Elena", "Julia", "Natalia", "Paula", "Carolina", "Andrea", "Laura",
  "Santiago", "Mateo", "Sebastian", "Matias", "Nicolas", "Alejandro", "Lucas", "Benjamin", "Daniel", "Diego",
  "Gabriel", "Pablo", "Martin", "Carlos", "Jorge", "Fernando", "Andres", "Ricardo", "Miguel", "Rafael",
  "Ana", "Carmen", "Rosa", "Pilar", "Teresa", "Dolores", "Mercedes", "Josefa", "Francisca", "Antonia",
  "Hans", "Klaus", "Stefan", "Wolfgang", "Jürgen", "Dieter", "Peter", "Thomas", "Michael", "Andreas",
  "Pierre", "Jean", "François", "Michel", "Philippe", "Jacques", "Alain", "Bernard", "Claude", "Henri",
  "Giovanni", "Marco", "Giuseppe", "Francesco", "Antonio", "Alessandro", "Andrea", "Luca", "Matteo", "Lorenzo",
  "Piotr", "Krzysztof", "Andrzej", "Jan", "Stanisław", "Tomasz", "Paweł", "Michał", "Marcin", "Marek",
  "Mehmet", "Ahmet", "Mustafa", "Ali", "Hüseyin", "Hasan", "İbrahim", "Ömer", "Yusuf", "Murat",
];

const LAST_NAMES = [
  "García", "Rodriguez", "Martinez", "Lopez", "Gonzalez", "Hernandez", "Perez", "Sanchez", "Ramirez", "Torres",
  "Flores", "Rivera", "Gomez", "Diaz", "Reyes", "Morales", "Jimenez", "Ruiz", "Ortiz", "Silva",
  "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann",
  "Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau",
  "Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco",
  "Nowak", "Kowalski", "Wiśniewski", "Wójcik", "Kowalczyk", "Kamiński", "Lewandowski", "Zieliński", "Szymański", "Woźniak",
  "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Yıldırım", "Öztürk", "Aydın", "Özdemir",
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson", "Moore", "Taylor",
];

const COUNTRIES = [
  "Argentina", "Germany", "France", "Italy", "Spain", "Turkey", "Poland", "United States", "United Kingdom", "Brazil",
  "Netherlands", "Belgium", "Switzerland", "Austria", "Russia", "Japan", "Australia", "Canada", "Mexico", "Chile",
  "Uruguay", "Colombia", "Portugal", "Greece", "Sweden", "Norway", "Denmark", "Finland", "Czech Republic", "Hungary",
];

const CITIES: Record<string, string[]> = {
  "Argentina": ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata"],
  "Germany": ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"],
  "France": ["Paris", "Lyon", "Marseille", "Toulouse", "Nice"],
  "Italy": ["Rome", "Milan", "Naples", "Turin", "Florence"],
  "Spain": ["Madrid", "Barcelona", "Valencia", "Seville", "Bilbao"],
  "Turkey": ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya"],
  "Poland": ["Warsaw", "Krakow", "Lodz", "Wroclaw", "Poznan"],
  "United States": ["New York", "Los Angeles", "Chicago", "San Francisco", "Miami"],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Edinburgh", "Bristol"],
  "Brazil": ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza"],
  "Netherlands": ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"],
  "Belgium": ["Brussels", "Antwerp", "Ghent", "Bruges", "Liège"],
  "Switzerland": ["Zurich", "Geneva", "Basel", "Bern", "Lausanne"],
  "Austria": ["Vienna", "Salzburg", "Innsbruck", "Graz", "Linz"],
  "Russia": ["Moscow", "St. Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan"],
  "Japan": ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya"],
  "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  "Canada": ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
  "Mexico": ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana"],
  "Chile": ["Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta"],
  "Uruguay": ["Montevideo", "Salto", "Paysandú", "Las Piedras", "Rivera"],
  "Colombia": ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena"],
  "Portugal": ["Lisbon", "Porto", "Braga", "Coimbra", "Faro"],
  "Greece": ["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa"],
  "Sweden": ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås"],
  "Norway": ["Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen"],
  "Denmark": ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg"],
  "Finland": ["Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu"],
  "Czech Republic": ["Prague", "Brno", "Ostrava", "Plzeň", "Liberec"],
  "Hungary": ["Budapest", "Debrecen", "Szeged", "Miskolc", "Pécs"],
};

const ROLES: DancerRole[] = ["LEADER", "FOLLOWER"];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "protonmail.com", "icloud.com"];
  const cleanFirst = firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const cleanLast = lastName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const rand = randomInt(1, 999);
  return `${cleanFirst}.${cleanLast}${rand}@${randomElement(domains)}`;
}

function getWeightedStatus(): RegistrationStatus {
  // More realistic distribution
  const weights: [RegistrationStatus, number][] = [
    ["CONFIRMED", 35],
    ["APPROVED", 20],
    ["REGISTERED", 15],
    ["PENDING_REVIEW", 10],
    ["WAITLIST", 8],
    ["CANCELLED", 5],
    ["REJECTED", 4],
    ["CHECKED_IN", 3],
  ];

  const total = weights.reduce((sum, [, w]) => sum + w, 0);
  let rand = Math.random() * total;

  for (const [status, weight] of weights) {
    rand -= weight;
    if (rand <= 0) return status;
  }
  return "REGISTERED";
}

function getPaymentStatusForRegistration(regStatus: RegistrationStatus): PaymentStatus {
  // Payment status should make sense with registration status
  if (regStatus === "CONFIRMED" || regStatus === "CHECKED_IN") {
    return Math.random() > 0.1 ? "PAID" : "PARTIALLY_PAID";
  }
  if (regStatus === "APPROVED") {
    const r = Math.random();
    if (r < 0.4) return "PAID";
    if (r < 0.6) return "PARTIALLY_PAID";
    if (r < 0.8) return "PENDING";
    return "UNPAID";
  }
  if (regStatus === "CANCELLED" || regStatus === "REJECTED") {
    return Math.random() > 0.7 ? "REFUNDED" : "UNPAID";
  }
  if (regStatus === "WAITLIST") {
    return "UNPAID";
  }
  // REGISTERED, PENDING_REVIEW
  const r = Math.random();
  if (r < 0.3) return "UNPAID";
  if (r < 0.5) return "PENDING";
  if (r < 0.7) return "PAID";
  return "PARTIALLY_PAID";
}

function randomDate(daysAgo: number): Date {
  const now = new Date();
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const randomTime = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(randomTime);
}

async function main() {
  const eventId = "cmn9gge740004bt2msnwa8lu9";

  // Verify event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { organizer: true },
  });

  if (!event) {
    console.error(`Event ${eventId} not found!`);
    process.exit(1);
  }

  console.log(`Creating registrations for event: ${event.title}`);
  console.log(`Organizer ID: ${event.organizerId}`);

  const COUNT = 260;

  // Track role balance (aim for roughly 50/50)
  let leaderCount = 0;
  let followerCount = 0;
  let createdCount = 0;

  const statusCounts: Record<string, number> = {};
  const paymentCounts: Record<string, number> = {};

  for (let i = 0; i < COUNT; i++) {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const email = generateEmail(firstName, lastName);
    const country = randomElement(COUNTRIES);
    const cities = CITIES[country] || ["Unknown"];
    const city = randomElement(cities);

    // Balance roles
    let role: DancerRole;
    if (leaderCount < followerCount - 10) {
      role = "LEADER";
    } else if (followerCount < leaderCount - 10) {
      role = "FOLLOWER";
    } else {
      role = randomElement(ROLES);
    }

    if (role === "LEADER") leaderCount++;
    else followerCount++;

    const registrationStatus = getWeightedStatus();
    const paymentStatus = getPaymentStatusForRegistration(registrationStatus);

    statusCounts[registrationStatus] = (statusCounts[registrationStatus] || 0) + 1;
    paymentCounts[paymentStatus] = (paymentCounts[paymentStatus] || 0) + 1;

    // Payment amount (in cents) - varies by status
    let paymentAmount: number | null = null;
    if (paymentStatus === "PAID") {
      paymentAmount = randomElement([15000, 18000, 20000, 25000, 30000]); // €150-300
    } else if (paymentStatus === "PARTIALLY_PAID") {
      paymentAmount = randomElement([5000, 7500, 10000, 12500]); // €50-125
    } else if (paymentStatus === "PENDING") {
      paymentAmount = randomElement([15000, 18000, 20000]); // Pending full amount
    }

    const createdAt = randomDate(90); // Within last 90 days

    try {
      // Create dancer first (or find existing)
      let dancer = await prisma.dancer.findUnique({
        where: { email },
      });

      if (!dancer) {
        dancer = await prisma.dancer.create({
          data: {
            fullName,
            email,
            role,
            city,
            country,
            createdAt,
            updatedAt: createdAt,
          },
        });
      }

      // Create registration linked to dancer
      await prisma.registration.create({
        data: {
          eventId,
          dancerId: dancer.id,
          fullNameSnapshot: fullName,
          emailSnapshot: email,
          roleSnapshot: role,
          citySnapshot: city,
          countrySnapshot: country,
          registrationStatus,
          paymentStatus,
          paymentAmount,
          accessToken: randomUUID(),
          createdAt,
          updatedAt: createdAt,
        },
      });

      createdCount++;

      if ((createdCount) % 50 === 0) {
        console.log(`Created ${createdCount}/${COUNT} registrations...`);
      }
    } catch (error) {
      // Skip duplicates or errors
      console.error(`Error creating registration ${i + 1}:`, error);
    }
  }

  console.log(`\nCreated ${createdCount} registrations!`);
  console.log(`Leaders: ${leaderCount}, Followers: ${followerCount}`);

  console.log("\nRegistration Status Distribution:");
  for (const [status, count] of Object.entries(statusCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${status}: ${count}`);
  }

  console.log("\nPayment Status Distribution:");
  for (const [status, count] of Object.entries(paymentCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${status}: ${count}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
