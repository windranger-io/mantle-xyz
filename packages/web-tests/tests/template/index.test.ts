import { test, expect } from '@playwright/test'

test('homepage test', async ({ page }) => {
  await page.goto('http://localhost:2999')

  await expect(page.getByText('Mantle Template')).toBeVisible()
})
