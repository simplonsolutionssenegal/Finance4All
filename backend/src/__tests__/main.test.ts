jest.mock('express', () => {
  const listen = jest.fn();
  const use = jest.fn();
  const post = jest.fn();
  const get = jest.fn();
  const router = { post, get, use };
  const express = () => ({
    use: use,
    listen: listen,
  });
  express.Router = () => router;
  express.json = () => {};
  express.urlencoded = () => {};
  return express;
});

describe('Main', () => {
  it('should listen on the configured port', () => {
    require('@/main');
    const express = require('express');
    expect(express().listen).toHaveBeenCalled();
  });
});
