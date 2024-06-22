import request from 'supertest';
import { expect } from 'chai';
import app from '../API/index.mjs'; 

describe('GET /api/hello', () => {
  it('should return greeting with client IP and name', (done) => {
    request(app)
      .get('/api/hello')
      .query({ visitor_name: 'John' })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        const { clients_ip, greeting } = res.body;
        expect(clients_ip).to.be.a('string');
        expect(clients_ip).to.equal('127.0.0.1'); 
        expect(greeting).to.equal('Hello, John!');
        done();
      });
  });

  it('should return error when visitor_name is not provided', (done) => {
    request(app)
      .get('/api/hello')
      .expect('Content-Type', /json/)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        const { error } = res.body;
        expect(error).to.equal('visitor_name is not passed in the url!');
        done();
      });
  });

  it('should handle IPv6-mapped IPv4 addresses', (done) => {
    request(app)
      .get('/api/hello')
      .query({ visitor_name: 'Jane' })
      .set('X-Forwarded-For', '::ffff:127.0.0.1')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        const { clients_ip, greeting } = res.body;
        expect(clients_ip).to.be.a('string');
        expect(clients_ip).to.equal('127.0.0.1');
        expect(greeting).to.equal('Hello, Jane!');
        done();
      });
  });
});
