const express      = require('express');
const router       = express.Router();
const Consultation = require('../models/Consultation');
const Patient      = require('../models/Patient');
const { protect, authorize } = require('../middleware/auth');

// GET /api/consultations?patientId=...
router.get('/', protect, async (req, res) => {
  try {
    const { patientId, page = 1, limit = 20 } = req.query;
    let query = patientId ? { patientId } : {};
    if (req.user.role === 'patient') query.patientId = req.user.patientId;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Consultation.countDocuments(query);
    const consultations = await Consultation.find(query).sort({ date: -1 }).skip(skip).limit(Number(limit));
    res.json({ consultations, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/consultations/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const c = await Consultation.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Consultation introuvable' });
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/consultations
router.post('/', protect, authorize('medecin'), async (req, res) => {
  try {
    const consultation = await Consultation.create(req.body);
    // Update patient last visit & visit count
    await Patient.findOneAndUpdate(
      { patientId: req.body.patientId },
      { $inc: { nb_visites: 1 }, dernier_rdv: req.body.date }
    );
    res.status(201).json(consultation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/consultations/:id
router.put('/:id', protect, authorize('medecin'), async (req, res) => {
  try {
    const c = await Consultation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!c) return res.status(404).json({ message: 'Consultation introuvable' });
    res.json(c);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/consultations/:id
router.delete('/:id', protect, authorize('medecin'), async (req, res) => {
  try {
    await Consultation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Consultation supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
