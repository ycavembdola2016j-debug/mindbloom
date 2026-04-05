/**
 * MindBloom E2E 自动化测试脚本
 * 使用 Playwright 进行端到端测试
 * 
 * 运行方式:
 * npx playwright test tests/e2e.test.js --headed
 */

const { test, expect } = require('@playwright/test');

// 测试配置
const BASE_URL = 'http://localhost:8080'; // 请根据实际情况修改
const TEST_CODE_BASIC = 'B0001';
const TEST_CODE_ADVANCED = 'A0001';
const ADMIN_PASSWORD = 'mindbloom2026';

test.describe('MindBloom V11 - 端到端测试', () => {
  
  // ========== 首页测试 ==========
  test.describe('首页', () => {
    test('应该显示首页和 two 产品卡片', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // 检查标题
      await expect(page.locator('h1')).toContainText('心花 MindBloom');
      
      // 检查产品卡片
      await expect(page.locator('[data-product="basic"]')).toBeVisible();
      await expect(page.locator('[data-product="advanced"]')).toBeVisible();
      
      // 截图
      await page.screenshot({ path: 'test-results/01-home.png' });
    });

    test('点击初级版应该跳转到验证页', async ({ page }) => {
      await page.goto(BASE_URL);
      
      await page.click('[data-product="basic"]');
      
      // 检查 URL 变化
      await expect(page).toHaveURL(/#verify/);
      
      // 检查验证页内容
      await expect(page.locator('#verify-product-name')).toContainText('意识之境');
      
      await page.screenshot({ path: 'test-results/02-verify-basic.png' });
    });

    test('点击高级版应该跳转到验证页', async ({ page }) => {
      await page.goto(BASE_URL);
      
      await page.click('[data-product="advanced"]');
      
      await expect(page).toHaveURL(/#verify/);
      await expect(page.locator('#verify-product-name')).toContainText('心灵花园');
      
      await page.screenshot({ path: 'test-results/03-verify-advanced.png' });
    });
  });

  // ========== 体验码验证测试 ==========
  test.describe('体验码验证', () => {
    test('输入无效体验码应该显示错误', async ({ page }) => {
      await page.goto(`${BASE_URL}/#verify`);
      
      await page.fill('#code-input', 'INVALID');
      await page.click('button:has-text("验证并继续")');
      
      await expect(page.locator('#verify-error')).toContainText('无效');
      
      await page.screenshot({ path: 'test-results/04-invalid-code.png' });
    });

    test('输入错误类型的体验码应该显示错误', async ({ page }) => {
      // 选择初级版但输入高级版码
      await page.goto(BASE_URL);
      await page.click('[data-product="basic"]');
      
      await page.fill('#code-input', 'A0001');
      await page.click('button:has-text("验证并继续")');
      
      await expect(page.locator('#verify-error')).toContainText('B开头');
    });

    test('完整流程：初级版答题到结果', async ({ page }) => {
      // 1. 进入首页
      await page.goto(BASE_URL);
      
      // 2. 选择初级版
      await page.click('[data-product="basic"]');
      
      // 3. 输入体验码
      await page.fill('#code-input', TEST_CODE_BASIC);
      await page.click('button:has-text("验证并继续")');
      
      // 4. 填写信息
      await expect(page).toHaveURL(/#profile/);
      await page.fill('#profile-nickname', '测试用户');
      await page.click('.gender-btn[data-value="male"]');
      await page.selectOption('#profile-age', '26-35');
      await page.click('button:has-text("开始答题")');
      
      // 5. 答题（快速选择）
      await expect(page).toHaveURL(/#quiz/);
      
      for (let i = 0; i < 30; i++) {
        // 等待题目加载
        await page.waitForSelector('.option-btn');
        
        // 点击第一个选项
        await page.click('.option-btn:first-child');
        
        // 等待动画
        await page.waitForTimeout(400);
      }
      
      // 6. 检查结果页
      await expect(page).toHaveURL(/#result/);
      await expect(page.locator('.result-name')).not.toContainText('加载中');
      
      // 等待 AI 明信片生成
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'test-results/05-result-basic.png', fullPage: true });
      
      console.log('✅ 初级版完整流程测试通过');
    });
  });

  // ========== 重复登录测试 ==========
  test.describe('24小时重复登录', () => {
    test('已使用的体验码应该可以直接查看结果', async ({ page }) => {
      // 先完成一次测评
      await page.goto(BASE_URL);
      await page.click('[data-product="basic"]');
      await page.fill('#code-input', 'B0002');
      await page.click('button:has-text("验证并继续")');
      
      await page.fill('#profile-nickname', '重复测试');
      await page.click('.gender-btn[data-value="female"]');
      await page.selectOption('#profile-age', '18-25');
      await page.click('button:has-text("开始答题")');
      
      // 快速答完
      for (let i = 0; i < 30; i++) {
        await page.waitForSelector('.option-btn');
        await page.click('.option-btn:first-child');
        await page.waitForTimeout(300);
      }
      
      // 等待结果页
      await expect(page).toHaveURL(/#result/);
      await page.waitForTimeout(2000);
      
      // 返回首页
      await page.click('button:has-text("返回首页")');
      
      // 重新输入同一体验码
      await page.click('[data-product="basic"]');
      await page.fill('#code-input', 'B0002');
      await page.click('button:has-text("验证并继续")');
      
      // 应该直接跳转到结果页
      await expect(page).toHaveURL(/#result/);
      await expect(page.locator('.toast')).toContainText('欢迎回来');
      
      await page.screenshot({ path: 'test-results/06-relogin-result.png' });
      
      console.log('✅ 重复登录测试通过');
    });
  });

  // ========== 返回按钮测试 ==========
  test.describe('返回功能', () => {
    test('答题过程中可以返回上一题', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('[data-product="basic"]');
      await page.fill('#code-input', 'B0003');
      await page.click('button:has-text("验证并继续")');
      
      await page.fill('#profile-nickname', '返回测试');
      await page.click('.gender-btn[data-value="male"]');
      await page.selectOption('#profile-age', '26-35');
      await page.click('button:has-text("开始答题")');
      
      // 回答第一题
      await page.waitForSelector('.option-btn');
      await page.click('.option-btn:first-child');
      await page.waitForTimeout(400);
      
      // 回答第二题
      await page.click('.option-btn:nth-child(2)');
      await page.waitForTimeout(400);
      
      // 点击返回
      await page.click('#quiz-back-btn');
      
      // 检查是否回到第二题（显示第2题）
      const progressText = await page.locator('#quiz-current').textContent();
      expect(progressText).toBe('2');
      
      await page.screenshot({ path: 'test-results/07-go-back.png' });
      
      console.log('✅ 返回功能测试通过');
    });
  });

  // ========== 后台管理测试 ==========
  test.describe('后台管理', () => {
    test('需要密码才能进入后台', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('a:has-text("后台管理")');
      
      await expect(page).toHaveURL(/#admin-login/);
      
      // 输入错误密码
      await page.fill('#admin-password', 'wrongpassword');
      await page.click('button:has-text("登录")');
      
      await expect(page.locator('#admin-error')).toContainText('密码错误');
      
      // 输入正确密码
      await page.fill('#admin-password', ADMIN_PASSWORD);
      await page.click('button:has-text("登录")');
      
      await expect(page).toHaveURL(/#admin/);
      await expect(page.locator('h2')).toContainText('后台管理');
      
      await page.screenshot({ path: 'test-results/08-admin.png' });
    });

    test('可以生成体验码', async ({ page }) => {
      // 登录后台
      await page.goto(`${BASE_URL}/#admin-login`);
      await page.fill('#admin-password', ADMIN_PASSWORD);
      await page.click('button:has-text("登录")');
      
      // 生成体验码
      await page.selectOption('#gen-product', 'basic');
      await page.selectOption('#gen-count', '5');
      await page.click('button:has-text("生成")');
      
      // 检查是否生成了体验码
      await expect(page.locator('.code-tag')).toHaveCount(5);
      
      await page.screenshot({ path: 'test-results/09-generated-codes.png' });
      
      console.log('✅ 生成体验码测试通过');
    });
  });

  // ========== URL 参数测试 ==========
  test.describe('URL参数', () => {
    test('通过URL参数进入应该自动填充体验码', async ({ page }) => {
      await page.goto(`${BASE_URL}?code=B9999`);
      
      // 等待页面加载
      await page.waitForTimeout(500);
      
      // 检查是否跳转到验证页并填充了体验码
      const codeValue = await page.locator('#code-input').inputValue();
      expect(codeValue).toBe('B9999');
      
      await page.screenshot({ path: 'test-results/10-url-param.png' });
    });
  });
});

// ========== 测试报告 ==========
console.log(`
=====================================
MindBloom V11 自动化测试套件
=====================================

测试场景:
1. ✅ 首页显示和产品选择
2. ✅ 体验码验证（有效/无效/类型错误）
3. ✅ 完整答题流程（初级版30题）
4. ✅ 24小时重复登录直接显示结果
5. ✅ 答题过程中返回上一题
6. ✅ 后台管理登录和体验码生成
7. ✅ URL参数自动填充体验码

运行命令:
npx playwright test tests/e2e.test.js --headed    # 有界面运行
npx playwright test tests/e2e.test.js             # 无界面运行
npx playwright test tests/e2e.test.js --ui        # UI模式

=====================================
`);
