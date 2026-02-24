// components/ui/AnimatedBorder.tsx
export default function AnimatedBorder() {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* Bottom halves (Draw outward from center to edges) */}
      <div className="absolute bottom-0 left-1/2 h-[3px] w-0 bg-accent transition-all duration-200 delay-[400ms] ease-linear group-hover:w-1/2 group-hover:left-0 group-hover:delay-0" />
      <div className="absolute bottom-0 right-1/2 h-[3px] w-0 bg-accent transition-all duration-200 delay-[400ms] ease-linear group-hover:w-1/2 group-hover:right-0 group-hover:delay-0" />
      
      {/* Sides (Draw upward from bottom corners to top corners) */}
      <div className="absolute bottom-0 left-0 w-[3px] h-0 bg-accent transition-all duration-200 delay-[200ms] ease-linear group-hover:h-full group-hover:delay-[200ms]" />
      <div className="absolute bottom-0 right-0 w-[3px] h-0 bg-accent transition-all duration-200 delay-[200ms] ease-linear group-hover:h-full group-hover:delay-[200ms]" />

      
    </div>
  );
}