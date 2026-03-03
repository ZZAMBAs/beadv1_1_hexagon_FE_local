import { decode } from "jwt-js-decode";

export const CLAIMS = {
  MEMBER_CODE: "member-code",
  IS_SIGNED_UP: "is-signed-up",
  ROLE: "role",
};

export const initialAuthState = {
  isLoggedIn: false,
  memberCode: null,
  isSignedUp: false,
  role: null,
};

export const decodeAccessToken = (token) => decode(token).payload;

export const getAuthStateFromToken = (token) => {
  if (!token) {
    return initialAuthState;
  }

  const payload = decodeAccessToken(token);
  const memberCode = payload[CLAIMS.MEMBER_CODE];

  if (!memberCode) {
    return initialAuthState;
  }

  return {
    isLoggedIn: true,
    memberCode,
    isSignedUp:
      payload[CLAIMS.IS_SIGNED_UP] === true ||
      String(payload[CLAIMS.IS_SIGNED_UP]) === "true",
    role: payload[CLAIMS.ROLE] || null,
  };
};

