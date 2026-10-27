const express = require('express');
const router  = express.Router();
const Patient = require('../models/Patient');
const { protect, authorize } = require('../middleware/auth');

// GET /api/patients
router.get('/', protect, async (req, res) => {
  try {
    const { statut, search, page = 1, limit = 50 } = req.query;
    let query = {};

    if (statut && statut !== 'all') query.statut = statut;
    if (search) {
      query.$or = [
        { nom:      { $regex: search, $options: 'i' } },
        { prenom:   { $regex: search, $options: 'i' } },
        { patientId:{ $regex: search, $options: 'i' } },
        { email:    { $regex: search, $options: 'i' } }
      ];
    }

    // Patient role: only see own record
    if (req.user.role === 'patient') {
      query.patientId = req.user.patientId;
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ patients, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/patients/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.id });
    if (!patient) return res.status(404).json({ message: 'Patient introuvable' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/patients
router.post('/', protect, authorize('medecin'), async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/patients/:id
router.put('/:id', protect, authorize('medecin'), async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { patientId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!patient) return res.status(404).json({ message: 'Patient introuvable' });
    res.json(patient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/patients/:id
router.delete('/:id', protect, authorize('medecin'), async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({ patientId: req.params.id });
    if (!patient) return res.status(404).json({ message: 'Patient introuvable' });
    res.json({ message: 'Patient supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
