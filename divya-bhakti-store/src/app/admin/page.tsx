import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  Users,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import prisma from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/utils';

async function getDashboardStats() {
  const [
    totalOrders,
    pendingOrders,
    totalProducts,
    lowStockProducts,
    totalCustomers,
    recentOrders,
    revenue,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: { status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] } },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({
      where: {
        isActive: true,
        stock: { lte: 5 },
      },
    }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { quantity: true } },
      },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { total: true },
    }),
  ]);

  return {
    totalOrders,
    pendingOrders,
    totalProducts,
    lowStockProducts,
    totalCustomers,
    recentOrders,
    totalRevenue: revenue._sum.total || 0,
  };
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  PENDING: 'warning',
  CONFIRMED: 'default',
  PROCESSING: 'default',
  PACKED: 'default',
  SHIPPED: 'secondary',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
};

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(Number(stats.totalRevenue)),
      icon: IndianRupee,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      subtitle: `${stats.pendingOrders} pending`,
    },
    {
      title: 'Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      subtitle: stats.lowStockProducts > 0 ? `${stats.lowStockProducts} low stock` : undefined,
      subtitleColor: 'text-orange-600',
    },
    {
      title: 'Customers',
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: 'text-saffron-600',
      bgColor: 'bg-saffron-50',
    },
  ];

  return (
    <div className="lg:ml-64">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to your admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  {stat.subtitle && (
                    <p className={`text-xs mt-1 ${stat.subtitleColor || 'text-muted-foreground'}`}>
                      {stat.subtitle}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No orders yet
                </p>
              ) : (
                stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.orderNumber}</span>
                        <Badge variant={statusColors[order.status] || 'default'}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.user?.name || order.user?.email} •{' '}
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(Number(order.total))}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Low Stock Alerts
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/products?stock=low">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <LowStockProducts />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link href="/admin/products/new">
                <Package className="h-6 w-6 mb-2" />
                Add Product
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link href="/admin/orders">
                <ShoppingCart className="h-6 w-6 mb-2" />
                Manage Orders
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link href="/admin/coupons/new">
                <TrendingUp className="h-6 w-6 mb-2" />
                Create Coupon
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link href="/admin/banners">
                <TrendingUp className="h-6 w-6 mb-2" />
                Update Banners
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function LowStockProducts() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: { lte: 5 },
    },
    take: 5,
    orderBy: { stock: 'asc' },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
    },
  });

  if (products.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">
        All products are well stocked! ✓
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center gap-3 p-3 rounded-lg border"
        >
          <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center overflow-hidden">
            {product.images[0] ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{product.name}</p>
            <p className="text-sm text-muted-foreground">{product.sku}</p>
          </div>
          <Badge variant={product.stock === 0 ? 'destructive' : 'warning'}>
            {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
          </Badge>
        </div>
      ))}
    </div>
  );
}

