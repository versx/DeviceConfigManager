import { Bar } from 'react-chartjs-2';

import { getRandomColor } from '../../modules';
import { DeviceStat } from '../../types';

interface BarChartProps {
  stats: DeviceStat[];
};

export const BarChart = (props: BarChartProps) => {
  const { stats } = props;

  // Extract unique devices
  const devices = Array.from(new Set(stats.map(stat => stat.uuid)));

  // Sort data by date
  stats.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Extract unique dates
  const dates = Array.from(new Set(stats.map(stat => new Date(stat.date).toLocaleDateString())));

  const datasets = devices.map(device => {
    return {
      label: device,
      data: dates.map(date => {
        const entry = stats.find(stat => stat.uuid === device && new Date(stat.date).toLocaleDateString() === date);
        return entry ? entry.restarts : 0;
      }),
      backgroundColor: getRandomColor(), // Each device gets a random color
    };
  });

  return (
    <Bar
      data={{
        labels: dates,
        datasets: datasets,
      }}
      options={{
        scales: {
          x: {
            type: 'category',
            //beginAtZero: true,
          },
          y: {
            type: 'linear',
            beginAtZero: true,
          },
        },
      }}
    />
  );
};