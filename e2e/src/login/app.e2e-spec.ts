import { Login } from './app.po';
import { browser, logging } from 'protractor';

describe('workspace-project App', () => {
  let page: Login;

  beforeEach(() => {
    page = new Login();
  });

  it('should display login page', () => {
    page.navigateTo();
    expect(page.getTitleText()).toEqual('Login');
  });

  // afterEach(async () => {
  //   // Assert that there are no errors emitted from the browser
  //   const logs = await browser.manage().logs().get(logging.Type.BROWSER);
  //   expect(logs).not.toContain(jasmine.objectContaining({
  //     level: logging.Level.SEVERE,
  //   } as logging.Entry));
  // });
});
