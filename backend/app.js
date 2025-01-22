// app.js
const express = require('express');
const cors = require('cors'); // Import the CORS middleware
const mysql = require('mysql2');
require('dotenv').config(); // Import the dotenv library

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,    // MySQL server hostname
  user: process.env.DB_USER,  // MySQL username
  password: process.env.DB_PASSWORD,  // MySQL password
  database: process.env.DB_NAME  // Database name
});

const app = express();

// Enable CORS
app.use(cors());

// Set up middleware
app.use(express.json());

// Endpoint to test the connection
app.get('/', (req, res) => {
  res.send('API is working');
});

// Create an endpoint to fetch all rows from a table
app.get('/matches', (req, res) => {
  const query = 'SELECT * FROM matches';

  pool.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Error querying the database');
    }
    res.json(results);
  });
});

// Endpoint to fetch team trends
app.get('/get_team_trends', (req, res) => {
    const query = `SELECT 
    team,
    surface_type,
    AVG(COALESCE(win_as_home, 0)) AS home_win_rate,
    AVG(COALESCE(win_as_away, 0)) AS away_win_rate,
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
  GROUP BY team, surface_type
  ORDER BY team, overall_win_rate DESC;
`;
  
    pool.query(query, (err, results) => {
      if (err) {
        return res.status(500).send('Error querying the database');
      }
      res.json(results);
    });
  });

// endpoint to fetch the best team
  app.get('/get_best_win_overall', (req, res) => {
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
LIMIT 1;  
`;
  
    pool.query(query, (err, results) => {
      if (err) {
        return res.status(500).send('Error querying the database');
      }
      res.json(results);
    });
  });
// endpoint to fetch the worst team
  app.get('/get_worst_win_overall', (req, res) => {
    const query = ` SELECT 
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
    HAVING COUNT(*) > 5  
    ORDER BY overall_win_rate ASC 
    LIMIT 1; 
`;
  
    pool.query(query, (err, results) => {
      if (err) {
        return res.status(500).send('Error querying the database');
      }
      res.json(results);
    });
  });

// endpoint to fetch the best team on a surface
  app.get('/get_best_surface_win', (req, res) => {
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
  });

// endpoint to fetch the worst team on a surface
  app.get('/get_worst_surface_win', (req, res) => {
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
});

// endpoint to fetch the best team at home
app.get('/get_best_home_win', (req, res) => {
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
});

// endpoint to fetch the best team away
app.get('/get_best_away_win', (req, res) => {
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
});

// endpoint to fetch the worst team at home
app.get('/get_worst_home_win', (req, res) => {
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
});


// endpoint to fetch the worst team away
app.get('/get_worst_away_win', (req, res) => {
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
});

// endpoint to fetch win rate in relation to crowd size
app.get('/get_crowd_wins', (req, res) => {
  const query = `WITH game_outcomes AS (
    SELECT
        m.hteam AS team,
        l.location,
        l.capacity AS crowd_size,
        'home' AS game_type,
        CASE 
            WHEN m.hscore > m.ascore THEN 'win'
            WHEN m.hscore < m.ascore THEN 'loss'
            ELSE 'draw'
        END AS result
    FROM matches m
    JOIN locations l ON m.location = l.location

    UNION ALL

    SELECT
        m.ateam AS team,
        l.location,
        l.capacity AS crowd_size,
        'away' AS game_type,
        CASE 
            WHEN m.ascore > m.hscore THEN 'win'
            WHEN m.ascore < m.hscore THEN 'loss'
            ELSE 'draw'
        END AS result
    FROM matches m
    JOIN locations l ON m.location = l.location
),

smallest_win_crowd AS (
    SELECT 
        team,
        game_type,
        MIN(crowd_size) AS smallest_crowd
    FROM game_outcomes
    WHERE result = 'win'
    GROUP BY team, game_type
    ORDER BY smallest_crowd ASC
),

largest_loss_crowd AS (
    SELECT 
        team,
        game_type,
        MAX(crowd_size) AS largest_crowd
    FROM game_outcomes
    WHERE result = 'loss'
    GROUP BY team, game_type
    ORDER BY largest_crowd DESC
)

SELECT 
    'Smallest Crowd for Wins' AS description,
    team,
    game_type,
    smallest_crowd AS crowd_size
FROM smallest_win_crowd
UNION ALL
SELECT 
    'Largest Crowd for Losses' AS description,
    team,
    game_type,
    largest_crowd AS crowd_size
FROM largest_loss_crowd;

  `;

pool.query(query, (err, results) => {
  if (err) {
    return res.status(500).send('Error querying the database');
  }
  res.json(results);
});
});


// endpoint to fetch the best and worst team in terms of points for and against
app.get('/get_points_for_against', (req, res) => {
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
});

// endpoint to fetch overall win rate for each team
app.get('/get_all_overall_wins', (req, res) => {
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
});

// endpoint to fetch the best season for each team
app.get('/get_best_season', (req, res) => {
  const query = `WITH team_performance AS (
  SELECT
      m.hteam AS team,
      m.year,
      CASE 
          WHEN m.hscore > m.ascore THEN 1  -- Home win
          ELSE 0                           -- Home loss or draw
      END AS home_win,
      CASE 
          WHEN m.ascore > m.hscore THEN 1  -- Away win
          ELSE 0                           -- Away loss or draw
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
-- Get the best season for each team (one with the most wins)
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
});

// endpoint to get the biggest score difference for each team
app.get('/get_biggest_score', (req, res) => {
  const query = `-- Best score for each team (largest difference in points) with actual scores
SELECT 
    team,
    score_difference AS best_score_difference,
    hscore AS best_score_for_team,
    ascore AS best_opponent_score
FROM (
    -- Home games
    SELECT 
        m.hteam AS team,
        m.hscore - m.ascore AS score_difference,
        m.hscore,
        m.ascore,
        ROW_NUMBER() OVER (PARTITION BY m.hteam ORDER BY (m.hscore - m.ascore) DESC) AS row_num
    FROM matches m
    UNION ALL
    -- Away games
    SELECT 
        m.ateam AS team,
        m.ascore - m.hscore AS score_difference,
        m.hscore,
        m.ascore,
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
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
