const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nom, prenom, email, password, role, specialite, rpps, patientId } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email déjà utilisé' });

    const user = await User.create({ nom, prenom, email, password, role, specialite, rpps, patientId });
    const token = signToken(user._id);
    res.status(201).json({ token, user: { id: user._id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Identifiants incorrects' });

    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role, patientId: user.patientId } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
