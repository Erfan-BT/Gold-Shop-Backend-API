// import ZarinPal from 'zarinpal-node-sdk';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ZarinPal = require('zarinpal-node-sdk');

export const zarinpal = new ZarinPal({
    merchantId: 'azxsqcdwerfvbgtnmhyu123456hsvjsh74fj',
    sandbox: true,
});
