import assert from 'node:assert/strict';
import test from 'node:test';
import { deriveBodyShape, calculateBMI } from './body-analysis';

// ── calculateBMI ──

test('calculates BMI correctly for standard input', () => {
  const bmi = calculateBMI(170, 65);
  // BMI = 65 / (1.7 * 1.7) = 22.5 (rounded to 1 decimal)
  assert.ok(bmi >= 22.4 && bmi <= 22.6);
});

test('calculates BMI for edge case: very short height', () => {
  const bmi = calculateBMI(150, 100);
  // BMI = 100 / (1.5 * 1.5) = 44.4
  assert.ok(bmi > 40);
});

test('calculates BMI for edge case: very tall height', () => {
  const bmi = calculateBMI(200, 70);
  // BMI = 70 / (2.0 * 2.0) = 17.5
  assert.ok(bmi < 20);
});

// ── deriveBodyShape ──

test('returns rectangle as default shape without measurements', () => {
  assert.equal(deriveBodyShape(170, 65), 'rectangle');
});

test('returns apple when BMI >= 28 and no waist/hip', () => {
  assert.equal(deriveBodyShape(160, 75 /* BMI ≈ 29.3 */), 'apple');
});

test('returns rectangle when BMI >= 24 but < 28 and no waist/hip', () => {
  assert.equal(deriveBodyShape(160, 65 /* BMI ≈ 25.4 */), 'rectangle');
});

test('identifies pear shape from WHR <= 0.75', () => {
  // waist=65, hip=95 → WHR ≈ 0.684
  assert.equal(deriveBodyShape(165, 58, null, 65, 95), 'pear');
});

test('identifies apple shape from WHR >= 0.85', () => {
  // waist=90, hip=100 → WHR = 0.9
  assert.equal(deriveBodyShape(170, 70, null, 90, 100), 'apple');
});

test('identifies hourglass shape from WHR 0.7-0.8 and similar bust/hip', () => {
  // waist=70, hip=92, bust=90 → WHR ≈ 0.76, BHP ≈ 0.978
  assert.equal(deriveBodyShape(168, 60, 90, 70, 92), 'hourglass');
});

test('identifies inverted triangle from BHP >= 1.05', () => {
  // bust=105, hip=95 → BHP = 1.105
  assert.equal(deriveBodyShape(170, 65, 105, 75, 95), 'inverted_triangle');
});

test('defaults to rectangle when no specific shape matches', () => {
  // waist=80, hip=100 → WHR = 0.8 (not quite pear at 0.75 or apple at 0.85)
  assert.equal(deriveBodyShape(170, 65, null, 80, 100), 'rectangle');
});
