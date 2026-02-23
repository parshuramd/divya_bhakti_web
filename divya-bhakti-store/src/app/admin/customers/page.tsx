import { Users, Mail, Phone, ShoppingBag, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import prisma from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { UserRole } from '@prisma/client';

async function getCustomers() {
    return prisma.user.findMany({
        where: { role: UserRole.CUSTOMER },
        include: {
            _count: {
                select: { orders: true, reviews: true },
            },
            orders: {
                select: { total: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}

export default async function AdminCustomersPage() {
    const customers = await getCustomers();

    return (
        <div className="lg:ml-64">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Customers</h1>
                <p className="text-muted-foreground">
                    {customers.length} registered customers
                </p>
            </div>

            <Card>
                <CardContent className="p-0">
                    {customers.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="font-medium">No customers yet</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead className="text-center">Orders</TableHead>
                                    <TableHead className="text-center">Total Spent</TableHead>
                                    <TableHead className="text-center">Reviews</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.map((customer) => {
                                    const totalSpent = customer.orders.reduce(
                                        (sum, o) => sum + Number(o.total),
                                        0
                                    );

                                    return (
                                        <TableRow key={customer.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-saffron-100 flex items-center justify-center text-saffron-700 font-medium flex-shrink-0">
                                                        {customer.name?.[0]?.toUpperCase() || (
                                                            <Users className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            {customer.name || 'Unnamed'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-0.5">
                                                    <p className="text-sm flex items-center gap-1.5">
                                                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                                        {customer.email}
                                                    </p>
                                                    {customer.phone && (
                                                        <p className="text-sm flex items-center gap-1.5 text-muted-foreground">
                                                            <Phone className="h-3.5 w-3.5" />
                                                            {customer.phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className="gap-1">
                                                    <ShoppingBag className="h-3 w-3" />
                                                    {customer._count.orders}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center font-medium">
                                                {formatPrice(totalSpent)}
                                            </TableCell>
                                            <TableCell className="text-center text-sm text-muted-foreground">
                                                {customer._count.reviews}
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(customer.createdAt).toLocaleDateString(
                                                        'en-IN',
                                                        {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        }
                                                    )}
                                                </p>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
