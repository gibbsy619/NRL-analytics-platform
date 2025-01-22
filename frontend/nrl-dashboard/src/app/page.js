"use client";

import { useEffect, useState } from 'react';

export default function Home() {
    const [data, setData] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [bestWinOverall, setBestWinOverall] = useState([]);
    const [worstWinOverall, setWorstWinOverall] = useState([]);
    const [bestSurfaceWin, setBestSurfaceWin] = useState([]);
    const [worstSurfaceWin, setWorstSurfaceWin] = useState([]);
    const [bestHomeWin, setBestHomeWin] = useState([]);
    const [worstHomeWin, setWorstHomeWin] = useState([]);
    const [bestAwayWin, setBestAwayWin] = useState([]);
    const [worstAwayWin, setWorstAwayWin] = useState([]);
    const [pointsForAgainst, setPointsForAgainst] = useState([]);

    useEffect(() => {
      fetch('http://localhost:3000/get_best_win_overall')
          .then(response => response.json())
          .then(bestWinOverall => setBestWinOverall(bestWinOverall));
      fetch('http://localhost:3000/get_worst_win_overall')
          .then(response => response.json())
          .then(worstWinOverall => setWorstWinOverall(worstWinOverall));
      fetch('http://localhost:3000/get_team_trends')
          .then(response => response.json())
          .then(data => setData(data));
      fetch('http://localhost:3000/get_best_surface_win')
          .then(response => response.text())
          .then(bestSurfaceWin => setBestSurfaceWin(JSON.parse(bestSurfaceWin)));
      fetch('http://localhost:3000/get_worst_surface_win')
          .then(response => response.text())
          .then(worstSurfaceWin => setWorstSurfaceWin(JSON.parse(worstSurfaceWin)));
      fetch('http://localhost:3000/get_best_home_win')
          .then(response => response.text())
          .then(bestHomeWin => setBestHomeWin(JSON.parse(bestHomeWin)));
      fetch('http://localhost:3000/get_worst_home_win')
          .then(response => response.text())
          .then(worstHomeWin => setWorstHomeWin(JSON.parse(worstHomeWin)));
      fetch('http://localhost:3000/get_best_away_win')
          .then(response => response.text())
          .then(bestAwayWin => setBestAwayWin(JSON.parse(bestAwayWin)));
      fetch('http://localhost:3000/get_worst_away_win')
          .then(response => response.text())
          .then(worstAwayWin => setWorstAwayWin(JSON.parse(worstAwayWin)));
      fetch('http://localhost:3000/get_points_for_against')
          .then(response => response.text())
          .then(pointsForAgainst => setPointsForAgainst(JSON.parse(pointsForAgainst)));
    }, []);
  
    useEffect(()=>{
      console.log("best win", bestWinOverall);
    }, [bestWinOverall])

    useEffect(()=>{
      console.log("best surface win", bestSurfaceWin);
      console.log("type", typeof bestSurfaceWin);
    }, [bestSurfaceWin])


    const handleTeamClick = (team) => {
        setSelectedTeam(team);
    };

    const handleBackClick = () => {
        setSelectedTeam(null);
    };

    // Get unique teams
    const uniqueTeams = Array.from(new Set(data.map(item => item.team)));

    if (selectedTeam) {
        const teamData = data.filter(item => item.team === selectedTeam);
        return (
            <div className="min-h-screen bg-gray-100 p-4">
                <button onClick={handleBackClick} className="mb-4 text-blue-600 underline">Back</button>
                <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">Team: {selectedTeam}</h1>
                {teamData.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-md mx-auto w-full max-w-md mb-4">
                        <p className="text-lg font-semibold text-blue-800">Surface Type: {item.surface_type}</p>
                        <p className="text-gray-600">Home Win Rate: {item.home_win_rate}</p>
                        <p className="text-gray-600">Away Win Rate: {item.away_win_rate}</p>
                        <p className="text-gray-600">Overall Win Rate: {item.overall_win_rate}</p>
                    </div>
                ))}
            </div>
        );
    }

    return (
      <div className="min-h-screen bg-gray-100 p-4 flex flex-col justify-between items-center mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2 text-blue-600">NRL Team Performance Trends</h1>
      <h2 className="text-2xl font-bold text-center mb-2 text-blue-600">2017-2021</h2>
      <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-4">
                {bestWinOverall.length > 0 && pointsForAgainst.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow-md col-span-2 row-span-2">
                        <h2 className="text-2xl font-bold text-center mb-4 text-green-600">Best Overall Win Team</h2>
                        {bestWinOverall.map((item, index) => (
                            <div key={`best-${index}`} className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-lg font-semibold text-green-800">Team: {item.team}</p>
                                    <p className="text-gray-600">Overall Win Rate: {(item.overall_win_rate * 100).toFixed(2)}%</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-600 flex items-center">
                                        <i className="fas fa-arrow-up text-green-500 mr-2"></i>
                                        Points For: {pointsForAgainst[0].total_points_scored}pts
                                    </p>
                                    <p className="text-gray-600 flex items-center">
                                        <i className="fas fa-arrow-down text-red-500 mr-2"></i>
                                        Points Against: {pointsForAgainst[0].total_points_conceded}pts
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {worstWinOverall.length > 0 && pointsForAgainst.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow-md col-span-2 row-span-2">
                        <h2 className="text-2xl font-bold text-center mb-4 text-red-600">Worst Overall Win Team</h2>
                        {worstWinOverall.map((item, index) => (
                            <div key={`worst-${index}`} className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-lg font-semibold text-red-800">Team: {item.team}</p>
                                    <p className="text-gray-600">Overall Win Rate: {(item.overall_win_rate * 100).toFixed(2)}%</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-600 flex items-center">
                                        <i className="fas fa-arrow-up text-green-500 mr-2"></i>
                                        Points For: {pointsForAgainst[1].total_points_scored}pts
                                    </p>
                                    <p className="text-gray-600 flex items-center">
                                        <i className="fas fa-arrow-down text-red-500 mr-2"></i>
                                        Points Against: {pointsForAgainst[1].total_points_conceded}pts
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {bestSurfaceWin.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-center mb-4 text-green-600">Best Surface Win Team</h2>
                        {bestSurfaceWin.map((item, index) => (
                            <div key={`best-surface-${index}`} className="mb-4">
                                <p className="text-lg font-semibold text-green-800">Team: {item.team}</p>
                                <p className="text-gray-600">Win Rate: {(item.win_rate * 100).toFixed(2)}%</p>
                                <p className="text-gray-600">Surface Type: {item.surface_type}</p>
                            </div>
                        ))}
                    </div>
                )}
                {worstSurfaceWin.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-center mb-4 text-red-600">Worst Surface Win Team</h2>
                        {worstSurfaceWin.map((item, index) => (
                            <div key={`worst-surface-${index}`} className="mb-4">
                                <p className="text-lg font-semibold text-red-800">Team: {item.team}</p>
                                <p className="text-gray-600">Win Rate: {(item.win_rate * 100).toFixed(2)}%</p>
                                <p className="text-gray-600">Surface Type: {item.surface_type}</p>
                            </div>
                        ))}
                    </div>
                )}
                {bestHomeWin.length > 0 && bestAwayWin.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-center mb-4 text-green-600">Best Home Win Team</h2>
                        {bestHomeWin.map((item, index) => (
                            <div key={`best-home-${index}`} className="mb-4">
                                <p className="text-lg font-semibold text-green-800">Team: {item.team}</p>
                                <p className="text-gray-600">Home Win Rate: {(item.home_win_rate * 100).toFixed(2)}%</p>
                            </div>
                        ))}
                        <h2 className="text-2xl font-bold text-center mb-4 text-green-600">Best Away Win Team</h2>
                        {bestAwayWin.map((item, index) => (
                            <div key={`best-away-${index}`} className="mb-4">
                                <p className="text-lg font-semibold text-green-800">Team: {item.team}</p>
                                <p className="text-gray-600">Away Win Rate: {(item.away_win_rate * 100).toFixed(2)}%</p>
                            </div>
                        ))}
                    </div>
                )}
                {worstHomeWin.length > 0 && worstAwayWin.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-center mb-4 text-red-600">Worst Home Win Team</h2>
                        {worstHomeWin.map((item, index) => (
                            <div key={`worst-home-${index}`} className="mb-4">
                                <p className="text-lg font-semibold text-red-800">Team: {item.team}</p>
                                <p className="text-gray-600">Home Win Rate: {(item.home_win_rate * 100).toFixed(2)}%</p>
                            </div>
                        ))}
                        <h2 className="text-2xl font-bold text-center mb-4 text-red-600">Worst Away Win Team</h2>
                        {worstAwayWin.map((item, index) => (
                            <div key={`worst-away-${index}`} className="mb-4">
                                <p className="text-lg font-semibold text-red-800">Team: {item.team}</p>
                                <p className="text-gray-600">Away Win Rate: {(item.away_win_rate * 100).toFixed(2)}%</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-8 mx-auto">
          {uniqueTeams.map((team, index) => (
              <div
                  key={index}
                  className="bg-white p-2 rounded-lg shadow-md hover:bg-blue-50 hover:shadow-lg transition duration-300 flex flex-col items-center justify-center h-24 w-24 mx-auto cursor-pointer"
                  onClick={() => handleTeamClick(team)}
              >
                  <img src={`${team}.png`} alt={`${team} icon`} className="h-12 w-12 mb-2" />
                  <div className="text-center">
                      <p className="text-sm font-semibold text-blue-800">{team}</p>
                  </div>
              </div>
          ))}
      </div>
  </div>
    );
}