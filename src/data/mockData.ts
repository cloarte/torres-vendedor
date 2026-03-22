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

export const mockClients: Client[] = [
  { id: 'CLI-001', name: 'Bodega San Martín', address: 'Jr. Tacna 234, Lince', canal: 'Tradicional', rutaId: 'LIM-01', lastOrderDaysAgo: 3 },
  { id: 'CLI-002', name: 'Minimarket El Sol', address: 'Av. Arequipa 1021, Miraflores', canal: 'Tradicional', rutaId: 'LIM-01', lastOrderDaysAgo: 7 },
  { id: 'CLI-003', name: 'Bodega La Cruz', address: 'Ca. Los Olivos 456, SMP', canal: 'Tradicional', rutaId: 'LIM-01', lastOrderDaysAgo: 1 },
  { id: 'CLI-004', name: 'Bodega Norte', address: 'Av. Túpac Amaru 890, Comas', canal: 'Tradicional', rutaId: 'LIM-01', lastOrderDaysAgo: 14 },
  { id: 'CLI-005', name: 'Metro Surquillo', address: 'Av. Angamos 500, Surquillo', canal: 'Moderno', lastOrderDaysAgo: 5 },
  { id: 'CLI-006', name: 'Plaza Vea San Borja', address: 'Av. Javier Prado 1234, San Borja', canal: 'Moderno', lastOrderDaysAgo: 10 },
  { id: 'CLI-007', name: 'Tottus Ate', address: 'Av. La Molina 678, Ate', canal: 'Moderno', lastOrderDaysAgo: 2 },
];

export const mockProducts: Product[] = [
  { id: 'P-001', sku: 'TOR-001', name: 'Aceite Vegetal Torres 1L', priceWithIGV: 12.50, priceWithoutIGV: 10.59, unit: 'und' },
  { id: 'P-002', sku: 'TOR-002', name: 'Aceite de Oliva Torres 500ml', priceWithIGV: 28.90, priceWithoutIGV: 24.49, unit: 'und' },
  { id: 'P-003', sku: 'TOR-003', name: 'Manteca Vegetal Torres 1kg', priceWithIGV: 8.70, priceWithoutIGV: 7.37, unit: 'und' },
  { id: 'P-004', sku: 'TOR-004', name: 'Aceite de Girasol Torres 900ml', priceWithIGV: 15.20, priceWithoutIGV: 12.88, unit: 'und' },
  { id: 'P-005', sku: 'TOR-005', name: 'Aceite Vegetal Torres 5L', priceWithIGV: 52.00, priceWithoutIGV: 44.07, unit: 'und' },
  { id: 'P-006', sku: 'TOR-006', name: 'Margarina Torres 450g', priceWithIGV: 6.80, priceWithoutIGV: 5.76, unit: 'und' },
];

export const SOBRESTOCK_CLIENT: Client = {
  id: 'CLI-SOBRE',
  name: 'Sobrestock Ruta LIM-01',
  address: 'Stock extra para venta directa en ruta',
  canal: 'Tradicional',
  rutaId: 'LIM-01',
  lastOrderDaysAgo: 0,
};
