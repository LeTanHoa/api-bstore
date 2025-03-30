const express = require("express");
const {
  getTournaments,
  createTournament,
  updateTournament,
  deleteTournament,
} = require("../controllers/tournamentController");

const router = express.Router();

router.get("/", getTournaments);
router.post("/", createTournament);
router.put("/:id", updateTournament);
router.delete("/:id", deleteTournament);

module.exports = router;
