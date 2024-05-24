import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import Papa from "papaparse";
import "./Singers.css";
import britneySpears from "../picture/Britney Spears.jpg";
import eminem from "../picture/Eminem.jpg";
import rihanna from "../picture/Rihanna.jpg";
import calvinHarris from "../picture/Calvin Harris.jpg";
import drake from "../picture/Drake.jpg";
import RadarChart from "./RadarChart";

interface SongData {
  artist: string;
  song: string;
  year: number;
  popularity: number;
}

interface ArtistAverages {
  artist: string;
  danceability: number;
  energy: number;
  speechiness: number;
  acousticness: number;
  tempo: number;
  liveness: number;
  valence: number;
}

interface ArtistAverages {
  danceability: number;
  energy: number;
  speechiness: number;
  acousticness: number;
  tempo: number;
  liveness: number;
  valence: number;
  count: number;
}

interface ArtistData {
  [artist: string]: Omit<ArtistAverages, "artist"> & { count: number };
}

const images = [britneySpears, eminem, rihanna, calvinHarris, drake];
const borderColors = ["#9511a1", "#c13b82", "#d24f71", "#f48849", "#fdc627"];
const singernames = [
  "Britney Spears",
  "Eminem",
  "Rihanna",
  "Calvin Harris",
  "Drake",
];

function CircularImages({
  onArtistHover,
}: {
  onArtistHover: (artist: string | null) => void;
}) {
  return (
    <div className="image-container">
      {images.map((imageUrl, index) => (
        <div
          key={index}
          className="circular-image-wrapper"
          style={{
            left: `${index * 300 + 60}px`,
            borderColor: borderColors[index],
            borderWidth: "6px",
            borderStyle: "solid",
          }}
          onMouseEnter={() => onArtistHover(singernames[index])}
          onMouseLeave={() => onArtistHover(null)}
        >
          <img
            src={imageUrl}
            alt={`${singernames[index]}`}
            className="circular-image"
          />
          <div className="artist-name">{singernames[index]}</div>{" "}
        </div>
      ))}
    </div>
  );
}

const Page2: React.FC = () => {
  const [data, setData] = useState<SongData[]>([]);
  const [data2, setData2] = useState<ArtistAverages[]>([]);

  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredArtist, setHoveredArtist] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          "project-2024-VisuaLoom/data/songs_normalize.json"
        ); // 更改为 JSON 文件路径
        const jsonData = await response.json();

        // 在这里可以直接使用 jsonData，不需要再使用 Papa.parse 进行解析
        const seen = new Set();
        const processedData = jsonData
          .map((d: any) => ({
            artist: d.artist,
            song: d.song,
            year: +d.year,
            popularity: +d.popularity,
          }))
          .filter((d: SongData) => {
            const identifier = `${d.artist}-${d.song}-${d.year}`;
            if (seen.has(identifier)) {
              return false; // drop duplicates
            }
            seen.add(identifier);
            return true;
          });

        const filteredData = processedData.filter((d: any) =>
          singernames.includes(d.artist)
        );
        filteredData.sort(
          (a: any, b: any) => a.year - b.year || b.popularity - a.popularity
        );
        setData(filteredData);
      } catch (error) {
        console.error("An error occurred while fetching the JSON data:", error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchDataOne() {
      try {
        const response = await fetch(
          "project-2024-VisuaLoom/data/songs_normalize.json"
        );
        const jsonData = await response.json();

        let artistData: ArtistData = {};

        jsonData.forEach((d: any) => {
          if (!singernames.includes(d.artist)) return;

          if (!artistData[d.artist]) {
            artistData[d.artist] = {
              danceability: 0,
              energy: 0,
              speechiness: 0,
              acousticness: 0,
              tempo: 0,
              liveness: 0,
              valence: 0,
              count: 0,
            };
          }

          artistData[d.artist].danceability += +d.danceability;
          artistData[d.artist].energy += +d.energy;
          artistData[d.artist].speechiness += +d.speechiness;
          artistData[d.artist].acousticness += +d.acousticness;
          artistData[d.artist].liveness += +d.liveness;
          artistData[d.artist].valence += +d.valence;
          artistData[d.artist].tempo += +d.tempo / 160;
          artistData[d.artist].count += 1;
        });

        const averages: ArtistAverages[] = Object.keys(artistData).map(
          (artist) => ({
            artist,
            danceability:
              artistData[artist].danceability / artistData[artist].count,
            energy: artistData[artist].energy / artistData[artist].count,
            speechiness:
              artistData[artist].speechiness / artistData[artist].count,
            acousticness:
              artistData[artist].acousticness / artistData[artist].count,
            liveness: artistData[artist].liveness / artistData[artist].count,
            valence: artistData[artist].valence / artistData[artist].count,
            tempo: artistData[artist].tempo / artistData[artist].count,
            count: artistData[artist].count,
          })
        );

        setData2(averages);
      } catch (error) {
        console.error("An error occurred while fetching the JSON data:", error);
      }
    }

    fetchDataOne();
  }, []);

  useEffect(() => {
    const verticalOffset = 80; //vertical offset
    const rectHeight = 16;
    const textOffset = 34;

    if (data.length > 0 && svgRef.current) {
      const svg = d3.select(svgRef.current);
      const margin = { top: 20, right: 40, bottom: 40, left: 40 };
      const width = 1500 - margin.left - margin.right;
      const height = 500 - margin.top - margin.bottom;

      const colorScale = d3
        .scaleOrdinal<string>()
        .domain(data.map((d) => d.artist))
        .range([
          "#9511a1",
          "#C942A4",
          "#E6668C",
          "#f48849",
          "#fdc627",
          "#0d0887",
          "#220690",
          "#350498",
          "#46039f",
          "#5502a4",
          "#6100a7",
          "#7100a8",
          "#7e03a8",
          "#8a09a5",
          "#9511a1",
          "#a01a9c",
          "#aa2395",
          "#b52f8c",
          "#c13b82",
          "#ca457a",
          "#d24f71",
          "#da5a6a",
          "#e26561",
          "#e87059",
          "#ee7b51",
          "#f48849",
          "#f89540",
          "#fba238",
          "#fdae32",
          "#feba2c",
          "#fdc627",
          "#fbd524",
          "#f6e626",
          "#f1f525",
        ]);

      const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute");

      svg.selectAll("*").remove();

      const dataByYear = d3.group(data, (d) => d.year);
      Array.from(dataByYear.keys())
        .sort()
        .forEach((year, index) => {
          const yearData = dataByYear.get(year);
          if (!yearData || yearData.length === 0) {
            console.log(`No data for year: ${year}`);
            return; // Skip this iteration if yearData is undefined or empty
          }

          const firstIndex = data.findIndex((d) => d === yearData[0]);
          const lastIndex = data.findIndex(
            (d) => d === yearData[yearData.length - 1]
          );

          if (firstIndex === -1 || lastIndex === -1) {
            console.log(
              `Data for year ${year} could not be completely located in the array`
            );
            return; // Skip this iteration if data not found
          }

          const startX = margin.left + (firstIndex * width) / data.length;
          const endX =
            margin.left +
            (lastIndex * width) / data.length +
            width / data.length;

          // year
          svg
            .append("rect")
            .attr("x", startX)
            .attr("y", verticalOffset - rectHeight - 30)
            .attr("width", endX - startX)
            .attr("height", rectHeight)
            .attr("fill", colorScale(year.toString()))
            .on("mouseover", function (this: any) {
              d3.select(this)
                .transition()
                .duration(100)
                .attr("height", 1.2 * rectHeight)
                .attr("y", verticalOffset - 1.1 * rectHeight - 30);

              d3.select(this.nextSibling)
                .transition()
                .duration(100)
                .attr("font-size", "11px");
            })
            .on("mouseout", function (this: any) {
              d3.select(this)
                .transition()
                .duration(100)
                .attr("height", rectHeight)
                .attr("y", verticalOffset - rectHeight - 30);
              d3.select(this.nextSibling)
                .transition()
                .duration(100)
                .attr("font-size", "10px");
            });

          svg
            .append("text")
            .attr("x", startX + (endX - startX) / 2)
            .attr("y", verticalOffset - textOffset)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .text(year)
            .attr("font-size", "10px")
            .on("mouseover", function (this: any) {
              d3.select(this)
                .transition()
                .duration(100)
                .attr("font-size", "11px");
              d3.select(this.previousSibling)
                .transition()
                .duration(100)
                .attr("height", 1.2 * rectHeight)
                .attr("y", verticalOffset - 1.1 * rectHeight - 30);
            })
            .on("mouseout", function (this: any) {
              d3.select(this)
                .transition()
                .duration(100)
                .attr("font-size", "10px");
              d3.select(this.previousSibling)
                .transition()
                .duration(100)
                .attr("height", rectHeight)
                .attr("y", verticalOffset - rectHeight - 30);
            });
        });

      data.forEach((d, i) => {
        const xPos = margin.left + i * (width / data.length);
        const yPos = height - (d.popularity / 100) * height + verticalOffset;

        const points: [number, number][] = [
          [xPos, height + verticalOffset],
          [xPos + width / data.length / 2, yPos],
          [xPos + width / data.length, height + verticalOffset],
        ];

        const path = d3.line()(points);

        svg
          .append("path")
          .attr("d", path)
          .attr("fill", function () {
            if (hoveredArtist === d.artist) {
              const color = d3.color(colorScale(d.artist));
              return color ? color.darker(1.5).toString() : "white";
            } else return colorScale(d.artist);
          })
          .on("mouseover", function (event) {
            const color = d3.color(colorScale(d.artist));
            const darkerColor = color ? color.darker(1.5).toString() : "";

            d3.select(this)
              .transition()
              .duration(100)
              .attr("fill", darkerColor);
            tooltip
              .style("opacity", 1)
              .html(
                `  <strong>${d.song}</strong><br/>Artist: ${d.artist}<br/>Year: ${d.year}<br/>Popularity: ${d.popularity}  `
              )
              .style("left", `${event.pageX + 40}px`)
              .style("top", `${event.pageY + 40}px`)
              .style("background", "white");
          })
          .on("mouseout", function (this: any) {
            d3.select(this)
              .transition()
              .duration(100)
              .attr("fill", colorScale(d.artist));
            tooltip
              .style("opacity", 0)
              .style("left", `0px`)
              .style("top", `0px`);
          });

        svg
          .append("foreignObject")
          .attr("x", xPos + width / data.length / 2 - 15)
          .attr("y", yPos - 30)
          .attr("width", 30)
          .attr("height", 30)
          .html(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30px" height="30px"><path d="M21.055,3.018l-6.474,1.386C13.659,4.601,13,5.416,13,6.359v11.354c0,1.949-6,0.32-6,5.766c0,1,0.602,3.52,3.466,3.52 C13.986,27,15,24.324,15,21.354c0-1.271,0-11.816,0-11.816l6.08-1.334C21.617,8.086,22,7.61,22,7.059V3.782 C22,3.284,21.541,2.913,21.055,3.018z" fill="${colorScale(
              d.artist
            )}"/></svg>`
          );
      });
    }
  }, [data, hoveredArtist]);

  return (
    <div>
      <svg ref={svgRef} width="1500" height="518"></svg>
      <CircularImages onArtistHover={setHoveredArtist} />
      <RadarChart data={data2} />
    </div>
  );
};

export default Page2;
