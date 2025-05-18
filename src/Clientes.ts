export interface Cliente {
  id: number; // convertido desde string.numeric
  idType: string;
  name: string;
  address: string;
  phone: string;
  salespersonId?: number; // también convertido desde string.numeric
  lat?: number; // obtenido por geocodificación
  lng?: number;
}
