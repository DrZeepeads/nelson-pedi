import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{text: string, sender: "user" | "ai"}>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to use the chat feature.",
        variant: "destructive"
      });
      return;
    }

    // Add user message
    setMessages(prev => [...prev, { text: message, sender: "user" }]);
    const userQuestion = message;
    setMessage("");
    
    // Show typing indicator
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('nelson-chat', {
        body: {
          message: userQuestion,
          userId: user.id
        }
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message);
      }

      if (!data || !data.answer) {
        throw new Error("Invalid response from AI");
      }

      // Add AI response
      setMessages(prev => [...prev, { 
        text: data.answer, 
        sender: "ai" 
      }]);
    } catch (error: any) {
      console.error("Error in chat:", error);
      const errorMessage = error?.message || "An unexpected error occurred";
      toast({
        title: "Chat Error",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive"
      });
      setMessages(prev => [...prev, { 
        text: "I apologize, but I encountered an error processing your request. Please try again in a moment.", 
        sender: "ai" 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Card className="flex-1 p-4 mb-4 overflow-auto">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <div className="text-center text-muted-foreground p-8">
                <h3 className="font-medium text-lg mb-2">Welcome to Nelson-GPT</h3>
                <p className="mb-4">Ask any pediatric medical question to get evidence-based answers from the Nelson Textbook of Pediatrics.</p>
                <div className="grid grid-cols-1 gap-2 mt-4">
                  <Button variant="outline" onClick={() => setMessage("What are the causes of neonatal jaundice?")}>
                    What are the causes of neonatal jaundice?
                  </Button>
                  <Button variant="outline" onClick={() => setMessage("How do you diagnose and treat bronchiolitis?")}>
                    How do you diagnose and treat bronchiolitis?
                  </Button>
                  <Button variant="outline" onClick={() => setMessage("What is the differential diagnosis for fever in infants?")}>
                    What is the differential diagnosis for fever in infants?
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted prose prose-sm max-w-none"
                }`}
              >
                {msg.sender === "user" ? (
                  msg.text
                ) : (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted max-w-[80%] p-3 rounded-lg">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-75"></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </Card>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a medical question..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={isTyping}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default Chat;
