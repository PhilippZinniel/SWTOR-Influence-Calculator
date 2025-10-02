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
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";


import companionsData from '@/lib/data/companions.json';
import influenceData from '@/lib/data/swtor-influence-data.json';

const COMPANIONS: Companion[] = companionsData;
const LEVEL_DATA = influenceData.levels;


type CalculationResult = {
  totalXpNeeded: number;
  artifactCount: number;
  prototypeCount: number;
  premiumCount: number;
  xpRange: {
    artifact: { min: number; max: number };
    prototype: { min: number; max: number };
    premium: { min: number; max: number };
  };
};

export default function InfluenceCalculator() {
  const { toast } = useToast();
  const [startLevel, setStartLevel] = useState<number>(MIN_LEVEL);
  const [targetLevel, setTargetLevel] = useState<number>(MAX_LEVEL);
  const [selectedCompanionId, setSelectedCompanionId] = useState<string>(COMPANIONS[0].id);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const selectedCompanion = useMemo(() => {
    return COMPANIONS.find(c => c.id === selectedCompanionId) || COMPANIONS[0];
  }, [selectedCompanionId]);

  const handleCalculate = () => {
    if (startLevel >= targetLevel) {
      toast({
        variant: "destructive",
        title: "Invalid Range",
        description: "Starting level must be lower than the target level.",
      });
      return;
    }

    const selectedLevels = LEVEL_DATA.slice(startLevel - 1, targetLevel - 1);
    const totalXpNeeded = selectedLevels.reduce((sum, level) => sum + level.xpToNextLevel, 0);

    const calculateGiftsForRarity = (rarity: 'artifact' | 'prototype' | 'premium') => {
      let giftCount = 0;
      let excessXp = 0;

      for (const level of selectedLevels) {
        const xpForThisLevel = level.xpToNextLevel - excessXp;
        if (xpForThisLevel <= 0) {
          excessXp = -xpForThisLevel;
          continue;
        }

        const xpPerGift = level.itemXp[rarity];
        if (xpPerGift <= 0) continue; // Avoid division by zero

        const giftsNeeded = Math.ceil(xpForThisLevel / xpPerGift);
        giftCount += giftsNeeded;
        
        const xpGained = giftsNeeded * xpPerGift;
        excessXp = xpGained - xpForThisLevel;
      }
      return giftCount;
    };
    
    const artifactCount = calculateGiftsForRarity('artifact');
    const prototypeCount = calculateGiftsForRarity('prototype');
    const premiumCount = calculateGiftsForRarity('premium');

    const xpRange = {
      artifact: { min: Infinity, max: -Infinity },
      prototype: { min: Infinity, max: -Infinity },
      premium: { min: Infinity, max: -Infinity },
    };

    for (const level of selectedLevels) {
        const itemXpForLevel = level.itemXp;
        xpRange.artifact.min = Math.min(xpRange.artifact.min, itemXpForLevel.artifact);
        xpRange.artifact.max = Math.max(xpRange.artifact.max, itemXpForLevel.artifact);
        xpRange.prototype.min = Math.min(xpRange.prototype.min, itemXpForLevel.prototype);
        xpRange.prototype.max = Math.max(xpRange.prototype.max, itemXpForLevel.prototype);
        xpRange.premium.min = Math.min(xpRange.premium.min, itemXpForLevel.premium);
        xpRange.premium.max = Math.max(xpRange.premium.max, itemXpForLevel.premium);
    }
    
    setResult({ 
      totalXpNeeded, 
      artifactCount,
      prototypeCount,
      premiumCount,
      xpRange
    });
  };
  
  
  const levelOptions = LEVEL_DATA.map(l => l.level).filter(l => l < MAX_LEVEL);
  const targetLevelOptions = LEVEL_DATA.map(l => l.level).filter(l => l > MIN_LEVEL && l >= startLevel);


  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LucideIcons.Calculator size={24} /> Configuration</CardTitle>
          <CardDescription>
            Select a companion and your desired influence level range.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>Companion</Label>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-level">Start Level</Label>
                <Select
                  value={String(startLevel)}
                  onValueChange={(value) => {
                    const newStartLevel = Number(value);
                    setStartLevel(newStartLevel);
                    if (newStartLevel >= targetLevel) {
                      setTargetLevel(newStartLevel + 1 > MAX_LEVEL ? MAX_LEVEL : newStartLevel + 1);
                    }
                  }}
                >
                  <SelectTrigger id="start-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {levelOptions.map(level => (
                      <SelectItem key={`start-${level}`} value={String(level)}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-level">Target Level</Label>
                <Select
                  value={String(targetLevel)}
                  onValueChange={(value) => setTargetLevel(Number(value))}
                >
                  <SelectTrigger id="target-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {targetLevelOptions.map(level => (
                      <SelectItem key={`target-${level}`} value={String(level)}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCalculate} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Calculate Gifts Needed
          </Button>
        </CardFooter>
      </Card>
      
      <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Important Note</AlertTitle>
          <AlertDescription>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <div className="flex-grow">
                For these calculations to be accurate, you must have the <strong>Legacy of Altruism III</strong> character perk. 
                This provides a +30% boost to influence gains from companion gifts. The total cost for all three ranks is 90,000 credits.
              </div>
              <a href="https://swtorista.com/articles/swtor-legacy-perks-guide/" target="_blank" rel="noopener noreferrer">
                <Image
                  src="https://swtorista.com/articles/wp-content/uploads/2023/11/legacyofaltruism3.png"
                  alt="Legacy of Altruism III Perk"
                  width={250}
                  height={85}
                  className="rounded-md mt-2 sm:mt-0"
                />
              </a>
            </div>
          </AlertDescription>
        </Alert>

      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>Gifts needed to go from level {startLevel} to {targetLevel} for {selectedCompanion.name}.</CardDescription>
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
                 <GiftItem rarity="Artifact" gifts={selectedCompanion.gifts.artifact} count={result.artifactCount} color="text-purple-400" xpRange={result.xpRange.artifact} />
                 <GiftItem rarity="Prototype" gifts={selectedCompanion.gifts.prototype} count={result.prototypeCount} color="text-blue-400" xpRange={result.xpRange.prototype} />
                 <GiftItem rarity="Premium" gifts={selectedCompanion.gifts.premium} count={result.premiumCount} color="text-green-400" xpRange={result.xpRange.premium} />
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

function GiftItem({ rarity, gifts, count, color, xpRange }: { rarity: string, gifts: GiftInfo[], count: number, color: string, xpRange: { min: number, max: number } }) {
  if (count === 0 || !isFinite(count)) return null;
  const gift = gifts[0];
  // @ts-ignore
  const IconComponent = LucideIcons[gift.icon] || LucideIcons.Gift;

  const xpText = xpRange.min === xpRange.max
    ? `${xpRange.min.toLocaleString()} XP each`
    : `${xpRange.min.toLocaleString()} - ${xpRange.max.toLocaleString()} XP each`;

  return (
    <div className="flex items-center justify-between p-3 bg-background rounded-md border">
        <div className="flex items-center gap-3">
            <IconComponent className={cn("h-6 w-6", color)} />
            <div>
                <p className="font-semibold">{rarity} <span className='text-sm text-muted-foreground'>({gift.name}{gift.type && ` - ${gift.type}`})</span></p>
                <p className="text-xs text-muted-foreground">{xpText}</p>
            </div>
        </div>
        <p className="text-lg font-bold">{count.toLocaleString()}</p>
    </div>
  )
}
