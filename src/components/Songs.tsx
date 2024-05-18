import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import "./Songs.css";

interface Song {
  song_id: number;
  title: string;
  popularity: number;
  artist: string;
  duration_ms: string; // 修改这里
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
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  useEffect(() => {
    Papa.parse("project-2024-VisuaLoom/data/songs_normalize.csv", {
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
        if (!item.year || item.year.trim() === "") {
          return acc;
        }

        const song: Song = {
          song_id: acc[item.year] ? acc[item.year].length : 0,
          title: item.song,
          popularity: parseInt(item.popularity, 10),
          artist: item.artist,
          duration_ms: item.duration_ms, // 修改这里
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

  function handleDotClick(song: Song) {
    setSelectedSong(song);
  }

  return (
    <div className="App">
      <div className="histogram">
        {data.map(({ year, songs }) => (
          <div key={year} className="year-row">
            <span className="year">{year}</span>
            <div className="dots">
              {songs.map((song) => (
                <div
                  className="dot"
                  key={song.song_id}
                  data-popularity={getPopularityLevel(song.popularity)}
                  onClick={() => handleDotClick(song)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      {selectedSong && (
        <div className="song-info">
          <h2>{selectedSong.title}</h2>
          <p>
            <strong>Artist:</strong> {selectedSong.artist}
          </p>
          <p>
            <strong>Popularity:</strong> {selectedSong.popularity}
          </p>
          <p>
            <strong>Duration:</strong> {selectedSong.duration_ms} ms
          </p>{" "}
          {/* 修改这里 */}
        </div>
      )}
    </div>
  );
};

export default Page1;
