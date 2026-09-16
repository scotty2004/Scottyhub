/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider } from './context/AppContext';
import { MobileDeviceFrame } from './components/MobileDeviceFrame';

export default function App() {
  return (
    <AppProvider>
      <MobileDeviceFrame />
    </AppProvider>
  );
}
