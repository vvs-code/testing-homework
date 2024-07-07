describe('Тестируем стор', function() {
    it('should check repository name', async ({ browser }) => {
        await browser.url('http://localhost:3000/hw/store/api/products/1?bug_id=' + (process.env.BUG_ID || ''));

        await expect(JSON.parse(browser.getText()).id).toEqual(1);
    });
});
