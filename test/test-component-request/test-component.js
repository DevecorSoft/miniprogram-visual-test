Component({
  lifetimes: {
    attached() {
      wx.request({
        url: "http://example.com/path/to/example", method: 'GET',
        success: (res) => {
          console.log(res)
          this.setData({
            data: res.data
          })
        },
        fail: (err) => {
          console.error(err)
        }
      })
    }
  }
})
