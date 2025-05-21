export class ResponseToken {
  access_token: string;
  refresh_token: string;
  expireAtAccessToken?: Date;
  expireAtRefreshToken?: Date;

  constructor(
    access_token: string,
    refresh_token: string,
    expireAtAccessToken?: Date,
    expireAtRefreshToken?: Date
  ) {
    this.access_token = access_token;
    this.refresh_token = refresh_token;
    this.expireAtAccessToken = expireAtAccessToken;
    this.expireAtRefreshToken = expireAtRefreshToken;
  }
}
