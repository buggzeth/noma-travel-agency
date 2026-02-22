// components/home/ComparisonTable.tsx
import { Check, X } from "lucide-react";
import { COMPARISON_FEATURES } from "@/lib/mock-data";

export default function ComparisonTable() {
  return (
    <section className="max-w-5xl mx-auto px-8 py-24">
      <h2 className="text-4xl md:text-5xl font-serif text-center mb-4">
        Why choose NOMA?
      </h2>
      <p className="text-center text-foreground/70 mb-12 max-w-2xl mx-auto font-light">
        See how booking with a NOMA advisor compares to going it alone.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="py-4 px-6 text-left text-xs uppercase tracking-widest font-semibold">
                Feature
              </th>
              <th className="py-4 px-6 text-center text-xs uppercase tracking-widest font-semibold text-primary">
                NOMA
              </th>
              <th className="py-4 px-6 text-center text-xs uppercase tracking-widest font-semibold">
                Credit Card Concierge
              </th>
              <th className="py-4 px-6 text-center text-xs uppercase tracking-widest font-semibold">
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
                <td className="py-4 px-6 border-b border-border text-left font-medium text-sm">
                  {row.feature}
                </td>
                <td className="py-4 px-6 border-b border-border text-center bg-secondary/50">
                  {row.noma ? (
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-border mx-auto" />
                  )}
                </td>
                <td className="py-4 px-6 border-b border-border text-center">
                  {row.creditCard ? (
                    <Check className="h-5 w-5 text-foreground mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-border mx-auto" />
                  )}
                </td>
                <td className="py-4 px-6 border-b border-border text-center">
                  {row.onlineAgency ? (
                    <Check className="h-5 w-5 text-foreground mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-border mx-auto" />
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
