module.exports = {
  pluginOptions: {
    electronBuilder: {
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
