import { ERRORS } from './messages';
import { BaseError } from '@application/filters/base/base.error';
import { HttpStatus } from '@nestjs/common';

export class UserAlreadyExistsError extends BaseError {
  constructor() {
    super(ERRORS.USER_ALREADY_EXISTS, HttpStatus.CONFLICT);
  }
}

export class UserNotFoundError extends BaseError {
  constructor() {
    super(ERRORS.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}

export class MovieNotFoundError extends BaseError {
  constructor() {
    super(ERRORS.MOVIE_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}

export class MovieAlreadyExistsError extends BaseError {
  constructor() {
    super(ERRORS.MOVIE_ALREADY_EXISTS, HttpStatus.CONFLICT);
  }
}

export class MovieNotAvailableError extends BaseError {
  constructor() {
    super(ERRORS.MOVIE_NOT_AVAILABLE, HttpStatus.NOT_FOUND);
  }
}

export class SessionNotFoundError extends BaseError {
  constructor() {
    super(ERRORS.SESSION_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}

export class SessionAlreadyExistsError extends BaseError {
  constructor() {
    super(ERRORS.SESSION_ALREADY_EXISTS, HttpStatus.CONFLICT);
  }
}

export class UserNotOldEnoughError extends BaseError {
  constructor() {
    super(ERRORS.USER_NOT_OLD_ENOUGH, HttpStatus.BAD_REQUEST);
  }
}

export class TicketAlreadyExistsError extends BaseError {
  constructor() {
    super(ERRORS.TICKET_ALREADY_EXISTS, HttpStatus.CONFLICT);
  }
}

export class TicketNotFoundError extends BaseError {
  constructor() {
    super(ERRORS.TICKET_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}

export class TicketAlreadyUsedError extends BaseError {
  constructor() {
    super(ERRORS.TICKET_ALREADY_USED, HttpStatus.CONFLICT);
  }
}

export class UserNotAuthorizedError extends BaseError {
  constructor() {
    super(ERRORS.USER_NOT_AUTHORIZED, HttpStatus.UNAUTHORIZED);
  }
}

export class ThereAreNoMoviesError extends BaseError {
  constructor() {
    super(ERRORS.THERE_ARE_NO_MOVIES, HttpStatus.NOT_FOUND);
  }
}

export class MovieIsNotActiveError extends BaseError {
  constructor() {
    super(ERRORS.MOVIE_IS_NOT_ACTIVE, HttpStatus.NOT_FOUND);
  }
}

export class TicketDoesNotBelongToUserError extends BaseError {
  constructor() {
    super(ERRORS.TICKET_DOES_NOT_BELONG_TO_USER, HttpStatus.FORBIDDEN);
  }
}

export default ERRORS;