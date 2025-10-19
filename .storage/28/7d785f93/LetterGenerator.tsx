import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase, User } from '@/lib/supabase';
import { FileText, CheckCircle, Clock, Eye, Download, Sparkles, Zap, Star, Award } from 'lucide-react';
import { toast } from 'sonner';

interface LetterGeneratorProps {
  user: User;
  onLetterGenerated: () => void;
}

const generationSteps = [
  { 
    id: 1, 
    title: 'Request Received', 
    description: 'Processing your letter request', 
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500',
    particles: '✨'
  },
  { 
    id: 2, 
    title: 'Under Attorney Review', 
    description: 'Legal experts reviewing content', 
    icon: Eye,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500',
    particles: '⚖️'
  },
  { 
    id: 3, 
    title: 'Posted to "My Letters"', 
    description: 'Letter saved to your account', 
    icon: CheckCircle,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500',
    particles: '📄'
  },
  { 
    id: 4, 
    title: 'Ready for Preview/Download', 
    description: 'Letter ready for download', 
    icon: Download,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500',
    particles: '🎉'
  }
];

export default function LetterGenerator({ user, onLetterGenerated }: LetterGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    senderName: user.fullName,
    senderAddress: '',
    recipientName: '',
    recipientAddress: '',
    matter: '',
    resolution: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setCurrentStep(0);

    try {
      // Create letter in database
      await supabase.createLetter({
        userId: user.id,
        ...formData,
        content: '' // Will be filled by AI generation
      });

      // Simulate the 4-step process with enhanced timing
      const stepDuration = 2000; // 2 seconds per step
      
      for (let step = 1; step <= 4; step++) {
        setTimeout(() => {
          setCurrentStep(step);
          if (step === 4) {
            setTimeout(() => {
              setIsGenerating(false);
              onLetterGenerated();
              toast.success('Legal letter generated successfully!');
              // Reset form
              setFormData({
                senderName: user.fullName,
                senderAddress: '',
                recipientName: '',
                recipientAddress: '',
                matter: '',
                resolution: ''
              });
            }, 1000); // Extra delay for final celebration
          }
        }, step * stepDuration);
      }
    } catch (error) {
      setIsGenerating(false);
      setCurrentStep(0);
      toast.error('Failed to generate letter. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {isGenerating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative">
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                >
                  <span className="text-2xl opacity-30">
                    {['✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 4)]}
                  </span>
                </div>
              ))}
            </div>

            <Card className="w-full max-w-2xl mx-auto border-0 shadow-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
              {/* Animated header with pulsing effect */}
              <CardHeader className="text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
                <div className="relative z-10">
                  <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-spin">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                    ⚡ Generating Your Legal Letter ⚡
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-lg mt-2">
                    AI-Powered Legal Document Creation in Progress
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Enhanced progress bar with glow effect */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                    <Progress 
                      value={(currentStep / 4) * 100} 
                      className="w-full h-4 relative z-10 bg-slate-800 border border-purple-500/30" 
                    />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                      <span className="text-xs font-bold text-white bg-purple-600 px-2 py-1 rounded-full animate-bounce">
                        {Math.round((currentStep / 4) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Enhanced step indicators */}
                  <div className="grid gap-6">
                    {generationSteps.map((step) => {
                      const Icon = step.icon;
                      const isActive = currentStep >= step.id;
                      const isCurrent = currentStep === step.id;
                      
                      return (
                        <div
                          key={step.id}
                          className={`relative transform transition-all duration-700 ${
                            isActive ? 'scale-105' : 'scale-95'
                          } ${isCurrent ? 'animate-pulse' : ''}`}
                        >
                          {/* Glowing background for active step */}
                          {isCurrent && (
                            <div className={`absolute inset-0 bg-gradient-to-r ${step.color} opacity-20 rounded-xl blur-xl animate-pulse`}></div>
                          )}
                          
                          <div className={`relative flex items-center gap-6 p-6 rounded-xl border-2 transition-all duration-500 ${
                            isActive 
                              ? `bg-gradient-to-r ${step.color} border-white/30 shadow-2xl` 
                              : 'bg-slate-800/50 border-slate-700 shadow-lg'
                          }`}>
                            {/* Enhanced icon with animations */}
                            <div className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                              isActive ? 'bg-white/20 shadow-lg' : 'bg-slate-700'
                            }`}>
                              {/* Rotating ring for current step */}
                              {isCurrent && (
                                <div className="absolute inset-0 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                              )}
                              
                              {isActive ? (
                                <div className="relative">
                                  <CheckCircle className="w-8 h-8 text-white animate-bounce" />
                                  {/* Success particles */}
                                  <div className="absolute -top-2 -right-2 text-lg animate-ping">
                                    {step.particles}
                                  </div>
                                </div>
                              ) : (
                                <Icon className={`w-8 h-8 transition-all duration-300 ${
                                  isCurrent ? 'text-white animate-pulse scale-110' : 'text-gray-400'
                                }`} />
                              )}
                            </div>

                            {/* Enhanced content */}
                            <div className="flex-1">
                              <div className={`font-bold text-xl transition-all duration-300 ${
                                isActive ? 'text-white' : 'text-gray-400'
                              }`}>
                                {step.title}
                                {isCurrent && (
                                  <span className="ml-2 inline-flex">
                                    <Zap className="w-5 h-5 text-yellow-400 animate-bounce" />
                                  </span>
                                )}
                              </div>
                              <div className={`text-sm mt-1 transition-all duration-300 ${
                                isActive ? 'text-white/80' : 'text-gray-500'
                              }`}>
                                {step.description}
                              </div>
                              
                              {/* Progress indicator for current step */}
                              {isCurrent && (
                                <div className="mt-3 flex items-center gap-2">
                                  <div className="flex space-x-1">
                                    {[...Array(3)].map((_, i) => (
                                      <div
                                        key={i}
                                        className="w-2 h-2 bg-white rounded-full animate-bounce"
                                        style={{ animationDelay: `${i * 0.2}s` }}
                                      ></div>
                                    ))}
                                  </div>
                                  <span className="text-white/60 text-xs font-medium">Processing...</span>
                                </div>
                              )}
                            </div>

                            {/* Status indicator */}
                            <div className="flex flex-col items-center gap-2">
                              {isActive && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-400 animate-spin" />
                                  <span className="text-xs text-white/80 font-medium">Complete</span>
                                </div>
                              )}
                              {isCurrent && (
                                <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Final celebration animation */}
                  {currentStep === 4 && (
                    <div className="text-center py-6">
                      <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-full shadow-2xl animate-bounce">
                        <Award className="w-6 h-6 animate-spin" />
                        <span className="text-lg font-bold">Letter Generated Successfully!</span>
                        <Award className="w-6 h-6 animate-spin" />
                      </div>
                      <div className="mt-4 text-2xl animate-bounce">
                        🎉 🎊 ✨ 🎉 🎊
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Generate Legal Letter</CardTitle>
          <CardDescription>
            Fill in the details below to generate a professional legal letter using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sender Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="senderName">Your Name</Label>
                  <Input
                    id="senderName"
                    value={formData.senderName}
                    onChange={(e) => handleInputChange('senderName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderAddress">Your Address</Label>
                  <Textarea
                    id="senderAddress"
                    placeholder="Enter your full address"
                    value={formData.senderAddress}
                    onChange={(e) => handleInputChange('senderAddress', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recipient Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    placeholder="Enter recipient's name"
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientAddress">Recipient Address</Label>
                  <Textarea
                    id="recipientAddress"
                    placeholder="Enter recipient's full address"
                    value={formData.recipientAddress}
                    onChange={(e) => handleInputChange('recipientAddress', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Letter Details</h3>
              <div className="space-y-2">
                <Label htmlFor="matter">Matter/Subject</Label>
                <Input
                  id="matter"
                  placeholder="e.g., Breach of Contract, Property Dispute, etc."
                  value={formData.matter}
                  onChange={(e) => handleInputChange('matter', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resolution">Desired Resolution</Label>
                <Textarea
                  id="resolution"
                  placeholder="Describe what you want to achieve with this letter"
                  value={formData.resolution}
                  onChange={(e) => handleInputChange('resolution', e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105" 
              disabled={isGenerating}
              size="lg"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Generating Letter...
                  <Sparkles className="w-5 h-5 animate-spin" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Generate Legal Letter
                  <Zap className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}