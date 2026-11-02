import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
afterEach(() => { cleanup(); vi.restoreAllMocks(); window.history.replaceState({}, '', '/'); });
beforeEach(()=>{vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });window.matchMedia = vi.fn().mockReturnValue({ matches: false });});
