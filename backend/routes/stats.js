// routes/stats.js
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/get_best_surface_win', statsController.getBestSurfaceWin);
router.get('/get_worst_surface_win', statsController.getWorstSurfaceWin);
router.get('/get_best_home_win', statsController.getBestHomeWin);
router.get('/get_best_away_win', statsController.getBestAwayWin);
router.get('/get_worst_home_win', statsController.getWorstHomeWin);
router.get('/get_worst_away_win', statsController.getWorstAwayWin);
router.get('/get_points_for_against', statsController.getPointsForAgainst);
router.get('/get_all_overall_wins', statsController.getAllOverallWins);
router.get('/get_best_season', statsController.getBestSeason);
router.get('/get_biggest_score', statsController.getBiggestScore);

module.exports = router;
