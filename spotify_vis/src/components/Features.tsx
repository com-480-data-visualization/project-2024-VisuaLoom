import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import Papa from "papaparse";

const Page4: React.FC = () => {
  const [series, setSeries] = useState<any[]>([]);

  type DataPoint = { x: string; y: number };

  type Series = {
    name: string;
    data: DataPoint[];
  };

  type CsvDataRow = {
    year: string;
    [key: string]: string;
  };

  function processCSVData(rows: CsvDataRow[]): Series[] {
    interface YearData {
      [key: string]: {
        counts: number;
        sums: {
          [key: string]: number;
        };
      };
    }

    const groupedByYear = rows.reduce((acc: YearData, row) => {
      const year = row.year;

      if (!acc[year]) {
        acc[year] = { counts: 1, sums: {} };
        for (const key in row) {
          if (key !== "year") {
            acc[year].sums[key] = parseFloat(row[key]) || 0;
          }
        }
      } else {
        acc[year].counts++;
        for (const key in row) {
          if (key !== "year") {
            acc[year].sums[key] += parseFloat(row[key]) || 0;
          }
        }
      }
      return acc;
    }, {});

    const averagesByYear = Object.keys(groupedByYear).map((year) => {
      const sums = groupedByYear[year].sums;
      const counts = groupedByYear[year].counts;
      const avgs = {};
      for (const key in sums) {
        avgs[key] = sums[key] / counts;
      }
      return { year, ...avgs };
    });
    console.log(averagesByYear);
    // Compute the min and max values for each feature
    const allAverages = averagesByYear.reduce((acc, curr) => {
      for (const key in curr) {
        if (key !== "year") {
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(curr[key]);
        }
      }
      return acc;
    }, {});
    console.log(allAverages);
    const minMaxValues = {};
    for (const key in allAverages) {
      minMaxValues[key] = {
        min: Math.min(...allAverages[key]),
        max: Math.max(...allAverages[key]),
      };
    }
    console.log(minMaxValues);
    //Normalize the data
    const normalizedAveragesByYear = averagesByYear.map((item) => {
      const year = item.year;
      const normalizedAvgs = {};
      for (const key in item) {
        if (key !== "year") {
          const value = item[key];
          const { min, max } = minMaxValues[key];

          normalizedAvgs[key] = (value - min) / (max - min);
        }
      }
      return { year, ...normalizedAvgs };
    });
    console.log(normalizedAveragesByYear);
    const newseries = [
      { name: "danceability", data: [] },
      { name: "energy", data: [] },
      { name: "loudness", data: [] },
      { name: "speechiness", data: [] },
      { name: "acousticness", data: [] },
      { name: "instrumentalness", data: [] },
      { name: "liveness", data: [] },
      { name: "valence", data: [] },
      { name: "tempo", data: [] },
    ];

    normalizedAveragesByYear.forEach((avg) => {
      newseries[0].data.push({ x: avg.year, y: avg.danceability });
      newseries[1].data.push({ x: avg.year, y: avg.energy });
      newseries[2].data.push({ x: avg.year, y: avg.loudness });
      newseries[3].data.push({ x: avg.year, y: avg.speechiness });
      newseries[4].data.push({ x: avg.year, y: avg.acousticness });
      newseries[5].data.push({ x: avg.year, y: avg.instrumentalness });
      newseries[6].data.push({ x: avg.year, y: avg.liveness });
      newseries[7].data.push({ x: avg.year, y: avg.valence });
      newseries[8].data.push({ x: avg.year, y: avg.tempo });
    });

    return newseries;
  }

  const options = {
    chart: {
      height: 650,
      type: "heatmap",
    },
    xaxis: {
      type: "category",
    },
    dataLabels: {
      enabled: false,
    },
    title: {
      text: "HeatMap Chart",
    },
    plotOptions: {
      heatmap: {
        distributed: true,
      },
    },
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("../data/songs_normalize.csv");
        const csv = await response.text();
        Papa.parse(csv, {
          complete: (result) => {
            const processedData = processCSVData(result.data as CsvDataRow[]);
            setSeries(processedData);
          },
          header: true,
          skipEmptyLines: true,
        });
      } catch (error) {
        console.error("An error occurred while fetching the CSV data:", error);
      }
    }

    fetchData();
  }, []);
  return (
    <div>
      <div id="chart">
        <ReactApexChart
          options={options}
          series={series}
          type="heatmap"
          height={450}
          width={1150}
        />
      </div>
      <div id="html-dist"></div>
    </div>
  );
};

export default Page4;
