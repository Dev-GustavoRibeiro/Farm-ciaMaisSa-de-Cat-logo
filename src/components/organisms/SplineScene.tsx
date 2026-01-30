'use client';

import React, { useState, useEffect, useRef, memo } from 'react';

interface SplineSceneProps {
  scene: string;
  className?: string;
  loaderId?: string;
}

const SplineSceneComponent: React.FC<SplineSceneProps> = ({
  scene,
  className = '',
}) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const splineRef = useRef<HTMLElement>(null);

  // Carrega o script do Spline Viewer
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Verifica se o custom element já está definido
    if (customElements.get('spline-viewer')) {
      setScriptLoaded(true);
      return;
    }

    // Verifica se o script já existe
    const existingScript = document.querySelector('script[src*="spline-viewer"]');
    if (existingScript) {
      // Espera o custom element ser definido
      customElements.whenDefined('spline-viewer').then(() => {
        setScriptLoaded(true);
      });
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.12.39/build/spline-viewer.js';
    script.onload = () => {
      customElements.whenDefined('spline-viewer').then(() => {
        setScriptLoaded(true);
      });
    };
    document.head.appendChild(script);
  }, []);

  // Começa a carregar imediatamente quando script está pronto
  useEffect(() => {
    if (scriptLoaded) {
      setShouldLoad(true);
    }
  }, [scriptLoaded]);

  // Detecta quando o Spline carregou
  useEffect(() => {
    if (!shouldLoad || !splineRef.current) return;
    
    const splineElement = splineRef.current;
    
    const handleLoad = () => {
      setIsLoaded(true);
    };

    // O spline-viewer dispara um evento 'load' quando carrega
    splineElement.addEventListener('load', handleLoad);
    
    // Fallback: marca como carregado após 3 segundos
    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 3000);

    return () => {
      splineElement.removeEventListener('load', handleLoad);
      clearTimeout(fallbackTimer);
    };
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {shouldLoad && (
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* @ts-expect-error - spline-viewer is a web component */}
          <spline-viewer
            ref={splineRef}
            url={scene}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      )}
    </div>
  );
};

export const SplineScene = memo(SplineSceneComponent);
