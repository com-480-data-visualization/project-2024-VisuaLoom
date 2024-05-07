import React, { useState, useEffect, useRef } from "react";
import ReactApexChart from "react-apexcharts";
import Papa from "papaparse";
import "./Features.css";

const Page4: React.FC = () => {
  const [series, setSeries] = useState<any[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const chartRef = useRef<any>();
  const [lineChartOptions, setLineChartOptions] = useState({});
  const [lineChartData, setLineChartData] = useState<any[]>([]);

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
      { name: "Danceability", data: [] },
      { name: "Energy", data: [] },
      { name: "Loudness", data: [] },
      { name: "Speechiness", data: [] },
      { name: "Acousticness", data: [] },
      { name: "Instrumentalness", data: [] },
      { name: "Liveness", data: [] },
      { name: "Valence", data: [] },
      { name: "Tempo", data: [] },
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

  const heatmapOptions = {
    chart: {
      height: 650,
      type: "heatmap" as const,
    },
    dataLabels: {
      enabled: false,
    },
    title: {
      text: "HeatMap Chart",
    },
    xaxis: {
      labels: {
        style: {
          fontSize: "14px", // 设置字体大小
          fontFamily: "Helvetica, Arial, sans-serif", // 设置字体
          cssClass: "apexcharts-xaxis-label", // 自定义CSS类
        },
        rotate: -45, // 如有必要可以设置标签旋转角度
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "14px", // 设置字体大小
          fontFamily: "Helvetica, Arial, sans-serif", // 设置字体
          cssClass: "apexcharts-yaxis-label", // 自定义CSS类
        },
      },
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
        const response = await fetch("/data/songs_normalize.csv");
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

  const labelClickHandler = (event: Event) => {
    const featureName = (event.target as HTMLDivElement).textContent;
    setSelectedFeature(featureName);

    // 根据点击的特征名生成对应的折线图数据和选项
    if (featureName) {
      const data = series.find((serie) => serie.name === featureName);
      console.log(data);
      if (data) {
        const lineData = [{ name: featureName, data: data.data }];
        setLineChartData(lineData);

        const lineChartOptions = {
          chart: {
            height: 350,
            type: "line",
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            curve: "smooth",
          },
          xaxis: {
            type: "category",
            categories: data.data.map((point: any) => point.x),
          },
          yaxis: {
            title: {
              text: "Value",
            },
            labels: {
              style: {
                fontSize: "12px",
                fontFamily: "Helvetica, Arial, sans-serif",
                cssClass: "apexcharts-yaxis-label",
              },
              formatter: (value: number) => value.toFixed(2),
            },
          },
          title: {
            text: `${featureName} Line Chart`,
            align: "left",
          },
        };
        setLineChartOptions(lineChartOptions);
      }
    }
  };

  useEffect(() => {
    if (chartRef.current) {
      const yAxisLabels = chartRef.current.chart.el.querySelectorAll(
        ".apexcharts-yaxis-label"
      );
      yAxisLabels.forEach((label: any) => {
        label.addEventListener("click", labelClickHandler);
        label.style.cursor = "pointer";
      });

      return () => {
        yAxisLabels.forEach((label: any) => {
          label.removeEventListener("click", labelClickHandler);
        });
      };
    }
  }, [series]);

  return (
    <>
      <div>
        <div id="chart">
          <ReactApexChart
            options={heatmapOptions}
            series={series}
            height={450}
            width={1150}
            type="heatmap"
            ref={chartRef}
          />
        </div>
        {selectedFeature && (
          <div>
            <h2>{selectedFeature} </h2>
            <ReactApexChart
              options={lineChartOptions}
              series={lineChartData}
              type="line"
              height={350}
              width={1150}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Page4;
