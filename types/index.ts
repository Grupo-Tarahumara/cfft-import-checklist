// Tipos basados en las entidades del backend

export interface Usuario {
  id: number;
  nombre: string;
  username: string;
  email: string;
  telefono?: string;
  area: string; // 'Comercio Exterior' | 'Logística Nacional' | 'Calidad'
  rol: 'admin' | 'user';
  activo: boolean;
  fechaCreacion: string;
}

export interface Proveedor {
  id: number;
  nombre: string;
  codigo: string;
  pais: string;
  activo: boolean;
}

export interface Fruta {
  id: number;
  nombre: string;
  tempMinima: number;
  tempMaxima: number;
  activo: boolean;
}

export interface PuntoInspeccion {
  id: number;
  nombre: string;
  ubicacion: string;
  activo: boolean;
}

export interface FotoInspeccion {
  id: number;
  tipoFoto: string; // 'termografo_origen' | 'termografo_nacional' | 'temperatura_fruta' | 'mercancia' | 'evidencia_adicional'
  urlFoto: string;
  descripcion?: string;
  esObligatoria: boolean;
  orden: number;
  fechaCarga: string;
  inspeccionId: number;
}

export interface Alerta {
  id: number;
  tipoAlerta: string; // 'temperatura_fuera_rango' | 'falta_termografo_origen' | 'falta_termografo_nacional'
  descripcion: string;
  criticidad: 'alta' | 'media' | 'baja';
  leida: boolean;
  fechaCreacion: string;
  inspeccionId: number;
  notificaciones?: Notificacion[];
}

export interface Notificacion {
  id: number;
  enviada: boolean;
  fechaEnvio?: string;
  metodo: 'email' | 'sistema' | 'push';
  alertaId: number;
  usuarioId: number;
  alerta?: Alerta;
  usuario?: Usuario;
}

export interface Inspeccion {
  id: number;
  fecha: string;
  numeroOrdenContenedor: string;
  numeroPallets: number;
  numeroCajas: number;
  termografoOrigen: boolean;
  termografoNacional: boolean;
  temperaturaFruta: number;
  numeroTrancas: number;
  observaciones?: string;
  tieneAlertas: boolean;
  pdfGenerado?: string;
  estado: string; // 'Completado' | 'Pendiente' | etc
  fechaCreacion: string;
  fechaActualizacion: string;
  proveedorId: number;
  frutaId: number;
  puntoInspeccionId: number;
  usuarioId: number;
  proveedor?: Proveedor;
  fruta?: Fruta;
  puntoInspeccion?: PuntoInspeccion;
  usuario?: Usuario;
  fotos?: FotoInspeccion[];
  alertas?: Alerta[];
}

// DTOs para crear/actualizar
export interface CreateUsuarioDto {
  nombre: string;
  username: string;
  email: string;
  password: string;
  telefono?: string;
  area: string;
  rol?: 'admin' | 'user';
  activo?: boolean;
}

export interface UpdateUsuarioDto extends Partial<CreateUsuarioDto> {}

export interface CreateProveedorDto {
  nombre: string;
  codigo: string;
  pais: string;
  activo?: boolean;
}

export interface UpdateProveedorDto extends Partial<CreateProveedorDto> {}

export interface CreateFrutaDto {
  nombre: string;
  tempMinima: number;
  tempMaxima: number;
  activo?: boolean;
}

export interface UpdateFrutaDto extends Partial<CreateFrutaDto> {}

export interface CreatePuntoInspeccionDto {
  nombre: string;
  ubicacion: string;
  activo?: boolean;
}

export interface UpdatePuntoInspeccionDto extends Partial<CreatePuntoInspeccionDto> {}

export interface CreateInspeccionDto {
  fecha?: string;
  numeroOrdenContenedor: string;
  numeroPallets: number;
  numeroCajas: number;
  termografoOrigen?: boolean;
  termografoNacional?: boolean;
  temperaturaFruta: number;
  numeroTrancas: number;
  observaciones?: string;
  tieneAlertas?: boolean;
  pdfGenerado?: string;
  estado?: string;
  proveedorId: number;
  frutaId: number;
  puntoInspeccionId: number;
  usuarioId: number;
}

export interface UpdateInspeccionDto extends Partial<CreateInspeccionDto> {}

export interface CreateFotoInspeccionDto {
  tipoFoto: string;
  urlFoto: string;
  descripcion?: string;
  esObligatoria?: boolean;
  orden: number;
  inspeccionId: number;
}

export interface UpdateFotoInspeccionDto extends Partial<CreateFotoInspeccionDto> {}

export interface CreateAlertaDto {
  tipoAlerta: string;
  descripcion: string;
  criticidad?: 'alta' | 'media' | 'baja';
  leida?: boolean;
  inspeccionId: number;
}

export interface UpdateAlertaDto extends Partial<CreateAlertaDto> {}

export interface CreateNotificacionDto {
  enviada?: boolean;
  fechaEnvio?: string;
  metodo: 'email' | 'sistema' | 'push';
  alertaId: number;
  usuarioId: number;
}

export interface UpdateNotificacionDto extends Partial<CreateNotificacionDto> {}

// Auth
export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface UserProfile {
  id: number;
  userId?: number;
  nombre: string;
  username: string;
  email: string;
  rol: 'admin' | 'user';
}

// Tipos de foto permitidos
export type TipoFoto =
  | 'termografo_origen'
  | 'termografo_nacional'
  | 'temperatura_fruta'
  | 'mercancia'
  | 'evidencia_adicional';

// Tipos de alerta
export type TipoAlerta =
  | 'temperatura_fuera_rango'
  | 'falta_termografo_origen'
  | 'falta_termografo_nacional';

// Criticidad de alertas
export type Criticidad = 'alta' | 'media' | 'baja';

// Métodos de notificación
export type MetodoNotificacion = 'email' | 'sistema' | 'push';

// Áreas de usuarios
export type AreaUsuario = 'Comercio Exterior' | 'Logística Nacional' | 'Calidad';
