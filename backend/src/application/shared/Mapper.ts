export interface Mapper<Domain, DTO> {
  toDomain(dto: DTO): Domain;
  toDTO(domain: Domain): DTO;
}
