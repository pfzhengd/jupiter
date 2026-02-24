export class PrereloadImage {
  public preloadImage (url: string): Promise<HTMLImageElement|ErrorEvent> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = url
      img.addEventListener('load', () => {
        resolve(img)
      })

      img.addEventListener('error', (err) => {
        reject(err)
      })
    })
  }

  public batchPreloadImage (urls: string[]):Promise<(HTMLImageElement|ErrorEvent)[]> {
    return Promise.all(urls.map((url) => this.preloadImage(url)))
  }
}

export default {}
