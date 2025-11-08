"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ConversationClient() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useVoice, setUseVoice] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setCurrentTranscript((prev) => prev + finalTranscript);
          } else {
            setCurrentTranscript((prev) => prev + interimTranscript);
          }
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          toast({
            title: "音声認識エラー",
            description: "マイクの許可を確認してください",
            variant: "destructive",
          });
        };

        recognitionRef.current = recognition;
      } else {
        toast({
          title: "音声認識非対応",
          description: "このブラウザは音声認識に対応していません",
          variant: "destructive",
        });
      }

      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start conversation session
  const startSession = async () => {
    try {
      const response = await fetch("/api/conversation/session", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to start session");
      }

      const data = await response.json();
      setSessionId(data.sessionId);

      // Add welcome message
      setMessages([
        {
          role: "assistant",
          content:
            "Hello! I'm your English conversation partner. Let's have a natural conversation. Feel free to ask me anything or just chat about your day!",
          timestamp: new Date(),
        },
      ]);

      if (useVoice && synthRef.current) {
        speak(
          "Hello! I'm your English conversation partner. Let's have a natural conversation."
        );
      }
    } catch (error) {
      console.error("Error starting session:", error);
      toast({
        title: "セッション開始エラー",
        description: "会話セッションを開始できませんでした",
        variant: "destructive",
      });
    }
  };

  // End conversation session
  const endSession = async () => {
    if (!sessionId) return;

    try {
      await fetch(`/api/conversation/session/${sessionId}`, {
        method: "PUT",
      });

      toast({
        title: "会話終了",
        description: "会話セッションが終了しました",
      });

      // Reset state
      setSessionId(null);
      setMessages([]);
      setCurrentTranscript("");
      setIsListening(false);
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  // Toggle voice recording
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      // Send the transcript as a message
      if (currentTranscript.trim()) {
        sendMessage(currentTranscript.trim());
        setCurrentTranscript("");
      }
    } else {
      setCurrentTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Text-to-speech
  const speak = (text: string) => {
    if (!synthRef.current || !useVoice) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Send message to AI
  const sendMessage = async (content: string) => {
    if (!sessionId || !content.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/conversation/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userMessage: content.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const aiMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Speak the response
      if (useVoice) {
        speak(data.response);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "送信エラー",
        description: "メッセージを送信できませんでした",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle text input send
  const handleTextSend = () => {
    if (textInput.trim()) {
      sendMessage(textInput.trim());
      setTextInput("");
    }
  };

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">AI English Conversation</h1>
          <p className="mb-6 text-muted-foreground">
            英語でAIと自由に会話練習しましょう。音声またはテキストで対話できます。
          </p>
          <Button onClick={startSession} size="lg" className="w-full">
            会話を始める
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">AI Conversation</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setUseVoice(!useVoice)}
          >
            {useVoice ? <Volume2 /> : <VolumeX />}
          </Button>
          <Button variant="destructive" onClick={endSession}>
            会話を終了
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <Card
              className={`p-4 max-w-[80%] ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </Card>
          </div>
        ))}

        {/* Current transcript (while listening) */}
        {isListening && currentTranscript && (
          <div className="flex justify-end">
            <Card className="p-4 max-w-[80%] border-dashed border-2">
              <p className="whitespace-pre-wrap italic">{currentTranscript}</p>
              <p className="text-xs mt-2 opacity-70">録音中...</p>
            </Card>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="p-4 bg-muted">
              <p className="italic">考え中...</p>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Controls */}
      <div className="border-t pt-4">
        <div className="flex gap-2 mb-2">
          <Textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="メッセージを入力... (Enterで送信)"
            className="flex-1"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleTextSend();
              }
            }}
          />
          <Button onClick={handleTextSend} disabled={!textInput.trim()}>
            <Send />
          </Button>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            variant={isListening ? "destructive" : "default"}
            onClick={toggleListening}
            disabled={isLoading}
          >
            {isListening ? <MicOff /> : <Mic />}
            {isListening ? "録音を停止" : "音声で話す"}
          </Button>

          {isSpeaking && (
            <Button size="lg" variant="outline" onClick={stopSpeaking}>
              <VolumeX />
              音声を停止
            </Button>
          )}
        </div>

        {isListening && (
          <p className="text-center text-sm text-muted-foreground mt-2">
            話し終わったら「録音を停止」を押してください
          </p>
        )}
      </div>
    </div>
  );
}
