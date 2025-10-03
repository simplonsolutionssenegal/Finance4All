import type { DropdownOption } from './dropdown-types';

/**
 * Crée des options de dropdown à partir d'un tableau de strings
 * @param strings - Tableau de strings à convertir en options
 * @returns Tableau d'options de dropdown
 */
export const createStringOptions = (strings: string[]): DropdownOption<string>[] => {
  return strings.map(str => ({
    id: str.toLowerCase().replace(/\s+/g, '-'),
    name: str,
    value: str,
  }));
};

/**
 * Crée des options de dropdown à partir d'entités
 * @param entities - Tableau d'entités avec id et name
 * @param iconField - Champ optionnel pour l'icône
 * @param descriptionField - Champ optionnel pour la description
 * @returns Tableau d'options de dropdown
 */
export const createEntityOptions = <T extends { id: string; name: string }>(
  entities: T[],
  iconField?: keyof T,
  descriptionField?: keyof T
): DropdownOption<T>[] => {
  return entities.map(entity => ({
    id: entity.id,
    name: entity.name,
    value: entity,
    icon: iconField ? (entity[iconField] as string) : undefined,
    description: descriptionField ? (entity[descriptionField] as string) : undefined,
  }));
};

/**
 * Filtre les options de dropdown en fonction d'un terme de recherche
 * @param options - Options à filtrer
 * @param searchTerm - Terme de recherche
 * @returns Options filtrées
 */
export const filterDropdownOptions = <T>(
  options: DropdownOption<T>[],
  searchTerm: string
): DropdownOption<T>[] => {
  if (!searchTerm) return options;

  const term = searchTerm.toLowerCase();
  return options.filter(
    option =>
      option.name.toLowerCase().includes(term) ||
      (option.description && option.description.toLowerCase().includes(term))
  );
};

/**
 * Trouve une option par sa valeur
 * @param options - Options disponibles
 * @param value - Valeur de l'option à trouver
 * @returns Option trouvée ou undefined
 */
export const findDropdownOptionByValue = <T>(
  options: DropdownOption<T>[],
  value: T
): DropdownOption<T> | undefined => {
  return options.find(option => option.value === value);
};
