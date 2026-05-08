const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/business', protect, async (req, res) => {
  try {
    const business = await prisma.business.findUnique({ where: { ownerId: req.userId } });
    if (!business) return res.status(404).json({ error: 'No business found' });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleString('default', { month: 'short' }) };
    });

    // Total bookings
    const totalBookings = await prisma.booking.count({
      where: { service: { businessId: business.id } }
    });

    // This month bookings
    const thisMonthBookings = await prisma.booking.count({
      where: { service: { businessId: business.id }, createdAt: { gte: startOfMonth } }
    });

    // By status
    const byStatus = await prisma.booking.groupBy({
      by: ['status'],
      where: { service: { businessId: business.id } },
      _count: { status: true }
    });

    // Revenue (approved bookings only)
    const approvedBookings = await prisma.booking.findMany({
      where: { service: { businessId: business.id }, status: 'APPROVED' },
      include: { service: { select: { price: true } } }
    });
    const totalRevenue = approvedBookings.reduce((sum, b) => sum + (b.service?.price || 0), 0);

    // Monthly bookings for chart
    const monthlyData = await Promise.all(last6Months.map(async ({ year, month, label }) => {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59);
      const count = await prisma.booking.count({
        where: { service: { businessId: business.id }, createdAt: { gte: start, lte: end } }
      });
      const revenue = await prisma.booking.findMany({
        where: { service: { businessId: business.id }, status: 'APPROVED', createdAt: { gte: start, lte: end } },
        include: { service: { select: { price: true } } }
      });
      return { label, bookings: count, revenue: revenue.reduce((s, b) => s + (b.service?.price || 0), 0) };
    }));

    // Top services
    const topServices = await prisma.booking.groupBy({
      by: ['serviceId'],
      where: { service: { businessId: business.id } },
      _count: { serviceId: true },
      orderBy: { _count: { serviceId: 'desc' } },
      take: 5
    });
    const topServicesWithNames = await Promise.all(topServices.map(async s => {
      const svc = await prisma.service.findUnique({ where: { id: s.serviceId } });
      return { name: svc?.name || 'Unknown', count: s._count.serviceId };
    }));

    res.json({
      totalBookings,
      thisMonthBookings,
      totalRevenue: Math.round(totalRevenue),
      byStatus,
      monthlyData,
      topServices: topServicesWithNames
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;