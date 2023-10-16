import { Container, Typography } from '@mui/material';
import { Pie } from 'react-chartjs-2';

interface PieChartProps<T> {
  title: string;
  data: T[];
  labels: string[];
  height?: number;
  width?: number;
};

export const PieChart = <T extends unknown>(props: PieChartProps<T>) => {
  const { title, data, labels, height = 250, width = 250 } = props;

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#74D65E',
          '#BA68C8',
        ],
        borderWidth: 1,
        borderColor: '#777',
        hoverBorderWidth: 2,
        hoverBorderColor: '#000',
      },
    ],
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom align="center">
        {title}
      </Typography>
      <Pie
        data={chartData}
        options={{
          responsive: true,
          //maintainAspectRatio: true,
        }}
        height={height}
        width={width}
      />
    </Container>
  );
};