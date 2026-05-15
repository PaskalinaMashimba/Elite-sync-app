const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all businesses (public)
router.get('/', async (req, res) => {
  try {
    const businesses = await prisma.business.findMany({
      where: { isActive: true },
      include: { services: { where: { isActive: true } }, owner: { select: { fullName: true, email: true } } }
    });
    res.json(businesses);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// Get MY business only
router.get('/mine', protect, async (req, res) => {
  try {
    const business = await prisma.business.findUnique({
      where: { ownerId: req.userId },
      include: { services: true }
    });
    if (!business) return res.status(404).json({ error: 'No business found' });
    res.json(business);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// Get one business by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const business = await prisma.business.findUnique({
      where: { id: req.params.id },
      include: { services: { where: { isActive: true } }, owner: { select: { fullName: true } } }
    });
    if (!business) return res.status(404).json({ error: 'Not found' });
    res.json(business);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// Create business
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, category, website, phone, email, address, imageUrl, facebook, instagram, twitter, whatsapp } = req.body;
    if (!name || !category) return res.status(400).json({ error: 'Name and category required' });
    const existing = await prisma.business.findUnique({ where: { ownerId: req.userId } });
    if (existing) return res.status(400).json({ error: 'You already have a business profile' });
    const business = await prisma.business.create({
      data: { name, description, category, website, phone, email, address, imageUrl, facebook, instagram, twitter, whatsapp, ownerId: req.userId }
    });
    res.status(201).json(business);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// Update business — ONLY the owner can update their own business
router.put('/:id', protect, async (req, res) => {
  try {
    // Security check: verify this business belongs to the logged-in user
    const business = await prisma.business.findUnique({ where: { id: req.params.id } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (business.ownerId !== req.userId) {
      return res.status(403).json({ error: 'You can only edit your own business' });
    }
    const updated = await prisma.business.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// Delete business — ONLY admin can delete (removed from this route, handled by admin route)
router.delete('/:id', protect, async (req, res) => {
  try {
    const business = await prisma.business.findUnique({ where: { id: req.params.id } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    // Only the owner OR a super admin can deactivate
    if (business.ownerId !== req.userId && req.userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await prisma.business.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'Business deactivated' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;