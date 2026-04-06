import { ok } from "../../../lib/middleware";
export async function POSTLogout() {
  const response = ok({ message: "Logged out." });
  response.cookies.set("prestige_token", "", { maxAge: 0, path: "/" });
  return response;
}
