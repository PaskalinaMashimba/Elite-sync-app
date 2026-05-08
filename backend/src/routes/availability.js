const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get availability for a business
router.get('/:businessId', async (req, res) => {
  try {
    const avail = await prisma.availability.findMany({
      where: { businessId: req.params.businessId }
    });
    res.json(avail);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// Set availability (business owner)
router.post('/', protect, async (req, res) => {
  try {
    const business = await prisma.business.findUnique({ where: { ownerId: req.userId } });
    if (!business) return res.status(404).json({ error: 'No business found' });

    const { dayOfWeek, startTime, endTime, isOpen } = req.body;

    // Upsert — create or update
    const avail = await prisma.availability.upsert({
      where: { businessId_dayOfWeek: { businessId: business.id, dayOfWeek } },
      update: { startTime, endTime, isOpen },
      create: { businessId: business.id, dayOfWeek, startTime, endTime, isOpen }
    });
    res.json(avail);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Set blocked date (holiday/closed day)
router.post('/blocked', protect, async (req, res) => {
  try {
    const business = await prisma.business.findUnique({ where: { ownerId: req.userId } });
    if (!business) return res.status(404).json({ error: 'No business found' });
    const { date, reason } = req.body;
    const blocked = await prisma.blockedDate.create({
      data: { businessId: business.id, date: new Date(date), reason }
    });
    res.json(blocked);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// Get blocked dates
router.get('/:businessId/blocked', async (req, res) => {
  try {
    const blocked = await prisma.blockedDate.findMany({
      where: { businessId: req.params.businessId }
    });
    res.json(blocked);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// Delete blocked date
router.delete('/blocked/:id', protect, async (req, res) => {
  try {
    await prisma.blockedDate.delete({ where: { id: req.params.id } });
    res.json({ message: 'Removed' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;