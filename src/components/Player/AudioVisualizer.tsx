import React, { useRef, useEffect, useState } from 'react';

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  onDataUpdate?: (data: Uint8Array) => void;
  size?: 'small' | 'medium' | 'large';
  barCount?: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  audioRef,
  isPlaying,
  onDataUpdate,
  size = 'small',
  barCount = 5
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number>();
  const [isInitialized, setIsInitialized] = useState(false);

  const dimensions = {
    small: { width: 60, height: 20 },
    medium: { width: 100, height: 30 },
    large: { width: 200, height: 60 }
  };

  const { width, height } = dimensions[size];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isInitialized) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audio);
      
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      analyser.fftSize = 64;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      setIsInitialized(true);
    } catch (error) {
      console.warn('Audio visualization not supported:', error);
    }
  }, [audioRef, isInitialized]);

  useEffect(() => {
    if (!isPlaying || !analyserRef.current || !dataArrayRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      onDataUpdate?.(dataArray);

      ctx.clearRect(0, 0, width, height);

      const barWidth = width / barCount;
      const maxBarHeight = height * 0.8;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * dataArray.length);
        const barHeight = (dataArray[dataIndex] / 255) * maxBarHeight;
        
        const x = i * barWidth;
        const y = height - barHeight;

        // Create gradient
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#1db954');
        gradient.addColorStop(0.5, '#1ed760');
        gradient.addColorStop(1, '#1fdf64');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 2, barHeight);
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, width, height, barCount, onDataUpdate]);

  // Fallback animation when no audio context
  useEffect(() => {
    if (isInitialized || !isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const barWidth = width / barCount;
      const maxBarHeight = height * 0.8;

      for (let i = 0; i < barCount; i++) {
        const barHeight = Math.random() * maxBarHeight * 0.5 + maxBarHeight * 0.2;
        
        const x = i * barWidth;
        const y = height - barHeight;

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#1db954');
        gradient.addColorStop(1, '#1fdf64');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 2, barHeight);
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isInitialized, width, height, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default AudioVisualizer;