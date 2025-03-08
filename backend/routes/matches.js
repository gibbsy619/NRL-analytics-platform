// routes/matches.js
const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

router.get('/', matchController.getAllMatches);
router.get('/matches', matchController.getAllMatches);
router.get('/get_team_trends', matchController.getTeamTrends);
router.get('/get_best_win_overall', matchController.getBestWinOverall);
router.get('/get_worst_win_overall', matchController.getWorstWinOverall);
router.get('/get_crowd_wins', matchController.getCrowdWins);

module.exports = router;
