export const Country = Object.freeze({
  SENEGAL: 'SENEGAL',
  CAMEROUN: 'CAMEROUN',
});

export type CountryType = (typeof Country)[keyof typeof Country];
