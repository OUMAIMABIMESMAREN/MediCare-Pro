const mongoose = require('mongoose');

const ConstantesSchema = new mongoose.Schema({
  glycemie: { type: Number },
  tension:  { type: String },
  fc:       { type: Number },
  spo2:     { type: Number }
}, { _id: false });

const PatientSchema = new mongoose.Schema({
  patientId:   { type: String, unique: true, required: true },
  prenom:      { type: String, required: true, trim: true },
  nom:         { type: String, required: true, trim: true },
  naissance:   { type: Date, required: true },
  sexe:        { type: String, enum: ['M', 'F'], required: true },
  secu:        { type: String, trim: true },
  tel:         { type: String, trim: true },
  email:       { type: String, trim: true, lowercase: true },
  adresse:     { type: String, trim: true },
  sang:        { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
  taille_cm:   { type: Number },
  poids_kg:    { type: Number },
  imc:         { type: Number },
  pathologies: [{ type: String }],
  allergies:   [{ type: String }],
  medicaments: { type: String },
  constantes:  { type: ConstantesSchema, default: {} },
  statut: {
    type: String,
    enum: ['stable', 'checkup', 'urgent', 'new'],
    default: 'new'
  },
  nb_visites:  { type: Number, default: 0 },
  dernier_rdv: { type: Date },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Virtual: age
PatientSchema.virtual('age').get(function () {
  if (!this.naissance) return null;
  const today = new Date();
  const birth  = new Date(this.naissance);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
});

PatientSchema.set('toJSON', { virtuals: true });
PatientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Patient', PatientSchema);
