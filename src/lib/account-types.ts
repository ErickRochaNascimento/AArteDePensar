export type AccountValues = {
  name: string;
  email: string;
};

export type AccountFormState = {
  values?: AccountValues;
  fieldErrors?: Partial<Record<keyof AccountValues, string>>;
  error?: string;
  success?: string;
};
