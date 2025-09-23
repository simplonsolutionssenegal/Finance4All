jest.mock('express', () => {
  const listen = jest.fn();
  const use = jest.fn();
  const post = jest.fn();
  const get = jest.fn();
  const put = jest.fn();
  const delete_ = jest.fn();
  const patch = jest.fn();
  const all = jest.fn();
  const disable = jest.fn();
  const routeReturn = {
    post,
    get,
    put,
    delete: jest.fn().mockReturnThis(),
    patch: jest.fn().mockReturnThis(),
    all
  };
  const route = jest.fn(() => routeReturn);
  const router = { post, get, put, delete: delete_, patch, all, use, route };
  const express = () => ({
    use: use,
    listen: listen,
    disable: disable,
  });
  express.Router = () => router;
  express.json = () => {};
  express.urlencoded = () => {};
  return express;
});

describe('Main', () => {
  it('should listen on the configured port', () => {
    require('backend/src/main');
    const express = require('express');
    expect(express().listen).toHaveBeenCalled();
  });
});
