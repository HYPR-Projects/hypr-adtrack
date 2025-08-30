// Utilitários para otimização de imagens

/**
 * Gera srcSet para imagens responsivas
 */
export const generateSrcSet = (baseUrl: string, sizes: number[] = [320, 640, 1024, 1920]) => {
  return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ');
};

/**
 * Lazy loading de imagem com placeholder
 */
export const createImageLoader = () => {
  const imageCache = new Map<string, boolean>();
  
  return {
    isLoaded: (src: string) => imageCache.has(src),
    preload: (src: string) => {
      if (imageCache.has(src)) return Promise.resolve();
      
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          imageCache.set(src, true);
          resolve();
        };
        img.onerror = reject;
        img.src = src;
      });
    }
  };
};

/**
 * Otimizar tamanho de imagem baseado no viewport
 */
export const getOptimalImageSize = (containerWidth: number, devicePixelRatio: number = window.devicePixelRatio || 1) => {
  const targetWidth = containerWidth * devicePixelRatio;
  
  // Selecionar o tamanho mais próximo das opções disponíveis
  const sizes = [320, 640, 1024, 1280, 1920];
  return sizes.find(size => size >= targetWidth) || sizes[sizes.length - 1];
};