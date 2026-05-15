const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all services (public) — with optional businessId filter
router.get('/', async (req, res) => {
  try {
    const where = { isActive: true };
    if (req.query.businessId) where.businessId = req.query.businessId;
    const services = await prisma.service.findMany({
      where,
      include: { business: { select: { id: true, name: true, category: true, phone: true, email: true, website: true, address: true, imageUrl: true } } },
      orderBy: { business: { name: 'asc' } }
    });
    res.json(services);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// Get one service
router.get('/:id', async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: { business: true }
    });
    if (!service) return res.status(404).json({ error: 'Not found' });
    res.json(service);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// Create service — only business owner for their own business
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, durationMin, price, businessId, imageUrl, staffName, availableFrom, availableTo, availableDays } = req.body;
    if (!name || !durationMin || !price || !businessId) {
      return res.status(400).json({ error: 'Name, duration, price and businessId required' });
    }
    // Security: verify the business belongs to this user
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || business.ownerId !== req.userId) {
      return res.status(403).json({ error: 'You can only add services to your own business' });
    }
    const service = await prisma.service.create({
      data: { name, description, durationMin: parseInt(durationMin), price: parseFloat(price), businessId, imageUrl, staffName, availableFrom, availableTo, availableDays }
    });
    res.status(201).json(service);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// Update service — only the business owner
router.put('/:id', protect, async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: { business: true }
    });
    if (!service) return res.status(404).json({ error: 'Service not found' });
    if (service.business.ownerId !== req.userId) {
      return res.status(403).json({ error: 'You can only edit services in your own business' });
    }
    const updated = await prisma.service.update({ where: { id: req.params.id }, data: req.body });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// Delete/deactivate service — only the business owner
router.delete('/:id', protect, async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: { business: true }
    });
    if (!service) return res.status(404).json({ error: 'Service not found' });
    if (service.business.ownerId !== req.userId) {
      return res.status(403).json({ error: 'You can only remove services from your own business' });
    }
    await prisma.service.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'Service removed' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;