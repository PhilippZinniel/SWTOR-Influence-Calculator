"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LEVEL_DATA, ITEM_XP, MAX_LEVEL, MIN_LEVEL } from '@/lib/swtor-data';
import { Gift, Box, Package, Calculator, MousePointerClick } from 'lucide-react';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';


type CalculationResult = {
  totalXpNeeded: number;
  artifactCount: number;
  prototypeCount: number;
  premiumCount: number;
};

export default function InfluenceCalculator() {
  const { toast } = useToast();
  const [startLevel, setStartLevel] = useState<number>(MIN_LEVEL);
  const [targetLevel, setTargetLevel] = useState<number>(MAX_LEVEL);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isSelectingStart, setIsSelectingStart] = useState(true);

  const handleLevelSelect = (level: number) => {
    if (isSelectingStart) {
      setStartLevel(level);
      setTargetLevel(level > targetLevel ? level : targetLevel);
      setIsSelectingStart(false);
    } else {
      if (level < startLevel) {
        setTargetLevel(startLevel);
        setStartLevel(level);
      } else {
        setTargetLevel(level);
      }
      setIsSelectingStart(true);
    }
  };

  const handleCalculate = () => {
    if (startLevel >= targetLevel) {
      toast({
        variant: "destructive",
        title: "Invalid Range",
        description: "Starting level must be lower than the target level.",
      });
      return;
    }

    let totalXpNeeded = 0;
    for (let i = startLevel - 1; i < targetLevel - 1; i++) {
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
          <CardDescription>
            {isSelectingStart ? "Select your starting influence level." : "Select your target influence level."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className='flex justify-around p-2 bg-secondary rounded-md'>
                <div className='text-center'>
                    <p className='text-sm text-muted-foreground'>Start Level</p>
                    <p className='text-lg font-bold'>{startLevel}</p>
                </div>
                <div className='text-center'>
                    <p className='text-sm text-muted-foreground'>Target Level</p>
                    <p className='text-lg font-bold'>{targetLevel}</p>
                </div>
            </div>
          <ScrollArea className="h-[340px] border rounded-md p-2">
            <div className="grid grid-cols-5 gap-2">
                {LEVEL_DATA.map(({level}) => {
                    const isSelectedStart = level === startLevel;
                    const isSelectedTarget = level === targetLevel;
                    const isInRange = level > startLevel && level < targetLevel;
                    
                    return (
                         <div
                            key={level} 
                            onClick={() => handleLevelSelect(level)}
                            className={cn(
                                "flex items-center justify-center h-12 text-center font-medium border rounded-md cursor-pointer transition-colors",
                                isSelectedStart && "bg-primary/20 text-primary-foreground ring-2 ring-primary",
                                isSelectedTarget && "bg-primary/20 text-primary-foreground ring-2 ring-primary",
                                isInRange && "bg-primary/10",
                                !isSelectingStart && level === startLevel && "ring-2 ring-accent",
                                !isSelectedStart && level === targetLevel && "ring-2 ring-accent",
                                "hover:bg-primary/10"
                            )}
                         >
                            {level}
                         </div>
                    )
                })}
            </div>
          </ScrollArea>
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
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-16">
              <MousePointerClick size={48} className="mb-4" />
              <p>Select a range and calculate to see results.</p>
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
