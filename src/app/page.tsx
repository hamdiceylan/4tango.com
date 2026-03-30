import Link from "next/link";
import { SmoothScrollLink } from "@/components/SmoothScrollLink";
import { MobileNav } from "@/components/MobileNav";

export default function Home() {
  return (
    <div id="top" className="min-h-screen bg-gradient-to-b from-white to-rose-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <SmoothScrollLink href="#top" className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">4T</span>
              </div>
              <span className="text-gray-900 font-bold text-xl">4Tango</span>
            </SmoothScrollLink>
            <div className="hidden md:flex items-center gap-8">
              <SmoothScrollLink href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</SmoothScrollLink>
              <SmoothScrollLink href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition">How it works</SmoothScrollLink>
              <SmoothScrollLink href="#pricing" className="text-gray-600 hover:text-gray-900 transition">Pricing</SmoothScrollLink>
              <SmoothScrollLink href="#faq" className="text-gray-600 hover:text-gray-900 transition">FAQ</SmoothScrollLink>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hidden md:block text-gray-600 hover:text-gray-900 transition">Log in</Link>
              <Link href="/signup" className="hidden md:block bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm">
                Get Started
              </Link>
              <MobileNav />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Run your tango events with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-600">
              less admin
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Create beautiful event pages, collect registrations, manage attendees, and keep everything in one place. Built specifically for tango organizers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition shadow-lg shadow-rose-500/25 text-center">
              Create your first event
            </Link>
            <Link href="/contact" className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg transition text-center bg-white">
              Contact us
            </Link>
          </div>
          <p className="text-gray-500 mt-4 text-sm">Free trial - No credit card required</p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-500 mb-8">Trusted by tango organizers worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            <div className="text-gray-400 font-semibold text-lg">Caliente Tango Marathon</div>
            <div className="text-gray-400 font-semibold text-lg">Sol de Invierno Marathon</div>
            <div className="text-gray-400 font-semibold text-lg">Ephesus Tango Marathon</div>
            <div className="text-gray-400 font-semibold text-lg">Game of Tangueros Marathon</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to run successful tango events
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              From event creation to attendee management, we handle the admin so you can focus on the dance.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "📄", title: "Beautiful Event Pages", description: "Create stunning, mobile-friendly event pages in minutes. Share them anywhere and let dancers register instantly." },
              { icon: "📋", title: "Registration Management", description: "See all your registrations in one place. Filter by status, role, payment, and more. Export to CSV anytime." },
              { icon: "💳", title: "Payment Collection", description: "Accept payments securely with Stripe. Support both free and paid events with automatic payment tracking." },
              { icon: "👥", title: "Dancer Database", description: "Build your community database automatically. Every registration adds to your central dancer list." },
              { icon: "✉️", title: "Email Confirmations", description: "Automatic confirmation emails with full tracking. Know when emails are delivered, opened, and clicked." },
              { icon: "📊", title: "Export & Reports", description: "Export your data anytime. Generate attendee lists, check-in sheets, and registration reports." }
            ].map((feature, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-100/50 transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-gray-900 font-semibold text-xl mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 bg-gradient-to-b from-white to-rose-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get started in three simple steps
            </h2>
            <p className="text-gray-600 text-lg">
              From zero to live event page in under 10 minutes
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Create your event", description: "Fill in your event details, set the price, upload a cover image, and configure registration settings." },
              { step: "2", title: "Share your page", description: "Publish your event and share the beautiful public page on social media, email lists, and tango communities." },
              { step: "3", title: "Manage registrations", description: "Watch registrations come in. Track payments, send emails, and manage your attendee list from one dashboard." }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg shadow-rose-500/25">
                  {item.step}
                </div>
                <h3 className="text-gray-900 font-semibold text-xl mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-600 text-lg">
              Start free, add modules as you grow
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "0",
                period: "forever",
                billedAnnually: false,
                description: "Perfect for your first event",
                features: ["1 active event", "Up to 50 registrations", "Basic registration form", "Basic event page", "Email confirmations", "CSV export"],
                cta: "Start free",
                highlighted: false
              },
              {
                name: "Starter",
                price: "15",
                period: "/month",
                billedAnnually: true,
                description: "For regular event organizers",
                features: ["5 active events", "Up to 300 registrations/event", "Custom registration forms", "Email tracking", "Priority support"],
                cta: "Start free trial",
                highlighted: true
              },
              {
                name: "Professional",
                price: "39",
                period: "/month",
                billedAnnually: true,
                description: "For festivals and large events",
                features: ["Unlimited events", "Unlimited registrations", "Advanced form logic", "Team access (5 members)", "API access", "Dedicated support"],
                cta: "Start free trial",
                highlighted: false
              }
            ].map((plan, i) => (
              <div key={i} className={`rounded-2xl p-8 ${plan.highlighted ? "bg-gradient-to-b from-rose-500 to-rose-600 text-white relative shadow-xl shadow-rose-500/25" : "bg-white border border-gray-200"}`}>
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-rose-600 text-sm font-medium px-4 py-1 rounded-full shadow-md">
                    Most Popular
                  </div>
                )}
                <h3 className={`font-semibold text-xl mb-2 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                <div className="mb-1">
                  <span className={`text-4xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                  <span className={`text-2xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900"}`}> EUR</span>
                  <span className={`ml-1 ${plan.highlighted ? "text-rose-100" : "text-gray-500"}`}>{plan.period}</span>
                </div>
                {plan.billedAnnually && (
                  <p className={`text-sm mb-4 ${plan.highlighted ? "text-rose-200" : "text-gray-400"}`}>
                    billed annually
                  </p>
                )}
                {!plan.billedAnnually && <div className="mb-4" />}
                <p className={`mb-6 ${plan.highlighted ? "text-rose-100" : "text-gray-600"}`}>{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className={`flex items-center gap-2 ${plan.highlighted ? "text-white" : "text-gray-700"}`}>
                      <svg className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? "text-white" : "text-rose-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-semibold transition ${plan.highlighted ? "bg-white text-rose-600 hover:bg-rose-50" : "bg-gray-100 hover:bg-gray-200 text-gray-900"}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Add-ons Section */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Powerful add-ons
              </h3>
              <p className="text-gray-600">
                Extend your capabilities with specialized modules
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  name: "Custom Event Page",
                  price: "9",
                  description: "Build stunning branded event pages",
                  features: ["Drag & drop page builder", "Custom branding & colors", "Image galleries & videos", "Custom domain (Pro only)"]
                },
                {
                  name: "Transfer Management",
                  price: "19",
                  description: "Coordinate airport transfers & shuttles",
                  features: ["Arrival/departure collection", "Shuttle scheduling", "Driver assignments", "Transfer manifests"]
                },
                {
                  name: "Accommodation",
                  price: "19",
                  description: "Manage hotel blocks & room bookings",
                  features: ["Hotel partnership management", "Room block allocation", "Roommate matching", "Booking reports"]
                }
              ].map((addon, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-rose-200 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-gray-900 font-semibold text-lg">{addon.name}</h4>
                    <span className="text-rose-600 font-bold">+{addon.price} EUR<span className="text-gray-400 font-normal text-sm">/mo</span></span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{addon.description}</p>
                  <ul className="space-y-2">
                    {addon.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-gray-600 text-sm">
                        <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-500 text-sm mt-6">
              Add-ons available on Starter and Professional plans
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "Do dancers need to create an account to register?", a: "No! Dancers can register for events without creating an account. They just fill in the registration form and receive a confirmation email. This keeps the experience smooth and frictionless." },
              { q: "Can I export my registration data?", a: "Yes, you can export all your registration data to CSV at any time. This includes all attendee information, payment status, and email tracking data." },
              { q: "Can I manage leader/follower ratios?", a: "This feature is on our roadmap. For now, you can see the role breakdown in your registration list and manage it manually. Automated balancing is coming soon." },
              { q: "Is there a limit on registrations?", a: "The Free plan allows up to 50 registrations per event. Starter allows 300 per event, and Professional offers unlimited registrations. Check our pricing for details." },
              { q: "Can I use my own domain?", a: "Yes! With the Custom Event Page add-on on the Professional plan, you can use your own domain for event pages. Contact us for setup assistance." },
              { q: "How does billing work?", a: "Paid plans are billed annually. The monthly price shown is the equivalent when paying for a year upfront. Add-ons are billed monthly along with your subscription." }
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-gray-900 font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-rose-500 to-rose-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to simplify your event management?
          </h2>
          <p className="text-rose-100 text-lg mb-8">
            Join hundreds of tango organizers who save time with 4Tango
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-white text-rose-600 hover:bg-rose-50 px-8 py-4 rounded-xl font-semibold text-lg transition shadow-lg">
              Create your first event
            </Link>
            <Link href="/contact" className="border-2 border-white/50 hover:border-white text-white px-8 py-4 rounded-xl font-semibold text-lg transition">
              Contact us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">4T</span>
                </div>
                <span className="text-white font-bold text-xl">4Tango</span>
              </div>
              <p className="text-gray-400 text-sm">The event platform built for tango organizers.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><SmoothScrollLink href="#features" className="text-gray-400 hover:text-white transition">Features</SmoothScrollLink></li>
                <li><SmoothScrollLink href="#pricing" className="text-gray-400 hover:text-white transition">Pricing</SmoothScrollLink></li>
                <li><SmoothScrollLink href="#faq" className="text-gray-400 hover:text-white transition">FAQ</SmoothScrollLink></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition">About</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">2026 4Tango. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
