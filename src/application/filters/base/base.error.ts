export class BaseError extends Error {
  public data: any;
  public code: number;
  public status: number;

  constructor(data: any, status: number) {
    super(data.message);

    this.name = data.error;
    this.code = data.code;
    this.status = status;
  }
}
