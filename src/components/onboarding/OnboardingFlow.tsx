
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, BookOpen, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const INTEREST_CATEGORIES = [
  { id: "productivity", label: "Productivity" },
  { id: "mindfulness", label: "Mindfulness" },
  { id: "personal-growth", label: "Personal Growth" },
  { id: "technology", label: "Technology" },
  { id: "creativity", label: "Creativity" },
  { id: "philosophy", label: "Philosophy" },
  { id: "health", label: "Health & Wellness" },
  { id: "career", label: "Career & Business" },
  { id: "science", label: "Science" },
  { id: "psychology", label: "Psychology" },
  { id: "literature", label: "Literature" },
  { id: "art", label: "Arts & Design" },
];

const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const [interests, setInterests] = useState<string[]>([]);
  const navigate = useNavigate();
  
  const handleInterestToggle = (interestId: string) => {
    setInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };
  
  const handleComplete = () => {
    // In a real app, save user preferences to backend
    toast({
      title: "Onboarding complete!",
      description: "Your personalized ThreadSpire experience is ready.",
    });
    navigate("/");
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8 text-center">
            <div>
              <div className="mx-auto w-16 h-16 bg-threadspire-navy/10 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-threadspire-navy" />
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-playfair font-semibold">Welcome to ThreadSpire</h2>
              </div>
              <p className="text-sm text-muted-foreground italic mt-1">
                Where stories begin with a single spark
              </p>
              <p className="text-muted-foreground mt-2">
                A calm, thoughtful environment for connecting ideas and building meaningful threads of thought.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg bg-card flex items-start">
                <div className="mr-4 mt-1">
                  <Check className="h-5 w-5 text-threadspire-gold" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Threads, Not Posts</h3>
                  <p className="text-sm text-muted-foreground">
                    ThreadSpire helps you create connected segments of thought rather than isolated posts.
                  </p>
                </div>
              </div>
              
              <div className="p-4 border border-border rounded-lg bg-card flex items-start">
                <div className="mr-4 mt-1">
                  <Check className="h-5 w-5 text-threadspire-gold" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Calm Environment</h3>
                  <p className="text-sm text-muted-foreground">
                    We've designed everything to help you focus on what matters: thoughtful content and ideas.
                  </p>
                </div>
              </div>
              
              <div className="p-4 border border-border rounded-lg bg-card flex items-start">
                <div className="mr-4 mt-1">
                  <Check className="h-5 w-5 text-threadspire-gold" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Quality-Focused Community</h3>
                  <p className="text-sm text-muted-foreground">
                    Join others who value depth, nuance, and meaningful connections over quick reactions.
                  </p>
                </div>
              </div>
            </div>
            
            <Button onClick={() => setStep(2)} className="w-full">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-threadspire-navy/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-threadspire-navy" />
              </div>
              <h2 className="text-2xl font-playfair font-semibold">Tell Us What Interests You</h2>
              <p className="text-muted-foreground mt-2">
                Select topics you're interested in to personalize your experience.
              </p>
            </div>
            
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {INTEREST_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleInterestToggle(category.id)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      interests.includes(category.id) 
                        ? 'bg-threadspire-navy text-white border-threadspire-navy'
                        : 'bg-background hover:bg-threadspire-navy/5 border-border'
                    }`}
                  >
                    <div className="flex items-center">
                      {interests.includes(category.id) && (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      <span>{category.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                Selected: {interests.length} {interests.length === 1 ? 'topic' : 'topics'}
              </p>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={interests.length === 0}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-threadspire-navy/10 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-threadspire-navy" />
              </div>
              <h2 className="text-2xl font-playfair font-semibold">You're All Set!</h2>
              <p className="text-muted-foreground mt-2">
                Thanks for joining ThreadSpire. Here's what you can do next:
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg bg-card">
                <h3 className="font-medium">Explore Threads</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Discover thoughtful content from other members on topics that interest you.
                </p>
              </div>
              
              <div className="p-4 border border-border rounded-lg bg-card">
                <h3 className="font-medium">Create Your First Thread</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Share your thoughts in a structured way using our thread creator.
                </p>
              </div>
              
              <div className="p-4 border border-border rounded-lg bg-card">
                <h3 className="font-medium">Complete Your Profile</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a bio and profile picture to help others connect with you.
                </p>
              </div>
            </div>
            
            <Button onClick={handleComplete} className="w-full">
              Get Started
            </Button>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8">
        <div className="flex items-center">
          {[1, 2, 3].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-medium ${
                  stepNumber === step
                    ? 'border-threadspire-navy bg-threadspire-navy/10 text-threadspire-navy'
                    : stepNumber < step
                    ? 'border-threadspire-gold bg-threadspire-gold/10 text-threadspire-gold'
                    : 'border-muted-foreground/30 text-muted-foreground/70'
                }`}
              >
                {stepNumber < step ? <Check className="h-4 w-4" /> : stepNumber}
              </div>
              {stepNumber < 3 && (
                <div 
                  className={`flex-1 border-t-2 ${
                    stepNumber < step 
                      ? 'border-threadspire-gold' 
                      : 'border-muted-foreground/30'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        {renderStep()}
      </div>
    </div>
  );
};

export default OnboardingFlow;
