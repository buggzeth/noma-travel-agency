// components/home/HowItWorks.tsx
import { HOW_IT_WORKS_STEPS } from "@/lib/mock-data";
import Image from "next/image";
import AnimatedBorder from "@/components/ui/AnimatedBorder";

export default function HowItWorks() {
  return (
    <section className="py-24">
      <h2 className="text-4xl md:text-5xl font-serif text-center mb-4 px-8">
        How NOMA works
      </h2>
      <p className="text-center text-foreground/70 font-light mb-16 max-w-2xl mx-auto px-8">
        Three simple steps to your dream vacation.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-8 max-w-6xl mx-auto">
        {HOW_IT_WORKS_STEPS.map((step) => (
          <div key={step.number} className="relative overflow-hidden group border border-border/50 min-h-[400px] flex flex-col justify-end p-8">
            {step.imageUrl && (
              <Image
                src={step.imageUrl}
                alt={step.title}
                fill
                className="object-cover transition-transform duration-700"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
            
            <div className="relative z-10">
              <p className="text-6xl font-serif text-white/30 mb-4 transition-colors group-hover:text-white/50">
                {step.number}
              </p>
              <h3 className="text-2xl font-serif mb-3 text-white">{step.title}</h3>
              <p className="text-white/80 font-light leading-relaxed">{step.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}