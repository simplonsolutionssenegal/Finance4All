// __tests__/env.test.ts

import { NEXT_PUBLIC_API_UR } from "@/app/_constantes/api_constants";


describe("Variable d'environnement NEXT_PUBLIC_API_UR", () => {
  it("devrait contenir l'URL correcte", () => {
    expect(NEXT_PUBLIC_API_UR).toBe("http://localhost:5000/api/v1/");
  });
});
