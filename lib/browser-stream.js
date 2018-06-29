/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

class Stream {

  constructor() {
    this._pipe = null;
    this._listeners = Object.create(null);
  }

  pipe(stream) {
    this._pipe = stream;
    return stream;
  }

  unpipe() {
    this._pipe = null;
  }

  on(event, listener) {
    this._listeners[event] = listener;
  }

  emit(event, data) {
    const cb = this._listeners[event];
    if (cb) {
      cb(data);
    } else if (event === 'error') {
      throw data;
    }
  }

  write(data, encoding, callback) {
    this.emit('data', data);
    if (this._pipe) {
      this._pipe.write(data, encoding, callback);
    }
  }

  end() {
    this.emit('end');
    if (this._pipe) {
      this._pipe.end();
    }
  }

}

function then(stream, callback, next) {
  return (err, data) => {
    if (err) {
      if (callback) {
        callback(err);
      }
      stream.emit('error', err);
    } else if (next) {
      next(null, data);
    }
  };
}

exports.Writable = class extends Stream {

  constructor(opts) {
    super();
    if (opts && opts.write) {
      this._write = opts.write;
    }
  }

  write(data, encoding, callback) {
    this._write(data, encoding, then(this, callback, callback));
  }

};

exports.PassThrough = Stream;

exports.Transform = class extends Stream {

  constructor(opts) {
    super();
    if (opts && opts.transform) {
      this._transform = opts.transform;
    }
  }

  write(data, encoding, callback) {
    this._transform(data, encoding, then(this, callback, (_err, str) => {
      if (this._pipe && str) {
        this._pipe.write(str, encoding, then(this, callback, callback));
      }
    }));
  }

  end() {
    this._flush((err) => {
      if (err) {
        this.emit('error', err);
      }
      super.end();
    });
  }

  push(data) {
    super.write(data);
  }

  _flush(cb) {
    cb();
  }

};
