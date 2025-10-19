import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase, User } from '@/lib/supabase';
import { FileText, CheckCircle, Clock, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';

interface LetterGeneratorProps {
  user: User;
  onLetterGenerated: () => void;
}

const generationSteps = [
  { id: 1, title: 'Request Received', description: 'Processing your letter request', icon: FileText },
  { id: 2, title: 'Under Attorney Review', description: 'Legal experts reviewing content', icon: Eye },
  { id: 3, title: 'Posted to "My Letters"', description: 'Letter saved to your account', icon: CheckCircle },
  { id: 4, title: 'Ready for Preview/Download', description: 'Letter ready for download', icon: Download }
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

      // Simulate the 4-step process
      const stepDuration = 2000; // 2 seconds per step
      
      for (let step = 1; step <= 4; step++) {
        setTimeout(() => {
          setCurrentStep(step);
          if (step === 4) {
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
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 animate-spin" />
              Generating Your Legal Letter
            </CardTitle>
            <CardDescription>Please wait while we process your request</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={(currentStep / 4) * 100} className="w-full" />
              <div className="grid gap-3">
                {generationSteps.map((step) => {
                  const Icon = step.icon;
                  const isActive = currentStep >= step.id;
                  const isCurrent = currentStep === step.id;
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        isActive 
                          ? 'bg-green-100 border-green-200 border' 
                          : 'bg-gray-50 border-gray-200 border'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {isActive ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <Icon className={`w-4 h-4 ${isCurrent ? 'text-blue-600 animate-pulse' : 'text-gray-500'}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${isActive ? 'text-green-800' : 'text-gray-700'}`}>
                          {step.title}
                        </div>
                        <div className={`text-sm ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                          {step.description}
                        </div>
                      </div>
                      {isCurrent && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
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
              className="w-full" 
              disabled={isGenerating}
              size="lg"
            >
              {isGenerating ? 'Generating Letter...' : 'Generate Legal Letter'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}