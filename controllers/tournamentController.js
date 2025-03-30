const Tournament = require('../models/Tournament');

const getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find();
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTournament = async (req, res) => {
  const { name, location, date } = req.body;

  try {
    const newTournament = new Tournament({ name, location, date });
    await newTournament.save();
    res.status(201).json(newTournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTournament = async (req, res) => {
  const { id } = req.params;
  const { name, location, date } = req.body;

  try {
    const updatedTournament = await Tournament.findByIdAndUpdate(
      id,
      { name, location, date },
      { new: true }
    );

    if (!updatedTournament) return res.status(404).json({ message: 'Không tìm thấy giải đấu' });

    res.status(200).json(updatedTournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTournament = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTournament = await Tournament.findByIdAndDelete(id);
    if (!deletedTournament) return res.status(404).json({ message: 'Không tìm thấy giải đấu' });

    res.status(200).json({ message: 'Xóa giải đấu thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTournaments, createTournament, updateTournament, deleteTournament };
