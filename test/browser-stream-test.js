/*eslint-env mocha*/
'use strict';

const { assert, sinon } = require('@sinonjs/referee-sinon');
const { PassThrough, Transform, Writable } = require('stream');

describe('browser-stream', () => {

  function writable(write) {
    return new Writable({
      write(chunk) {
        write(String(chunk));
      }
    });
  }

  it('can sub-class Transform', () => {
    class Test extends Transform {
      constructor() {
        super({
          writableObjectMode: true
        });
      }
      _transform(chunk, enc, callback) {
        callback(null, JSON.stringify(chunk));
      }
    }
    const test = new Test();
    const write = sinon.fake();
    test.pipe(writable(write));

    test.write({ is: 42 });

    assert.calledWith(write, '{"is":42}');
  });

  it('can use Transform options', () => {
    const test = new Transform({
      writableObjectMode: true,
      transform(chunk, enc, callback) {
        callback(null, JSON.stringify(chunk));
      }
    });
    const write = sinon.fake();
    test.pipe(writable(write));

    test.write({ is: 42 });

    assert.calledWith(write, '{"is":42}');
  });

  it('can sub-class Writable', () => {
    const write = sinon.fake();
    class Test extends Writable {
      _write(chunk) {
        write(String(chunk));
      }
    }
    const test = new Test();

    test.write('hello');

    assert.calledWith(write, 'hello');
  });

  it('can use Writable options', () => {
    const write = sinon.fake();
    const test = new Writable({ objectMode: true, write });

    test.write('hello');

    assert.calledWith(write, 'hello');
  });

  it('pipes data from transform to writable', () => {
    const transform = new Transform({
      writableObjectMode: true,
      transform(chunk, enc, callback) {
        callback(null, JSON.stringify(chunk));
      }
    });
    const write = sinon.fake();

    transform.pipe(writable(write));

    transform.write({ is: 42 });

    assert.calledWith(write, '{"is":42}');
  });

  it('pipes data from transform to passthrough to writable', () => {
    const transform = new Transform({
      writableObjectMode: true,
      transform(chunk, enc, callback) {
        callback(null, JSON.stringify(chunk));
      }
    });
    const through = new PassThrough();
    const write = sinon.fake();

    transform.pipe(through).pipe(writable(write));

    transform.write({ is: 42 });

    assert.calledWith(write, '{"is":42}');
  });

  it('emits "error" event if transform fails', () => {
    const transform = new Transform({
      writableObjectMode: true,
      transform(chunk, enc, callback) {
        callback(new Error('Fail!'));
      }
    });
    const error = sinon.fake();
    transform.on('error', error);

    transform.write({ is: 42 });

    assert.calledWithMatch(error, { message: 'Fail!' });
  });

  it('emits "error" event if writable fails', () => {
    const writable = new Writable({
      objectMode: true,
      write(chunk, enc, callback) {
        callback(new Error('Fail!'));
      }
    });
    const error = sinon.fake();
    writable.on('error', error);

    writable.write({ is: 42 });

    assert.calledWithMatch(error, { message: 'Fail!' });
  });

  it('throws "error" event on transform if piped writable fails', () => {
    const transform = new Transform({
      transform(chunk, enc, callback) {
        callback(null, chunk);
      }
    });
    const writable = new Writable({
      write(chunk, enc, callback) {
        callback(new Error('Fail!'));
      }
    });
    const error = sinon.fake();
    transform.on('error', error);

    transform.pipe(writable);

    assert.exception(() => {
      transform.write('hello');
    }, /Error: Fail!/);
  });

});
