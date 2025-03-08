// controllers/matchController.js
const pool = require('../config/db');

exports.getAllMatches = (req, res) => {
  const query = 'SELECT * FROM matches';
  pool.query(query, (err, results) => {
    if (err) return res.status(500).send('Error querying the database');
    res.json(results);
  });
};

exports.getTeamTrends = (req, res) => {
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
    }


exports.getBestWinOverall = (req, res) => {
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
};

exports.getWorstWinOverall = (req, res) => {
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
}

exports.getCrowdWins = (req, res) => {
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

}
