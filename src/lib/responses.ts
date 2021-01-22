export function ok(text = 'Ok') {
  return handleResponse(200, text);
}

export function badRequest(text = 'Bad Request') {
  return handleResponse(400, text);
}

export function internalServerError(text = 'Internal Server Error') {
  return handleResponse(500, text);
}

function handleResponse(statusCode: number, text: string) {
  return {
    statusCode,
    body: text
  };
}