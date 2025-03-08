// controllers/statsController.js
const e = require('express');
const pool = require('../config/db');

exports.getBestSurfaceWin = (req, res) => {
    const query = ` WITH team_performance AS (
        SELECT 
            m.hteam AS team,
            l.surface_type,
            AVG(CASE 
                WHEN m.hscore > m.ascore THEN 1  
                WHEN m.hscore < m.ascore THEN 0  
                ELSE 0.5  
            END) AS win_rate,
            COUNT(*) AS games_played
        FROM matches m
        JOIN locations l ON m.location = l.location
        GROUP BY m.hteam, l.surface_type
    
        UNION
    
        SELECT 
            m.ateam AS team,
            l.surface_type,
            AVG(CASE 
                WHEN m.ascore > m.hscore THEN 1  
                WHEN m.ascore < m.hscore THEN 0 
                ELSE 0.5  
            END) AS win_rate,
            COUNT(*) AS games_played
        FROM matches m
        JOIN locations l ON m.location = l.location
        GROUP BY m.ateam, l.surface_type
    )
    
    SELECT 
        team, 
        surface_type, 
        win_rate,
        games_played
    FROM (
        SELECT 
            team, 
            surface_type, 
            win_rate,
            games_played,
            RANK() OVER (PARTITION BY surface_type ORDER BY win_rate DESC) AS win_rank
        FROM team_performance
        HAVING games_played > 5 
    ) AS ranked_teams
    WHERE win_rank = 1;
    
        `;
    
    pool.query(query, (err, results) => {
        if (err) {
        return res.status(500).send('Error querying the database');
        }
        res.json(results);
    });
};

exports.getWorstSurfaceWin = (req, res) => {
    const query = `  WITH team_performance AS (
        SELECT 
            m.hteam AS team,
            l.surface_type,
            AVG(CASE 
                WHEN m.hscore > m.ascore THEN 1  
                WHEN m.hscore < m.ascore THEN 0  
                ELSE 0.5  
            END) AS win_rate,
            COUNT(*) AS games_played
        FROM matches m
        JOIN locations l ON m.location = l.location
        GROUP BY m.hteam, l.surface_type
    
        UNION
    
        SELECT 
            m.ateam AS team,
            l.surface_type,
            AVG(CASE 
                WHEN m.ascore > m.hscore THEN 1 
                WHEN m.ascore < m.hscore THEN 0  
                ELSE 0.5 
            END) AS win_rate,
            COUNT(*) AS games_played
        FROM matches m
        JOIN locations l ON m.location = l.location
        GROUP BY m.ateam, l.surface_type
    )
    
    SELECT 
        team, 
        surface_type, 
        win_rate,
        games_played
    FROM (
        SELECT 
            team, 
            surface_type, 
            win_rate,
            games_played,
            RANK() OVER (PARTITION BY surface_type ORDER BY win_rate ASC) AS win_rank
        FROM team_performance
        HAVING games_played > 5  
    ) AS ranked_teams
    WHERE win_rank = 1;
    
        `;
    
    pool.query(query, (err, results) => {
    if (err) {
        return res.status(500).send('Error querying the database');
    }
    res.json(results);
    });
};

exports.getBestHomeWin = (req, res) => {
    const query = ` SELECT 
    team,
    AVG(COALESCE(win_as_home, 0)) AS home_win_rate
    FROM (
        SELECT 
            m.hteam AS team,
            l.surface_type,
            CASE WHEN m.hscore > m.ascore THEN 1 ELSE 0 END AS win_as_home
        FROM matches m
        JOIN locations l ON m.location = l.location
    ) combined
    GROUP BY team
    HAVING COUNT(*) > 5 
    ORDER BY home_win_rate DESC  
    LIMIT 1;
    `;

    pool.query(query, (err, results) => {
    if (err) {
        return res.status(500).send('Error querying the database');
    }
    res.json(results);
    });
}

exports.getBestAwayWin = (req, res) => {
    const query = ` SELECT 
    team,
    AVG(COALESCE(win_as_away, 0)) AS away_win_rate
    FROM (
        SELECT 
            m.ateam AS team,
            l.surface_type,
            CASE WHEN m.ascore > m.hscore THEN 1 ELSE 0 END AS win_as_away
        FROM matches m
        JOIN locations l ON m.location = l.location
    ) combined
    GROUP BY team
    HAVING COUNT(*) > 5 
    ORDER BY away_win_rate DESC  
    LIMIT 1;  

    `;

    pool.query(query, (err, results) => {
    if (err) {
        return res.status(500).send('Error querying the database');
    }
    res.json(results);
    });
}

exports.getWorstHomeWin = (req, res) => {
    const query = ` SELECT 
    team,
    AVG(COALESCE(win_as_home, 0)) AS home_win_rate
    FROM (
        SELECT 
            m.hteam AS team,
            l.surface_type,
            CASE WHEN m.hscore > m.ascore THEN 1 ELSE 0 END AS win_as_home
        FROM matches m
        JOIN locations l ON m.location = l.location
    ) combined
    GROUP BY team
    HAVING COUNT(*) > 5  
    ORDER BY home_win_rate ASC  
    LIMIT 1;  

    `;

    pool.query(query, (err, results) => {
    if (err) {
        return res.status(500).send('Error querying the database');
    }
    res.json(results);
    });
}

exports.getWorstAwayWin = (req, res) => {
    const query = `SELECT 
    team,
    AVG(COALESCE(win_as_away, 0)) AS away_win_rate
    FROM (
        SELECT 
            m.ateam AS team,
            l.surface_type,
            CASE WHEN m.ascore > m.hscore THEN 1 ELSE 0 END AS win_as_away
        FROM matches m
        JOIN locations l ON m.location = l.location
    ) combined
    GROUP BY team
    HAVING COUNT(*) > 5 
    ORDER BY away_win_rate ASC 
    LIMIT 1;  
    `;

    pool.query(query, (err, results) => {
    if (err) {
        return res.status(500).send('Error querying the database');
    }
    res.json(results);
    });
}

exports.getPointsForAgainst = (req, res) => {
    const query = `
    WITH highest_win_team AS (
        SELECT 
            team,
            AVG(COALESCE(win_as_home, 0) + COALESCE(win_as_away, 0)) AS overall_win_rate
        FROM (
            SELECT 
                m.hteam AS team,
                CASE WHEN m.hscore > m.ascore THEN 1 ELSE 0 END AS win_as_home,
                NULL AS win_as_away
            FROM matches m
            UNION ALL
            SELECT 
                m.ateam AS team,
                NULL AS win_as_home,
                CASE WHEN m.ascore > m.hscore THEN 1 ELSE 0 END AS win_as_away
            FROM matches m
        ) combined
        GROUP BY team
        ORDER BY overall_win_rate DESC
        LIMIT 1
    ),
    
    lowest_win_team AS (
        SELECT 
            team,
            AVG(COALESCE(win_as_home, 0) + COALESCE(win_as_away, 0)) AS overall_win_rate
        FROM (
            SELECT 
                m.hteam AS team,
                CASE WHEN m.hscore > m.ascore THEN 1 ELSE 0 END AS win_as_home,
                NULL AS win_as_away
            FROM matches m
            UNION ALL
            SELECT 
                m.ateam AS team,
                NULL AS win_as_home,
                CASE WHEN m.ascore > m.hscore THEN 1 ELSE 0 END AS win_as_away
            FROM matches m
        ) combined
        GROUP BY team
        ORDER BY overall_win_rate ASC
        LIMIT 1
    )
    
    
    SELECT
        'Highest Win Percentage Team' AS team_type,
        h.team AS team,
        SUM(CASE WHEN m.hteam = h.team THEN m.hscore ELSE m.ascore END) AS total_points_scored,
        SUM(CASE WHEN m.hteam = h.team THEN m.ascore ELSE m.hscore END) AS total_points_conceded
    FROM matches m
    JOIN highest_win_team h ON m.hteam = h.team OR m.ateam = h.team
    GROUP BY h.team
    
    UNION ALL
    
    SELECT
        'Lowest Win Percentage Team' AS team_type,
        l.team AS team, 
        SUM(CASE WHEN m.hteam = l.team THEN m.hscore ELSE m.ascore END) AS total_points_scored,
        SUM(CASE WHEN m.hteam = l.team THEN m.ascore ELSE m.hscore END) AS total_points_conceded
    FROM matches m
    JOIN lowest_win_team l ON m.hteam = l.team OR m.ateam = l.team
    GROUP BY l.team;
    
      `;
    
    pool.query(query, (err, results) => {
      if (err) {
        return res.status(500).send('Error querying the database');
      }
      res.json(results);
    });
}

exports.getAllOverallWins = (req, res) => {
    const query = `SELECT 
    team,
    AVG(COALESCE(win_as_home, 0) + COALESCE(win_as_away, 0)) AS overall_win_rate
    FROM (
        SELECT 
            m.hteam AS team,
            l.surface_type,
            CASE WHEN m.hscore > m.ascore THEN 1 ELSE 0 END AS win_as_home,
            NULL AS win_as_away
        FROM matches m
        JOIN locations l ON m.location = l.location
        
        UNION ALL

        SELECT 
            m.ateam AS team,
            l.surface_type,
            NULL AS win_as_home,
            CASE WHEN m.ascore > m.hscore THEN 1 ELSE 0 END AS win_as_away
        FROM matches m
        JOIN locations l ON m.location = l.location
    ) combined
    GROUP BY team
    ORDER BY overall_win_rate DESC
    `;

    pool.query(query, (err, results) => {
    if (err) {
        return res.status(500).send('Error querying the database');
    }
    res.json(results);
    });
}

exports.getBestSeason = (req, res) => {
    const query = `WITH team_performance AS (
    SELECT
        m.hteam AS team,
        m.year,
        CASE 
            WHEN m.hscore > m.ascore THEN 1  
            ELSE 0                         
        END AS home_win,
        CASE 
            WHEN m.ascore > m.hscore THEN 1 
            ELSE 0                           
        END AS away_win
    FROM matches m
    ),
    team_seasons AS (
    SELECT
        team,
        year,
        COUNT(*) AS total_matches_in_season,
        SUM(home_win) + SUM(away_win) AS total_wins_in_season
    FROM team_performance
    GROUP BY team, year
    )
    SELECT 
    team,
    year,
    total_wins_in_season
    FROM team_seasons
    WHERE total_wins_in_season = (
    SELECT MAX(total_wins_in_season) 
    FROM team_seasons ts2 
    WHERE ts2.team = team_seasons.team
    )
    ORDER BY team, year;
    `;
    
    pool.query(query, (err, results) => {
    if (err) {
        return res.status(500).send('Error querying the database');
    }
    res.json(results);
    });
}

exports.getBiggestScore = (req, res) => {
    const query = `
    SELECT 
    team,
    opponent,
    year,  
    round, 
    score_difference AS best_score_difference,
    hscore AS best_score_for_team,
    ascore AS best_opponent_score
    FROM (
        SELECT 
            m.hteam AS team,
            m.ateam AS opponent,  
            m.hscore - m.ascore AS score_difference,
            m.hscore,
            m.ascore,
            m.year,  
            m.round, 
            ROW_NUMBER() OVER (PARTITION BY m.hteam ORDER BY (m.hscore - m.ascore) DESC) AS row_num
        FROM matches m
        UNION ALL
        SELECT 
            m.ateam AS team,
            m.hteam AS opponent,  
            m.ascore - m.hscore AS score_difference,
            m.hscore,
            m.ascore,
            m.year,  
            m.round, 
            ROW_NUMBER() OVER (PARTITION BY m.ateam ORDER BY (m.ascore - m.hscore) DESC) AS row_num
        FROM matches m
    ) AS team_scores
    WHERE row_num = 1
    ORDER BY best_score_difference DESC;
      `;
    
    pool.query(query, (err, results) => {
      if (err) {
        return res.status(500).send('Error querying the database');
      }
      res.json(results);
    });
} 