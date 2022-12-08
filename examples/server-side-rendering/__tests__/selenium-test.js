//single_test.js:Jest testing tutorial for Selenium JavaScript Testing
/**
 * @jest-environment jest-environment-selenium-webdriver
 */
const { By, Builder, until } = require('selenium-webdriver')
const { promises: fs } = require('fs')
const url = 'https://www.selenium.dev/'

const getElementXpath = async (driver, xpath, timeout = 3000) => {
  const el = await driver.wait(until.elementLocated(By.xpath(xpath)), timeout)
  return await driver.wait(until.elementIsVisible(el), timeout)
}

const getElementName = async (driver, name, timeout = 3000) => {
  const el = await driver.wait(until.elementLocated(By.name(name)), timeout)
  return await driver.wait(until.elementIsVisible(el), timeout)
}

const getElementId = async (driver, id, timeout = 3000) => {
  const el = await driver.wait(until.elementLocated(By.id(id)), timeout)
  return await driver.wait(until.elementIsVisible(el), timeout)
}

// declaring the test group  This is our test case scenario that we will execute from our first test script.
describe('executing test scenario on the website www.selenium.dev', () => {
  let driver

  beforeAll(async () => {
    // func to get the cloud driver eslint disable next line no undef
    driver = await new Builder().forBrowser('chrome').build()
    await driver.get('https://www.selenium.dev')
  }, 15000)

  afterAll(async () => {
    await driver.quit()
  }, 15000)

  test('it performs a validation of title on the home page', async () => {
    await driver.get(url)
    const title = await driver.findElement(By.tagName('h1')).getText()
    expect(title).toMatchInlineSnapshot(
      `"Selenium automates browsers. That's it!"`,
    )
  })
  /* 
  test('it performs a validation of the search box on the page', async () => {
    const foundAndLoadedCheck = async () => {
      await until.elementLocated(By.id('search'))
      const value = await driver.findElement(By.id('search')).getText()
      return value !== '~'
    }

    await driver.wait(foundAndLoadedCheck, 3000)
    const search = await driver.findElement(By.id('search')).getText()
    expect(search).toEqual('')
  })

  // declaring the test group */

  describe('it captures a screenshot of the current page on the browser', () => {
    test('snap a picture by taking the screenshot', async () => {
      // files saved in ./reports/screenshots by default
      await driver.get(url)
      const encodedString = await driver.takeScreenshot()
      expect(
        await driver.executeScript('return window.location.href'),
      ).toMatchInlineSnapshot(`"https://www.selenium.dev/"`)

      await fs.writeFile('./image.png', encodedString, 'base64')
    })
  })
})
