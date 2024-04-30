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
      const avgs: { [key: string]: number } = {};
      for (const key in sums) {
        avgs[key] = sums[key] / counts;
      }
      return { year, ...avgs };
    });
    console.log(averagesByYear);
    // Compute the min and max values for each feature
    const allAverages: { [key: string]: number[] } = averagesByYear.reduce(
      (acc, curr: CsvDataRow) => {
        for (const key in curr) {
          if (key !== "year") {
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(parseFloat(curr[key]));
          }
        }
        return acc;
      },
      {} as { [key: string]: number[] }
    );
    console.log(allAverages);
    const minMaxValues: { [key: string]: { min: number; max: number } } = {};
    for (const key in allAverages) {
      minMaxValues[key] = {
        min: Math.min(...allAverages[key]),
        max: Math.max(...allAverages[key]),
      };
    }
    console.log(minMaxValues);
    //Normalize the data
    const normalizedAveragesByYear: NormalizedData[] = averagesByYear.map(
      (item: CsvDataRow) => {
        const year = item.year;
        const normalizedAvgs: { [key: string]: number } = {};
        for (const key in item) {
          if (key !== "year") {
            const value = parseFloat(item[key]);
            const { min, max } = minMaxValues[key];

            normalizedAvgs[key] = (value - min) / (max - min);
          }
        }
        return { year, ...normalizedAvgs };
      }
    );
    console.log(normalizedAveragesByYear);
    const newseries: Series[] = [
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
    interface NormalizedData {
      year: string;
      danceability?: number;
      energy?: number;
      loudness?: number;
      speechiness?: number;
      acousticness?: number;
      instrumentalness?: number;
      liveness?: number;
      valence?: number;
      tempo?: number;
    }
    normalizedAveragesByYear.forEach((avg: NormalizedData) => {
      newseries[0].data.push({ x: avg.year, y: avg.danceability || 0 });
      newseries[1].data.push({ x: avg.year, y: avg.energy || 0 });
      newseries[2].data.push({ x: avg.year, y: avg.loudness || 0 });
      newseries[3].data.push({ x: avg.year, y: avg.speechiness || 0 });
      newseries[4].data.push({ x: avg.year, y: avg.acousticness || 0 });
      newseries[5].data.push({ x: avg.year, y: avg.instrumentalness || 0 });
      newseries[6].data.push({ x: avg.year, y: avg.liveness || 0 });
      newseries[7].data.push({ x: avg.year, y: avg.valence || 0 });
      newseries[8].data.push({ x: avg.year, y: avg.tempo || 0 });
    });

    return newseries;
  }

  const options = {
    chart: {
      height: 650,
      type: "heatmap" as const,
    },
    // xaxis: {
    //   type: "category",
    // },
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
        const response = await fetch("../public/data/songs_normalize.csv");
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
    <>
      <div>
        <div id="chart">
          <ReactApexChart
            options={options}
            series={series}
            height={450}
            width={1150}
            type="heatmap"
          />
        </div>
        <div id="html-dist"></div>
      </div>
    </>
  );
};

export default Page4;
