import { ChatGateway } from "./chat.gateway";

describe("ChatGateway", () => {
  let gw: ChatGateway;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    gw = new ChatGateway(null as any);
    // @ts-ignore - inject a fake io for testing
    gw["io"] = {
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
    };
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("emits new_message via io.emit in broadcastMessage", () => {
    const message = {
      sid: "m1",
      body: "hello",
      author: "a",
      dateCreated: new Date(),
      media: [],
    };
    gw.broadcastMessage("C1", message);
    expect(gw["io"].emit).toHaveBeenCalledWith(
      "new_message",
      expect.objectContaining({
        sid: message.sid,
        body: message.body,
        author: message.author,
      })
    );

    expect(consoleSpy).toHaveBeenCalledWith("Broadcasted message");
  });

  it("emits conversation_updated via io.emit in broadcastUpdate", () => {
    const update = { foo: "bar" };
    gw.broadcastUpdate("C2", update);

    expect(gw["io"].emit).toHaveBeenCalledWith(
      "conversation_updated",
      expect.objectContaining({
        conversationSid: "C2",
        update,
      })
    );
  });

  it("emits user_status_changed via io.emit in broadcastUserStatus", () => {
    // prepare a user inside the private users map
    // @ts-ignore
    gw["users"] = new Map();
    // @ts-ignore
    gw["users"].set("u1", {
      userId: "u1",
      identity: "alice",
      socketId: "s1",
      conversationSids: ["C3"],
      lastSeen: new Date(),
    });

    gw.broadcastUserStatus("u1", { online: true });

    expect(gw["io"].emit).toHaveBeenCalledWith(
      "user_status_changed",
      expect.objectContaining({
        userId: "u1",
        identity: "alice",
        status: { online: true },
      })
    );
  });
});
