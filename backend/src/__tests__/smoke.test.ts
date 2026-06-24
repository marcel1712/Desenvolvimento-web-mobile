describe("smoke", () => {
  it("passes", () => {
    expect(1 + 1).toBe(2);
  });

  it("INTENTIONAL FAILURE - testing branch protection", () => {
    expect(true).toBe(false);
  });
});
