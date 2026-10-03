import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});

const readAsArrayBuffer = function (blob: Blob | File) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
};

const readAsText = function (blob: Blob | File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
};

if (typeof Blob !== 'undefined') {
  if (!Blob.prototype.arrayBuffer) {
    Blob.prototype.arrayBuffer = function () {
      return readAsArrayBuffer(this);
    };
  }
  if (!Blob.prototype.text) {
    Blob.prototype.text = function () {
      return readAsText(this);
    };
  }
}

if (typeof File !== 'undefined') {
  if (!File.prototype.arrayBuffer) {
    File.prototype.arrayBuffer = function () {
      return readAsArrayBuffer(this);
    };
  }
  if (!File.prototype.text) {
    File.prototype.text = function () {
      return readAsText(this);
    };
  }
}

if (typeof window !== 'undefined') {
  if (window.Blob && !window.Blob.prototype.arrayBuffer) {
    window.Blob.prototype.arrayBuffer = function () {
      return readAsArrayBuffer(this);
    };
  }
  if (window.Blob && !window.Blob.prototype.text) {
    window.Blob.prototype.text = function () {
      return readAsText(this);
    };
  }
  if (window.File && !window.File.prototype.arrayBuffer) {
    window.File.prototype.arrayBuffer = function () {
      return readAsArrayBuffer(this);
    };
  }
  if (window.File && !window.File.prototype.text) {
    window.File.prototype.text = function () {
      return readAsText(this);
    };
  }
}

// Mock window.matchMedia for jsdom
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
