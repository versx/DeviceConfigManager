import { Line } from 'react-chartjs-2';

import { ActiveMenuItemColor } from '../../consts';
import { formatDate } from '../../modules';
import { DeviceStat } from '../../types';

interface LineChartProps {
  title: string;
  fill: boolean;
  height?: string | number;
  width?: string | number;
  stats: DeviceStat[];
};

export const LineChart = (props: LineChartProps) => {
  const {
    title, //fill,
    height = '300px', width = '100%',
    stats,
  } = props;

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
        const entry = stats.find(stat => stat.uuid === device && formatDate(new Date(stat.date + ' 00:00:00')) === date);
        return entry ? entry.restarts : 0;
      }),
      //fill,
      backgroundColor: 'white',
    };
  });

  return (
    <Line
      data={{
        labels: dates,
        datasets: datasets,
      }}
      options={{
        borderColor: ActiveMenuItemColor,
        //spanGaps: true,
        showLine: true,
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
        minHeight: height,
        minWidth: width,
        width: '100%',
      }}
    />
  );
};