import { describe, it, expect } from "vitest";
import { authenticateUserByUsername } from "./auth";

describe("Login System", () => {
  it("should authenticate admin user successfully", async () => {
    const result = await authenticateUserByUsername("admin", "123456");
    
    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result.user?.username).toBe("admin");
    expect(result.user?.role).toBe("admin");
  });

  it("should fail with wrong password", async () => {
    const result = await authenticateUserByUsername("admin", "wrongpassword");
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should fail with non-existent user", async () => {
    const result = await authenticateUserByUsername("nonexistent", "123456");
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
