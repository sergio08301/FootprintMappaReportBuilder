import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const GRADIENT = {
  background: "linear-gradient(to right, #fdc2d8, #fca65e, #ff7983, #041282)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <a href="https://footprintmappa.com" target="_blank" rel="noreferrer">
              <img src="/logos/mappa.png" alt="Footprint Mappa" className="h-8 w-auto" />
            </a>
            <span className="text-muted-foreground text-sm">Report Builder</span>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/history">History</Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-10 text-center">
            <h1 className="text-5xl font-bold tracking-tight text-foreground">
              Turn operational data into
            </h1>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* PCF — active */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-5xl font-bold">
                  <span style={GRADIENT}>PCF Report</span>
                </CardTitle>
                <CardDescription>
                  <span className="font-mono text-xs font-medium text-orange-500">ISO 14067</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Product Carbon Footprint — quantify greenhouse gas emissions across the full lifecycle of a product, from materials to end of life.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  <Link href="/pcf">
                    Generate PCF Report <ArrowRight className="ml-1 size-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* OCF — coming soon */}
            <Card className="relative flex flex-col opacity-60 cursor-not-allowed">
              <span className="absolute right-4 top-4 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Coming soon
              </span>
              <CardHeader>
                <CardTitle className="text-5xl font-bold">
                  <span style={GRADIENT}>OCF Report</span>
                </CardTitle>
                <CardDescription>
                  <span className="font-mono text-xs font-medium text-orange-500">ISO 14064</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Organization Carbon Footprint — measure and report your organization's total GHG emissions across Scopes 1, 2, and 3.
                </p>
              </CardContent>
              <CardFooter>
                <Button disabled className="w-full bg-orange-500 text-white">
                  Generate OCF Report <ArrowRight className="ml-1 size-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t px-6 py-4 text-center text-xs text-muted-foreground">
        Confidential · Footprint Mappa · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
