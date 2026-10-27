const express      = require('express');
const router       = express.Router();
const Patient      = require('../models/Patient');
const Consultation = require('../models/Consultation');
const RendezVous   = require('../models/RendezVous');
const Examen       = require('../models/Examen');
const { protect, authorize } = require('../middleware/auth');

// GET /api/stats/dashboard
router.get('/dashboard', protect, authorize('medecin'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

    const [
      totalPatients,
      urgents,
      rdvsAujourdhui,
      nouveaux,
      totalConsultations,
      examensEnAttente
    ] = await Promise.all([
      Patient.countDocuments(),
      Patient.countDocuments({ statut: 'urgent' }),
      RendezVous.countDocuments({ date: { $gte: today, $lt: tomorrow }, statut: { $ne: 'annulé' } }),
      Patient.countDocuments({ statut: 'new' }),
      Consultation.countDocuments(),
      Examen.countDocuments({ statut: 'en attente' })
    ]);

    // Patients by statut
    const byStatut = await Patient.aggregate([
      { $group: { _id: '$statut', count: { $sum: 1 } } }
    ]);

    // Consultations last 7 days
    const last7 = new Date(); last7.setDate(last7.getDate() - 7);
    const consultationsParJour = await Consultation.aggregate([
      { $match: { date: { $gte: last7 } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalPatients,
      urgents,
      rdvsAujourdhui,
      nouveaux,
      totalConsultations,
      examensEnAttente,
      byStatut,
      consultationsParJour
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
