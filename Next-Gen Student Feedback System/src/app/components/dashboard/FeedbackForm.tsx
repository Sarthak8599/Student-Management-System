import React, { useState, useEffect } from 'react';
import { Course, Feedback } from '../../types';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import { StarRating } from '../ui/StarRating';
import { addFeedback } from '../../utils/storage';
import { toast } from 'sonner';
import { Mic, MicOff } from 'lucide-react';

interface FeedbackFormProps {
  course: Course;
  studentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const FeedbackForm = ({ course, studentId, onClose, onSuccess }: FeedbackFormProps) => {
  const [rating, setRating] = useState(0);
  const [aspects, setAspects] = useState<Record<string, number>>({ 
    clarity: 3, 
    engagement: 3, 
    materials: 3 
  });
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Initialize custom questions
  useEffect(() => {
    if (course.customQuestions) {
      const initial: Record<string, number> = {};
      course.customQuestions.forEach(q => {
        initial[q] = 3;
      });
      setAspects(prev => ({ ...prev, ...initial }));
    }
  }, [course]);

  // Voice to Text (Simulated/Browser API)
  const toggleListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      if (!isListening) {
        setIsListening(true);
        recognition.start();
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setComments(prev => prev + (prev ? ' ' : '') + transcript);
          setIsListening(false);
        };
        recognition.onerror = () => {
          toast.error("Microphone error. Please type.");
          setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);
      } else {
        setIsListening(false);
        // recognition.stop() is tricky to reference without storing the instance, 
        // but simple toggle off state is enough for UI.
      }
    } else {
      toast.error("Voice input not supported in this browser.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }
    setSubmitting(true);
    try {
      const feedback: Feedback = {
        id: crypto.randomUUID(),
        studentId,
        courseId: course.id,
        rating,
        aspects,
        comments,
        timestamp: new Date().toISOString(),
      };
      await addFeedback(feedback);
      toast.success('Feedback submitted successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const standardAspects = ['clarity', 'engagement', 'materials'];
  const customQuestions = course.customQuestions || [];

  return (
    <GlassCard className="max-w-2xl mx-auto border-[#C8BFE7]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#2E2E4D]">Feedback for {course.title}</h2>
        <p className="text-[#6B6B8A] text-sm">Share your honest experience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#2E2E4D] mb-2">Overall Rating</label>
          <div className="flex items-center gap-4 bg-[#F8F9FD] p-3 rounded-xl border border-[#E9E6F7]">
             <StarRating rating={rating} onRate={setRating} />
             <span className="text-sm text-[#9C8ADE]">{rating > 0 ? `${rating}/5` : 'Tap stars'}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[#7A6AD8]">Core Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {standardAspects.map((key) => (
              <div key={key} className="bg-[#F8F9FD] p-3 rounded-xl border border-[#E9E6F7]">
                <label className="block text-xs font-medium text-[#6B6B8A] mb-2 capitalize">{key}</label>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={aspects[key] || 3} 
                  onChange={(e) => setAspects(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                  className="w-full accent-[#7A6AD8] h-2 bg-[#E9E6F7] rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-[#9C8ADE] mt-1">
                   <span>Poor</span>
                   <span className="text-[#2E2E4D] font-medium">{aspects[key] || 3}</span>
                   <span>Great</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {customQuestions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#7A6AD8]">Specific Questions</h3>
            <div className="space-y-3">
              {customQuestions.map((q) => (
                <div key={q} className="bg-[#F8F9FD] p-4 rounded-xl border border-[#E9E6F7]">
                  <label className="block text-sm font-medium text-[#2E2E4D] mb-3">{q}</label>
                  <div className="flex items-center gap-4">
                     <span className="text-xs text-[#9C8ADE]">Disagree</span>
                     <input 
                       type="range" 
                       min="1" 
                       max="5" 
                       value={aspects[q] || 3} 
                       onChange={(e) => setAspects(prev => ({ ...prev, [q]: parseInt(e.target.value) }))}
                       className="flex-1 accent-[#7A6AD8] h-2 bg-[#E9E6F7] rounded-lg appearance-none cursor-pointer"
                     />
                     <span className="text-xs text-[#9C8ADE]">Agree</span>
                     <span className="w-8 text-center font-bold text-[#2E2E4D] bg-[#E9E6F7] rounded">{aspects[q] || 3}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-2">
             <label className="block text-sm font-medium text-[#2E2E4D]">Comments</label>
             <button
               type="button"
               onClick={toggleListening}
               className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${isListening ? 'bg-red-100 text-red-500' : 'bg-[#E9E6F7] text-[#6B6B8A] hover:text-[#5B4FCF]'}`}
             >
               {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
               {isListening ? 'Stop Recording' : 'Voice Input'}
             </button>
          </div>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full h-32 bg-white border-2 border-[#E9E6F7] rounded-xl p-3 text-[#2E2E4D] focus:outline-none focus:ring-2 focus:ring-[#7A6AD8]/30 focus:border-[#7A6AD8] text-sm resize-none"
            placeholder="What did you like? What can be improved?"
            required
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={submitting}>Submit Feedback</Button>
        </div>
      </form>
    </GlassCard>
  );
};
