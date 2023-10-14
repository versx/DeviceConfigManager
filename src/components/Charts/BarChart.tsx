import { Bar } from 'react-chartjs-2';

import { formatDate, getRandomColor } from '../../modules';
import { DeviceStat } from '../../types';

interface BarChartProps {
  title: string;
  height?: string | number;
  width?: string | number;
  stats: DeviceStat[];
};

export const BarChart = (props: BarChartProps) => {
  const { title, height = '300px', width = '100%', stats } = props;
  const today = formatDate(new Date());
  const statsToday = stats.filter(stat => formatDate(new Date(stat.date + ' 00:00:00')) === today);
  const labels = statsToday.map(stat => stat.uuid);
  const data = statsToday.map(stat => stat.restarts);

  return (
    <Bar
      data={{
        labels,
        datasets: [{
          label: 'Devices',
          data,
          backgroundColor: getRandomColor(),
        }],
        //labels: [...labels],
        //datasets: statsToday.map(stat => ({
        //  label: stat.uuid,
        //  data: [stat.restarts],
        //  backgroundColor: getRandomColor(),
        //})),
      }}
      options={{
        scales: {
          x: {
            type: 'category',
            title: {
              display: true,
              text: 'UUID',
            },
          },
          y: {
            type: 'linear',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Restarts',
            },
          },
        },
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
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