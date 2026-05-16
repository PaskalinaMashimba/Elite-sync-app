const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Platform overview stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers      = await prisma.user.count();
    const totalClients    = await prisma.user.count({ where: { role: 'CLIENT' } });
    const totalOwners     = await prisma.user.count({ where: { role: 'BUSINESS_OWNER' } });
    const totalBusinesses = await prisma.business.count();
    const totalBookings   = await prisma.booking.count();
    const totalServices   = await prisma.service.count();
    const approvedBookings = await prisma.booking.count({ where: { status: 'APPROVED' } });
    const pendingBookings  = await prisma.booking.count({ where: { status: 'PENDING' } });

    const now = new Date();
    const monthlySignups = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleString('default', { month: 'short' }) };
      }).map(async ({ year, month, label }) => {
        const start = new Date(year, month, 1);
        const end   = new Date(year, month + 1, 0, 23, 59, 59);
        const users = await prisma.user.count({ where: { createdAt: { gte: start, lte: end } } });
        const bookings = await prisma.booking.count({ where: { createdAt: { gte: start, lte: end } } });
        return { label, users, bookings };
      })
    );

    const businesses = await prisma.business.findMany({
      include: {
        owner: { select: { fullName: true, email: true } },
        _count: { select: { services: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, fullName: true, email: true, role: true, createdAt: true, isActive: true }
    });

    res.json({
      totalUsers, totalClients, totalOwners, totalBusinesses,
      totalBookings, totalServices, approvedBookings, pendingBookings,
      monthlySignups, businesses, recentUsers
    });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// Toggle user active/inactive
router.put('/users/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'SUPER_ADMIN') return res.status(403).json({ error: 'Cannot modify another admin' });
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive }
    });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// Permanently delete a user account
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'SUPER_ADMIN') return res.status(403).json({ error: 'Cannot delete an admin account' });

    // Delete in correct order to avoid FK constraint errors
    // First find bookings and delete them
    await prisma.booking.deleteMany({ where: { userId: req.params.id } });

    // If user is a business owner, delete their business and services
    const business = await prisma.business.findUnique({ where: { ownerId: req.params.id } });
    if (business) {
      await prisma.booking.deleteMany({ where: { service: { businessId: business.id } } });
      await prisma.service.deleteMany({ where: { businessId: business.id } });
      await prisma.availability.deleteMany({ where: { businessId: business.id } });
      await prisma.blockedDate.deleteMany({ where: { businessId: business.id } });
      await prisma.business.delete({ where: { id: business.id } });
    }

    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User account permanently deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle business active/suspended
router.put('/businesses/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const biz = await prisma.business.findUnique({ where: { id: req.params.id } });
    if (!biz) return res.status(404).json({ error: 'Business not found' });
    const updated = await prisma.business.update({
      where: { id: req.params.id },
      data: { isActive: !biz.isActive }
    });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// Permanently delete a business
router.delete('/businesses/:id', protect, adminOnly, async (req, res) => {
  try {
    const biz = await prisma.business.findUnique({ where: { id: req.params.id } });
    if (!biz) return res.status(404).json({ error: 'Business not found' });

    // Delete in correct order
    await prisma.booking.deleteMany({ where: { service: { businessId: req.params.id } } });
    await prisma.service.deleteMany({ where: { businessId: req.params.id } });
    await prisma.availability.deleteMany({ where: { businessId: req.params.id } });
    await prisma.blockedDate.deleteMany({ where: { businessId: req.params.id } });
    await prisma.business.delete({ where: { id: req.params.id } });

    res.json({ message: 'Business permanently deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change a user's role
router.put('/users/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['CLIENT', 'BUSINESS_OWNER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role }
    });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;