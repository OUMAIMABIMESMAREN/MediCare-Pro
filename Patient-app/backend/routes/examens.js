const express = require('express');
const router  = express.Router();
const Examen  = require('../models/Examen');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { patientId, statut } = req.query;
    let query = {};
    if (patientId) query.patientId = patientId;
    if (statut)    query.statut = statut;
    if (req.user.role === 'patient') query.patientId = req.user.patientId;
    const examens = await Examen.find(query).sort({ date: -1 });
    res.json(examens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const e = await Examen.findById(req.params.id);
    if (!e) return res.status(404).json({ message: 'Examen introuvable' });
    res.json(e);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, authorize('medecin'), async (req, res) => {
  try {
    const e = await Examen.create(req.body);
    res.status(201).json(e);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', protect, authorize('medecin'), async (req, res) => {
  try {
    const e = await Examen.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!e) return res.status(404).json({ message: 'Examen introuvable' });
    res.json(e);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, authorize('medecin'), async (req, res) => {
  try {
    await Examen.findByIdAndDelete(req.params.id);
    res.json({ message: 'Examen supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
