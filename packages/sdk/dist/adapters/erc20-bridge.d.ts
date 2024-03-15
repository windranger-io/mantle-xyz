import { AddressLike } from '../interfaces';
import { StandardBridgeAdapter } from './standard-bridge';
export declare class ERC20BridgeAdapter extends StandardBridgeAdapter {
    supportsTokenPair(l1Token: AddressLike, l2Token: AddressLike): Promise<boolean>;
}
