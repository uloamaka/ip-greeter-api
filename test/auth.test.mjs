import request from 'supertest';
import { expect } from 'chai';
import app from '../API/index.mjs';

describe('POST /api/register', () => {
    it('should return a new registered user', (done) => {
        request(app)
            .post('/api/register')
            .send({ username: 'John', password: 'Test@12345' })
            .expect('Content-Type', /json/)
            .expect(201)
            .end((err, res) => {
                if (err) return done(err);
                const { message } = res.body;
                expect(message).to.be.a('string');
                expect(message).to.equal('Registeration successful!');
                done();
            });
    });
    it('should return an error if email already exists', (done) => {
        request(app)
            .post('/api/register')
            .send({ username: 'John', password: 'Test@12345' })
            .expect('Content-Type', /json/)
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                const { error } = res.body;
                expect(error).to.equal('Email already exists!');
                done();
            });
    });
    it('should return an error if required fields are missing', (done) => {
        request(app)
            .post('/api/register')
            .send({ username: '', password: 'Test@12345' })
            .expect('Content-Type', /json/)
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                const { error } = res.body;
                expect(error).to.equal('Username is required!');
                done();
            });
    });

});

describe('POST /api/login', () => {
    it('Should login an existing user', (done) => {
        request(app)
            .post('/api/login')
            .send({ username: 'John', password: 'Test@12345' })
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                const { message } = res.body;
                expect(message).to.be.a('string');
                expect(message).to.equal('Login successful!');
                done();
            });
    });
    it('should return an error if credentials are incorrect', (done) => {
        request(app)
            .post('/api/login')
            .send({ username: 'John', password: 'WrongPassword12345' })
            .expect('Content-Type', /json/)
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                const { error } = res.body;
                expect(error).to.equal('Incorrect username or password!');
                done();
            });
    });
    it('should return an error if username is not registered', (done) => {
        request(app)
            .post('/api/login')
            .send({
                username: 'Not-Registered',
                password: 'Test@12345',
            })
            .expect('Content-Type', /json/)
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                const { error } = res.body;
                expect(error).to.equal('Username not found!');
                done();
            });
    });
    it('should return an error if password is missing', (done) => {
        request(app)
            .post('/api/login')
            .send({
                username: 'John',
                password: '',
            })
            .expect('Content-Type', /json/)
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                const { error } = res.body;
                expect(error).to.equal('Password not provided!');
                done();
            });
    });
    it('should handle login attempts with SQL injection attempts safely', (done) => {
        request(app)
            .post('/api/login')
            .send({
                username: "'; DROP TABLE users; --",
                password: 'Test@12345',
            })
            .expect('Content-Type', /json/)
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                const { error } = res.body;
                expect(error).to.equal('Password not provided!');
                done();
            });
    });
});
