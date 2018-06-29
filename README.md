# Studio Browser Stream

💧 Naive stream shim for smaller Browserify bundles.

## Why?

This library exists to make it possible to use [Studio Log][1] in browsers by
letting Browserify replace the node `stream` module with this implementation.
The default Browserify `stream` implementation adds 200+KB to the bundle.

__Note!__ This library is intentionally incompatible with the original node
`stream` module. It is only supposed to behave in the context of the [Studio
Log][1] modules.

## Usage

Add this section to your `package.json`:

```json
{
  "browser": {
    "stream": "@studio/browser-stream"
  }
}
```

## Install

```bash
❯ npm i @studio/browser-stream
```

## API

- `Writable`
- `PassThrough`
- `Transform`

## Related modules

- 👻 [Studio Log][1] is a tiny streaming ndJSON logger.
- 🎩 [Studio Log Format][2] pretty prints Studio Log streams.
- 📦 [Studio Changes][3] is used to create the changelog for this module.

## License

MIT

<div align="center">Made with ❤️ on 🌍</div>

[1]: https://github.com/javascript-studio/studio-log
[2]: https://github.com/javascript-studio/studio-log-format
[3]: https://github.com/javascript-studio/studio-changes
