const setting = {
  billName: 'Table X',
  url: {
    manager: 'https://kritpeach.github.io',
    staff: 'https://tumtim-50d1c.firebaseapp.com'
  },
  orderList: [{ menu: 'ข้าวผัดปู', quantity: 1 }, { menu: 'ทะเลผัดฉ่า', quantity: 2 }, { menu: 'ผัดพริกไทยดำทะเล', quantity: 3 }]
};

Feature('Overall');

Scenario('One', (I) => {
  I.amOnPage(`${setting.url.staff}/#/signin`);
  I.waitForElement('#app', 15);
  I.fillField('form input[type="text"]', 'tryumm');
  I.fillField('form input[type="password"]', '11111111');
  I.click('Sign in');
  I.waitForElement('#app > div.application--wrap > div > main > div > button');
  I.click('#app > div.application--wrap > div > main > div > button');
  I.fillField('#app > div.v-dialog__content.v-dialog__content--active form input[type="text"]', setting.billName);
  I.click('Create');
  I.waitForText(`Once you create a new order, you'll see it listed here`);
  setting.orderList.forEach(order => {
    I.click('#app > div.application--wrap > div > main > div > a');
    I.click(order.menu);
    I.clearField('input[type="number"]');
    I.fillField('input[type="number"]', order.quantity);
    I.click('Add to cart');
  });
  I.click("Send");
  I.amOnPage(`${setting.url.staff}/#/r/F6XJtEtDmJ0N60HNjWno/kitchen`);
  I.waitForText(setting.billName);
  I.executeScript(() => {
    document.querySelectorAll('.v-content__wrap [type="checkbox"]').forEach(e => e.click());
  });
  I.wait(3);
  I.click("#app > div > div > nav > div > a");
  I.waitForText(setting.billName);
  I.click(`//*[contains(text(), '${setting.billName}')]/parent::*/parent::*`);
  I.click('#app > div.application--wrap > div > main > div > div:nth-child(2) > div.v-subheader.theme--light > button');
  I.fillField('input[aria-label="Receive money"]', 1000);
  I.click("Bill");
  I.dontSee(setting.billName);
});
