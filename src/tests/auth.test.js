const request = require('supertest');
const app = require('../app'); // or wherever your Express `app` is exported

describe('Auth Tests', () => {
  it('should send an OTP code', async () => {
    const res = await request(app).post('/sendSmsCode').send({
      phone: '1234567890'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('OTP sent successfully');
  });
});
