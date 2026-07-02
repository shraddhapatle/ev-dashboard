export interface Station {
  uid: string;
  Name: string;
  vendor_name: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  open: string;
  close: string;
  logo_url: string;
  staff: string;
  payment_modes: string;
  contact_numbers: string;
  station_type: string;
  postal_code: string;
  zone: string;
  available?: string | number;
  capacity?: string;
  cost_per_unit?: string;
  power_type?: string;
  total?: string | number;
  type?: string;
  vehicle_type?: string;
  [key: string]: any;
}
