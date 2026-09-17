'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AGE_RANGES,
  TRAVEL_GROUPS,
  BUDGET_PREFERENCES,
  TRAVEL_STYLES,
  INTEREST_OPTIONS,
  FOOD_PREFERENCES,
  ADVENTURE_PREFERENCES,
  ACCOMMODATION_PREFERENCES,
} from '@/lib/constants';
import { ArrowRight, ArrowLeft, Check, Compass, User, Heart, Utensils, Home } from 'lucide-react';

const STEPS = [
  { title: 'Basic Info', icon: User, description: 'Tell us about yourself' },
  { title: 'Travel Style', icon: Compass, description: 'How do you like to travel?' },
  { title: 'Interests', icon: Heart, description: 'What excites you?' },
  { title: 'Preferences', icon: Utensils, description: 'Food & accommodation' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    age_range: user?.age_range || '',
    travel_group: user?.travel_group || '',
    budget_preference: user?.budget_preference || '',
    travel_style: user?.travel_style || '',
    interests: user?.interests || [] as string[],
    food_preferences: user?.food_preferences || [] as string[],
    adventure_preference: user?.adventure_preference || '',
    accommodation_preference: user?.accommodation_preference || '',
  });

  const progress = ((step + 1) / STEPS.length) * 100;

  const updateField = (field: string, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'interests' | 'food_preferences', item: string) => {
    setForm(prev => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item],
      };
    });
  };

  const handleComplete = () => {
    updateProfile({
      ...form,
      onboarding_complete: true,
    });
    router.push('/dashboard');
  };

  const SelectableGrid = ({
    options,
    selected,
    onSelect,
  }: {
    options: string[];
    selected: string;
    onSelect: (v: string) => void;
  }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className={`px-4 py-3 rounded-2xl border text-sm text-left transition-all font-sans shadow-sm ${
            selected === option
              ? 'border-[#0E4D4A] bg-[#0E4D4A]/5 text-[#0E4D4A] font-bold shadow-md'
              : 'border-[#1F3D2B]/10 bg-[#FFFFFF] hover:border-[#1F3D2B]/30 text-[#1F3D2B]'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-[#FAF7F2]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#1F3D2B] flex items-center justify-center shadow-md">
              <Compass className="w-5 h-5 text-[#FAF7F2]" />
            </div>
            <span className="text-2xl font-bold font-serif text-[#1F3D2B]">
              TravelPulse <span className="text-[#E27D4F] font-sans font-bold">AI</span>
            </span>
          </div>
          <p className="text-[#6B6B6B] font-sans">Personalize your experience</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium font-sans transition-all shadow-sm ${
                    i <= step
                      ? 'bg-[#E27D4F] text-white'
                      : 'bg-[#FFFFFF] text-[#6B6B6B] border border-[#1F3D2B]/10'
                  }`}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`hidden sm:block w-12 h-0.5 ${i < step ? 'bg-[#E27D4F]' : 'bg-[#1F3D2B]/10'}`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-1.5 bg-[#1F3D2B]/5 [&>div]:bg-[#E27D4F]" />
        </div>

        <Card className="bg-[#FFFFFF] border-0 shadow-editorial-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-[#FAF7F2]/50 border-b border-[#1F3D2B]/5 pb-5">
            <CardTitle className="flex items-center gap-2 font-serif text-xl text-[#1F3D2B]">
              {(() => { const Icon = STEPS[step].icon; return <Icon className="w-5 h-5 text-[#0E4D4A]" />; })()}
              {STEPS[step].title}
            </CardTitle>
            <CardDescription className="font-sans text-[#6B6B6B] mt-1">{STEPS[step].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {step === 0 && (
                  <>
                    <div className="space-y-2">
                      <Label className="font-sans text-[#1F3D2B] font-bold">Full Name</Label>
                      <Input
                        placeholder="Your name"
                        value={form.full_name}
                        onChange={e => updateField('full_name', e.target.value)}
                        className="font-sans h-12 rounded-full border-[#1F3D2B]/20 bg-[#FAF7F2] px-4"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Age Range</Label>
                      <SelectableGrid options={AGE_RANGES} selected={form.age_range} onSelect={v => updateField('age_range', v)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Travel Group</Label>
                      <SelectableGrid options={TRAVEL_GROUPS} selected={form.travel_group} onSelect={v => updateField('travel_group', v)} />
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label>Budget Preference</Label>
                      <SelectableGrid options={BUDGET_PREFERENCES} selected={form.budget_preference} onSelect={v => updateField('budget_preference', v)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Travel Style</Label>
                      <SelectableGrid options={TRAVEL_STYLES} selected={form.travel_style} onSelect={v => updateField('travel_style', v)} />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label className="font-sans text-[#1F3D2B] font-bold">Interests (select multiple)</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {INTEREST_OPTIONS.map(interest => (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleArrayItem('interests', interest)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm transition-all font-sans shadow-sm ${
                              form.interests.includes(interest)
                                ? 'border-[#0E4D4A] bg-[#0E4D4A]/5 text-[#0E4D4A] font-bold shadow-md'
                                : 'border-[#1F3D2B]/10 bg-[#FFFFFF] hover:border-[#1F3D2B]/30 text-[#1F3D2B]'
                            }`}
                          >
                            <Checkbox 
                              checked={form.interests.includes(interest)} 
                              className={`pointer-events-none ${form.interests.includes(interest) ? 'border-[#0E4D4A] data-[state=checked]:bg-[#0E4D4A]' : 'border-[#1F3D2B]/20'}`} 
                            />
                            {interest}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Adventure Preference</Label>
                      <SelectableGrid options={ADVENTURE_PREFERENCES} selected={form.adventure_preference} onSelect={v => updateField('adventure_preference', v)} />
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="space-y-2">
                      <Label className="font-sans text-[#1F3D2B] font-bold">Food Preferences (select multiple)</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {FOOD_PREFERENCES.map(pref => (
                          <button
                            key={pref}
                            type="button"
                            onClick={() => toggleArrayItem('food_preferences', pref)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm transition-all font-sans shadow-sm ${
                              form.food_preferences.includes(pref)
                                ? 'border-[#0E4D4A] bg-[#0E4D4A]/5 text-[#0E4D4A] font-bold shadow-md'
                                : 'border-[#1F3D2B]/10 bg-[#FFFFFF] hover:border-[#1F3D2B]/30 text-[#1F3D2B]'
                            }`}
                          >
                            <Checkbox 
                              checked={form.food_preferences.includes(pref)} 
                              className={`pointer-events-none ${form.food_preferences.includes(pref) ? 'border-[#0E4D4A] data-[state=checked]:bg-[#0E4D4A]' : 'border-[#1F3D2B]/20'}`} 
                            />
                            {pref}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Accommodation Preference</Label>
                      <SelectableGrid options={ACCOMMODATION_PREFERENCES} selected={form.accommodation_preference} onSelect={v => updateField('accommodation_preference', v)} />
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className="h-12 rounded-full font-sans border-[#1F3D2B]/20 text-[#1F3D2B] hover:bg-[#FAF7F2] px-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {step < STEPS.length - 1 ? (
                <Button
                  className="h-12 rounded-full font-sans bg-[#1F3D2B] hover:bg-[#0E4D4A] text-white border-0 px-8 shadow-sm"
                  onClick={() => setStep(s => s + 1)}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  className="h-12 rounded-full font-sans bg-[#E27D4F] hover:bg-[#CB6639] text-white border-0 px-8 shadow-sm"
                  onClick={handleComplete}
                >
                  Complete Setup
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <button
            onClick={() => {
              updateProfile({ onboarding_complete: true });
              router.push('/dashboard');
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
