const realBrowser = String(process.env.BROWSER).match(/^(1|true)$/gi)
const travisLaunchers = {
  chrome_travis: {
    base: 'Chrome',
    flags: ['--no-sandbox']
  }
}

const localBrowsers = realBrowser ? Object.keys(travisLaunchers) : ['Chrome']

module.exports = (config) => {
  config.set({
    frameworks: ['jasmine', 'karma-typescript'],
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-typescript',
      'karma-spec-reporter'
    ],
    karmaTypescriptConfig: {
      tsconfig: "./tsconfig.json",
    },
    client: {
      // leave Jasmine Spec Runner output visible in browser
      clearContext: false
    },
    files: [{ pattern: 'src/**/*.ts' }, { pattern: 'test/**/*.spec.ts' }],
    /**
     * 在浏览器使用之前处理匹配的文件
     * 可用的预处理: https://npmjs.org/browse/keyword/karma-preprocessor
     */
    preprocessors: {
      'src/**/*.ts': ['karma-typescript'],
      'test/**/*.spec.ts': ['karma-typescript']
    },
    /**
     * 使用测试结果报告者
     * 可能的值: "dots", "progress"
     * 可用的报告者：https://npmjs.org/browse/keyword/karma-reporter
     */
    reporters: ['spec', 'karma-typescript'],
    colors: true,
    /**
     * 日志等级
     * 可能的值：
     * config.LOG_DISABLE //不输出信息
     * config.LOG_ERROR    //只输出错误信息
     * config.LOG_WARN //只输出警告信息
     * config.LOG_INFO //输出全部信息
     * config.LOG_DEBUG //输出调试信息
     */
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: localBrowsers,
    singleRun: true
  })
}
