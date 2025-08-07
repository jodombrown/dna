
import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';

const testimonials = [
  {
    quote:
      "DNA helps me find purpose-aligned collaborators across continents. It's the bridge I needed.",
    author: 'Ada N.',
    role: 'Product Designer, Lagos ↔ Berlin',
  },
  {
    quote:
      'As an early adopter, I value the clarity of the build-in-public journey and the real momentum.',
    author: 'Kwame A.',
    role: 'Impact Investor, Accra ↔ Toronto',
  },
  {
    quote:
      'This is the first platform that truly speaks to diaspora realities—practical, principled, connected.',
    author: 'Zinzi M.',
    role: 'Data Scientist, Johannesburg ↔ London',
  },
];

const TestimonialsCarousel: React.FC = () => {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' });

  return (
    <section aria-labelledby="testimonials-title" className="py-10">
      <div className="mb-6 text-center">
        <h2 id="testimonials-title" className="text-2xl md:text-3xl font-semibold text-dna-forest">
          Real Voices from the Diaspora
        </h2>
        <p className="text-sm md:text-base text-gray-700 mt-2">Short quotes from early adopters and allies</p>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {testimonials.map((t, i) => (
            <article
              key={i}
              className="min-w-[85%] sm:min-w-[60%] md:min-w-[45%] lg:min-w-[33%] bg-white border rounded-xl p-5 shadow-sm animate-fade-in"
              aria-label={`Testimonial from ${t.author}`}
            >
              <p className="text-dna-forest text-base md:text-lg leading-relaxed">“{t.quote}”</p>
              <div className="mt-4">
                <p className="font-semibold text-dna-copper">{t.author}</p>
                <p className="text-xs text-gray-700">{t.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
