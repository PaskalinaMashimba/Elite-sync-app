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

    // Monthly signups last 6 months
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

    // All businesses with owner info
    const businesses = await prisma.business.findMany({
      include: {
        owner: { select: { fullName: true, email: true } },
        services: true,
        _count: { select: { services: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Recent users
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, fullName: true, email: true, role: true, createdAt: true, isActive: true }
    });

    res.json({
      totalUsers, totalClients, totalOwners, totalBusinesses,
      totalBookings, totalServices, approvedBookings, pendingBookings,
      monthlySignups, businesses, recentUsers
    });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// Toggle user active status
router.put('/users/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive }
    });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// Toggle business active status
router.put('/businesses/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const biz = await prisma.business.findUnique({ where: { id: req.params.id } });
    const updated = await prisma.business.update({
      where: { id: req.params.id },
      data: { isActive: !biz.isActive }
    });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;