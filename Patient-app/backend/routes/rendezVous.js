const express    = require('express');
const router     = express.Router();
const RendezVous = require('../models/RendezVous');
const { protect, authorize } = require('../middleware/auth');

// GET /api/rendez-vous
router.get('/', protect, async (req, res) => {
  try {
    const { patientId, date, statut } = req.query;
    let query = {};
    if (patientId) query.patientId = patientId;
    if (statut)    query.statut = statut;
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end   = new Date(date); end.setHours(23, 59, 59, 999);
      query.date  = { $gte: start, $lte: end };
    }
    if (req.user.role === 'patient') query.patientId = req.user.patientId;

    const rdvs = await RendezVous.find(query).sort({ date: 1, heure: 1 });
    res.json(rdvs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/rendez-vous/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const rdv = await RendezVous.findById(req.params.id);
    if (!rdv) return res.status(404).json({ message: 'RDV introuvable' });
    res.json(rdv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/rendez-vous
router.post('/', protect, async (req, res) => {
  try {
    const rdv = await RendezVous.create(req.body);
    res.status(201).json(rdv);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/rendez-vous/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const rdv = await RendezVous.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rdv) return res.status(404).json({ message: 'RDV introuvable' });
    res.json(rdv);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/rendez-vous/:id
router.delete('/:id', protect, authorize('medecin'), async (req, res) => {
  try {
    await RendezVous.findByIdAndDelete(req.params.id);
    res.json({ message: 'RDV supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
