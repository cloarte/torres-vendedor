export interface Client {
  id: string;
  name: string;
  address: string;
  canal: string;
  rutaId?: string;
  lastOrderDaysAgo: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  priceWithIGV: number;
  priceWithoutIGV: number;
  unit: string;
}

export type OrderOrigen = 'INTERNO' | 'PORTAL' | 'ESPECIAL';

export type OrderStatus = 'PENDIENTE' | 'CONFIRMADO' | 'LISTO_DESPACHO' | 'ENTREGADO' | 'CANCELADO' | 'RECHAZADO';

export interface OrderProduct {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'EFECTIVO' | 'YAPE' | 'DEPOSITO' | 'TRANSFERENCIA' | 'CHEQUE';

export interface PaymentEntry {
  method: PaymentMethod;
  amount: number;
  reference?: string;
  photoUrl?: string;
}

export interface SobrestockItem {
  product: Product;
  available: number;
}

export const mockSobrestock: SobrestockItem[] = [
  { product: { id: 'P-010', sku: 'QUE-VAI-01', name: 'Queque Vainilla', priceWithIGV: 5.10, priceWithoutIGV: 4.32, unit: 'und' }, available: 4 },
  { product: { id: 'P-006', sku: 'TOR-006', name: 'Margarina Torres 450g', priceWithIGV: 6.80, priceWithoutIGV: 5.76, unit: 'und' }, available: 4 },
];

export interface Order {
  id: string;
  client: string;
  clientId: string;
  canal: string;
  fechaEntrega: string;
  total: number;
  status: OrderStatus;
  creadoPor: string;
  rutaId?: string;
  origen?: OrderOrigen;
  products: OrderProduct[];
  notes?: string;
  isOffline?: boolean;
  payments?: PaymentEntry[];
  deliveredProducts?: OrderProduct[];
}

export const mockClients: Client[] = [
  { id: 'CLI-001', name: 'Bodega San Martín', address: 'Jr. Tacna 234, Lince', canal: 'Tradicional', rutaId: 'LIM-01', lastOrderDaysAgo: 3 },
  { id: 'CLI-002', name: 'Minimarket El Sol', address: 'Av. Arequipa 1021, Miraflores', canal: 'Tradicional', rutaId: 'LIM-01', lastOrderDaysAgo: 7 },
  { id: 'CLI-003', name: 'Bodega La Cruz', address: 'Ca. Los Olivos 456, SMP', canal: 'Tradicional', rutaId: 'LIM-01', lastOrderDaysAgo: 1 },
  { id: 'CLI-004', name: 'Bodega Norte', address: 'Av. Túpac Amaru 890, Comas', canal: 'Tradicional', rutaId: 'LIM-01', lastOrderDaysAgo: 14 },
  { id: 'CLI-005', name: 'Metro Surquillo', address: 'Av. Angamos 500, Surquillo', canal: 'Moderno', lastOrderDaysAgo: 5 },
  { id: 'CLI-006', name: 'Plaza Vea San Borja', address: 'Av. Javier Prado 1234, San Borja', canal: 'Moderno', lastOrderDaysAgo: 10 },
  { id: 'CLI-007', name: 'Tottus Ate', address: 'Av. La Molina 678, Ate', canal: 'Moderno', lastOrderDaysAgo: 2 },
  { id: 'CLI-008', name: 'Bodega Flores', address: 'Av. Los Jazmines 321, SMP', canal: 'Tradicional', rutaId: 'LIM-01', lastOrderDaysAgo: 4 },
];

export const mockProducts: Product[] = [
  { id: 'P-001', sku: 'TOR-001', name: 'Aceite Vegetal Torres 1L', priceWithIGV: 12.50, priceWithoutIGV: 10.59, unit: 'und' },
  { id: 'P-002', sku: 'TOR-002', name: 'Aceite de Oliva Torres 500ml', priceWithIGV: 28.90, priceWithoutIGV: 24.49, unit: 'und' },
  { id: 'P-003', sku: 'TOR-003', name: 'Manteca Vegetal Torres 1kg', priceWithIGV: 8.70, priceWithoutIGV: 7.37, unit: 'und' },
  { id: 'P-004', sku: 'TOR-004', name: 'Aceite de Girasol Torres 900ml', priceWithIGV: 15.20, priceWithoutIGV: 12.88, unit: 'und' },
  { id: 'P-005', sku: 'TOR-005', name: 'Aceite Vegetal Torres 5L', priceWithIGV: 52.00, priceWithoutIGV: 44.07, unit: 'und' },
  { id: 'P-006', sku: 'TOR-006', name: 'Margarina Torres 450g', priceWithIGV: 6.80, priceWithoutIGV: 5.76, unit: 'und' },
  { id: 'P-007', sku: 'PAN-INT-500', name: 'Pan Integral 500g', priceWithIGV: 4.20, priceWithoutIGV: 3.56, unit: 'und' },
  { id: 'P-008', sku: 'CRO-MAN-01', name: 'Croissant Mantequilla', priceWithIGV: 3.50, priceWithoutIGV: 2.97, unit: 'und' },
  { id: 'P-009', sku: 'EMP-POL-01', name: 'Empanada Pollo', priceWithIGV: 2.80, priceWithoutIGV: 2.37, unit: 'und' },
  { id: 'P-010', sku: 'QUE-VAI-01', name: 'Queque Vainilla', priceWithIGV: 5.10, priceWithoutIGV: 4.32, unit: 'und' },
];

export const SOBRESTOCK_CLIENT: Client = {
  id: 'CLI-SOBRE',
  name: 'Sobrestock Ruta LIM-01',
  address: 'Stock extra para venta directa en ruta',
  canal: 'Tradicional',
  rutaId: 'LIM-01',
  lastOrderDaysAgo: 0,
};

export const mockOrders: Order[] = [
  {
    id: 'PED-2026-0051',
    client: 'Bodega Flores',
    clientId: 'CLI-008',
    canal: 'Tradicional',
    fechaEntrega: 'Hoy',
    total: 96.60,
    status: 'LISTO_DESPACHO',
    creadoPor: 'Rosnelli Flores',
    rutaId: 'LIM-01',
    notes: 'Entregar antes de las 10am',
    products: [
      { product: { id: 'P-007', sku: 'PAN-INT-500', name: 'Pan Integral 500g', priceWithIGV: 4.20, priceWithoutIGV: 3.56, unit: 'und' }, quantity: 10 },
      { product: { id: 'P-008', sku: 'CRO-MAN-01', name: 'Croissant Mantequilla', priceWithIGV: 3.50, priceWithoutIGV: 2.97, unit: 'und' }, quantity: 6 },
      { product: { id: 'P-009', sku: 'EMP-POL-01', name: 'Empanada Pollo', priceWithIGV: 2.80, priceWithoutIGV: 2.37, unit: 'und' }, quantity: 12 },
    ],
  },
  {
    id: 'PED-2026-0050',
    client: 'Bodega San Martín',
    clientId: 'CLI-001',
    canal: 'Tradicional',
    fechaEntrega: 'Hoy',
    total: 480,
    status: 'PENDIENTE',
    creadoPor: 'Juan López',
    rutaId: 'LIM-01',
    products: [
      { product: { id: 'P-001', sku: 'TOR-001', name: 'Aceite Vegetal Torres 1L', priceWithIGV: 12.50, priceWithoutIGV: 10.59, unit: 'und' }, quantity: 20 },
      { product: { id: 'P-003', sku: 'TOR-003', name: 'Manteca Vegetal Torres 1kg', priceWithIGV: 8.70, priceWithoutIGV: 7.37, unit: 'und' }, quantity: 20 },
    ],
  },
  {
    id: 'PED-2026-0049',
    client: 'Minimarket El Sol',
    clientId: 'CLI-002',
    canal: 'Tradicional',
    fechaEntrega: 'Hoy',
    total: 720,
    status: 'CONFIRMADO',
    creadoPor: 'Juan López',
    rutaId: 'LIM-01',
    products: [
      { product: { id: 'P-002', sku: 'TOR-002', name: 'Aceite de Oliva Torres 500ml', priceWithIGV: 28.90, priceWithoutIGV: 24.49, unit: 'und' }, quantity: 20 },
      { product: { id: 'P-004', sku: 'TOR-004', name: 'Aceite de Girasol Torres 900ml', priceWithIGV: 15.20, priceWithoutIGV: 12.88, unit: 'und' }, quantity: 5 },
    ],
  },
  {
    id: 'PED-2026-0048',
    client: 'Bodega La Cruz',
    clientId: 'CLI-003',
    canal: 'Tradicional',
    fechaEntrega: 'Mañana',
    total: 350,
    status: 'PENDIENTE',
    creadoPor: 'Juan López',
    rutaId: 'LIM-01',
    products: [
      { product: { id: 'P-005', sku: 'TOR-005', name: 'Aceite Vegetal Torres 5L', priceWithIGV: 52.00, priceWithoutIGV: 44.07, unit: 'und' }, quantity: 5 },
      { product: { id: 'P-006', sku: 'TOR-006', name: 'Margarina Torres 450g', priceWithIGV: 6.80, priceWithoutIGV: 5.76, unit: 'und' }, quantity: 15 },
    ],
  },
  {
    id: 'PED-2026-0045',
    client: 'Bodega Norte',
    clientId: 'CLI-004',
    canal: 'Tradicional',
    fechaEntrega: 'Ayer',
    total: 290,
    status: 'LISTO_DESPACHO',
    creadoPor: 'Juan López',
    rutaId: 'LIM-01',
    products: [
      { product: { id: 'P-001', sku: 'TOR-001', name: 'Aceite Vegetal Torres 1L', priceWithIGV: 12.50, priceWithoutIGV: 10.59, unit: 'und' }, quantity: 10 },
      { product: { id: 'P-003', sku: 'TOR-003', name: 'Manteca Vegetal Torres 1kg', priceWithIGV: 8.70, priceWithoutIGV: 7.37, unit: 'und' }, quantity: 15 },
    ],
  },
];
