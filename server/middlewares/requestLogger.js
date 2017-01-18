/**
 * Created by antonio on 1/16/17.
 */

module.exports = function(request, response, next) {
    console.log({
        message: 'Received request',
        url: request.url,
        method: request.method,
        headers: request.headers,
        query: request.query,
        body: request.body
    });
    return next();
};
