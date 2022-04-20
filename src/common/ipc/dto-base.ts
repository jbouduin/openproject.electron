export interface DtoBase {
  id: number;
  createdAt?: Date;
  updatedAt?: Date;
  href?: string;
  lockVersion?: number;
}
