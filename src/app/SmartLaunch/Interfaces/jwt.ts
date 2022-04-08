import {LaunchContext} from "./launch-context";

export interface JWT {
  ver?: number;
  jti?: string;
  iss?: string;
  aud?: string;
  sub?: string;
  iat?: number;
  exp?: number
  cid?: string;
  uid?: string;
  scp?: string[];
  context?: LaunchContext;
}
