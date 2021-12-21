import {JwksKey, JwksSigningKey} from "./JwksKey";
import Axios from "axios";
import {createLogger} from "../utils/logger";

const logger = createLogger('JwksClient')

/// Taken from https://auth0.com/blog/navigating-rs256-and-jwks/
export class JwksClient {

    private static async downloadJwksVerificationKeys(downloadUrl: string): Promise<JwksSigningKey[]> {
        logger.info('Downloading keys from:' + downloadUrl)
        const certificate = await Axios.get(downloadUrl);
        if (!certificate)
            throw new Error('Could not download keys from:' + downloadUrl)
        
        logger.info('Certificate retrieval was successful!')
        
        const result = certificate.data.keys as JwksKey[]
        if (!result || !result.length)
            throw new Error('Jwks endpoint did not contain any keys.')

        return this.getVerificationKeys(result)
    }

    /// Taken From: https://gist.github.com/chatu/7738411c7e8dcf604bc5a0aad7937299
    private static certToPEM(cert: string) {
        cert = cert.match(/.{1,64}/g).join('\n');
        cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
        return cert;
    }

    private static getVerificationKeys(keys: JwksKey[]): JwksSigningKey[] {
        let isVerificationKey = key => 
            key.use == 'sig'
            && key.alg == 'RS256'
            && key.kty == 'RSA'
            && key.kid
            && ((key.x5c && key.x5c.length) || (key.n && key.e));
        
        let toSigningKey = key => {
            return {
                kid: key.kid,
                publicKey: JwksClient.certToPEM(key.x5c[0])
            } as JwksSigningKey
        };
        
        const verificationKeys = keys.filter(isVerificationKey).map(toSigningKey);
        if (!verificationKeys || !verificationKeys.length)
            throw new Error('Jwks endpoint did not contain any verification keys.')

        return verificationKeys
    }

    static async getCertificateFor(kid: string): Promise<string> {
        const jwksKeys: JwksSigningKey[] = await JwksClient.downloadJwksVerificationKeys(process.env.JWKS_URL)
        
        const signingKey = jwksKeys.find(key => key.kid === kid);
        if (!signingKey) {
            throw new Error(`Unable to find a signing key that matches '${kid}'`);
        }
        return signingKey.publicKey
    }
    
}