import React from "react";
import { Radar } from "react-chartjs-2";
import "chart.js/auto";

const RadarChart = ({ data }: { data: any }) => {
  // Define fixed colors for the datasets
  const colors = ["#9511a1", "#C942A4", "#E6668C", "#f48849", "#fdc627"];

  const chartData = {
    labels: [
      "Danceability",
      "Speechiness",
      "Energy",
      "Acousticness",
      "Tempo",
      "Liveness",
      "Valence",
    ],
    datasets: data.map(
      (
        artist: {
          artist: any;
          danceability: any;
          speechiness: any;
          energy: any;
          acousticness: any;
          tempo: any;
          liveness: any;
          valence: any;
        },
        index: number
      ) => ({
        label: artist.artist,
        backgroundColor: `${colors[index % colors.length]}40`, // Add opacity to the color
        borderColor: colors[index % colors.length],
        data: [
          artist.danceability,
          artist.speechiness,
          artist.energy,
          artist.acousticness,
          artist.tempo,
          artist.liveness,
          artist.valence,
        ],
      })
    ),
  };

  const options = {
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 1,
        ticks: {
          backdropColor: "transparent",
          fontSize: 14,
        },
      },
    },
    plugins: {
      legend: {
        position: "right" as const, // 使用 'as const' 来确保类型准确性
        labels: {
          padding: 20,
          fontSize: 12,
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ width: "1300px", height: "550px" }}>
      <Radar data={chartData} options={options} />
    </div>
  );
};

export default RadarChart;
