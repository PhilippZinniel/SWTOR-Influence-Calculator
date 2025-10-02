"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MAX_LEVEL, MIN_LEVEL, Companion, GiftInfo } from '@/lib/swtor-data';
import * as LucideIcons from 'lucide-react';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';

import companionsData from '@/lib/data/companions.json';
import influenceData from '@/lib/data/swtor-influence-data.json';

const COMPANIONS: Companion[] = companionsData;
const LEVEL_DATA = influenceData.levels;


type CalculationResult = {
  totalXpNeeded: number;
  artifactCount: number;
  prototypeCount: number;
  premiumCount: number;
  itemXp: {
    artifact: number;
    prototype: number;
    premium: number;
  };
};

export default function InfluenceCalculator() {
  const { toast } = useToast();
  const [startLevel, setStartLevel] = useState<number>(MIN_LEVEL);
  const [targetLevel, setTargetLevel] = useState<number>(MAX_LEVEL);
  const [selectedCompanionId, setSelectedCompanionId] = useState<string>(COMPANIONS[0].id);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isSelectingStart, setIsSelectingStart] = useState(true);

  const selectedCompanion = useMemo(() => {
    return COMPANIONS.find(c => c.id === selectedCompanionId) || COMPANIONS[0];
  }, [selectedCompanionId]);

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
    
    const itemXpForCalc = LEVEL_DATA[startLevel - 1].itemXp;
    let remainingXp = totalXpNeeded;
    
    const artifactCount = Math.floor(remainingXp / itemXpForCalc.artifact);
    remainingXp %= itemXpForCalc.artifact;
    
    const prototypeCount = Math.floor(remainingXp / itemXpForCalc.prototype);
    remainingXp %= itemXpForCalc.prototype;
    
    const premiumCount = Math.ceil(remainingXp / itemXpForCalc.premium);
    
    setResult({ totalXpNeeded, artifactCount, prototypeCount, premiumCount, itemXp: itemXpForCalc });
  };
  
  const totalGifts = useMemo(() => {
    if (!result) return 0;
    return result.artifactCount + result.prototypeCount + result.premiumCount;
  }, [result]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LucideIcons.Calculator size={24} /> Configuration</CardTitle>
          <CardDescription>
            Select a companion and your desired influence level range.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Companion</label>
                <Select value={selectedCompanionId} onValueChange={setSelectedCompanionId}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a companion">
                            <div className="flex items-center gap-3">
                                <Image 
                                    src={selectedCompanion.imageUrl}
                                    alt={selectedCompanion.name}
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                />
                                <span>{selectedCompanion.name}</span>
                            </div>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {COMPANIONS.map((companion) => (
                            <SelectItem key={companion.id} value={companion.id}>
                                <div className="flex items-center gap-3">
                                    <Image 
                                        src={companion.imageUrl}
                                        alt={companion.name}
                                        width={24}
                                        height={24}
                                        className="rounded-full"
                                    />
                                    <span>{companion.name}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <CardDescription>
                {isSelectingStart ? "Select your starting influence level." : "Select your target influence level."}
            </CardDescription>
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
            <div className="grid grid-cols-10 gap-2 border rounded-md p-2">
                {LEVEL_DATA.map(({level}) => {
                    const isSelectedStart = level === startLevel;
                    const isSelectedTarget = level === targetLevel;
                    const isInRange = level > startLevel && level < targetLevel;
                    
                    return (
                         <div
                            key={level} 
                            onClick={() => handleLevelSelect(level)}
                            className={cn(
                                "flex items-center justify-center h-10 text-center font-medium border rounded-md cursor-pointer transition-colors",
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
          <CardDescription>The optimal number of gifts to use for {selectedCompanion.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                  <Image 
                      src={selectedCompanion.imageUrl}
                      alt={selectedCompanion.name}
                      width={80}
                      height={80}
                      className="rounded-lg border-2 border-primary"
                  />
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">Total Experience Needed</p>
                    <p className="text-3xl font-bold text-primary">{result.totalXpNeeded.toLocaleString()}</p>
                  </div>
              </div>
              <Separator />
              <div className="space-y-3">
                 <GiftItem rarity="Artifact" gifts={selectedCompanion.gifts.artifact} count={result.artifactCount} color="text-purple-400" xp={result.itemXp.artifact} />
                 <GiftItem rarity="Prototype" gifts={selectedCompanion.gifts.prototype} count={result.prototypeCount} color="text-blue-400" xp={result.itemXp.prototype}/>
                 <GiftItem rarity="Premium" gifts={selectedCompanion.gifts.premium} count={result.premiumCount} color="text-green-400" xp={result.itemXp.premium}/>
              </div>
              <Separator />
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground">Total Gifts Required</p>
                <p className="text-3xl font-bold">{totalGifts.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-16">
              <LucideIcons.MousePointerClick size={48} className="mb-4" />
              <p>Select a range and calculate to see results.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GiftItem({ rarity, gifts, count, color, xp }: { rarity: string, gifts: GiftInfo[], count: number, color: string, xp: number }) {
  if (count === 0) return null;
  const gift = gifts[0];
  // @ts-ignore
  const IconComponent = LucideIcons[gift.icon] || LucideIcons.Gift;

  return (
    <div className="flex items-center justify-between p-3 bg-background rounded-md border">
        <div className="flex items-center gap-3">
            <IconComponent className={cn("h-6 w-6", color)} />
            <div>
                <p className="font-semibold">{rarity} <span className='text-sm text-muted-foreground'>({gift.name}{gift.type && ` - ${gift.type}`})</span></p>
                <p className="text-xs text-muted-foreground">{xp.toLocaleString()} XP each</p>
            </div>
        </div>
        <p className="text-lg font-bold">{count.toLocaleString()}</p>
    </div>
  )
}
