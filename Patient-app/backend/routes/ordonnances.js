const express     = require('express');
const router      = express.Router();
const Ordonnance  = require('../models/Ordonnance');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { patientId } = req.query;
    let query = {};
    if (patientId) query.patientId = patientId;
    if (req.user.role === 'patient') query.patientId = req.user.patientId;
    const ordonnances = await Ordonnance.find(query).sort({ date: -1 });
    res.json(ordonnances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const o = await Ordonnance.findById(req.params.id);
    if (!o) return res.status(404).json({ message: 'Ordonnance introuvable' });
    res.json(o);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, authorize('medecin'), async (req, res) => {
  try {
    const o = await Ordonnance.create(req.body);
    res.status(201).json(o);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', protect, authorize('medecin'), async (req, res) => {
  try {
    const o = await Ordonnance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!o) return res.status(404).json({ message: 'Ordonnance introuvable' });
    res.json(o);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, authorize('medecin'), async (req, res) => {
  try {
    await Ordonnance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ordonnance supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
