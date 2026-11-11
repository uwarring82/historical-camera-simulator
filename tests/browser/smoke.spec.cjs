const { test, expect } = require('@playwright/test');
test('four cameras selectable, default Apollo exposes demo',async({page})=>{
 await page.goto('/');
 await expect(page.locator('.camera-option')).toHaveCount(4);
 await expect(page.locator('#active-camera-name')).toHaveText('Apollo 17 Hasselblad');
 await page.locator('#shutter').click();
 await expect(page.locator('#photo-canvas')).toBeVisible();
 await expect(page.locator('#export')).toBeEnabled();
});
test('SX-70 cannot expose until unfolded and loaded',async({page})=>{
 await page.goto('/');
 await page.locator('[data-camera="sx70"]').click();
 await expect(page.locator('#shutter')).toBeDisabled();
 await page.getByRole('button',{name:'Unfold camera'}).click();
 await page.getByRole('button',{name:'Insert 10-frame pack'}).click();
 await expect(page.locator('#shutter')).toBeEnabled();
 await page.locator('#shutter').click();
 await expect(page.locator('#mechanical-status')).toContainText('DEVELOPING');
});
