import { localeSchema } from "@repo/validation/locale";
import Image from "next/image";
import { getDictionary } from "@/lib/i18n";
import type { SectionProps } from "@/types";

export async function TestimonialsSection({ lang = "pt" }: SectionProps) {
  // Parse language
  const parsedLang = localeSchema.parse(lang);

  // Get dictionary
  const dictionary = await getDictionary(parsedLang);

  // Get raw data
  const rawData = dictionary.web.sections.testimonials;

  // Set data for testimonials section
  const data = {
    description: rawData.description,
    items: rawData.items.map((item) => ({
      ...item,
      image: "/placeholder.svg?height=80&width=80",
    })),
    title: rawData.title,
  };

  return (
    <section
      className="border-border border-t px-4 py-24 sm:px-6 lg:px-8"
      id="testimonials"
    >
      <div className="mx-auto max-w-5xl">
        <div className="max-w-xl">
          <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            {data.title}
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed text-pretty">
            {data.description}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {data.items.map((testimonial) => (
            <div
              className="bg-card border-border rounded-lg border p-6"
              key={testimonial.author}
            >
              <blockquote className="text-foreground text-sm leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              <div className="mt-6 flex items-center gap-4">
                <div className="bg-muted relative size-12 overflow-hidden rounded-full">
                  <Image
                    alt={`Foto de ${testimonial.author}`}
                    className="object-cover"
                    fill
                    src={testimonial.image || "/placeholder.svg"}
                  />
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">
                    {testimonial.author}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
