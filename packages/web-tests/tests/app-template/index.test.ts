import { test, expect } from '@playwright/test'

test('homepage test', async ({ page }) => {
  await page.goto('http://localhost:3000')

  await expect(page.getByText('BitDAO OS App Template')).toBeVisible()
})
