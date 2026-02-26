// app/guide/[slug]/page.tsx
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import GuideApp from "@/components/guide/GuideApp";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function GuidePage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;

    const { data, error } = await supabase
        .from("travel_plans")
        .select("plan_data")
        .eq("slug", slug)
        .single();

    if (error || !data) {
        notFound();
    }

    const travelPlan = data.plan_data;

    return (
        <main className="h-[100dvh] w-full bg-background text-foreground overflow-hidden flex flex-col">
            <GuideApp plan={travelPlan} />
        </main>
    );
}