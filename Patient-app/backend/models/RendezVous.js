const mongoose = require('mongoose');

const RendezVousSchema = new mongoose.Schema({
  patientId:   { type: String, required: true },
  patientNom:  { type: String },
  date:        { type: Date, required: true },
  heure:       { type: String, required: true },
  duree_min:   { type: Number, default: 30 },
  type: {
    type: String,
    enum: ['Consultation générale', 'Suivi chronique', 'Bilan annuel', 'Urgence', 'Renouvellement', 'Résultats'],
    default: 'Consultation générale'
  },
  statut: {
    type: String,
    enum: ['confirmé', 'en attente', 'annulé', 'terminé'],
    default: 'confirmé'
  },
  motif:       { type: String },
  medecin:     { type: String, default: 'Dr. Martin' },
  notes:       { type: String },
  rappel_envoye: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('RendezVous', RendezVousSchema);
