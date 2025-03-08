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
    const [bestSeasons, setBestSeasons] = useState([]);
    const [biggestScore, setBiggestScore] = useState([]);
    const [stadiumInfos, setStadiumInfos] = useState([]);

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
        fetch('http://localhost:3000/get_best_season')
            .then(response => response.text())
            .then(bestSeason => setBestSeasons(JSON.parse(bestSeason)));
        fetch('http://localhost:3000/get_biggest_score')
            .then(response => response.text())
            .then(biggestScore => setBiggestScore(JSON.parse(biggestScore)));
    }, []);

    const handleTeamClick = (team) => {
        setSelectedTeam(team);
    };

    const handleBackClick = () => {
        setSelectedTeam(null);
    };

    useEffect(() => {
        // Fetch stadium information for all teams
        const fetchStadiumInfos = async () => {
            const teams = Array.from(new Set(data.map(item => item.team))); 
            const stadiumInfos = await Promise.all(teams.map(async (team) => {
                const response = await puter.ai.chat(`What is the stadium capacity of the NRL team ${team}, give me a json response with the following structure: {"Stadium": stadium, "Location": location, "Capacity": capacity}?`);
                try {
                    const response = await puter.ai.chat(`What is the stadium capacity of the NRL team ${team}, give me a json response with the following structure where all values are strings: {"Stadium": stadium, "Location": location, "Capacity": capacity}? Do not give me warnings`);
                    const cleanedResponse = response.message.content.replace(/^```json|```$/gm, '').trim();
                    const parsedResponse = JSON.parse(cleanedResponse);
                    return { team, ...parsedResponse };
                } catch (error) {
                    console.error(`Failed to parse response for team ${team}:`, error);
                    return { team, Stadium: "Unknown", Location: "Unknown", Capacity: "Unknown" };
                }
            }));
            setStadiumInfos(stadiumInfos);
        };

        fetchStadiumInfos();

    }, [data]);

    // Get unique teams
    const uniqueTeams = Array.from(new Set(data.map(item => item.team)));

    if (selectedTeam) {
        const teamData = data.filter(item => item.team === selectedTeam);
        const teamLogoUrl = `${selectedTeam}.png`;
        const stadiumInfo = stadiumInfos.find(info => info.team === selectedTeam);
        const bestSeason = bestSeasons.filter(season => season.team === selectedTeam);
        const biggestScoreTeam = biggestScore.filter(score => score.team === selectedTeam);
        const biggestWinScoreTeam = biggestScoreTeam.reduce((acc, curr) => {
            if (acc.best_score_for_team > curr.best_score_for_team) {
                return acc;
            } else {
                return curr;
            }
        }
        , {});

        const biggestLossScoreTeam = biggestScoreTeam.reduce((acc, curr) => {
            if (acc.best_score_for_team < curr.best_score_for_team) {
                return acc;
            } else {
                return curr;
            }
        }
        , {});

        return (
            <div className="min-h-screen p-4">
                <div className="slider-thumb"></div>
                <div className="flex items-center justify-between mb-3 w-full">
                <div
                    className="bg-white p-2 rounded-lg shadow-md hover:bg-blue-50 hover:shadow-lg transition duration-300 flex items-center justify-center h-12 w-12 cursor-pointer text-lg font-semibold text-blue-600"
                    onClick={handleBackClick}
                >
                    <i className="fas fa-arrow-left text-green-500"></i>
                </div>
                <h1 className="text-4xl font-extrabold text-center text-blue-700 flex-grow">Team: {selectedTeam}</h1>
                </div>
                <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 p-2 bg-white rounded-lg shadow-md mt-4">
                        <img src={teamLogoUrl} alt={`${selectedTeam} logo`} className="w-full h-full object-contain" />
                    </div>
                </div>
                <div className="flex flex-wrap justify-center">
                {teamData.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-md mx-2 mb-4 w-full max-w-md">
                        <p className="text-lg font-semibold text-blue-800">Surface Type: {item.surface_type}</p>
                        <p className="text-gray-600">Home Win Rate: {item.home_win_rate}</p>
                        <p className="text-gray-600">Away Win Rate: {item.away_win_rate}</p>
                        <p className="text-gray-600">Overall Win Rate: {item.overall_win_rate}</p>
                    </div>
                ))}
                </div>
                {stadiumInfo ? (
                    <div className="flex justify-center">
                        <div className="bg-white p-4 rounded-lg shadow-md mx-2 mb-4 w-full max-w-md">
                            <p className="text-lg font-semibold text-blue-800">Stadium Name: {stadiumInfo.Stadium}</p>
                            <p className="text-gray-600">Capacity: {stadiumInfo.Capacity}</p>
                            <p className="text-gray-600">Location: {stadiumInfo.Location}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <div className="bg-white p-4 rounded-lg shadow-md mx-2 mb-4 w-full max-w-md">
                            <p className="text-lg font-semibold text-blue-800">Fetching Stadium Information...</p>
                        </div>
                    </div>
                )}
                {bestSeason.length > 0 && biggestScoreTeam && (
                    <div className="flex justify-center space-x-4 items-start">
                        <div className="bg-white p-4 rounded-lg shadow-md mx-2 mb-4 w-full max-w-md">
                            <h2 className="text-2xl font-bold text-center mb-4 text-green-600">Most Wins in a Season</h2>
                            {bestSeason.map((season, index) => (
                                <div key={index} className="mb-4">
                                    <p className="text-lg font-semibold text-green-800">Season: {season.year}</p>
                                    <p className="text-gray-600">Total Wins In Season: {season.total_wins_in_season}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md mx-2 mb-4 w-full max-w-lg">
                            <h2 className="text-2xl font-bold text-center mb-4 text-green-600">Biggest Score</h2>
                            <div className="flex flex-col">
                                <div className="mb-4">
                                    <p className="text-lg font-semibold text-green-800">Biggest Win Margin:</p>
                                    <p className="text-gray-600">Score difference: {biggestWinScoreTeam.best_score_difference}</p>
                                    <p className="text-gray-600 flex items-center">
                                        <i className="fas fa-arrow-up text-green-500 mr-2"></i>
                                        Points For: {biggestWinScoreTeam.best_score_for_team}pts
                                        <i className="fas fa-arrow-down text-red-500 mr-2 ml-2"></i>
                                        Points Against: {biggestWinScoreTeam.best_opponent_score}pts
                                    </p>
                                    <p className="text-gray-600">Opponent: {biggestWinScoreTeam.opponent}</p>
                                    <img src={`${biggestWinScoreTeam.opponent}.png`} alt={`${biggestWinScoreTeam.opponent} icon`} className="h-12 w-12 mb-2" />
                                    <p className="text-gray-600">Year: {biggestWinScoreTeam.year}</p>
                                    <p className="text-gray-600">Round: {biggestWinScoreTeam.round}</p>
                                </div>

                                <div className="mb-4">
                                    <p className="text-lg font-semibold text-green-800">Biggest Loss Margin:</p>
                                    <p className="text-gray-600">Score difference: {biggestLossScoreTeam.best_score_difference}</p>
                                    <p className="text-gray-600 flex items-center">
                                        <i className="fas fa-arrow-up text-green-500 mr-2"></i>
                                        Points For: {biggestLossScoreTeam.best_score_for_team}pts
                                        <i className="fas fa-arrow-down text-red-500 mr-2 ml-2"></i>
                                        Points Against: {biggestLossScoreTeam.best_opponent_score}pts
                                    </p>
                                    <p className="text-gray-600">Opponent: {biggestLossScoreTeam.opponent}</p>
                                    <img src={`${biggestLossScoreTeam.opponent}.png`} alt={`${biggestLossScoreTeam.opponent} icon`} className="h-12 w-12 mb-2" />
                                    <p className="text-gray-600">Year: {biggestLossScoreTeam.year}</p>
                                    <p className="text-gray-600">Round: {biggestLossScoreTeam.round}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}  
            </div>
        );
    }

    return (
      <div className="min-h-screen p-4 flex flex-col justify-between items-center mx-auto">
      <h1 className="text-5xl font-extrabold text-center mb-4 text-blue-700">NRL Team Performance Trends</h1>
      <h2 className="text-3xl font-bold text-center mb-4 text-blue-600">2017-2021</h2>
      <div className="slider-thumb"></div>
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