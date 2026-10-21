import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { ChatMessage } from '../types';
import { Send, Loader2, MessageSquare, User } from 'lucide-react';
import { toast } from 'sonner';
import { Seo } from '../components/Seo';

export function DashboardPage() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      if (data) setMessages(data);
    } catch (error: any) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      // Save user message
      const { data: userMsgData, error: userMsgError } = await supabase
        .from('chat_messages')
        .insert([{
          user_id: user!.id,
          role: 'user',
          content: userMessage,
        }])
        .select()
        .single();

      if (userMsgError) throw userMsgError;
      setMessages(prev => [...prev, userMsgData]);

      // Call AI
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('chat', {
        body: {
          messages: [...messages, { role: 'user', content: userMessage }],
        },
      });

      if (aiError) throw aiError;

      const assistantMessage = aiResponse.message;

      // Save assistant message
      const { data: assistantMsgData, error: assistantMsgError } = await supabase
        .from('chat_messages')
        .insert([{
          user_id: user!.id,
          role: 'assistant',
          content: assistantMessage,
        }])
        .select()
        .single();

      if (assistantMsgError) throw assistantMsgError;
      setMessages(prev => [...prev, assistantMsgData]);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Seo title="NeurusAGi Dashboard" description="Your NeurusAGi workspace." path="/dashboard" noindex />

      <section className="section-container">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="heading-lg mb-2">
              Welcome back, {profile?.username || 'User'}!
            </h1>
            <p className="text-muted-foreground">
              Chat with NeurusAGi
            </p>
          </div>

          {/* Chat Container */}
          <div className="glass-strong rounded-2xl neural-glow overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 300px)' }}>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingHistory ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="w-16 h-16 text-primary/30 mb-4" />
                  <h3 className="heading-sm mb-2">Start a Conversation</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Ask me anything! I'm here to help with reasoning, analysis, and creative tasks.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground'
                          : 'glass border border-primary/20'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {msg.role === 'assistant' && (
                          <MessageSquare className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        )}
                        {msg.role === 'user' && (
                          <User className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="glass border border-primary/20 rounded-2xl px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-primary/20 p-4">
              <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  className="input-field flex-1 min-h-[50px] max-h-[150px] resize-none"
                  placeholder="Type your message... (Shift+Enter for new line)"
                  disabled={loading}
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="btn-primary px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
