// app/guides/[slug]/page.tsx
import { GUIDES } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function generateStaticParams() {
  return GUIDES.map((guide) => ({
    slug: guide.slug,
  }));
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const guide = GUIDES.find((g) => g.slug === resolvedParams.slug);

  if (!guide) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] w-full border-b border-border/50">
        <Image
          src={guide.imageUrl}
          alt={guide.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 max-w-4xl mx-auto w-full">
          <Link 
            href="/" 
            className="text-white/80 hover:text-white flex items-center gap-2 w-fit mb-8 transition-colors uppercase tracking-widest text-xs font-semibold group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
          <span className="bg-white/10 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 border border-white/20 w-fit mb-4">
            {guide.tag}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-4 leading-tight">
            {guide.title}
          </h1>
          <p className="text-white/80 uppercase tracking-widest text-sm">
            By {guide.author}
          </p>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-24 px-8 md:px-16 max-w-3xl mx-auto">
        <div 
          className="
            [&>h2]:font-serif [&>h2]:text-3xl [&>h2]:md:text-4xl [&>h2]:text-foreground [&>h2]:mt-16 [&>h2]:mb-6 
            [&>p]:font-light [&>p]:leading-relaxed [&>p]:text-foreground/80 [&>p]:mb-8 [&>p]:text-lg md:[&>p]:text-xl
            [&>img]:w-full [&>img]:h-auto [&>img]:max-h-[600px] [&>img]:object-cover [&>img]:my-16 [&>img]:border [&>img]:border-border/50 [&>img]:shadow-sm
          "
          dangerouslySetInnerHTML={{ __html: guide.content || "" }} 
        />
      </section>
    </main>
  );
}