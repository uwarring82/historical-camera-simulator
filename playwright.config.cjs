const {defineConfig,devices}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'tests/browser',retries:process.env.CI?1:0,timeout:30000,
 use:{baseURL:'http://127.0.0.1:5173',trace:'retain-on-failure'},
 projects:[{name:'chromium',use:{...devices['Desktop Chrome']}},{name:'webkit-mobile',use:{...devices['iPhone 13'],browserName:'webkit'}}],
 webServer:{command:'npm run dev',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI,timeout:20000}
});
