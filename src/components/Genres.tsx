import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface Song {
  name: string;
  artist: string;
  popularity: number;
  genre: string;
  year: number;
}

interface HierarchyDatum {
  name: string;
  value: number;
  artist?: string;
  year?: number;
  children?: HierarchyDatum[];
}

const Genres: React.FC = () => {
  // const chartRef = useRef(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<HierarchyDatum | null>(null);

  useEffect(() => {
    fetch("/project-2024-VisuaLoom/data/songs_normalize_cleaned.json")
      .then((response) => response.json())
      .then((data: Song[]) => {
        const transformedData = transformData(data);
        setData(transformedData);
      });
  }, []);

  useEffect(() => {
    if (data && chartRef.current) {
      const width = chartRef.current.clientWidth;
      const height = chartRef.current.clientHeight;

      const yearColor = d3
        .scaleLinear<string>()
        .domain([0, 1])
        .range(["#e6e6fa", "#d8bfd8"]); // Lighter blue shades

      const genreColor = d3.scaleOrdinal(d3.schemePastel2); // Light pastel colors
      const songColor = d3.scaleOrdinal(d3.schemePastel1); // Light pastel colors

      const pack = (data: HierarchyDatum) =>
        d3.pack<HierarchyDatum>().size([width, height]).padding(3)(
          d3
            .hierarchy<HierarchyDatum>(data)
            .sum((d) => d.value || 0)
            .sort((a, b) => (b.value || 0) - (a.value || 0))
        );
      const root = pack(data);

      const svg = d3
        .select(chartRef.current)
        .append("svg")
        .attr("viewBox", `-${width} -${height} ${width * 2} ${height * 2}`)
        .attr("width", "100%")
        .attr("height", "100%")
        .attr(
          "style",
          `max-width: 100%; height: auto; display: block; margin: 0 -14px; background: white; cursor: pointer;`
        );

      const node = svg
        .append("g")
        .selectAll("circle")
        .data(root.descendants().slice(1))
        .join("circle")
        .attr("fill", (d) => {
          if (d.depth === 1) return yearColor(d.depth); // Year light color
          if (d.depth === 2) return genreColor(d.data.name);
          if (d.depth === 3) return songColor(d.data.name);
          return "white";
        })
        .attr("pointer-events", (d) => (!d.children ? "none" : null))
        .style("opacity", (d) => (d.depth === 1 ? 0.6 : 1)) // Year semi-transparent
        .on("mouseover", function (event, d) {
          if (d.depth === 3 || d.depth === 4) {
            d3.select(this).attr("stroke", "#000");

            if (tooltipRef.current) {
              const tooltip = tooltipRef.current;
              tooltip.style.opacity = "1";
              tooltip.style.left = `${event.pageX + 40}px`;
              tooltip.style.top = `${event.pageY + 40}px`;
              const songData = d.data as HierarchyDatum;
              if (songData.children && songData.children[0]) {
                const artistData = songData.children[0];
                tooltip.innerHTML = `<strong>${songData.name}</strong><br/>Artist: ${artistData.name}<br/>Year: ${songData.year}<br/>Popularity: ${songData.value}`;
              } else {
                tooltip.innerHTML = `<strong>${songData.name}</strong><br/>Popularity: ${songData.value}`;
              }
            }
          }
        })
        .on("mouseout", function (event, d) {
          if (d.depth === 3 || d.depth === 4) {
            d3.select(this).attr("stroke", null);

            if (tooltipRef.current) {
              const tooltip = tooltipRef.current;
              tooltip.style.opacity = "0";
              tooltip.style.left = `0px`;
              tooltip.style.top = `0px`;
            }
          }
        })
        .on(
          "click",
          (event, d) => focus !== d && (zoom(event, d), event.stopPropagation())
        );

      const label = svg
        .append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(root.descendants())
        .join("text")
        .style("fill-opacity", (d) => (d.parent === root ? 1 : 0))
        .style("display", (d) => (d.parent === root ? "inline" : "none"))
        .style("font-family", "Helvetica, sans-serif")
        .style("font-size", (d) => {
          if (d.depth === 0) return "1px"; // Root level
          if (d.depth === 1) return "48px"; // Year level
          if (d.depth === 2) return "32px"; // Genre level
          if (d.depth === 3) return "18px"; // Song level

          return "1px";
        })
        .style("font-weight", (d) => (d.depth === 2 ? "bold" : "normal"))
        .text((d) => (d.data as HierarchyDatum).name);

      svg.on("click", (event) => zoom(event, root));
      let focus = root;
      let view;
      zoomTo([focus.x, focus.y, focus.r * 2]);

      function zoomTo(v) {
        const k = width / v[2];

        view = v;

        label.attr(
          "transform",
          (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
        );
        node.attr(
          "transform",
          (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
        );
        node.attr("r", (d) => d.r * k);
      }

      function zoom(event, d) {
        const focus0 = focus;

        focus = d;

        const transition = svg
          .transition()
          .duration(event.altKey ? 7500 : 750)
          .tween("zoom", (d) => {
            const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
            return (t) => zoomTo(i(t));
          });

        label
          .filter(function (d) {
            return (
              d.parent === focus ||
              d === focus ||
              (this as HTMLElement).style.display === "inline"
            );
          })
          .transition(transition)
          .style("fill-opacity", (d) =>
            d.parent === focus || d === focus ? 1 : 0
          )
          .on("start", function (d) {
            if (d.parent === focus || d === focus)
              (this as HTMLElement).style.display = "inline";
          })
          .on("end", function (d) {
            if (d.parent !== focus && d !== focus)
              (this as HTMLElement).style.display = "none";
          });

        node
          .filter(function (d) {
            return (
              d.parent === focus ||
              d === focus ||
              (this as HTMLElement).style.display === "inline"
            );
          })
          .transition(transition)
          .style("display", (d) =>
            d.parent === focus || d === focus ? "inline" : "none"
          )
          .style("opacity", (d) => (d.parent === focus ? 1 : 0));
      }
    }
  }, [data]);

  const transformData = (rawData: Song[]): HierarchyDatum => {
    const groupedByYear = d3.group(rawData, (d) => d.year);
    const children: HierarchyDatum[] = Array.from(
      groupedByYear,
      ([year, songs]) => {
        const genreMap = new Map<string, Song[]>();
        songs.forEach((song) => {
          const genres = song.genre.split(",");
          genres.forEach((genre) => {
            genre = genre.trim();
            if (!genre || genre.toLowerCase() === "set()") return;
            if (!genreMap.has(genre)) {
              genreMap.set(genre, []);
            }
            genreMap.get(genre)!.push(song);
          });
        });
        const genreChildren: HierarchyDatum[] = Array.from(
          genreMap,
          ([genre, genreSongs]) => {
            const songChildren: HierarchyDatum[] = genreSongs.map((song) => ({
              name: song.song,
              value: song.popularity,
              artist: song.artist,
              year: song.year,
              children: [
                {
                  name: song.artist,
                  value: song.popularity,
                },
              ],
            }));
            return {
              name: genre,
              value: genreSongs.length,
              children: songChildren,
            };
          }
        );
        return {
          name: year.toString(),
          value: genreChildren.reduce((sum, genre) => sum + genre.value, 0),
          children: genreChildren,
        };
      }
    );
    return {
      name: "root",
      value: children.reduce((sum, year) => sum + year.value, 0),
      children,
    };
  };

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <div
        ref={chartRef}
        style={{ width: "90vw", height: "100vh", position: "relative" }}
      ></div>
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          textAlign: "center",
          width: "80px",
          height: "auto",
          padding: "8px",
          font: "12px sans-serif",
          background: "white",
          border: "0px",
          borderRadius: "8px",
          pointerEvents: "none",
          opacity: 0,
        }}
      ></div>
      <div
        style={{
          width: "20vw",
          height: "100vh",
          background: "#f4f4f4",
          padding: "10px",
        }}
      >
        <h2>The Bubble chart</h2>
        <p></p>
        <p>
          <i>How do we generalize traits across thousands of songs?</i>
        </p>
        <p>
          In this data visualization, we showcase the distribution of songs
          across the genres in different years. The size of the bubble is
          proportional to the number of songs with that genre or year.
        </p>
        <p>
          <b>Click on a year's bubble to zoom into it</b>
        </p>
        <p>you can see genres bubble, each distinguished by color.</p>
        <p>
          <b>Click on a genre to zoom into it.</b>
        </p>
        <p>
          You can see individual songs. Hovering over a selected song bubble
          will display information.
        </p>
        <b>You can also click a song to directly zoom into it.</b>
      </div>
    </div>
  );
};

export default Genres;
