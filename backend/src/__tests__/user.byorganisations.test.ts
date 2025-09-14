// backend/src/__tests__/infrastructure/web/routes/user.routes.integration.test.ts
import express from "express";
import request from "supertest";

// 👇 Mock Prisma (juste user.findMany)
const findManyMock = jest.fn();

jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findMany: findManyMock,
      },
    })),
  };
});


import { userRoutes } from "@/infrastructure/web/routes/user.routes";

describe("GET /organisations/:organisationId/users (integration)", () => {
  const app = express();
  app.use(express.json());
  app.use(userRoutes);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const prismaRow = (overrides: any = {}) => ({
    id: 1,
    email: "john@example.com",
    username: "john",
    firstName: "John",
    lastName: "Doe",
    avatar: null,
    isActive: true,
    status: "ACTIF",
    lastLoginAt: new Date("2025-09-01T10:00:00Z"),
    organisationId: 10,
    role: { id: 2, name: "manager", createdAt: new Date(), updatedAt: new Date() },
    organisation: {
      id: 10,
      name: "Acme Inc.",
      avatar: null,
      address: "1 rue X",
      phone: "000",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date("2025-01-01T00:00:00Z"),
    updatedAt: new Date("2025-09-01T10:00:00Z"),
    ...overrides,
  });

  it("renvoie la liste des utilisateurs (200)", async () => {
    // Arrange
    findManyMock.mockResolvedValue([
      prismaRow({ id: 1 }),
      prismaRow({ id: 2, email: "jane@example.com", username: "jane", firstName: "Jane" }),
    ]);

    // Act
    const res = await request(app).get("/organisations/10/users");

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.results).toBe(2);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toMatchObject({
      id: 1,
      email: "john@example.com",
      username: "john",
      role: "manager",
      organisationId: 10,
    });
  });

  it("retourne 400 si organisationId est invalide", async () => {
    const res = await request(app).get("/organisations/abc/users");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      status: "fail",
      message: "ID organisation invalide",
    });

    expect(findManyMock).not.toHaveBeenCalled();
  });

  it("retourne 400 si Prisma lève une erreur", async () => {
    findManyMock.mockRejectedValue(new Error("DB down"));

    const res = await request(app).get("/organisations/10/users");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "Une erreur est survenue lors du filtrage des utilisateurs",
      message: "Erreur inconnue", // ton controller masque le vrai message
    });
  });
});
