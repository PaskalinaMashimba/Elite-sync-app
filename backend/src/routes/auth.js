const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Delete own account
router.delete('/account', protect, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Verify password before deleting
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Incorrect password. Account not deleted.' });

    if (user.role === 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Admin accounts cannot be self-deleted' });
    }

    // Delete bookings first
    await prisma.booking.deleteMany({ where: { userId: req.userId } });

    // If business owner delete their business too
    const business = await prisma.business.findUnique({ where: { ownerId: req.userId } });
    if (business) {
      await prisma.booking.deleteMany({ where: { service: { businessId: business.id } } });
      await prisma.service.deleteMany({ where: { businessId: business.id } });
      await prisma.availability.deleteMany({ where: { businessId: business.id } });
      await prisma.blockedDate.deleteMany({ where: { businessId: business.id } });
      await prisma.business.delete({ where: { id: business.id } });
    }

    await prisma.user.delete({ where: { id: req.userId } });
    res.json({ message: 'Account permanently deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;