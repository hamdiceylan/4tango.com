import Link from "next/link";
import { PricingContent } from "@/lib/section-types";

interface Package {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  capacity?: number | null;
  isActive: boolean;
}

interface PricingSectionProps {
  title?: string | null;
  content: PricingContent;
  packages?: Package[];
  eventSlug: string;
  primaryColor?: string;
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100); // Assuming price is in cents
}

export default function PricingSection({
  title,
  content,
  packages = [],
  eventSlug,
}: PricingSectionProps) {
  const { showPackages, customContent } = content;

  const activePackages = packages.filter(p => p.isActive);

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          {title || "Pricing"}
        </h2>

        {/* Package Cards */}
        {showPackages && activePackages.length > 0 && (
          <div className={`grid gap-6 mb-8 ${
            activePackages.length === 1
              ? "grid-cols-1 max-w-md mx-auto"
              : activePackages.length === 2
                ? "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}>
            {activePackages.map((pkg, index) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                  index === 0 ? "border-rose-500 border-2" : "border-gray-200"
                }`}
              >
                {index === 0 && (
                  <div className="bg-rose-500 text-white text-center py-1 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {pkg.name}
                  </h3>
                  {pkg.description && (
                    <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
                  )}
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(pkg.price, pkg.currency)}
                    </span>
                    <span className="text-gray-500 ml-1">/ person</span>
                  </div>
                  {pkg.capacity && (
                    <p className="text-gray-500 text-sm mb-4">
                      Limited to {pkg.capacity} spots
                    </p>
                  )}
                  <Link
                    href={`/${eventSlug}/register?package=${pkg.id}`}
                    className={`block w-full text-center py-3 rounded-xl font-semibold transition ${
                      index === 0
                        ? "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    }`}
                  >
                    Select Package
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Content */}
        {customContent && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="prose prose-gray max-w-none">
              {customContent.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-gray-600 mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* No packages available */}
        {showPackages && activePackages.length === 0 && !customContent && (
          <div className="text-center">
            <p className="text-gray-500">Pricing information coming soon</p>
          </div>
        )}
      </div>
    </section>
  );
}
