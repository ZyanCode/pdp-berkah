/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
/**
 * page.evaluate can only return a serializable value,
 * so it is not possible to return the full element.
 * Instead, we return an object with some common
 * properties that you may want to access in a test.
 */
const getSerialElement = async (page, element) => {
  return page.evaluate((el) => {
    const { className, tagName, id } = el;
    return {
      className,
      tagName,
      id,
    };
  }, element);
};
export const getActiveElementParent = async (page) => {
  const activeElement = await page.evaluateHandle(() => document.activeElement.parentElement);
  return getSerialElement(page, activeElement);
};
export const getActiveElement = async (page) => {
  const activeElement = await page.evaluateHandle(() => document.activeElement);
  return getSerialElement(page, activeElement);
};
export const generateE2EUrl = (component, type, rtl = false) => {
  let url = `/src/components/${component}/test/${type}?ionic:_testing=true`;
  if (rtl) {
    url = `${url}&rtl=true`;
  }
  return url;
};
/**
 * Gets the value of a property on an element
 */
export const getElementProperty = async (element, property) => {
  const getProperty = await element.getProperty(property);
  if (!getProperty) {
    return '';
  }
  return getProperty.jsonValue();
};
/**
 * Listens for an event and fires a callback
 * @param page - The Puppeteer `page` object
 * @param eventType: string - The event name to listen for. ex: `ionPickerColChange`
 * @param element: HTMLElement - An HTML element
 * @param callbackName: string - The name of the callback function to
 * call when the event is fired.
 *
 * Note: The callback function must be added using
 * page.exposeFunction prior to calling this function.
 */
export const listenForEvent = async (page, eventType, element, callbackName) => {
  try {
    return await page.evaluate((scopeEventType, scopeElement, scopeCallbackName) => {
      scopeElement.addEventListener(scopeEventType, (e) => {
        window[scopeCallbackName]({ detail: e.detail });
      });
    }, eventType, element, callbackName);
  }
  catch (err) {
    throw err;
  }
};
/**
 * Drags an element by (x, y) pixels
 * @param element: HTMLElement - The HTML Element to drag
 * @param page - The Puppeteer 'page' object
 * @param x: number - Amount to drag `element` by on the x-axis
 * @param y: number - Amount to drag `element` by on the y-axis
 * @param startCoordinates (optional) - Coordinates of where to start the drag
 * gesture. If not provided, the drag gesture will start in the middle of the
 * element.
 */
export const dragElementBy = async (element, page, x = 0, y = 0, startCoordinates) => {
  try {
    const boundingBox = (await element.boundingBox());
    const startX = (startCoordinates === null || startCoordinates === void 0 ? void 0 : startCoordinates.x) === undefined ? boundingBox.x + boundingBox.width / 2 : startCoordinates.x;
    const startY = (startCoordinates === null || startCoordinates === void 0 ? void 0 : startCoordinates.y) === undefined ? boundingBox.y + boundingBox.height / 2 : startCoordinates.y;
    const midX = startX + x / 2;
    const midY = startY + y / 2;
    const endX = startX + x;
    const endY = startY + y;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(midX, midY);
    await page.mouse.move(endX, endY);
    await page.mouse.up();
  }
  catch (err) {
    throw err;
  }
};
/**
 * Wait for a function to return true
 * This method runs in the context of the
 * test whereas page.waitForFunction runs in
 * the context of the browser
 * @param fn - The function to run
 * @param params: any - Any parameters that the fn needs
 * @param interval: number - Interval to run setInterval on
 */
export const waitForFunctionTestContext = async (fn, params, interval = 16) => {
  return new Promise((resolve) => {
    const intervalId = setInterval(() => {
      if (fn(params)) {
        clearInterval(intervalId);
        return resolve();
      }
    }, interval);
  });
};
/**
 * Pierce through shadow roots
 * https://github.com/GoogleChrome/puppeteer/issues/858#issuecomment-359763824
 */
export const queryDeep = async (page, ...selectors) => {
  const shadowSelectorFn = (el, selector) => (el === null || el === void 0 ? void 0 : el.shadowRoot) && el.shadowRoot.querySelector(selector);
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    const [firstSelector, ...restSelectors] = selectors;
    let parentElement = await page.$(firstSelector);
    for (const selector of restSelectors) {
      parentElement = (await page.evaluateHandle(shadowSelectorFn, parentElement, selector));
    }
    if (parentElement) {
      resolve(parentElement);
    }
  });
};
/**
 * Given an element and optional selector, use the selector if
 * it exists or get the node name of that element if not. Combine
 * with the current mode to verify the correct classes exist.
 *
 * @param el: E2EElement - The element to verify classes on
 * @param selector: string - A selector to use instead of the element tag name
 * @param globalMode: string - the global mode as a fallback
 *
 * Examples:
 * await checkComponentModeClasses(await page.find('ion-card-content'), globalMode)
 * => expect(el).toHaveClass(`card-content-{mode}`);
 *
 * await checkComponentModeClasses(await page.find('ion-card-content'), globalMode, 'some-class')
 * => expect(el).toHaveClass(`some-class-{mode}`);
 */
export const checkComponentModeClasses = async (el, globalMode, selector) => {
  // If passed a selector to use, use that, else grab the nodeName
  // of the element and remove the ion prefix to get the class selector
  const component = selector !== undefined ? selector : el.nodeName.toLowerCase().replace('ion-', '');
  const mode = (await el.getProperty('mode')) || globalMode;
  expect(el).toHaveClass(`${component}-${mode}`);
};
/**
 * Given an element, get the mode and verify it exists as a class
 *
 * @param el: E2EElement - the element to verify the mode class on
 * @param globalMode: string - the global mode as a fallback
 */
export const checkModeClasses = async (el, globalMode) => {
  const mode = (await el.getProperty('mode')) || globalMode;
  expect(el).toHaveClass(`${mode}`);
};
/**
 * Scrolls to a specific x/y coordinate within a scroll container. Supports custom
 * method for `ion-content` implementations.
 *
 * @param page The Puppeteer page object
 * @param selector The element to scroll within.
 * @param x The x coordinate to scroll to.
 * @param y The y coordinate to scroll to.
 */
export const scrollTo = async (page, selector, x, y) => {
  await page.evaluate(async (selector) => {
    const el = document.querySelector(selector);
    if (el) {
      if (el.tagName === 'ION-CONTENT') {
        await el.scrollToPoint(x, y);
      }
      else {
        el.scroll(x, y);
      }
    }
    else {
      console.error(`Unable to find element with selector: ${selector}`);
    }
  }, selector);
};
/**
 * Scrolls to the bottom of a scroll container. Supports custom method for
 * `ion-content` implementations.
 *
 * @param page The Puppeteer page object
 * @param selector The element to scroll within.
 */
export const scrollToBottom = async (page, selector) => {
  await page.evaluate(async (elSelector) => {
    const el = document.querySelector(elSelector);
    if (el) {
      if (el.tagName === 'ION-CONTENT') {
        await el.scrollToBottom();
      }
      else {
        el.scrollTop = el.scrollHeight;
      }
    }
    else {
      console.error(`Unable to find element with selector: ${elSelector}`);
    }
  }, selector);
};
