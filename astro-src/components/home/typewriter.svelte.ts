/// <reference types="svelte" />
// Equivalente de hooks/useTypewriter.ts (React) con runas de Svelte 5.
interface Opciones {
  text: string;
  speed?: number;
  delay?: number;
  waitForLoading?: boolean;
  isLoadingComplete?: boolean;
}

export function createTypewriter(opciones: () => Opciones) {
  let displayText = $state("");
  let isComplete = $state(false);

  $effect(() => {
    const { text, speed = 100, delay = 0, waitForLoading = false, isLoadingComplete = true } = opciones();
    if (!text) return;

    if (waitForLoading && !isLoadingComplete) {
      displayText = "";
      isComplete = false;
      return;
    }

    displayText = "";
    isComplete = false;

    const startTimeout = setTimeout(() => {
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < text.length) {
          displayText = text.slice(0, index + 1);
          index++;
        } else {
          isComplete = true;
          clearInterval(typeInterval);
        }
      }, speed);
      return () => clearInterval(typeInterval);
    }, delay);

    return () => clearTimeout(startTimeout);
  });

  return {
    get displayText() {
      return displayText;
    },
    get isComplete() {
      return isComplete;
    },
  };
}
