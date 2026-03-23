module.exports = {
  jwtVerify: async function() {
    return { payload: { sub: 'mock-user-id' } };
  },
  SignJWT: async function(payload) {
    return {
      setProtectedHeader: () => ({ setIssuedAt: () => ({ sign: () => 'mock-token' }) }),
      sign: () => 'mock-token',
    };
  },
  createLocalJWKSet: function() {
    return async function() { return {}; };
  },
  decodeJwt: function() { return {}; },
  jwtDecrypt: async function() { return { payload: {} }; },
};
