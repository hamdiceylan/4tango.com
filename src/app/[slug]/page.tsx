"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { isReservedSlug } from "@/lib/reserved-slugs";

// Sol de Invierno Tango Marathon - Sample Event Data
const mockEvent = {
  id: "1",
  title: "Sol de Invierno Tango Marathon",
  slug: "sol-de-invierno-2025",
  startDate: "November 7, 2025",
  endDate: "November 11, 2025",
  city: "Antalya",
  country: "Turkey",
  venueName: "Mukarnas Resort & Spa",
  organizer: {
    name: "Sol de Invierno",
    email: "info@inviernotangomarathon.com",
  },
};

// Schedule in tab format like original
const schedule = [
  {
    label: "FIRST DAY",
    day: "Friday",
    date: "7 November",
    items: [
      { time: "14:00", title: "Check-in" },
      { time: "22:00 - 05:00", title: "Opening Milonga" },
    ],
  },
  {
    label: "SECOND DAY",
    day: "Saturday",
    date: "8 November",
    items: [
      { time: "15:00 - 19:00", title: "Afternoon Milonga" },
      { time: "22:00 - 05:00", title: "Night Milonga" },
    ],
  },
  {
    label: "THIRD DAY",
    day: "Sunday",
    date: "9 November",
    items: [
      { time: "15:00 - 19:00", title: "Afternoon Milonga" },
      { time: "22:00 - 05:00", title: "Night Milonga" },
    ],
  },
  {
    label: "LAST DAY",
    day: "Monday",
    date: "10 November",
    items: [
      { time: "15:00 - 19:00", title: "Afternoon Milonga" },
      { time: "22:00 - 05:00", title: "Closing Milonga" },
      { time: "12:00 (Next day)", title: "Check-out" },
    ],
  },
];

// Country flags mapping
const countryFlags: Record<string, string> = {
  "Poland": "🇵🇱",
  "Italy": "🇮🇹",
  "Turkey": "🇹🇷",
  "Portugal": "🇵🇹",
  "Hungary": "🇭🇺",
  "Netherlands": "🇳🇱",
};

const djTeam = [
  { name: "Irene Mahno", country: "Poland", photo: "https://www.inviernotangomarathon.com/image/alan/_67e3e0a192f86.png" },
  { name: "David Mancini", country: "Italy", photo: "https://www.inviernotangomarathon.com/image/alan/_67e3e39d02966.png" },
  { name: "Ugur Akar", country: "Turkey", photo: "https://www.inviernotangomarathon.com/image/alan/_67e3e1a80b7ba.png" },
  { name: "Ricardo Ferreira", country: "Portugal", photo: "https://www.inviernotangomarathon.com/image/alan/_67e3e24a45d53.png" },
  { name: "Agi Porvai", country: "Hungary", photo: "https://www.inviernotangomarathon.com/image/alan/_67e3e32024682.png" },
  { name: "Orkun Boragan", country: "Turkey", photo: "https://www.inviernotangomarathon.com/image/alan/_67e3e22b28c91.png" },
  { name: "DJ Efe", country: "Netherlands", photo: "https://www.inviernotangomarathon.com/image/alan/_67e54162b7378.png" },
];

const photographers = [
  { name: "Öyküm Çayır", country: "Turkey", photo: "https://www.inviernotangomarathon.com/image/alan/_67e3e513db8b1.png" },
  { name: "Özcan Özkan", country: "Turkey", photo: "https://www.inviernotangomarathon.com/image/alan/_67e3e5409f94e.png" },
  { name: "Maria Traskovskaya", country: "Russia", photo: "https://www.inviernotangomarathon.com/image/alan/_67e3f461047df.png" },
  { name: "Veronika Korchak", country: "Ukraine", photo: "https://www.inviernotangomarathon.com/image/alan/_688a25f09fd45.jpeg" },
];

const hotelImages = [
  "https://www.inviernotangomarathon.com/assets/hotel/1.jpg",
  "https://www.inviernotangomarathon.com/assets/hotel/2.jpg",
  "https://www.inviernotangomarathon.com/assets/hotel/3.jpg",
  "https://www.inviernotangomarathon.com/assets/hotel/4.jpg",
  "https://www.inviernotangomarathon.com/assets/hotel/5.jpg",
  "https://www.inviernotangomarathon.com/assets/hotel/6.jpg",
  "https://www.inviernotangomarathon.com/assets/hotel/7.jpg",
  "https://www.inviernotangomarathon.com/assets/hotel/8.jpg",
];

// Hero slider - use actual sunset ocean images
const heroSliderImages = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80", // Beach sunset
  "https://images.unsplash.com/photo-1476673160081-cf065bc4cecf?w=1920&q=80", // Ocean sunset orange
  "https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=1920&q=80", // Beach waves sunset
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80", // Ocean calm sunset
];

const accommodation = {
  name: "Mukarnas Resort & Spa",
  rating: "5 STARS ULTRA ALL-INCLUSIVE",
  description: "Experience luxury on the Mediterranean coast. Our milonga salon features 700 square meters of premium dance floor with high ceilings, perfect for tango.",
  features: [
    "24/7 Alcoholic & Non-Alcoholic Drinks",
    "Open Buffet Breakfast, Lunch & Dinner",
    "Cakes & Desserts",
    "Late-Night Refreshments at Milongas",
    "Mediterranean Beachfront",
    "Multiple Pools",
    "Spa & Wellness Center",
    "700m² Milonga Salon",
  ],
  checkIn: "14:00",
  checkOut: "12:00",
};

const packages = [
  { id: "pkg1", name: "DOUBLE ROOM", nights: "4 Nights", description: "ULTRA ALL INCLUSIVE", price: 420 },
  { id: "pkg2", name: "DOUBLE ROOM", nights: "3 Nights", description: "ULTRA ALL INCLUSIVE", price: 360 },
  { id: "pkg3", name: "SINGLE ROOM", nights: "4 Nights", description: "ULTRA ALL INCLUSIVE", price: 675 },
  { id: "pkg4", name: "SINGLE ROOM", nights: "3 Nights", description: "ULTRA ALL INCLUSIVE", price: 570 },
];

const navLinks = [
  { href: "#program", label: "PROGRAM" },
  { href: "#accommodation", label: "ACCOMMODATION" },
  { href: "#djs", label: "DJ TEAM" },
  { href: "#prices", label: "PRICES" },
  { href: "#register", label: "REGISTRATION" },
];

export default function PublicEventPage({ params }: { params: { slug: string } }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [hotelSlide, setHotelSlide] = useState(0);

  // Auto-advance hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (isReservedSlug(params.slug)) {
    notFound();
  }

  const event = mockEvent;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Transparent */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <Link href={`/${event.slug}`} className="flex items-center">
              <img
                src="https://www.inviernotangomarathon.com/assets/images/logo.png"
                alt="Sol de Invierno"
                className="h-10 w-auto"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-white hover:text-[#e85a2c] font-medium text-sm tracking-wide transition drop-shadow-md"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 text-white text-sm drop-shadow-md">
                <span className="cursor-pointer hover:text-[#e85a2c]">EN</span>
                <span>|</span>
                <span className="cursor-pointer hover:text-[#e85a2c]">TR</span>
              </div>
              <div className="flex items-center gap-2">
                <a href="#" className="text-white hover:text-[#e85a2c] transition drop-shadow-md">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="text-white hover:text-[#e85a2c] transition drop-shadow-md">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
              <button className="lg:hidden text-white p-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background slider */}
        <div className="absolute inset-0">
          {heroSliderImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="mb-6">
            <img
              src="https://www.inviernotangomarathon.com/assets/images/logo.png"
              alt="Sol de Invierno"
              className="h-24 md:h-32 w-auto mx-auto drop-shadow-lg"
            />
          </div>

          {/* Feature text with shadow */}
          <div className="text-white text-base md:text-lg mb-6 leading-loose drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            <p>All milongas</p>
            <p>All accommodations</p>
            <p>Hotel restaurants and bars 24/7</p>
            <p>All hotel facilities</p>
            <p>Food and beverages during milonga</p>
            <p>at the milonga salon</p>
          </div>

          <p className="text-white text-lg md:text-xl font-medium mb-8 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            All for 4 Nights 5 Days - <span className="font-bold">420 Euro per person</span>
          </p>

          <Link
            href={`/${event.slug}/register`}
            className="inline-block bg-[#e85a2c] hover:bg-[#d14a1c] text-white px-10 py-4 font-bold text-lg tracking-wide transition-all shadow-lg rounded-sm border-2 border-[#e85a2c] hover:border-[#d14a1c]"
          >
            REGISTER NOW!
          </Link>
        </div>
      </section>

      {/* Program Section - Horizontal Tabs */}
      <section id="program" className="py-16 px-4 bg-white scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-normal text-[#1a1a2e] mb-3 tracking-wide">PROGRAM</h2>
            <div className="w-12 h-0.5 bg-[#e85a2c] mx-auto"></div>
          </div>

          {/* Horizontal Tabs */}
          <div className="flex justify-center mb-6">
            {schedule.map((day, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-3 font-semibold text-sm tracking-wide transition-all ${
                  activeTab === index
                    ? "bg-[#e85a2c] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } ${index === 0 ? "rounded-l" : ""} ${index === schedule.length - 1 ? "rounded-r" : ""}`}
              >
                {day.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="text-center mb-4">
              <p className="text-[#e85a2c] font-semibold">{schedule[activeTab].day}</p>
              <p className="text-gray-500 text-sm">{schedule[activeTab].date}</p>
            </div>
            <div className="space-y-4">
              {schedule[activeTab].items.map((item, i) => (
                <div key={i} className="flex justify-center gap-4 items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-[#e85a2c] font-semibold w-32 text-right">{item.time}</span>
                  <span className="text-[#1a1a2e] font-medium w-48">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Accommodation Section */}
      <section id="accommodation" className="py-16 px-4 bg-white scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-normal text-[#1a1a2e] mb-3 tracking-wide">ACCOMMODATION</h2>
            <div className="flex justify-center gap-0.5 mb-3">
              {[1,2,3,4,5].map(i => (
                <svg key={i} className="w-4 h-4 text-[#e85a2c]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <h3 className="text-xl font-semibold text-[#1a1a2e] mb-1">{accommodation.name}</h3>
            <p className="text-[#e85a2c] text-sm tracking-wider font-medium">{accommodation.rating}</p>
          </div>

          {/* Image Carousel */}
          <div className="relative mb-10">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500"
                style={{ transform: `translateX(-${hotelSlide * 100}%)` }}
              >
                {hotelImages.map((img, i) => (
                  <div key={i} className="w-full flex-shrink-0">
                    <img
                      src={img}
                      alt={`Hotel ${i + 1}`}
                      className="w-full h-80 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Carousel Arrows */}
            <button
              onClick={() => setHotelSlide((prev) => (prev - 1 + hotelImages.length) % hotelImages.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setHotelSlide((prev) => (prev + 1) % hotelImages.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {hotelImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHotelSlide(i)}
                  className={`w-2 h-2 rounded-full transition ${hotelSlide === i ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <p className="text-gray-600 text-center mb-6 text-sm leading-relaxed">
              {accommodation.description}
            </p>

            <ul className="text-gray-700 text-sm space-y-1 mb-6">
              {accommodation.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-[#e85a2c]">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex justify-center gap-8 text-gray-600 text-sm">
              <p><strong>Check-in time is {accommodation.checkIn}</strong></p>
              <p><strong>Check-out time is {accommodation.checkOut}</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* DJ Team Section */}
      <section id="djs" className="relative py-16 px-4 scroll-mt-16 overflow-hidden">
        {/* Colorful galaxy background like original */}
        <div className="absolute inset-0">
          {/* Base dark blue */}
          <div className="absolute inset-0 bg-[#0a0a1a]"></div>
          {/* Colorful nebula gradients */}
          <div className="absolute inset-0 opacity-60" style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 20%, rgba(120, 40, 200, 0.4), transparent),
              radial-gradient(ellipse 60% 40% at 80% 30%, rgba(200, 80, 50, 0.3), transparent),
              radial-gradient(ellipse 50% 60% at 50% 80%, rgba(30, 60, 150, 0.4), transparent),
              radial-gradient(ellipse 70% 50% at 70% 60%, rgba(180, 60, 120, 0.3), transparent)
            `
          }}></div>
          {/* Stars layer */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(2px 2px at 20px 30px, white, transparent),
                              radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
                              radial-gradient(1px 1px at 90px 40px, white, transparent),
                              radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.9), transparent),
                              radial-gradient(1px 1px at 230px 80px, white, transparent),
                              radial-gradient(2px 2px at 300px 150px, rgba(255,255,255,0.7), transparent),
                              radial-gradient(1px 1px at 370px 60px, white, transparent),
                              radial-gradient(2px 2px at 450px 180px, rgba(255,255,255,0.8), transparent),
                              radial-gradient(1px 1px at 520px 100px, white, transparent),
                              radial-gradient(2px 2px at 600px 50px, rgba(255,255,255,0.9), transparent),
                              radial-gradient(1px 1px at 680px 130px, white, transparent),
                              radial-gradient(2px 2px at 750px 70px, rgba(255,255,255,0.8), transparent)`,
            backgroundSize: '800px 180px'
          }}></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-normal text-white mb-3 tracking-wide">DJ TEAM</h2>
            <div className="w-12 h-0.5 bg-[#d4a853] mx-auto"></div>
          </div>

          {/* 4 + 3 grid layout like original */}
          <div className="flex flex-wrap justify-center gap-6">
            {djTeam.map((dj, index) => (
              <div key={index} className="text-center" style={{ width: '180px' }}>
                {/* Circular photo with thick gold ring */}
                <div className="relative mx-auto w-44 h-44 mb-3">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#d4a853] via-[#f0d68a] to-[#b8962d] p-1.5">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a20] relative">
                      <img
                        src={dj.photo}
                        alt={dj.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Logo overlay inside frame */}
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                        <img
                          src="https://www.inviernotangomarathon.com/assets/images/logo.png"
                          alt=""
                          className="h-6 w-auto opacity-90"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="font-medium text-white text-sm mb-0.5">{dj.name}</h3>
                <p className="text-[#d4a853] text-xs flex items-center justify-center gap-1">
                  <span>{countryFlags[dj.country] || ""}</span>
                  <span>{dj.country.toUpperCase()}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photographers Section */}
      <section className="relative py-16 px-4 scroll-mt-16 overflow-hidden">
        {/* Same colorful galaxy background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#0a0a1a]"></div>
          <div className="absolute inset-0 opacity-60" style={{
            background: `
              radial-gradient(ellipse 70% 50% at 30% 70%, rgba(120, 40, 200, 0.4), transparent),
              radial-gradient(ellipse 50% 40% at 70% 20%, rgba(200, 80, 50, 0.3), transparent),
              radial-gradient(ellipse 60% 50% at 80% 70%, rgba(30, 60, 150, 0.4), transparent)
            `
          }}></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(2px 2px at 50px 50px, white, transparent),
                              radial-gradient(1px 1px at 100px 100px, rgba(255,255,255,0.8), transparent),
                              radial-gradient(2px 2px at 200px 60px, white, transparent),
                              radial-gradient(1px 1px at 300px 140px, rgba(255,255,255,0.9), transparent),
                              radial-gradient(1px 1px at 400px 80px, white, transparent),
                              radial-gradient(2px 2px at 500px 120px, rgba(255,255,255,0.7), transparent)`,
            backgroundSize: '550px 160px'
          }}></div>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-normal text-white mb-3 tracking-wide">PHOTOGRAPHERS</h2>
            <div className="w-12 h-0.5 bg-[#d4a853] mx-auto"></div>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {photographers.map((photographer, index) => (
              <div key={index} className="text-center" style={{ width: '180px' }}>
                <div className="relative mx-auto w-44 h-44 mb-3">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#d4a853] via-[#f0d68a] to-[#b8962d] p-1.5">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a20] relative">
                      <img
                        src={photographer.photo}
                        alt={photographer.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                        <img
                          src="https://www.inviernotangomarathon.com/assets/images/logo.png"
                          alt=""
                          className="h-6 w-auto opacity-90"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="font-medium text-white text-sm mb-0.5">{photographer.name}</h3>
                <p className="text-[#d4a853] text-xs flex items-center justify-center gap-1">
                  <span>{countryFlags[photographer.country] || ""}</span>
                  <span>{photographer.country?.toUpperCase()}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prices Section - No shadows, simpler style */}
      <section id="prices" className="py-16 px-4 bg-white scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-normal text-[#1a1a2e] mb-3 tracking-wide">PRICES</h2>
            <div className="w-12 h-0.5 bg-[#e85a2c] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="border border-gray-200 text-center p-6">
                <h3 className="text-base font-bold text-[#1a1a2e] mb-1">{pkg.name}</h3>
                <p className="text-gray-500 text-sm mb-3">{pkg.nights}</p>
                <div className="w-8 h-px bg-[#e85a2c] mx-auto mb-3"></div>
                <p className="text-[#e85a2c] text-xs font-bold tracking-widest mb-3">{pkg.description}</p>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-[#1a1a2e]">€{pkg.price}</span>
                  <span className="text-gray-500 text-xs block mt-1">per person</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-gray-600">
            <p className="mb-4">ALL PRICES INCLUDE: Marathon • Accommodation • All meals • Drinks 24/7</p>
            <p className="text-xs text-gray-400">€100 deposit required. Balance due 30 days before event.</p>
          </div>
        </div>
      </section>

      {/* Registration Form Section - Inline form like original */}
      <section id="register" className="py-16 px-4 bg-gray-50 scroll-mt-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-normal text-[#1a1a2e] mb-3 tracking-wide">REGISTER</h2>
            <div className="w-12 h-0.5 bg-[#e85a2c] mx-auto"></div>
          </div>

          <form className="bg-white p-8 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">First Name *</label>
                <input type="text" className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#e85a2c]" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Last Name *</label>
                <input type="text" className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#e85a2c]" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Email *</label>
              <input type="email" className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#e85a2c]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Check-in Date *</label>
                <input type="date" className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#e85a2c]" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Check-out Date *</label>
                <input type="date" className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#e85a2c]" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Package *</label>
              <select className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#e85a2c]">
                <option value="">Select a package</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>{pkg.name} - {pkg.nights} - €{pkg.price}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Dance Role *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="role" value="leader" className="text-[#e85a2c]" />
                  <span className="text-sm">Leader</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="role" value="follower" className="text-[#e85a2c]" />
                  <span className="text-sm">Follower</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Years of Tango Experience *</label>
              <select className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#e85a2c]">
                <option value="">Select</option>
                <option value="1-2">1-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="6-10">6-10 years</option>
                <option value="10+">More than 10 years</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" />
                <span className="text-xs text-gray-600">I agree to the terms and conditions and privacy policy</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[#e85a2c] hover:bg-[#d14a1c] text-white py-3 font-bold tracking-wide transition"
            >
              SEND REGISTRATION
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d0d1a] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <img
            src="https://www.inviernotangomarathon.com/assets/images/logo.png"
            alt="Sol de Invierno"
            className="h-20 w-auto mx-auto mb-4"
          />
          <p className="text-white/50 text-sm mb-6">7-11 November 2025 • Antalya, Turkey</p>

          <a href="mailto:info@inviernotangomarathon.com" className="text-white/60 hover:text-[#d4a853] transition text-sm">
            info@inviernotangomarathon.com
          </a>

          <div className="flex justify-center gap-3 mt-6 mb-8">
            <a href="#" className="w-9 h-9 border border-white/20 flex items-center justify-center text-white/60 hover:text-[#d4a853] hover:border-[#d4a853] transition">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="#" className="w-9 h-9 border border-white/20 flex items-center justify-center text-white/60 hover:text-[#d4a853] hover:border-[#d4a853] transition">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-white/30 text-xs">
              <div className="w-4 h-4 bg-gradient-to-br from-rose-500 to-rose-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-[8px]">4T</span>
              </div>
              <span>Powered by 4Tango</span>
            </div>
            <div className="text-white/30 text-xs">
              <Link href="/privacy" className="hover:text-white/60 transition">Privacy</Link>
              <span className="mx-2">•</span>
              <Link href="/terms" className="hover:text-white/60 transition">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
