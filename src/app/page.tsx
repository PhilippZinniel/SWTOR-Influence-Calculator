import InfluenceCalculator from '@/components/influence-calculator';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl font-headline">
            SWTOR Influence Calculator
          </h1>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
            Optimally calculate the number of companion gifts needed to reach your desired influence level.
          </p>
        </div>
        
        <InfluenceCalculator />

        <footer className="pt-8 text-center text-sm text-muted-foreground">
          <p>Made for the Old Republic. May the Force be with you.</p>
        </footer>
      </div>
    </main>
  );
}
