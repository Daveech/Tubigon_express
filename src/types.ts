export type Role = 'customer' | 'rider';

export type Order = {
  id: string;
  customer_id: string;
  rider_id: string | null;
  restaurant_name: string;
  items: string;
  total: number;
  delivery_address: string;
  status: 'pending'|'accepted'|'picked_up'|'on_the_way'|'delivered'|'cancelled';
  created_at: string;
  updated_at: string;
};
