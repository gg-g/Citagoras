module.exports = {
  pluginOptions: {
    electronBuilder: {
    nodeIntegration: true,
      builderOptions: {
        mac: {
          target: ['zip']
        },
        win: {
          target: ['zip']
        },
        linux: {
          target: ['AppImage', 'deb'],
          category: "Education"
        },
      }
    }
  }
};
