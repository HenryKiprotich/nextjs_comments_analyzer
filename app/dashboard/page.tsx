"use client";
import { ChartOptions } from "chart.js"; // ✅ Import ChartOptions type
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Import Next.js router
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  Filler
);

interface PlatformData {
  platform: string;
  totalComments: number;
  positiveComments: number;
  negativeComments: number;
}

export default function DashboardPage() {
  const [commentsData, setCommentsData] = useState<PlatformData[]>([]);
  const [totalCommentsHistory, setTotalCommentsHistory] = useState<number[]>([]);
  const [positiveCommentsHistory, setPositiveCommentsHistory] = useState<number[]>([]); // ✅ NEW state for positive comments history
  const [negativeCommentsHistory, setNegativeCommentsHistory] = useState<number[]>([]);
  const [analysisLabels, setAnalysisLabels] = useState<string[]>([]);
  const [totalComments, setTotalComments] = useState<number>(0);
  const [totalPositive, setTotalPositive] = useState<number>(0);
  const [totalNegative, setTotalNegative] = useState<number>(0);
  const router = useRouter(); // ✅ Initialize Next.js Router 
 
  
    useEffect(() => {
      const auth = sessionStorage.getItem("auth");
  
      if (!auth) {
        router.push("./auth"); // Redirect if not authenticated
      }
    }, []);

  
  // ✅ Fetch Comments Data from Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/total");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const backendData = await response.json();
        console.log("Backend response:", backendData);

        if (Array.isArray(backendData)) {
          setCommentsData(backendData);

          // ✅ Compute total comments across all platforms
          let total = 0;
          let positive = 0;
          let negative = 0;

          backendData.forEach((data) => {
            total += data.totalComments;
            positive += data.positiveComments;
            negative += data.negativeComments;
          });

          setTotalComments(total);
          setTotalPositive(positive);
          setTotalNegative(negative);

          // ✅ Track Analysis History (with dates)
          setTotalCommentsHistory((prevHistory) => [...prevHistory, total]);
          setPositiveCommentsHistory((prevHistory) => [...prevHistory, positive]); // ✅ Store positive comments history
          setNegativeCommentsHistory((prevHistory) => [...prevHistory, negative]);
          setAnalysisLabels((prevLabels) => [
            ...prevLabels,
            `Analysis ${prevLabels.length + 1} (${new Date().toLocaleDateString()})`,
          ]);
        } else {
          console.error("Unexpected backend data format:", backendData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // ✅ Function to Clear Dashboard Data (With Confirmation)
  const clearData = async () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all data? This action cannot be undone."
    );
    if (!confirmClear) return; // ✅ Exit if user cancels

    try {
      const response = await fetch("http://localhost:5000/clear", {
        method: "POST",
      });

      if (response.ok) {
        setCommentsData([]);
        setTotalComments(0);
        setTotalPositive(0);
        setTotalNegative(0);
        setTotalCommentsHistory([]); // ✅ Clear history
        setPositiveCommentsHistory([]); // ✅ Clear positive comments history
        setNegativeCommentsHistory([]);
        setAnalysisLabels([]);
        alert("Data cleared successfully!"); // ✅ Provide feedback
      } else {
        console.error("Failed to clear data");
      }
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  };

  // ✅ Line Chart Data (Now includes positive comments history)
  const lineChartData = {
    labels: analysisLabels,
    datasets: [
      {
        label: "Total Comments",
        data: totalCommentsHistory,
        borderColor: "blue",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        fill: true,
        yAxisID: "y", // ✅ Renamed to "y" to match Chart.js defaults
      },
      {
        label: "Positive Comments",
        data: positiveCommentsHistory, // ✅ Uses positive comments history
        borderColor: "green",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        fill: true,
      },
      {
        label: "Negative Comments",
        data: negativeCommentsHistory,
        borderColor: "red",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        fill: true,
      },
    ],
  };

  // ✅ Chart Options (Fixed Scaling Issues)
  const lineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false, // ✅ Allows chart resizing
    scales: {
      x: {
        type: "category", // ✅ Ensures labels are categories, not dates
      },
      y: {
        type: "linear",
        position: "left",
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: 50, // ✅ Adjusted scale for readability
        grace: "5%", // ✅ Adds space above the max value
        ticks: {
          stepSize: 5, // ✅ Steps of 5 for better readability
        },
      },
    },
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* ✅ Buttons Section */}
      <div className="flex space-x-4 mt-4">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded transition duration-300 transform hover:bg-red-700 active:scale-95"
          onClick={clearData}
        >
          Clear Data
        </button>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded transition duration-300 transform hover:bg-gray-700 active:scale-95"
          onClick={() => router.push("/authuser")}
        >
          Back
        </button>
      </div>

      {/* ✅ Summary Section (Fixed Width) */}
      <div className="mt-6 p-4 bg-indigo-200 border rounded shadow max-w-3xl mx-auto">
        <h2 className="text-lg font-semibold">Overall Comment Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 bg-gray-200 text-center rounded">
            <h3 className="text-lg font-semibold">Total Comments</h3>
            <p className="text-xl font-bold">{totalComments}</p>
          </div>
          <div className="p-4 bg-green-200 text-center rounded">
            <h3 className="text-lg font-semibold">Positive</h3>
            <p className="text-xl font-bold">{totalPositive}</p>
          </div>
          <div className="p-4 bg-red-200 text-center rounded">
            <h3 className="text-lg font-semibold">Negative</h3>
            <p className="text-xl font-bold">{totalNegative}</p>
          </div>
        </div>
      </div>

      {/* ✅ Centered and Enlarged Chart */}
      <div className="mt-12 flex justify-center">
        <div className="bg-gray-100 p-4 rounded w-full md:w-3/4 h-96">
          <h3 className="text-lg font-semibold text-center">Comments Over Time (Line Chart)</h3>
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>
    </main>
  );
}
