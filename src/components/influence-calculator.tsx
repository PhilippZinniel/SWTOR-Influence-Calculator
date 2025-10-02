"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LEVEL_DATA, ITEM_XP, MAX_LEVEL, MIN_LEVEL } from '@/lib/swtor-data';
import { Gift, Box, Package, ArrowRight, Calculator } from 'lucide-react';
import { Separator } from './ui/separator';

type CalculationResult = {
  totalXpNeeded: number;
  artifactCount: number;
  prototypeCount: number;
  premiumCount: number;
};

export default function InfluenceCalculator() {
  const { toast } = useToast();
  const [startLevel, setStartLevel] = useState<number | string>(MIN_LEVEL);
  const [targetLevel, setTargetLevel] = useState<number | string>(MAX_LEVEL);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleCalculate = () => {
    const start = typeof startLevel === 'string' ? parseInt(startLevel, 10) : startLevel;
    const target = typeof targetLevel === 'string' ? parseInt(targetLevel, 10) : targetLevel;
    
    if (isNaN(start) || isNaN(target)) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter valid numbers for start and target levels.",
      });
      return;
    }

    if (start < MIN_LEVEL || target > MAX_LEVEL || start > MAX_LEVEL || target < MIN_LEVEL) {
      toast({
        variant: "destructive",
        title: "Invalid Levels",
        description: `Levels must be between ${MIN_LEVEL} and ${MAX_LEVEL}.`,
      });
      return;
    }
    
    if (start >= target) {
      toast({
        variant: "destructive",
        title: "Invalid Range",
        description: "Starting level must be lower than the target level.",
      });
      return;
    }

    let totalXpNeeded = 0;
    for (let i = start - 1; i < target - 1; i++) {
      totalXpNeeded += LEVEL_DATA[i].xpToNextLevel;
    }
    
    let remainingXp = totalXpNeeded;
    
    const artifactCount = Math.floor(remainingXp / ITEM_XP.ARTIFACT);
    remainingXp %= ITEM_XP.ARTIFACT;
    
    const prototypeCount = Math.floor(remainingXp / ITEM_XP.PROTOTYPE);
    remainingXp %= ITEM_XP.PROTOTYPE;
    
    const premiumCount = Math.ceil(remainingXp / ITEM_XP.PREMIUM);
    
    setResult({ totalXpNeeded, artifactCount, prototypeCount, premiumCount });
  };
  
  const totalGifts = useMemo(() => {
    if (!result) return 0;
    return result.artifactCount + result.prototypeCount + result.premiumCount;
  }, [result]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calculator size={24} /> Configuration</CardTitle>
          <CardDescription>Select your starting and target influence levels.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="start-level" className="text-center block">Start Level</Label>
              <Input
                id="start-level"
                type="number"
                value={startLevel}
                onChange={(e) => setStartLevel(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                min={MIN_LEVEL}
                max={MAX_LEVEL}
                className="text-center text-lg font-bold"
              />
            </div>
            <ArrowRight className="mt-8 text-muted-foreground shrink-0" size={24}/>
            <div className="flex-1 space-y-2">
              <Label htmlFor="target-level" className="text-center block">Target Level</Label>
              <Input
                id="target-level"
                type="number"
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                min={MIN_LEVEL}
                max={MAX_LEVEL}
                className="text-center text-lg font-bold"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCalculate} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Calculate Optimal Gifts
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>The optimal number of gifts to use.</CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground">Total Experience Needed</p>
                <p className="text-3xl font-bold text-primary">{result.totalXpNeeded.toLocaleString()}</p>
              </div>
              <Separator />
              <div className="space-y-3">
                 <GiftItem rarity="Artifact" count={result.artifactCount} icon={<Gift className="text-purple-400"/>} xp={ITEM_XP.ARTIFACT} />
                 <GiftItem rarity="Prototype" count={result.prototypeCount} icon={<Box className="text-blue-400"/>} xp={ITEM_XP.PROTOTYPE}/>
                 <GiftItem rarity="Premium" count={result.premiumCount} icon={<Package className="text-green-400"/>} xp={ITEM_XP.PREMIUM}/>
              </div>
              <Separator />
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground">Total Gifts Required</p>
                <p className="text-3xl font-bold">{totalGifts.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground py-16">
              <p>Enter levels and calculate to see results.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GiftItem({ rarity, count, icon, xp }: { rarity: string, count: number, icon: React.ReactNode, xp: number }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center justify-between p-3 bg-background rounded-md border">
        <div className="flex items-center gap-3">
            {icon}
            <div>
                <p className="font-semibold">{rarity}</p>
                <p className="text-xs text-muted-foreground">{xp.toLocaleString()} XP each</p>
            </div>
        </div>
        <p className="text-lg font-bold">{count.toLocaleString()}</p>
    </div>
  )
}
