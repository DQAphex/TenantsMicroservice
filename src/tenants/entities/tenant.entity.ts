export class Tenant {
  tenantId!: string;
  name!: string;
  rut!: number;
  dv!: string;
  type!: 'PERSONA_NATURAL' | 'EMPRESA';
  createdAt!: Date;
  updatedAt!: Date;
  status!: 'ACTIVE' | 'INACTIVE';
}