'use client';

import { useEffect, useState } from 'react';
import StationMap from '@/components/StationMap';
import { parseCSV } from '@/lib/parseStations';
import type { Station } from '@/types/station';

const CSV_DATA = `uid,Name,vendor_name,address,latitude,longitude,city,country,open,close,logo_url,staff,payment_modes,contact_numbers,station_type,postal_code,zone,0,available,capacity,cost_per_unit,power_type,total,type,vehicle_type
EESL359,EESL,EESL,"NDMC Parking, Khan Market, New Delhi, 110003",28.600324,77.226883,New Delhi,India,00:00:00,23:59:59,https://ev.delhitransport.in/static/logo/eesl.png,Unstaffed,"E-wallet, cash","[""7906001402""]",charging,110003,central-delhi,,1,15 kW,₹10 per unit,DC,2,DC-001,['4W']
EESL361,EESL,EESL,"NDMC Parking, Prithviraj Market, Prithviraj Ln, New Delhi, Delhi- 110003 ",28.600735,77.226277,New Delhi,India,00:00:00,23:59:59,https://ev.delhitransport.in/static/logo/eesl.png,Unstaffed,"E-wallet, cash","[""7906001402""]",charging,110003,central-delhi,,1,15 kW,₹10 per unit,DC,1,DC-001,['4W']
EESL363,EESL,EESL,"NDMC Parking, Outside RWA Park, Jor Bagh Market,  Jor Bagh Colony Road, New Delhi- 110003 ",28.588117,77.217564,New Delhi,India,00:00:00,23:59:59,https://ev.delhitransport.in/static/logo/eesl.png,Unstaffed,"E-wallet, cash","[""7906001402""]",charging,110003,central-delhi,,1,15 kW,₹10 per unit,DC,1,DC-001,['4W']
EESL365,EESL,EESL,"NDMC Parking, Opposite Goel Opticals, Khanna Market, Aliganj, Lodhi Colony, New Delhi- 110003 ",28.580532,77.221048,New Delhi,India,00:00:00,23:59:59,https://ev.delhitransport.in/static/logo/eesl.png,Unstaffed,"E-wallet, cash","[""7906001402""]",charging,110003,central-delhi,,1,15 kW,₹10 per unit,DC,1,DC-001,['4W']
EESL367,EESL,EESL,"NDMC Parking, Opposite Dory Pharmacy, Khanna Market, Aliganj, Lodhi Colony, New Delhi- 110003 ",28.584365,77.22054,New Delhi,India,00:00:00,23:59:59,https://ev.delhitransport.in/static/logo/eesl.png,Unstaffed,"E-wallet, cash","[""7906001402""]",charging,110003,central-delhi,,1,15 kW,₹10 per unit,DC,1,DC-001,['4W']
EESL369,EESL,EESL,"NDMC Parking, Sarojini Nagar Market, Sarojini Nagar, New Delhi- 110023 ",28.577259,77.19692,New Delhi,India,00:00:00,23:59:59,https://ev.delhitransport.in/static/logo/eesl.png,Unstaffed,"E-wallet, cash","[""7906001402""]",charging,110023,south-west-delhi,,0,15 kW,₹10 per unit,DC,1,DC-001,['4W']
EESL371,EESL,EESL,"NDMC Parking, Near Bikanervala, Yashwant Place, Chanakyapuri, New Delhi- 110021 ",28.585298,77.191008,New Delhi,India,00:00:00,23:59:59,https://ev.delhitransport.in/static/logo/eesl.png,Unstaffed,"E-wallet, cash","[""7906001402""]",charging,110021,south-west-delhi,,1,15 kW,₹10 per unit,DC,1,DC-001,['4W']
EESL373,EESL,EESL,"NDMC Parking, Dharma Marg, Block Y, Diplomatic Enclave, Malcha Market, New Delhi- 110021 ",28.601809,77.186432,New Delhi,India,00:00:00,23:59:59,https://ev.delhitransport.in/static/logo/eesl.png,Unstaffed,"E-wallet, cash","[""7906001402""]",charging,110021,south-west-delhi,,2,15 kW,₹10 per unit,DC,2,DC-001,['4W']
EESL375,EESL,EESL,"NDMC Parking, Outside Devinder Collections, Shankar Market, Connaught Place,  New Delhi- 110001 ",28.633733,77.22353,New Delhi,India,00:00:00,23:59:59,https://ev.delhitransport.in/static/logo/eesl.png,Unstaffed,"E-wallet, cash","[""7906001402""]",charging,110001,central-delhi,,1,15 kW,₹10 per unit,DC,1,DC-001,['4W']
EESL377,EESL,EESL,"NDMC Parking, Opposite HDFC Bank, M- Block,  Connaught Place, New Delhi- 110001 ",28.632973,77.222937,New Delhi,India,00:00:00,23:59:59,https://ev.delhitransport.in/static/logo/eesl.png,Unstaffed,"E-wallet, cash","[""7906001402""]",charging,110001,central-delhi,,0,15 kW,₹10 per unit,DC,1,DC-001,['4W']`;

export default function MapDemo() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const parsed = parseCSV(CSV_DATA);
      setStations(parsed);
    } catch (error) {
      console.error('Error parsing CSV:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <StationMap stations={stations} />
    </div>
  );
}
