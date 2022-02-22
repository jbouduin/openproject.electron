export enum DataStatus {
  Ok = 200,
  Accepted = 202,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  NotAllowed = 405,
  Conflict = 409,
  Gone = 410,
  Unprocessable = 422,
  Error = 500,
  RendererError = 900
}

export type DataStatusKeyStrings = keyof typeof DataStatus;
