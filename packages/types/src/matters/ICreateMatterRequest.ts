export interface KeyDate {
  date: string;
  description: string;
}

export interface ICreateMatterRequest {
  companyId: string;
  name: string;
  type: string;
  subtype?: string;
  status: string;
  priority?: string;
  description?: string;
  keyDates?: KeyDate[];
}