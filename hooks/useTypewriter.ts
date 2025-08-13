import { useState, useEffect } from 'react';

interface UseTypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  waitForLoading?: boolean;
  isLoadingComplete?: boolean;
}

export const useTypewriter = ({ 
  text, 
  speed = 100, 
  delay = 0, 
  waitForLoading = false,
  isLoadingComplete = true 
}: UseTypewriterProps) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;
    
    // Si debe esperar al loading y aún no ha terminado, no iniciar
    if (waitForLoading && !isLoadingComplete) {
      setDisplayText('');
      setIsComplete(false);
      return;
    }

    setDisplayText('');
    setIsComplete(false);

    const startTimeout = setTimeout(() => {
      let index = 0;
      
      const typeInterval = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          setIsComplete(true);
          clearInterval(typeInterval);
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, delay, waitForLoading, isLoadingComplete]);

  return { displayText, isComplete };
};