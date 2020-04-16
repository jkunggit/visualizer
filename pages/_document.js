import Document, { Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render () {
    return (
      <html>
        <Head />
        <Main />
        <body>
          <NextScript />
        </body>
      </html>
    )
  }
}
