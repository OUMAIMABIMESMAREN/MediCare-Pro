require('dotenv').config();
const mongoose     = require('mongoose');
const fs           = require('fs');
const path         = require('path');
const xml2js       = require('xml2js');
const bcrypt       = require('bcryptjs');

const Patient      = require('../models/Patient');
const Consultation = require('../models/Consultation');
const RendezVous   = require('../models/RendezVous');
const Ordonnance   = require('../models/Ordonnance');
const Examen       = require('../models/Examen');
const User         = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cabinet_medical';

// ── Helper ────────────────────────────────────────────────────────────────────
const daysAgo  = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const daysFrom = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const randInt  = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

// ── Parse XML ─────────────────────────────────────────────────────────────────
async function parseXML() {
  const xmlPath = path.join(__dirname, '../../xml/patients.xml');
  const xml = fs.readFileSync(xmlPath, 'utf8');
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(xml);
  return result.cabinet.patients.patient;
}

// ── Map XML patient → Mongoose doc ───────────────────────────────────────────
function mapPatient(p) {
  const id   = p.$.id;
  const med  = p.medical;
  const con  = p.contact;
  const ide  = p.identite;
  const konst = p.constantes;

  const pathologies = med.pathologies?.pathologie
    ? (Array.isArray(med.pathologies.pathologie) ? med.pathologies.pathologie : [med.pathologies.pathologie])
    : [];
  const allergies = med.allergies?.allergie
    ? (Array.isArray(med.allergies.allergie) ? med.allergies.allergie : [med.allergies.allergie])
    : [];

  return {
    patientId:   id,
    prenom:      ide.prenom,
    nom:         ide.nom,
    naissance:   new Date(ide.naissance),
    sexe:        ide.sexe,
    secu:        ide.secu,
    tel:         con.tel,
    email:       con.email,
    adresse:     con.adresse,
    sang:        med.sang,
    taille_cm:   Number(med.taille_cm),
    poids_kg:    Number(med.poids_kg),
    imc:         Number(med.imc),
    pathologies,
    allergies,
    medicaments: med.medicaments,
    constantes: {
      glycemie: Number(konst.glycemie),
      tension:  konst.tension,
      fc:       Number(konst.fc),
      spo2:     Number(konst.spo2)
    },
    statut:      p.statut,
    nb_visites:  Number(p.nb_visites),
    dernier_rdv: new Date(p.dernier_rdv)
  };
}

// ── Seed consultations ────────────────────────────────────────────────────────
const MOTIFS = [
  'Renouvellement ordonnance', 'Douleurs thoraciques', 'Suivi diabète',
  'Contrôle tension artérielle', 'Bilan annuel', 'Fatigue chronique',
  'Douleurs articulaires', 'Suivi traitement', 'Fièvre persistante',
  'Rhinopharyngite', 'Lombalgies', 'Bilan pré-opératoire'
];
const DIAGNOSTICS = [
  'Hypertension stabilisée', 'Diabète type 2 équilibré', 'Rhinopharyngite virale',
  'Lombalgie mécanique', 'Bilan normal', 'HbA1c à surveiller',
  'Arythmie sinusale', 'Hypercholestérolémie familiale', 'Anxiété généralisée'
];

function genConsultations(patientId, n) {
  return Array.from({ length: n }, (_, i) => ({
    patientId,
    date:      daysAgo(randInt(i * 30, i * 30 + 25)),
    motif:     MOTIFS[randInt(0, MOTIFS.length - 1)],
    diagnostic:DIAGNOSTICS[randInt(0, DIAGNOSTICS.length - 1)],
    notes:     'Examen clinique sans anomalie notable. Patient coopérant.',
    tension:   `${randInt(110, 155)}/${randInt(70, 95)}`,
    fc:        randInt(60, 95),
    spo2:      randInt(95, 100),
    glycemie:  (randInt(45, 95) / 10),
    poids_kg:  randInt(55, 100),
    temperature: (randInt(365, 385) / 10),
    traitement: 'Traitement en cours maintenu',
    medecin:   'Dr. Martin',
    suivi_requis: i === 0
  }));
}

// ── Seed rendez-vous ──────────────────────────────────────────────────────────
const TYPES_RDV = ['Consultation générale','Suivi chronique','Bilan annuel','Renouvellement','Résultats'];
const HEURES    = ['08:30','09:00','09:30','10:00','10:30','11:00','14:00','14:30','15:00','15:30','16:00'];
const STATUTS   = ['confirmé','confirmé','confirmé','en attente','annulé'];

function genRDVs(patientId, patientNom, n) {
  return Array.from({ length: n }, (_, i) => ({
    patientId,
    patientNom,
    date:   i < 2 ? daysFrom(randInt(1, 20)) : daysAgo(randInt(1, 60)),
    heure:  HEURES[randInt(0, HEURES.length - 1)],
    duree_min: 30,
    type:   TYPES_RDV[randInt(0, TYPES_RDV.length - 1)],
    statut: i < 2 ? 'confirmé' : STATUTS[randInt(0, STATUTS.length - 1)],
    motif:  MOTIFS[randInt(0, MOTIFS.length - 1)],
    medecin:'Dr. Martin'
  }));
}

// ── Seed ordonnances ──────────────────────────────────────────────────────────
function genOrdonnances(patientId, patientNom, medicaments, n) {
  const meds = medicaments.split(',').map(m => m.trim()).filter(Boolean);
  return Array.from({ length: n }, (_, i) => ({
    patientId,
    patientNom,
    date:   daysAgo(i * 30),
    medecin:'Dr. Martin',
    medicaments: meds.map(m => {
      const parts = m.split(' ');
      return {
        nom:       parts.slice(0, -1).join(' ') || m,
        dosage:    parts[parts.length - 1] || '',
        frequence: '1 fois par jour',
        duree:     '1 mois',
        instructions: 'À prendre au cours du repas'
      };
    }),
    duree_traitement: '1 mois',
    renouvellement: i > 0,
    validite_jours: 90
  }));
}

// ── Seed examens ─────────────────────────────────────────────────────────────
const EXAM_TYPES = ['Bilan sanguin', 'ECG', 'Radiographie', 'Échographie', 'Spirométrie'];
const EXAM_STATUTS = ['disponible','disponible','en attente','transmis'];

function genExamens(patientId, patientNom, n) {
  return Array.from({ length: n }, (_, i) => ({
    patientId,
    patientNom,
    type:        EXAM_TYPES[i % EXAM_TYPES.length],
    date:        daysAgo(randInt(5, 90)),
    laboratoire: 'Laboratoire Central Paris',
    resultat:    i % 3 === 0 ? 'Valeurs dans les normes' : 'À surveiller',
    valeurs: {
      hemoglobine:   (randInt(120, 160) / 10),
      leucocytes:    (randInt(40, 100) / 10),
      plaquettes:    randInt(150, 400),
      glycemie:      (randInt(45, 95) / 10),
      cholesterol:   (randInt(35, 60) / 10),
      hdl:           (randInt(10, 20) / 10),
      ldl:           (randInt(20, 45) / 10),
      triglycerides: randInt(80, 200),
      creatinine:    randInt(50, 110),
      uree:          (randInt(25, 70) / 10)
    },
    statut:     EXAM_STATUTS[i % EXAM_STATUTS.length],
    commentaire:'Résultats à discuter lors de la prochaine consultation',
    medecin:    'Dr. Martin'
  }));
}

// ── Main seed ─────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connecté à MongoDB');

  // Clear all collections
  await Promise.all([
    Patient.deleteMany({}),
    Consultation.deleteMany({}),
    RendezVous.deleteMany({}),
    Ordonnance.deleteMany({}),
    Examen.deleteMany({}),
    User.deleteMany({})
  ]);
  console.log('🗑️  Collections vidées');

  // Parse XML → patients
  const xmlPatients = await parseXML();
  const patientDocs = xmlPatients.map(mapPatient);
  const insertedPatients = await Patient.insertMany(patientDocs);
  console.log(`👥 ${insertedPatients.length} patients insérés`);

  // Seed consultations, rdvs, ordonnances, examens per patient
  let totalC = 0, totalR = 0, totalO = 0, totalE = 0;
  for (const p of insertedPatients) {
    const fullName = `${p.prenom} ${p.nom}`;
    const nConsult = Math.min(p.nb_visites, randInt(3, 6));
    const meds = p.medicaments || 'Paracétamol 1g';

    const [cs, rs, os, es] = await Promise.all([
      Consultation.insertMany(genConsultations(p.patientId, nConsult)),
      RendezVous.insertMany(genRDVs(p.patientId, fullName, randInt(2, 4))),
      Ordonnance.insertMany(genOrdonnances(p.patientId, fullName, meds, randInt(1, 3))),
      Examen.insertMany(genExamens(p.patientId, fullName, randInt(2, 4)))
    ]);
    totalC += cs.length; totalR += rs.length; totalO += os.length; totalE += es.length;
  }
  console.log(`📋 ${totalC} consultations | 📅 ${totalR} RDVs | 💊 ${totalO} ordonnances | 🔬 ${totalE} examens`);

  // Create default users
  const salt = await bcrypt.genSalt(10);
  await User.insertMany([
    {
      nom: 'Martin', prenom: 'Jean',
      email: 'dr.martin@cabinet.fr',
      password: await bcrypt.hash('medecin123', salt),
      role: 'medecin',
      specialite: 'Médecine générale',
      rpps: '10012345678'
    },
    {
      nom: 'Bernard', prenom: 'Sophie',
      email: 'sophie.bernard@email.fr',
      password: await bcrypt.hash('patient123', salt),
      role: 'patient',
      patientId: 'P-00001'
    },
    {
      nom: 'Lefebvre', prenom: 'Marc',
      email: 'marc.lefebvre@email.fr',
      password: await bcrypt.hash('patient123', salt),
      role: 'patient',
      patientId: 'P-00002'
    }
  ]);
  console.log('👤 Utilisateurs créés:');
  console.log('   Médecin → dr.martin@cabinet.fr / medecin123');
  console.log('   Patient → sophie.bernard@email.fr / patient123');
  console.log('   Patient → marc.lefebvre@email.fr / patient123');

  await mongoose.disconnect();
  console.log('✅ Seed terminé !');
}

seed().catch(err => { console.error(err); process.exit(1); });
