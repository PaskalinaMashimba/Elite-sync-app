const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { fullName, email, passwordHash, role: role || 'CLIENT' }
    });
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ message: 'Account created', token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'No account found with this email' });
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: 'Incorrect password' });
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Login successful', token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, fullName: true, email: true, role: true, phone: true, imageUrl: true, createdAt: true }
    });
    res.json(user);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, imageUrl, currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    let data = { fullName, phone, imageUrl };
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ error: 'Current password required to set new password' });
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
      data.passwordHash = await bcrypt.hash(newPassword, 12);
    }
    const updated = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: { id: true, fullName: true, email: true, role: true, phone: true, imageUrl: true }
    });
    res.json(updated);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
};

module.exports = { register, login, getMe, updateProfile };