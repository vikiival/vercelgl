## VercelGL

VercelGL is a simple, lightweight API to use serverless chrome.
It is designed to be used with the [Vercel](https://vercel.com) platform, but can be used anywhere.

### Usage

currently there is only one route implemented

```
POST /api/screenshot
```

Body 

> Bear in mind that this app is more like template so fill free to bend for your use case (mine is looking for `<canvas>` the web)

```json
{
  "url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas"
}
```

<img width="1608" alt="Screenshot 2024-01-22 at 11 56 56" src="https://github.com/vikiival/vercelgl/assets/22471030/58f382b1-fb09-445b-a519-abdaad1b50ff">



### Reference

https://gist.github.com/kettanaito/56861aff96e6debc575d522dd03e5725
