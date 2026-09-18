// Ensure mock storage and test mode before any modules load
process.env.USE_MOCK_STORAGE = "true";
process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = process.env.SESSION_SECRET || "test-session-secret-key-at-least-32-chars-long";

import express from "express";
import http from "http";

async function runTests() {
  const { registerRoutes } = await import("../server/routes");
  const { sessionMiddleware } = await import("../server/auth");

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(sessionMiddleware);

  const server = http.createServer(app);
  await registerRoutes(server, app);
  
  await new Promise<void>((resolve) => {
    server.listen(5099, () => {
      console.log("Test server running on port 5099");
      resolve();
    });
  });

  const baseUrl = "http://localhost:5099";
  let sessionCookie = "";

  try {
    console.log("\n--- TEST 1: Register New User ---");
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "teststudent@campus.edu",
        password: "SecurePassword123!",
        name: "Test Student",
        college: "Tech University",
        campus: "North Campus"
      })
    });
    const regData = await regRes.json();
    console.log("Register status:", regRes.status);
    console.log("Register response:", regData);
    if (regRes.status !== 201) throw new Error("Registration failed");
    if ((regData as any).password || (regData as any).passwordHash) throw new Error("Password leaked in registration response!");

    const setCookie = regRes.headers.get("set-cookie");
    if (!setCookie) throw new Error("No session cookie set on register");
    sessionCookie = setCookie.split(";")[0];
    console.log("Session cookie received:", sessionCookie);

    console.log("\n--- TEST 2: GET /api/auth/me (Authenticated) ---");
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: sessionCookie }
    });
    const meData = await meRes.json();
    console.log("Me status:", meRes.status);
    console.log("Me data:", meData);
    if (meRes.status !== 200 || meData.email !== "teststudent@campus.edu") throw new Error("/api/auth/me failed");
    if ((meData as any).password || (meData as any).passwordHash) throw new Error("Password leaked in /api/auth/me response!");

    console.log("\n--- TEST 3: Create Listing with Auth Session ---");
    const listRes = await fetch(`${baseUrl}/api/listings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie
      },
      body: JSON.stringify({
        title: "Calculus Textbook",
        description: "Hardcover 9th edition, great condition",
        price: 3500,
        category: "books",
        campus: "North Campus",
        condition: "good",
        images: ["https://example.com/image.jpg"]
      })
    });
    const listData = await listRes.json();
    console.log("Create listing status:", listRes.status);
    console.log("Listing created:", listData);
    if (listRes.status !== 201 || listData.sellerId !== meData.id) throw new Error("Listing creation failed or sellerId mismatched");

    console.log("\n--- TEST 4: Create Listing Unauthenticated (Should Fail 401) ---");
    const unauthListRes = await fetch(`${baseUrl}/api/listings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Unauthorized Listing",
        description: "Should fail",
        price: 1000,
        category: "books",
        campus: "North Campus",
        condition: "good"
      })
    });
    console.log("Unauth listing status:", unauthListRes.status);
    if (unauthListRes.status !== 401) throw new Error("Unauth listing should return 401");

    console.log("\n--- TEST 5: Verify Student ID with Session ---");
    const verifyRes = await fetch(`${baseUrl}/api/auth/verify-id`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie
      },
      body: JSON.stringify({
        idCardImage: "https://example.com/idcard.jpg"
      })
    });
    const verifyData = await verifyRes.json();
    console.log("Verify status:", verifyRes.status);
    console.log("Verify response:", verifyData);
    if (verifyRes.status !== 200 || !verifyData.success) throw new Error("Verify ID failed");

    // Check that GET /api/auth/me reflects studentIdVerified = true
    const meVerifiedRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: sessionCookie }
    });
    const meVerifiedData = await meVerifiedRes.json();
    console.log("Me after verification:", meVerifiedData);
    if (!meVerifiedData.studentIdVerified) throw new Error("studentIdVerified was not updated");

    console.log("\n--- TEST 6: Logout ---");
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: sessionCookie }
    });
    console.log("Logout status:", logoutRes.status);
    if (logoutRes.status !== 200) throw new Error("Logout failed");

    console.log("\n--- TEST 7: GET /api/auth/me After Logout (Should Fail 401) ---");
    const meAfterLogout = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: sessionCookie }
    });
    console.log("Me after logout status:", meAfterLogout.status);
    if (meAfterLogout.status !== 401) throw new Error("Me after logout should return 401");

    console.log("\n--- TEST 8: Login with Incorrect Password (Should Fail 401) ---");
    const badLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "teststudent@campus.edu",
        password: "WrongPassword123!"
      })
    });
    console.log("Bad login status:", badLoginRes.status);
    if (badLoginRes.status !== 401) throw new Error("Bad login should return 401");

    console.log("\n--- TEST 9: Login with Correct Password ---");
    const goodLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "teststudent@campus.edu",
        password: "SecurePassword123!"
      })
    });
    const goodLoginData = await goodLoginRes.json();
    console.log("Good login status:", goodLoginRes.status);
    console.log("Good login response:", goodLoginData);
    if (goodLoginRes.status !== 200 || goodLoginData.email !== "teststudent@campus.edu") throw new Error("Good login failed");

    console.log("\n==========================================");
    console.log(" ALL 9 AUTH INTEGRATION TESTS PASSED! ");
    console.log("==========================================");
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
