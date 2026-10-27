const mongoose = require('mongoose');

const ExamenSchema = new mongoose.Schema({
  patientId:   { type: String, required: true },
  patientNom:  { type: String },
  type: {
    type: String,
    enum: ['Bilan sanguin', 'Radiographie', 'Échographie', 'ECG', 'IRM', 'Scanner', 'Spirométrie', 'Fond d\'œil', 'Autre'],
    required: true
  },
  date:        { type: Date, required: true },
  laboratoire: { type: String },
  resultat:    { type: String },
  valeurs: {
    hemoglobine:   { type: Number },
    leucocytes:    { type: Number },
    plaquettes:    { type: Number },
    glycemie:      { type: Number },
    cholesterol:   { type: Number },
    hdl:           { type: Number },
    ldl:           { type: Number },
    triglycerides: { type: Number },
    creatinine:    { type: Number },
    uree:          { type: Number }
  },
  statut: {
    type: String,
    enum: ['en attente', 'disponible', 'transmis', 'urgent'],
    default: 'en attente'
  },
  commentaire:  { type: String },
  medecin:      { type: String, default: 'Dr. Martin' },
  fichier_url:  { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Examen', ExamenSchema);
