"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { MAX_LEVEL, MIN_LEVEL, Companion, GiftInfo } from '@/lib/swtor-data';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";


import companionsData from '@/lib/data/companions.json';
import influenceData from '@/lib/data/swtor-influence-data.json';

const COMPANIONS: Companion[] = companionsData.companions;
const LEVEL_DATA = influenceData.levels;
const LEVEL_OPTIONS = Array.from({ length: MAX_LEVEL }, (_, i) => ({
  value: (i + 1).toString(),
  label: `Level ${i + 1}`,
}));


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
  const [selectedCompanionId, setSelectedCompanionId] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const selectedCompanion = useMemo(() => {
    return COMPANIONS.find(c => c.id === selectedCompanionId);
  }, [selectedCompanionId]);

  const handleCalculate = () => {
    if (!selectedCompanion) {
      toast({
        variant: "destructive",
        title: "No Companion Selected",
        description: "Please select a companion before calculating.",
      });
      return;
    }
    
    const parsedStartLevel = startLevel;
    const parsedTargetLevel = targetLevel;

    if (isNaN(parsedStartLevel) || isNaN(parsedTargetLevel) || parsedStartLevel < MIN_LEVEL || parsedStartLevel > MAX_LEVEL || parsedTargetLevel < MIN_LEVEL || parsedTargetLevel > MAX_LEVEL) {
        toast({
            variant: "destructive",
            title: "Invalid Level Range",
            description: `Levels must be between ${MIN_LEVEL} and ${MAX_LEVEL}.`,
        });
        return;
    }

    if (parsedStartLevel >= parsedTargetLevel) {
      toast({
        variant: "destructive",
        title: "Invalid Range",
        description: "Starting level must be lower than the target level.",
      });
      return;
    }

    const selectedLevels = LEVEL_DATA.slice(parsedStartLevel - 1, parsedTargetLevel - 1);
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
        if (xpPerGift <= 0) return Infinity; 

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

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-primary/20 bg-card/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className='flex-1'>
              <CardTitle className="flex items-center gap-2">Configuration</CardTitle>
              <CardDescription>
                Select a companion and your desired influence level range.
              </CardDescription>
            </div>
            <Alert className="p-3 bg-accent/10 border-accent/50 text-accent-foreground [&>svg]:text-yellow-400 max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-sm font-semibold text-yellow-400">Legacy Perk Required</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                Calculations require <strong>Legacy of Altruism III</strong> for accuracy (+30% influence).
              </AlertDescription>
            </Alert>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>Companion</Label>
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={comboboxOpen}
                      className="w-full justify-between"
                    >
                      {selectedCompanion ? (
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
                      ) : (
                        "Select a companion..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" style={{width: 'var(--radix-popover-trigger-width)'}}>
                    <Command>
                      <CommandInput placeholder="Search companion..." />
                      <CommandList>
                        <CommandEmpty>No companion found.</CommandEmpty>
                        <CommandGroup>
                          {COMPANIONS.map((companion) => (
                            <CommandItem
                              key={companion.id}
                              value={companion.name}
                              onSelect={() => {
                                setSelectedCompanionId(companion.id);
                                setComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCompanionId === companion.id ? "opacity-100" : "opacity-0"
                                )}
                              />
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
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-level">Start Level</Label>
                <LevelCombobox
                    value={startLevel}
                    onChange={setStartLevel}
                    min={MIN_LEVEL}
                    max={MAX_LEVEL - 1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-level">Target Level</Label>
                 <LevelCombobox
                    value={targetLevel}
                    onChange={setTargetLevel}
                    min={MIN_LEVEL + 1}
                    max={MAX_LEVEL}
                />
              </div>
            </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCalculate} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Calculate Gifts Needed
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-lg border-primary/20 bg-card/30 backdrop-blur-sm">
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
                <CardTitle>Results</CardTitle>
                {selectedCompanion && result ? (
                    <CardDescription>Gifts needed from level {startLevel} to {targetLevel} for {selectedCompanion.name}.</CardDescription>
                ) : (
                    <CardDescription>Select a companion and calculate to see results.</CardDescription>
                )}
            </div>
            {selectedCompanion && result && (
              <div className="flex items-center gap-4">
                 <Image 
                      src={selectedCompanion.imageUrl}
                      alt={selectedCompanion.name}
                      width={60}
                      height={60}
                      className="rounded-lg border-2 border-primary"
                      priority
                  />
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total XP Needed</p>
                  <p className="text-3xl font-bold text-primary">{result.totalXpNeeded.toLocaleString()}</p>
                </div>
              </div>
            )}
        </CardHeader>
        <CardContent>
          {selectedCompanion && result ? (
            <div className="space-y-4">
              <div className="flex-1 space-y-3">
                 <GiftItem rarity="Artifact" gift={selectedCompanion.gifts.artifact} count={result.artifactCount} xpRange={result.xpRange.artifact} />
                 <GiftItem rarity="Prototype" gift={selectedCompanion.gifts.prototype} count={result.prototypeCount} xpRange={result.xpRange.prototype} />
                 <GiftItem rarity="Premium" gift={selectedCompanion.gifts.premium} count={result.premiumCount} xpRange={result.xpRange.premium} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-16">
              <LucideIcons.MousePointerClick size={48} className="mb-4" />
              <p>Select a companion and calculate to see results.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GiftItem({ rarity, gift, count, xpRange }: { rarity: string, gift: GiftInfo, count: number, xpRange: { min: number, max: number } }) {
  if (count === 0 || !isFinite(count) || !gift.name) return null;
  
  const xpText = xpRange.min === xpRange.max
    ? `${xpRange.min.toLocaleString()} XP each`
    : `${xpRange.min.toLocaleString()} - ${xpRange.max.toLocaleString()} XP each`;

  const rarityLower = rarity.toLowerCase();

  return (
    <div 
        className="flex items-center justify-between p-3 rounded-md border"
        style={{
            backgroundColor: `hsl(var(--gift-${rarityLower}-bg))`,
            borderColor: `hsl(var(--gift-${rarityLower}-border))`
        }}
    >
        <div className="flex items-center gap-3">
             <Image 
                src={gift.imageUrl}
                alt={gift.name}
                width={40}
                height={40}
                className={'rounded-md border-2 p-0.5'}
                style={{
                    borderColor: `hsl(var(--gift-${rarityLower}-border))`
                }}
             />
            <div>
                <p className="font-semibold">{gift.name} <span className='text-sm text-muted-foreground ml-0.5'>({rarity})</span></p>
                <p className="text-xs text-muted-foreground">{xpText}</p>
            </div>
        </div>
        <p className="text-lg font-bold">{count.toLocaleString()}</p>
    </div>
  )
}

function LevelCombobox({ value, onChange, min, max }: { value: number, onChange: (value: number) => void, min: number, max: number }) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());

  const handleSelect = (currentValue: string) => {
    const numValue = Number(currentValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
      setInputValue(currentValue);
      setOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleInputBlur = () => {
    const numValue = Number(inputValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    } else {
      // Reset to last valid value if input is invalid
      setInputValue(value.toString());
    }
  };


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            type="number"
            min={min}
            max={max}
            className="w-full"
          />
          <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search level..." />
          <CommandList>
            <CommandEmpty>No level found.</CommandEmpty>
            <CommandGroup>
              {LEVEL_OPTIONS.filter(opt => Number(opt.value) >= min && Number(opt.value) <= max).map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.toString() === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

    