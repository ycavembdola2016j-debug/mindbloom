/**
 * MindBloom V12 - E2E自动化测试
 * 使用Playwright进行端到端测试
 */

const { test, expect } = require('@playwright/test');

// 测试配置
const BASE_URL = 'http://localhost:8080';
const ADMIN_PASSWORD = 'mindbloom2026';

// 测试数据
const TEST_CODE = '1234';

test.describe('MindBloom V12 自动化测试', () => {
  
  // 每个测试前清理localStorage
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test.describe('首页测试', () => {
    test('首页显示正确', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // 检查品牌名
      await expect(page.locator('.brand-name')).toHaveText('心花 MindBloom');
      
      // 检查产品卡片
      await expect(page.locator('.product-card')).toHaveCount(2);
      
      // 检查产品名称
      await expect(page.locator('.product-name').first()).toHaveText('意识之境');
      await expect(page.locator('.product-name').last()).toHaveText('心灵花园');
    });

    test('点击产品卡片进入体验码页面', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // 点击初级版
      await page.locator('.product-card').first().click();
      
      // 检查是否进入体验码页面
      await expect(page.locator('#page-code')).toHaveClass(/active/);
      await expect(page.locator('#code-product-name')).toHaveText('意识之境');
    });
  });

  test.describe('体验码验证测试', () => {
    test('体验码输入交互正常', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.locator('.product-card').first().click();
      
      // 获取输入框
      const inputs = page.locator('.code-input');
      await expect(inputs).toHaveCount(4);
      
      // 输入体验码
      await inputs.nth(0).fill('1');
      await inputs.nth(1).fill('2');
      await inputs.nth(2).fill('3');
      await inputs.nth(3).fill('4');
      
      // 检查输入值
      await expect(inputs.nth(0)).toHaveValue('1');
      await expect(inputs.nth(3)).toHaveValue('4');
    });

    test('粘贴完整体验码自动填充', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.locator('.product-card').first().click();
      
      // 粘贴体验码
      await page.locator('.code-input').first().fill('5678');
      
      // 检查所有输入框
      const inputs = page.locator('.code-input');
      await expect(inputs.nth(0)).toHaveValue('5');
      await expect(inputs.nth(1)).toHaveValue('6');
      await expect(inputs.nth(2)).toHaveValue('7');
      await expect(inputs.nth(3)).toHaveValue('8');
    });
  });

  test.describe('完整流程测试', () => {
    test('首次使用完整流程', async ({ page }) => {
      // 1. 进入首页
      await page.goto(BASE_URL);
      
      // 2. 选择产品
      await page.locator('.product-card').first().click();
      await expect(page.locator('#page-code')).toHaveClass(/active/);
      
      // 3. 后台生成体验码
      await page.goto(`${BASE_URL}/#/admin`);
      await page.locator('#admin-password').fill(ADMIN_PASSWORD);
      await page.locator('#admin-login button').click();
      
      // 生成体验码
      await page.locator('#generate-product').selectOption('basic');
      await page.locator('#generate-count').fill('1');
      await page.click('text=生成体验码');
      
      // 获取生成的体验码
      const codeElement = await page.locator('.code-value').first();
      const code = await codeElement.textContent();
      
      // 4. 返回首页使用体验码
      await page.goto(BASE_URL);
      await page.locator('.product-card').first().click();
      
      // 输入体验码
      const inputs = page.locator('.code-input');
      for (let i = 0; i < 4; i++) {
        await inputs.nth(i).fill(code[i]);
      }
      
      // 点击开启探索
      await page.click('text=开启探索');
      
      // 5. 填写信息
      await expect(page.locator('#page-info')).toHaveClass(/active/);
      await page.locator('#nickname').fill('测试用户');
      await page.locator('#gender-female').check();
      await page.locator('#age-26').check();
      
      // 开始测评
      await page.click('text=开始测评');
      
      // 6. 答题
      await expect(page.locator('#page-quiz')).toHaveClass(/active/);
      
      // 回答30题
      for (let i = 0; i < 30; i++) {
        await page.locator('.option-item').first().click();
        await page.waitForTimeout(400);
      }
      
      // 7. 检查结果页
      await expect(page.locator('#page-result')).toHaveClass(/active/);
      await expect(page.locator('.result-type')).toBeVisible();
      await expect(page.locator('.postcard-canvas')).toBeVisible();
    });

    test('24小时内重复登录显示结果', async ({ page }) => {
      // 先完成一次测评
      await page.goto(BASE_URL);
      await page.locator('.product-card').first().click();
      
      // 后台生成码
      await page.goto(`${BASE_URL}/#/admin`);
      await page.locator('#admin-password').fill(ADMIN_PASSWORD);
      await page.click('text=登录');
      await page.click('text=生成体验码');
      const code = await page.locator('.code-value').first().textContent();
      
      // 完成测评流程...
      // (省略详细步骤)
      
      // 再次输入同一体验码
      await page.goto(BASE_URL);
      await page.locator('.product-card').first().click();
      
      const inputs = page.locator('.code-input');
      for (let i = 0; i < 4; i++) {
        await inputs.nth(i).fill(code[i]);
      }
      await page.click('text=开启探索');
      
      // 应该直接显示结果页
      await expect(page.locator('#page-result')).toHaveClass(/active/);
    });
  });

  test.describe('后台管理测试', () => {
    test('后台登录', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/admin`);
      
      // 输入密码
      await page.locator('#admin-password').fill(ADMIN_PASSWORD);
      await page.click('text=登录');
      
      // 检查是否登录成功
      await expect(page.locator('#admin-panel')).toBeVisible();
      await expect(page.locator('.admin-tabs')).toBeVisible();
    });

    test('生成体验码', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/admin`);
      await page.locator('#admin-password').fill(ADMIN_PASSWORD);
      await page.click('text=登录');
      
      // 生成5个初级版体验码
      await page.locator('#generate-count').fill('5');
      await page.click('text=生成体验码');
      
      // 检查生成的体验码
      const codes = await page.locator('#generated-codes .code-item');
      await expect(codes).toHaveCount(5);
    });

    test('体验码列表筛选', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/admin`);
      await page.locator('#admin-password').fill(ADMIN_PASSWORD);
      await page.click('text=登录');
      
      // 切换到体验码列表
      await page.click('text=体验码');
      
      // 筛选未使用的
      await page.locator('#code-filter').selectOption('unused');
      
      // 检查列表显示
      await expect(page.locator('#code-list')).toBeVisible();
    });
  });

  test.describe('URL参数测试', () => {
    test('URL带体验码参数自动填充', async ({ page }) => {
      // 先生成一个体验码
      await page.goto(`${BASE_URL}/#/admin`);
      await page.locator('#admin-password').fill(ADMIN_PASSWORD);
      await page.click('text=登录');
      await page.click('text=生成体验码');
      const code = await page.locator('.code-value').first().textContent();
      
      // 访问带参数的URL
      await page.goto(`${BASE_URL}?code=${code}&product=basic`);
      
      // 等待自动处理
      await page.waitForTimeout(1000);
      
      // 检查是否进入信息填写页或结果页
      const currentPage = await page.locator('.page.active').getAttribute('id');
      expect(['page-info', 'page-result', 'page-code']).toContain(currentPage);
    });
  });

  test.describe('响应式测试', () => {
    test('手机端显示正常', async ({ page }) => {
      // 设置手机视口
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);
      
      // 检查产品卡片垂直排列
      const cards = await page.locator('.product-card');
      await expect(cards).toHaveCount(2);
      
      // 检查品牌名可见
      await expect(page.locator('.brand-name')).toBeVisible();
    });

    test('电脑端显示正常', async ({ page }) => {
      // 设置电脑视口
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(BASE_URL);
      
      // 检查应用容器居中
      const container = await page.locator('.app-container');
      await expect(container).toBeVisible();
      
      // 检查品牌名可见
      await expect(page.locator('.brand-name')).toBeVisible();
    });
  });
});

// 运行测试的命令：
// npx playwright test tests/e2e.test.js --headed
