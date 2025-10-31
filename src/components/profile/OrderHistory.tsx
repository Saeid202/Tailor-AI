import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getCustomOrders } from '@/integrations/supabase/profiles';
import { Loader2, Package, Calendar, DollarSign, Eye, ShoppingBag } from 'lucide-react';
import type { CustomOrder, OrderStatus } from '@/types/profile';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500',
  measuring: 'bg-blue-500',
  cutting: 'bg-purple-500',
  sewing: 'bg-indigo-500',
  quality_check: 'bg-orange-500',
  completed: 'bg-green-500',
  shipped: 'bg-cyan-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-red-500',
};

export const OrderHistory = () => {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const ordersData = await getCustomOrders(user.id);
      setOrders(ordersData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start shopping to see your custom tailored orders here
          </p>
          <Button onClick={() => window.location.href = '/app'}>
            Browse Products
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            View and track your custom tailored orders
          </CardDescription>
        </CardHeader>
      </Card>

      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                  <Badge
                    className={statusColors[order.status]}
                    variant="secondary"
                  >
                    {order.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {order.order_type === 'personal_tailor' && (
                    <Badge variant="outline">Personal Tailor</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${order.total_price.toFixed(2)}
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>

            {order.special_instructions && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Special Instructions:</p>
                <p className="text-sm text-muted-foreground">
                  {order.special_instructions}
                </p>
              </div>
            )}

            {order.estimated_delivery && (
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Estimated Delivery:{' '}
                  <span className="font-medium">
                    {new Date(order.estimated_delivery).toLocaleDateString()}
                  </span>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

