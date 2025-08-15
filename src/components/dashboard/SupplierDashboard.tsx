import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, TrendingUp, ShoppingCart } from 'lucide-react';

interface Material {
  id: string;
  name: string;
  category: string;
  price_per_unit: number;
  unit: string;
  description: string;
  available_quantity: number;
  created_at: string;
}

interface MaterialOrder {
  id: string;
  quantity: number;
  total_price: number;
  delivery_address: string;
  delivery_date: string;
  status: string;
  created_at: string;
  projects: {
    title: string;
    owner_id: string;
  } | null;
  materials: {
    name: string;
    unit: string;
    price_per_unit: number;
  } | null;
}

const SupplierDashboard = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [orders, setOrders] = useState<MaterialOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch supplier's materials
      const { data: materialsData, error: materialsError } = await supabase
        .from('materials')
        .select('*')
        .eq('supplier_id', user?.id)
        .order('created_at', { ascending: false });

      if (materialsError) throw materialsError;
      setMaterials(materialsData || []);

      // Fetch orders for supplier's materials
      if (materialsData && materialsData.length > 0) {
        const materialIds = materialsData.map(m => m.id);
        const { data: ordersData, error: ordersError } = await supabase
          .from('material_orders')
          .select(`
            *,
            projects!material_orders_project_id_fkey(title, owner_id),
            materials!material_orders_material_id_fkey(name, unit, price_per_unit)
          `)
          .in('material_id', materialIds)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        setOrders(ordersData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('material_orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'shipped': return 'outline';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const totalRevenue = orders
    .filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + order.total_price, 0);

  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Supplier Dashboard</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Material
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Materials</p>
                <p className="text-2xl font-bold text-foreground">{materials.length}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold text-foreground">{pendingOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">{orders.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Materials Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Your Materials</CardTitle>
          <CardDescription>
            Manage your construction materials inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">You haven't added any materials yet.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Material
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((material) => (
                <Card key={material.id} className="border border-border">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{material.name}</h3>
                        <Badge variant="outline" className="mt-1">
                          {material.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          ${material.price_per_unit}
                        </div>
                        <div className="text-sm text-muted-foreground">per {material.unit}</div>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {material.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Stock: <strong>{material.available_quantity} {material.unit}</strong>
                      </span>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Manage incoming material orders from project owners
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No orders yet. Once customers start ordering your materials, they'll appear here.
            </p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="border border-border">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {order.materials?.name || 'Material'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Project: {order.projects?.title || 'Unknown Project'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            ${order.total_price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Quantity:</span>
                        <p className="font-medium">
                          {order.quantity} {order.materials?.unit}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Unit Price:</span>
                        <p className="font-medium">
                          ${order.materials?.price_per_unit || 0}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Delivery Date:</span>
                        <p className="font-medium">
                          {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'TBD'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Delivery Address:</span>
                        <p className="font-medium text-sm">{order.delivery_address}</p>
                      </div>
                    </div>
                    
                    {order.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        >
                          Confirm Order
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                    
                    {order.status === 'confirmed' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                      >
                        Mark as Shipped
                      </Button>
                    )}
                    
                    {order.status === 'shipped' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                      >
                        Mark as Delivered
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierDashboard;