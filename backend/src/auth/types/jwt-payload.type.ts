export interface JwtPayload {
  sub: string;
  fermaId: string;
  email: string;
  rol: string;
}

export interface CurrentUserData {
  id: string;
  fermaId: string;
  email: string;
  rol: string;
}
