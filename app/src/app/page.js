import Link from "next/link";
import { Layers, Building2, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const reportTypes = [
  {
    href: "/pcf",
    icon: Layers,
    title: "PCF Report",
    standard: "ISO 14067",
    description:
      "Product Carbon Footprint — quantify greenhouse gas emissions across the full lifecycle of a product, from materials to end of life.",
  },
  {
    href: "/ocf",
    icon: Building2,
    title: "OCF Report",
    standard: "ISO 14064",
    description:
      "Organization Carbon Footprint — measure and report your organization's total GHG emissions across Scopes 1, 2, and 3.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center gap-2">
          <span className="text-[#16a34a] font-bold text-lg tracking-tight">Footprint Mappa</span>
          <span className="text-muted-foreground text-sm">Report Builder</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Select Report Type
            </h1>
            <p className="mt-2 text-muted-foreground">
              Choose the carbon footprint standard you want to report against.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {reportTypes.map(({ href, icon: Icon, title, standard, description }) => (
              <Card key={href} className="flex flex-col">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-[#16a34a]/10">
                    <Icon className="size-5 text-[#16a34a]" />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription>
                    <span className="font-mono text-xs font-medium text-[#16a34a]">{standard}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white">
                    <Link href={href}>
                      Generate {title} <ArrowRight className="ml-1 size-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t px-6 py-4 text-center text-xs text-muted-foreground">
        Confidential · Footprint Mappa · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
