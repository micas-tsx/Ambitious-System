"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, RotateCcw, Check } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  notebook: { title: string };
}

interface FlashcardReviewProps {
  onClose: () => void;
  onComplete: () => void;
}

export function FlashcardReview({ onClose, onComplete }: FlashcardReviewProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mente/flashcards/pending`, {
        credentials: "include",
      });
      const data = await response.json();
      setFlashcards(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (quality: number) => {
    if (currentIndex >= flashcards.length) return;

    const current = flashcards[currentIndex];
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mente/flashcards/${current.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quality }),
      });

      if (quality >= 3) {
        setCompleted(prev => prev + 1);
      }

      setShowAnswer(false);
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error("Erro ao revisar flashcard:", error);
    }
  };

  const current = flashcards[currentIndex];
  const isComplete = currentIndex >= flashcards.length;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <Card className="bg-zinc-900 border-zinc-800 w-full max-w-lg mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-zinc-400">Carregando flashcards...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="bg-zinc-900 border-zinc-800 w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">
              {isComplete ? "Revisão Completa" : `${currentIndex + 1} / ${flashcards.length}`}
            </span>
            <div className="flex gap-1">
              {flashcards.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full ${
                    i < currentIndex ? "bg-purple-500" : 
                    i === currentIndex ? "bg-purple-300" : "bg-zinc-700"
                  }`}
                />
              ))}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-zinc-400 hover:text-white"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {isComplete ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Parabéns!</h2>
              <p className="text-zinc-400 mb-6">
                Você revisou {flashcards.length} flashcards.
                <br />
                <span className="text-purple-400">{completed} aprendidos</span>
              </p>
              <Button 
                onClick={onComplete}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Fechar
              </Button>
            </div>
          ) : current ? (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                  {current.notebook.title}
                </span>
              </div>

              <div 
                className="min-h-[200px] bg-zinc-950 border border-zinc-800 rounded-xl p-8 flex items-center justify-center cursor-pointer hover:border-purple-500/50 transition-colors"
                onClick={() => setShowAnswer(!showAnswer)}
              >
                <p className={`text-xl text-center ${showAnswer ? "text-white" : "text-zinc-300"}`}>
                  {showAnswer ? current.back : current.front}
                </p>
              </div>

              {!showAnswer ? (
                <div className="flex justify-center">
                  <Button 
                    onClick={() => setShowAnswer(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Revelar Resposta
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-center text-sm text-zinc-400 mb-2">Como foi essa resposta?</p>
                  <div className="grid grid-cols-5 gap-2">
                    <Button
                      variant="outline"
                      className="h-12 border-red-500/50 text-red-400 hover:bg-red-500/10"
                      onClick={() => handleReview(0)}
                    >
                      <span className="text-xs">Não<br/>lembrei</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                      onClick={() => handleReview(2)}
                    >
                      <span className="text-xs">Difícil<br/>lembrar</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                      onClick={() => handleReview(3)}
                    >
                      <span className="text-xs">Mais ou<br/>menos</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 border-lime-500/50 text-lime-400 hover:bg-lime-500/10"
                      onClick={() => handleReview(4)}
                    >
                      <span className="text-xs">Lembrei<br/>bem</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 border-green-500/50 text-green-400 hover:bg-green-500/10"
                      onClick={() => handleReview(5)}
                    >
                      <span className="text-xs">Perfeito!</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
