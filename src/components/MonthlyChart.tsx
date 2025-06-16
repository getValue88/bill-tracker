'use client'

// @ts-ignore
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function MonthlyChart({ labels, data }: { labels: string[]; data: number[] }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Total Spent ($)',
        data,
        backgroundColor: 'rgba(99, 102, 241, 0.6)', // indigo-500
      },
    ],
  }
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#cbd5e1' },
      },
      title: {
        display: false,
        text: 'Monthly Spending',
      },
    },
    scales: {
      x: {
        ticks: { color: '#cbd5e1' },
        grid: { color: '#334155' },
      },
      y: {
        ticks: { color: '#cbd5e1' },
        grid: { color: '#334155' },
      },
    },
  }
  return <Bar options={options} data={chartData} />
} 