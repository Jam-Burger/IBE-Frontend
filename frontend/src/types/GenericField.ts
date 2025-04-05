export interface GenericField {
  label: string;
  type: string;
  name: string;
  required: boolean;
  enabled: boolean;
  pattern?: string | null | undefined;
  options?: string[] | null | undefined;
}