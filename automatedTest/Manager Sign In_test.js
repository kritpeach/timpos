const url = 'http://localhost:9999';

Feature('Manager SignIn');

Scenario('Manager SignIn with correct restaurantId and employee password', (I) => {
    I.amOnPage(`${url}/#/signin`);
    I.waitForElement('#app');
    I.fillField('#app > div > div > form > div:nth-child(1) > div > div.v-input__slot > div > input[type="text"]', 'tryumm');
    I.fillField('#app > div > div > form > div:nth-child(2) > div > div.v-input__slot > div.v-text-field__slot > input[type="password"]', '11111111');
    I.click('Sign in');
    I.waitForElement('#app > div > h1');
    I.see('Dashboard', '#app > div > h1');
});

Scenario('Manager SignIn with correct restaurantId but incorrect employee password', (I) => {
    I.amOnPage(`${url}/#/signin`);
    I.waitForElement('#app');
    I.fillField('#app > div > div > form > div:nth-child(1) > div > div.v-input__slot > div > input[type="text"]', 'tryumm');
    I.fillField('#app > div > div > form > div:nth-child(2) > div > div.v-input__slot > div.v-text-field__slot > input[type="password"]', 'wrongpassword');
    I.click('Sign in');
    I.waitForElement('div.v-alert.error');
    I.see('employeeDoesNotExist', '#app > div > div > form > div.v-alert.error > div');
});

Scenario('Manager SignIn with incorrect restaurantId but correct employee password', (I) => {
    I.amOnPage(`${url}/#/signin`);
    I.waitForElement('#app');
    I.fillField('#app > div > div > form > div:nth-child(1) > div > div.v-input__slot > div > input[type="text"]', 'noexist');
    I.fillField('#app > div > div > form > div:nth-child(2) > div > div.v-input__slot > div.v-text-field__slot > input[type="password"]', '11111111');
    I.click('Sign in');
    I.waitForElement('div.v-alert.error');
    I.see('restaurantNameDoesNotExist', '#app > div > div > form > div.v-alert.error > div');
});

Scenario('Manager SignIn with incorrect restaurantId and employee password', (I) => {
    I.amOnPage(`${url}/#/signin`);
    I.waitForElement('#app');
    I.fillField('#app > div > div > form > div:nth-child(1) > div > div.v-input__slot > div > input[type="text"]', 'noexist');
    I.fillField('#app > div > div > form > div:nth-child(2) > div > div.v-input__slot > div.v-text-field__slot > input[type="password"]', 'wrongpassword');
    I.click('Sign in');
    I.waitForElement('div.v-alert.error');
    I.see('restaurantNameDoesNotExist', '#app > div > div > form > div.v-alert.error > div');
});

Scenario('Manager SignIn only correct restaurantId but without password', (I) => {
    I.amOnPage(`${url}/#/signin`);
    I.waitForElement('#app');
    I.fillField('#app > div > div > form > div:nth-child(1) > div > div.v-input__slot > div > input[type="text"]', 'tryumm');
    I.seeElement('button[disabled=disabled]');
});

Scenario('Manager SignIn only correct password but without restaurantId', (I) => {
    I.amOnPage(`${url}/#/signin`);
    I.waitForElement('#app');
    I.fillField('#app > div > div > form > div:nth-child(2) > div > div.v-input__slot > div.v-text-field__slot > input[type="password"]', '11111111');
    I.seeElement('button[disabled=disabled]');
});

Scenario('Manager SignIn with less than 8 length password', (I) => {
    I.amOnPage(`${url}/#/signin`);
    I.waitForElement('#app');
    I.fillField('#app > div > div > form > div:nth-child(2) > div > div.v-input__slot > div.v-text-field__slot > input[type="password"]', '1111');
    I.see('At least 8 character');
});

Scenario('Manager SignIn without restaurantId and employee password', (I) => {
    I.amOnPage(`${url}/#/signin`);
    I.waitForElement('#app');
    I.seeElement('button[disabled=disabled]');
});
