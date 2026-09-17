'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, MessageSquare, X, Send, MapPin, Route, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDestination } from '@/context/destination-context';
import { seedDestinations } from '@/lib/data/seed-destinations';
import { useRouter } from 'next/navigation';

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentDestination, setCurrentDestination } = useDestination();
  
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hi! I am the TravelPulse AI Assistant. ${currentDestination ? `I see you are planning a trip to ${currentDestination.name}. ` : ''}Tell me where you want to go, or what kind of trip you are looking for.` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const router = useRouter();

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    // Fake AI processing delay
    setTimeout(() => {
      let reply = "I can help you with that! Try searching for a destination in the Trip Planner.";
      let actionDest = null;
      
      const q = userMsg.toLowerCase();
      
      if (q.includes('goa') || q.includes('beach')) {
        reply = "Goa is perfect for beaches and nightlife! I've selected Goa for you. Would you like me to generate a customized 4-day itinerary?";
        actionDest = seedDestinations.find(d => d.id === 'dest-goa');
      } else if (q.includes('mountain') || q.includes('manali')) {
        reply = "For a mountain retreat, Manali is highly recommended. I've switched your context to Manali. Check the Trip Planner!";
        actionDest = seedDestinations.find(d => d.id === 'dest-manali');
      } else if (q.includes('rajasthan') || q.includes('jaipur')) {
        reply = "Jaipur offers incredible heritage and royal architecture. I've set your destination to Jaipur.";
        actionDest = seedDestinations.find(d => d.id === 'dest-jaipur');
      } else if (q.includes('budget') || q.includes('₹') || q.includes('rs')) {
        reply = "I can definitely plan a budget-friendly trip. Destinations like Rishikesh or Varanasi have very low average daily costs (around ₹2,500-₹3,000/day).";
        actionDest = seedDestinations.find(d => d.id === 'dest-rishikesh');
      } else if (q.includes('plan my trip') || q.includes('itinerary')) {
        if (currentDestination) {
          reply = `I can help you plan your trip to ${currentDestination.name}! Head over to the Trip Planner and I'll generate a tailored itinerary for you.`;
        } else {
          reply = "I can definitely help! Which destination are you interested in?";
        }
      }

      if (actionDest) {
        setCurrentDestination(actionDest);
      }

      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-20 w-14 h-14 rounded-full shadow-editorial-lg p-0 flex items-center justify-center bg-[#0E4D4A] hover:bg-[#1F3D2B] text-white border-0 z-50 transition-transform hover:-translate-y-1 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <Brain className="w-6 h-6" />
      </Button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-[#FFFFFF] rounded-2xl border border-[#1F3D2B]/10 shadow-editorial-lg z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-[#FAF7F2] border-b border-[#1F3D2B]/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1F3D2B] flex items-center justify-center shadow-sm">
                  <Brain className="w-4 h-4 text-[#FAF7F2]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-serif text-[#1F3D2B]">TravelPulse AI</h3>
                  <p className="text-[10px] text-[#0E4D4A] font-medium font-sans">Online</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0 text-[#1F3D2B]/50 hover:text-[#1F3D2B] hover:bg-[#1F3D2B]/5 rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm font-sans leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-[#0E4D4A]/10 text-[#1F3D2B] rounded-br-sm shadow-sm border border-[#0E4D4A]/5' 
                        : 'bg-[#FAF7F2] text-[#1C1C1C] rounded-bl-sm border border-[#1F3D2B]/10 shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl p-3 bg-[#FAF7F2] rounded-bl-sm text-sm flex gap-1.5 border border-[#1F3D2B]/10 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-[#1F3D2B]/40 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-[#1F3D2B]/40 rounded-full animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 bg-[#1F3D2B]/40 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Prompts */}
            {messages.length === 1 && (
              <div className="p-3 flex gap-2 overflow-x-auto hide-scrollbar bg-[#FAF7F2]/50 border-t border-[#1F3D2B]/5 shrink-0">
                <Badge variant="outline" className="cursor-pointer hover:bg-[#FFFFFF] bg-[#FFFFFF] border-[#1F3D2B]/10 text-[#1F3D2B] shrink-0 text-xs py-1.5 px-3 rounded-full font-sans shadow-sm transition-colors" onClick={() => setInput('Plan a 4-day Goa trip')}>
                  🏖️ 4-day Goa trip
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-[#FFFFFF] bg-[#FFFFFF] border-[#1F3D2B]/10 text-[#1F3D2B] shrink-0 text-xs py-1.5 px-3 rounded-full font-sans shadow-sm transition-colors" onClick={() => setInput('Suggest a mountain retreat')}>
                  🏔️ Mountain retreat
                </Badge>
              </div>
            )}

            {/* Input */}
            <div className="p-3 bg-[#FFFFFF] border-t border-[#1F3D2B]/10 flex gap-2 items-center shrink-0">
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-[#FAF7F2] border-0 focus-visible:ring-1 focus-visible:ring-[#1F3D2B]/20 rounded-full font-sans h-10 px-4"
              />
              <Button size="icon" onClick={handleSend} className="rounded-full bg-[#E27D4F] hover:bg-[#CB6639] border-0 shrink-0 h-10 w-10 text-white shadow-sm transition-transform hover:scale-105">
                <Send className="w-4 h-4 ml-0.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
