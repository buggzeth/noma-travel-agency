// components/home/ComparisonTable.tsx
import { Check, X } from "lucide-react";
import { COMPARISON_FEATURES } from "@/lib/mock-data";

export default function ComparisonTable() {
  return (
    <section className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-24">
      <h2 className="text-3xl md:text-5xl font-serif text-center mb-4">
        Why choose NOMA?
      </h2>
      <p className="text-center text-foreground/70 mb-8 md:mb-12 max-w-2xl mx-auto font-light text-sm md:text-base">
        See how booking with a NOMA advisor compares to going it alone.
      </p>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-border">
              <th scope="col" className="py-3 px-2 md:py-4 md:px-6 text-left text-[10px] md:text-xs uppercase tracking-widest font-semibold">
                Feature
              </th>
              <th scope="col" className="py-3 px-2 md:py-4 md:px-6 text-center text-[10px] md:text-xs uppercase tracking-widest font-semibold text-primary">
                NOMA
              </th>
              <th scope="col" className="py-3 px-2 md:py-4 md:px-6 text-center text-[10px] md:text-xs uppercase tracking-widest font-semibold">
                AMEX
              </th>
              <th scope="col" className="py-3 px-2 md:py-4 md:px-6 text-center text-[10px] md:text-xs uppercase tracking-widest font-semibold">
                Online Agency
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_FEATURES.map((row, i) => (
              <tr
                key={i}
                className="hover:bg-muted/50 transition-colors"
              >
                <th scope="row" className="py-3 px-2 md:py-4 md:px-6 border-b border-border text-left font-medium text-xs md:text-sm">
                  {row.feature}
                </th>
                <td className="py-3 px-2 md:py-4 md:px-6 border-b border-border text-center bg-secondary/50">
                  {row.noma ? (
                    <Check className="h-4 w-4 md:h-5 md:w-5 text-primary mx-auto" aria-label="Yes" />
                  ) : (
                    <X className="h-4 w-4 md:h-5 md:w-5 text-border mx-auto" aria-label="No" />
                  )}
                </td>
                <td className="py-3 px-2 md:py-4 md:px-6 border-b border-border text-center">
                  {row.creditCard ? (
                    <Check className="h-4 w-4 md:h-5 md:w-5 text-foreground mx-auto" aria-label="Yes" />
                  ) : (
                    <X className="h-4 w-4 md:h-5 md:w-5 text-border mx-auto" aria-label="No" />
                  )}
                </td>
                <td className="py-3 px-2 md:py-4 md:px-6 border-b border-border text-center">
                  {row.onlineAgency ? (
                    <Check className="h-4 w-4 md:h-5 md:w-5 text-foreground mx-auto" aria-label="Yes" />
                  ) : (
                    <X className="h-4 w-4 md:h-5 md:w-5 text-border mx-auto" aria-label="No" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}