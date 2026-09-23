import { createClient } from "./server";
import { Courier, Pincode, ShippingRate, Customer } from "@/types/logistics";

export async function getAllAdminCouriers(): Promise<Courier[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("couriers")
      .select("*")
      .order("courier_partner", { ascending: true });

    if (error) {
      console.warn("Supabase admin couriers query warning:", error.message);
      return [];
    }

    return (data as Courier[]) || [];
  } catch (err) {
    console.error("Error fetching admin couriers:", err);
    return [];
  }
}

export async function getAllAdminShippingRates(): Promise<ShippingRate[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("shipping_rates")
      .select(`
        *,
        pincode:pincodes (*),
        courier:couriers (*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase admin shipping rates query warning:", error.message);
      return [];
    }

    return (data as ShippingRate[]) || [];
  } catch (err) {
    console.error("Error fetching admin shipping rates:", err);
    return [];
  }
}

export async function getAllAdminPincodes(): Promise<Pincode[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pincodes")
      .select("*")
      .order("pincode", { ascending: true });

    if (error) {
      console.warn("Supabase admin pincodes query warning:", error.message);
      return [];
    }

    return (data as Pincode[]) || [];
  } catch (err) {
    console.error("Error fetching admin pincodes:", err);
    return [];
  }
}

export async function getAllAdminCustomers(): Promise<Customer[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customers")
      .select(`
        *,
        orders:orders (id)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase admin customers query warning:", error.message);
      return [];
    }

    if (!data) return [];

    return data.map((c: any) => ({
      id: c.id,
      full_name: c.full_name,
      phone: c.phone,
      email: c.email,
      created_at: c.created_at,
      updated_at: c.updated_at,
      order_count: Array.isArray(c.orders) ? c.orders.length : 0,
    }));
  } catch (err) {
    console.error("Error fetching admin customers:", err);
    return [];
  }
}
