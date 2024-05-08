import React, { useEffect, useState } from "react";
import "./Songs.css";
import Papa from "papaparse";

interface Song {
  song_id: number;
  title: string;
  popularity: number;
  artist: string;
  danceability: number;
}

interface YearData {
  year: string;
  songs: Song[];
}

interface SongData {
  artist: string;
  song: string;
  duration_ms: string;
  explicit: string;
  year: string;
  popularity: string;
  danceability: string;
}

const Page1: React.FC = () => {
  const [data, setData] = useState<YearData[]>([]);

  useEffect(() => {
    Papa.parse("/data/songs_normalize.csv", {
      download: true,
      header: true,
      complete: function (results) {
        const formattedData = formatData(results.data as SongData[]);
        console.log(formattedData);
        setData(formattedData);
      },
    });
  }, []);

  function formatData(items: SongData[]): YearData[] {
    const years = items.reduce(
      (acc: Record<string, Song[]>, item: SongData) => {
        // 确保年份有效
        if (!item.year || item.year.trim() === "") {
          return acc; // 跳过这条记录
        }

        const song: Song = {
          song_id: acc[item.year] ? acc[item.year].length : 0,
          title: item.song,
          popularity: parseInt(item.popularity, 10),
          artist: item.artist,
          danceability: parseFloat(item.danceability),
        };

        acc[item.year] = acc[item.year] || [];
        acc[item.year].push(song);

        return acc;
      },
      {}
    );

    return Object.keys(years).map((year) => ({ year, songs: years[year] }));
  }
  function getPopularityLevel(popularity: number) {
    if (popularity >= 80) {
      return "very-high";
    } else if (popularity >= 60) {
      return "high";
    } else if (popularity >= 40) {
      return "medium";
    } else if (popularity >= 20) {
      return "low";
    } else {
      return "very-low";
    }
  }
  const beats: string | any[] = [
    /* Array of beats per minute extracted from songs */
  ];

  // Simulate beat per dot
  const dots = document.querySelectorAll(".dot") as NodeListOf<HTMLElement>;
  dots.forEach((dot, index) => {
    const animationDuration = (60 / beats[index % beats.length]) * 1000; // Calculate duration based on BPM
    dot.style.animation = `beatAnimation ${animationDuration}ms infinite alternate`;
  });

  // dots.forEach((dot) => {
  //   const popularityAttribute = dot.getAttribute("data-popularity");
  //   if (popularityAttribute) {
  //     const popularity = parseInt(popularityAttribute, 10);
  //     const size = getDotSize(popularity);
  //     dot.style.height = `${size}px`;
  //     dot.style.width = `${size}px`;
  //   } else {
  //     console.warn("Popularity attribute is missing on a dot element.");
  //     // Optionally, handle the case where the attribute is missing
  //     // e.g., set a default size or apply a default style
  //     dot.style.height = "5px"; // Default size
  //     dot.style.width = "5px"; // Default size
  //   }
  // });

  // function getDotSize(popularity: number) {
  //   // 假设流行度从1到100，点的大小从5px到20px变化
  //   return 5 + (popularity / 200) * 15;
  // }

  return (
    <div className="Page1">
      {/* <h1>Yearly Top Songs Visualizer</h1> */}
      <div className="histogram">
        {data.map(({ year, songs }) => (
          <div key={year} className="year-row">
            <span className="year">{year}</span>
            <div className="dots">
              {songs.map((song) => (
                <div
                  className="dot"
                  key={song.song_id}
                  // style={{
                  //   height: getDotSize(song.popularity),
                  //   width: getDotSize(song.popularity),
                  // }}
                  data-popularity={getPopularityLevel(song.popularity)}
                  title={`${song.artist} - ${song.title}: Popularity ${song.popularity}`}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page1;
