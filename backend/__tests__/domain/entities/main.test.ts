import { describe, it, expect, jest } from '@jest/globals';

jest.mock('express', () => {
  const listen = jest.fn();
  const use = jest.fn();
  const express = () => ({ use, listen });
  // Include delete method so route registration with router.delete doesn't throw
  express.Router = () => ({ get: jest.fn(), post: jest.fn(), delete: jest.fn(), use: jest.fn() });
  express.json = () => {};
  express.urlencoded = () => {};
  return express;
});

describe('main bootstrap', () => {
  it('starts server (listen called)', () => {
    require('@/main');
    const express = require('express');
    expect(express().listen).toHaveBeenCalled();
  });
});
