import decodeClientDataJSON from './decodeClientDataJSON';

test('should convert base64-encoded attestation clientDataJSON to JSON', () => {
  expect(
    decodeClientDataJSON(
      'eyJjaGFsbGVuZ2UiOiJVMmQ0TjNZME0wOU1jbGRQYjFSNVpFeG5UbG95IiwiY2xpZW50RXh0ZW5zaW9ucyI6e30' +
        'sImhhc2hBbGdvcml0aG0iOiJTSEEtMjU2Iiwib3JpZ2luIjoiaHR0cHM6Ly9jbG92ZXIubWlsbGVydGltZS5kZX' +
        'Y6MzAwMCIsInR5cGUiOiJ3ZWJhdXRobi5jcmVhdGUifQ==',
    ),
  ).toEqual({
    challenge: 'Sgx7v43OLrWOoTydLgNZ2',
    clientExtensions: {},
    hashAlgorithm: 'SHA-256',
    origin: 'https://clover.millertime.dev:3000',
    type: 'webauthn.create',
  });
});
