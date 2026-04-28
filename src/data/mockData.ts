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
  isSobrestock?: boolean;
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
    id: 'PED-SOB-0001',
    client: 'Sobrestock Ruta LIM-01',
    clientId: 'CLI-SOBRE',
    canal: 'Tradicional',
    fechaEntrega: 'Hoy',
    total: 177.00,
    status: 'PENDIENTE',
    creadoPor: 'Juan López',
    rutaId: 'LIM-01',
    isSobrestock: true,
    products: [
      { product: { id: 'P-007', sku: 'PAN-INT-500', name: 'Pan Integral 500g', priceWithIGV: 4.20, priceWithoutIGV: 3.56, unit: 'und' }, quantity: 12 },
      { product: { id: 'P-008', sku: 'CRO-MAN-01', name: 'Croissant Mantequilla', priceWithIGV: 3.50, priceWithoutIGV: 2.97, unit: 'und' }, quantity: 8 },
      { product: { id: 'P-010', sku: 'QUE-VAI-01', name: 'Queque Vainilla', priceWithIGV: 5.10, priceWithoutIGV: 4.32, unit: 'und' }, quantity: 10 },
      { product: { id: 'P-009', sku: 'EMP-POL-01', name: 'Empanada Pollo', priceWithIGV: 2.80, priceWithoutIGV: 2.37, unit: 'und' }, quantity: 17 },
    ],
  },
  {
    id: 'PED-2026-0052',
    client: 'Distribuidora Norte',
    clientId: 'CLI-100',
    canal: 'Tradicional',
    fechaEntrega: 'Hoy',
    total: 920,
    status: 'LISTO_DESPACHO',
    creadoPor: 'Juan López',
    rutaId: 'LIM-01',
    products: [
      { product: { id: 'P-001', sku: 'TOR-001', name: 'Aceite Vegetal Torres 1L', priceWithIGV: 12.50, priceWithoutIGV: 10.59, unit: 'und' }, quantity: 10 },
    ],
  },
  {
    id: 'PED-2026-0053',
    client: 'Tienda El Ángel',
    clientId: 'CLI-101',
    canal: 'Tradicional',
    fechaEntrega: 'Hoy',
    total: 310,
    status: 'LISTO_DESPACHO',
    creadoPor: 'Juan López',
    rutaId: 'LIM-01',
    products: [
      { product: { id: 'P-006', sku: 'TOR-006', name: 'Margarina Torres 450g', priceWithIGV: 6.80, priceWithoutIGV: 5.76, unit: 'und' }, quantity: 10 },
    ],
  },
  {
    id: 'PED-2026-0051',
    client: 'Bodega Flores',
    clientId: 'CLI-008',
    canal: 'Tradicional',
    fechaEntrega: 'Hoy',
    total: 640,
    status: 'CONFIRMADO',
    creadoPor: 'Juan López',
    rutaId: 'LIM-01',
    products: [
      { product: { id: 'P-007', sku: 'PAN-INT-500', name: 'Pan Integral 500g', priceWithIGV: 4.20, priceWithoutIGV: 3.56, unit: 'und' }, quantity: 10 },
      { product: { id: 'P-008', sku: 'CRO-MAN-01', name: 'Croissant Mantequilla', priceWithIGV: 3.50, priceWithoutIGV: 2.97, unit: 'und' }, quantity: 6 },
      { product: { id: 'P-009', sku: 'EMP-POL-01', name: 'Empanada Pollo', priceWithIGV: 2.80, priceWithoutIGV: 2.37, unit: 'und' }, quantity: 12 },
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
    id: 'PED-2026-0047',
    client: 'Bodega Ramírez',
    clientId: 'CLI-200',
    canal: 'Tradicional',
    fechaEntrega: 'Ayer',
    total: 560,
    status: 'ENTREGADO',
    creadoPor: 'Juan López',
    rutaId: 'LIM-01',
    products: [],
    payments: [{ method: 'EFECTIVO', amount: 560 }],
  },
  {
    id: 'PED-2026-0046',
    client: 'Minimarket Los Pinos',
    clientId: 'CLI-201',
    canal: 'Tradicional',
    fechaEntrega: 'Ayer',
    total: 430,
    status: 'ENTREGADO',
    creadoPor: 'Juan López',
    rutaId: 'LIM-01',
    products: [],
    payments: [
      { method: 'YAPE', amount: 200 },
      { method: 'EFECTIVO', amount: 230 },
    ],
  },
  {
    id: 'PED-2026-0044',
    client: 'Bodega El Carmen',
    clientId: 'CLI-202',
    canal: 'Tradicional',
    fechaEntrega: 'Hace 2 días',
    total: 890,
    status: 'ENTREGADO',
    creadoPor: 'Juan López',
    rutaId: 'LIM-01',
    products: [],
    payments: [{ method: 'TRANSFERENCIA', amount: 890 }],
  },
  {
    id: 'PED-2026-0041',
    client: 'Distribuidora Sur',
    clientId: 'CLI-203',
    canal: 'Tradicional',
    fechaEntrega: 'Hace 3 días',
    total: 1240,
    status: 'ENTREGADO',
    creadoPor: 'Juan López',
    rutaId: 'LIM-01',
    products: [],
    payments: [
      { method: 'EFECTIVO', amount: 1000 },
      { method: 'YAPE', amount: 240 },
    ],
  },
  {
    id: 'PED-2026-0045',
    client: 'Bodega Santa Rosa',
    clientId: 'CLI-300',
    canal: 'Tradicional',
    fechaEntrega: 'Ayer',
    total: 280,
    status: 'CANCELADO',
    creadoPor: 'Juan López',
    rutaId: 'LIM-01',
    products: [],
  },
  {
    id: 'PED-2026-0043',
    client: 'Tienda La Esquina',
    clientId: 'CLI-301',
    canal: 'Tradicional',
    fechaEntrega: 'Hace 2 días',
    total: 195,
    status: 'CANCELADO',
    creadoPor: 'Juan López',
    rutaId: 'LIM-01',
    products: [],
  },
  {
    id: 'PED-2026-0039',
    client: 'Minimarket Díaz',
    clientId: 'CLI-302',
    canal: 'Tradicional',
    fechaEntrega: 'Hace 4 días',
    total: 740,
    status: 'CANCELADO',
    creadoPor: 'Juan López',
    rutaId: 'LIM-01',
    products: [],
  },
];
