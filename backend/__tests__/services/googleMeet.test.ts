const mockGenerateAuthUrl = jest.fn();
const mockGetToken = jest.fn();
const mockSetCredentials = jest.fn();
const mockEventsInsert = jest.fn();

jest.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: jest.fn(() => ({
        generateAuthUrl: mockGenerateAuthUrl,
        getToken: mockGetToken,
        setCredentials: mockSetCredentials,
      })),
    },
    calendar: jest.fn(() => ({
      events: { insert: mockEventsInsert },
    })),
  },
}));

import {
  getGoogleAuthUrl,
  getRefreshTokenFromCode,
  createMeetEvent,
} from "../../src/services/googleMeet";

const SCOPE = "https://www.googleapis.com/auth/calendar.events";

const baseEventParams = {
  refreshToken: "rtoken-abc",
  titulo: "Consulta VitalGoal",
  inicio: new Date("2026-06-23T10:00:00.000Z"),
  fim: new Date("2026-06-23T10:30:00.000Z"),
  participantes: ["doc@test.com", "pat@test.com"],
};

beforeEach(() => {
  mockGenerateAuthUrl.mockReset();
  mockGetToken.mockReset();
  mockSetCredentials.mockReset();
  mockEventsInsert.mockReset();
});

describe("getGoogleAuthUrl", () => {
  it("dado um state válido, retorna URL de autenticação contendo o scope", () => {
    mockGenerateAuthUrl.mockReturnValue(
      `https://accounts.google.com/o/oauth2/auth?scope=${encodeURIComponent(SCOPE)}&state=test-state`
    );

    const url = getGoogleAuthUrl("test-state");

    expect(url).toContain(encodeURIComponent(SCOPE));
    expect(mockGenerateAuthUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: [SCOPE],
        state: "test-state",
        access_type: "offline",
      })
    );
  });
});

describe("getRefreshTokenFromCode", () => {
  it("dado um código de autorização válido, retorna o refresh token", async () => {
    mockGetToken.mockResolvedValue({ tokens: { refresh_token: "rtoken-xyz" } });

    const token = await getRefreshTokenFromCode("auth-code-123");

    expect(token).toBe("rtoken-xyz");
    expect(mockGetToken).toHaveBeenCalledWith("auth-code-123");
  });

  it("dado uma resposta sem refresh_token, lança erro", async () => {
    mockGetToken.mockResolvedValue({ tokens: { access_token: "atoken" } });

    await expect(getRefreshTokenFromCode("auth-code-123")).rejects.toThrow(
      "Google não retornou um refresh token."
    );
  });
});

describe("createMeetEvent", () => {
  it("dados parâmetros válidos, retorna meetLink e eventId", async () => {
    mockEventsInsert.mockResolvedValue({
      data: {
        id: "event-id-abc",
        hangoutLink: "https://meet.google.com/abc-xyz-123",
      },
    });

    const result = await createMeetEvent(baseEventParams);

    expect(result).toEqual({
      meetLink: "https://meet.google.com/abc-xyz-123",
      eventId: "event-id-abc",
    });
    expect(mockSetCredentials).toHaveBeenCalledWith({ refresh_token: "rtoken-abc" });
  });

  it("dado que o Google não retorna hangoutLink, lança erro", async () => {
    mockEventsInsert.mockResolvedValue({ data: { id: "event-id-abc" } });

    await expect(createMeetEvent(baseEventParams)).rejects.toThrow(
      "Não foi possível gerar o link do Google Meet."
    );
  });
});
