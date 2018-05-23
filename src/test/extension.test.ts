import { testCase } from './test-logic';

suite('New template argument Tests', () => {
    test('01_in.ts', async () => {
        await testCase('01_in.ts', '01_out.ts');
    }).timeout(0);

    test('02_in.ts', async () => {
        await testCase('02_in.ts', '02_out.ts');
    }).timeout(0);

    test('03_in.ts', async () => {
        await testCase('03_in.ts');
    }).timeout(0);

    test('04_in.ts', async () => {
        await testCase('04_in.ts');
    }).timeout(0);

    test('05_in.ts', async () => {
        await testCase('05_in.ts');
    }).timeout(0);

    test('06_in.ts', async () => {
        await testCase('06_in.ts');
    }).timeout(0);

    test('07_in.ts', async () => {
        await testCase('07_in.ts');
    }).timeout(0);

    test('08_in.ts', async () => {
        await testCase('08_in.ts', '08_out.ts');
    }).timeout(0);

    test('09_in.ts', async () => {
        await testCase('09_in.ts');
    }).timeout(0);

    test('10_in.ts', async () => {
        await testCase('10_in.ts', '10_out.ts');
    }).timeout(0);

    test('11_in.ts', async () => {
        await testCase('11_in.ts', '11_out.ts');
    }).timeout(0);

    test('12_in.ts', async () => {
        await testCase('12_in.ts', '12_out.ts');
    }).timeout(0);
});
