const ERRORS = {
  USER_ALREADY_EXISTS: {
    code: 1,
    error: 'USER_ALREADY_EXISTS',
    message: 'User with this email already exists',
  },
  USER_NOT_FOUND: {
    code: 2,
    error: 'USER_NOT_FOUND',
    message: 'User not found',
  },
  MOVIE_NOT_FOUND: {
    code: 3,
    error: 'MOVIE_NOT_FOUND',
    message: 'Movie not found',
  },
  MOVIE_ALREADY_EXISTS: {
    code: 4,
    error: 'MOVIE_ALREADY_EXISTS',
    message: 'Movie already exists',
  },
  MOVIE_NOT_AVAILABLE: {
    code: 5,
    error: 'MOVIE_NOT_AVAILABLE',
    message: 'Movie not available',
  },
  SESSION_NOT_FOUND: {
    code: 6,
    error: 'SESSION_NOT_FOUND',
    message: 'Session not found',
  },
  SESSION_ALREADY_EXISTS: {
    code: 7,
    error: 'SESSION_ALREADY_EXISTS',
    message: 'Session already exists',
  },
  USER_NOT_OLD_ENOUGH: {
    code: 8,
    error: 'USER_NOT_OLD_ENOUGH',
    message: 'User does not meet the age restriction for this movie',
  },
  TICKET_ALREADY_EXISTS: {
    code: 9,
    error: 'TICKET_ALREADY_EXISTS',
    message: 'Ticket already exists',
  },
  TICKET_NOT_FOUND: {
    code: 10,
    error: 'TICKET_NOT_FOUND',
    message: 'Ticket not found',
  },
  TICKET_ALREADY_USED: {
    code: 11,
    error: 'TICKET_ALREADY_USED',
    message: 'Ticket has already been used',
  },
  USER_NOT_AUTHORIZED: {
    code: 12,
    error: 'USER_NOT_AUTHORIZED',
    message: 'User not authorized',
  },
  THERE_ARE_NO_MOVIES: {
    code: 13,
    error: 'THERE_ARE_NO_MOVIES',
    message: 'There are no movies',
  },
  MOVIE_IS_NOT_ACTIVE: {
    code: 14,
    error: 'MOVIE_IS_NOT_ACTIVE',
    message: 'Movie is not active',
  },
  TICKET_DOES_NOT_BELONG_TO_USER: {
    code: 15,
    error: 'TICKET_DOES_NOT_BELONG_TO_USER',
    message: 'Ticket does not belong to user',
  },
  SESSION_ALREADY_PASSED: {
    code: 16,
    error: 'SESSION_ALREADY_PASSED',
    message: 'Session has already passed',
  },
  MOVIE_HAS_NO_SESSIONS_TO_DELETE: {
    code: 17,
    error: 'MOVIE_HAS_NO_SESSIONS_TO_DELETE',
    message: 'Movie has no sessions to delete',
  },
};

export { ERRORS };
