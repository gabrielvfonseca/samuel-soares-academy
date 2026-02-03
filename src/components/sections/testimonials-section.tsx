import Image from "next/image";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { SectionProps } from "@/types";

export async function TestimonialsSection({ lang = "pt" }: SectionProps) {
  const dictionary = await getDictionary(lang as Locale);
  const rawData = dictionary.web.sections.testimonials;

  const data = {
    title: rawData.title,
    description: rawData.description,
    items: rawData.items.map((item) => ({
      ...item,
      image: "/placeholder.svg?height=80&width=80",
    })),
  };

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
