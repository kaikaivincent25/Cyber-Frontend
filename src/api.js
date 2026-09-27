const BASE_URL = "http://localhost:8000";

function getToken() {
  return localStorage.getItem("access_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || "Something went wrong. Please try again.");
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function login(email, password) {
  // /api/auth/login expects form-encoded data (OAuth2PasswordRequestForm, Step 4),
  // not JSON — so this one call bypasses the shared `request()` helper's JSON body.
  const formBody = new URLSearchParams({ username: email, password });
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formBody,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || "Login failed");
  }

  return response.json();
}

export function getServices() {
  return request("/api/services", { auth: false });
}

export function getMyTickets() {
  return request("/api/tickets/me");
}

export function getServiceById(id) {
  return request(`/api/services/${id}`, { auth: false });
}

export function submitRequest(payload) {
  return request("/api/requests", { method: "POST", body: payload, auth: false });
}

export function trackRequest(code) {
  return request(`/api/requests/track/${encodeURIComponent(code)}`, { auth: false });
}

export function getMe() {
  return request("/api/users/me");
}

export function getAllRequests() {
  return request("/api/requests");
}

export function assignRequestToStaff(requestId, staffId) {
  return request(`/api/requests/${requestId}/assign`, {
    method: "PATCH",
    body: { assigned_staff_id: staffId },
  });
}

export function updateRequestStatus(requestId, status) {
  return request(`/api/requests/${requestId}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function updateRequestFees(requestId, fees) {
  return request(`/api/requests/${requestId}/fees`, {
    method: "PATCH",
    body: fees,
  });
}

export function getAllServicesAdmin() {
  return request("/api/services/admin/all");
}

export function createService(payload) {
  return request("/api/services", { method: "POST", body: payload });
}

export function updateService(serviceId, payload) {
  return request(`/api/services/${serviceId}`, { method: "PATCH", body: payload });
}

export function getAllSessions() {
  return request("/api/sessions");
}

export function createSession(payload) {
  return request("/api/sessions", { method: "POST", body: payload });
}

export function endSession(sessionId, endTime) {
  return request(`/api/sessions/${sessionId}/end`, {
    method: "PATCH",
    body: { end_time: endTime },
  });
}

const BASE_URL_INTERNAL = "http://localhost:8000"; // matches BASE_URL already defined above

// Guest-side: authenticated by tracking code header, no bearer token.
export async function getGuestMessages(requestId, trackingCode) {
  const res = await fetch(`${BASE_URL_INTERNAL}/api/requests/${requestId}/messages`, {
    headers: { "X-Tracking-Code": trackingCode },
  });
  if (!res.ok) throw new Error("Could not load messages");
  return res.json();
}

export async function sendGuestMessage(requestId, trackingCode, body) {
  const res = await fetch(`${BASE_URL_INTERNAL}/api/requests/${requestId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Tracking-Code": trackingCode },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error("Could not send message");
  return res.json();
}

// Staff-side: reuses the existing request() helper, which already
// attaches the Authorization bearer header automatically (Step 10).
export function getStaffMessages(requestId) {
  return request(`/api/requests/${requestId}/messages`);
}

export function sendStaffMessage(requestId, body) {
  return request(`/api/requests/${requestId}/messages`, { method: "POST", body: { body } });
}


export function getAllStaff() {
  return request("/api/users/staff");
}

export function createStaffAccount(payload) {
  return request("/api/users/staff", { method: "POST", body: payload });
}

export function updateMyProfile(payload) {
  return request("/api/users/me", { method: "PATCH", body: payload });
}

export async function changeMyPassword(currentPassword, newPassword) {
  // 204 No Content — request()'s existing early return on that status (Step 10)
  // means this correctly resolves to `null`, not an empty-body JSON parse error.
  return request("/api/users/me/password", {
    method: "PATCH",
    body: { current_password: currentPassword, new_password: newPassword },
  });
}