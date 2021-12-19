import {JwksKey, JwksSigningKey} from "./JwksKey";
import Axios from "axios";

/// Taken from https://auth0.com/blog/navigating-rs256-and-jwks/
export class JwksClient {

    
    async downloadJwksVerificationKeys(downloadUrl: string): Promise<JwksSigningKey[]> {
        console.log('Downloading keys from:' + downloadUrl)
        const certificate = await Axios.get(downloadUrl);
        if (!certificate)
            throw new Error('Could not download keys from:' + downloadUrl)
        
        console.log('Got Certificate object' + JSON.stringify(certificate.data))
        
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

    private getVerificationKeys(keys: JwksKey[]): JwksSigningKey[] {
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

    getCertificateFor(kid:string, keys: JwksSigningKey[]):string
    {
        console.log(`Looking for [${kid}]\n in [${keys}]`)
        const signingKey = keys.find(key => key.kid === kid);

        if (!signingKey) {
            throw new Error(`Unable to find a signing key that matches '${kid}'`);
        }
        return signingKey.publicKey
    }
    
}