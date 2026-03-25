import { AccommodationContent } from "@/lib/section-types";

interface AccommodationSectionProps {
  title?: string | null;
  content: AccommodationContent;
}

export default function AccommodationSection({ title, content }: AccommodationSectionProps) {
  const {
    title: hotelName,
    description,
    images,
    features,
    address,
    mapUrl,
    bookingUrl,
  } = content;

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          {title || "Accommodation"}
        </h2>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Image Gallery */}
          {images && images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
              {images.slice(0, 3).map((image, index) => (
                <div
                  key={index}
                  className={`aspect-video overflow-hidden ${
                    index === 0 && images.length > 1 ? "md:col-span-2 md:row-span-2" : ""
                  }`}
                >
                  <img
                    src={image}
                    alt={`${hotelName} image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="p-8">
            {/* Hotel Name & Description */}
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{hotelName}</h3>
            {description && (
              <p className="text-gray-600 mb-6">{description}</p>
            )}

            {/* Features */}
            {features && features.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Address */}
            {address && (
              <div className="flex items-start gap-3 mb-6">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-gray-600">{address}</p>
                  {mapUrl && (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-500 text-sm hover:underline"
                    >
                      View on Google Maps
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Booking Button */}
            {bookingUrl && (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-rose-500/25"
              >
                Book Now
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
