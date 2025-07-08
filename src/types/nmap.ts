export interface OpenPort {
  port: number;
  protocol: string;
  service: string;
  state: string;
}

export interface IpInfo {
  hostname?: string;
  country?: string;
  city?: string;
  org?: string;
  asn?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
}

export interface NmapScanResult {
  ip: string;
  ipinfo?: IpInfo;
  openPorts?: OpenPort[];
  raw?: string;
  // Add more fields as needed
}
