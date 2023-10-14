import { Line } from 'react-chartjs-2';

import { formatDate, getRandomColor } from '../../modules';
import { DeviceStat } from '../../types';

interface LineChartProps {
  title: string;
  height?: string | number;
  width?: string | number;
  stats: DeviceStat[];
};

export const LineChart = (props: LineChartProps) => {
  const { title, height = '300px', width = '100%', stats } = props;

  // Extract unique devices
  const devices = Array.from(new Set(stats.map(stat => stat.uuid)));

  // Sort data by date
  stats.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Extract unique dates
  const dates = Array.from(new Set(stats.map(stat => formatDate(new Date(stat.date)))));

  const datasets = devices.map(device => {
    return {
      label: device,
      data: dates.map(date => {
        const entry = stats.find(stat => stat.uuid === device && formatDate(new Date(stat.date)) === date);
        return entry ? entry.restarts : 0;
      }),
      fill: true,
      backgroundColor: getRandomColor(), // Each device gets a random color
    };
  });

  return (
    <Line
      data={{
        labels: dates,
        datasets: datasets,
      }}
      options={{
        scales: {
          x: {
            type: 'category',
          },
          y: {
            type: 'linear',
            beginAtZero: true,
          },
        },
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: title,
          },
        },
      }}
      style={{
        maxHeight: height,
        maxWidth: width,
      }}
    />
  );
};