import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// Define the shape of the props
interface ChartsProps {
  stats: {
    totalBooks: number;
    totalMembers: number; // Added to match the object you're passing
    activeLoans: number;
    availableBooks: number;
  }
}

// FIX: Add ": ChartsProps" to the destructuring arguments
export default function Charts({ stats }: ChartsProps) {
  const chartData = {
    labels: ["एकूण पुस्तके", "सक्रिय उधारी", "साठ्यातील एकके"],
    datasets: [
      {
        label: "Library Analytics",
        data: [stats.totalBooks, stats.activeLoans, stats.availableBooks],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(16, 185, 129, 0.8)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div className="flex flex-col items-center">
        <Doughnut data={chartData} />
      </div>
      <div className="flex flex-col items-center">
        <Bar data={chartData} />
      </div>
    </div>
  );
}