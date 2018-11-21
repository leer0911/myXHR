export default {
  adapter: (config: any) => {
    return new Promise(() => {
      console.log(config)
    })
  }
}
