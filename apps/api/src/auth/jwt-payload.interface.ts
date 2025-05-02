export interface JwtPayload {
  userId: string;
  admin: boolean;
  iat: number; // issued-at, 自動で入る
  exp: number; // expiry
}
