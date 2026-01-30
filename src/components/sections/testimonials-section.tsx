import Image from "next/image";
import { fetchApi } from "@/lib/api-client";
import type { Locale } from "@/lib/i18n";
import type { TestimonialsSection as TestimonialsSectionData } from "@/models/testimonial";
import type { SectionProps } from "@/types";

export async function TestimonialsSection({ lang = "pt" }: SectionProps) {
  const data = await fetchApi<TestimonialsSectionData>("/api/testimonials", lang as Locale);

  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
            {data.title}
          </h2>
          <p className="mt-4 text-muted-foreground text-pretty leading-relaxed">
            {data.description}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.items.map((testimonial) => (
            <div key={testimonial.author} className="p-6 bg-card border border-border rounded-lg">
              <blockquote className="text-foreground leading-relaxed text-sm">
                "{testimonial.quote}"
              </blockquote>
              <div className="mt-6 flex items-center gap-4">
                <div className="relative size-12 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={`Foto de ${testimonial.author}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
