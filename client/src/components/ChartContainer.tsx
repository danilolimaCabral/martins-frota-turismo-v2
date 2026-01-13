import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, ChartOptions } from 'chart.js/auto';

interface ChartContainerProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar';
  data: any;
  options?: ChartOptions;
  title?: string;
  height?: number;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  type,
  data,
  options,
  title,
  height = 300,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destruir gráfico anterior se existir
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Criar novo gráfico
    chartRef.current = new ChartJS(canvasRef.current, {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12,
                weight: '500',
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 12 },
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
          },
        },
        ...options,
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [type, data, options]);

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}
      <div style={{ height: `${height}px`, position: 'relative' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default ChartContainer;
